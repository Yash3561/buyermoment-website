import { useId, useState } from "react";
import { ArrowDown, ArrowUpRight, Quote } from "lucide-react";
import { examples } from "../content";
export function EvidenceDemo() {
  const [selected, setSelected] = useState(0);
  const id = useId();
  const example = examples[selected];
  const [before, after] = example.quote.split(example.highlight);
  return (
    <div className="evidence-demo">
      <div className="example-toolbar">
        <span className="micro">A LOOK AT THE THINKING</span>
        <span className="example-badge">Illustrative example</span>
      </div>
      <div
        className="example-controls"
        role="group"
        aria-label="Choose an example business"
      >
        {examples.map((item, index) => (
          <button
            key={item.name}
            aria-pressed={selected === index}
            aria-controls={id}
            onClick={() => setSelected(index)}
          >
            {item.name}
          </button>
        ))}
      </div>
      <div
        id={id}
        className="example-content"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="quote-source">
          <Quote size={21} aria-hidden="true" />
          <span>{example.source}</span>
          <span className="note-index">01 / INPUT</span>
        </div>
        <blockquote>
          “{before}
          <mark>{example.highlight}</mark>
          {after}”
        </blockquote>
        <div className="interpretation">
          <span className="annotation-line" aria-hidden="true" />
          <span>{example.signal}</span>
        </div>
        <div className="example-flow" aria-hidden="true">
          <ArrowDown size={22} />
          <span>Turn the hesitation into an angle</span>
        </div>
        <div className="campaign-note">
          <div className="micro">02 / CAMPAIGN DIRECTION</div>
          <h3>{example.angle}</h3>
          <p>{example.test}</p>
          <div className="measurement">
            <span>Measure</span>
            <strong>{example.measure}</strong>
            <ArrowUpRight size={18} aria-hidden="true" />
          </div>
        </div>
        <p className="example-caveat">To validate: {example.check}</p>
      </div>
    </div>
  );
}
