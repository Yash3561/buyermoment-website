import {
  ArrowUpRight,
  ArrowRight,
  Check,
  MessageSquareText,
  ScanLine,
  FileText,
  MoveUpRight,
} from "lucide-react";
import { Header } from "./components/Header";
import { Brand } from "./components/Brand";
import { EvidenceDemo } from "./components/EvidenceDemo";
import { Contact } from "./components/Contact";
import { BookingLink } from "./components/BookingLink";
import { deliverables, faqs, site } from "./content";

function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="container hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="eyebrow-line" />
            CUSTOMER RESEARCH. CAMPAIGN DIRECTION.
          </p>
          <h1 id="hero-title">
            Find the reason
            <br />
            they{" "}
            <span className="hero-buy">
              buy
              <svg viewBox="0 0 210 18" aria-hidden="true">
                <path d="M3 12C48 3 107 2 204 6M22 16C78 8 141 8 187 10" />
              </svg>
            </span>
            <span className="lime">.</span>
          </h1>
          <p className="hero-description">
            Your next campaign is hiding in your customer conversations. We find
            the message, shape the angles, and map out what to test.
          </p>
          <div className="hero-actions">
            <BookingLink className="button button-lime" />
            <a className="text-link" href="#the-work">
              See the work <ArrowRight size={17} aria-hidden="true" />
            </a>
          </div>
          <p className="hero-footnote">
            A hands-on, seven-day sprint. Built around your business.
          </p>
        </div>
        <div
          className="hero-brief"
          aria-label="Illustration of a buyer insight"
        >
          <div className="brief-top">
            <span className="micro">BUYER NOTE / 001</span>
            <span className="micro">ILLUSTRATIVE</span>
          </div>
          <div className="brief-quote">
            <span className="quote-mark" aria-hidden="true">
              “
            </span>
            <p>
              I know what it does.
              <br />I need to know
              <br />
              <mark>why it’s right for me.</mark>
            </p>
          </div>
          <div className="brief-annotation">
            <span className="hand-line" aria-hidden="true" />
            <span>There’s your starting point.</span>
          </div>
          <div className="brief-bottom">
            <span>
              From something said.
              <br />
              <strong>To something worth testing.</strong>
            </span>
            <span className="brief-arrow">
              <MoveUpRight size={30} strokeWidth={1.25} aria-hidden="true" />
            </span>
          </div>
          <span className="brief-stamp">
            READ BETWEEN
            <br />
            THE LINES.
          </span>
        </div>
      </div>
      <div className="container hero-bottom">
        <span>THE INPUT IS ALREADY THERE</span>
        <div>
          <span>Sales calls</span>
          <span>Customer reviews</span>
          <span>Support conversations</span>
          <span>Interview notes</span>
        </div>
      </div>
    </section>
  );
}
function Approach() {
  return (
    <section id="approach" className="approach-section section-pad">
      <div className="container">
        <div className="section-heading">
          <p className="eyebrow">01 / THE APPROACH</p>
          <div>
            <h2>
              Before you spend more,
              <br />
              understand <em>what matters.</em>
            </h2>
            <p>
              Customers tell you why they hesitate, what they compare, and what
              finally makes them choose. Those details should shape the next
              campaign.
            </p>
          </div>
        </div>
        <div className="approach-grid">
          <div className="approach-text">
            <h3>
              Less guessing.
              <br />A better starting point.
            </h3>
            <p>
              We read the material your team already has, look for recurring
              patterns, and turn them into a clear creative direction.
            </p>
            <p>
              You see the evidence behind the recommendation—and the questions
              that still need an answer.
            </p>
            <a className="text-link dark-link" href="#consultation">
              Explore the sprint <ArrowUpRight size={18} aria-hidden="true" />
            </a>
            <div className="approach-note">
              <span className="micro">OUR WORKING PRINCIPLE</span>
              <p>
                Every angle should have
                <br />a reason behind it.
              </p>
            </div>
          </div>
          <EvidenceDemo />
        </div>
      </div>
    </section>
  );
}
function Deliverables() {
  return (
    <section id="the-work" className="deliverables-section section-pad">
      <div className="container">
        <div className="section-heading">
          <p className="eyebrow">02 / WHAT YOU TAKE AWAY</p>
          <div>
            <h2>
              Useful work.
              <br />
              Ready for your next move.
            </h2>
            <p>
              A focused set of deliverables your founder, marketer, or creative
              team can actually put to work.
            </p>
          </div>
        </div>
        <div className="deliverable-grid">
          {deliverables.map((item, i) => {
            const Icon = [MessageSquareText, ScanLine, FileText][i];
            return (
              <article className="deliverable-card" key={item.number}>
                <div className="deliverable-top">
                  <Icon size={26} strokeWidth={1.4} aria-hidden="true" />
                  <span>{item.number}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <div className="deliverable-detail">{item.detail}</div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
function Process() {
  const steps = [
    {
      when: "DAY 1",
      title: "Get close to the business.",
      text: "We agree one product, one audience, the question to answer, and the customer material to review.",
    },
    {
      when: "DAYS 2–4",
      title: "Find the useful patterns.",
      text: "We identify recurring language, buying triggers, and objections. Then we check which ideas the evidence supports.",
    },
    {
      when: "DAYS 5–7",
      title: "Make the next test clear.",
      text: "We walk through your brief, campaign angles, and test plan together. You leave knowing what to try and what to measure.",
    },
  ];
  return (
    <section className="process-section section-pad">
      <div className="container">
        <div className="section-heading">
          <p className="eyebrow">03 / HOW WE WORK</p>
          <div>
            <h2>
              One focused week.
              <br />A clearer way forward.
            </h2>
          </div>
        </div>
        <div className="process-grid">
          {steps.map((step, index) => (
            <article key={step.when}>
              <div className="process-rule">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <ArrowRight size={18} aria-hidden="true" />
              </div>
              <p className="micro">{step.when}</p>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
function Channels() {
  return (
    <section className="channels-section">
      <div className="container channels-grid">
        <div>
          <p className="eyebrow">THE MESSAGE COMES FIRST</p>
          <h2>
            Different channels.
            <br />
            <em>The same buyer.</em>
          </h2>
          <p>
            A good angle can inform more than one place your customers discover
            you. We help decide where it belongs first.
          </p>
        </div>
        <div className="channel-list">
          <article>
            <span className="channel-number">01</span>
            <div>
              <h3>Paid social & search</h3>
              <p>
                Messaging and test direction for Meta and Google, with a
                proposed measurement plan.
              </p>
            </div>
            <span className="channel-tag">CAMPAIGN PLANNING</span>
          </article>
          <article>
            <span className="channel-number">02</span>
            <div>
              <h3>AI search visibility</h3>
              <p>
                Questions, content gaps, and source opportunities to explore
                through AEO and GEO.
              </p>
            </div>
            <span className="channel-tag">OPTIONAL BRIEF</span>
          </article>
          <article>
            <span className="channel-number">03</span>
            <div>
              <h3>Emerging ad platforms</h3>
              <p>
                Assess ChatGPT Ads and other placements as advertiser access and
                business fit allow.
              </p>
            </div>
            <span className="channel-tag">ACCESS DEPENDENT</span>
          </article>
        </div>
      </div>
    </section>
  );
}
function Consultation() {
  return (
    <section id="consultation" className="pricing-section section-pad">
      <div className="container pricing-grid">
        <div className="pricing-intro">
          <p className="eyebrow">04 / START WITH A CONVERSATION</p>
          <h2>
            Your business first.
            <br />
            <em>A plan that fits.</em>
          </h2>
          <p>
            Tell us where you want to go and what is getting in the way. We’ll
            discuss the right scope and pricing together, then put the details
            in a proposal for you to review.
          </p>
          <div className="fit-note">
            <span className="micro">A GOOD FIT IF</span>
            <ul>
              <li>You have customer conversations or reviews to learn from.</li>
              <li>You want to test a specific product or offer.</li>
              <li>You can put the recommendations into action.</li>
            </ul>
          </div>
        </div>
        <article className="price-card">
          <div className="price-card-top">
            <span className="micro">WORK WITH {site.name.toUpperCase()}</span>
            <span className="price-badge">Let’s talk</span>
          </div>
          <h3 className="consultation-title">Let’s find your next move.</h3>
          <p className="price-summary">
            A conversation about your business, before a commitment.
          </p>
          <ul className="price-inclusions">
            {[
              "Your product, audience, and growth goals",
              "The customer evidence you already have",
              "Where research or campaign support would help",
              "A scope, timeline, and fee that fit the work",
            ].map((item) => (
              <li key={item}>
                <Check size={18} aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
          <BookingLink className="button button-dark" />
          <p className="price-fine">
            Pricing is discussed in the meeting. You approve the written scope
            and fees before any work starts. Media spend is agreed separately.
          </p>
        </article>
      </div>
    </section>
  );
}
function FAQ() {
  return (
    <section id="questions" className="faq-section section-pad">
      <div className="container faq-grid">
        <div>
          <p className="eyebrow">A FEW THINGS YOU MIGHT ASK</p>
          <h2>
            Good questions.
            <br />
            Straight answers.
          </h2>
        </div>
        <div className="faq-list">
          {faqs.map((faq) => (
            <details key={faq.question}>
              <summary>
                {faq.question}
                <span className="faq-plus" aria-hidden="true">
                  +
                </span>
              </summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <Brand />
          <p>
            Customer language.
            <br />
            Better campaign decisions.
          </p>
          <a className="text-link" href="#top">
            Back to top <ArrowUpRight size={18} aria-hidden="true" />
          </a>
        </div>
        <div className="footer-bottom">
          <span>© 2026 {site.name}</span>
          <span>Research → Direction → Your next test</span>
          <a href="#privacy">Privacy & contact</a>
        </div>
        <details className="privacy-details" id="privacy">
          <summary>How booking works</summary>
          <p>
            Booking opens Calendly in a new tab. Details you enter there are
            handled by Calendly and the meeting organiser to arrange your call.
            Please leave out confidential customer information. This website
            does not collect booking details itself. The hosting provider may
            process technical access logs to operate this website.
          </p>
        </details>
      </div>
    </footer>
  );
}
export default function App() {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <div id="top" />
      <Header />
      <main id="main-content">
        <Hero />
        <Approach />
        <Deliverables />
        <Process />
        <Channels />
        <Consultation />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
