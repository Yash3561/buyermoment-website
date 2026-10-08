import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
// The bundled image runtime is used only to export our existing SVG mark.
const require = createRequire(import.meta.url);
const sharp = require(process.env.CONTEXTLUMEN_SHARP_PATH || "sharp");
const mark = await readFile("public/logo.svg");
await sharp(mark).resize(192, 192).png().toFile("public/logo-email.png");
const social = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#101f1b"/><circle cx="1050" cy="280" r="250" fill="none" stroke="#35483d"/><circle cx="1050" cy="280" r="190" fill="none" stroke="#35483d" stroke-dasharray="3 12"/><path d="M780 500 Q900 100 1200 290" fill="none" stroke="#edc38b" stroke-width="2"/><image href="data:image/svg+xml;base64,${mark.toString("base64")}" x="72" y="65" width="60" height="60"/><text x="150" y="106" fill="#f3f3e9" font-family="Arial,sans-serif" font-size="33">ContextLumen</text><text fill="#f3f3e9" font-family="Arial,sans-serif" font-size="68" letter-spacing="-2"><tspan x="72" y="265">Help the right buyers</tspan><tspan x="72" y="350" fill="#edc38b">find you in AI search.</tspan></text><text x="76" y="505" fill="#b0c1b5" font-family="Arial,sans-serif" font-size="25">Research. Website improvements. A clear record.</text><text x="76" y="565" fill="#b0c1b5" font-family="Arial,sans-serif" font-size="20">contextlumen.com</text></svg>`;
await sharp(Buffer.from(social)).png().toFile("public/social-card.png");
console.log(
  "Exported the existing brand mark for email and the social preview.",
);
