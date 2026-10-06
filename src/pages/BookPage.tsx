import { useState } from "react";
import { ArrowUpRight, CalendarDays, Check, Copy, Mail } from "lucide-react";
import { site, contactEmailUrl } from "../content";

export function BookPage() {
  const [loaded, setLoaded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  async function copy() {
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
    <section className="container booking-page">
      <div className="booking-intro">
        <p className="eyebrow">LET’S TALK</p>
        <h1>
          A useful first
          <br />
          conversation.
        </h1>
        <p className="page-intro">
          Bring your website and a question. We’ll discuss what you want buyers
          to find, where the gaps might be, and whether a focused pilot makes
          sense.
        </p>
        <ol className="meeting-agenda">
          <li>
            <span>01</span>
            <p>Your audience and priorities</p>
          </li>
          <li>
            <span>02</span>
            <p>A practical starting scope</p>
          </li>
          <li>
            <span>03</span>
            <p>Next steps, responsibilities, and fees</p>
          </li>
        </ol>
        <p className="meeting-note">
          No obligation to start a project. No website access needed for this
          conversation.
        </p>
        <a className="text-link" href="/audit">
          Prefer to start with an audit?{" "}
          <ArrowUpRight size={17} aria-hidden="true" />
        </a>
      </div>
      <div className="meeting-card">
        <span className="icon-box">
          <CalendarDays size={24} aria-hidden="true" />
        </span>
        <p className="micro">
          {site.bookingUrl ? "CHOOSE A TIME" : "MEETING REQUEST"}
        </p>
        <h2>
          {site.bookingUrl
            ? "Find a time that works."
            : "Talk directly with Yash."}
        </h2>
        {site.bookingUrl ? (
          <>
            <p>
              Use our calendar to choose an available time. Times are shown in
              your local timezone.
            </p>
            <a className="meeting-email-option" href={contactEmailUrl}>
              No suitable time? Request a meeting by email
              <Mail size={17} aria-hidden="true" />
            </a>
            {loaded ? (
              <iframe
                className="calendar-embed"
                src={
                  site.bookingUrl +
                  "?embed_type=Inline&embed_domain=www.contextlumen.com"
                }
                title="Book a ContextLumen introductory meeting with Calendly"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            ) : (
              <div className="calendar-consent">
                <p>
                  The calendar is provided by Calendly. Loading it connects to
                  Calendly, which may use cookies and process booking details.
                </p>
                <button
                  className="button button-dark"
                  type="button"
                  onClick={() => setLoaded(true)}
                >
                  Load booking calendar{" "}
                  <CalendarDays size={17} aria-hidden="true" />
                </button>
              </div>
            )}
            <a
              className="text-link"
              href={site.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open calendar in a new tab{" "}
              <ArrowUpRight size={17} aria-hidden="true" />
            </a>
          </>
        ) : (
          <>
            <p>
              Send your website, what you’d like help with, and two or three
              times that work for you. We’ll confirm a meeting by email.
            </p>
            <a className="button button-dark" href={contactEmailUrl}>
              Request a meeting <Mail size={17} aria-hidden="true" />
            </a>
            <p className="form-note">
              Scheduling is currently handled by email. Opening this link does
              not send a message or reserve a time.
            </p>
          </>
        )}
        <div className="meeting-email">
          <a href={"mailto:" + site.email}>{site.email}</a>
          <button
            className="copy-button"
            type="button"
            aria-label="Copy contact email"
            onClick={copy}
          >
            {copied ? <Check size={17} /> : <Copy size={17} />}
          </button>
        </div>
        <p className="form-note" aria-live="polite">
          {copied
            ? "Email address copied."
            : copyError
              ? "Please select and copy the email above."
              : "Prefer email? Get in touch directly."}
        </p>
      </div>
    </section>
  );
}
