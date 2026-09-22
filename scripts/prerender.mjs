import { readFile, writeFile } from "node:fs/promises";
import { render } from "../.prerender/entry-server.js";

const template = await readFile("dist/index.html", "utf8");
if (!template.includes('<div id="root"></div>'))
  throw new Error("Missing prerender root.");
await writeFile(
  "dist/index.html",
  template.replace(
    '<div id="root"></div>',
    () => `<div id="root">${render()}</div>`,
  ),
);
console.log(
  "Prerendered homepage: content is readable before JavaScript loads.",
);
