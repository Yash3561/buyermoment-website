# ContextLumen

Service-first AI search visibility, website improvements, and campaign research. The website uses React 19, TypeScript, Vite, Lucide icons, and a custom responsive design system.

## Pages

- `/`: services, concrete illustrative work, deliverables, process, FAQs and contact.
- `/audit`: evidence-based homepage readiness check, verified-email account flow and one successful free audit per account.
- `/book`: opt-in Calendly embed with an external calendar link and email fallback.

All three pages are prerendered with page-specific metadata and shared navigation. The public audit does not measure live AI mentions or award a visibility score. Sign-in stays disabled until the dedicated backend is configured.

## Development

```sh
npm ci
npm run dev:api
npm run dev
npm run test
npm run build
npm run check
npm run preview
```

Run the API and frontend in separate terminals. Frontend: http://127.0.0.1:4173. The build type-checks, bundles client/server code, and prerenders each route into dist.

If Windows denies Vite's esbuild child process with EPERM, do not disable security protections. Use an authorized build environment or the Vercel preview build. The native-esbuild source preview is a diagnostic fallback, not proof that the production Vite build passed.

## Deployment and accounts

Vercel project: `motivory`. Git repository: `Yash3561/buyermoment-website`. Primary domain: https://www.contextlumen.com. Domain redirects are managed only in Vercel domain settings, never duplicated in vercel.json.

Follow [audit launch checklist](docs/audit-launch.md) before enabling public audits. Copy the variable names in .env.example into provider settings. Never commit live keys. The public website's database must stay separate from internal agency client records and MCP.

Current verified Calendly event: https://calendly.com/yashchaudhary3561/30min. Override using VITE_CALENDLY_URL and rebuild; only HTTPS calendly.com event URLs are accepted. Set an invalid/empty override to use the honest email fallback. Loading the embed is a visitor choice and does not automatically book an appointment.

Contact email: yashchaudhary@contextlumen.com. Mailto links open a draft; no message is sent automatically. No public price list, invented testimonials, client logos, fabricated results or ranking guarantees. Fees and scope are agreed in a proposal.

## Structure

- src/App.tsx: homepage and shared shell
- src/pages/: audit and booking routes
- src/components/: reusable navigation, branding, contact and report UI
- src/auth.ts: lazy-loaded public sign-in client
- src/content.ts: brand, email, FAQs and calendar config
- src/styles.css: ivory/evergreen/amber palette, type scale, responsive layouts, focus and reduced-motion states
- api/check.js: authenticated server endpoint
- lib/: safe public fetches, evidence analysis and private account adapter
- supabase/migrations/: database-enforced audit allowance and restricted RPCs
- scripts/: prerender, build/live checks and diagnostic utilities
- tests/: scanner, endpoint and account tests
- public/logo.svg: single mark reused in navigation, footer, favicon and generated social card

See [checker methodology](docs/checker-method.md), [domain setup](docs/domain-setup.md), and [contact setup](docs/contact-setup.md). Historical .openai/hosting.json is not used by Vercel.
