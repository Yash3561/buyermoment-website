# Connect contextlumen.com

The production address is `https://www.contextlumen.com`. The apex domain redirects to www. Domain redirects must have one owner: Vercel's domain settings. Do not add an opposing www-to-apex redirect in `vercel.json`.

1. Open the existing Vercel project connected to `Yash3561/buyermoment-website`.
2. In Settings → Domains, add `contextlumen.com` and `www.contextlumen.com`. Assign www to the production deployment; redirect the apex to www.
3. In Spaceship's domain DNS settings, copy the exact A and CNAME records Vercel shows for this project. Do not guess a Vercel IP or CNAME: project-specific values can differ.
4. Keep existing email MX records, verification TXT records, and unrelated subdomains intact. There is no need to change nameservers just to connect the website.
5. Wait for Vercel to mark the domains valid and issue HTTPS. Test both domains, the apex-to-www redirect, and all email buttons on mobile. Run `npm run check:live` after a production build to check the live assets as well as the homepage.
6. If you change hosting providers later, update the canonical URL, sitemap, social card URLs, and structured data together.

Official instructions: [Vercel custom domains](https://vercel.com/docs/domains/working-with-domains/add-a-domain).

## Avoid redirect loops

An HTML page can appear to load even when its CSS and JavaScript fail. Check asset URLs too. Opposing host redirects can send asset requests back and forth until the browser rejects them.

For this deployment, the Vercel dashboard owns the apex-to-www redirect. `vercel.json` intentionally contains no domain redirect. Do not change Spaceship DNS to solve an application redirect loop.

If you later choose the apex as primary, switch both Vercel domain assignments together and update the canonical URL, social metadata, sitemap, robots file, and `site.url` in the same release.

## Contact and scheduling

The page currently sends enquiries to `ygc2@njit.edu`, the verified working inbox. The domain purchase has not created `hello@contextlumen.com`.

When a company mailbox is working, update `site.email` in `src/content.ts`, test incoming and outgoing mail, and rebuild. Before outbound outreach, configure the mailbox provider's SPF, DKIM, and DMARC records and check delivery.

To use a scheduler, add the team's verified HTTPS booking URL to `site.bookingUrl` in the same file. Without a booking URL, all consultation buttons use email.
