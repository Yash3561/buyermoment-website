import { readFile, writeFile } from "node:fs/promises";
import { render, site } from "../.prerender/entry-server.js";

const template = await readFile("dist/index.html", "utf8");
if (!template.includes('<div id="root"></div>'))
  throw new Error("Missing prerender root.");
await writeFile(
  "dist/index.html",
  template
    .replace("</head>", () => {
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
        ],
      };
      return (
        '<script type="application/ld+json">' +
        JSON.stringify(graph).replaceAll("<", "\\u003c") +
        "</script></head>"
      );
    })
    .replace('<div id="root"></div>', () => `<div id="root">${render()}</div>`),
);
console.log(
  "Prerendered homepage: content is readable before JavaScript loads.",
);
