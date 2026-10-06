import { createHash, randomUUID } from "node:crypto";
import { runAudit } from "../lib/audit.mjs";
import { AuditError, normalizeWebsite } from "../lib/safe-fetch.mjs";
import { AccountError, createAuditAccounts } from "../lib/audit-accounts.mjs";
import { isReadinessReport } from "../src/lib/audit-flow.mjs";

// Best-effort per-instance throttling, not a distributed quota.
const buckets = new Map();
const cache = new Map();
let active = 0;
let windowStart = Date.now(),
  instanceRequests = 0;
const json = (value, status = 200, extra = {}) =>
  new Response(JSON.stringify(value), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...extra,
    },
  });
export function consumeLimit(key, now = Date.now()) {
  for (const [k, item] of buckets)
    if (now - item.start > 600000) buckets.delete(k);
  if (now - windowStart > 600000) {
    windowStart = now;
    instanceRequests = 0;
  }
  const item = buckets.get(key) || { start: now, count: 0 };
  if (
    item.count >= 5 ||
    instanceRequests >= 60 ||
    active >= 3 ||
    buckets.size >= 2000
  )
    return false;
  item.count++;
  instanceRequests++;
  buckets.set(key, item);
  return true;
}
export function createHandler(
  audit = runAudit,
  accounts = createAuditAccounts(),
) {
  return async (request) => {
    if (!["POST", "GET"].includes(request.method))
      return json({ error: "Use the website form to request a check." }, 405, {
        Allow: "GET, POST",
      });
    if (process.env.CHECKER_DISABLED === "1")
      return json(
        {
          error:
            "The checker is temporarily paused. Please contact the team for an assessment.",
        },
        503,
      );
    const origin = request.headers.get("origin");
    const allowed = [
      "https://www.contextlumen.com",
      "https://contextlumen.com",
      "https://motivory.vercel.app",
    ];
    if (process.env.VERCEL !== "1")
      allowed.push(
        "http://127.0.0.1:4173",
        "http://127.0.0.1:4183",
        "http://localhost:4173",
      );
    if (
      request.method === "POST"
        ? !origin || !allowed.includes(origin)
        : origin && !allowed.includes(origin)
    )
      return json(
        { error: "Please use the checker on ContextLumen's website." },
        403,
      );
    if (request.method === "GET") {
      try {
        const user = await accounts.requireUser(request);
        return json(await accounts.status(user));
      } catch (error) {
        return json(
          {
            error:
              error instanceof AccountError
                ? error.message
                : "Your audit account is temporarily unavailable.",
            code:
              error instanceof AccountError
                ? error.code
                : "ACCOUNT_UNAVAILABLE",
          },
          error instanceof AccountError ? error.status : 503,
        );
      }
    }
    if (
      !/^application\/json(?:;|$)/i.test(
        request.headers.get("content-type") || "",
      )
    )
      return json({ error: "Send a JSON website request." }, 415);
    const address =
      request.headers.get("x-vercel-forwarded-for") || "unidentified";
    const key = createHash("sha256").update(address).digest("hex");
    if (!consumeLimit(key))
      return json(
        {
          error:
            "The checker is busy or you've made several checks. Please try again in ten minutes.",
        },
        429,
        { "Retry-After": "600" },
      );
    let body;
    try {
      const reader = request.body?.getReader();
      if (!reader) throw new Error();
      let size = 0;
      const chunks = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > 2048) {
          await reader.cancel();
          return json({ error: "The request is too large." }, 413);
        }
        chunks.push(Buffer.from(value));
      }
      body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      if (
        !body ||
        typeof body.url !== "string" ||
        Object.keys(body).some((k) => k !== "url")
      )
        throw new Error();
    } catch {
      return json({ error: "Enter one valid public website address." }, 400);
    }
    let user,
      jobId,
      claimed = false;
    active++;
    try {
      // Transient cache prevents repeated crawls; never persists visitor leads.
      for (const [k, item] of cache)
        if (Date.now() - item.created > 600000) cache.delete(k);
      const normalized = normalizeWebsite(body.url).href;
      user = await accounts.requireUser(request);
      jobId = randomUUID();
      const credit = await accounts.claim(user, jobId);
      if (credit.state === "running")
        return json(
          {
            error:
              "An audit is already in progress for your account. Wait a moment, then reload this page.",
            code: "AUDIT_IN_PROGRESS",
          },
          409,
        );
      if (credit.state === "completed") {
        if (
          credit.report.requestedUrl !== normalized &&
          credit.report.finalUrl !== normalized
        )
          return json(
            {
              error:
                "Your account has already used its free audit. Your saved report is still available.",
              code: "FREE_AUDIT_USED",
            },
            409,
          );
        return json({ ...credit.report, saved: true });
      }
      if (credit.state !== "claimed")
        throw new AccountError(
          "ACCOUNT_STORE_UNAVAILABLE",
          "Your audit allowance could not be verified.",
        );
      claimed = true;
      const hit = cache.get(normalized);
      const report = hit
        ? { ...hit.report, cached: true }
        : { ...(await audit(normalized)), cached: false };
      if (!isReadinessReport(report) || report.requestedUrl !== normalized)
        throw new AccountError(
          "AUDIT_REPORT_INVALID",
          "The report could not be verified. No successful audit has been recorded. Please try again or contact the team.",
        );
      await accounts.complete(user, jobId, report);
      claimed = false;
      if (cache.size < 100)
        cache.set(normalized, { created: Date.now(), report });
      return json(report);
    } catch (error) {
      if (claimed && user && jobId) {
        try {
          await accounts.fail(user, jobId);
        } catch {
          /* Lease expiry permits a safe retry after store recovery. */
        }
      }
      if (error instanceof AuditError)
        return json({ error: error.message, code: error.code }, error.status);
      if (error instanceof AccountError)
        return json({ error: error.message, code: error.code }, error.status);
      return json(
        {
          error:
            "We couldn't complete a reliable check. No visibility score has been assigned. Please try again or contact the team.",
        },
        503,
      );
    } finally {
      active--;
    }
  };
}
export default { fetch: createHandler() };
