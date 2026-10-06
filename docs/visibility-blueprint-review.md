# Kaushik's AI visibility blueprint: implementation review

Reviewed October 6, 2026. This is an internal engineering handoff, not a claim that the tracker is built or that its proposed costs are validated end to end.

## Decision

Keep the agency service-first. Preserve the current React/Vite website and Kaushik's existing tools. Do not migrate the landing page to Next.js just because the proposal names that framework. A new framework does not solve missing hosted auth, job execution, evidence quality or distribution.

Ship the public technical-readiness check separately from the private AI-answer visibility tracker. Technical crawler access is not a visibility measurement. Use real collected answers for measured mentions and citations, with an explicit protocol and provenance. Demonstration data must never enter a prospect's baseline.

## What the proposal gets right

- Asynchronous collection for slow provider jobs instead of holding a browser request open.
- Store raw answers and source URLs, not only a score.
- Deterministic URL parsing before optional model-assisted interpretation.
- Keep the tracker inside the service, not an obligatory paid SaaS dashboard.
- Translate findings into approved changes and a repeatable retest.

## Claims that need qualification

1. **Under $15 per month is not a validated total.** Bright Data's public pricing page lists a 5,000-record monthly free tier and $1.50 per 1,000 pay-as-you-go records. Confirm which AI products, datasets, account terms and output modes are actually included. Count retries, engines, repeated observations, retention, hosting, email and parser token volume. A free tier is not an SLA or an indefinite cost guarantee. [Bright Data pricing](https://brightdata.com/pricing/web-scraper)
2. **Fast collection does not use the cheapest tier.** DataForSEO's pricing table lists $0.0012 per standard result page versus $0.004 for Live, with Live turnaround shown as up to 90 seconds. The same page has inconsistent prose/table timing for standard queues. Validate the chosen endpoint's execution time through a small account-level test. Do not promise a complete 60-second audit across 15 prompts and multiple engines. [DataForSEO pricing](https://dataforseo.com/pricing/ai-optimization/llm-scraper)
3. **The sample outbound cost is only arithmetic for a narrow workload.** 20 prospects × 15 prompts × 2 engines = 600 observations. At an assumed $1.50/1,000, collection alone is $0.90 before repeated runs and other costs. This does not prove the workload or data quality is supported at that price.
4. **Vercel Hobby is not a commercial hosting plan.** Official documentation restricts it to non-commercial personal use. Do not budget a commercial agency or portal as Hobby-compatible. Confirm an appropriate approved hosting plan without silently upgrading billing. [Vercel Hobby](https://vercel.com/docs/plans/hobby)
5. **Five tables are not the complete system.** Add tenant memberships, protocols/versions, job and observation states, collection settings, errors, provenance, idempotency, usage limits and explicit access policies before storing multiple clients' evidence. Public visitor accounts must not inherit access to agency clients.
6. **A scraped answer is one observed experience.** Record the engine surface, location, timestamp, provider and available settings. An API answer, logged-out UI answer and a logged-in personalised answer are not interchangeable evidence. Use supported providers under applicable terms; do not promise coverage of every platform.

## Metric definitions to fix before coding

- The proposed “share of voice” formula is a **recommendation rate**: recommending observations / valid observations. True competitor share calculations need a separate disclosed denominator. Do not present it as market share.
- Count mentions separately from positive recommendations. Disambiguate brand aliases against verified entity names and domains, not substring matches alone.
- Record an ordered recommendation position only when the answer explicitly orders options. Use null for unordered answers; do not force positions into 1–10.
- Specify whether a citation metric counts answers with an owned citation or the share of all citation links. They have different denominators. Canonicalise URLs, deduplicate per observation and use a maintained public-suffix parser, not the final two labels of every hostname.
- Separate “no citation observed” from “citations unavailable in provider output”. Retain failed collection counts outside successful-observation denominators.
- A cited third-party page is a **candidate gap** until we have inspected it and verified whether it actually mentions the client. Preserve the inspected version/date.
- If an LLM helps parse entities or sentiment, keep the raw response, parser version, extraction span and review state. The parser must not invent recommendations, ranking, citations or sentiment not supported by the answer.
- Fixed baseline and retest prompts, engines, locale and repeats are required for comparisons. Disclose platform drift and do not claim causation from a simple before/after change.

## Minimum architecture after the website launch

Private OS operator -> approved client protocol -> bounded async collector -> validated raw observation -> deterministic citation/entity extraction -> optional reviewed model parsing -> evidence-backed report -> approved implementation -> same-protocol retest.

Provider webhooks must authenticate or use an unguessable signed per-job mechanism, correlate to an existing job, validate size/schema, reject untrusted job ownership, and handle duplicate/out-of-order delivery. Never accept a client ID in a webhook as sufficient authorisation. Use real queue retries, terminal states, spend caps and idempotency keys.

Choose ONE collection provider initially. Run a small agreed test sample, compare it with an observed consumer surface, verify citations and cost accounting, then consider a second adapter. No paid calls, subscriptions, credentials or scraper services were configured in this website pass.

## Service boundaries

Schema and llms.txt are not guaranteed recommendation mechanisms. Google's official guidance says its AI features do not require new AI-specific markup or special AI files. [Google AI features](https://developers.google.com/search/docs/appearance/ai-features)

Reviews must come from genuine customers, and community participation must be relevant and transparent. Do not seed fake reviews, impersonate customers, promise editorial inclusion, or send mass outreach from an automatically generated gap list. Review outreach targets and claims before sending.

## Information needed from Kaushik

1. Is a hosted public audit job API deployed, or is the current artifact only the CLI?
2. Public API specification and sanitized example job/result/error payloads.
3. Dedicated visitor auth project URL/provider and account ownership design.
4. Confirmed pinned CLI commit, crawl budgets, SSRF protections, job timeout and report schema.
5. Hosting, queue, storage and spend limits. Keep internal MCP tokens and all provider secrets server-side.
