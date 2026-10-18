# Changelog

## 18 Oct 2026 (later): Owner corrections (`preview` branch)

**Covers**
- **New to Austin:** back to the original cover layout (forest title block on top, Chloe photo below).
  - The photo is now the Austin Motel scene with Chloe in the yellow dress (Drive `SOCO.png`). It's cropped to the cover's photo slot so the MOTEL sign, the "So close yet so far out" marquee, her face and the dress all show.
  - The BBQ photo is no longer on any cover.
- **Being Single:** the approved poolside skyline portrait, in the same layout, cropped to face and shoulders.

**Logo**
- Back to the simple cactus mark and "Chloe *in* Austin" wordmark in the header, footer and favicon (your cactus icon from 851eb87).
- The Western Badge artwork and the apple-touch icon are removed.

**Footer**
- Instagram (`@chloe.eats.atx`) and Facebook (your verified page, from your commit 5866eb3) are linked under the tagline. Your footer layout is kept as you wrote it.
- The Legal column is gone. Terms, Refunds and Privacy are small links beside the copyright line.

**Prices** (approved, recorded in `products.ts` and `readiness.ts`)

| Item | Price |
|---|---|
| New to Austin | $39 |
| 10 Most Exclusive Experiences | $24 |
| Perfect Hill Country Escapes | $15 |
| 10 Best Dinner Spots | $19 |
| Guide to Being Single | $19 |
| 12 Best Date Ideas | $19 |
| 5 Natural Gems | $19 |
| **Complete Austin Collection** (all 7) | **$99** ($154 separately, saves $55) |

- These show on the homepage CTA, cards, product pages, Save with Bundles, bag and Stripe checkout.
- Test mode now charges the same figures in Stripe test mode, and the "$1 test price" labels are gone.
- First Month, Date Night and Weekend Explorer stay hidden: they have no approved price yet.

**QA**
- 185 tests pass, along with lint, typecheck and the production build.
- axe: 0 violations on 15 pages × 2 widths. All links work.
- A browser check confirmed every guide page shows its approved price.
- Adding the Complete Collection to the bag replaces New to Austin, with a $99 subtotal.

## 18 Oct 2026: Storefront refinement (`preview` branch)

**Images and crops**
- Typeset covers with a photo now give it the bottom half (was 46%), with a much shorter fade (16% instead of 40%). Chloe's face was being washed out by the fade.
- Each cover photo is focused on her face (`focus` in `products.ts`). Checked at 1440 and 390 px: all seven product images show her face, and nothing is stretched (`object-cover` only).
- New to Austin: now uses the approved Franklin image, `APPROVED — Franklin Chloe Hero` (Drive › Revision Round 2).
- Being Single: uses the warm patio portrait, the owner's own choice pushed to `preview` (e73bd02). The crop is re-focused for the new inset, and it's no longer the same photo as New to Austin.

**Positioning**
- The owner's own copy edits (966fc0e: headline line break, collection lede, Meet Chloe) are kept as written.
- Added: a broader Meet Chloe second paragraph (dates, Hill Country weekends, hard-to-get-into rooms) and a wider topic marquee. Food stays the signature.

**Prices**
- One source of truth: approved prices from `products.ts` drive the homepage CTA, cards, product pages, bundles and bag. The test price book now carries approved prices over, so a test checkout matches the shop.
- No price is approved in the catalogue yet, so every guide still shows "Price coming soon". Nothing was invented.

**Bundles**
- "Bundle proposals", "Bundles · internal preview", "Also in these proposals", "Proposal · not on sale" and "Add bundle (test)" are all gone.
- The new **Save with Bundles** section (homepage, Shop, product pages) lists only approved bundles: what's included, bundle price, price bought separately, and the saving.
- None is approved yet, so the section doesn't render. Savings maths is covered by tests on a QA fixture.

**Logo system** (approved Western Badge v2)
- Header: compact hat-and-cactus mark plus live "Chloe *in* Austin" type.
- Footer: the full badge.
- Favicon and apple-touch icon: the compact mark.
- See docs/IMAGERY.md.

**QA**
- `npm run check`: 183 tests pass, along with lint and typecheck. The production build passes.
- axe WCAG 2 A/AA plus best practice: 0 violations on 15 pages × 2 widths.
- No horizontal overflow, no broken images, all 18 internal links return 200.
- Checkout still refuses unpriced items (409).
