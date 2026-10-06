import assert from "node:assert/strict";
import { site } from "../.prerender/entry-server.js";

// GET-only checks: no records, account settings, or DNS are modified.
const allowedHosts = new Set([
  "contextlumen.com",
  "www.contextlumen.com",
  "motivory.vercel.app",
]);
async function getWithTrace(input) {
  let url = new URL(input);
  const seen = new Set();
  const trace = [];
  for (let hop = 0; hop <= 5; hop++) {
    assert(
      url.protocol === "https:" && allowedHosts.has(url.hostname),
      "Unexpected redirect destination: " + url,
    );
    assert(
      !seen.has(url.href),
      "Redirect loop: " + trace.join(" -> ") + " -> " + url,
    );
    seen.add(url.href);
    const response = await fetch(url, {
      redirect: "manual",
      signal: AbortSignal.timeout(15000),
    });
    trace.push(response.status + " " + url.href);
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const next = response.headers.get("location");
      assert(next, "Redirect has no destination.");
      await response.body?.cancel();
      url = new URL(next, url);
      continue;
    }
    assert.equal(response.status, 200, trace.join(" -> "));
    return { response, url, trace };
  }
  throw new Error("Too many redirects: " + trace.join(" -> "));
}

for (const host of [
  "contextlumen.com",
  "www.contextlumen.com",
  "motivory.vercel.app",
]) {
  const page = await getWithTrace("https://" + host + "/");
  const html = await page.response.text();
  assert(
    html.includes(site.name) && html.includes("<h1"),
    "Missing rendered page.",
  );
  assert(
    html.includes('<link rel="canonical" href="' + site.url + '/"'),
    "Canonical mismatch on " + host,
  );
  assert(html.includes("mailto:" + site.email), "Contact mismatch on " + host);
  if (host !== "motivory.vercel.app") assert.equal(page.url.origin, site.url);
  const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map(
    (m) => m[1],
  );
  assert(
    assets.some((path) => path.endsWith(".css")) &&
      assets.some((path) => path.endsWith(".js")),
    "Missing CSS or JS references.",
  );
  for (const path of new Set([
    ...assets,
    "/favicon.svg",
    "/logo.svg",
    "/social-card.png",
    "/robots.txt",
    "/sitemap.xml",
  ])) {
    const result = await getWithTrace(new URL(path, page.url));
    const type = result.response.headers.get("content-type") || "";
    if (path.endsWith(".css"))
      assert(type.includes("text/css"), "CSS returned " + type);
    if (path.endsWith(".js"))
      assert(/javascript/.test(type), "JavaScript returned " + type);
    if (path.endsWith(".svg"))
      assert(type.includes("image/svg+xml"), "SVG returned " + type);
    if (path.endsWith(".png"))
      assert(type.includes("image/png"), "PNG returned " + type);
    const body = new Uint8Array(await result.response.arrayBuffer());
    assert(body.byteLength > 0, "Empty asset: " + path);
    if (path === "/robots.txt")
      assert(
        new TextDecoder().decode(body).includes(site.url + "/sitemap.xml"),
      );
    if (path === "/sitemap.xml")
      assert(
        new TextDecoder().decode(body).includes("<loc>" + site.url + "/</loc>"),
      );
  }
  console.log(
    "PASS " +
      page.trace.join(" -> ") +
      ": branding, canonical, contact, CSS, JS, and public assets.",
  );
}
