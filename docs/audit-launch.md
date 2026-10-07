# Public audit launch checklist

The website has its own account system. Do not connect visitor accounts to the internal agency MCP or client evidence database. The dedicated Supabase project `contextlumen-public-audit` (`ecqegontmlfycrxkgtyk`) was created in US East on October 6, 2026, on the $0/month tier. The free-audit ledger migration was applied. Its table has RLS enabled with no public policies; only the server-side service role can operate it.

## Provisioning and configuration

### October 7 launch handoff

The domain's MX records resolve to Zoho (`mx.zoho.com`, `mx2.zoho.com`, `mx3.zoho.com`). A Google account registered with the same address does not establish Google Workspace mail routing. Use the SMTP hostname displayed in the mailbox's own Server Configuration page; Zoho distinguishes account plans and datacenters.

- Dashboard: `https://supabase.com/dashboard/project/ecqegontmlfycrxkgtyk/auth/smtp`
- Sender name: `ContextLumen`
- Sender email and SMTP username: `yashchaudhary@contextlumen.com`
- SMTP hostname: copy from Zoho Mail > Settings > Mail Accounts > Server Configuration. Zoho documents `smtp.zoho.com` for free/personal US accounts and `smtppro.zoho.com` for paid organization US accounts. Do not choose solely from the MX hostname.
- SMTP port: `587` with TLS, if this is the port offered by the account.
- Password: enter directly in Supabase. If Zoho requires an application password, the account owner creates and enters it. Never send it in chat or commit it.
- If the plan does not permit SMTP, stop rather than upgrading or disabling email verification. Choose an approved free transactional sender separately.
- After SMTP is saved, configure both Auth > Email Templates > Confirm sign up and Magic link or OTP. Set the subject to `Your ContextLumen sign-in code` and use `supabase/templates/magic-link.html` for both, so first-time and returning users receive a code. Keep email OTP length at 8 to match the UI, and expiry at 600 seconds. Keep email confirmation required and anonymous sign-in disabled.
- Set Site URL to `https://www.contextlumen.com` and allow the exact return URL `https://www.contextlumen.com/audit`.
- In the Vercel `motivory` project, enter `SUPABASE_SERVICE_ROLE_KEY` as a server-only Secret for production. Use the key from this dedicated audit project, not an internal agency project. Do not add it to a VITE variable.
- Only after sign-in delivery and the backend configuration are verified, enable production `AUDIT_ACCOUNTS_ENABLED=true` and `VITE_AUDIT_ENABLED=true` and rebuild. Google sign-in remains disabled until separately configured.

Run `npm run check:audit-live` after deployment. This performs GET-only checks of the public pages and unauthenticated API. It fails if the frontend is still disabled or the API is unconfigured. A pass is not evidence of SMTP delivery or a complete successful audit; perform the live acceptance checks below too.

During the October 7 check, the Vercel connector returned 403 for the known project/team and listed no accessible teams. Its dashboard is accessible through the owner's signed-in browser. Supabase dashboard access was restored using the original GitHub login, rather than the separate business-email account. The production site URL and exact audit callback were saved. Publishing and real email/audit acceptance tests are still required; dashboard access is not evidence of a completed deployment.

1. The dedicated project exists and the ledger migration is applied. Two unrelated inactive projects were left untouched.
2. Enable email sign-in and verified-email signup. Turn off anonymous sign-in. Set the production Site URL to `https://www.contextlumen.com`; allow only the intended production/test redirect URLs, never an unrestricted wildcard.
3. Configure production email delivery. Supabase's built-in mail sender is not a general public signup solution. Use a verified custom SMTP sender or a supported provider after checking cost, SMTP access and domain authentication. Do not assume a mailbox plan includes SMTP.
4. Change both Confirm sign up and Magic link or OTP templates to display `{{ .Token }}` as an eight-digit sign-in code. The website uses `signInWithOtp` followed by `verifyOtp` with type `email`. Leaving the default link-only templates does not match this UI. Test new signup and returning-user emails.
5. Public browser URL and publishable key are configured in Vercel for production, preview, and development. Add the matching server URL and server-only service-role key in Vercel. Never put the service-role key in chat, Git, public screenshots, or a VITE variable.
6. Keep `VITE_AUDIT_ENABLED=false` and `AUDIT_ACCOUNTS_ENABLED=false` until steps 2-5 pass. Then set both to `true`, rebuild, and run the live checks below. A missing configuration fails closed.
7. Configure platform-level abuse controls and usage alerts before broad promotion. In-memory IP limits are per function instance, not distributed. Enable sign-in rate controls and consider Supabase CAPTCHA with matching UI support before a public launch. Do not enable provider CAPTCHA without adding a valid CAPTCHA token flow to this form.

## Google sign-in

Google is an optional second provider for the SAME visitor account store, not a second audit ledger. The website supports it, but `VITE_GOOGLE_AUTH_ENABLED=false` keeps the button hidden until provider configuration is verified.

1. Confirm the dedicated Supabase project. Do not use Kaushik's private agency MCP as a visitor auth provider. A Python CLI repository alone does not provide hosted authentication or report storage.
2. In the team's Google Cloud project, configure the OAuth consent screen with ContextLumen's actual brand, support email, production homepage and privacy/terms URLs. Confirm the app's testing/publishing and domain-verification requirements. Do not claim Google has approved or certified ContextLumen.
3. Create a Web application OAuth client. Set the authorised JavaScript origin to `https://www.contextlumen.com`. Add local development separately if needed. Google's authorised redirect URI is `https://<project-ref>.supabase.co/auth/v1/callback`, copied from the Supabase Google provider settings, not the website's `/audit` route.
4. Enter the Google client ID and secret in Supabase's Google provider settings. The secret belongs there, never in browser variables, Git, chat, screenshots, or public documentation.
5. Add the exact application callback `https://www.contextlumen.com/audit` to Supabase's redirect allowlist. Add explicitly approved local/staging callbacks separately. No universal wildcard redirects. The app uses a fixed same-origin `/audit` return and requests default identity scopes only, not Gmail, Drive or Calendar access.
6. Set `VITE_GOOGLE_AUTH_ENABLED=true` only on a staging build initially. The browser client uses PKCE with `detectSessionInUrl=true`, so the SDK exchanges the code automatically. The session and verifier live in session storage. Initiate and finish login in the same tab and browser; do not add a second manual code exchange.
7. Test a new Google user and a returning user. Confirm cancellation, expired callback codes and blocked browser storage produce a safe error. Verify callback parameters disappear after processing. No Google token or code should be logged or retained in a report.
8. Test Google and email sign-in using the same verified email. Confirm the provider's identity linking resolves to the SAME Supabase user ID and does not create a second free allowance. Then test a different account for report isolation.
9. Enable the production Google flag only after these checks and the account/audit checks below pass. A website rebuild is needed for VITE changes.

The Google button is an unmodified pre-approved SVG from Google's [branding asset bundle](https://developers.google.com/static/identity/images/signin-assets.zip), linked from the [branding guidelines](https://developers.google.com/identity/branding-guidelines). Its colours, geometry and aspect ratio are not recoloured to match ContextLumen. Google OAuth verification can be an external dependency; do not promise immediate approval.

The frontend prefers `VITE_SUPABASE_PUBLISHABLE_KEY`; the older `VITE_SUPABASE_ANON_KEY` remains a compatibility fallback. Both are public browser configuration, never replacements for a server-only service-role key.

## Connecting Kaushik's CLI

The public website currently calls its existing bounded Node homepage scanner. It does NOT call the Python CLI. Do not represent a merged frontend change as completion of that integration.

Before replacing the scanner, require a documented hosted job API with authenticated submission, owner-bound job/result access, idempotency, time limits, storage and failure recovery. Keep the wrapper separate from the CLI's evidence engine and the private OS MCP. Pin the inspected CLI commit and validate its real output before writing an adapter. Do not enable paid third-party adapters implicitly.

Required launch gates include connection-level public-IP enforcement on every fetch/redirect, root-origin robots handling for input paths, a restricted crawl scope, overall runtime/response limits, and report-contract validation. The current website cannot display the CLI's schema merely by changing an endpoint URL. A queued worker also needs corresponding job polling and ledger lease handling; the present synchronous handler and two-minute claim lease must not be reused unchanged for long jobs.

See [visibility blueprint review](visibility-blueprint-review.md) for the separate AI-answer tracking proposal. No Bright Data, DataForSEO or model-provider account has been created, charged or wired into the free checker.

## Live acceptance checks

- Verify email with a real externally delivered code. Confirm that the code works once and incorrect/expired codes fail.
- Confirm new users see an available audit, run one authorized public site, and receive a complete dated report.
- Try a different site with the same account. It must return FREE_AUDIT_USED without another crawl.
- Refresh, clear browser session data, sign in again, and confirm the saved report remains. Usage is stored in the database, not local storage.
- Issue two simultaneous authenticated requests for the same account. The database claim lock must allow only one job. The unit test uses a test adapter, so it does not replace this live SQL check.
- Fail a real technical request and confirm the credit is available again. Check stale leases and mismatched job IDs.
- Attempt direct table/RPC reads and writes with the public key and a normal user token. These must be denied. Read saved reports only via authenticated GET /api/check.
- Verify account A cannot read account B's report. Browser-supplied user IDs are not accepted.
- Confirm private IP, localhost, redirect-to-private, non-HTTPS and credential-bearing URLs are rejected.
- Inspect browser assets and logs for service-role secrets. Never print tokens as test evidence.
- Test sign-out, expired-session recovery, keyboard navigation, mobile layout and report download.

The one-audit allowance is per verified account, not a person-wide identity check. A person can create multiple verified accounts. Failure retries and a two-minute stale-job lease are deliberate. A cached public website snapshot can fulfil another account's first audit; its original timestamp and cached label are preserved.

## Data and costs

Supabase holds authentication emails and one completed homepage report per user, plus usage state/timestamps. The report does not contain a visitor's private source code or marketing consent. Public reports can also be cached in function memory for ten minutes. Hosting and email providers can retain technical logs.

Visitors may request account/report deletion at yashchaudhary@contextlumen.com. Deleting the auth user cascades the audit row; verify this in the chosen project. Do not delete someone else's account without confirming the request.

There is no paid AI model call in this checker. Vercel function use, database/auth use, SMTP delivery and Calendly plan features remain subject to provider quotas and charges. Do not describe it as indefinitely cost-free.

## Reference documentation

- [Supabase passwordless email](https://supabase.com/docs/guides/auth/auth-email-passwordless)
- [Supabase SMTP](https://supabase.com/docs/guides/auth/auth-smtp)
- [Supabase row-level security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Server-side getUser validation](https://supabase.com/docs/reference/javascript/auth-getuser)
