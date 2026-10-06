import { ArrowRight, FileSearch, ListChecks, ShieldCheck } from "lucide-react";
import { Results } from "../components/WebsiteChecker";
import { isReadinessReport } from "../lib/audit-flow.mjs";
import sample from "../data/sample-report.json";

export function SampleReportPage() {
  if (!isReadinessReport(sample))
    throw new Error("Invalid demonstration report.");
  const report = sample;
  return (
    <>
      <section className="container page-hero" aria-labelledby="sample-heading">
        <p className="eyebrow">OPEN THE DELIVERABLE</p>
        <h1 id="sample-heading">
          See the finding.
          <br />
          Understand the next step.
        </h1>
        <p className="page-intro">
          An assessment should help you decide what to do, not leave you with
          another unexplained score. Explore the evidence, interpretation, and
          priorities below.
        </p>
        <div className="page-resource-links">
          <a className="button button-dark" href="/audit">
            Explore your free audit <ArrowRight size={17} aria-hidden="true" />
          </a>
          <a className="text-link" href="/methodology">
            How we assess a website <ArrowRight size={17} aria-hidden="true" />
          </a>
        </div>
      </section>
      <section
        className="container sample-page"
        aria-label="Illustrative report"
      >
        <aside
          className="sample-disclosure"
          aria-label="Demonstration data notice"
        >
          <ShieldCheck size={24} aria-hidden="true" />
          <div>
            <p className="micro">DEMONSTRATION DATA ONLY</p>
            <h2>A sample, not a client result.</h2>
            <p>
              This report uses a fictional business and website. No scan was
              run, no AI visibility was measured, and no improvement is claimed.
              It shows the format you can expect, not evidence of our results.
            </p>
          </div>
        </aside>
        <div className="report-reading-guide">
          <div>
            <FileSearch size={22} aria-hidden="true" />
            <h2>Inspect the evidence</h2>
            <p>Open a finding to see what was checked and why it matters.</p>
          </div>
          <div>
            <ListChecks size={22} aria-hidden="true" />
            <h2>Prioritise the work</h2>
            <p>
              Distinguish a specific issue from a useful note or an untested
              assumption.
            </p>
          </div>
        </div>
        <Results report={report} mode="sample" />
      </section>
    </>
  );
}
