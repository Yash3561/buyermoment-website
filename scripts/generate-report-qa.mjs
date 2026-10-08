import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createReportPdf } from "../src/lib/report-pdf.mjs";
if (!process.argv[2])
  throw new Error(
    "Usage: node scripts/generate-report-qa.mjs saved-report.json [logo.png]",
  );
const report = JSON.parse(await readFile(process.argv[2], "utf8"));
const root = new URL("../", import.meta.url);
const assets = {
  regularFontBase64: (
    await readFile(new URL("public/report-fonts/Inter-Regular.ttf", root))
  ).toString("base64"),
  boldFontBase64: (
    await readFile(new URL("public/report-fonts/Inter-Bold.ttf", root))
  ).toString("base64"),
  logoPng:
    "data:image/png;base64," +
    (
      await readFile(process.argv[3] || new URL(".qa/report/logo.png", root))
    ).toString("base64"),
};
const { doc, filename } = createReportPdf(report, assets);
await mkdir(new URL("output/pdf/", root), { recursive: true });
await writeFile(
  new URL("output/pdf/" + filename, root),
  new Uint8Array(doc.output("arraybuffer")),
);
console.log(
  JSON.stringify({
    filename,
    pages: doc.getNumberOfPages(),
    bytes: doc.output("arraybuffer").byteLength,
  }),
);
