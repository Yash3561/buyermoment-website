import { useState, type FormEvent } from "react";
import { ArrowUpRight, Check, Copy, Download, Mail } from "lucide-react";
import { site } from "../content";
export function Contact() {
  const [brief, setBrief] = useState("");
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  function prepare(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const text = `BuyerMoment sprint enquiry\n\nName: ${data.get("name")}\nEmail: ${data.get("email")}\nWebsite: ${data.get("website") || "Not provided"}\n\nWhat we want to work on:\n${data.get("goal")}\n\nInterested in the $750 seven-day research and planning sprint.`;
    setBrief(text);
    setCopied(false);
    setCopyError(false);
    if (site.email)
      window.location.href = `mailto:${site.email}?subject=${encodeURIComponent("Let’s talk about a BuyerMoment sprint")}&body=${encodeURIComponent(text)}`;
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(brief);
      setCopied(true);
      setCopyError(false);
    } catch {
      setCopyError(true);
    }
  }
  function download() {
    const url = URL.createObjectURL(
      new Blob([brief], { type: "text/plain;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "buyermoment-enquiry.txt";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <section id="contact" className="contact-section section-pad">
      <div className="container contact-grid">
        <div>
          <p className="eyebrow">LET’S FIND YOUR NEXT ANGLE</p>
          <h2>
            Tell us what
            <br />
            you’re working on<span className="lime">.</span>
          </h2>
          <p className="contact-copy">
            A product you believe in. A campaign that isn’t clicking. A pile of
            customer notes nobody has had time to read. Start there.
          </p>
          <div className="contact-detail">
            <span className="detail-rule" />
            <p>
              We’ll review the fit, agree the scope,
              <br />
              and decide on a start date together.
            </p>
          </div>
          {site.bookingUrl && (
            <a
              className="text-link"
              href={site.bookingUrl}
              target="_blank"
              rel="noreferrer"
            >
              Book a conversation <ArrowUpRight size={18} />
            </a>
          )}
        </div>
        <form className="contact-form" onSubmit={prepare}>
          <div className="form-row">
            <label>
              Your name
              <input
                name="name"
                autoComplete="name"
                placeholder="Alex Morgan"
                required
                maxLength={100}
              />
            </label>
            <label>
              Work email
              <input
                name="email"
                type="email"
                autoComplete="email"
                placeholder="alex@company.com"
                required
                maxLength={200}
              />
            </label>
          </div>
          <label>
            Company website <span className="optional">(optional)</span>
            <input
              name="website"
              type="url"
              autoComplete="url"
              placeholder="https://yourcompany.com"
              maxLength={300}
            />
          </label>
          <label>
            What would you like to figure out?
            <textarea
              name="goal"
              placeholder="We’re launching a new product and want to know which message to test first…"
              required
              rows={3}
              maxLength={1800}
            />
          </label>
          <button className="button button-lime form-submit" type="submit">
            {site.email ? "Continue in email" : "Prepare your enquiry"}{" "}
            <ArrowUpRight size={18} aria-hidden="true" />
          </button>
          <p className="form-note">
            {site.email
              ? "Opens an email draft for you to review and send. No payment or commitment."
              : "Email enquiries are being set up. You can prepare and save your brief here; nothing is sent."}
          </p>
          {brief && (
            <div className="brief-result" role="status">
              <p>
                {site.email
                  ? "Your email draft is ready. Send it from your email app, or copy the brief below."
                  : "Your brief is ready to save. It has not been sent."}
              </p>
              <div className="brief-actions">
                <button type="button" onClick={copy}>
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? "Copied" : "Copy brief"}
                </button>
                <button type="button" onClick={download}>
                  <Download size={16} />
                  Save brief
                </button>
                {site.email && (
                  <a
                    href={`mailto:${site.email}?subject=BuyerMoment%20sprint&body=${encodeURIComponent(brief)}`}
                  >
                    <Mail size={16} />
                    Open email
                  </a>
                )}
              </div>
              {copyError && (
                <p>
                  Copy was unavailable. Use “Save brief” to download it instead.
                </p>
              )}
            </div>
          )}
          <p className="privacy-note">
            Please leave out confidential customer information.{" "}
            <a href="#privacy">How this form works</a>
          </p>
        </form>
      </div>
    </section>
  );
}
