import { readFile, writeFile, mkdir } from "node:fs/promises";
import { render, site } from "../.prerender/entry-server.js";
const template = await readFile("dist/index.html", "utf8");
if (!template.includes('<div id="root"></div>'))
  throw new Error("Missing prerender root.");
const pages = [
  {
    path: "/",
    file: "dist/index.html",
    title: "ContextLumen | AI search visibility & website improvements",
    description:
      "AI search visibility, content, and implementation for businesses. ContextLumen tests buyer questions, improves approved pages, and documents what changes.",
  },
  {
    path: "/audit",
    file: "dist/audit/index.html",
    title: "Free AEO & GEO readiness audit | ContextLumen",
    description:
      "Inspect your public homepage and crawl rules with evidence-based findings. One free audit per verified account. Not an AI visibility score.",
  },
  {
    path: "/book",
    file: "dist/book/index.html",
    title: "Book a conversation | ContextLumen",
    description:
      "Talk with ContextLumen about AI search visibility, your website, and a focused first project. Scope and fees are discussed before work begins.",
  },
];
function escape(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;");
}
for (const page of pages) {
  const url = site.url + page.path;
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": site.url + "/#organization",
        name: site.name,
        url: site.url,
        logo: site.url + "/logo.svg",
        email: site.email,
        description:
          "AI search visibility, website messaging, and campaign planning services.",
      },
      {
        "@type": "WebSite",
        "@id": site.url + "/#website",
        url: site.url + "/",
        name: site.name,
        publisher: { "@id": site.url + "/#organization" },
        inLanguage: "en",
      },
      {
        "@type": "WebPage",
        "@id": url + "#page",
        url,
        name: page.title,
        description: page.description,
        isPartOf: { "@id": site.url + "/#website" },
        inLanguage: "en",
      },
    ],
  };
  const html = template
    .replace(
      /<title>[\s\S]*?<\/title>/,
      "<title>" + escape(page.title) + "</title>",
    )
    .replace(
      /(<meta\s+(?:name="description"|property="og:description"|name="twitter:description")\s+content=")[^"]*(")/g,
      (_, a, b) => a + escape(page.description) + b,
    )
    .replace(
      /(<meta\s+(?:property="og:title"|name="twitter:title")\s+content=")[^"]*(")/g,
      (_, a, b) => a + escape(page.title) + b,
    )
    .replace(/(<link rel="canonical" href=")[^"]*(")/, (_, a, b) => a + url + b)
    .replace(
      /(<meta property="og:url" content=")[^"]*(")/,
      (_, a, b) => a + url + b,
    )
    .replace(
      "</head>",
      '<script type="application/ld+json">' +
        JSON.stringify(graph).replaceAll("<", "\\u003c") +
        "</script></head>",
    )
    .replace(
      '<div id="root"></div>',
      () => '<div id="root">' + render(page.path) + "</div>",
    );
  await mkdir(page.file.slice(0, page.file.lastIndexOf("/")), {
    recursive: true,
  });
  await writeFile(page.file, html);
}
console.log("Prerendered homepage, audit, and booking pages.");
