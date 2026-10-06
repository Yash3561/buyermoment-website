# Contact and brand handoff

`src/content.ts` is the source of truth for the email address, company name, canonical domain and scheduling link. Current inbox: `yashchaudhary@contextlumen.com`. All contact CTAs, checker result drafts, error help links and Organization structured data use that value. Sending remains a visitor action; there is no silent email submission or unconnected contact form.

The contact section includes a copy-address fallback for webmail users. `site.bookingUrl` uses the verified public 30-minute Calendly event (https://calendly.com/yashchaudhary3561/30min), with an optional VITE_CALENDLY_URL override. Do not display a fake Book now destination.

## Public DNS check, October 6, 2026

- MX: mx.zoho.com (10), mx2.zoho.com (20), mx3.zoho.com (50).
- SPF: v=spf1 include:zohomail.com ~all.
- DMARC: no record was returned at _dmarc.contextlumen.com.

This checks public DNS, not mailbox existence, successful delivery, outgoing DKIM signatures, provider account health, or spam placement. No test message was sent. Inspect DKIM and domain authentication in the Zoho admin console; use the provider's exact record values and actual DKIM selector. Do not guess a DKIM record or introduce a reject DMARC policy before checking all legitimate senders. Validate end to end by sending a normal message to an external inbox and replying to it; inspect authentication results in the received headers.

## Brand consistency

`public/logo.svg` is the single website mark. `BrandMark` renders that asset everywhere; header and footer share `Brand`. `public/favicon.svg` must be identical. `scripts/render-brand-assets.mjs` generates the share image by embedding the exact SVG, rather than redrawing the mark. The production build check validates logo consistency, email destination, canonical URL, internal anchors and share-image dimensions.
