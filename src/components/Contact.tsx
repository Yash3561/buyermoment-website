import { useState } from "react";
import { ArrowUpRight, Check, Copy, Mail, CalendarDays } from "lucide-react";
import { contactEmailUrl, site } from "../content";

export function Contact() {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
      setCopyError(false);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopyError(true);
    }
  }
  return (
    <section
      id="contact"
      className="contact-section section-pad"
      aria-labelledby="contact-title"
    >
      <div className="container contact-grid">
        <div>
          <p className="eyebrow">LET’S TALK ABOUT YOUR WEBSITE</p>
          <h2 id="contact-title">
            Bring us a question.
            <br />
            We’ll find a starting point.
          </h2>
          <p className="contact-copy">
            Send your website, the customers you want to reach, and the part of
            your marketing that isn’t working. You’ll speak with the team doing
            the work. No sales handoff.
          </p>
          <p className="contact-terms">
            Scope and fees are agreed before work begins.
            <br />
            Advertising spend is always separate.
          </p>
        </div>
        <div className="booking-card">
          <div className="contact-card-heading">
            <span className="icon-box">
              {site.bookingUrl ? (
                <CalendarDays size={22} aria-hidden="true" />
              ) : (
                <Mail size={22} aria-hidden="true" />
              )}
            </span>
            <span className="micro">YOUR FIRST CONVERSATION</span>
          </div>
          <h3>A useful place to start.</h3>
          <p>
            Tell us what you’re trying to achieve. We’ll discuss whether a
            focused search visibility pilot is the right fit.
          </p>
          <a className="button button-accent" href="/book">
            Book a conversation
            <ArrowUpRight size={18} aria-hidden="true" />
          </a>
          <div className="contact-email-row">
            <a href={contactEmailUrl}>{site.email}</a>
            <button
              className="copy-button"
              type="button"
              onClick={copyEmail}
              aria-label="Copy email address"
            >
              {copied ? (
                <Check size={16} aria-hidden="true" />
              ) : (
                <Copy size={16} aria-hidden="true" />
              )}
            </button>
          </div>
          <p className="form-note" aria-live="polite">
            {copied
              ? "Email address copied."
              : copyError
                ? "Please select and copy the email address above."
                : site.bookingUrl
                  ? "Choose a time on our booking page. No commitment to a project."
                  : "See meeting details or request a time by email."}
          </p>
          <a className="booking-privacy" href="#privacy">
            How we handle enquiries
          </a>
        </div>
      </div>
    </section>
  );
}
