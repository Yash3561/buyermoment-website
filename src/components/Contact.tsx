import { ArrowUpRight, CalendarDays, Mail } from "lucide-react";
import { contactEmailUrl, site } from "../content";

export function Contact() {
  return (
    <section id="contact" className="contact-section section-pad">
      <div className="container contact-grid">
        <div>
          <p className="eyebrow">LET’S FIND YOUR NEXT ANGLE</p>
          <h2>
            Start with
            <br />a conversation<span className="lime">.</span>
          </h2>
          <p className="contact-copy">
            Bring your product, your goals, and the question you keep coming
            back to. We’ll talk through where we can help, what the work
            involves, and what it would cost.
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
          <p className="micro">MEET THE MOTIVORY TEAM</p>
          <h3>Let’s talk about your business.</h3>
          <p>
            {site.bookingUrl
              ? "Choose a time on our calendar. We’ll use the meeting to understand your priorities and discuss a proposal that fits."
              : "Tell us a little about your business and what you’re working on. We’ll arrange a time to talk through your goals, scope, and pricing."}
          </p>
          {site.bookingUrl ? (
            <a
              className="button button-lime"
              href={site.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Book now <ArrowUpRight size={19} aria-hidden="true" />
            </a>
          ) : (
            <>
              <a
                className="button button-lime"
                href={contactEmailUrl}
              >
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
              Opens Calendly in a new tab. Booking a call does not commit you to
              a project.
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
