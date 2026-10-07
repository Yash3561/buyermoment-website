import { useEffect, useRef, useState, type FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import {
  ArrowUpRight,
  Mail,
  ShieldCheck,
  LogOut,
  LoaderCircle,
} from "lucide-react";
import { getAuditAuth, auditAuthConfigured, googleAuthEnabled } from "../auth";
import {
  authReturnState,
  googleSignInOptions,
  isReadinessReport,
} from "../lib/audit-flow.mjs";
import { contactEmailUrl } from "../content";
import {
  WebsiteChecker,
  Results,
  type Report,
} from "../components/WebsiteChecker";

type Allowance = {
  state: "available" | "running" | "completed";
  report?: Report;
};
export function AuditPage() {
  const [auth, setAuth] =
    useState<Awaited<ReturnType<typeof getAuditAuth>>>(null);
  const configured = auditAuthConfigured;
  useEffect(() => {
    let alive = true;
    getAuditAuth()
      .then((client) => {
        if (alive) setAuth(client);
      })
      .catch(() => {
        if (alive) {
          setError("Online sign-in is temporarily unavailable.");
          setReady(true);
        }
      });
    return () => {
      alive = false;
    };
  }, []);
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [ready, setReady] = useState(!configured);
  const [error, setError] = useState("");
  const [allowance, setAllowance] = useState<Allowance | null>(null);
  const [refresh, setRefresh] = useState(0);
  const reportHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (allowance?.state === "completed") reportHeading.current?.focus();
  }, [allowance?.state]);

  useEffect(() => {
    if (!auth) {
      if (!configured) setReady(true);
      return;
    }
    let alive = true;
    const callback = authReturnState(window.location.href);
    auth.auth
      .getSession()
      .then(({ data, error }) => {
        if (!alive) return;
        // The SDK exchanges a PKCE code first. Only scrub it after getSession.
        window.history.replaceState(
          window.history.state,
          "",
          callback.cleanPath,
        );
        if (callback.failed || (callback.hasCode && !data.session))
          setError(
            "Google sign-in was not completed. Please try again or use email.",
          );
        else if (error)
          setError("We could not restore your session. Please sign in again.");
        setSession(data.session);
        setReady(true);
      })
      .catch(() => {
        if (alive) {
          window.history.replaceState(
            window.history.state,
            "",
            callback.cleanPath,
          );
          setReady(true);
          setError("Sign-in is temporarily unavailable.");
        }
      });
    const { data } = auth.auth.onAuthStateChange((_event, next) => {
      if (alive) {
        setSession(next);
        setReady(true);
      }
    });
    return () => {
      alive = false;
      data.subscription.unsubscribe();
    };
  }, [auth, configured]);

  useEffect(() => {
    setAllowance(null);
    if (!session) return;
    const controller = new AbortController();
    let alive = true;
    const timeout = setTimeout(() => {
      if (alive) {
        setError("Your account check took too long. Please try again.");
        controller.abort();
      }
    }, 15000);
    setError("");
    fetch("/api/check", {
      headers: { Authorization: "Bearer " + session.access_token },
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.headers.get("content-type")?.includes("application/json"))
          throw new Error(
            "Online audits are not available on this deployment yet.",
          );
        const result = await response.json();
        if (!response.ok)
          throw new Error(
            result.error || "Your audit allowance could not be checked.",
          );
        if (
          !["available", "running", "completed"].includes(result.state) ||
          (result.state === "completed" && !isReadinessReport(result.report))
        )
          throw new Error("Your saved audit could not be verified.");
        clearTimeout(timeout);
        if (alive) setAllowance(result);
      })
      .catch((error) => {
        clearTimeout(timeout);
        if (alive && error.name !== "AbortError")
          setError(
            error.message || "Your audit account is temporarily unavailable.",
          );
      });
    return () => {
      alive = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [session, refresh]);

  async function signIn(event: FormEvent) {
    event.preventDefault();
    if (!auth || busy || googleBusy) return;
    setBusy(true);
    setError("");
    try {
      const result = sent
        ? await auth.auth.verifyOtp({
            email: email.trim(),
            token: code.trim(),
            type: "email",
          })
        : await auth.auth.signInWithOtp({ email: email.trim() });
      if (result.error)
        throw new Error(
          sent
            ? "That code could not be verified. Check the code or request a new one."
            : "We could not send a sign-in code. Please wait a minute and try again, or contact us.",
        );
      if (!sent) setSent(true);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Sign-in is temporarily unavailable.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function signInWithGoogle() {
    if (!auth || busy || googleBusy || !googleAuthEnabled) return;
    setGoogleBusy(true);
    setError("");
    try {
      const { error } = await auth.auth.signInWithOAuth(
        googleSignInOptions(window.location.origin),
      );
      if (error) throw error;
    } catch {
      setError(
        "Google sign-in is unavailable right now. Try email or contact us.",
      );
    } finally {
      setGoogleBusy(false);
    }
  }
  async function signOut() {
    if (!auth) return;
    setBusy(true);
    setError("");
    try {
      const { error } = await auth.auth.signOut({ scope: "local" });
      if (error) throw error;
      setSession(null);
      setAllowance(null);
      setCode("");
      setSent(false);
    } catch {
      setError("We could not sign you out. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <section className="page-hero container" aria-labelledby="audit-heading">
        <p className="eyebrow">AEO / GEO READINESS · ONE FREE AUDIT</p>
        <h1 id="audit-heading">
          Start with what
          <br />
          your website tells us.
        </h1>
        <p className="page-intro">
          A homepage assessment with evidence you can inspect, a checklist you
          can understand, and practical next steps. No made-up visibility score.
        </p>
        <div className="page-meta">
          <span>
            <ShieldCheck size={17} aria-hidden="true" /> Public pages only
          </span>
          <span>No changes to your site</span>
          <span>One successful audit per verified account</span>
        </div>
        <div className="page-resource-links">
          <a className="text-link" href="/sample-report">
            See what the audit checks <ArrowUpRight size={17} aria-hidden="true" />
          </a>
          <a className="text-link" href="/methodology">
            Read our methodology <ArrowUpRight size={17} aria-hidden="true" />
          </a>
        </div>
      </section>
      <section
        className="account-section container"
        aria-label="Free audit account"
      >
        {!ready ? (
          <p role="status">Preparing secure sign-in…</p>
        ) : !auth ? (
          <div className="account-layout">
            <div className="account-panel">
              <span className="icon-box">
                <Mail size={23} aria-hidden="true" />
              </span>
              <h2 id="account-heading">Your audit is being prepared.</h2>
              <p>
                We’re finishing secure sign-in and saved reports before opening
                self-service audits. You’ll be able to enter a public website,
                review the evidence, and return to your report from the same
                account.
              </p>
              <a className="button button-dark" href={contactEmailUrl}>
                Contact us while we finish{" "}
                <ArrowUpRight size={17} aria-hidden="true" />
              </a>
              <p className="form-note">
                This link opens your email app. No message is sent automatically.
              </p>
              <a
                className="text-link account-sample-link"
                href="/sample-report"
              >
                Review the audit scope{" "}
                <ArrowUpRight size={17} aria-hidden="true" />
              </a>
            </div>
            <AuditScope />
          </div>
        ) : !session ? (
          <div className="account-layout">
            <div className="account-panel">
              <p className="micro">YOUR FREE AUDIT</p>
              <h2 id="account-heading">
                {sent ? "Check your inbox." : "A report worth keeping."}
              </h2>
              <p>
                {sent
                  ? "Enter the eight-digit sign-in code sent to your email. It expires in ten minutes."
                  : "Verify your email to use your free audit and return to your saved report."}
              </p>
              {!sent && googleAuthEnabled && (
                <>
                  <button
                    type="button"
                    className="google-sign-in"
                    aria-label="Sign in with Google"
                    aria-busy={googleBusy}
                    onClick={signInWithGoogle}
                    disabled={busy || googleBusy}
                  >
                    <img
                      src="/google-sign-in.svg"
                      width="180"
                      height="40"
                      alt=""
                    />
                  </button>
                  {googleBusy && (
                    <p className="form-note" role="status">
                      Connecting to Google…
                    </p>
                  )}
                  <div className="sign-in-divider">
                    <span>or continue with email</span>
                  </div>
                </>
              )}
              <form onSubmit={signIn} className="account-form">
                <label htmlFor="audit-email">Email address</label>
                <input
                  id="audit-email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={busy || googleBusy || sent}
                />
                {sent && (
                  <>
                    <label htmlFor="audit-code">Eight-digit sign-in code</label>
                    <input
                      id="audit-code"
                      autoFocus
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      pattern="[0-9]{8}"
                      maxLength={8}
                      required
                      value={code}
                      onChange={(e) =>
                        setCode(e.target.value.replace(/\D/g, ""))
                      }
                      disabled={busy}
                    />
                  </>
                )}
                <button
                  type="submit"
                  className="button button-dark"
                  disabled={busy || googleBusy}
                >
                  {busy && (
                    <LoaderCircle
                      size={17}
                      className="checker-spin"
                      aria-hidden="true"
                    />
                  )}
                  {busy
                    ? "Please wait"
                    : sent
                      ? "Verify and continue"
                      : "Send a sign-in code"}
                </button>
                {sent && (
                  <button
                    type="button"
                    className="text-link"
                    disabled={busy}
                    onClick={() => {
                      setSent(false);
                      setCode("");
                      setError("");
                    }}
                  >
                    Use another email or request a new code
                  </button>
                )}
              </form>
              <p className="form-note">
                Your email is used for sign-in and your audit account. This does
                not subscribe you to marketing emails. Read our{" "}
                <a href="/privacy">privacy notice</a> and{" "}
                <a href="/terms">audit terms</a> before continuing.
              </p>
            </div>
            <AuditScope />
          </div>
        ) : (
          <div>
            <div className="account-toolbar">
              <div>
                <p className="micro">YOUR AUDIT ACCOUNT</p>
                <h2 id="account-heading">{session.user.email}</h2>
              </div>
              <button
                type="button"
                className="button button-outline"
                onClick={signOut}
                disabled={busy}
              >
                <LogOut size={17} aria-hidden="true" /> Sign out
              </button>
            </div>
            {!allowance && !error && (
              <p role="status">Checking your audit allowance…</p>
            )}
            {allowance?.state === "running" && (
              <div className="account-panel">
                <h3>Your audit is in progress.</h3>
                <p>
                  Give it a moment, then check again. A second audit cannot
                  start while this one is running.
                </p>
                <button
                  className="button button-outline"
                  onClick={() => setRefresh((x) => x + 1)}
                >
                  Check status
                </button>
              </div>
            )}
            {allowance?.state === "completed" && allowance.report && (
              <>
                <h2
                  className="checker-result-announcement"
                  tabIndex={-1}
                  ref={reportHeading}
                >
                  Your audit report
                </h2>
                <div className="saved-report-note">
                  <CheckSaved />
                  <p>
                    Your free audit has been used. This is your saved report,
                    not a new scan. For a broader review or a follow-up
                    assessment, <a href="/book">talk to the team</a>.
                  </p>
                </div>
                <Results report={allowance.report} />
              </>
            )}
            {allowance?.state === "available" && (
              <WebsiteChecker
                accessToken={session.access_token}
                onComplete={(report) =>
                  setAllowance({ state: "completed", report })
                }
              />
            )}
          </div>
        )}
        {error && (
          <div className="account-error" role="alert">
            <p>{error}</p>
            {session && (
              <button
                className="text-link"
                type="button"
                onClick={() => setRefresh((x) => x + 1)}
              >
                Try checking your account again
              </button>
            )}
          </div>
        )}
      </section>
      <section className="container audit-boundary">
        <h2>A useful first check. Not the whole picture.</h2>
        <p>
          This audit inspects a public homepage and crawl rules. It does not
          measure live ChatGPT, Gemini, or Perplexity mentions, site-wide
          performance, or rankings. A visibility study needs an agreed set of
          buyer questions, dated answers, and a repeatable comparison.
        </p>
        <a className="text-link" href="/#process">
          See how our full projects work{" "}
          <ArrowUpRight size={17} aria-hidden="true" />
        </a>
      </section>
    </>
  );
}
function CheckSaved() {
  return <ShieldCheck size={22} aria-hidden="true" />;
}
function AuditScope() {
  return (
    <aside className="account-scope">
      <p className="micro">WHAT THE CHECK COVERS</p>
      <h2>
        The fundamentals,
        <br />
        with the evidence attached.
      </h2>
      <ol>
        <li>
          <span>01</span>
          <div>
            <h3>Crawl and indexing rules</h3>
            <p>
              Robots policies and page-level controls that may affect discovery.
            </p>
          </div>
        </li>
        <li>
          <span>02</span>
          <div>
            <h3>Readable page information</h3>
            <p>Initial HTML, headings, metadata, and structured-data syntax.</p>
          </div>
        </li>
        <li>
          <span>03</span>
          <div>
            <h3>A practical next step</h3>
            <p>Observed signals, items to review, and an exportable report.</p>
          </div>
        </li>
      </ol>
      <p>
        Failed technical checks do not consume the free audit. Your saved report
        remains available when you sign back in.
      </p>
    </aside>
  );
}
