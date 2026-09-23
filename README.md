# Motivory

The service website for a seven-day customer research and campaign-planning sprint.

## Stack

React 19, TypeScript, Vite, Lucide icons, and a custom responsive CSS system. Production output is prerendered HTML and static assets: the service copy and booking links are readable before JavaScript loads, then React hydrates the menu and example switcher.

## Development

```sh
npm ci
npm run dev
```

Local preview: http://127.0.0.1:4173. Run `npm run build` for type checking, client and server builds, and homepage prerendering. `npm run preview` serves the production build.

## Project structure

- `src/App.tsx`: page sections and composition.
- `src/components/`: brand, navigation, interactive evidence example, and contact flow.
- `src/content.ts`: brand details, example content, FAQs, and booking configuration.
- `src/styles.css`: colour tokens, typography, responsive layouts, reduced-motion support.
- `scripts/prerender.mjs`: writes the rendered React page into the built HTML entry point.
- `.openai/hosting.json`: identity of the existing Sites deployment; assets publish from `dist/`.

## Contact setup

Set `site.bookingUrl` in `src/content.ts` to the team's verified Calendly event URL. This connects the header, hero, consultation, and final booking buttons to the same event in a new tab. No API key or Calendly script is required.

Until a booking URL is supplied, all primary calls to action open an email draft addressed to `ygc2@njit.edu`, with a Motivory enquiry subject. The contact section also displays the address for visitors who prefer webmail. Sending the email is up to the visitor; the website does not submit or store enquiries. Once configured, booking completion and confirmation are handled by Calendly.

## Commercial and design decisions

- Motivory is the approved service name. The existing GitHub repository and hosted URL keep their original identifiers.
- No public rates or starting prices. Scope, timing, and fees are discussed in the consultation and confirmed in a written proposal.
- Research and planning are included. Media spend, creative production, management, and optional AI-search work are separately scoped.
- All example conversations are clearly labelled as illustrative. No invented testimonials, results, customers, platform partnerships, or scarcity claims.
- ChatGPT advertising is described as dependent on advertiser access and fit; there is no promise of universal placement.
- Website access remains as configured in Sites. Confirm the public audience and contact destination before sending this site to prospects.

See `docs/design-references.md` for the reference research and original visual direction.
