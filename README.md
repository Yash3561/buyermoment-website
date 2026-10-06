# ContextLumen

The service website for ContextLumen: AI search visibility, customer research, website messaging, and campaign planning.

## Stack

React 19, TypeScript, Vite, Lucide icons, and a custom responsive CSS system. Production output is prerendered HTML and static assets: the copy and contact links are readable before JavaScript loads, then React hydrates the menu and example switcher.

## Development

```sh
npm ci
npm run dev
npm run build
npm run check
npm run preview
```

The local server uses http://127.0.0.1:4173. The production build runs type checking, client and server compilation, and homepage prerendering. The build check validates the rendered brand, structured data, canonical URL, internal links, contact destination, and social assets.

## Deployment

Deploy the existing GitHub repository on Vercel using Vite, `npm run build`, and `dist` as the output directory. The repository name can remain `buyermoment-website`; it does not appear in the customer-facing brand.

The primary domain is `https://www.contextlumen.com`. Vercel's domain settings redirect `contextlumen.com` to www. Domain redirects are managed only in the Vercel dashboard, not duplicated in `vercel.json`. See [Domain setup](docs/domain-setup.md) for configuration and DNS precautions.

The existing `.openai/hosting.json` is historical Sites deployment metadata and is not used by Vercel.

## Project structure

- `src/App.tsx`: page sections and composition.
- `src/components/`: brand, navigation, illustrative example switcher, and contact flow.
- `src/content.ts`: central brand, domain, email, FAQs, examples, and scheduling configuration.
- `src/styles.css`: design tokens, responsive layouts, focus states, and reduced-motion support.
- `scripts/prerender.mjs`: rendered homepage and Organization/WebSite structured data.
- `scripts/check-build.mjs`: production output validation.
- `public/`: CL brand assets, social preview, robots file, and sitemap.
- `vercel.json`: build settings and baseline response headers. Domain redirects belong in Vercel's domain settings.
- `scripts/check-live.mjs`: read-only checks of both custom-domain hosts, redirects, live CSS/JavaScript, branding, and metadata. Run `npm run check:live` after deployment.

## Contact

All consultation buttons currently open an email draft to `ygc2@njit.edu`. Sending it remains the visitor's choice; the website does not submit or store enquiries.

Set `site.bookingUrl` in `src/content.ts` to a verified scheduling URL when ready. Buttons then open that URL in a new tab. No scheduler API key is required. Update `site.email` only after the company mailbox can receive mail.

## Brand and commercial principles

- ContextLumen pairs understanding the buyer's context with bringing the opportunity into focus.
- Ivory, deep charcoal, warm amber, editorial typography, and a custom CL mark form the visual identity.
- No public prices: scope, timing, and fees are confirmed in a written proposal.
- Paid campaign work depends on account access, approvals, and separately budgeted media spend.
- Examples are clearly illustrative, not case studies. No invented customers, testimonials, results, platform partnerships, or ranking guarantees.
- Visibility reporting uses documented samples and dates. Changes to AI answers are not automatically attributable to our work.
- Client implementation requires approval; confidential customer information should not be included in the initial email.
