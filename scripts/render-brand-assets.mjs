import { readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { join } from "node:path";

// Local asset generation uses the bundled image library, not a production dependency.
const require = createRequire(
  join(
    process.env.USERPROFILE,
    ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/package.json",
  ),
);
const sharp = require("sharp");
const logo = await readFile("public/logo.svg");
const encoded = "data:image/svg+xml;base64," + logo.toString("base64");
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<rect width="1200" height="630" fill="#f7f5ef"/>
<rect x="878" width="322" height="630" fill="#183b32"/>
<image href="${encoded}" x="65" y="55" width="46" height="46"/>
<text x="126" y="89" font-family="Arial,sans-serif" font-size="29" font-weight="600" fill="#183b32">ContextLumen</text>
<text x="65" y="190" font-family="Arial,sans-serif" font-size="15" letter-spacing="2.5" fill="#53645d">AI SEARCH VISIBILITY · CONTENT · STRATEGY</text>
<text x="61" y="302" font-family="Arial,sans-serif" font-size="80" font-weight="600" letter-spacing="-3" fill="#183b32">Your business.</text>
<text x="61" y="398" font-family="Arial,sans-serif" font-size="80" font-weight="600" letter-spacing="-3" fill="#183b32">A better answer.</text>
<path d="M65 477h744" stroke="#d9ded6"/>
<text x="65" y="531" font-family="Arial,sans-serif" font-size="21" fill="#53645d">Research. Approved improvements. A clear record.</text>
<text x="65" y="575" font-family="Arial,sans-serif" font-size="17" fill="#53645d">contextlumen.com</text>
<image href="${encoded}" x="924" y="224" width="232" height="232"/>
</svg>`;
await writeFile("public/social-card.svg", svg);
await sharp(Buffer.from(svg)).png().toFile("public/social-card.png");
console.log(
  "Generated 1200x630 share assets using the exact public/logo.svg mark.",
);
