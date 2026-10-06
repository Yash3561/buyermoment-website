import { ArrowUpRight, CalendarDays, Mail } from "lucide-react";
import { contactEmailUrl, site } from "../content";

export function Contact() {
  return (
    <section id="contact" className="contact-section section-pad">
      <div className="container contact-grid">
        <div>
          <p className="eyebrow">LET’S FIND YOUR STARTING POINT</p>
          <h2>
            Start with
            <br />a conversation<span className="accent">.</span>
          </h2>
          <p className="contact-copy">
            Share your website and what you want to improve. We’ll talk through
            where we can help and what a useful first project would involve.
          </p>
          <div className="contact-detail">
            <span className="detail-rule" />
            <p>
              A clear scope. Transparent fees.
              <br />
              Agreed together before we begin.
            </p>
          </div>
        </div>
        <div className="booking-card">
          {site.bookingUrl ? (
            <CalendarDays size={32} strokeWidth={1.4} aria-hidden="true" />
          ) : (
            <Mail size={32} strokeWidth={1.4} aria-hidden="true" />
          )}
          <p className="micro">MEET THE {site.name.toUpperCase()} TEAM</p>
          <h3>Let’s talk about your business.</h3>
          <p>
            {site.bookingUrl
              ? "Choose a time on our calendar. We’ll use the meeting to understand your priorities and discuss a proposal that fits."
              : "Tell us a little about your business and what you’re working on. We’ll arrange a time to talk through your goals, scope, and pricing."}
          </p>
          {site.bookingUrl ? (
            <a
              className="button button-accent"
              href={site.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Book now <ArrowUpRight size={19} aria-hidden="true" />
            </a>
          ) : (
            <>
              <a className="button button-accent" href={contactEmailUrl}>
                Email us <ArrowUpRight size={19} aria-hidden="true" />
              </a>
              <p className="form-note">
                <a href={contactEmailUrl}>{site.email}</a>
                <br />
                Opens your email app. Prefer webmail? Copy the address above.
              </p>
            </>
          )}
          {site.bookingUrl && (
            <p className="form-note">
              Opens our scheduling page in a new tab. Booking a call does not
              commit you to a project.
            </p>
          )}
          <a className="booking-privacy" href="#privacy">
            Privacy & contact
          </a>
        </div>
      </div>
    </section>
  );
}
