import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { site } from "../.prerender/entry-server.js";

const html = await readFile("dist/index.html", "utf8");
assert(html.includes("<h1"), "Homepage must be prerendered.");
assert(html.includes(site.name), "Brand must appear in the rendered page.");
assert(
  html.includes('href="' + site.url + '/"'),
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
assert(robots.includes(site.url + "/sitemap.xml"));
assert(sitemap.includes("<loc>" + site.url + "/</loc>"));
for (const file of ["favicon.svg", "logo.svg", "social-card.png"]) {
  assert((await stat("dist/" + file)).size > 0, file + " must exist.");
}
const png = await readFile("dist/social-card.png");
assert.equal(png.readUInt32BE(16), 1200);
assert.equal(png.readUInt32BE(20), 630);
console.log(
  "PASS: prerendered page, brand, domain, structured data, contact, internal links, sitemap, and 1200x630 social card.",
);
