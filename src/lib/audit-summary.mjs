import { isReadinessReport } from "./audit-flow.mjs";

const groups = [
  {
    name: "Crawl access",
    ids: ["robots-googlebot", "robots-bingbot", "robots-oai-searchbot"],
  },
  { name: "Indexing and previews", ids: ["indexing", "snippets", "canonical"] },
  {
    name: "Page information",
    ids: ["title", "description", "heading", "text"],
  },
  { name: "Structured data", ids: ["structured"] },
];

export function summarizeAudit(report) {
  if (!isReadinessReport(report))
    throw new Error("The audit could not be verified.");
  const categories = groups.map((group) => ({
    name: group.name,
    findings: report.findings.filter((f) => group.ids.includes(f.id)),
  }));
  const known = new Set(groups.flatMap((group) => group.ids));
  const other = report.findings.filter((f) => !known.has(f.id));
  if (other.length) categories.push({ name: "Other checks", findings: other });
  const areas = categories
    .filter((area) => area.findings.length)
    .map((area) => ({
      name: area.name,
      observed: area.findings.filter((f) => f.status === "observed").length,
      review: area.findings.filter((f) => f.status === "review").length,
      notes: area.findings.filter((f) => f.status === "note").length,
      total: area.findings.length,
    }));
  const priorities = report.findings
    .filter((f) => f.status === "review")
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 3);
  return {
    headline: report.summary.review
      ? `${report.summary.review} ${report.summary.review === 1 ? "item needs" : "items need"} a closer look.`
      : "No review items were flagged in this homepage check.",
    explanation:
      "These are checks of the homepage and its published crawl rules. They do not measure how often an AI assistant mentions or recommends the business.",
    areas,
    priorities,
    nextStep: priorities.length
      ? priorities[0].action
      : "Choose the buyer questions that matter, then measure real answers in a separate visibility study.",
    visibility: "Not measured",
  };
}
