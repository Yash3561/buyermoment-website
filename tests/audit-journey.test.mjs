import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeWebsite,
  cleanOtp,
  consumeScanIntent,
} from "../src/lib/audit-journey.mjs";
import { summarizeAudit } from "../src/lib/audit-summary.mjs";
import { requestAudit } from "../src/lib/audit-request.mjs";
import sample from "../src/data/sample-report.json" with { type: "json" };
test("website handoff uses the HTTPS homepage and rejects unsafe inputs", () => {
  assert.equal(
    normalizeWebsite(" Example.COM/a?private=1#top "),
    "https://example.com/",
  );
  assert.equal(
    normalizeWebsite("http://www.example.com/path"),
    "https://www.example.com/",
  );
  for (const value of [
    "",
    "localhost",
    "https://127.0.0.1",
    "https://[::1]",
    "https://site.local",
    "https://user:password@example.com",
    "https://example.com:8080",
    "javascript:alert(1)",
    "ftp://example.com",
  ])
    assert.throws(() => normalizeWebsite(value));
});
test("OTP stays a string, retains leading zeroes and accepts full-code paste", () => {
  assert.equal(cleanOtp("0012 3456"), "00123456");
  assert.equal(cleanOtp("a01-23b"), "0123");
  assert.equal(cleanOtp("123456789"), "12345678");
});
test("scan intent is consumed once, bound to its user and never bypasses ledger state", () => {
  const intent = { accountId: "user-a", website: "https://example.com/" };
  assert.equal(consumeScanIntent(intent, "running", "user-a"), null);
  assert.equal(consumeScanIntent(intent, "completed", "user-a"), null);
  assert.equal(consumeScanIntent(intent, "available", "user-b"), null);
  assert.equal(
    consumeScanIntent(intent, "available", "user-a"),
    "https://example.com/",
  );
  assert.equal(consumeScanIntent(intent, "available", "user-a"), null);
  assert.equal(consumeScanIntent(null, "available", "user-a"), null);
});
test("category summaries retain all findings and only review items become priorities", () => {
  const summary = summarizeAudit(sample);
  assert.equal(
    summary.areas.reduce((n, a) => n + a.total, 0),
    sample.summary.total,
  );
  assert(summary.priorities.length <= 3);
  assert(summary.priorities.every((f) => f.status === "review"));
  assert.equal(summary.visibility, "Not measured");
  assert.throws(() => summarizeAudit({}));
});
test("audit requests distinguish saved status from scan and never retry POST", async () => {
  const calls = [];
  const fetchImpl = async (...args) => {
    calls.push(args);
    return new Response(JSON.stringify({ state: "available" }), {
      headers: { "content-type": "application/json" },
    });
  };
  await requestAudit({ accessToken: "test", fetchImpl });
  await requestAudit({
    accessToken: "test",
    website: "https://example.com/",
    fetchImpl,
  });
  assert.equal(calls[0][1].method, "GET");
  assert.equal(calls[1][1].method, "POST");
  let attempts = 0;
  await assert.rejects(
    requestAudit({
      accessToken: "test",
      website: "https://example.com/",
      fetchImpl: async () => {
        attempts++;
        throw new TypeError("network failure");
      },
    }),
  );
  assert.equal(attempts, 1);
});
