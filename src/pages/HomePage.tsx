import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Search,
  Code2,
  ChartNoAxesCombined,
  Plus,
  Globe2,
} from "lucide-react";
import { LumenFlow } from "../components/LumenFlow";
import { AuditPreview } from "../components/AuditPreview";
import { BrandMark } from "../components/Brand";
import { Contact } from "../components/Contact";
import { faqs, site } from "../content";
import { normalizeWebsite } from "../lib/audit-journey.mjs";
export function HomePage() {
  const [website, setWebsite] = useState("");
  const [error, setError] = useState("");
  const page = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (
      !window.IntersectionObserver ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.08 },
    );
    page.current
      ?.querySelectorAll("[data-reveal]")
      .forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);
  function start(event: FormEvent) {
    event.preventDefault();
    try {
      window.location.assign(
        "/audit?website=" + encodeURIComponent(normalizeWebsite(website)),
      );
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Check the website address.",
      );
    }
  }
  return (
    <div ref={page}>
      <section className="hero" aria-labelledby="hero-title">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="live-dot" /> A CLEARER PRESENCE IN AI SEARCH
            </p>
            <h1 id="hero-title">
              Help the right buyers <span>find you</span> in AI search.
            </h1>
            <p className="hero-description">
              We research the questions your buyers ask, improve the pages that
              answer them, and document what changes. From the first finding to
              the work that follows.
            </p>
            <form className="hero-audit-form" onSubmit={start}>
              <label className="sr-only" htmlFor="hero-website">
                Your public website
              </label>
              <div>
                <Globe2 size={20} aria-hidden="true" />
                <input
                  id="hero-website"
                  value={website}
                  onChange={(event) => {
                    setWebsite(event.target.value);
                    setError("");
                  }}
                  placeholder="yourbusiness.com"
                  autoComplete="url"
                  inputMode="url"
                  required
                  maxLength={500}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "hero-error" : "hero-audit-note"}
                />
                <button type="submit" className="button button-accent">
                  Start my free audit{" "}
                  <ArrowRight size={17} aria-hidden="true" />
                </button>
              </div>
              {error && (
                <p role="alert" id="hero-error">
                  {error}
                </p>
              )}
            </form>
            <p className="form-note" id="hero-audit-note">
              Public homepage checks. One successful audit per verified account.
            </p>
            <a className="text-link hero-book" href="/book">
              Book a conversation <ArrowUpRight size={17} aria-hidden="true" />
            </a>
          </div>
          <LumenFlow />
        </div>
        <div className="container hero-bottom">
          <BrandMark />
          <p>
            Research with context.
            <br />
            <strong>Improvements you can trace.</strong>
          </p>
          <span>
            Independent team
            <br />
            Founded by NJIT alumni
          </span>
        </div>
      </section>
      <section className="section-pad preview-section" data-reveal>
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">A USEFUL FIRST LOOK</p>
              <h2>
                Less guesswork.
                <br />A clearer next step.
              </h2>
            </div>
            <p>
              The free Website Audit reviews your homepage’s technical
              fundamentals. Open a finding to see what the evidence supports and
              what to do next.
            </p>
          </div>
          <AuditPreview />
          <div className="section-tail">
            <span>
              Technical readiness is a starting point, not a measure of AI
              mentions.
            </span>
            <a className="text-link" href="/methodology">
              How we measure <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>
      <section
        id="services"
        className="section-pad services-section"
        data-reveal
      >
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">THE WORK BEHIND THE ANSWER</p>
              <h2>
                Find the gap.
                <br />
                Then help close it.
              </h2>
            </div>
            <p>
              One team for the research, the implementation, and the
              follow-through. We agree a focused scope before work begins.
            </p>
          </div>
          <div className="service-grid">
            {[
              {
                icon: Search,
                name: "Research",
                title: "Start with how people choose.",
                text: "Identify buyer questions, competing options, and the information people need to make a decision.",
                deliverable: "An agreed question set and evidence baseline",
              },
              {
                icon: Code2,
                name: "Website improvements",
                title: "Make your expertise easier to understand.",
                text: "Improve useful pages, clarify the offer, and prepare technical changes for your team’s approval.",
                deliverable: "Reviewed content and implementation changes",
              },
              {
                icon: ChartNoAxesCombined,
                name: "Measurement",
                title: "Keep a record of what changes.",
                text: "Repeat agreed checks, compare the evidence, and separate observed changes from assumptions.",
                deliverable: "A dated comparison and practical next steps",
              },
            ].map(({ icon: Icon, ...service }, i) => (
              <article className="service-card" key={service.name}>
                <div className="service-top">
                  <Icon size={24} strokeWidth={1.5} aria-hidden="true" />
                  <span>0{i + 1}</span>
                </div>
                <p className="micro">{service.name}</p>
                <h3>{service.title}</h3>
                <p>{service.text}</p>
                <div className="service-outcome">
                  {service.deliverable}
                  <ArrowUpRight size={18} aria-hidden="true" />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section id="process" className="section-pad process-section" data-reveal>
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">A REPEATABLE WAY FORWARD</p>
              <h2>
                A baseline. Real work.
                <br />
                An honest comparison.
              </h2>
            </div>
            <a className="text-link" href="/methodology">
              Explore our approach <ArrowUpRight size={17} aria-hidden="true" />
            </a>
          </div>
          <ol className="process-grid">
            {[
              {
                title: "Establish the baseline",
                text: "Choose the audience and questions. Record the scope, sources, and dates before changing anything.",
                output: "Your starting point",
              },
              {
                title: "Make approved changes",
                text: "Prepare useful content and technical fixes. Your team reviews what gets published on your existing site.",
                output: "A traceable change log",
              },
              {
                title: "Retest and decide",
                text: "Repeat the agreed checks. Report improvements, unchanged findings, and the limits of the comparison.",
                output: "Evidence for the next decision",
              },
            ].map((step, i) => (
              <li key={step.title}>
                <div className="process-rule">
                  <span>0{i + 1}</span>
                  <ArrowRight size={18} aria-hidden="true" />
                </div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
                <small>{step.output}</small>
              </li>
            ))}
          </ol>
          <div className="team-note">
            <div>
              <BrandMark />
              <p className="micro">
                SMALL TEAM.
                <br />
                DIRECT ACCOUNTABILITY.
              </p>
            </div>
            <div>
              <h3>You work with the people doing the work.</h3>
              <p>
                We are an independent team founded by NJIT alumni with an AI
                engineering background. Research and implementation stay
                connected, with a clear point of contact throughout.
              </p>
              <a className="text-link" href={"mailto:" + site.email}>
                Talk directly with Yash Chaudhary{" "}
                <ArrowUpRight size={16} aria-hidden="true" />
              </a>
              <p className="form-note">
                Not affiliated with or endorsed by NJIT.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="section-pad faq-section" data-reveal>
        <div className="container faq-grid">
          <div>
            <p className="eyebrow">BEFORE WE TALK</p>
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
                  <Plus size={19} aria-hidden="true" />
                </summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <Contact />
    </div>
  );
}
