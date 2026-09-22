# Motivory

The service website for a seven-day customer research and campaign-planning sprint.

## Stack

React 19, TypeScript, Vite, Lucide icons, and a custom responsive CSS system. Production output is prerendered HTML and static assets: the actual service copy is readable before JavaScript loads, then React hydrates the menu, example switcher, and enquiry form.

## Development

```sh
npm ci
npm run dev
```

Local preview: http://127.0.0.1:4173. Run `npm run build` for type checking, client and server builds, and homepage prerendering. `npm run preview` serves the production build.

## Project structure

- `src/App.tsx`: page sections and composition.
- `src/components/`: brand, navigation, interactive evidence example, and contact flow.
- `src/content.ts`: brand details, pricing, example content, FAQs, and contact configuration.
- `src/styles.css`: colour tokens, typography, responsive layouts, reduced-motion support.
- `scripts/prerender.mjs`: writes the rendered React page into the built HTML entry point.
- `.openai/hosting.json`: identity of the existing Sites deployment; assets publish from `dist/`.

## Contact setup — required before outreach

Set `site.email` in `src/content.ts` to an inbox the team actually owns and monitors. Optionally set `site.bookingUrl` to a real booking page. No unverified email address is published.

Until an inbox is configured, the form explicitly says nothing is sent and allows prospects to prepare, copy, or download a brief. With an inbox configured, it opens an email draft for the visitor to send. It is not a server-backed form and does not claim to have delivered or stored a lead. If the team wants automatic lead capture later, add a real endpoint and delivery/error handling.

## Commercial and design decisions

- Motivory is the approved service name. The existing GitHub repository and hosted URL keep their original identifiers.
- $750 USD is the existing founding sprint price, not a recurring subscription.
- Research and planning are included. Media spend, creative production, management, and optional AI-search work are separately scoped.
- All example conversations are clearly labelled as illustrative. No invented testimonials, results, customers, platform partnerships, or scarcity claims.
- ChatGPT advertising is described as dependent on advertiser access and fit; there is no promise of universal placement.
- Website access remains as configured in Sites. Confirm the public audience and contact destination before sending this site to prospects.

See `docs/design-references.md` for the reference research and original visual direction.
