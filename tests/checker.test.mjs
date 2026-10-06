import test from "node:test";
import assert from "node:assert/strict";
import robotsParser from "robots-parser";
import {
  normalizeWebsite,
  isPublicAddress,
  resolvePublic,
  safeFetch,
  AuditError,
} from "../lib/safe-fetch.mjs";
import { analysePage, parseRobots, runAudit } from "../lib/audit.mjs";
import { createHandler as securedHandler, consumeLimit } from "../api/check.js";
const createHandler = (audit) =>
  securedHandler(audit, {
    requireUser: async () => ({ id: "test-user" }),
    status: async () => ({ state: "available" }),
    claim: async () => ({ state: "claimed" }),
    complete: async () => {},
    fail: async () => {},
  });

const finalUrl = "https://example.com/";
function robots(text = "User-agent: *\nAllow: /") {
  return {
    parser: robotsParser("https://example.com/robots.txt", text),
    present: true,
    url: "https://example.com/robots.txt",
    status: 200,
    text,
  };
}
function page(html, status = 200, headers = {}) {
  return {
    url: finalUrl,
    status,
    body: html,
    headers: { "content-type": "text/html", ...headers },
    trace: [{ url: finalUrl, status }],
  };
}
const validHtml =
  '<html><head><title>Example service</title><meta name="description" content="A real service."><link rel="canonical" href="https://example.com/"><script type="application/ld+json">{"@type":"Organization","name":"Example"}</script></head><body><main><h1>Example service</h1><p>' +
  "Factual service description. ".repeat(40) +
  "</p></main></body></html>";

test("homepage normalization strips potentially private paths and query values", () => {
  assert.equal(
    normalizeWebsite("example.com/private?token=secret#x").href,
    finalUrl,
  );
  assert.equal(
    normalizeWebsite("https://www.example.com").href,
    "https://www.example.com/",
  );
});
test("unsafe schemes, credentials, ports, hosts and IP representations are rejected", () => {
  for (const input of [
    "http://example.com",
    "file:///etc/passwd",
    "https://user:secret@example.com",
    "https://example.com:8443",
    "https://localhost",
    "https://a.local",
    "https://127.0.0.1",
    "https://2130706433",
    "https://0x7f000001",
    "https://[::1]",
    "https://example.com.",
    " ",
  ])
    assert.throws(() => normalizeWebsite(input), AuditError, input);
});
test("public address classification rejects private and special IPv4/IPv6", () => {
  for (const address of [
    "127.0.0.1",
    "10.0.0.1",
    "172.16.0.1",
    "192.168.1.1",
    "169.254.169.254",
    "100.64.0.1",
    "0.0.0.0",
    "192.0.2.1",
    "::1",
    "fc00::1",
    "fe80::1",
    "2001:db8::1",
    "::ffff:127.0.0.1",
    "::ffff:10.0.0.1",
  ])
    assert.equal(isPublicAddress(address), false, address);
  assert.equal(isPublicAddress("8.8.8.8"), true);
  assert.equal(isPublicAddress("2606:4700:4700::1111"), true);
});
test("mixed public/private DNS answers are rejected before any connection", async () => {
  await assert.rejects(
    resolvePublic("example.com", async () => [
      { address: "8.8.8.8", family: 4 },
      { address: "127.0.0.1", family: 4 },
    ]),
    { code: "UNSAFE_ADDRESS" },
  );
});
test("safe fetch pins approved DNS and follows limited same-site redirects", async () => {
  const calls = [];
  const result = await safeFetch(finalUrl, {
    hosts: new Set(["example.com", "www.example.com"]),
    resolver: async () => [{ address: "8.8.8.8", family: 4 }],
    request: async (url, address) => {
      calls.push([url.href, address.address]);
      return calls.length === 1
        ? {
            status: 308,
            headers: { location: "https://www.example.com/" },
            body: "",
          }
        : page(validHtml);
    },
  });
  assert.equal(result.url, "https://www.example.com/");
  assert.equal(calls.length, 2);
  assert(calls.every((call) => call[1] === "8.8.8.8"));
});
test("redirects cannot escape to metadata, private DNS, other domains, or HTTP", async () => {
  for (const location of [
    "https://127.0.0.1/",
    "http://example.com/",
    "https://other.example/",
  ]) {
    let count = 0;
    await assert.rejects(
      safeFetch(finalUrl, {
        hosts: new Set(["example.com"]),
        resolver: async () => [{ address: "8.8.8.8", family: 4 }],
        request: async () => {
          count++;
          return { status: 302, headers: { location }, body: "" };
        },
      }),
      AuditError,
    );
    assert.equal(count, 1);
  }
});
test("redirect DNS is revalidated and DNS rebinding cannot use a new private answer", async () => {
  let resolved = 0,
    connected = 0;
  await assert.rejects(
    safeFetch(finalUrl, {
      resolver: async () => [
        { address: ++resolved === 1 ? "8.8.8.8" : "127.0.0.1", family: 4 },
      ],
      request: async () => {
        connected++;
        return { status: 302, headers: { location: "/next" }, body: "" };
      },
    }),
    { code: "UNSAFE_ADDRESS" },
  );
  assert.equal(connected, 1);
});
test("redirect loops and aborts return explicit failures", async () => {
  await assert.rejects(
    safeFetch(finalUrl, {
      resolver: async () => [{ address: "8.8.8.8", family: 4 }],
      request: async () => ({
        status: 308,
        headers: { location: "/" },
        body: "",
      }),
    }),
    { code: "REDIRECT_LOOP" },
  );
  await assert.rejects(safeFetch(finalUrl, { signal: AbortSignal.abort() }), {
    code: "TIMEOUT",
  });
});
test("valid fundamentals produce evidence, not a visibility score", () => {
  const report = analysePage(
    page(validHtml),
    robots(),
    new URL(finalUrl),
    new Date("2026-10-06T12:00:00Z"),
  );
  assert.equal(report.findings.length, 11);
  assert.equal(report.summary.observed, 11);
  assert.equal(report.summary.review, 0);
  assert.equal(report.checkedAt, "2026-10-06T12:00:00.000Z");
  assert.equal(report.score, undefined);
  assert(report.limitations.some((x) => x.includes("No ChatGPT")));
});
test("training opt-out never worsens search-readiness results", () => {
  const report = analysePage(
    page(validHtml),
    robots("User-agent: GPTBot\nDisallow: /\n\nUser-agent: *\nAllow: /"),
    new URL(finalUrl),
  );
  assert.equal(report.training.allowedByRobots, false);
  assert.equal(report.summary.observed, 11);
});
test("explicit search blocking, noindex and nosnippet require review", () => {
  const report = analysePage(
    page(
      validHtml.replace(
        "</head>",
        '<meta name="googlebot" content="noindex,nosnippet"></head>',
      ),
    ),
    robots("User-agent: OAI-SearchBot\nDisallow: /\n\nUser-agent: *\nAllow: /"),
    new URL(finalUrl),
  );
  for (const id of ["robots-oai-searchbot", "indexing", "snippets"])
    assert.equal(report.findings.find((x) => x.id === id).status, "review");
});
test("robots matching handles wildcards, allow precedence and specific agents", () => {
  const parser = robots(
    "User-agent: *\nDisallow: /\nAllow: /public*\n\nUser-agent: OAI-SearchBot\nAllow: /",
  );
  assert.equal(
    parser.parser.isAllowed("https://example.com/public", "Googlebot"),
    true,
  );
  assert.equal(parser.parser.isAllowed(finalUrl, "Googlebot"), false);
  assert.equal(parser.parser.isAllowed(finalUrl, "OAI-SearchBot"), true);
});
test("missing schema is informational; malformed JSON-LD is review", () => {
  const empty = analysePage(
    page("<html><body><h1>Hi</h1></body></html>"),
    robots(),
    new URL(finalUrl),
  );
  assert.equal(
    empty.findings.find((x) => x.id === "structured").status,
    "note",
  );
  const broken = analysePage(
    page(
      validHtml.replace(
        '{"@type":"Organization","name":"Example"}',
        "{invalid}",
      ),
    ),
    robots(),
    new URL(finalUrl),
  );
  assert.equal(
    broken.findings.find((x) => x.id === "structured").status,
    "review",
  );
});
test("HTTP errors, challenges and non-HTML never become zero scores", () => {
  assert.throws(() => analysePage(page("", 403), robots(), new URL(finalUrl)), {
    code: "PAGE_UNAVAILABLE",
  });
  assert.throws(
    () =>
      analysePage(
        page("<title>Just a moment</title><body>Verify you are human</body>"),
        robots(),
        new URL(finalUrl),
      ),
    { code: "BOT_CHALLENGE" },
  );
  assert.throws(
    () =>
      analysePage(
        page("{}", 200, { "content-type": "application/json" }),
        robots(),
        new URL(finalUrl),
      ),
    { code: "NOT_HTML" },
  );
});
test("robots 404 permits ordinary policy check; 403/5xx/HTML are unverified", () => {
  assert.equal(
    parseRobots({
      url: "https://example.com/robots.txt",
      status: 404,
      headers: {},
      body: "",
    }).present,
    false,
  );
  for (const status of [403, 429, 500])
    assert.throws(
      () => parseRobots({ url: finalUrl, status, headers: {}, body: "" }),
      { code: "ROBOTS_UNVERIFIED" },
    );
  assert.throws(
    () =>
      parseRobots({
        url: finalUrl,
        status: 200,
        headers: { "content-type": "text/html" },
        body: "<html/>",
      }),
    { code: "ROBOTS_UNVERIFIED" },
  );
});
test("checker respects its own robots exclusion before fetching homepage", async () => {
  await assert.rejects(
    runAudit(finalUrl, async (input, options) => {
      if (input.pathname === "/robots.txt")
        return {
          url: input.href,
          status: 200,
          headers: { "content-type": "text/plain" },
          body: "User-agent: ContextLumenAudit\nDisallow: /",
        };
      options.beforeRequest(input);
      throw new Error("Must not connect.");
    }),
    { code: "CRAWL_DECLINED" },
  );
});
function req(value = { url: finalUrl }, headers = {}, method = "POST") {
  return new Request("https://www.contextlumen.com/api/check", {
    method,
    headers: {
      origin: "https://www.contextlumen.com",
      "content-type": "application/json",
      "x-vercel-forwarded-for": "test-" + Math.random(),
      ...headers,
    },
    body: method === "POST" ? JSON.stringify(value) : undefined,
  });
}
test("API rejects methods, foreign origins, wrong types, malformed and oversized bodies", async () => {
  const handler = createHandler(() => {
    throw new Error("Must not crawl");
  });
  assert.equal((await handler(req({}, {}, "DELETE"))).status, 405);
  assert.equal(
    (await handler(req({}, { origin: "https://attacker.example" }))).status,
    403,
  );
  assert.equal(
    (await handler(req({}, { "content-type": "text/plain" }))).status,
    415,
  );
  assert.equal(
    (await handler(req({ url: finalUrl, token: "secret" }))).status,
    400,
  );
  assert.equal((await handler(req({ url: "x".repeat(3000) }))).status, 413);
});
test("API error responses are safe and successful reports are cached with original dates", async () => {
  const error = await createHandler(async () => {
    throw new AuditError("DNS_FAILED", "Couldn't resolve it.");
  })(req({ url: "does-not-exist.example" }));
  assert.equal(error.status, 422);
  assert.equal((await error.json()).code, "DNS_FAILED");
  let calls = 0;
  const handler = createHandler(async () => {
    calls++;
    return {
      version: "test",
      checkedAt: "fixed",
      findings: [],
      requestedUrl: "https://cache.example/",
      finalUrl: "https://cache.example/",
    };
  });
  const first = await handler(req({ url: "cache.example" }));
  const second = await handler(req({ url: "cache.example" }));
  assert.equal((await first.json()).cached, false);
  assert.equal((await second.json()).cached, true);
  assert.equal(calls, 1);
});
test("per-instance rate limiter rejects the sixth check in a window", () => {
  const key = "limit-test-" + Math.random();
  for (let i = 0; i < 5; i++) assert.equal(consumeLimit(key), true);
  assert.equal(consumeLimit(key), false);
});
