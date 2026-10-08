import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  Search,
  Check,
  Download,
  LoaderCircle,
  AlertCircle,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { site, contactEmailUrl } from "../content";
import { isReadinessReport } from "../lib/audit-flow.mjs";
import { requestAudit } from "../lib/audit-request.mjs";
import { summarizeAudit } from "../lib/audit-summary.mjs";

type Finding = {
  id: string;
  title: string;
  status: "observed" | "review" | "note";
  evidence: string;
  meaning: string;
  action: string;
  priority: number;
  source: string;
};
export type Report = {
  version: string;
  checkedAt: string;
  requestedUrl: string;
  finalUrl: string;
  scope: string;
  cached: boolean;
  evidence: {
    redirects: { url: string; status: number }[];
    robotsUrl: string;
    robotsStatus: number;
  };
  findings: Finding[];
  summary: { observed: number; review: number; notes: number; total: number };
  training: { agent: string; allowedByRobots: boolean; note: string };
  limitations: string[];
};
export function Results({
  report,
  mode = "live",
}: {
  report: Report;
  mode?: "live" | "sample";
}) {
  const sample = mode === "sample";
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  async function download() {
    if (exporting) return;
    setExporting(true);
    setExportError("");
    try {
      const { downloadReportPdf } = await import("../lib/report-pdf.mjs");
      await downloadReportPdf(report, sample);
    } catch {
      setExportError(
        "We could not create your PDF. Your saved report is unchanged. Please try again or contact us.",
      );
    } finally {
      setExporting(false);
    }
  }
  const summary = summarizeAudit(report);
  const priorities = summary.priorities;
  const email =
    "mailto:" +
    site.email +
    "?subject=" +
    encodeURIComponent("Discuss my ContextLumen website check") +
    "&body=" +
    encodeURIComponent(
      "Hi ContextLumen,\n\nI checked " +
        report.finalUrl +
        " on " +
        report.checkedAt +
        ".\n" +
        report.summary.review +
        " items need review in the homepage checklist.\n" +
        (priorities.length
          ? "I'd like to discuss: " +
            priorities.map((f) => f.title).join(", ") +
            ".\n"
          : "I'd like to understand how buyers discover and compare us.\n") +
        "\nMy business goals:\n\nBest,\n",
    );
  return (
    <div className="checker-results">
      <div className="report-heading">
        <div>
          <span className="micro">
            {sample
              ? "ILLUSTRATIVE REPORT / FICTIONAL WEBSITE"
              : "YOUR HOMEPAGE SNAPSHOT"}
          </span>
          <h3>{new URL(report.finalUrl).hostname}</h3>
          <p>
            {sample
              ? "Demonstration data. No live scan was run."
              : new Date(report.checkedAt).toLocaleString("en-US", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
            {!sample &&
              (report.cached
                ? " · Cached when checked"
                : " · Homepage snapshot")}
          </p>
        </div>
        <button
          type="button"
          className="button button-outline report-download"
          onClick={download}
          disabled={exporting}
          aria-busy={exporting}
        >
          {exporting ? (
            <LoaderCircle
              size={17}
              className="checker-spin"
              aria-hidden="true"
            />
          ) : (
            <Download size={17} aria-hidden="true" />
          )}{" "}
          {exporting
            ? "Preparing PDF"
            : sample
              ? "Download example PDF"
              : "Download PDF report"}
        </button>
      </div>
      {exportError && (
        <p className="account-error" role="alert">
          {exportError}
        </p>
      )}
      <section className="report-conclusion" aria-label="Audit conclusion">
        <p className="micro">WHAT WE FOUND</p>
        <h4>{summary.headline}</h4>
        <p>{summary.explanation}</p>
        <p className="form-note">
          <strong>Scope:</strong> {report.scope}
        </p>
        <a
          className="text-link"
          href={
            "/book?website=" +
            encodeURIComponent(report.finalUrl) +
            "&auditDate=" +
            encodeURIComponent(report.checkedAt)
          }
        >
          Discuss my findings <ArrowUpRight size={16} aria-hidden="true" />
        </a>
      </section>
      <div className="report-areas" aria-label="Category summaries">
        {summary.areas.map((area) => (
          <article key={area.name}>
            <h4>{area.name}</h4>
            <span
              className={"status-tag " + (area.review ? "review" : "observed")}
            >
              {area.review
                ? `${area.review} to review`
                : area.notes
                  ? "Includes a note"
                  : "Signals observed"}
            </span>
            <p>
              {area.observed} observed · {area.review} review · {area.notes}{" "}
              notes
            </p>
          </article>
        ))}
      </div>
      <div className="report-counts">
        <div>
          <strong>{report.summary.observed}</strong>
          <span>signals observed</span>
        </div>
        <div>
          <strong>{report.summary.review}</strong>
          <span>items to review</span>
        </div>
        <div>
          <strong>{report.summary.notes}</strong>
          <span>informational notes</span>
        </div>
        <p>
          {report.summary.total}{" "}
          {sample
            ? "illustrative findings, not scan results."
            : "checks in this report."}
          <br />
          Not a percentage of AI visibility.
        </p>
      </div>
      <div className="report-priorities">
        <div>
          <span className="micro">WHERE TO START</span>
          <h4>
            {priorities.length
              ? "Review these findings first."
              : "The checked fundamentals are in place."}
          </h4>
          <p>
            {priorities.length
              ? "These are specific observations, not proof that your business is absent from AI search."
              : "That doesn't tell us whether the right buyers see or choose you. Actual answer visibility needs a buyer-question study."}
          </p>
        </div>
        <ol>
          {priorities.length ? (
            priorities.map((f) => (
              <li key={f.id}>
                <strong>{f.title}</strong>
                <span>{f.action}</span>
              </li>
            ))
          ) : (
            <li>
              <strong>Test the questions buyers ask.</strong>
              <span>
                Document real answers, mentions, sources, and competing options
                across an agreed sample.
              </span>
            </li>
          )}
        </ol>
      </div>
      <section
        className="report-overview"
        aria-labelledby="report-overview-title"
      >
        <p className="micro">YOUR RESULTS, AT A GLANCE</p>
        <h4 id="report-overview-title">The checklist, by area.</h4>
        <div
          className="report-table-scroll"
          role="region"
          aria-label="Checklist results by area"
          tabIndex={0}
        >
          <table className="report-overview-table">
            <caption>
              Each check is counted once. These are not rankings or a visibility
              score.
            </caption>
            <thead>
              <tr>
                <th scope="col">Area checked</th>
                <th scope="col">Observed</th>
                <th scope="col">Review</th>
                <th scope="col">Notes</th>
              </tr>
            </thead>
            <tbody>
              {summary.areas.map((area) => (
                <tr key={area.name}>
                  <th scope="row">{area.name}</th>
                  <td>{area.observed}</td>
                  <td>{area.review}</td>
                  <td>{area.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="report-visibility-boundary">
          <strong>
            Actual AI visibility: {summary.visibility.toLowerCase()}.
          </strong>{" "}
          A separate buyer-question study is needed to measure mentions and
          citations.
        </p>
      </section>
      <div className="finding-list">
        {report.findings.map((f) => (
          <details className="finding" key={f.id}>
            <summary>
              <span className={"finding-icon " + f.status}>
                {f.status === "observed" ? (
                  <Check size={17} aria-hidden="true" />
                ) : f.status === "review" ? (
                  <AlertCircle size={17} aria-hidden="true" />
                ) : (
                  <FileText size={17} aria-hidden="true" />
                )}
              </span>
              <span>{f.title}</span>
              <span className={"finding-status " + f.status}>
                {f.status === "observed"
                  ? "Observed"
                  : f.status === "review"
                    ? "Review"
                    : "Note"}
              </span>
              <span className="finding-plus" aria-hidden="true">
                +
              </span>
            </summary>
            <div className="finding-body">
              <div>
                <span className="micro">EVIDENCE</span>
                <p>{f.evidence}</p>
              </div>
              <div>
                <span className="micro">WHAT IT MEANS</span>
                <p>{f.meaning}</p>
              </div>
              <div>
                <span className="micro">NEXT STEP</span>
                <p>{f.action}</p>
              </div>
              <a
                href={f.source}
                target="_blank"
                rel="noopener noreferrer"
                className="text-link"
              >
                Read the platform guidance{" "}
                <ArrowUpRight size={15} aria-hidden="true" />
              </a>
            </div>
          </details>
        ))}
      </div>
      <details className="report-scope">
        <summary>
          What this report does and does not verify{" "}
          <span aria-hidden="true">+</span>
        </summary>
        <div>
          <p>
            <strong>Inspected:</strong> {report.scope}, without executing the
            site's scripts.
          </p>
          <p>
            <strong>Source:</strong>{" "}
            {sample ? (
              <span>sample.example (fictional). No source was fetched.</span>
            ) : (
              <>
                <a
                  href={report.finalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {report.finalUrl}
                </a>{" "}
                ·{" "}
                <a
                  href={report.evidence.robotsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  robots.txt
                </a>{" "}
                (HTTP {report.evidence.robotsStatus}).
              </>
            )}
          </p>
          <p>
            <strong>Method:</strong> {report.version}.{" "}
            {sample
              ? "These are fictional examples, not completed automated checks. "
              : ""}
            Counts are unweighted checklist results, not a platform score.
            Missing JSON-LD is informational, not an automatic failure. The
            80-word threshold is a screening heuristic.
          </p>
          <p>
            <strong>Training:</strong> {report.training.agent} is{" "}
            {report.training.allowedByRobots ? "not disallowed" : "disallowed"}{" "}
            for this page. {report.training.note}
          </p>
          <ul>
            {report.limitations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p>
            <strong>
              {sample
                ? "Illustrative redirect trace:"
                : "Homepage redirect trace:"}
            </strong>{" "}
            {report.evidence.redirects
              .map((h) => h.status + " " + h.url)
              .join(" → ")}
          </p>
        </div>
      </details>
      <div className="report-next">
        <div>
          <span className="micro">FROM A CHECK TO A PLAN</span>
          <h4>Want help with what comes next?</h4>
          <p>
            We help choose the questions that matter, check answers and cited
            sources across agreed platforms, and turn the evidence into an
            approved action plan. Then we repeat the same checks so you can see
            what changed.
          </p>
        </div>
        <a
          className="button button-dark"
          href={
            sample
              ? contactEmailUrl
              : "/book?website=" +
                encodeURIComponent(report.finalUrl) +
                "&auditDate=" +
                encodeURIComponent(report.checkedAt)
          }
        >
          {sample ? "Discuss a first project" : "Discuss my findings"}{" "}
          <ArrowUpRight size={17} aria-hidden="true" />
        </a>
        {!sample && (
          <a className="text-link" href={email}>
            Email my findings <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        )}
      </div>
    </div>
  );
}

export function WebsiteChecker({
  accessToken,
  onComplete,
  onRecover,
}: {
  accessToken: string;
  onComplete: (report: Report) => void;
  onRecover: () => void;
}) {
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [needsRecovery, setNeedsRecovery] = useState(false);
  const mounted = useRef(true);
  const pending = useRef<AbortController | null>(null);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      pending.current?.abort();
    };
  }, []);
  const [report, setReport] = useState<Report | null>(null);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy || needsRecovery) return;
    setBusy(true);
    setError("");
    setReport(null);
    try {
      const controller = new AbortController();
      pending.current = controller;
      const data = await requestAudit({
        accessToken,
        website: url,
        signal: AbortSignal.any([
          controller.signal,
          AbortSignal.timeout(65000),
        ]),
      });
      if (!isReadinessReport(data))
        throw new Error(
          "The checker returned an incomplete report. Please try again.",
        );
      if (!mounted.current) return;
      setReport(data);
      onComplete(data);
      setTimeout(() => resultHeading.current?.focus(), 50);
    } catch (error) {
      if (!mounted.current) return;
      setNeedsRecovery(true);
      setError(
        error instanceof Error
          ? error.message
          : "We couldn't complete a reliable check.",
      );
    } finally {
      pending.current = null;
      if (mounted.current) setBusy(false);
    }
  }
  return (
    <section
      id="checker"
      className="checker-section section-pad"
      aria-labelledby="checker-title"
    >
      <div className="container">
        <div className="checker-intro">
          <div>
            <p className="eyebrow">FREE WEBSITE READINESS CHECK</p>
            <h2 id="checker-title">
              Before you change anything,
              <br />
              <em>check what's there.</em>
            </h2>
          </div>
          <p>
            See what a lightweight crawl can actually find on your website. Real
            findings, with the evidence and a practical next step.
          </p>
        </div>
        <div className="checker-workspace">
          <div className="checker-form-panel">
            <div className="checker-form-label">
              <Search size={20} aria-hidden="true" />
              <span className="micro">START WITH YOUR WEBSITE</span>
            </div>
            <form onSubmit={submit}>
              <label htmlFor="checker-url">Public website address</label>
              <div className="checker-input-row">
                <input
                  id="checker-url"
                  type="text"
                  inputMode="url"
                  autoComplete="url"
                  placeholder="yourbusiness.com"
                  required
                  maxLength={500}
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  aria-describedby="checker-input-note"
                  disabled={busy || needsRecovery}
                />
                <button
                  className="button button-dark"
                  type="submit"
                  disabled={busy || needsRecovery}
                  aria-busy={busy}
                >
                  {busy ? (
                    <>
                      <LoaderCircle
                        className="checker-spin"
                        size={17}
                        aria-hidden="true"
                      />{" "}
                      Checking
                    </>
                  ) : (
                    <>
                      Check my website{" "}
                      <ArrowRight size={17} aria-hidden="true" />
                    </>
                  )}
                </button>
              </div>
              <p id="checker-input-note">
                We check the public HTTPS homepage, not private pages or every
                URL on the site. One successful audit per verified account. A
                failed technical check does not use your allowance.
              </p>
              <div
                className="checker-feedback"
                role="status"
                aria-live="polite"
              >
                {busy && (
                  <p>
                    Fetching the homepage and crawl rules, then reviewing the
                    evidence. This can take up to a minute.
                  </p>
                )}
              </div>
              {error && (
                <div className="checker-error" role="alert">
                  <AlertCircle size={20} aria-hidden="true" />
                  <div>
                    <strong>We couldn't complete a reliable check.</strong>
                    <p>{error}</p>
                    <a href={"mailto:" + site.email}>Ask us to take a look</a>
                    <button
                      type="button"
                      className="button button-outline"
                      onClick={onRecover}
                    >
                      Check saved audit status
                    </button>
                  </div>
                </div>
              )}
            </form>
            <div className="checker-trust">
              <ShieldCheck size={17} aria-hidden="true" />
              <span>
                Public pages only. No changes to your website. No fabricated AI
                score.
              </span>
            </div>
          </div>
          <div className="checker-explainer">
            <span className="micro">A SMALL CHECK. A USEFUL START.</span>
            <ul>
              <li>
                <span>01</span>
                <div>
                  <strong>Can search systems reach it?</strong>
                  <p>Crawl rules and page-level indexing controls.</p>
                </div>
              </li>
              <li>
                <span>02</span>
                <div>
                  <strong>What can they read?</strong>
                  <p>Initial HTML, page headings, metadata, and JSON-LD.</p>
                </div>
              </li>
              <li>
                <span>03</span>
                <div>
                  <strong>What deserves attention?</strong>
                  <p>Evidence, interpretation, and a report you can keep.</p>
                </div>
              </li>
            </ul>
            <p className="checker-boundary">
              This is a technical readiness check, not a live test of AI
              answers, brand mentions, or rankings.
            </p>
          </div>
        </div>
        <details className="checker-method">
          <summary>
            How this check works <span aria-hidden="true">+</span>
          </summary>
          <div>
            <p>
              Our server retrieves robots.txt and the public homepage using
              ContextLumenAudit, follows limited same-site redirects, and
              inspects the initial HTML. It does not execute the site's
              JavaScript, sign in, or ask AI platforms to recommend your brand.
            </p>
            <p>
              Each finding is marked Observed, Review, or Note. We show the rule
              and evidence rather than a pretend visibility score. Search bots'
              robots.txt policies are inspected, not tested from real bots'
              networks. Training permissions are treated separately.
            </p>
            <p>
              Public URLs and reports are processed to deliver the check and may
              be cached in server memory for up to ten minutes. Your successful
              report is saved to your audit account. We do not enrol you in
              marketing email. Hosting providers may retain technical logs. Only
              submit public website addresses.
            </p>
            <p>
              These checks follow normal search fundamentals. Google says there
              are no special markup or AI-file requirements for its AI search
              features.{" "}
              <a
                href="https://developers.google.com/search/docs/appearance/ai-features"
                target="_blank"
                rel="noopener noreferrer"
              >
                Read Google's guidance.
              </a>
            </p>
          </div>
        </details>
        {report && (
          <div>
            <h3
              ref={resultHeading}
              tabIndex={-1}
              className="checker-result-announcement"
            >
              Your check is complete
            </h3>
            <Results report={report} />
          </div>
        )}
      </div>
    </section>
  );
}
