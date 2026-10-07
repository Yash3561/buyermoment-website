import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  authReturnState,
  googleSignInOptions,
  isReadinessReport,
} from "../src/lib/audit-flow.mjs";
import { analysePage, parseRobots } from "../lib/audit.mjs";
import sample from "../src/data/sample-report.json" with { type: "json" };

test("Google sign-in uses a fixed same-origin callback and identity-only defaults", () => {
  assert.deepEqual(googleSignInOptions("https://www.contextlumen.com"), {
    provider: "google",
    options: { redirectTo: "https://www.contextlumen.com/audit" },
  });
  assert.equal(
    googleSignInOptions("http://127.0.0.1:4173").options.redirectTo,
    "http://127.0.0.1:4173/audit",
  );
  assert.equal(
    googleSignInOptions(
      "https://www.contextlumen.com/?next=https://other.example",
    ).options.redirectTo,
    "https://www.contextlumen.com/audit",
  );
  assert.throws(() => googleSignInOptions("http://public.example"));
  assert.throws(() => googleSignInOptions("javascript:alert(1)"));
  assert.throws(() =>
    googleSignInOptions("https://user:password@site.example"),
  );
});

test("auth error and code cleanup does not expose provider error text or retain credentials", () => {
  const error = authReturnState(
    "https://www.contextlumen.com/audit?error=access_denied&error_description=untrusted&keep=1#details",
  );
  assert.deepEqual(error, {
    failed: true,
    hasCode: false,
    cleanPath: "/audit?keep=1#details",
  });
  assert.deepEqual(
    authReturnState("https://www.contextlumen.com/audit?code=one-time-code"),
    { failed: false, hasCode: true, cleanPath: "/audit" },
  );
  assert.equal(
    authReturnState(
      "https://www.contextlumen.com/audit#error=access_denied&error_description=untrusted",
    ).failed,
    true,
  );
  assert.equal(
    authReturnState(
      "https://www.contextlumen.com/audit#access_token=secret&refresh_token=private",
    ).cleanPath,
    "/audit",
  );
  assert.equal(
    authReturnState("https://www.contextlumen.com/audit#help").cleanPath,
    "/audit#help",
  );
});

test("sample report satisfies the real display contract and is labelled fictional", () => {
  assert.equal(isReadinessReport(sample), true);
  assert(sample.scope.includes("Demonstration data"));
  assert(
    sample.limitations.some((item) => item.includes("DEMONSTRATION DATA ONLY")),
  );
  assert.equal(new URL(sample.finalUrl).hostname, "sample.example");
});

test("real analyser output satisfies the same report contract", () => {
  const url = "https://contract.example/";
  const robots = parseRobots({
    url: url + "robots.txt",
    status: 404,
    body: "",
    headers: {},
  });
  const report = analysePage(
    {
      url,
      status: 200,
      body: "<html><head><title>Contract</title></head><body><main><h1>Service</h1></main></body></html>",
      headers: { "content-type": "text/html" },
      trace: [{ url, status: 200 }],
    },
    robots,
    new URL(url),
  );
  assert.equal(isReadinessReport({ ...report, cached: false }), true);
});

test("incomplete, mismatched or unsafe reports are rejected before rendering", () => {
  for (const report of [
    null,
    {},
    { findings: [] },
    { ...sample, checkedAt: "not a date" },
    { ...sample, checkedAt: 2026 },
    { ...sample, finalUrl: "javascript:alert(1)" },
    { ...sample, evidence: null },
    { ...sample, training: null },
    { ...sample, summary: { ...sample.summary, total: 99 } },
    {
      ...sample,
      findings: [{ ...sample.findings[0], source: "javascript:alert(1)" }],
    },
    { ...sample, findings: [{ ...sample.findings[0], status: "guaranteed" }] },
    { ...sample, findings: [sample.findings[0], sample.findings[0]] },
    {
      ...sample,
      findings: [],
      summary: { total: 0, observed: 0, review: 0, notes: 0 },
    },
  ])
    assert.equal(isReadinessReport(report), false);
});

test("auth client remains lazy, single-instance and PKCE-based with a separate Google launch gate", async () => {
  const auth = await readFile(
    new URL("../src/auth.ts", import.meta.url),
    "utf8",
  );
  assert.match(auth, /clientPromise/);
  assert.match(auth, /flowType: "pkce"/);
  assert.match(auth, /detectSessionInUrl: true/);
  assert.match(auth, /window\.sessionStorage/);
  assert.match(auth, /VITE_SUPABASE_PUBLISHABLE_KEY/);
  const env = await readFile(
    new URL("../.env.example", import.meta.url),
    "utf8",
  );
  assert.match(env, /VITE_GOOGLE_AUTH_ENABLED=false/);
  assert.match(env, /VITE_AUDIT_ENABLED=false/);
});

test("private verification keeps the public launch gates and is excluded from discovery", async () => {
  const [app, page, prerender, config, sitemap, auth] = await Promise.all(
    [
      "../src/App.tsx",
      "../src/pages/AuditPage.tsx",
      "../scripts/prerender.mjs",
      "../vercel.json",
      "../public/sitemap.xml",
      "../src/auth.ts",
    ].map((path) => readFile(new URL(path, import.meta.url), "utf8")),
  );
  assert.match(app, /page === "\/audit\/verify"/);
  assert.match(app, /<AuditPage privateTest \/>/);
  assert.match(app, /VITE_AUDIT_ENABLED === "true"/);
  assert.doesNotMatch(app, /href="\/audit\/verify"/);
  assert.match(page, /canUseGoogle = googleAuthEnabled && !privateTest/);
  assert.match(
    auth,
    /VITE_AUDIT_ENABLED === "true" && privateAuditAuthConfigured/,
  );
  assert.match(prerender, /path: "\/audit\/verify"[\s\S]*?noindex: true/);
  assert.match(prerender, /name="robots" content="noindex,nofollow"/);
  assert(
    JSON.parse(config).headers.some(
      (rule) =>
        rule.source === "/audit/verify/:path*" &&
        rule.headers.some((header) => header.key === "X-Robots-Tag"),
    ),
  );
  assert.doesNotMatch(sitemap, /audit\/verify/);
  assert.equal(
    authReturnState("https://www.contextlumen.com/audit/verify?code=fixture")
      .cleanPath,
    "/audit/verify",
  );
});
