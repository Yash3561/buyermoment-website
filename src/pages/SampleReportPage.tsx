import { ArrowRight, Check, FileSearch, ShieldCheck } from "lucide-react";
import { AuditPreview } from "../components/AuditPreview";

const selfServeAuditAvailable = import.meta.env.VITE_AUDIT_ENABLED === "true";

const checks = [
  {
    number: "01",
    title: "Can the page be reached?",
    detail: "HTTPS response, redirects, and the public crawler policy.",
  },
  {
    number: "02",
    title: "Is the offer clear in the page itself?",
    detail: "Title, description, headings, and readable page content.",
  },
  {
    number: "03",
    title: "What should a person review next?",
    detail: "Evidence-led findings with context and a practical action.",
  },
];

export function SampleReportPage() {
  return (
    <>
      <section
        className="container page-hero"
        aria-labelledby="audit-preview-heading"
      >
        <p className="eyebrow">A TRANSPARENT FIRST CHECK</p>
        <h1 id="audit-preview-heading">
          Know what the audit checks.
          <br />
          Know what it doesn’t.
        </h1>
        <p className="page-intro">
          Explore how a website observation becomes a practical action. The
          preview below is illustrative. Your audit uses the evidence returned
          from your public homepage.
        </p>
        <div className="page-resource-links">
          <a className="button button-dark" href="/audit">
            {selfServeAuditAvailable
              ? "Start your free audit"
              : "See audit status"}{" "}
            <ArrowRight size={17} aria-hidden="true" />
          </a>
          <a className="text-link" href="/methodology">
            Read the methodology <ArrowRight size={17} aria-hidden="true" />
          </a>
        </div>
      </section>

      <section
        className="container example-preview"
        aria-label="Interactive illustrative audit"
      >
        <AuditPreview />
      </section>
      <section className="container audit-overview" aria-label="Audit scope">
        <div className="audit-overview-copy">
          <p className="micro">THREE THINGS, CHECKED AGAINST THE PAGE</p>
          <h2>A useful baseline, without the mystery score.</h2>
          <p>
            Each finding is tied to something observable on the public site. It
            is labelled as an observation, a point to review, or a note, so a
            suggestion is never dressed up as a measured result.
          </p>
          <ol className="audit-check-list">
            {checks.map((item) => (
              <li key={item.number}>
                <span>{item.number}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <aside className="audit-report-card" aria-label="Report contents">
          <div className="audit-report-topline">
            <span className="icon-box">
              <FileSearch size={21} aria-hidden="true" />
            </span>
            <span className="audit-report-tag">REPORT CONTENTS</span>
          </div>
          <p className="micro">YOUR PUBLIC HOMEPAGE</p>
          <h2>What you’ll receive</h2>
          <ul>
            <li>
              <Check size={17} aria-hidden="true" />
              The page and checks included in the scan
            </li>
            <li>
              <Check size={17} aria-hidden="true" />
              Source evidence for every finding
            </li>
            <li>
              <Check size={17} aria-hidden="true" />
              Plain-language meaning and next steps
            </li>
            <li>
              <Check size={17} aria-hidden="true" />
              Limitations, including what was not measured
            </li>
          </ul>
          <div className="audit-report-boundary">
            <ShieldCheck size={19} aria-hidden="true" />
            <p>
              No live ChatGPT, Gemini, or Perplexity ranking is claimed. That
              requires a separate, repeatable buyer-question study.
            </p>
          </div>
        </aside>
      </section>

      <section className="container audit-overview-cta">
        <div>
          <p className="micro">
            {selfServeAuditAvailable
              ? "YOUR FIRST CHECK"
              : "SELF-SERVICE STATUS"}
          </p>
          <h2>One verified account. One saved homepage audit.</h2>
          <p>
            The audit is designed to scan a public homepage only. It does not
            change your website, request private code, or subscribe you to
            marketing emails.
          </p>
        </div>
        <a className="button button-dark" href="/audit">
          Go to the audit <ArrowRight size={17} aria-hidden="true" />
        </a>
      </section>
    </>
  );
}
