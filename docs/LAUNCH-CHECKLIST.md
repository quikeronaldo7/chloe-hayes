# Chloe in Austin: launch checklist

Status as of **18 October 2026**. Five separate categories, never merged. "Built and tested" means it was run and passed here (see [QA.md](QA.md)), not just configured.

## 1. Fully built and tested

| Item | Evidence |
|---|---|
| Independent Next.js project (own history, own package name, no Kate copy or assets) | `grep -ri kate src` returns nothing customer-facing; separate git repo |
| Homepage (all 11 sections), Shop All, 4 collections, 7 guide pages, About, Help, legal placeholders, 404/error | Production build: 30 routes. Screenshots at 1440 / 768 / 375 in `docs/screenshots/` |
| Catalogue of all 7 guides with facts from the FINAL PDFs | `npm run test:chloe` checks titles and page counts against the PDFs |
| Collections + "Find your Austin" (≤ 3 clicks to any guide) | Every door links straight to a guide or collection |
| Recommendations (Dinner ↔ Dates, Gems ↔ Hill Country, New to Austin → Being Single, …) with reasons | Tested |
| Bundle system: proposals visible on preview only, no price, no saving; bundles absorb guides they contain | Tested (bag rules, production hiding) |
| Bag: add, remove, persist (localStorage, cross-tab), buy now, multi-item, empty state, mobile bottom sheet | Browser flow test |
| Server-side pricing; browser prices ignored; Kate ids / unknown ids / tampered lists rejected | Checkout API tests |
| Price books: no real price anywhere; test prices only with sk_test_ + not Production + flag | Tests |
| Stripe Checkout parameters (line items with Chloe's test Products, metadata, branding, promo codes, URLs) | Accepted by Stripe (two QA sessions created in **test mode**, unpaid, auto-expire in 24h) |
| Chloe-branded hosted checkout on the shared account (`branding_settings`: "Chloe in Austin", terracotta/cream) | Confirmed in Stripe's response |
| Webhook fulfilment logic: emails once (idempotency key), records it, retries on failure, ignores Kate's sessions, never emails refunded/unpaid | Tests with mocked Stripe/Resend |
| Purchase email template, Chloe-branded, test-order label, no claimed support inbox | **Sent for real** through Resend from `hello@chloeinaustin.com` to Resend's test sink: status *delivered* |
| Private library: all purchased guides together, fresh signed links, refund → access revoked | Demo-flow test; refund path tested in unit tests |
| Secure download of a locked file (size + SHA-256 verified) | Demo flow downloaded Hill Country; hash = lock `0ed03d36…` |
| Expired / forged tokens, foreign-site tokens | Tests + browser |
| Resend-my-downloads endpoint (privacy-neutral answer) | Built; unit-level checks |
| SEO: metadata, canonicals, sitemap, robots, JSON-LD (no fake offers) | Build output; previews are noindex |
| Accessibility | axe-core WCAG 2 A/AA + best practice: 0 violations on 9 pages × 2 widths |
| Lint, TypeScript, production build | All pass |

## 2. Configured but awaiting verification

| Item | What's left |
|---|---|
| **Resend domain `chloeinaustin.com`** | Verified, sending enabled (checked 18 Oct). Needs a **sending API key** in Vercel (`RESEND_API_KEY`) + `EMAIL_FROM`. Receiving is disabled: replies to hello@ go nowhere today |
| **Stripe test Products** (7, metadata `storefront=chloe-in-austin`) | Created in test mode; ids in `products.ts`. A real end-to-end Stripe test payment needs the deployed preview (webhook URL) |
| **R2 bucket `chloe-hayes-products`** (private, APAC) | Exists. Needs a read-only API token scoped to it, then upload of the locked files (`npm run storage:plan`) and `npm run verify:storage` |
| **Cloudflare DNS + Vercel domain** | Per the brief, A/CNAME records and the Vercel domain exist. Not re-verified here: `api.vercel.com` is blocked from this session |
| **Delivery files** | Hill Country locked by SHA-256. The other six are identified (Drive id, size, date) but over the Drive connector's 10 MB limit, so not yet hashed/uploaded (docs/DELIVERY.md) |

## 3. Awaiting owner approval

1. **Prices** for each of the 7 guides (then record the approval in `readiness.ts` and the amount in `products.ts`).
2. **Bundles**: which of the 4 proposals, exact names, contents and prices (no discount is shown until approved).
3. **Website copy** for all pages (written from the PDFs on 18 Oct; marked *needs review*).
4. **Image rights** (docs/IMAGERY.md): AI-generated brand imagery of Chloe in identifiable places (BBQ hall, South Congress/Austin Motel sign), the Greetings-from-Austin mural on the New to Austin cover, restaurant photos inside Dinner Spots, generated event scenes in Date Ideas.
5. **Instagram handle `@chloe.eats.atx`**: printed in three guides, but the Brand Bible lists the live handle as unlocked and the Dinner Spots notes say "unresolved". Set `NEXT_PUBLIC_INSTAGRAM_CONFIRMED=true` once confirmed.
6. **AI-persona disclosure**: whether/how the site discloses that Chloe and some imagery are AI-generated (the Dinner Spots PDF already notes "approved AI-assisted refinements").
7. **Legal**: seller entity and address, refund policy, licence terms, update policy, privacy details, governing law, tax position (Stripe Tax?). Pages currently say "not published yet".
8. **Support inbox**: a monitored address (set `NEXT_PUBLIC_SUPPORT_EMAIL`), or enable Resend receiving.
9. **Which Exclusive Experiences PDF is master**: two FINAL files with different sizes exist (10,513,766 vs 10,361,297 bytes).
10. **New to Austin open items** from its production summary (Zilker rent figure, mural cover, image provenance) and the in-PDF recommendation links (storefront URLs can now be supplied: `/guides/<slug>`).
11. **Live payments** (`LIVE_PAYMENTS_ENABLED=true` + live key + live webhook) and **public launch** (`STOREFRONT_MODE=open`, remove Vercel protection).

## 4. Blocked by unavailable resources (this session)

| Blocker | Exact error | Workaround / next step |
|---|---|---|
| Create GitHub repo `quikeronaldo7/chloe-hayes` | `403 Resource not accessible by integration` | Owner creates the (private, empty) repo and grants the Claude GitHub App access; then push this project's `main` |
| Push the code anywhere | Pushing Chloe's code to the session's designated branch in **Kate's** repo was blocked by the permission system | Code is committed locally; needs the repo above (or explicit approval to use an isolated branch) |
| Vercel (inspect project, set env vars, deploy preview) | `api.vercel.com` → proxy `403 CONNECT tunnel failed`; no Vercel tool | Connect the repo to project `chloe-hayes` (prj_TchL8Kz6g9QuhKQ8sTdgUwy8PfTY), set env vars from `.env.example`, keep Vercel Authentication on |
| Six PDFs > 10 MB | Drive connector: "File too large for download, over limit of 10 MB" (Being Single at 9.5 MB crashed the connector) | Download from Drive manually or via rclone, then follow docs/DELIVERY.md |
| Stripe webhook endpoint for Chloe | Needs the deployed preview URL; the signing secret must go into Vercel | Create in **test mode**: `https://<preview>/api/webhooks/stripe`, events `checkout.session.completed`, `checkout.session.async_payment_succeeded` |

## 5. Not implemented (deliberately)

- **Newsletter/signup**: no list or privacy policy exists yet (brief: only once real).
- **Journal articles**: the content model and `/journal` shell exist (noindex, not in nav); no fabricated articles.
- **Reviews, ratings, sales counters, bestseller labels**: none, by rule.
- **Ads/affiliate links**: not implemented; the Journal model has a `disclosure` field for later.
- **Live-mode Stripe Products/Prices**: created at launch once prices are approved.
- **Statement descriptor suffix** (e.g. "CHLOE AUSTIN" on card statements): optional, untested; can be added with `payment_intent_data.statement_descriptor_suffix` after a live test.

## Launch sequence (once approvals arrive)

1. Repo + Vercel connected; preview env: `STRIPE_SECRET_KEY=sk_test_…`, `CHLOE_TEST_COMMERCE=true`, `DOWNLOAD_TOKEN_SECRET`, R2 read-only token, `RESEND_API_KEY`, `EMAIL_FROM`, `NEXT_PUBLIC_SITE_URL=<preview alias>`.
2. Create the test webhook → `STRIPE_WEBHOOK_SECRET`. Buy with card 4242… on the preview: success page, email, library, download, then refund in Stripe and confirm the library closes.
3. Lock and upload the six remaining PDFs (docs/DELIVERY.md); `npm run verify:storage`.
4. Record approved prices/copy/imagery in `products.ts` + `readiness.ts`; create live Products/Prices; live webhook.
5. Production env: live key, `LIVE_PAYMENTS_ENABLED=true`, `STOREFRONT_MODE=open`, `NEXT_PUBLIC_SITE_URL=https://chloeinaustin.com`. One controlled real purchase, then refund.
6. Remove deployment protection only on the owner's go.
