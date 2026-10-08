import { ArrowUpRight } from "lucide-react";
import { Header } from "./components/Header";
import { Brand } from "./components/Brand";
import { HomePage } from "./pages/HomePage";
import { AuditPage } from "./pages/AuditPage";
import { BookPage } from "./pages/BookPage";
import { SampleReportPage } from "./pages/SampleReportPage";
import { MethodologyPage } from "./pages/MethodologyPage";
import { PolicyPage } from "./pages/PolicyPage";
import { site } from "./content";
const selfServeAuditAvailable = import.meta.env.VITE_AUDIT_ENABLED === "true";
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
          <HomePage />
        ) : page === "/audit" ? (
          <AuditPage />
        ) : page === "/audit/verify" ? (
          <AuditPage privateTest />
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
            <h1>Let’s get you back.</h1>
            <p>This page is not available.</p>
            <a className="button" href="/">
              Back to ContextLumen
            </a>
          </section>
        )}
      </main>
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
              <a href="/audit">
                {selfServeAuditAvailable ? "Free audit" : "Audit status"}
              </a>
              <a href="/methodology">Methodology</a>
              <a href="/privacy">Privacy</a>
              <a href="/terms">Audit terms</a>
            </nav>
          </div>
          <details className="privacy-details" id="privacy">
            <summary>Privacy & contact</summary>
            <p>
              We use your email for sign-in and your saved audit, not automatic
              marketing subscriptions. Public website checks do not change your
              site. The booking calendar loads only when you choose. Email{" "}
              <a href={"mailto:" + site.email}>{site.email}</a> for account or
              report deletion.{" "}
              <a href="/privacy">Read the full privacy notice.</a>
            </p>
          </details>
        </div>
      </footer>
    </>
  );
}
