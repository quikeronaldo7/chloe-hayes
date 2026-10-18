# Kate Anderson: digital travel shop

The storefront for Kate Anderson's guides, itineraries and travel tools: London, Paris and Amsterdam city lines, the Smart Traveller Playbook, three planners, and Japan in the works.

**Read first:** [`docs/AUDIT.md`](docs/AUDIT.md) covers the Drive audit, categories, bundles, IA, homepage strategy, visual direction and conversion strategy. [`docs/CATALOGUE.md`](docs/CATALOGUE.md) has the product and pricing table, with the source and approval status of every price. Screenshots are in [`docs/screenshots/`](docs/screenshots/).

```bash
npm install
cp .env.example .env.local      # demo checkout is on by default
npm run dev                     # http://localhost:3000
```

---

## 1. What was built

| Area | What exists |
|---|---|
| **Storefront** | Homepage, `/shop` (filterable, shareable URLs, tiered destination shelves), `/destinations` + one page per city, 29 product pages from one template, About, Help, legal, 404 and error pages |
| **Catalogue** | Typed product system in `src/catalogue/`: 29 items (20 individual products + 9 bundles); London, Paris, Amsterdam and Japan live, East Africa coming soon. Every price names its source and is locked in `scripts/price-lock.json`; checkout eligibility is derived per product from launch readiness (only the six London items pass today) |
| **Discovery** | Two doors (*Where are you going?* / *How do you travel?*), a three-tap **trip finder** ("which one do I need?"), shelf and city filters |
| **Conversion** | One-tap add-on at the buy button, honest "better together" bundle maths, launch pricing with a single switch, sticky mobile buy bar, a single post-purchase next step |
| **Checkout** | Bag + Buy now, Stripe Checkout (hosted, Apple Pay / Google Pay), server-side pricing and bundle reconciliation, success and cancelled pages, webhook fulfilment |
| **Delivery** | Private download library per order, signed short-lived download links, refunds revoke access, "resend my downloads" by email, private storage (local folder or S3/R2) |
| **Email** | Purchase email with library link (recorded as sent only when Resend accepts it); resend-my-links; newsletter signup (Resend Contacts segment or any webhook; says so honestly when not configured); *Before You Go* lead magnet; East Africa "hear first" |
| **SEO** | Per-page metadata and Open Graph, canonical URLs, `sitemap.xml`, `robots.txt`, JSON-LD (Organization, WebSite, Product + Offer, FAQPage, BreadcrumbList, CollectionPage, ProfilePage) |
| **Analytics** | One `track()` layer covering the funnel (§9). It forwards to Plausible and/or GA4 when configured |
| **Quality** | Lint, typecheck, catalogue integrity check, SigV4 test vector, axe accessibility audit, Lighthouse (§11) |

## 2. Design decisions

- **The concept is "the travel journal of someone with good taste".** Ivory paper, ink, one claret accent, hairline rules. The colours come straight from Kate's own PDFs (claret pull quotes, blush and sage panels), so the site and the products look like one studio made them.
- **Typography carries the premium feel.** *Newsreader* (a literary serif with a beautiful italic) for voice; *Instrument Sans* in spaced small caps for information. No gradients, glows or rounded SaaS cards.
- **One edition-cover system.** Most products (routes, planners) have plain text PDFs as covers, so every product gets the same printed cover: masthead, edition number, inset photograph, type line, title. Collections show a stacked edge. The catalogue reads like a set of books, and a new product only needs one photograph. Covers size themselves with container-query units.
- **Two doors, not a mega-menu.** People arrive with either a destination or a problem. Destinations are visual; tools are a short list.
- **"Guide or route?" is answered everywhere.** The source documents make it clear this is the buyer's real question. It's answered on the homepage, every city page and in the trip finder.
- **"Itinerary", not "Planner", for city routes.** The Drive uses "Ready-Made Planner" for both the city routes and the tools, which would confuse buyers. Product titles are unchanged.
- **Trust from specificity, not invented proof.** There are no reviews yet, and the Project Bible forbids inventing them. The site uses page counts, Last Checked dates, "What it isn't" lists and real interior previews instead. The `testimonials` field renders only when real ones exist.
- **Public previews are covers and promotional photography only.** No interior pages are published (the files aren't in `/public` either). Itinerary pages show the day-by-day outline that already appears in the sales copy, never timings or recommendations.
- **A light bag, not a heavy cart.** Buy now stays the fastest path from social traffic; the bag (V2) handles multi-item orders with the same bundle rules on browser and server (§5b).
- **Motion is quiet.** Slow fade-up reveals below the fold, gentle cover lift and photo zoom on hover. Everything respects `prefers-reduced-motion`, and the hero never animates (it would delay LCP).

## 3. Architecture

```
src/
├─ catalogue/
│  ├─ types.ts               Product, Destination, Price… (the schema)
│  ├─ products.ts            ← every product lives here
│  ├─ destinations.ts        ← every destination lives here
│  ├─ index.ts               helpers: pricing, bundles, lookups, labels
│  ├─ readiness.ts           launch-readiness status per product (V2)
│  └─ delivery.server.ts     server-only delivery manifest: pending, or FINAL files locked by SHA-256
├─ lib/
│  ├─ config.ts              public config (site URL, launch pricing switch)
│  ├─ analytics.ts           track() → Plausible / GA4 / dataLayer
│  ├─ money.ts
│  └─ server/                server-only (import "server-only")
│     ├─ stripe.ts           client + demo-mode guard
│     ├─ orders.ts           Stripe Checkout Session → Order (paid / unpaid / refunded, email state)
│     ├─ fulfilment.ts       webhook fulfilment: purchase email, idempotency, retry semantics
│     ├─ origin.ts           validated site origin (never localhost when deployed); relative support redirects
│     ├─ library.ts          order → library items with fresh signed links
│     ├─ tokens.ts           HMAC-signed library/download tokens
│     ├─ storage.ts          local folder (dev) or S3/R2: verify size + SHA-256, then presigned URL (SigV4, no SDK)
│     └─ email.ts            Resend adapter (typed accepted / skipped / failed) + templates
├─ components/               design-system components (cover, card, price, buy box…)
└─ app/
   ├─ api/checkout           POST: create Checkout Session from catalogue ids
   ├─ api/webhooks/stripe    POST: fulfil (email library link); 500 on failures Stripe should retry
   ├─ api/download/[token]   GET: verify order + file → stream (dev) / 302 to presigned URL; failures 303 to the support page
   ├─ api/subscribe          POST: newsletter
   ├─ api/resend-library     POST: email library links for an address
   └─ … pages
scripts/
├─ check-catalogue.ts        integrity check (ids, refs, images, delivery)
├─ test-launch-guards.ts     launch / test-fulfilment guards
├─ test-commerce.ts          bag rules, checkout validation, library, bonuses, savings
├─ test-launch-fixes.ts      origins, refunds, email acceptance + retries, bucket integrity, truthful responses
├─ verify-delivery.ts        re-hash every locked file in the configured storage
├─ storage-plan.ts           exact upload + verify commands for the locked files
└─ verify-presign.ts         SigV4 against AWS's published test vector
```

**Purchase flow**

```
Product page / bag ──POST /api/checkout {items}──▶ server reconciles + prices from catalogue
   ──▶ Stripe Checkout (hosted) ──paid──▶ /checkout/success?session_id=cs_…
          │                                   └─ verifies with Stripe, shows library instantly
          └─ webhook checkout.session.completed ──▶ email "Open your library" (signed link);
             Resend's email id is recorded on the session; the success page mentions email only then

/library/<signed token> ── re-verifies session with Stripe (refund = no access)
   └─ per file: /api/download/<30-minute signed token> ──▶ private file
```

**Stripe is the order database for V1.** Each Checkout Session carries the catalogue ids in `metadata.product_ids`, so there's no database to run. Bundles expand to their contents at delivery time. When accounts or re-download analytics are needed, add a small Postgres table keyed by session id; nothing else has to change.

**Stack:** Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS v4, Stripe, Resend, Vercel. Pages are statically generated; only checkout, webhook, download, signup, success and library run on the server.

## 4. Needs your input

**Prices:** every catalogue price is approved and locked (Wardrobe and Smart Traveller Collection set by the 5 Oct 2026 pricing hierarchy). A price alone doesn't make a product sellable: checkout also needs FINAL files, approved copy and imagery (see readiness). See [`docs/CATALOGUE.md`](docs/CATALOGUE.md).

| # | Decision | Where it lives | Current state |
|---|---|---|---|
| 1 | **Which PDF is master** for the Paris and Amsterdam guides ("Final" vs "Claude Version") | `delivery.server.ts` | "Final" |
| 2 | **Currency**: USD as in the pricing docs, though Kate is London-based | `config.ts` | USD |
| 3 | **AI persona disclosure**: About contains only canon facts. Decide whether and how to disclose | `about/page.tsx` | Not disclosed |
| 4 | **Legal pages**: drafts with a visible "not yet in force" notice. Details needed are listed below | `legal/[page]` | Draft |
| 5 | **Google Docs/Sheets "make a copy" links** need each source shared "Anyone with the link: Viewer" | `delivery.server.ts` | Not yet shared |
| 6 | **Paris companion map**: the delivered link is the Google Sheet map database | `delivery.server.ts` | Sheet |
| 7 | **Domain** (email and Instagram are set: kateanderson.travel@gmail.com, @kates.diary.xo) | `config.ts` | Domain not set |
| 8 | **Before You Go checklist**: first draft, needs Kate's review | `free/before-you-go` | Draft |
| 9 | **Launch pricing**: on/off switch, no end date shown | `NEXT_PUBLIC_LAUNCH_PRICING` | On |
| 10 | **Japan imagery**: none in the share; a Kyoto-style street photo is used | `destinations.ts` | Temporary |
| 11 | **"Route Pack" naming** (source says "Ready-Made Planner Pack") | `products.ts` | Route Pack |

### Business details and policy decisions needed for the legal pages

**Who is selling**
- Legal seller name and entity type (sole trader / Ltd / other), and whether "Kate Anderson" is a trading name of that entity
- Registered or trading address, and company number if a company
- VAT / sales-tax position: registered? Where? Whether to use Stripe Tax for UK/EU digital VAT (OSS/MOSS) and US sales tax
- Customer-service email (and phone if required), and expected response time
- Governing law and jurisdiction (e.g. England & Wales)

**Sales policy**
- Refund policy: none beyond statutory rights, case-by-case, or a stated guarantee (and its window and conditions)
- How the digital-content cancellation waiver is captured (currently checkout wording; optionally Stripe's required Terms checkbox)
- Licence terms: personal use only? Printing allowed? Sharing within a household? Gifting? Commercial use?
- Update policy: do buyers get future editions of a guide free, and for how long?
- Accuracy / liability wording for travel information (opening hours, entry rules, prices)
- Currency and whether displayed prices include tax

**Privacy**
- Data controller (the seller entity) and contact for data requests
- Processors actually used: Stripe, email provider (Resend or other), newsletter platform, analytics (Plausible and/or GA4), host (Vercel), file storage (R2/S3)
- Whether GA4 is used (it needs a cookie-consent banner in the UK/EU; Plausible doesn't)
- Retention periods for orders, emails and analytics
- Marketing consent wording for the newsletter and the East Africa "hear first" list

**Disclosures**
- Pangia: disclosed inside the products only (no site-wide disclosure, by decision 5 Oct 2026)
- AI-creator disclosure (item 3)

## 5. Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

With `npm run dev`, no Stripe key and `ALLOW_DEMO_CHECKOUT=true`, the purchase flow can be clicked through locally: Buy → success page → library, with a "demo checkout" banner. Since V2 a demo order receives only files locked FINAL in the delivery manifest; anything still pending shows the "temporarily unavailable" state. Demo orders never receive test placeholders (see §5a).

**Demo checkout can't grant access on a deployed site.** It needs all three of `NODE_ENV=development` (only `next dev`; every production build compiles it out), no Stripe key, and the explicit flag. Against a production build with the flag deliberately left on, the following were tested: checkout returns 503; a forged demo session shows "order not found"; a library link and a download link *signed with the real secret* for a demo session are refused (library error page; the download link 303s to the support page); an item that isn't launch-ready returns 409.

To test downloads of a FINAL product locally, put its locked artifact in `private-files/` (git-ignored) at the exact `key` recorded in `delivery.server.ts`. It is served only if its SHA-256 matches.

Useful scripts:

```bash
npm run check              # lint + typecheck + catalogue/readiness/price-lock check + LAUNCH-READINESS.md up to date
                           # + guard, commerce and launch-fix tests + local locked-file verification + SigV4 test vector
npm run check:catalogue    # run after any product change
npm run docs:readiness     # regenerate docs/LAUNCH-READINESS.md after changing readiness or delivery
npm run verify:delivery    # re-hash every FINAL file in storage against its locked SHA-256
npm run test:guards        # prove production can't sell non-ready items and placeholders can't leak
npm run test:fixes         # audit regressions: origins, refunds, email acceptance/retries, bucket integrity
npm run storage:plan       # upload + strict verify commands for the locked files
npm run qa:preview -- <https preview url> [--checkout]   # smoke checks against a deployed Preview
npm run qa:preview -- <https production url> --browse    # browsing-only Production: shop closed, pages load
npm run verify:storage     # strict bucket check, reading .env.storage.local (read-only token)
npm run dns:preflight -- <domain> <label>   # read-only DNS conflict check before adding Resend records
npm run build && npm start # production build
```

**Storefront mode** (`src/lib/storefront.ts`): a Vercel Production deployment is browsing-only unless `STOREFRONT_MODE=open`; Preview and local sell (test mode) unless `STOREFRONT_MODE=browse`. Browsing-only hides buy buttons and the Bag, and the checkout, library and download routes refuse on the server. See docs/LAUNCH-CHECKLIST.md §0a.

`next start` runs in production mode, which **requires `DOWNLOAD_TOKEN_SECRET`** (the site refuses to sign links with a default secret).

## 5b. Commerce (V2)

- **Bag:** Add to bag + Buy now on every product. A drawer (side panel on desktop, bottom sheet on phones) stores catalogue ids only (`localStorage`, synced across tabs). Rules live in `src/catalogue/cart.ts` and are shared by the browser and the server: no duplicates, bundles replace the editions they contain, covered editions are refused, a Collection supersedes its Route Pack.
- **Checkout:** `POST /api/checkout { items }` reconciles the bag again, checks every item's launch readiness, prices from the catalogue only, and creates one Stripe Checkout Session. Live keys are refused unless `LIVE_PAYMENTS_ENABLED=true`.
- **Library:** products with their locked files, bonuses (only once FINAL), order context, polished expired / unverified / unavailable states. Purchase email in Kate's voice, Reply-To Kate's address.
- **Free resources + bonuses:** `src/catalogue/resources.ts` (Before You Go lead magnet; True Trip Cost Calculator and Smart Traveller Toolkit bonuses, drafts until FINAL).
- **Tests:** `npm run test:commerce` (cart rules, checkout validation, metadata, library and bonuses).
- **Launch tasks** (storage, live Stripe, email domain, legal, tax): [`docs/LAUNCH-CHECKLIST.md`](docs/LAUNCH-CHECKLIST.md). `npm run storage:plan` prints the exact upload and verify commands for every locked file.

## 5a. Launch readiness & test fulfilment (V2)

Two layers, changed independently:

- **Storefront** (`products.ts`, `readiness.ts`, pages). Prices are preserved exactly; `scripts/price-lock.json` makes `npm run check` fail on any price change that isn't deliberate.
- **Customer delivery files** (`delivery.server.ts`). Every product is `pending` until Quike says "Product X FINAL". The exact artifact is then locked: Drive id and modified time, delivered filename, bytes, and **SHA-256 (the authoritative lock)**. Its storage key contains the hash. A pending entry delivers nothing, never the V1 file and never a newer Drive revision.

**Checkout eligibility is derived** (`src/lib/server/launch.ts`) from content, design, price approval, sales copy, delivery, imagery and page. Status per product: [`docs/LAUNCH-READINESS.md`](docs/LAUNCH-READINESS.md) (generated). In production, only launch-ready items can be bought; everything else gets a polite 409 while the storefront looks exactly as designed.

**Test fulfilment** lets the whole commerce flow be tested before final files exist. Test orders receive generated one-page PDFs stamped **TEST PLACEHOLDER — NOT FOR CUSTOMERS**. It works only when **all** of these hold:

1. `STRIPE_SECRET_KEY` starts with `sk_test_`
2. `VERCEL_ENV` is not `production`
3. `ALLOW_TEST_FULFILMENT=true`

and the order is a Stripe test-mode session (`livemode: false`, `cs_test_…`). A live payment or a local demo order can never receive a placeholder. Placeholders are generated per request and never stored, so they can't end up in a bucket. `npm run test:guards` proves each condition.

**Delivery failure** (no approved file, missing object, wrong size or SHA-256, storage credentials or timeout): the download link answers with a 303 to `/download-unavailable` (a *relative* Location, so a deployed site can never bounce a customer to localhost), which says "This download is temporarily unavailable. Please contact <support email> and we'll help you." The server logs a `[delivery-failure]` line with the reason but no secrets. Nothing else is ever served instead. Expired links and refunded orders get their own wording on the same page.

## 5c. Purchase email, retries and order states (Oct 2026 audit fixes)

**What counts as "emailed".** `sendEmail` returns `accepted` only when Resend answers 2xx with an email id. Missing `RESEND_API_KEY` or `EMAIL_FROM` is `skipped` (nothing sent; in local dev the text is printed, which never counts); network errors, timeouts, non-2xx and id-less responses are `failed`. Accepted means Resend took it, not that it reached an inbox.

**Webhook** (`src/lib/server/fulfilment.ts`). Every event re-reads the session with the charge expanded, so a delayed or replayed event never emails a refunded or still-pending order. Paid orders are emailed with Idempotency-Key `purchase-email/v2/<session id>` and a byte-identical payload (the purchase-email library link is pinned to order time + one year; links issued later, by resend-my-links or the success page, are fresh and valid for a year from that moment). On acceptance the session metadata gets `email_status=accepted`, `email_id`, `email_accepted_at`, `email_v=2`. Outcomes:

| Outcome | HTTP | Stripe |
|---|---|---|
| `emailed`, `already-emailed`, `refunded`, `not-paid`, `nothing-to-send` | 200 | done |
| `email-not-configured` (Preview today) | 200 | done: nothing recorded, success page stays neutral |
| `retry` (send failed, metadata write failed, Stripe read failed, no valid site origin) | 500 | redelivers |

Duplicates: concurrent or repeated deliveries inside Resend's 24-hour idempotency window produce one email. If a metadata write kept failing for more than 24 hours after Resend accepted, a later Stripe retry (Stripe retries for up to three days) could send a second, identical email. That is preferred to never sending; nothing here is exactly-once.

**Older test orders.** Orders fulfilled before this change may carry `delivery_emailed=true` on the PaymentIntent, which was also written when email was only logged. It is now ignored: those orders show the neutral success copy. Don't mass-resend or edit their metadata. To send one deliberately, use Help → resend, or replay its event from the Stripe dashboard once email is configured.

**Customer states.** Success page and library: paid → library (an email is mentioned only when recorded as accepted); refunded → "This order has been refunded. Downloads are no longer available for this order."; unpaid → processing (no email promise); not found → refresh / resend / support. Resend-my-links emails each paid, unrefunded order a **fresh** library link (valid a year from the request, so orders older than a year still get a working link; refunded orders get nothing, and a fresh signature never restores access). Its answer is identical for unknown, paying and refunded addresses and whatever happened afterwards (accepted, provider failure or lookup failure: failures are only logged, there is no retry queue), so the Help page shows a neutral acknowledgement (`src/lib/resend-copy.ts`) that promises no send and points to support. If email isn't configured, everyone gets the same "we can't send emails right now" answer.

**Newsletter.** "You're on the list" appears only after a confirmed signup: a 2xx from `NEWSLETTER_WEBHOOK_URL` (a 409 or any other status is a failure), or, with `RESEND_SEGMENT_ID`, a verified Resend outcome. The address is looked up first: a new contact is created in the segment (success needs a contact id); an existing subscribed contact is confirmed in the segment (added and re-read if needed); an existing **unsubscribed** contact is left unchanged (their choice stands). Failures and unchanged unsubscribes get the same "We couldn't add you just now…" message with the support address. `RESEND_AUDIENCE_ID` (deprecated API) counts only a 2xx.

## 6. Deploy (Vercel)

Current setup: Vercel project `kate-anderson`, separate from any other project. Preview deployments are built from the `claude/kate-anderson-product-site-efnm66` branch.

1. Import the repo into Vercel (framework: Next.js; no build settings needed).
2. Add the environment variables from `.env.example`:
   - `NEXT_PUBLIC_SITE_URL`: this deployment's HTTPS URL (the stable Preview alias now, the final domain for Production). Redeploy after changing it: `NEXT_PUBLIC_*` values are baked into the build. A deployed site never falls back to localhost: server-side links use this, else Vercel's `VERCEL_BRANCH_URL` / `VERCEL_PROJECT_PRODUCTION_URL`, and refuse to start checkout if none is a valid HTTPS origin.
   - `DOWNLOAD_TOKEN_SECRET`: generate with `openssl rand -base64 48`
   - Stripe, storage and email keys (below)
   - `ALLOW_DEMO_CHECKOUT` has no effect in production builds; leave it unset anyway.
   - `ALLOW_TEST_FULFILMENT=true` only on the **Preview** environment with a `sk_test_` key. Never set it for Production. Even if set, it is ignored there (`VERCEL_ENV=production`).
3. Add your domain in Vercel → Domains.
4. Deploy. Then submit `https://yourdomain.com/sitemap.xml` in Google Search Console.

**Product files (production storage):** use a private Cloudflare R2 bucket (no egress fees) or S3.

```
STORAGE_DRIVER=s3
S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
S3_BUCKET=kate-anderson-products
S3_REGION=auto
S3_ACCESS_KEY_ID=…            # R2 API token with Object Read only
S3_SECRET_ACCESS_KEY=…
```

Upload only FINAL artifacts, each to the exact `key` locked in `src/catalogue/delivery.server.ts`, with a separate **write** credential (`npm run storage:plan` prints the commands). Then run strict `STORAGE_DRIVER=s3 npm run verify:delivery` with the read-only runtime credentials. The bucket must stay private.

Before each download the site HEADs the object (it must exist with the locked byte count) and, unless this server instance already hashed that exact ETag, downloads and SHA-256s it server-side; only then does the customer get a 5-minute presigned URL and download straight from the bucket (the 7.4 MB London Guide never passes through a Function response). On a versioned bucket the URL is pinned to the verified version. On R2 (no versioning), the remaining check-to-download window can only be exploited by someone holding upload credentials; keep those off Vercel.

**Email:** create a Resend account, verify the sending domain, set **both** `RESEND_API_KEY` and `EMAIL_FROM` (a sender on that domain; never a Gmail address). Replies go to kateanderson.travel@gmail.com. Without both, purchase emails are *not sent* (the webhook records nothing and the success page doesn't claim an email). For the newsletter, set `RESEND_SEGMENT_ID` (Resend Contacts → Segments; `RESEND_AUDIENCE_ID` still works but uses Resend's deprecated Audiences endpoint), or `NEWSLETTER_WEBHOOK_URL` for Kit, Beehiiv, Zapier etc. Without one, signup says the list isn't open yet.

## 7. Connect Stripe

1. **Keys**: Stripe Dashboard → Developers → API keys. Set `STRIPE_SECRET_KEY` (start with `sk_test_…`).
2. **Webhook**: Developers → Webhooks → Add endpoint `https://yourdomain.com/api/webhooks/stripe`, with events `checkout.session.completed` and `checkout.session.async_payment_succeeded`. Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.
   - Locally: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
3. **Branding**: Settings → Branding (logo, ivory `#F6F1E8` background, ink `#1E1B18` button) so Checkout matches the site. Enable Apple Pay / Google Pay under Payment methods.
4. **Terms and tax (recommended)**: add your Terms URL in Settings → Public details, then set `STRIPE_REQUIRE_TERMS=true`. For VAT on digital goods to UK/EU buyers, enable Stripe Tax and set `STRIPE_AUTOMATIC_TAX=true`.
5. **Prices**: nothing is required. Without Price IDs, checkout sends the catalogue price inline. For Stripe-side reporting, create Products/Prices in Stripe and add them to the product: `stripe: { priceId: "price_…", launchPriceId: "price_…" }`.
6. **Test in Stripe test mode (on a Vercel Preview deployment with test keys):**
   1. Upload at least one product's files to the bucket (or use `STORAGE_DRIVER=local` only on your own machine).
   2. Buy a cheap item with card `4242 4242 4242 4242` and an inbox you can read. Check that Checkout shows the right title, price and launch price, plus the instant-access wording.
   3. Success page: the library shows every file; each download opens the right file with a sensible filename.
   4. Email: the purchase email arrives from your verified domain (check spam), and its "Open your library" link works in a private window.
   5. Webhook: Stripe → Webhooks shows `checkout.session.completed` delivered with a 200 whose body says `"fulfilment":"emailed"`, and the **Checkout Session** metadata has `email_status=accepted`, `email_id`, `email_accepted_at`, `email_v=2`. Resending the event must answer `already-emailed` with no second email. A 200 alone proves nothing: with email unconfigured it answers `email-not-configured`.
   6. Bundle: buy a collection and confirm every contained edition appears.
   7. Add-on: buy a guide with the route add-on ticked; both appear.
   8. Resend: use Help → "Lost your download link?" with the buyer email; a links email arrives. An unknown address shows the same neutral answer.
   9. **Refund removes access:** fully refund the payment in the dashboard (no extra webhook needed: access is checked against Stripe on every visit), then reload the success page and library link (both must say "This order has been refunded.") and an old download link (must land on the support page saying the same).
   10. 3-D Secure card `4000 0027 6000 3184` and a declined card `4000 0000 0000 0002`: the cancelled path returns to the product with no access.
   11. Items that aren't launch-ready can't be bought in Production (409, "being finalised").
7. **Go live**: swap in live keys and a live webhook secret.

Prices are always computed on the server from the catalogue, and the client can only request catalogue ids plus the one add-on the catalogue allows for that product.

## 8. Add a new product

1. **Copy an existing entry** in `src/catalogue/products.ts` (a city route can use the `itinerary()` helper) and give it a new `id` (permanent: it's stored in Stripe), `slug`, `edition`, price in cents, copy and `cover` photo. Add it to the `products` array.
2. **Add its photo** to `public/images/…`. JPEG, max about 1800px; Next.js serves resized WebP automatically.
3. **Add its readiness record** to `src/catalogue/readiness.ts` and a `pending` entry (its expected files) to `src/catalogue/delivery.server.ts`. Add its approved price to `scripts/price-lock.json`. Files are locked only on "FINAL" (see §5a).
4. *(Optional)* Add it to a collection's `includes`, or another product's `related` / `addOn`.
5. **New city?** Add it to `destinations.ts`. Its page, nav, footer, shop filter, sitemap and trip finder entries follow automatically. (The trip finder lists its cities explicitly in `trip-finder.tsx`; add the city there too.)
6. Run `npm run check:catalogue`. It catches broken references, missing images and products with nothing to deliver.

That's it. Pages, cards, SEO, structured data, sitemap, checkout and delivery all come from the catalogue.

## 9. Analytics events

`product_viewed` · `bundle_viewed` · `product_cta_clicked` · `add_on_toggled` · `checkout_started` · `checkout_failed` · `purchase_completed` (once per order, with value) · `trip_finder_completed` · `email_signup` · `library_opened` · `download_clicked` · `shop_filtered`

Set `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` (revenue goals supported) and/or `NEXT_PUBLIC_GA_ID`. The webhook also logs each purchase server-side.

## 10. Security notes

- Paid files are never in `/public` and never in git (`/private-files` is ignored).
- Library links are HMAC-signed and re-verified against Stripe on every visit; download links expire after 30 minutes; fully refunded orders lose access.
- Links that leave the site (Stripe return URLs, emails) use a validated HTTPS origin; support redirects are relative. Request Host headers are never trusted for this.
- Bucket objects are verified against the locked size and SHA-256 before a signed URL is issued; the runtime storage key is read-only.
- Google "make a copy" links only reach the browser on a verified customer's library page.
- Download filenames are header-safe (RFC 5987); local storage is guarded against path traversal.
- `/library`, `/checkout`, `/api` and `/free` are excluded from indexing.

## 11. Checks run before handover

- `npm run check`: lint, typecheck, catalogue integrity (29 items, 20 delivery entries), readiness doc up to date, guard/commerce/launch-fix tests, SigV4 presigner matches AWS's published test vector.
- **End-to-end demo purchase** (dev build): checkout → success → library → real PDF downloads; tampered download token → 303 to the support page; tampered library link → friendly error; disallowed add-on ids ignored.
- **Demo lockout** (production build): see §5. Items that aren't launch-ready are refused by the checkout API (409).
- **axe (WCAG 2.1 AA)** on 10 key pages: no violations.
- **Lighthouse (mobile, simulated 4G)**: Accessibility, Best Practices and SEO all 100. Performance: product pages 96, city 94, shop 93, about 91, homepage 86–90. CLS 0 everywhere.
- **Visual QA** at 1440px and 390px.
- **Not yet tested against live Stripe, Resend or a real bucket.** Do step 6 of §7 on Preview, with email and storage configured, before launch. A green build or a webhook 200 is not launch evidence.

## 12. What I'd do in V2

1. **Real social proof.** Collect quotes from beta testers and first buyers (the post-purchase email is the natural place to ask) and switch on the testimonial slot.
2. **Interactive city maps.** The Paris guide's 81-pin map is a differentiator worth showing on the product page as a blurred, pin-only teaser, and worth building for London and Amsterdam.
3. **An "Edition sampler" lead magnet per city.** One real day from a route ("Sunday in London") in exchange for an email. It's a better give than a generic checklist and pre-sells the route.
4. **Customer accounts** (magic link): one library for all purchases, plus update notifications when an edition's Last Checked date changes.
5. **Gift purchases**: buy for someone else's email, with a scheduled send.
6. **Multi-currency pricing** (GBP/EUR via Stripe adaptive pricing) for Kate's European audience.
7. **Journal / city notes**: short, useful free articles per city ("Rainy London, done well") for SEO and Instagram link-in-bio. Build it only when there's real content.
8. **Rate limiting** on signup and resend endpoints (Vercel firewall or Upstash) once traffic warrants it.
9. **Faster homepage LCP**: serve the hero from a CDN-cached, pre-sized asset and test a blurred placeholder.
10. **The Style shelf**: when the Wardrobe line grows (roadmap), promote "How do you dress?" to a third door. The data model already has `pillar: "style"`.
