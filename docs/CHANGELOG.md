# Changelog

## 18 Oct 2026: Storefront refinement (`preview` branch)

**Images and crops**
- Typeset covers with a photo now give it the bottom half (was 46%), with a much shorter fade (16% instead of 40%). Chloe's face was being washed out by the fade.
- Each cover photo is focused on her face (`focus` in `products.ts`). Checked at 1440 and 390 px: all seven product images show her face, and nothing is stretched (`object-cover` only).
- New to Austin: now uses the approved Franklin image, `APPROVED — Franklin Chloe Hero` (Drive › Revision Round 2).
- Being Single: now uses the portrait from Drive › Revision Round 2 › 01 — Brand Assets. It's no longer the same South Congress photo as New to Austin.

**Positioning**
- Homepage collection lede, Meet Chloe heading and copy, and the topic marquee now cover food, experiences, dating, lifestyle and local finds. Food stays the signature.

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
- `npm run check`: 186 tests pass, along with lint and typecheck. The production build passes.
- axe WCAG 2 A/AA plus best practice: 0 violations on 15 pages × 2 widths.
- No horizontal overflow, no broken images, all 18 internal links return 200.
- Checkout still refuses unpriced items (409).
