import { site } from "../content";

export function PolicyPage({ kind }: { kind: "privacy" | "terms" }) {
  const privacy = kind === "privacy";
  return (
    <>
      <section className="container page-hero" aria-labelledby="policy-heading">
        <p className="eyebrow">
          {privacy ? "PRIVACY NOTICE" : "WEBSITE & FREE AUDIT TERMS"} · UPDATED
          OCTOBER 6, 2026
        </p>
        <h1 id="policy-heading">
          {privacy ? (
            <>
              Your information.
              <br />
              Handled with care.
            </>
          ) : (
            <>
              A useful service.
              <br />A defined scope.
            </>
          )}
        </h1>
        <p className="page-intro">
          {privacy
            ? "What this website processes, why it needs it, and how to contact us about your information."
            : "Please read these terms before using the website or requesting a free audit. Paid engagements have their own written proposal and agreement."}
        </p>
      </section>
      <div className="container policy-body editorial-body">
        {privacy ? (
          <>
            <section>
              <h2>Who to contact</h2>
              <p>
                ContextLumen is the service brand used on this website. For
                privacy questions or a request about your information, email{" "}
                <a href={"mailto:" + site.email}>{site.email}</a>. We may ask
                you to verify account ownership before acting.
              </p>
            </section>
            <section>
              <h2>What we process</h2>
              <p>
                When online accounts are enabled, we use Supabase for
                authentication and the audit account store. Email sign-in uses
                your email address. Google sign-in provides basic identity
                information, which can include your email, name, and profile
                image. We do not request access to Gmail, Drive, contacts, or
                your calendar for audit sign-in.
              </p>
              <p>
                An audit processes the submitted public website URL, the public
                HTML and crawl rules needed for the check, findings, and report
                timestamps. The account store retains the successful report and
                allowance state. Only submit public addresses, not private
                documents, credentials, or URLs containing personal information.
              </p>
              <p>
                When you email us, we receive the information in your message.
                Opening a mailto link creates a draft in your email app; it does
                not send a message automatically.
              </p>
            </section>
            <section>
              <h2>Why we use it</h2>
              <p>
                We use this information to authenticate your account, enforce
                the free-audit allowance, return your saved report, respond to
                enquiries, and protect the service against misuse. Running an
                audit does not subscribe you to marketing emails. We do not sell
                audit account information.
              </p>
            </section>
            <section>
              <h2>Providers and browser storage</h2>
              <p>
                Vercel hosts the website and its current API. Supabase processes
                account data when sign-in is enabled. These providers may retain
                technical logs, including IP addresses and request details,
                under their own policies. The browser stores the sign-in session
                and PKCE verifier in session storage. Closing the tab can
                require you to sign in again; it does not delete the server-side
                report.
              </p>
              <p>
                The website loads typefaces from Google Fonts, which receives a
                font request. A Calendly booking link connects you to Calendly.
                The embedded calendar is not loaded until you choose to load it
                and may then use cookies and process booking information. There
                are no advertising pixels on this site.
              </p>
              <p>
                Provider notices:{" "}
                <a
                  href="https://vercel.com/legal/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Vercel
                </a>
                ,{" "}
                <a
                  href="https://supabase.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Supabase
                </a>
                ,{" "}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Google
                </a>
                , and{" "}
                <a
                  href="https://calendly.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Calendly
                </a>
                .
              </p>
            </section>
            <section>
              <h2>Retention and requests</h2>
              <p>
                Your successful audit report remains in the account store so you
                can return to it and we can enforce the allowance. You can
                request deletion of the account and report by email. Public
                website snapshots may also be cached in server memory for up to
                ten minutes. Provider logs and backups can follow different
                retention periods.
              </p>
              <p>
                Contact us to request access, correction, or deletion of your
                account information. Do not include a password or authentication
                token. We do not automatically publish account reports as public
                case studies.
              </p>
            </section>
            <section>
              <h2>Changes to this notice</h2>
              <p>
                If the service or its data processing changes, we will update
                this page and its date. New data sources or paid tracking
                integrations should be disclosed before they are added to the
                public audit.
              </p>
            </section>
          </>
        ) : (
          <>
            <section>
              <h2>What the free audit includes</h2>
              <p>
                The current free audit is a limited, read-only assessment of a
                public homepage and crawl rules. The report identifies the
                actual scope. It is not a complete website audit, penetration
                test, certification, or measurement of live AI recommendations.
                See our <a href="/methodology">methodology</a> for the
                distinction.
              </p>
            </section>
            <section>
              <h2>Accounts and the free allowance</h2>
              <p>
                When self-service auditing is enabled, one successful free audit
                is available per verified account. An account with a completed
                report can return to that report but cannot use the allowance
                for another website. A technical scan failure does not consume
                the successful-audit allowance. If saving or checking an account
                fails, its state must be confirmed before a retry.
              </p>
              <p>
                The allowance is per account, not proof of a unique person. Do
                not create accounts to evade limits, share sign-in codes,
                automate bulk requests, or attempt to access another person’s
                report. We may pause or limit access to protect the service.
              </p>
            </section>
            <section>
              <h2>Permitted website submissions</h2>
              <p>
                Submit only a public website you own, manage, or have permission
                to assess. Do not submit internal addresses, private systems,
                credentials, personal documents, or unlawful content. The audit
                does not authorise us to change a website or place an
                advertisement.
              </p>
            </section>
            <section>
              <h2>Understanding the results</h2>
              <p>
                Findings are observations and recommendations within the stated
                scope and date. Websites and AI platforms change. Technical
                readiness does not guarantee crawling, indexing, citations,
                rankings, referrals, revenue, or recommendations. Failed
                collection is reported as unavailable, not zero visibility.
              </p>
              <p>
                Sample reports contain labelled demonstration data. They are not
                customer results, endorsements, or promises about what your
                report will find.
              </p>
            </section>
            <section>
              <h2>Paid work and external services</h2>
              <p>
                A free audit or introductory meeting does not create a paid
                engagement. Any implementation, recurring tracking, or campaign
                work requires an agreed scope and fees. Advertising spend and
                third-party charges are agreed separately. External sign-in and
                scheduling services have their own terms and availability.
              </p>
            </section>
            <section>
              <h2>Questions or a report problem</h2>
              <p>
                Email <a href={"mailto:" + site.email}>{site.email}</a> with the
                public URL and a description of the issue. Do not send
                authentication tokens or confidential client information. Please
                read our <a href="/privacy">privacy notice</a> before creating
                an account.
              </p>
            </section>
          </>
        )}
      </div>
    </>
  );
}
