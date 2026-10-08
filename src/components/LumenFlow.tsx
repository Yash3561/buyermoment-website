import { useState } from "react";
import {
  ArrowUpRight,
  Globe2,
  MessageSquareText,
  FileCheck2,
  Sparkles,
} from "lucide-react";
const nodes = [
  {
    icon: Globe2,
    label: "Your website",
    note: "Make your offer, audience, and proof clear on the pages you own.",
  },
  {
    icon: MessageSquareText,
    label: "Buyer questions",
    note: "Research the questions people ask when they are deciding what to choose.",
  },
  {
    icon: FileCheck2,
    label: "Useful sources",
    note: "Connect specific answers to information people and search systems can verify.",
  },
  {
    icon: Sparkles,
    label: "A clearer answer",
    note: "Test real answers separately. Technical readiness alone does not establish visibility.",
  },
];
export function LumenFlow() {
  const [active, setActive] = useState(0);
  return (
    <div className="lumen-flow">
      <div className="flow-heading">
        <span className="micro">FROM INFORMATION TO UNDERSTANDING</span>
        <ArrowUpRight size={18} aria-hidden="true" />
      </div>
      <div className="flow-canvas">
        <svg viewBox="0 0 560 390" aria-hidden="true" className="flow-lines">
          <defs>
            <linearGradient id="lumen-gradient">
              <stop stopColor="#739e86" />
              <stop offset="1" stopColor="#edc38b" />
            </linearGradient>
          </defs>
          <path d="M108 86 C280 86 280 174 438 174 M108 274 C270 274 280 174 438 174 M108 86 C108 180 108 190 108 274" />
          <path className="light-trace" d="M108 86 C280 86 280 174 438 174" />
          <circle cx="280" cy="174" r="79" className="flow-orbit" />
          <circle cx="280" cy="174" r="110" className="flow-orbit outer" />
        </svg>
        {nodes.map(({ icon: Icon, label }, index) => (
          <button
            key={label}
            type="button"
            className={
              "flow-node flow-node-" +
              index +
              (active === index ? " selected" : "")
            }
            onMouseEnter={() => setActive(index)}
            onFocus={() => setActive(index)}
            onClick={() => setActive(index)}
            aria-pressed={active === index}
            aria-describedby="flow-description"
          >
            <Icon size={24} strokeWidth={1.5} aria-hidden="true" />
            <span>{label}</span>
            {index === 3 && <small>THE GOAL</small>}
          </button>
        ))}
        <div className="flow-core" aria-hidden="true">
          <img src="/logo.svg" width="52" height="52" alt="" />
        </div>
      </div>
      <div className="flow-caption" id="flow-description">
        <span className="flow-caption-number">0{active + 1}</span>
        <p>{nodes[active].note}</p>
      </div>
      <p className="flow-label">
        An illustration of our process, not a measured AI response.
      </p>
    </div>
  );
}
