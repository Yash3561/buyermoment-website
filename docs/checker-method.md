# Public readiness checker

The checker inspects a public HTTPS homepage and robots.txt. It does not query ChatGPT, Google AI answers, or other answer engines. It does not claim to measure brand visibility, citations, ranking, or conversions.

## What a visitor gets

Eleven unweighted findings: declared Googlebot, bingbot and OAI-SearchBot crawl policies; indexing and snippet controls; title; description; H1; initial readable text; canonical URL; and JSON-LD syntax. Each includes evidence, interpretation, a next step, and primary guidance. Missing JSON-LD is informational. The text-length threshold is a screening heuristic, not an AI platform rule. GPTBot training policy is reported separately.

Results are Observed, Review, or Note. A blocked, unreadable or challenge page produces an error, never zero visibility. JavaScript is not executed; this is not a full-site audit or a live bot-network test. Reports can be downloaded locally. Verified-email sign-in is required. One successful audit and its report are saved per account. Failed technical checks can be retried. No marketing subscription is created. See the audit launch checklist for required configuration.

## Boundaries

- Public domain names over HTTPS only; no credentials, private addresses, IP literals or custom ports.
- Every DNS answer is validated; the connection is pinned to an approved public address.
- Same-site apex/www redirects only; each hop is checked again.
- The checker respects its own robots exclusion before fetching a page.
- Bounded response size, redirect count, concurrent requests and overall runtime.
- Authenticated GET for account status and same-origin authenticated JSON POST for an audit. No remote AI model API key is needed; the server requires the private Supabase service role.
- A ten-minute in-memory report cache prevents some repeated crawls. Hosting may retain technical logs.

## Operating the endpoint

`api/check.js` is a Vercel Node function. In-memory limits are best-effort **per instance**, not a distributed abuse-control guarantee. Before broad paid promotion, configure platform-level rate limiting/bot protection and usage alerts in Vercel. Do not add a paid Redis or AI service silently. Set `CHECKER_DISABLED=1` to pause scanning if needed; static content and contact links remain usable. Requests and function execution consume hosting quota even without an AI API.

Run `npm run dev:api` and `npm run dev` in separate terminals for local development. Tests cover URL validation, private DNS, rebinding, redirects, robots policy, noindex/snippet controls, challenge pages, API body/origin validation, caching and the per-instance limit.

Live AI visibility work is a separate managed engagement: agree buyer questions and platforms, preserve answers and citations with timestamps, implement approved changes, and retest the same sample. Neither the checker nor that engagement guarantees recommendations or proves causation from one before/after sample.
