# Chloe in Austin 🌵

The storefront for Chloe Hayes's seven Austin guides: **chloeinaustin.com** (QR DIGITAL).

> Good food. Great plans. Your Austin, sorted.

Built on the engineering of the Kate Anderson shop (server-priced Stripe Checkout, webhook fulfilment, private library, signed downloads, Resend email), adapted into an **independent project** with its own catalogue, design, Stripe products and metadata, storage bucket, email identity and tests. Kate's repository, site, Stripe objects, webhooks and bucket are untouched.

**Read next:** [`docs/LAUNCH-CHECKLIST.md`](docs/LAUNCH-CHECKLIST.md) (what's built, what's waiting on whom) · [`docs/CATALOGUE.md`](docs/CATALOGUE.md) (every product fact and its source) · [`docs/IMAGERY.md`](docs/IMAGERY.md) (image sources and rights) · [`docs/DELIVERY.md`](docs/DELIVERY.md) (locking and uploading the PDFs) · [`docs/QA.md`](docs/QA.md) (test results) · [`docs/screenshots/`](docs/screenshots/)

```bash
npm install
cp .env.example .env.local      # demo checkout works locally with no Stripe key
npm run dev                     # http://localhost:3000
npm run check                   # lint + typecheck + 180 tests + delivery + SigV4
```

---

## 1. What's here

| Area | What exists |
|---|---|
| **Pages** | Home, Shop All, 4 collection pages, 7 guide pages (one template), About, Help (with "Resend my downloads"), legal placeholders (clearly not in force), checkout success / cancelled, private library, download-unavailable, 404, error, Journal shell |
| **Catalogue** | `src/catalogue/`: 7 guides with facts from the FINAL PDFs, 4 collections, 4 **bundle proposals** (preview-only, no price, no saving), readiness, delivery manifest |
| **Prices** | None approved. Every guide shows **Price coming soon**. An isolated **test price book** ($1/guide, Stripe test mode only, never Production) drives end-to-end QA |
| **Bag & checkout** | Add to bag, Buy now, multi-item bag, bundles absorb their guides, covered/duplicate items refused, server re-prices everything, promo codes at Stripe, Chloe-branded hosted checkout on the shared QR DIGITAL account |
| **Fulfilment** | Webhook re-reads the session, emails a Chloe-branded library link via Resend (idempotent), records it on the session; refunds revoke library and downloads on every visit |
| **Delivery** | Private R2 bucket `chloe-hayes-products`; files locked by SHA-256 and re-verified before a 5-minute signed URL; never in `/public`; pending files are never substituted |
| **Isolation from Kate** | Product ids `cia-*`; every session tagged `storefront=chloe-in-austin` and fulfilment ignores anything else; tokens carry a site claim; separate secrets |
| **SEO** | Metadata + canonical per page, sitemap, robots (previews disallow all and are `noindex`), JSON-LD (Organization, WebSite, Product without invented offers, FAQPage, BreadcrumbList, CollectionPage, ProfilePage) |
| **Quality** | ESLint, TypeScript, 180 automated tests, axe (WCAG 2 A/AA) clean on 9 pages × 2 widths, Lighthouse-friendly static pages |

## 2. Design

- **Concept:** a modern Austin editorial lifestyle magazine meets a curated digital-goods boutique. Warm, sunny and social, against Kate's restrained claret-and-ink.
- **From the guides themselves:** the PDFs are set in **Fraunces** and **DM Sans** on cream with forest green and terracotta, with a "ch" tip box. The site uses the same pair and palette (terracotta darkened to `#9d472d` for WCAG AA), so the shop and the product feel like one studio made them.
- **Playful but premium:** soft Fraunces italics for accents, rotated stickers, an arched hero photo, a topic marquee, colour-block "Find your Austin" doors, booklet-style covers with a spine shadow. Motion is gentle and respects `prefers-reduced-motion`.
- **Covers:** the real cover where it could be retrieved (Hill Country: page 1 of the PDF; Date Ideas: the approved cover export). Elsewhere a **typeset cover** in the guides' own style, labelled as a website rendering (see docs/IMAGERY.md for why).
- **Honesty is designed in:** "What it isn't" on every guide, a dashed "Good to know" caveat panel, page counts and check dates as chips, no reviews, ratings, counters or bestseller labels.

## 3. Architecture

```
src/
├─ catalogue/            safe for the browser unless *.server.ts
│  ├─ products.ts        the 7 guides (facts from the FINAL PDFs)
│  ├─ collections.ts     4 collections + 4 bundle proposals
│  ├─ pricing.ts         price books: approved (empty today) and test
│  ├─ cart.ts            bag rules shared by browser and server
│  ├─ readiness.ts       launch readiness per item
│  └─ delivery.server.ts what each guide delivers (locked by SHA-256, or pending)
├─ lib/server/           server-only
│  ├─ pricing.ts         which price book this deployment uses (test needs sk_test_ + not Production + flag)
│  ├─ launch.ts          checkout eligibility (derived)
│  ├─ orders.ts          Stripe session → order; storefront isolation
│  ├─ fulfilment.ts      webhook: email once, retry safely
│  ├─ library.ts         order → guides + fresh signed links
│  ├─ tokens.ts          HMAC library/download tokens with a site claim
│  ├─ storage.ts         local (dev) or R2: verify size + SHA-256, presign (SigV4, no SDK)
│  └─ email.ts           Resend adapter + Chloe templates
├─ components/           cover, product card, bag, buy box, sections, library…
├─ journal/              Austin Journal content model (empty until approved articles exist)
└─ app/                  pages + api/{checkout, webhooks/stripe, download/[token], resend-library}
```

Purchase flow:

```
Guide page / bag ──POST /api/checkout {items}──▶ reconcile + price on the server (price book)
   ──▶ Stripe Checkout (QR DIGITAL, branded "Chloe in Austin", metadata storefront=chloe-in-austin)
   ──paid──▶ /checkout/success  (verifies with Stripe, shows the library at once)
   └─ webhook checkout.session.completed ──▶ Resend: "Open my library" (signed link, idempotent)
/library/<token>  re-checks the order with Stripe on every visit (refunded = no access)
   └─ /api/download/<30-min token> ──▶ verify size + SHA-256 ──▶ 5-minute signed R2 URL
```

**Stripe is the order database** (as for Kate): the Checkout Session holds the product ids, email and payment state. Both stores share the QR DIGITAL account, so **every webhook endpoint receives both stores' events**. Chloe's code only acts on sessions tagged `storefront=chloe-in-austin`; Kate's code ignores Chloe's product ids (verified by reading `kate-anderson/src/lib/server/orders.ts`: unknown ids are filtered, so Kate's webhook answers `nothing-to-send`).

## 4. Environments

| Setting | Local | Preview (protected) | Production |
|---|---|---|---|
| Stripe key | none (demo) | `sk_test_…` | `sk_test_…` until launch |
| `CHLOE_TEST_COMMERCE` | – | `true` | never |
| Prices | test (demo) | test ($1, labelled) | approved only (none today) |
| `STOREFRONT_MODE` | – | – | unset = browsing-only |
| Bundle proposals | shown | shown | hidden |
| Storage | `private-files/` | R2 read-only token | R2 read-only token |
| robots | – | disallow all + noindex | allow (after launch) |

All variables: [`.env.example`](.env.example). `next start` requires `DOWNLOAD_TOKEN_SECRET` (32+ chars, unique to Chloe).

## 5. Scripts

```bash
npm run check             # everything below except storage
npm run test:chloe        # catalogue integrity, price books, bag rules, isolation, tokens, library, webhook, email, checkout API
npm run verify:delivery   # re-hash locked files in the configured storage
npm run storage:plan      # exact upload + strict-verify commands for the locked files
npm run storage:hash -- <key>   # hash an object already in the bucket (to lock large files)
npm run verify:storage    # strict bucket check using .env.storage.local (read-only token)
npm run verify:presign    # SigV4 against AWS's published test vector
```
