import { useState } from "react";
import {
  FileSearch,
  ArrowRight,
  CircleCheck,
  CircleAlert,
  Info,
} from "lucide-react";
const previews = [
  {
    label: "Crawl access",
    icon: CircleCheck,
    status: "Observed",
    evidence:
      "The published robots.txt policy allows the homepage for the crawler checked.",
    meaning:
      "The published rule does not block this URL. It does not confirm that a search crawler visited it.",
    action:
      "Keep important public pages accessible and check actual crawling in your webmaster tools.",
  },
  {
    label: "Page description",
    icon: CircleAlert,
    status: "Review",
    evidence: "No meta description was found in the homepage’s initial HTML.",
    meaning:
      "A concise summary can help explain the page. Search systems may still choose their own preview.",
    action:
      "Write a specific homepage description and confirm it appears in the published HTML.",
  },
  {
    label: "Structured data",
    icon: Info,
    status: "Note",
    evidence: "No JSON-LD block was found in the initial HTML.",
    meaning:
      "This is not automatically a problem. Structured data should describe relevant, visible page content.",
    action:
      "Review whether supported markup fits the page. Do not add unsupported claims to chase a score.",
  },
];
export function AuditPreview() {
  const [active, setActive] = useState(1);
  const finding = previews[active];
  return (
    <div className="audit-preview">
      <div className="preview-toolbar">
        <span>
          <FileSearch size={19} aria-hidden="true" /> Website Audit
        </span>
        <span className="status-tag">Illustrative preview</span>
      </div>
      <div className="preview-layout">
        <div className="preview-findings">
          <p className="micro">EXPLORE A FINDING</p>
          {previews.map(({ label, icon: Icon, status }, index) => (
            <button
              type="button"
              key={label}
              className={active === index ? "selected" : ""}
              onClick={() => setActive(index)}
              aria-pressed={active === index}
              aria-controls="preview-detail"
            >
              <Icon size={18} aria-hidden="true" />
              <span>
                {label}
                <small>{status}</small>
              </span>
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          ))}
          <p>
            Fictional examples. Your report uses the evidence collected from
            your website.
          </p>
        </div>
        <div className="preview-detail" id="preview-detail">
          <span className={"status-tag " + finding.status.toLowerCase()}>
            {finding.status}
          </span>
          <h3>{finding.label}</h3>
          <dl>
            <div>
              <dt>What we found</dt>
              <dd>{finding.evidence}</dd>
            </div>
            <div>
              <dt>Why it matters</dt>
              <dd>{finding.meaning}</dd>
            </div>
            <div className="preview-action">
              <dt>Your next step</dt>
              <dd>{finding.action}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
