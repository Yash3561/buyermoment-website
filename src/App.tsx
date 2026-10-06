import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Search,
  FileText,
  ChartNoAxesCombined,
  Globe2,
  ListChecks,
  Code2,
  Target,
  Plus,
} from "lucide-react";
import { Header } from "./components/Header";
import { Brand, BrandMark } from "./components/Brand";
import { Contact } from "./components/Contact";
import { BookingLink } from "./components/BookingLink";
import { AuditPage } from "./pages/AuditPage";
import { BookPage } from "./pages/BookPage";
import { SampleReportPage } from "./pages/SampleReportPage";
import { MethodologyPage } from "./pages/MethodologyPage";
import { PolicyPage } from "./pages/PolicyPage";
import { deliverables, faqs, site } from "./content";

const selfServeAuditAvailable = import.meta.env.VITE_AUDIT_ENABLED === "true";

function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="container hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="eyebrow-line" /> AI SEARCH VISIBILITY · CONTENT ·
            STRATEGY
          </p>
          <h1 id="hero-title">
            Your business.
            <br />A better answer.
          </h1>
          <p className="hero-description">
            When buyers ask AI what to choose, your website needs to do more
            than exist. We help it explain what you do, who it’s for, and why it
            belongs in the conversation.
          </p>
          <div className="hero-actions">
            <a className="button button-dark" href="/audit">
              {selfServeAuditAvailable
                ? "Start your free audit"
                : "See audit status"}{" "}
              <ArrowRight size={17} aria-hidden="true" />
            </a>
            <a className="text-link" href="/sample-report">
              See what the audit checks <ArrowRight size={17} aria-hidden="true" />
            </a>
          </div>
          <p className="hero-footnote">
            Independent team. Founded by NJIT alumni.
            <br />
            Research, implementation, and reporting. Not another dashboard.
          </p>
        </div>
        <div
          className="hero-study"
          aria-label="Illustrative buyer-question research example, not a measured client result"
        >
          <div className="study-header">
            <span className="micro">A QUESTION WORTH ANSWERING</span>
            <span className="example-label">ILLUSTRATIVE</span>
          </div>
          <div className="study-question">
            <Search size={20} aria-hidden="true" />
            <p>“Which agency can help our business show up in AI search?”</p>
          </div>
          <div className="study-rule">
            <span />
            The information behind an answer
            <span />
          </div>
          <div className="study-source">
            <span className="icon-box">
              <Globe2 size={20} aria-hidden="true" />
            </span>
            <div>
              <h3>Your public website</h3>
              <p>What you offer. Who you serve. How it works.</p>
            </div>
            <Check size={17} aria-hidden="true" />
          </div>
          <div className="study-source">
            <span className="icon-box">
              <FileText size={20} aria-hidden="true" />
            </span>
            <div>
              <h3>Evidence buyers can verify</h3>
              <p>Real work, specific details, credible sources.</p>
            </div>
            <Check size={17} aria-hidden="true" />
          </div>
          <div className="study-source">
            <span className="icon-box">
              <Target size={20} aria-hidden="true" />
            </span>
            <div>
              <h3>A clear next step</h3>
              <p>Enough context to make an informed choice.</p>
            </div>
            <Check size={17} aria-hidden="true" />
          </div>
          <div className="study-bottom">
            <BrandMark />
            <p>
              This is the work.
              <br />
              <strong>Make the answer easier to find and trust.</strong>
            </p>
          </div>
        </div>
      </div>
      <div className="container hero-bottom">
        <span>THE FOCUS</span>
        <p>
          Useful information for people.<span className="separator">/</span>
          Readable sources for search.<span className="separator">/</span>
          Evidence for every recommendation.
        </p>
      </div>
    </section>
  );
}

function Services() {
  const services = [
    {
      icon: Search,
      number: "01",
      label: "AI SEARCH / AEO & GEO",
      title: "Find the gaps in how buyers find you.",
      text: "We test questions your customers actually ask, record the answers and sources, and identify where your business is missing or misunderstood.",
      items: [
        "Buyer-question and competitor research",
        "Dated mentions and citation baselines",
        "Crawlability and source accuracy review",
      ],
      outcome: "A prioritised visibility assessment",
    },
    {
      icon: Code2,
      number: "02",
      label: "WEBSITE / CONTENT",
      title: "Give your best pages better answers.",
      text: "We improve the pages you already have: clearer service descriptions, useful FAQs, accurate business details, and technical fixes your team can review.",
      items: [
        "Service and product-page improvements",
        "Structured data where appropriate",
        "Approved code and content changes",
      ],
      outcome: "Implementation, not just a PDF",
    },
    {
      icon: ChartNoAxesCombined,
      number: "03",
      label: "RESEARCH / CAMPAIGN STRATEGY",
      title: "Turn buyer context into a stronger message.",
      text: "We use the research to shape campaign angles, landing-page copy, and a measurement plan. Paid campaign support is scoped separately, with confirmed account access.",
      items: [
        "Customer questions and objections",
        "Campaign and landing-page direction",
        "Measurement and tracking requirements",
      ],
      outcome: "A test plan tied to your business goal",
    },
  ];
  return (
    <section
      id="services"
      className="services-section section-pad"
      aria-labelledby="services-title"
    >
      <div className="container">
        <div className="section-heading">
          <div>
            <p className="eyebrow">01 / WHAT WE DO</p>
            <h2 id="services-title">
              Search has changed.
              <br />
              The work needs to change with it.
            </h2>
          </div>
          <p>
            We connect search research to practical website improvements. You
            work with one team from the first question to the final review.
          </p>
        </div>
        <div className="service-grid">
          {services.map(({ icon: Icon, ...item }) => (
            <article className="service-card" key={item.number}>
              <div className="service-top">
                <span className="icon-box">
                  <Icon size={23} strokeWidth={1.7} aria-hidden="true" />
                </span>
                <span className="service-number">{item.number}</span>
              </div>
              <p className="micro">{item.label}</p>
              <h3>{item.title}</h3>
              <p className="service-description">{item.text}</p>
              <ul>
                {item.items.map((x) => (
                  <li key={x}>
                    <Check size={15} aria-hidden="true" />
                    {x}
                  </li>
                ))}
              </ul>
              <div className="service-outcome">
                <span>{item.outcome}</span>
                <ArrowUpRight size={18} aria-hidden="true" />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function TheWork() {
  return (
    <section
      id="the-work"
      className="work-section section-pad"
      aria-labelledby="work-title"
    >
      <div className="container">
        <div className="section-heading">
          <div>
            <p className="eyebrow">02 / THE WORK, MADE CONCRETE</p>
            <h2 id="work-title">
              Better information.
              <br />
              Not more marketing noise.
            </h2>
          </div>
          <p>
            A missing answer is often a very fixable problem. Here’s what an
            improvement can look like. This is not a client result or a ranking
            claim.
          </p>
        </div>
        <div className="work-example">
          <div className="work-before">
            <p className="micro">A GENERIC SERVICE PAGE</p>
            <blockquote>
              “We deliver innovative solutions to help your business grow.”
            </blockquote>
            <p>
              It could describe almost anyone. A buyer still doesn’t know what
              the service includes, whether it fits, or what happens next.
            </p>
            <span className="example-label">ILLUSTRATIVE COPY</span>
          </div>
          <div className="work-after">
            <p className="micro">AN ANSWER-READY EXPLANATION</p>
            <h3>
              “We review your service pages, test how AI answers buyer
              questions, and implement approved improvements on your existing
              site.”
            </h3>
            <div className="answer-criteria">
              <span>
                <Check size={15} aria-hidden="true" />A specific service
              </span>
              <span>
                <Check size={15} aria-hidden="true" />A clear process
              </span>
              <span>
                <Check size={15} aria-hidden="true" />A defined scope
              </span>
            </div>
            <p>
              Every claim needs the business’s confirmation. Better wording is a
              starting point; discoverability still has to be tested.
            </p>
          </div>
        </div>
        <div className="deliverable-grid">
          {deliverables.map((item, i) => {
            const Icon = [Search, ListChecks, ChartNoAxesCombined][i];
            return (
              <article className="deliverable-card" key={item.number}>
                <div className="deliverable-top">
                  <Icon size={22} strokeWidth={1.7} aria-hidden="true" />
                  <span>{item.number}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <span className="deliverable-detail">{item.detail}</span>
              </article>
            );
          })}
        </div>
        <div className="work-report-link">
          <p>See how a finding becomes a practical next step.</p>
          <a className="text-link" href="/sample-report">
            Review the audit scope <ArrowRight size={17} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}

function Process() {
  const steps = [
    {
      name: "Define",
      title: "Pick a useful first project.",
      text: "One audience, one product or service, and a set of buyer questions. We agree the goal, scope, responsibilities, and fees before work begins.",
    },
    {
      name: "Baseline",
      title: "Record what’s there today.",
      text: "Save the answers, mentions, citations, source URLs, and dates. Review the relevant pages and flag findings with the evidence attached.",
    },
    {
      name: "Implement",
      title: "Make changes with your approval.",
      text: "Write the content, prepare the technical fixes, and hand over changes for review. Your team stays in control of what gets published.",
    },
    {
      name: "Retest",
      title: "Compare, then decide.",
      text: "Repeat the agreed tests and document what shipped, what changed, and what didn’t. AI answers vary; our report explains the limits of the comparison.",
    },
  ];
  return (
    <section
      id="process"
      className="process-section section-pad"
      aria-labelledby="process-title"
    >
      <div className="container">
        <div className="section-heading">
          <div>
            <p className="eyebrow">03 / HOW WE WORK</p>
            <h2 id="process-title">
              Start with a pilot.
              <br />
              Know what you’re paying for.
            </h2>
          </div>
          <p>
            No site migration by default. No open-ended retainer to start. A
            written scope, approved changes, and a dated report you can review.
          </p>
        </div>
        <div className="process-grid">
          {steps.map((s, i) => (
            <article key={s.name}>
              <div className="process-rule">
                <span>{String(i + 1).padStart(2, "0")}</span>
                <span className="micro">{s.name}</span>
              </div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </article>
          ))}
        </div>
        <div className="team-note">
          <div>
            <BrandMark />
            <span className="micro">A SMALL TEAM. DIRECT ACCOUNTABILITY.</span>
          </div>
          <div className="team-description">
            <p>
              Founded by NJIT alumni with an AI engineering background. The
              people researching your business are the people working on the
              improvements.
            </p>
            <a className="text-link" href={"mailto:" + site.email}>
              Talk directly with Yash Chaudhary{" "}
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
            <p className="team-affiliation-note">
              Independent agency. Not affiliated with or endorsed by NJIT.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  return (
    <section
      id="questions"
      className="faq-section section-pad"
      aria-labelledby="faq-title"
    >
      <div className="container faq-grid">
        <div>
          <p className="eyebrow">BEFORE WE TALK</p>
          <h2 id="faq-title">
            The practical
            <br />
            questions.
          </h2>
          <p className="faq-intro">
            If yours isn’t here,{" "}
            <a href={"mailto:" + site.email}>
              ask us directly <ArrowUpRight size={15} aria-hidden="true" />
            </a>
            .
          </p>
        </div>
        <div className="faq-list">
          {faqs.map((f) => (
            <details key={f.question}>
              <summary>
                {f.question}
                <Plus size={18} className="faq-plus" aria-hidden="true" />
              </summary>
              <p>{f.answer}</p>
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
            AI search visibility.
            <br />
            Practical work. A clear record.
          </p>
          <a className="text-link" href="#top">
            Back to top <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </div>
        <div className="footer-bottom">
          <span>© 2026 {site.name}</span>
          <a href={"mailto:" + site.email}>{site.email}</a>
          <nav aria-label="Footer">
            <a href="/methodology">Methodology</a>
            <a href="/privacy">Privacy</a>
            <a href="/terms">Audit terms</a>
          </nav>
        </div>
        <details className="privacy-details" id="privacy">
          <summary>Privacy & contact</summary>
          <p>
            Email links open your email app; nothing is sent automatically. We
            use what you send to respond to your enquiry. The free checker
            processes public website addresses. When online sign-in is enabled,
            your email and successful report are stored in your audit account
            with our authentication and database provider, Supabase. Public
            reports may also be cached in server memory for ten minutes. We do
            not subscribe audit users to marketing emails. Email us to request
            account or report deletion. Hosting providers may retain technical
            logs. There are no advertising pixels. If a booking calendar is
            available, it connects to Calendly only after you choose to load it
            or follow its external link. Please don’t send credentials or
            confidential client information. Contact{" "}
            <a href={"mailto:" + site.email}>{site.email}</a> with a privacy
            question. <a href="/privacy">Read the full privacy notice.</a>
          </p>
        </details>
      </div>
    </footer>
  );
}

export default function App({ path = "/" }: { path?: string }) {
  const page = path.replace(/\/+$/, "") || "/";
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div id="top" />
      <Header path={page} />
      <main id="main">
        {page === "/" ? (
          <>
            <Hero />
            <Services />
            <TheWork />
            <Process />
            <section className="audit-teaser section-pad">
              <div className="container audit-teaser-grid">
                <div>
                  <p className="eyebrow">A FIRST LOOK, ON US</p>
                  <h2>
                    See what your website
                    <br />
                    makes easy to find.
                  </h2>
                  <p>
                    Our free homepage audit checks crawl rules, readable
                    content, and page fundamentals. Each finding comes with
                    evidence and a next step.
                  </p>
                  <a className="button button-dark" href="/audit">
                    {selfServeAuditAvailable
                      ? "Start the free audit"
                      : "See audit status"}{" "}
                    <ArrowRight size={17} aria-hidden="true" />
                  </a>
                </div>
                <div className="audit-teaser-detail">
                  <Search size={30} strokeWidth={1.5} aria-hidden="true" />
                  <h3>A checklist, not a made-up score.</h3>
                  <p>
                    {selfServeAuditAvailable
                      ? "One successful audit per verified account. Public pages only. No changes to your website."
                      : "Self-service sign-in is being prepared. The audit will use public pages only and will not change your website."}
                  </p>
                  <p className="form-note">
                    This checks technical readiness. Actual AI mentions and
                    citations need a separate visibility study.
                  </p>
                </div>
              </div>
            </section>
            <FAQ />
            <Contact />
          </>
        ) : page === "/audit" ? (
          <AuditPage />
        ) : page === "/book" ? (
          <BookPage />
        ) : page === "/sample-report" ? (
          <SampleReportPage />
        ) : page === "/methodology" ? (
          <MethodologyPage />
        ) : page === "/privacy" || page === "/terms" ? (
          <PolicyPage kind={page === "/privacy" ? "privacy" : "terms"} />
        ) : (
          <section className="container page-hero">
            <p className="eyebrow">PAGE NOT FOUND</p>
            <h1>
              Let’s get you
              <br />
              back on track.
            </h1>
            <a className="button button-dark" href="/">
              Back to the homepage
            </a>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
