import {
  ArrowUpRight,
  ArrowRight,
  Check,
  Search,
  FileText,
  ChartNoAxesCombined,
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
            <span className="eyebrow-line" /> AI SEARCH & GROWTH
          </p>
          <h1 id="hero-title">
            Make your business
            <br />
            easier to find.
            <br />
            <em>Easier to choose.</em>
          </h1>
          <p className="hero-description">
            Your customers are asking new questions, in new places. We help your
            website, content, and messaging give them a better answer.
          </p>
          <div className="hero-actions">
            <BookingLink className="button button-dark" />
            <a className="text-link" href="#the-work">
              Explore the work <ArrowRight size={17} aria-hidden="true" />
            </a>
          </div>
          <p className="hero-footnote">
            A focused first project. A scope built around your business.
          </p>
        </div>
        <div
          className="hero-visual"
          aria-label="Illustrative diagram connecting a buyer question to useful sources and a plan"
        >
          <div className="visual-top">
            <span className="micro">CONTEXT, BROUGHT TO LIGHT</span>
            <span className="visual-dot" aria-hidden="true" />
          </div>
          <div className="question-note">
            <Search size={19} aria-hidden="true" />
            <p>
              “Which solution is right
              <br />
              for a business like mine?”
            </p>
          </div>
          <div className="light-field" aria-hidden="true">
            <svg viewBox="0 0 460 180" fill="none">
              <defs>
                <linearGradient
                  id="light-gradient"
                  x1="230"
                  y1="0"
                  x2="230"
                  y2="175"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#edc38b" stopOpacity=".9" />
                  <stop offset="1" stopColor="#edc38b" stopOpacity=".05" />
                </linearGradient>
              </defs>
              <path
                d="M230 0L43 174H417L230 0Z"
                fill="url(#light-gradient)"
                opacity=".12"
              />
              <path
                d="M230 0V167M230 0L72 167M230 0L388 167"
                stroke="url(#light-gradient)"
              />
              <ellipse
                cx="230"
                cy="143"
                rx="166"
                ry="30"
                stroke="#ffffff"
                strokeOpacity=".1"
              />
              <ellipse
                cx="230"
                cy="111"
                rx="129"
                ry="24"
                stroke="#ffffff"
                strokeOpacity=".07"
              />
              <circle
                cx="230"
                cy="80"
                r="29"
                fill="#242b2b"
                stroke="#edc38b"
                strokeOpacity=".65"
              />
              <path
                d="M243 69A17 17 0 1 0 243 91M239 86H243V91"
                stroke="#edc38b"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M251 68V81H260"
                stroke="#edc38b"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="72" cy="167" r="4" fill="#edc38b" />
              <circle cx="230" cy="167" r="4" fill="#edc38b" />
              <circle cx="388" cy="167" r="4" fill="#edc38b" />
            </svg>
          </div>
          <div className="signal-labels">
            <span>Useful content</span>
            <span>Credible sources</span>
            <span>Clear messaging</span>
          </div>
          <div className="visual-bottom">
            <span className="micro">THE STARTING POINT</span>
            <p>
              Understand the question.
              <br />
              <strong>Make the next step clear.</strong>
            </p>
            <span className="visual-example">Illustrative</span>
          </div>
        </div>
      </div>
      <div className="container hero-bottom">
        <span>WHERE WE CAN HELP</span>
        <div>
          <span>AI search visibility</span>
          <span>Website & content</span>
          <span>Customer research</span>
          <span>Campaign direction</span>
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
          <p className="eyebrow">01 / START WITH CONTEXT</p>
          <div>
            <h2>
              What are your customers
              <br />
              <em>really looking for?</em>
            </h2>
            <p>
              Someone comparing solutions needs more than a list of features.
              They need to understand whether your business fits their
              situation, and why they should trust it.
            </p>
          </div>
        </div>
        <div className="approach-grid">
          <div className="approach-text">
            <h3>
              The question shapes
              <br />
              the work.
            </h3>
            <p>
              We look at your website, the questions buyers ask, and the
              evidence your team already has. Then we identify where the answer
              is missing, unclear, or hard to find.
            </p>
            <p>
              That gives us a practical place to start: the right page, a
              stronger explanation, or a message worth testing.
            </p>
            <a className="text-link" href="#consultation">
              Talk through your priorities{" "}
              <ArrowUpRight size={18} aria-hidden="true" />
            </a>
            <div className="approach-note">
              <span className="micro">OUR WORKING PRINCIPLE</span>
              <p>
                A recommendation should
                <br />
                have a reason behind it.
              </p>
            </div>
          </div>
          <EvidenceDemo />
        </div>
      </div>
    </section>
  );
}

function Services() {
  return (
    <section id="services" className="services-section section-pad">
      <div className="container services-grid">
        <div className="services-intro">
          <p className="eyebrow">02 / CONNECT THE WORK</p>
          <h2>
            From discovery
            <br />
            <em>to a decision.</em>
          </h2>
          <p>
            We bring research, search, and messaging together around the people
            you want to reach.
          </p>
        </div>
        <div className="service-list">
          <article>
            <span className="service-number">01</span>
            <div>
              <span className="micro">AEO / GEO</span>
              <h3>AI search visibility</h3>
              <p>
                Find the questions that matter, inspect the answers and
                citations, and improve the public information that helps buyers
                understand your business.
              </p>
              <div className="service-tags">
                <span>Search baselines</span>
                <span>Content & technical reviews</span>
              </div>
            </div>
            <Search size={22} aria-hidden="true" />
          </article>
          <article>
            <span className="service-number">02</span>
            <div>
              <span className="micro">RESEARCH / CONTENT</span>
              <h3>A clearer reason to choose you</h3>
              <p>
                Use customer conversations, reviews, and product evidence to
                strengthen your pages, explain your offer, and address the
                questions that hold a purchase back.
              </p>
              <div className="service-tags">
                <span>Buyer research</span>
                <span>Website messaging</span>
              </div>
            </div>
            <FileText size={22} aria-hidden="true" />
          </article>
          <article>
            <span className="service-number">03</span>
            <div>
              <span className="micro">STRATEGY / CAMPAIGNS</span>
              <h3>A better-informed next campaign</h3>
              <p>
                Turn the research into campaign angles, landing-page direction,
                and a measurement plan. Scope paid campaign support around your
                account access and budget.
              </p>
              <div className="service-tags">
                <span>Campaign planning</span>
                <span>Implementation support</span>
              </div>
            </div>
            <ChartNoAxesCombined size={22} aria-hidden="true" />
          </article>
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
          <p className="eyebrow">03 / WHAT YOU RECEIVE</p>
          <div>
            <h2>
              A clear record.
              <br />
              <em>Work you can use.</em>
            </h2>
            <p>
              You should be able to see what we found, understand what we
              recommend, and know exactly what changed.
            </p>
          </div>
        </div>
        <div className="deliverable-grid">
          {deliverables.map((item, i) => {
            const Icon = [Search, FileText, ChartNoAxesCombined][i];
            return (
              <article className="deliverable-card" key={item.number}>
                <div className="deliverable-top">
                  <Icon size={25} strokeWidth={1.5} aria-hidden="true" />
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
      when: "UNDERSTAND",
      title: "Choose a useful starting point.",
      text: "Agree the audience, product or service, and business goal. Review the relevant pages, sources, and questions to establish a baseline.",
    },
    {
      when: "IMPROVE",
      title: "Make the right changes.",
      text: "Prioritise the findings together. Work on the approved content, technical improvements, or campaign direction, with a clear owner for each task.",
    },
    {
      when: "REVIEW",
      title: "Measure and decide what’s next.",
      text: "Repeat the agreed checks, review the results, and document the limitations. Decide whether to continue, adjust the approach, or focus elsewhere.",
    },
  ];
  return (
    <section id="process" className="process-section section-pad">
      <div className="container">
        <div className="section-heading">
          <p className="eyebrow">04 / HOW WE WORK</p>
          <div>
            <h2>
              Start focused.
              <br />
              <em>Build from what you learn.</em>
            </h2>
          </div>
        </div>
        <div className="process-grid">
          {steps.map((step, i) => (
            <article key={step.when}>
              <div className="process-rule">
                <span>{String(i + 1).padStart(2, "0")}</span>
                <ArrowRight size={18} aria-hidden="true" />
              </div>
              <p className="micro">{step.when}</p>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
        <div className="team-note">
          <span className="micro">THE TEAM BEHIND THE WORK</span>
          <p>
            Founded by NJIT alumni. You work directly with the team doing the
            research and implementation.
          </p>
        </div>
      </div>
    </section>
  );
}

function Consultation() {
  return (
    <section id="consultation" className="consultation-section section-pad">
      <div className="container consultation-grid">
        <div className="consultation-intro">
          <p className="eyebrow">05 / FIND THE RIGHT FIT</p>
          <h2>
            Your priorities.
            <br />
            <em>A project that fits.</em>
          </h2>
          <p>
            Tell us about your business and where you want to improve. We’ll
            discuss a focused first engagement, then send a proposal with the
            scope, timing, and fees.
          </p>
          <div className="fit-note">
            <span className="micro">A GOOD PLACE TO START</span>
            <ul>
              <li>A product or service customers actively compare.</li>
              <li>A website with room for clearer answers.</li>
              <li>A team ready to put the findings into action.</li>
            </ul>
          </div>
        </div>
        <article className="consultation-card">
          <div className="consultation-card-top">
            <span className="micro">WORK WITH {site.name.toUpperCase()}</span>
            <span className="card-badge">Let’s talk</span>
          </div>
          <h3>
            What would a useful
            <br />
            first project look like?
          </h3>
          <p>Let’s work that out together.</p>
          <ul className="consultation-inclusions">
            {[
              "Your audience and business goals",
              "Where customers discover and compare you",
              "The work that would make the most difference",
              "A scope, timeline, and fee to review",
            ].map((item) => (
              <li key={item}>
                <Check size={18} aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
          <BookingLink className="button button-dark" />
          <p className="card-fine">
            Fees are agreed in your proposal. Any advertising spend is budgeted
            separately.
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
          <p className="eyebrow">BEFORE WE TALK</p>
          <h2>
            A few questions,
            <br />
            <em>answered.</em>
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
            Understand the context.
            <br />
            Make the opportunity clear.
          </p>
          <a className="text-link" href="#top">
            Back to top <ArrowUpRight size={18} aria-hidden="true" />
          </a>
        </div>
        <div className="footer-bottom">
          <span>© 2026 {site.name}</span>
          <span>AI search visibility · Research · Campaign direction</span>
          <a href="#privacy">Privacy & contact</a>
        </div>
        <details className="privacy-details" id="privacy">
          <summary>Privacy & contact</summary>
          <p>
            {site.bookingUrl
              ? "Scheduling opens in a new tab. The scheduling provider and meeting organiser use the details you submit to arrange your call."
              : "Email links open your email app. We use the information you send to respond to your enquiry and arrange a conversation."}{" "}
            This website does not collect enquiries through a form or use
            advertising tracking scripts. The hosting provider may process
            technical access logs to operate the website. Please leave
            confidential customer information out of your initial message. For
            privacy questions, contact{" "}
            <a href={"mailto:" + site.email}>{site.email}</a>.
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
        <Services />
        <Deliverables />
        <Process />
        <Consultation />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
