import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHandler } from "../api/check.js";
import { createAuditAccounts, AccountError } from "../lib/audit-accounts.mjs";
const userId = "12ab34cd-56ef-7890-ab12-cd34ef567890";
function request(url = "quota.example", token = "one", method = "POST") {
  return new Request("https://www.contextlumen.com/api/check", {
    method,
    headers: {
      origin: "https://www.contextlumen.com",
      authorization: "Bearer " + token,
      "content-type": "application/json",
      "x-vercel-forwarded-for": "quota-" + Math.random(),
    },
    ...(method === "POST" ? { body: JSON.stringify({ url }) } : {}),
  });
}
function ledger() {
  const rows = new Map();
  return {
    async requireUser(req) {
      const id = req.headers.get("authorization").slice(7);
      if (id === "bad")
        throw new AccountError("SIGN_IN_REQUIRED", "Sign in.", 401);
      return { id };
    },
    async status(user) {
      const row = rows.get(user.id);
      return row
        ? {
            state: row.status === "failed" ? "available" : row.status,
            ...(row.report ? { report: row.report } : {}),
          }
        : { state: "available" };
    },
    async claim(user, job) {
      const row = rows.get(user.id);
      if (row?.status === "completed")
        return { state: "completed", report: row.report };
      if (row?.status === "running") return { state: "running" };
      rows.set(user.id, { status: "running", job });
      return { state: "claimed" };
    },
    async complete(user, job, report) {
      assert.equal(rows.get(user.id).job, job);
      rows.set(user.id, { status: "completed", report });
    },
    async fail(user, job) {
      if (rows.get(user.id)?.job === job)
        rows.set(user.id, { status: "failed" });
    },
  };
}
const report = (url) => ({
  version: "test",
  requestedUrl: url,
  finalUrl: url,
  checkedAt: "2026-10-06T12:00:00Z",
  scope: "Test fixture only",
  cached: false,
  evidence: {
    robotsUrl: new URL("/robots.txt", url).href,
    robotsStatus: 200,
    redirects: [{ url, status: 200 }],
  },
  findings: [
    {
      id: "fixture",
      title: "Fixture",
      status: "note",
      evidence: "Test only",
      meaning: "Test only",
      action: "Test only",
      priority: 4,
      source:
        "https://developers.google.com/search/docs/appearance/ai-features",
    },
  ],
  summary: { total: 1, observed: 0, review: 0, notes: 1 },
  training: { agent: "GPTBot", allowedByRobots: false, note: "Test only" },
  limitations: ["Test fixture. Not collected evidence."],
});
test("one account cannot run a second free audit, and can retrieve its saved report", async () => {
  let calls = 0;
  const handler = createHandler(async (url) => {
    calls++;
    return report(url);
  }, ledger());
  assert.equal((await handler(request())).status, 200);
  const blocked = await handler(request("another.example"));
  assert.equal(blocked.status, 409);
  assert.equal((await blocked.json()).code, "FREE_AUDIT_USED");
  const saved = await handler(request("", "one", "GET"));
  assert.equal(saved.status, 200);
  assert.equal((await saved.json()).state, "completed");
  assert.equal((await (await handler(request())).json()).saved, true);
  assert.equal(calls, 1);
});
test("concurrent requests for the same account invoke only one audit", async () => {
  let release, started;
  const gate = new Promise((r) => {
    release = r;
  });
  const firstStarted = new Promise((r) => {
    started = r;
  });
  let calls = 0;
  const handler = createHandler(async (url) => {
    calls++;
    started();
    await gate;
    return report(url);
  }, ledger());
  const first = handler(request("concurrency.example"));
  await firstStarted;
  const second = await handler(request("concurrency.example"));
  assert.equal(second.status, 409);
  assert.equal((await second.json()).code, "AUDIT_IN_PROGRESS");
  release();
  assert.equal((await first).status, 200);
  assert.equal(calls, 1);
});
test("technical failures release the allowance for a retry", async () => {
  let calls = 0;
  const handler = createHandler(async (url) => {
    if (++calls === 1) throw Error("private failure");
    return report(url);
  }, ledger());
  const failed = await handler(request("retry.example"));
  assert.equal(failed.status, 503);
  assert(!(await failed.text()).includes("private failure"));
  assert.equal((await handler(request("retry.example"))).status, 200);
  assert.equal(calls, 2);
});
test("incomplete and wrong-website reports cannot be saved or consume the allowance", async () => {
  for (const invalid of [
    () => ({ findings: [] }),
    () => report("https://wrong-website.example/"),
  ]) {
    let calls = 0;
    const handler = createHandler(
      async (url) => (++calls === 1 ? invalid() : report(url)),
      ledger(),
    );
    const failed = await handler(
      request("contract-retry-" + Math.random() + ".example"),
    );
    assert.equal(failed.status, 503);
    assert.equal((await failed.json()).code, "AUDIT_REPORT_INVALID");
    assert.equal(
      (await (await handler(request("", "one", "GET"))).json()).state,
      "available",
    );
    assert.equal(
      (await handler(request("verified-retry-" + Math.random() + ".example")))
        .status,
      200,
    );
    assert.equal(calls, 2);
  }
});
test("separate verified accounts have separate allowances", async () => {
  const handler = createHandler(async (url) => report(url), ledger());
  assert.equal((await handler(request("account-a.example", "a"))).status, 200);
  assert.equal((await handler(request("account-b.example", "b"))).status, 200);
  assert.equal((await handler(request("account-c.example", "a"))).status, 409);
});
test("no auth configuration fails closed before crawling", async () => {
  let calls = 0;
  const handler = createHandler(async (url) => {
    calls++;
    return report(url);
  }, createAuditAccounts({}));
  for (const method of ["GET", "POST"]) {
    const response = await handler(
      request("unconfigured.example", "one", method),
    );
    assert.equal(response.status, 503);
    assert.equal((await response.json()).code, "AUDIT_NOT_READY");
  }
  assert.equal(calls, 0);
});
test("invalid sessions cannot crawl, read or claim an audit", async () => {
  let calls = 0;
  const handler = createHandler(async (url) => {
    calls++;
    return report(url);
  }, ledger());
  for (const method of ["GET", "POST"])
    assert.equal(
      (await handler(request("invalid-session.example", "bad", method))).status,
      401,
    );
  assert.equal(calls, 0);
});
const env = {
  AUDIT_ACCOUNTS_ENABLED: "true",
  SUPABASE_URL: "https://project.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: "server-secret",
};
const authRequest = (token) =>
  new Request("https://www.contextlumen.com/api/check", {
    headers: token ? { authorization: "Bearer " + token } : {},
  });
test("server validates a user remotely, not by trusting a decoded browser token", async () => {
  let calls = 0;
  const account = createAuditAccounts(env, async (url, options) => {
    calls++;
    assert.equal(url, env.SUPABASE_URL + "/auth/v1/user");
    assert.equal(options.headers.Authorization, "Bearer " + "x".repeat(30));
    assert.equal(options.headers.apikey, "server-secret");
    return Response.json({
      id: userId,
      email: "user@example.com",
      email_confirmed_at: "2026-10-06",
      is_anonymous: false,
    });
  });
  assert.deepEqual(await account.requireUser(authRequest("x".repeat(30))), {
    id: userId,
  });
  assert.equal(calls, 1);
  await assert.rejects(account.requireUser(authRequest()), { status: 401 });
  assert.equal(calls, 1);
});
test("unverified or anonymous users and rejected tokens fail closed", async () => {
  for (const user of [
    { id: userId, email: "user@example.com" },
    {
      id: userId,
      email: "user@example.com",
      email_confirmed_at: "today",
      is_anonymous: true,
    },
  ]) {
    const account = createAuditAccounts(env, async () => Response.json(user));
    await assert.rejects(account.requireUser(authRequest("x".repeat(30))), {
      status: 403,
    });
  }
  const account = createAuditAccounts(
    env,
    async () => new Response("provider internal text", { status: 401 }),
  );
  await assert.rejects(account.requireUser(authRequest("x".repeat(30))), {
    code: "SIGN_IN_REQUIRED",
    status: 401,
  });
});
test("private account store receives server-approved user and job IDs only", async () => {
  const calls = [];
  const account = createAuditAccounts(env, async (url, options) => {
    calls.push({ url, ...options });
    return Response.json(
      url.endsWith("claim_free_audit") ? { state: "claimed" } : true,
    );
  });
  await account.claim({ id: userId }, "job");
  await account.complete(
    { id: userId },
    "job",
    report("https://store.example/"),
  );
  assert.equal(calls[0].headers.Authorization, "Bearer server-secret");
  assert.deepEqual(JSON.parse(calls[0].body), {
    p_user_id: userId,
    p_job_id: "job",
  });
  assert.equal(
    JSON.parse(calls[1].body).p_report.finalUrl,
    "https://store.example/",
  );
});
test("modern server key takes precedence and never becomes a Bearer token for the ledger", async () => {
  const calls = [];
  const secret = "sb_secret_test_fixture_only";
  const account = createAuditAccounts(
    { ...env, SUPABASE_SECRET_KEY: secret },
    async (url, options) => {
      calls.push({ url, ...options });
      if (url.includes("/free_audits?")) return Response.json([]);
      if (url.endsWith("claim_free_audit"))
        return Response.json({ state: "claimed" });
      return Response.json(true);
    },
  );
  assert.deepEqual(await account.status({ id: userId }), {
    state: "available",
  });
  await account.claim({ id: userId }, "job");
  await account.complete(
    { id: userId },
    "job",
    report("https://store.example/"),
  );
  await account.fail({ id: userId }, "job");
  assert.equal(calls.length, 4);
  for (const call of calls) {
    assert.equal(call.headers.apikey, secret);
    assert.equal(new Headers(call.headers).has("authorization"), false);
  }
});
test("modern server key verifies the visitor JWT without replacing visitor authorization", async () => {
  const secret = "sb_secret_test_fixture_only";
  const token = "x".repeat(30);
  const account = createAuditAccounts(
    {
      ...env,
      SUPABASE_SECRET_KEY: secret,
      SUPABASE_SERVICE_ROLE_KEY: undefined,
    },
    async (url, options) => {
      assert.equal(url, env.SUPABASE_URL + "/auth/v1/user");
      assert.equal(options.headers.apikey, secret);
      assert.equal(options.headers.Authorization, "Bearer " + token);
      return Response.json({
        id: userId,
        email: "user@example.com",
        email_confirmed_at: "2026-10-07",
        is_anonymous: false,
      });
    },
  );
  assert.deepEqual(await account.requireUser(authRequest(token)), {
    id: userId,
  });
});
test("configured modern server key cannot bypass a disabled launch flag", async () => {
  let calls = 0;
  const account = createAuditAccounts(
    {
      ...env,
      AUDIT_ACCOUNTS_ENABLED: "false",
      SUPABASE_SECRET_KEY: "sb_secret_test_fixture_only",
    },
    async () => {
      calls++;
      throw Error("must not connect");
    },
  );
  await assert.rejects(account.requireUser(authRequest("x".repeat(30))), {
    code: "AUDIT_NOT_READY",
  });
  await assert.rejects(account.status({ id: userId }), {
    code: "AUDIT_NOT_READY",
  });
  assert.equal(calls, 0);
});
test("database migration uses a per-user key and transaction lock, and denies browser mutation", async () => {
  const sql = await readFile(
    new URL(
      "../supabase/migrations/202610060001_free_audits.sql",
      import.meta.url,
    ),
    "utf8",
  );
  assert.match(sql, /user_id uuid primary key/);
  assert.match(sql, /pg_advisory_xact_lock/);
  assert.match(sql, /enable row level security/);
  assert.match(
    sql,
    /revoke all on public\.free_audits from public, anon, authenticated/,
  );
  assert.match(sql, /revoke all on function public\.claim_free_audit/);
  assert.match(
    sql,
    /where user_id = p_user_id and job_id = p_job_id and status = 'running'/,
  );
});
