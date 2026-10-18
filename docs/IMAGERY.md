# Imagery: sources and rights status

Every image on the site, where it came from, and what still needs a decision. Nothing here is stock, and nothing is presented as documentation of a real venue.

| File (`public/images/…`) | Source (Drive) | Used for | Status |
|---|---|---|---|
| `covers/hill-country-escapes.jpg` | Page 1 of the FINAL Hill Country PDF, rendered | Hill Country cover, hero | Product's own cover. Brand imagery (Chloe at a yurt) |
| `covers/12-best-date-ideas.jpg` | `P01-H-Cover-Approved-Layout-Reference.png` (Date Ideas › 03 Selected Images) | Date Ideas cover | Approved cover layout export. Chloe at a Zilker picnic |
| `previews/hill-country-p02/p03.jpg` | Pages 2–3 of the Hill Country PDF | Sample pages | 2 of 8 pages (not the whole product) |
| `previews/new-to-austin-pages-*.jpg` | `page-overview.png` (New to Austin folder), cropped | Sample-page strips | Thumbnails too small to read; **page 1 (mural cover) excluded** |
| `chloe/chloe-zilker-picnic.jpg` | `Zilker Picnic.png` (Date Ideas › 03 Selected Images; same photo as `img/picnic.jpg` and the approved Date Ideas cover) | Homepage flagship hero (owner-approved, 18 Oct 2026) | Approved by owner for the homepage. Brand Bible lists "Zilker Picnic" as a strongly consistent asset. Shows a wine glass at a public park, where alcohol needs a permit (as the Date Ideas guide notes) |
| `chloe/chloe-bbq-table.jpg` | `Slide 1 - Chloe Hero FINAL.png` (Franklin carousel) | Open Graph image (no longer the homepage hero) | AI-generated brand image in a barbecue hall. **Venue not named on the site**. Needs owner OK for commercial use |
| `food/bbq-tray.jpg` | `Slide 4 - Full Tray FINAL.png` | (available, currently unused) | Same set |
| `chloe/chloe-portrait-warm.jpg` | `10_ChloesPicks_WarmPortrait.png` (Being Single archive) | Meet Chloe, About, Being Single hero | Brand portrait |
| `chloe/chloe-south-congress.jpg` | `01_Cover_SouthCongress_GoldenHour.png` (Being Single archive) | New to Austin / Being Single typeset covers, About | Brand image; shows the **Austin Motel sign** (Brand Bible: verified anchor, but don't imply residence) |
| `chloe/chloe-private-doorway.jpg` | `COVER-H-Chloe-Nighttime-Private-Doorway-APPROVED.png` | Exclusive typeset cover, hero | Marked APPROVED in Drive. Generic doorway, no venue claimed |

## Why some covers are typeset

New to Austin, Dinner Spots, Being Single, Natural Gems and Exclusive are 9.5–24 MB PDFs, over the Drive connector's 10 MB transfer limit, so their cover pages couldn't be rendered here. In addition:

- **New to Austin's real cover** is the "Greetings from Austin" mural, which the brief says is not cleared for commercial artwork.
- **Dinner Spots' real cover** uses Hestia's overhead spread, a restaurant photo whose commercial clearance is open (its production summary).

So these use a **typeset cover** in the guides' own design system (Fraunces title, "Chloe Hayes" kicker, count sticker, cactus mark), with cleared brand photography where it fits. Each product page labels it: "Cover shown as a website rendering in the guide's style." To switch to the real cover: export page 1 as a JPG, put it in `public/images/covers/`, set `cover.kind: "pdf"` and `cover.image` in `products.ts`.

## Not used, and why

- Restaurant/venue photos from the Dinner Spots, Exclusive and Date Ideas folders: many are third-party (Instagram/Google Maps screenshots), `REVIEW-NOT-APPROVED`, `RIGHTS-PENDING` or `SELECTED-GENERATED` scenes of real events.
- `Chloe Logo.jpg`: despite the name, a swimwear portrait; not suitable as a logo. The site's mark is an original cactus wordmark.
- Face and turnaround sheets: identity references, not for publication.

## Decisions needed

1. Commercial use of AI-generated Chloe imagery in identifiable settings (BBQ hall, South Congress).
2. Whether and how to disclose AI-generated persona/imagery on the site.
3. Real covers for the five typeset guides (and whether the mural cover is acceptable for New to Austin).
