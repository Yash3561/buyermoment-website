import test from "node:test";
import assert from "node:assert/strict";
import { auditLaunchPreflight } from "../scripts/audit-launch-preflight.mjs";

function deployment({
  enabled = true,
  status = 401,
  code = "SIGN_IN_REQUIRED",
} = {}) {
  const calls = [];
  const fetcher = async (url, options) => {
    calls.push({ url, options });
    if (url.endsWith("/api/check")) return Response.json({ code }, { status });
    return new Response(
      "<h1>ContextLumen</h1>" +
        (url.endsWith("/audit")
          ? enabled
            ? "Preparing secure sign-in…"
            : "Your audit is being prepared."
          : ""),
      { headers: { "content-type": "text/html" } },
    );
  };
  return { calls, fetcher };
}

test("launch preflight uses only read-only GETs and recognizes authenticated API", async () => {
  const { calls, fetcher } = deployment();
  const checks = await auditLaunchPreflight(undefined, fetcher);
  assert(checks.every((check) => check.pass));
  assert.equal(calls.length, 5);
  assert(calls.every(({ options }) => !options.method && !options.body));
  assert(calls.every(({ url }) => !url.includes("/auth/v1/otp")));
});

test("disabled frontend and unconfigured API cannot pass launch preflight", async () => {
  const { fetcher } = deployment({
    enabled: false,
    status: 503,
    code: "AUDIT_NOT_READY",
  });
  const checks = await auditLaunchPreflight(undefined, fetcher);
  assert.equal(checks.filter((check) => !check.pass).length, 2);
});

test("launch preflight rejects third-party origins, credentials and paths before fetching", async () => {
  const { calls, fetcher } = deployment();
  for (const base of [
    "https://other.example",
    "http://www.contextlumen.com",
    "https://user:pass@www.contextlumen.com",
    "https://www.contextlumen.com/audit",
  ])
    await assert.rejects(auditLaunchPreflight(base, fetcher));
  assert.equal(calls.length, 0);
});
