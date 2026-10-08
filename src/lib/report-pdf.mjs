import { jsPDF } from "jspdf";
import { isReadinessReport } from "./audit-flow.mjs";
import { summarizeAudit } from "./audit-summary.mjs";

const brand = {
  name: "ContextLumen",
  url: "https://www.contextlumen.com",
  email: "yashchaudhary@contextlumen.com",
};
const colors = {
  ink: "#183b32",
  muted: "#59675f",
  gold: "#edc38b",
  paper: "#f6f4ee",
  line: "#dce3dc",
  review: "#925315",
};
const labels = {
  observed: "Observed",
  review: "Review",
  note: "Informational",
};
const clean = (value) =>
  String(value)
    .replace(/[\u2010-\u2015\u2212]/g, "-")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "");

// Both browser download and QA use this same renderer and immutable saved report.
export function createReportPdf(
  report,
  { regularFontBase64, boldFontBase64, logoPng, sample = false },
) {
  if (!isReadinessReport(report))
    throw new Error(
      "This saved report could not be verified. Please contact the team.",
    );
  if (!regularFontBase64 || !boldFontBase64 || !logoPng)
    throw new Error("Report assets are unavailable. Please try again.");
  const summary = summarizeAudit(report);
  const doc = new jsPDF({
    unit: "mm",
    format: "a4",
    compress: true,
    putOnlyUsedFonts: true,
  });
  doc.addFileToVFS("Inter-Regular.ttf", regularFontBase64);
  doc.addFont("Inter-Regular.ttf", "Inter", "normal");
  doc.addFileToVFS("Inter-Bold.ttf", boldFontBase64);
  doc.addFont("Inter-Bold.ttf", "Inter", "bold");
  const host = new URL(report.finalUrl).hostname;
  const day = new Date(report.checkedAt).toISOString().slice(0, 10);
  doc.setProperties({
    title: `${brand.name} | ${host} | Website readiness`,
    author: brand.name,
    subject: "Public homepage readiness assessment, not measured AI visibility",
    creator: "ContextLumen readiness report",
  });
  const width = 174,
    bottom = 274;
  let y = 0;
  const layout = [];
  function font(size = 10.5, bold = false, color = colors.ink) {
    doc.setFont("Inter", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(color);
  }
  function line(text, x, at, size = 10.5, bold = false, color = colors.ink) {
    font(size, bold, color);
    const normalized = clean(text);
    // Never silently discard evidence when the bundled font lacks a character.
    assertGlyphs(normalized);
    doc.text(normalized, x, at);
  }
  function assertGlyphs(text) {
    const metadata = doc.getFont().metadata;
    for (const character of text) {
      if (/\s/u.test(character)) continue;
      if (!metadata.characterToGlyph(character.codePointAt(0)))
        throw new Error(
          "This report contains characters the PDF font cannot render. Please contact the team for an accessible export.",
        );
    }
  }
  function page(first = false) {
    if (!first) doc.addPage();
    doc.setFillColor(colors.paper);
    doc.rect(0, 0, 210, 34, "F");
    doc.addImage(logoPng, "PNG", 18, 11, 12, 12);
    line(brand.name, 34, 19, 17, true);
    line(
      sample ? "FICTIONAL EXAMPLE" : "WEBSITE READINESS",
      134,
      18,
      8,
      true,
      colors.muted,
    );
    y = 46;
  }
  function ensure(height) {
    if (y + height > bottom) page();
  }
  function paragraph(
    text,
    { size = 10.5, bold = false, color = colors.ink, indent = 0, gap = 4 } = {},
  ) {
    font(size, bold, color);
    const lines = doc.splitTextToSize(clean(text), width - indent);
    const step = size * 0.3528 * 1.4;
    for (const part of lines) {
      ensure(step + 1);
      line(part, 18 + indent, y, size, bold, color);
      y += step;
    }
    y += gap;
  }
  function section(kicker, title) {
    ensure(28);
    paragraph(kicker.toUpperCase(), {
      size: 8,
      bold: true,
      color: colors.muted,
      gap: 3,
    });
    paragraph(title, { size: 21, bold: true, gap: 7 });
  }
  function link(text, url) {
    font(9, false, colors.muted);
    const lines = doc.splitTextToSize(clean(text), width);
    for (const part of lines) {
      ensure(6);
      font(9, false, colors.muted);
      assertGlyphs(part);
      doc.textWithLink(part, 18, y, { url });
      y += 4.5;
    }
    y += 4;
  }
  page(true);
  paragraph(
    sample
      ? "DEMONSTRATION DATA ONLY. No live scan or client result."
      : "A dated view of what your homepage makes available.",
    { size: 9, bold: true, color: colors.muted, gap: 8 },
  );
  paragraph("Website Audit", { size: 32, bold: true, gap: 2 });
  paragraph(summary.headline, {
    size: 14,
    color: colors.muted,
    gap: 8,
  });
  paragraph(host, { size: 23, bold: true, gap: 4 });
  link(report.finalUrl, report.finalUrl);
  paragraph(
    (sample ? "Example timestamp: " : "Checked at: ") +
      report.checkedAt +
      " (UTC)",
    { size: 9, color: colors.muted, gap: 2 },
  );
  paragraph(
    "Snapshot: " +
      (report.cached
        ? "cached when checked; original evidence timestamp retained"
        : "collected homepage snapshot"),
    { size: 9, color: colors.muted, gap: 8 },
  );
  const counts = [
    [report.summary.observed, "Signals observed"],
    [report.summary.review, "Items to review"],
    [report.summary.notes, "Informational notes"],
  ];
  ensure(35);
  counts.forEach(([count, label], i) => {
    const x = 18 + i * 59;
    doc.setFillColor(colors.paper);
    doc.roundedRect(x, y - 2, 56, 29, 2, 2, "F");
    line(String(count), x + 6, y + 11, 24, true);
    line(label, x + 6, y + 21, 9, false, colors.muted);
  });
  y += 38;
  paragraph(
    `${report.summary.total} unweighted checklist findings. These counts are not an AI visibility percentage, ranking, or certification.`,
    { size: 10, gap: 8 },
  );
  paragraph("WHAT WE INSPECTED", {
    size: 8,
    bold: true,
    color: colors.muted,
    gap: 2,
  });
  paragraph(report.scope, { size: 11, gap: 7 });
  paragraph(
    "This report does not query ChatGPT, Gemini or Perplexity. It cannot establish whether they mention or recommend this website.",
    { size: 10, color: colors.muted },
  );
  page();
  section("01 / Decision brief", "Where to start");
  const priorities = summary.priorities;
  paragraph(summary.headline, { size: 15, bold: true, gap: 4 });
  paragraph(summary.explanation, { color: colors.muted, gap: 8 });
  paragraph("CHECKLIST RESULTS BY AREA", {
    size: 8,
    bold: true,
    color: colors.muted,
    gap: 4,
  });
  const columns = [18, 101, 127, 151, 174];
  const tableRow = (values, header = false) => {
    const rowHeight = 9;
    ensure(rowHeight + 2);
    doc.setFillColor(header ? colors.paper : "#ffffff");
    doc.rect(18, y - 6, width, rowHeight, "F");
    doc.setDrawColor(colors.line);
    doc.line(18, y + 3, 192, y + 3);
    values.forEach((value, index) => {
      const x = columns[index] + (index ? 2 : 2);
      const cellWidth = columns[index + 1] - columns[index] - 4;
      font(header ? 8 : 9, header);
      const cellLines = doc.splitTextToSize(clean(String(value)), cellWidth);
      line(
        cellLines[0] || "",
        x,
        y,
        header ? 8 : 9,
        header,
        header ? colors.muted : colors.ink,
      );
    });
    y += rowHeight;
  };
  tableRow(["Area checked", "Observed", "Review", "Notes"], true);
  summary.areas.forEach((area) =>
    tableRow([area.name, area.observed, area.review, area.notes]),
  );
  y += 4;
  paragraph(
    "Counts summarize this checklist only. They are not rankings, a readiness grade, or a percentage of AI visibility.",
    { size: 9, color: colors.muted, gap: 6 },
  );
  paragraph(
    "Observed means the signal was present. Review means it needs investigation. Informational means context, not a failure.",
    { size: 9, color: colors.muted, gap: 6 },
  );
  paragraph("ACTUAL AI VISIBILITY: " + summary.visibility, {
    size: 10,
    bold: true,
    gap: 7,
  });
  if (!priorities.length)
    paragraph(
      "Next: agree the audience and questions to test, then establish a separate AI-answer visibility baseline.",
      { bold: true },
    );
  priorities.forEach((finding, i) => {
    ensure(35);
    paragraph(`${String(i + 1).padStart(2, "0")}  ${finding.title}`, {
      size: 13,
      bold: true,
      gap: 3,
    });
    paragraph(finding.action, { gap: 4 });
    paragraph("Why: " + finding.meaning, {
      size: 10,
      color: colors.muted,
      gap: 8,
    });
  });
  y += 2;
  link("Discuss a focused review with ContextLumen", brand.url + "/book");
  page();
  section("02 / Evidence register", "The findings, in full");
  paragraph(
    "Observed = a signal was present. Review = an item deserves investigation. Informational = context, not a failure. Each entry retains the evidence and source guidance from your saved audit.",
    { size: 10, color: colors.muted, gap: 8 },
  );
  report.findings.forEach((finding, index) => {
    const fields = [
      ["EVIDENCE", finding.evidence],
      ["INTERPRETATION", finding.meaning],
      ["NEXT STEP", finding.action],
    ];
    // Keep ordinary finding cards intact. Exceptional long content flows across pages.
    font(10.5);
    const estimated =
      25 +
      fields.reduce(
        (n, [, text]) =>
          n + 10 + doc.splitTextToSize(clean(text), width).length * 5.2,
        0,
      );
    ensure(Math.min(estimated, 190));
    doc.setDrawColor(colors.line);
    doc.line(18, y - 4, 192, y - 4);
    paragraph(`${String(index + 1).padStart(2, "0")}  ${finding.title}`, {
      size: 13,
      bold: true,
      gap: 2,
    });
    paragraph(labels[finding.status], {
      size: 8.5,
      bold: true,
      color: finding.status === "review" ? colors.review : colors.muted,
      gap: 5,
    });
    fields.forEach(([label, text]) => {
      ensure(17);
      paragraph(label, { size: 8, bold: true, color: colors.muted, gap: 1 });
      paragraph(text, { gap: 3 });
    });
    ensure(13);
    paragraph("SOURCE GUIDANCE", {
      size: 8,
      bold: true,
      color: colors.muted,
      gap: 1,
    });
    link(finding.source, finding.source);
    y += 4;
  });
  page();
  section("03 / Method & boundaries", "What the evidence means");
  paragraph("Method: " + report.version, { bold: true });
  paragraph("Requested homepage: " + report.requestedUrl);
  paragraph("Final homepage: " + report.finalUrl);
  paragraph("Robots policy: HTTP " + report.evidence.robotsStatus);
  link(report.evidence.robotsUrl, report.evidence.robotsUrl);
  paragraph("Homepage redirect trace", { size: 13, bold: true });
  report.evidence.redirects.forEach((hop) =>
    paragraph(`HTTP ${hop.status}  ${hop.url}`, {
      size: 10,
      color: colors.muted,
    }),
  );
  ensure(32);
  paragraph("Training is separate from search", { size: 13, bold: true });
  paragraph(
    `${report.training.agent}: ${report.training.allowedByRobots ? "not disallowed" : "disallowed"} by the inspected policy. ${report.training.note}`,
  );
  ensure(30);
  paragraph("Limitations", { size: 13, bold: true });
  report.limitations.forEach((item, i) =>
    paragraph(`${i + 1}. ${item}`, { size: 10, color: colors.muted }),
  );
  paragraph(
    "No changes were made to the assessed website. No account credentials or sign-in codes are included in this export.",
    { size: 10, color: colors.muted },
  );
  link(
    "Methodology: " + brand.url + "/methodology",
    brand.url + "/methodology",
  );
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setDrawColor(colors.line);
    doc.line(18, 281, 192, 281);
    line(brand.name + " / " + day, 18, 287, 8, true, colors.muted);
    line(`${p} / ${pages}`, 182, 287, 8, false, colors.muted);
    font(8, false, colors.muted);
    doc.textWithLink(brand.email, 18, 292, { url: "mailto:" + brand.email });
    layout.push({ page: p, footerY: 292 });
  }
  return {
    doc,
    filename: sample
      ? "contextlumen-example-readiness.pdf"
      : `contextlumen-${host}-readiness-${day}.pdf`,
    layout,
  };
}

let assetsPromise;
async function loadAssets() {
  if (!assetsPromise)
    assetsPromise = (async () => {
      const font = async (name) => {
        const response = await fetch("/report-fonts/" + name, {
          signal: AbortSignal.timeout(15000),
        });
        if (!response.ok) throw new Error("Report typography could not load.");
        const bytes = new Uint8Array(await response.arrayBuffer());
        let binary = "";
        for (let i = 0; i < bytes.length; i += 8192)
          binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
        return btoa(binary);
      };
      const logo = new Promise((resolve, reject) => {
        const image = new Image();
        const timeout = setTimeout(
          () => reject(new Error("The report logo could not load.")),
          15000,
        );
        image.onload = () => {
          clearTimeout(timeout);
          try {
            const canvas = document.createElement("canvas");
            canvas.width = canvas.height = 192;
            const ctx = canvas.getContext("2d");
            if (!ctx) throw new Error();
            ctx.drawImage(image, 0, 0, 192, 192);
            resolve(canvas.toDataURL("image/png"));
          } catch {
            reject(new Error("The report logo could not load."));
          }
        };
        image.onerror = () => {
          clearTimeout(timeout);
          reject(new Error("The report logo could not load."));
        };
        image.src = "/logo.svg";
      });
      const [regularFontBase64, boldFontBase64, logoPng] = await Promise.all([
        font("Inter-Regular.ttf"),
        font("Inter-Bold.ttf"),
        logo,
      ]);
      return { regularFontBase64, boldFontBase64, logoPng };
    })().catch((error) => {
      assetsPromise = undefined;
      throw error;
    });
  return assetsPromise;
}
export async function downloadReportPdf(report, sample = false) {
  const { doc, filename } = createReportPdf(report, {
    ...(await loadAssets()),
    sample,
  });
  doc.save(filename);
}
