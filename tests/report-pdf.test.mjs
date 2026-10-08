import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createReportPdf } from "../src/lib/report-pdf.mjs";
import sample from "../src/data/sample-report.json" with { type: "json" };

const options = {
  regularFontBase64: readFileSync(
    new URL("../public/report-fonts/Inter-Regular.ttf", import.meta.url),
  ).toString("base64"),
  boldFontBase64: readFileSync(
    new URL("../public/report-fonts/Inter-Bold.ttf", import.meta.url),
  ).toString("base64"),
  logoPng: {
    data: new Uint8ClampedArray([255, 255, 255, 255]),
    width: 1,
    height: 1,
  },
};

test("PDF uses the validated saved report, embedded typography and dated site filename", () => {
  const report = structuredClone(sample);
  report.cached = true;
  const before = structuredClone(report);
  const { doc, filename, layout } = createReportPdf(report, options);
  assert.equal(
    filename,
    `contextlumen-sample.example-readiness-${sample.checkedAt.slice(0, 10)}.pdf`,
  );
  assert(doc.output().startsWith("%PDF-"));
  assert.match(doc.output(), /\/FontFile2/);
  assert.deepEqual(doc.getFontList().Inter, ["normal", "bold"]);
  assert(doc.getNumberOfPages() >= 4);
  assert.equal(layout.length, doc.getNumberOfPages());
  assert.deepEqual(report, before);
});

test("example downloads remain clearly separate and malformed data never produces a report", () => {
  assert.equal(
    createReportPdf(sample, { ...options, sample: true }).filename,
    "contextlumen-example-readiness.pdf",
  );
  assert.throws(
    () => createReportPdf({ ...sample, summary: { total: 999 } }, options),
    /could not be verified/,
  );
  assert.throws(() => createReportPdf(sample, {}), /assets are unavailable/);
});

test("long evidence paginates, Latin characters survive, unsupported glyphs are not silently omitted", () => {
  const report = structuredClone(sample);
  report.findings[0].evidence =
    "Café, naïve, résumé. “Quoted evidence.” ".repeat(500);
  const { doc } = createReportPdf(report, options);
  assert(doc.getNumberOfPages() > 6);
  report.findings[0].evidence = "中文";
  assert.throws(() => createReportPdf(report, options), /font cannot render/);
});

test("report export is lazy, browser-side and does not rerun an audit", () => {
  const component = readFileSync(
    new URL("../src/components/WebsiteChecker.tsx", import.meta.url),
    "utf8",
  );
  assert.match(component, /await import\("\.\.\/lib\/report-pdf\.mjs"\)/);
  assert.match(component, /await downloadReportPdf\(report, sample\)/);
  assert.match(component, /aria-busy=\{exporting\}/);
  assert.doesNotMatch(
    component,
    /text\/plain|createObjectURL|download[^\n]*\.txt/,
  );
  const renderer = readFileSync(
    new URL("../src/lib/report-pdf.mjs", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(
    renderer,
    /fetch\("\/api|supabase|access_token|refresh_token/,
  );
  assert.match(renderer, /does not query ChatGPT, Gemini or Perplexity/);
});
