import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { site } from "../.prerender/entry-server.js";

const html = await readFile("dist/index.html", "utf8");
assert(html.includes("<h1"), "Homepage must be prerendered.");
assert(html.includes(site.name), "Brand must appear in the rendered page.");
assert(
  html.includes('<link rel="canonical" href="' + site.url + '/"'),
  "Canonical URL must be present.",
);
assert(
  !/Motivory|BuyerMoment|chatgpt\.site/.test(html),
  "Obsolete public brand or host remains.",
);
assert(
  html.includes("mailto:" + site.email),
  "Working email destination must be present.",
);
assert(!/\$\s*\d/.test(html), "Public prices are not part of this website.");
const match = html.match(
  /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
);
assert(match, "Structured data is missing.");
const graph = JSON.parse(match[1])["@graph"];
assert(
  graph.some(
    (item) =>
      item["@type"] === "Organization" &&
      item.name === site.name &&
      item.email === site.email,
  ),
);
assert(
  graph.some(
    (item) => item["@type"] === "WebSite" && item.url === site.url + "/",
  ),
);
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
assert.equal(ids.length, new Set(ids).size, "HTML IDs must be unique.");
for (const [, fragment] of html.matchAll(/href="#([^"]+)"/g)) {
  assert(ids.includes(fragment), "Broken internal link: #" + fragment);
}
const robots = await readFile("dist/robots.txt", "utf8");
const sitemap = await readFile("dist/sitemap.xml", "utf8");
const hosting = JSON.parse(await readFile("vercel.json", "utf8"));
assert(
  !hosting.redirects?.length,
  "Domain redirects are owned by Vercel domain settings; duplicating them can cause loops.",
);
for (const [, asset] of html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)) {
  assert(
    (await stat("dist" + asset)).size > 0,
    "Missing built asset: " + asset,
  );
}
assert(html.includes('content="' + site.url + '/social-card.png"'));
assert(robots.includes(site.url + "/sitemap.xml"));
assert(sitemap.includes("<loc>" + site.url + "/</loc>"));
for (const file of [
  "favicon.svg",
  "logo.svg",
  "social-card.png",
  "google-sign-in.svg",
]) {
  assert((await stat("dist/" + file)).size > 0, file + " must exist.");
}
assert.equal(
  await readFile("dist/favicon.svg", "utf8"),
  await readFile("dist/logo.svg", "utf8"),
  "Favicon and logo must use the identical brand mark.",
);
assert.equal((html.match(/<h1\b/g) || []).length, 1, "Use one main heading.");
assert(
  (html.match(/src="\/logo.svg"/g) || []).length >= 4,
  "Brand instances must share one logo asset.",
);
assert(!html.includes("ygc2@njit.edu"), "Obsolete contact address remains.");
assert(html.includes('href="/audit"'), "The free audit route must be linked.");
assert(
  html.includes('id="services"') && html.includes('id="process"'),
  "Core service and process sections must be present.",
);
const png = await readFile("dist/social-card.png");
assert.equal(png.readUInt32BE(16), 1200);
assert.equal(png.readUInt32BE(20), 630);
console.log(
  "PASS: prerendered page, brand, domain, structured data, contact, internal links, sitemap, and 1200x630 social card.",
);
for (const path of [
  "/",
  "/audit",
  "/book",
  "/sample-report",
  "/methodology",
  "/privacy",
  "/terms",
]) {
  const output = await readFile(
    path === "/" ? "dist/index.html" : "dist" + path + "/index.html",
    "utf8",
  );
  assert.equal(
    (output.match(/<h1\b/g) || []).length,
    1,
    path + " must have exactly one h1.",
  );
  assert(
    output.includes('href="' + site.url + path + '"'),
    "Route canonical missing: " + path,
  );
  assert(
    output.includes('content="' + site.url + path + '"'),
    "Route social URL missing: " + path,
  );
  assert(!output.includes("—"), "Em dash in public page: " + path);
  assert(!/\$\s*\d/.test(output), "Public price on " + path);
  assert(
    !/Motivory|BuyerMoment|ygc2@njit.edu/.test(output),
    "Old branding on " + path,
  );
  assert(output.includes("mailto:" + site.email), "Email missing on " + path);
  const routeIds = [...output.matchAll(/\bid="([^"]+)"/g)].map((x) => x[1]);
  assert.equal(
    routeIds.length,
    new Set(routeIds).size,
    "Duplicate IDs on " + path,
  );
  for (const [, fragment] of output.matchAll(/href="#([^"]+)"/g))
    assert(routeIds.includes(fragment), "Broken fragment on " + path);
  for (const [, asset] of output.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g))
    assert((await stat("dist" + asset)).size > 0, "Missing asset on " + path);
  assert(
    sitemap.includes("<loc>" + site.url + path + "</loc>"),
    "Sitemap route missing: " + path,
  );
}
const auditPage = await readFile("dist/audit/index.html", "utf8");
const bookPage = await readFile("dist/book/index.html", "utf8");
const samplePage = await readFile("dist/sample-report/index.html", "utf8");
assert(
  samplePage.includes("Know what the audit checks"),
  "Audit scope page must explain the checks.",
);
assert(
  samplePage.includes("No live ChatGPT, Gemini, or Perplexity ranking is claimed"),
  "Audit scope page must state what it does not measure.",
);
assert(auditPage.includes('id="audit-heading"'));
assert(auditPage.includes("verified account"));
assert(
  !bookPage.includes("<iframe"),
  "Calendly must not load before visitor consent.",
);
if (site.bookingUrl)
  assert(
    bookPage.includes('href="' + site.bookingUrl + '"'),
    "Real calendar destination missing.",
  );
assert(bookPage.includes("A useful first"));
console.log(
  "PASS: all seven routes, per-page metadata, audit scope, privacy-preserving calendar, and no public prices or em dashes.",
);
