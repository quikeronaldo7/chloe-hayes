# QA report (18 October 2026)

Run in a cloud container against a local production build (`next build && next start`) and `next dev` (demo checkout). No deployed preview was available (Vercel API blocked from this session), so nothing here was run against Vercel or with a live webhook.

## Automated

| Check | Result |
|---|---|
| `npm run lint` | Pass (0 problems) |
| `tsc --noEmit` | Pass |
| `npm run build` | Pass: 30 routes (static home/shop/about/help/collections/guides/legal; dynamic checkout, library, API) |
| `npm run test:chloe` | **180 passed, 0 failed**: catalogue integrity (titles/pages vs PDFs, images exist, alt text, no PDFs in /public), delivery manifest, price books (no approved prices; test prices gated three ways; Production never), bag rules, storefront isolation from Kate's sessions, tokens (tamper, expiry, cross-site), library (locked file vs placeholder vs unavailable), webhook fulfilment (emailed / already / refunded / unpaid / Kate's order / provider failure / not configured), email branding, checkout API (409 with no prices, 400/404 on bad input, browser prices ignored, live key never unlocks test prices, no origin → 503) |
| `npm run verify:delivery` | Hill Country verified locally (size + SHA-256) |
| axe-core 4 (WCAG 2 A/AA + best practice) | 0 violations: /, /shop, /collections/explore-and-escape, /guides/new-to-austin, /guides/12-best-date-ideas, /about, /help, /legal/terms, /checkout/cancelled, each at 1440 and 375 px. (Terracotta darkened to #9d472d to pass) |

## Browser flow (Playwright, 390 px, `next dev`, demo checkout)

1. Hill Country guide page shows "$1 · Test price" → **Add to bag** → bag count 1.
2. Natural Gems page → **Add bundle (test)** "Weekend Explorer" → note: "Weekend Explorer replaces Chloe's Perfect Hill Country Escapes, which it already includes." Bag still 1 item, $2.
3. **Checkout** → success page "You're all set." → bag emptied.
4. Library lists both guides together: Hill Country with a **Download** button, Natural Gems with the honest "isn't ready yet" state (file pending).
5. Download saved as `Chloe's Perfect Hill Country Escapes.pdf`; **sha256 = locked hash**.
6. Library link reopens the library; a garbage library token → "This library link isn't working"; a garbage download token → `/download-unavailable?reason=expired`; cancelled page → "No payment was taken."

## External services (real calls, test-safe)

| Call | Result |
|---|---|
| Stripe (test mode): create 6 Chloe Products (+1 found already) | Created with `storefront=chloe-in-austin` metadata |
| Stripe (test mode): Checkout Session with the app's exact parameters | Accepted (`cs_test_b1sj…`), unpaid, auto-expires |
| Stripe (test mode): `branding_settings` display name "Chloe in Austin" | Accepted and echoed |
| Resend: purchase email from `Chloe in Austin <hello@chloeinaustin.com>` to `delivered@resend.dev` | **Delivered** (id `01a14de3-4623-7d9b-8243-ffd3abf182e4`) |
| Resend domains | `chloeinaustin.com` verified, sending on, receiving off |
| Cloudflare R2 | `chloe-hayes-products` exists (no upload: no S3 credentials in this session) |

## Responsive

Full-page screenshots at 1440, 768 and 375 in `docs/screenshots/`. No horizontal page scroll at 375 (elements wider than the viewport are inside intentional scroll rails or clipped cards).

## Not tested here

- A real Stripe test payment with a webhook delivery (needs the deployed preview + webhook secret).
- Email sent by the app itself (needs `RESEND_API_KEY` in the environment; the template was sent via the Resend connector instead).
- R2 presigned downloads (needs a read-only token).
- Lighthouse scores on Vercel; DNS/redirect from www.
