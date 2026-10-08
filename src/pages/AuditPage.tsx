import { useEffect, useRef, useState, type FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import {
  ArrowRight,
  ArrowUpRight,
  Globe2,
  ShieldCheck,
  LogOut,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";
import {
  getAuditAuth,
  auditAuthConfigured,
  privateAuditAuthConfigured,
  googleAuthEnabled,
} from "../auth";
import {
  authReturnState,
  googleSignInOptions,
  isReadinessReport,
  signInErrorMessage,
} from "../lib/audit-flow.mjs";
import {
  normalizeWebsite,
  consumeScanIntent,
  websiteStorageKey,
} from "../lib/audit-journey.mjs";
import { contactEmailUrl } from "../content";
import { AuditRequestError, requestAudit } from "../lib/audit-request.mjs";
import { Results, type Report } from "../components/WebsiteChecker";
import { OtpInput } from "../components/OtpInput";
import { AuditSteps } from "../components/AuditSteps";

type Allowance = {
  state: "available" | "running" | "completed";
  report?: Report;
};
export function AuditPage({ privateTest = false }: { privateTest?: boolean }) {
  const configured = privateTest
    ? privateAuditAuthConfigured
    : auditAuthConfigured;
  const canUseGoogle = googleAuthEnabled && !privateTest;
  const [auth, setAuth] =
    useState<Awaited<ReturnType<typeof getAuditAuth>>>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(!configured);
  const [website, setWebsite] = useState("");
  const [confirmedWebsite, setConfirmedWebsite] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [error, setError] = useState("");
  const [accountErrorCode, setAccountErrorCode] = useState("");
  const [checkingAccount, setCheckingAccount] = useState(false);
  const [allowance, setAllowance] = useState<Allowance | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [resendUntil, setResendUntil] = useState(0);
  const [resendSeconds, setResendSeconds] = useState(0);
  const [websiteError, setWebsiteError] = useState("");
  const accountOwner = useRef<string | null>(null);
  const pendingAccountRequests = useRef(0);
  const scanIntent = useRef<{ website: string; accountId: string } | null>(
    null,
  );
  const scanPending = useRef(false);
  const mounted = useRef(false);
  const reportHeading = useRef<HTMLHeadingElement>(null);
  const signInAlert = useRef<HTMLDivElement>(null);
  useEffect(() => {
    mounted.current = true;
    let saved = "";
    try {
      saved = sessionStorage.getItem(websiteStorageKey) || "";
    } catch {
      /* In-memory journey still works. */
    }
    const query = new URLSearchParams(window.location.search).get("website");
    if (query || saved) {
      try {
        const normalized = normalizeWebsite(query || saved);
        setWebsite(normalized);
        setConfirmedWebsite(normalized);
      } catch {
        setWebsiteError("Please enter the public website you want to check.");
      }
    }
    return () => {
      mounted.current = false;
      scanIntent.current = null;
    };
  }, []);
  useEffect(() => {
    let alive = true;
    getAuditAuth(privateTest)
      .then((client) => {
        if (alive) setAuth(client);
      })
      .catch(() => {
        if (alive) {
          setReady(true);
          setError("Online sign-in is temporarily unavailable.");
        }
      });
    return () => {
      alive = false;
    };
  }, [privateTest]);
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
    if (!sent || !resendUntil) return;
    const update = () =>
      setResendSeconds(
        Math.max(0, Math.ceil((resendUntil - Date.now()) / 1000)),
      );
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [sent, resendUntil]);
  useEffect(() => {
    if (error && !session) signInAlert.current?.focus();
  }, [error, session]);
  useEffect(() => {
    if (allowance?.state === "completed") reportHeading.current?.focus();
  }, [allowance?.state]);

  // Read the server ledger before any scan, including after authentication.
  useEffect(() => {
    const owner = session?.user.id || null;
    const accessToken = session?.access_token;
    if (accountOwner.current !== owner) {
      accountOwner.current = owner;
      setAllowance(null);
    }
    if (!accessToken || scanning) return;
    const controller = new AbortController();
    let alive = true;
    pendingAccountRequests.current += 1;
    setCheckingAccount(true);
    setError("");
    setAccountErrorCode("");
    const timer = setTimeout(() => controller.abort(), 15000);
    requestAudit({ accessToken, signal: controller.signal })
      .then((value) => {
        const result = value as Allowance;
        if (
          !result ||
          !["available", "running", "completed"].includes(result.state) ||
          (result.state === "completed" && !isReadinessReport(result.report))
        )
          throw new Error("Your saved audit could not be verified.");
        if (alive) {
          setAllowance(result);
          setCheckingAccount(false);
        }
      })
      .catch((error) => {
        if (alive) {
          scanIntent.current = null;
          setCheckingAccount(false);
          setAccountErrorCode(
            error instanceof AuditRequestError ? error.code : "",
          );
          setError(
            error instanceof Error
              ? error.message
              : "Your audit account is temporarily unavailable.",
          );
        }
      })
      .finally(() => {
        clearTimeout(timer);
        pendingAccountRequests.current = Math.max(
          0,
          pendingAccountRequests.current - 1,
        );
      });
    return () => {
      alive = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, [session?.access_token, session?.user.id, refresh, scanning]);

  // Intent is consumed synchronously before POST. StrictMode and token refresh
  // cannot re-use it. Uncertain outcomes always return to the GET ledger path.
  useEffect(() => {
    if (!session || checkingAccount || scanning || scanPending.current) return;
    if (allowance?.state === "completed" || allowance?.state === "running") {
      scanIntent.current = null;
      return;
    }
    const requested = consumeScanIntent(
      scanIntent.current,
      allowance?.state || "",
      session.user.id,
    );
    if (requested) void runAudit(requested, session);
  }, [allowance, checkingAccount, scanning, session]);

  useEffect(() => {
    if (allowance?.state !== "running" || scanning) return;
    const timer = window.setInterval(() => {
      if (
        document.visibilityState === "visible" &&
        pendingAccountRequests.current === 0
      )
        setRefresh((value) => value + 1);
    }, 5000);
    const stop = window.setTimeout(() => window.clearInterval(timer), 120000);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(stop);
    };
  }, [allowance?.state, scanning]);

  async function runAudit(url: string, current: Session) {
    if (scanPending.current) return;
    scanPending.current = true;
    setScanning(true);
    setError("");
    try {
      const report = await requestAudit({
        accessToken: current.access_token,
        website: url,
        signal: AbortSignal.timeout(65000),
      });
      if (!isReadinessReport(report))
        throw new Error(
          "The report could not be verified. Check your saved status before trying again.",
        );
      if (mounted.current && accountOwner.current === current.user.id)
        setAllowance({ state: "completed", report });
    } catch (error) {
      if (mounted.current && accountOwner.current === current.user.id) {
        setAllowance(null);
        setError(
          error instanceof Error
            ? error.message
            : "The audit was interrupted. Check your saved status.",
        );
        setRefresh((value) => value + 1);
      }
    } finally {
      scanPending.current = false;
      if (mounted.current) setScanning(false);
    }
  }
  function rememberWebsite(normalized: string) {
    setConfirmedWebsite(normalized);
    setWebsite(normalized);
    setWebsiteError("");
    try {
      sessionStorage.setItem(websiteStorageKey, normalized);
    } catch {
      /* Optional persistence. */
    }
    const url = new URL(window.location.href);
    url.searchParams.set("website", normalized);
    window.history.replaceState(
      window.history.state,
      "",
      url.pathname + url.search + url.hash,
    );
  }
  function confirmWebsite(event: FormEvent) {
    event.preventDefault();
    try {
      rememberWebsite(normalizeWebsite(website));
    } catch (error) {
      setWebsiteError(
        error instanceof Error ? error.message : "Check the website address.",
      );
    }
  }
  function recoverAudit() {
    scanIntent.current = null;
    setAllowance(null);
    setRefresh((value) => value + 1);
  }
  async function sendCode() {
    if (!auth || busy || googleBusy || (sent && resendSeconds > 0)) return;
    setBusy(true);
    setError("");
    try {
      const result = await auth.auth.signInWithOtp({ email: email.trim() });
      if (result.error) throw new Error(signInErrorMessage(result.error));
      setSent(true);
      setCode("");
      setResendSeconds(60);
      setResendUntil(Date.now() + 60000);
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
  async function signIn(event: FormEvent) {
    event.preventDefault();
    if (!auth || busy || googleBusy) return;
    if (!sent) {
      await sendCode();
      return;
    }
    if (!/^\d{8}$/.test(code)) {
      setError(
        "Enter the full eight-digit code from your latest sign-in email.",
      );
      return;
    }
    setBusy(true);
    setError("");
    try {
      const result = await auth.auth.verifyOtp({
        email: email.trim(),
        token: code,
        type: "email",
      });
      if (result.error) throw new Error(signInErrorMessage(result.error, sent));
      if (result.data.session) {
        scanIntent.current = {
          website: confirmedWebsite,
          accountId: result.data.session.user.id,
        };
        setSession(result.data.session);
        setRefresh((value) => value + 1);
      }
    } catch (error) {
      scanIntent.current = null;
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
    if (!auth || busy || googleBusy || !canUseGoogle) return;
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
    if (!auth || scanPending.current) return;
    setBusy(true);
    setError("");
    scanIntent.current = null;
    try {
      const { error } = await auth.auth.signOut({ scope: "local" });
      if (error) throw error;
      setSession(null);
      setAllowance(null);
      setCode("");
      setSent(false);
      setResendUntil(0);
    } catch {
      setError("We could not sign you out. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  const running = scanning || allowance?.state === "running";
  const completed = allowance?.state === "completed" && allowance.report;
  const step = completed
    ? 4
    : running || (session && checkingAccount)
      ? 3
      : !confirmedWebsite
        ? 0
        : !session
          ? sent
            ? 2
            : 1
          : 3;
  return (
    <>
      <section
        className="container audit-heading"
        aria-labelledby="audit-heading"
      >
        <p className="eyebrow">
          {privateTest
            ? "PRIVATE LAUNCH VERIFICATION"
            : "YOUR FIRST CHECK, ON US"}
        </p>
        <h1 id="audit-heading">ContextLumen Website Audit</h1>
        <p>
          A clear look at your homepage, with evidence, priorities, and a report
          to keep.
        </p>
        <AuditSteps step={step} />
        {privateTest && (
          <p className="form-note">
            Owner-only verification. The server still requires an approved test
            account and active test window.
          </p>
        )}
      </section>
      <section
        className="container account-section"
        aria-label="Free audit account"
      >
        {session && (
          <div className="account-toolbar">
            <div>
              <p className="micro">YOUR AUDIT ACCOUNT</p>
              <h2>{session.user.email}</h2>
            </div>
            <button
              className="button button-outline"
              type="button"
              onClick={signOut}
              disabled={busy || scanning}
            >
              <LogOut size={16} aria-hidden="true" /> Sign out
            </button>
          </div>
        )}
        {completed ? (
          <>
            <h2
              ref={reportHeading}
              tabIndex={-1}
              className="checker-result-announcement"
            >
              Your saved report
            </h2>
            <div className="saved-report-note">
              <ShieldCheck size={21} aria-hidden="true" />
              <p>
                This is your saved audit, not a new scan. Your one successful
                free audit has been used.{" "}
                <a href="/book">Discuss a broader review.</a>
              </p>
            </div>
            <Results report={completed} />
          </>
        ) : running ? (
          <ScanState
            checking={checkingAccount}
            onRecover={recoverAudit}
            scanning={scanning}
          />
        ) : (
          <div className="account-layout">
            <div className="account-panel">
              {!confirmedWebsite ? (
                <>
                  <span className="icon-box">
                    <Globe2 size={23} aria-hidden="true" />
                  </span>
                  <h2>Start with your website.</h2>
                  <p>
                    We inspect the public HTTPS homepage and its crawl rules.
                    Nothing on your website is changed.
                  </p>
                  <form className="account-form" onSubmit={confirmWebsite}>
                    <label htmlFor="audit-website">
                      Public website address
                    </label>
                    <input
                      id="audit-website"
                      inputMode="url"
                      autoComplete="url"
                      placeholder="yourbusiness.com"
                      required
                      maxLength={500}
                      value={website}
                      onChange={(event) => {
                        setWebsite(event.target.value);
                        setWebsiteError("");
                      }}
                      aria-invalid={Boolean(websiteError)}
                      aria-describedby="website-help"
                    />
                    <p id="website-help" className="form-note">
                      Any page address is normalized to its homepage. Submit a
                      site you own, manage, or have permission to assess.
                    </p>
                    {websiteError && (
                      <p role="alert" className="account-error">
                        {websiteError}
                      </p>
                    )}
                    <button className="button button-dark" type="submit">
                      Continue <ArrowRight size={17} aria-hidden="true" />
                    </button>
                  </form>
                  <p className="form-note">
                    Already have a report? Enter your website, then sign in with
                    the same email to reopen it.
                  </p>
                </>
              ) : (
                <>
                  <div className="website-summary">
                    <Globe2 size={21} aria-hidden="true" />
                    <div>
                      <small>YOUR HOMEPAGE</small>
                      <strong>{confirmedWebsite}</strong>
                    </div>
                    <button
                      type="button"
                      className="text-link"
                      disabled={busy || checkingAccount}
                      onClick={() => {
                        setConfirmedWebsite("");
                        setError("");
                        scanIntent.current = null;
                      }}
                    >
                      Change
                    </button>
                  </div>
                  {!ready ? (
                    <p role="status">Preparing secure sign-in…</p>
                  ) : !auth ? (
                    <>
                      <h2>
                        {configured
                          ? "Sign-in is unavailable."
                          : "Self-service is being prepared."}
                      </h2>
                      <p>
                        Your allowance has not changed. Please reload or contact
                        our team.
                      </p>
                      <a className="button" href={contactEmailUrl}>
                        Contact ContextLumen{" "}
                        <ArrowUpRight size={17} aria-hidden="true" />
                      </a>
                    </>
                  ) : !session ? (
                    <>
                      <p className="micro">
                        {sent ? "VERIFY YOUR EMAIL" : "SAVE YOUR REPORT"}
                      </p>
                      <h2>
                        {sent
                          ? "Check your inbox."
                          : "Where should we save it?"}
                      </h2>
                      <p>
                        {sent
                          ? "Enter the eight-digit code sent to " + email + "."
                          : "Verify your email to run the audit and return to your saved results."}
                      </p>
                      {!sent && canUseGoogle && (
                        <>
                          <button
                            className="google-sign-in"
                            type="button"
                            onClick={signInWithGoogle}
                            disabled={busy || googleBusy}
                            aria-label="Sign in with Google"
                            aria-busy={googleBusy}
                          >
                            <img
                              src="/google-sign-in.svg"
                              width="180"
                              height="40"
                              alt=""
                            />
                          </button>
                          <p className="sign-in-divider">
                            or continue with email
                          </p>
                        </>
                      )}
                      <form
                        onSubmit={signIn}
                        className="account-form"
                        noValidate={sent}
                      >
                        <label
                          htmlFor="audit-email"
                          className={sent ? "sr-only" : undefined}
                        >
                          Email address
                        </label>
                        <input
                          id="audit-email"
                          className={sent ? "sr-only" : undefined}
                          type="email"
                          autoComplete="email"
                          required
                          maxLength={254}
                          value={email}
                          onChange={(event) => {
                            setEmail(event.target.value);
                            setError("");
                          }}
                          disabled={busy || googleBusy || sent}
                        />
                        {sent && (
                          <>
                            <label htmlFor="audit-code">
                              Eight-digit sign-in code
                            </label>
                            <OtpInput
                              value={code}
                              onChange={(value) => {
                                setCode(value);
                                setError("");
                              }}
                              disabled={busy}
                              error={Boolean(error)}
                            />
                            <p className="form-note" id="otp-help">
                              Use your newest code. It expires in ten minutes.
                              You can paste all eight digits at once.
                            </p>
                          </>
                        )}
                        {error && (
                          <div
                            id="audit-signin-alert"
                            className="account-error signin-alert"
                            role="alert"
                            tabIndex={-1}
                            ref={signInAlert}
                          >
                            <AlertCircle size={20} aria-hidden="true" />
                            <div>
                              <strong>
                                {sent
                                  ? "Code not verified"
                                  : "Sign-in needs attention"}
                              </strong>
                              <p>{error}</p>
                            </div>
                          </div>
                        )}
                        <button
                          type="submit"
                          className="button button-dark"
                          disabled={busy || googleBusy}
                          aria-busy={busy}
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
                              ? "Verify and run audit"
                              : "Send my sign-in code"}
                          {!busy && <ArrowRight size={17} aria-hidden="true" />}
                        </button>
                        {sent && (
                          <div className="signin-recovery">
                            <button
                              type="button"
                              className="text-link"
                              disabled={busy || resendSeconds > 0}
                              onClick={sendCode}
                            >
                              {resendSeconds > 0
                                ? `New code in ${resendSeconds}s`
                                : "Send a new code"}
                            </button>
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
                              Change email
                            </button>
                          </div>
                        )}
                      </form>
                      <p className="form-note">
                        One successful audit per verified account. Sign-in does
                        not subscribe you to marketing emails. By continuing,
                        review our <a href="/privacy">privacy notice</a> and{" "}
                        <a href="/terms">audit terms</a>.
                      </p>
                    </>
                  ) : checkingAccount || !allowance ? (
                    <>
                      <h2>Checking your saved status.</h2>
                      <p role="status">
                        We confirm your account’s allowance before starting any
                        collection.
                      </p>
                    </>
                  ) : (
                    <>
                      <h2>Ready for your first audit.</h2>
                      <p>
                        We will check crawl access, indexing and previews, page
                        information, and structured data on this homepage.
                      </p>
                      <button
                        className="button button-dark"
                        type="button"
                        disabled={busy || checkingAccount}
                        onClick={() => {
                          scanIntent.current = null;
                          void runAudit(confirmedWebsite, session);
                        }}
                      >
                        Run my free audit{" "}
                        <ArrowRight size={17} aria-hidden="true" />
                      </button>
                      <p className="form-note">
                        This uses your one successful free audit. A failed
                        technical scan does not consume it.
                      </p>
                    </>
                  )}
                </>
              )}
            </div>
            <AuditScope />
          </div>
        )}
        {error && (session || !auth) && (
          <div className="account-error" role="alert">
            <p>{error}</p>
            {session && (
              <button
                className="text-link"
                type="button"
                onClick={
                  accountErrorCode === "SIGN_IN_REQUIRED"
                    ? signOut
                    : recoverAudit
                }
                disabled={checkingAccount || busy || scanning}
              >
                {accountErrorCode === "SIGN_IN_REQUIRED"
                  ? "Sign in again"
                  : "Check saved audit status"}
              </button>
            )}
          </div>
        )}
      </section>
      <section className="container audit-boundary">
        <h2>Technical readiness. A useful starting point.</h2>
        <p>
          This audit does not measure ChatGPT, Gemini, or Perplexity mentions,
          rankings, or recommendations. Actual AI visibility requires a separate
          study of buyer questions and dated answers.
        </p>
        <div className="page-resource-links">
          <a className="text-link" href="/methodology">
            Read the methodology <ArrowUpRight size={16} aria-hidden="true" />
          </a>
          <a className="text-link" href="/sample-report">
            Explore the audit <ArrowRight size={16} aria-hidden="true" />
          </a>
        </div>
      </section>
    </>
  );
}
function ScanState({
  checking,
  onRecover,
  scanning,
}: {
  checking: boolean;
  onRecover: () => void;
  scanning: boolean;
}) {
  return (
    <div className="account-panel scan-state">
      <div className="scan-light" aria-hidden="true">
        <img src="/logo.svg" width="43" height="43" alt="" />
      </div>
      <p className="micro">
        {scanning ? "COLLECTING YOUR HOMEPAGE" : "RECOVERING YOUR AUDIT"}
      </p>
      <h2>
        {scanning ? "Looking at the evidence." : "Your audit is in progress."}
      </h2>
      <p role="status">
        {scanning
          ? "Retrieving the homepage and crawl rules, then reviewing the returned HTML. This can take up to a minute."
          : "We check your saved status while this tab is visible, for up to two minutes. No new scan is started."}
      </p>
      <p className="form-note">
        Your report is saved to your account when complete.
      </p>
      {!scanning && (
        <button
          className="button button-outline"
          type="button"
          onClick={onRecover}
          disabled={checking}
        >
          {checking ? "Checking status" : "Check saved status"}
        </button>
      )}
    </div>
  );
}
function AuditScope() {
  return (
    <aside className="account-scope">
      <p className="micro">WHAT YOU’LL RECEIVE</p>
      <h2>
        The findings.
        <br />
        And what to do with them.
      </h2>
      <ol>
        {[
          {
            title: "Four areas, clearly explained",
            text: "Crawl access, indexing and previews, page information, and structured data.",
          },
          {
            title: "Evidence you can inspect",
            text: "Observed signals, items to review, and notes with their source guidance.",
          },
          {
            title: "A report worth keeping",
            text: "Practical next steps, a branded PDF, and saved results when you return.",
          },
        ].map((item, index) => (
          <li key={item.title}>
            <span>0{index + 1}</span>
            <div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          </li>
        ))}
      </ol>
      <p>
        Public homepage only. No site changes. No paid ad campaign. Failed
        technical checks do not consume your allowance.
      </p>
    </aside>
  );
}
