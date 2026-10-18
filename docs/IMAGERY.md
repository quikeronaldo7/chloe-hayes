# Imagery: sources and rights status

Every image on the site, where it came from, and what still needs a decision. Nothing here is stock, and nothing is presented as documentation of a real venue.

| File (`public/images/…`) | Source (Drive) | Used for | Status |
|---|---|---|---|
| `covers/hill-country-escapes.jpg` | Page 1 of the FINAL Hill Country PDF, rendered | Hill Country cover, hero | Product's own cover. Brand imagery (Chloe at a yurt) |
| `covers/12-best-date-ideas.jpg` | `P01-H-Cover-Approved-Layout-Reference.png` (Date Ideas › 03 Selected Images) | Date Ideas cover | Approved cover layout export. Chloe at a Zilker picnic |
| `previews/hill-country-p02/p03.jpg` | Pages 2–3 of the Hill Country PDF | Sample pages | 2 of 8 pages (not the whole product) |
| `previews/new-to-austin-pages-*.jpg` | `page-overview.png` (New to Austin folder), cropped | Sample-page strips | Thumbnails too small to read; **page 1 (mural cover) excluded** |
| `chloe/chloe-zilker-picnic.jpg` | `Zilker Picnic.png` (Date Ideas › 03 Selected Images; same photo as `img/picnic.jpg` and the approved Date Ideas cover) | Homepage flagship hero (owner-approved, 18 Oct 2026) | Approved by owner for the homepage. Brand Bible lists "Zilker Picnic" as a strongly consistent asset. Shows a wine glass at a public park, where alcohol needs a permit (as the Date Ideas guide notes) |
| `chloe/chloe-bbq-table.jpg` | `Slide 1 - Chloe Hero FINAL.png` (Franklin carousel); pixel-identical to `APPROVED — Franklin Chloe Hero — Website Hero Reference.png` (Revision Round 2 › 03 — Hero References) | **New to Austin cover photo** (since 18 Oct refinement), Dinner Spots Open Graph | Marked APPROVED in Drive. AI-generated brand image in a barbecue hall. **Venue not named on the site** |
| `food/bbq-tray.jpg` | `Slide 4 - Full Tray FINAL.png` | (available, currently unused) | Same set |
| `chloe/chloe-portrait-warm.jpg` | `10_ChloesPicks_WarmPortrait.png` (Being Single archive) | Meet Chloe, About, **Being Single cover photo** (owner's choice, 18 Oct) and hero | Brand portrait |
| `chloe/chloe-south-congress.jpg` | `01_Cover_SouthCongress_GoldenHour.png` (Being Single archive) | About page (no longer on any cover) | Brand image; shows the **Austin Motel sign** (Brand Bible: verified anchor, but don't imply residence) |
| `chloe/chloe-private-doorway.jpg` | `COVER-H-Chloe-Nighttime-Private-Doorway-APPROVED.png` | Exclusive typeset cover, hero | Marked APPROVED in Drive. Generic doorway, no venue claimed |

## Logo system (18 Oct 2026)

Source: `Chloe in Austin — Western Badge Logo Concept v2.png` (Revision Round 2 › 01 — Brand Assets), named the approved logo direction in "Chloe Website — Revision Round 2 — Claude Prompt + Asset Map".

| Use | File | What it is |
|---|---|---|
| Footer, large brand moments | `public/brand/chloe-in-austin-badge.png` | The approved badge, trimmed and resized to 800 px (transparent) |
| Header | `public/brand/chloe-mark.svg` + live "Chloe *in* Austin" type (`Wordmark`) | Compact mark: the badge's cowboy hat on a saguaro, forest roundel, gold ring. Hand-drawn SVG simplification of the badge (the full badge is unreadable below ~80 px) |
| Favicon / app icon | `src/app/icon.svg`, `src/app/apple-icon.png` | The compact mark alone |

The compact mark is a simplification made here, not a separately supplied file: if a designer exports an official small mark, replace `chloe-mark.svg` and the icons.

## Why some covers are typeset

New to Austin, Dinner Spots, Being Single, Natural Gems and Exclusive are 9.5–24 MB PDFs, over the Drive connector's 10 MB transfer limit, so their cover pages couldn't be rendered here. In addition:

- **New to Austin's real cover** is the "Greetings from Austin" mural, which the brief says is not cleared for commercial artwork.
- **Dinner Spots' real cover** uses Hestia's overhead spread, a restaurant photo whose commercial clearance is open (its production summary).

So these use a **typeset cover** in the guides' own design system (Fraunces title, "Chloe Hayes" kicker, count sticker, cactus mark), with cleared brand photography where it fits. Each product page labels it: "Cover shown as a website rendering in the guide's style." To switch to the real cover: export page 1 as a JPG, put it in `public/images/covers/`, set `cover.kind: "pdf"` and `cover.image` in `products.ts`.

## Not used, and why

- Restaurant/venue photos from the Dinner Spots, Exclusive and Date Ideas folders: many are third-party (Instagram/Google Maps screenshots), `REVIEW-NOT-APPROVED`, `RIGHTS-PENDING` or `SELECTED-GENERATED` scenes of real events.
- `Chloe Logo.jpg` / `REFERENCE — Previous Chloe Cactus Logo.jpg`: despite the names, a swimwear portrait, not a logo.
- Face and turnaround sheets: identity references, not for publication.

## Decisions needed

1. Commercial use of AI-generated Chloe imagery in identifiable settings (BBQ hall, South Congress).
2. Whether and how to disclose AI-generated persona/imagery on the site.
3. Real covers for the five typeset guides (and whether the mural cover is acceptable for New to Austin).
