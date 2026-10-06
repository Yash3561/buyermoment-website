# Public audit launch checklist

The website has its own account system. Do not connect visitor accounts to the internal agency MCP or client evidence database. No Supabase project was created, restored, or modified during implementation.

## Provisioning and configuration

1. Choose a dedicated public-website Supabase project and confirm its plan and available quota. The connected account currently showed two unrelated inactive projects on October 6, 2026. Do not silently restore or repurpose them.
2. Apply `supabase/migrations/202610060001_free_audits.sql` through that project's SQL editor or migration workflow. Inspect migration results and permissions.
3. Enable email sign-in and verified-email signup. Turn off anonymous sign-in. Set the production Site URL to `https://www.contextlumen.com`; allow only the intended production/test redirect URLs, never an unrestricted wildcard.
4. Configure production email delivery. Supabase's built-in mail sender is not a general public signup solution. Use a verified custom SMTP sender or a supported provider after checking cost, SMTP access and domain authentication. Do not assume a mailbox plan includes SMTP.
5. Change the Magic Link email template to display `{{ .Token }}` as a six-digit sign-in code. The website uses `signInWithOtp` followed by `verifyOtp` with type `email`. Leaving the default magic-link-only template does not match this UI. Test new signup and returning-user emails.
6. Set both browser URL/anon key and server URL/service-role key in Vercel. They must refer to the SAME dedicated project. Browser config is public; the service role is server-only. Enter secrets directly in provider settings, not chat, Git, public screenshots, or a VITE variable.
7. Keep `VITE_AUDIT_ENABLED=false` and `AUDIT_ACCOUNTS_ENABLED=false` until steps 1-6 pass. Then set both to `true`, rebuild, and run the live checks below. A missing configuration fails closed.
8. Configure platform-level abuse controls and usage alerts before broad promotion. In-memory IP limits are per function instance, not distributed. Enable sign-in rate controls and consider Supabase CAPTCHA with matching UI support before a public launch. Do not enable provider CAPTCHA without adding a valid CAPTCHA token flow to this form.

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
