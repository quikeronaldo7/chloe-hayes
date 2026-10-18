# Catalogue: products, sources and facts

All facts come from the FINAL customer PDFs in Drive folder `1fc92emvOWwEM6SNvsbTo8h4MLBGjWDAO`, read on 18 Oct 2026. Prices: **none approved** (every guide `pending`).

| Id | Exact title (from the PDF) | Collection | Pages | Edition / checked | Interactive | FINAL file (Drive id · bytes) |
|---|---|---|---|---|---|---|
| `cia-new-to-austin` | New to Austin: The Ultimate Guide to Living, Exploring & Belonging in Austin | Start Here | 51 | 2026–27 edition · details checked 17 Oct 2026 | 284 form fields, 101 links, 2 maps, bookmarks | `1ubUyPipbj7mEWqmDxNarJVaYAzMuB1l8` · 15,058,167 |
| `cia-dinner-spots` | Chloe's 10 Best Dinner Spots in Austin | Eat & Drink | 19 | 2026 edition · research checked Oct 2026 | 71 form fields; Book/Website/Instagram/Directions/Michelin links | `18zwRX8Ok1pqkQAUHv7j3wldF1JcxeQpq` · 11,441,931 |
| `cia-being-single` | Chloe's Guide to Being Single in Austin | Date & Connect | 13 | 2026 edition · checked Oct 2026 | Live organizer/event links, quick planner | `1_rLeVFi1Xpyb4nsOKGNuaHhf8QngaIx8` · 9,534,247 |
| `cia-date-ideas` | Chloe's 12 Best Date Ideas in Austin | Date & Connect | 24 | First edition, Oct 2026 | Clickable contents/mood index, official links, planner + checklist | `1LZeLIhChmKPSLiCLBLSWW57q9Qw43sLe` · 12,804,695 |
| `cia-natural-gems` | Chloe's 5 Natural Gems Around Austin | Explore & Escape | 8 | Mini-guide (no date printed) | Official links | `1m3A-rpDnDaeyY6L51q_IqA_5QjoRm4k-` · 24,337,775 |
| `cia-hill-country` | Chloe's Perfect Hill Country Escapes | Explore & Escape | 8 | 2026 edition · checked Oct 2026 | Plan + book links | `1KSd7g3SeFlOM-tzMqbpo8svVNvV5lw0A` · 3,178,454 · **locked** sha256 `0ed03d36…eb3` |
| `cia-exclusive` | Chloe's 10 Most Exclusive Experiences in Austin | Explore & Escape | 19 | 2026 | Fillable access planner, checklist, official links | `1g5bPgQR1vlzzlWFwFK4zDuZ9mpLssJPq` · 10,513,766 (see conflict) |

Page counts: Hill Country from `pdfinfo`; Dinner Spots and New to Austin from their production summaries/QA reports; the others from the printed page numbers in the extracted text (Natural Gems: cover + pages 02–08).

## Source notes and conflicts

- **Drive folder name vs title:** folder "05 — 10 Best Date Nights" holds "Chloe's 12 Best Date Ideas in Austin". The PDF title is used.
- **Exclusive Experiences:** a second `…_FINAL.pdf` (id `1rUu3uX9W8KHYE-fUq3W6jBMnYzZqAFFZ`, 10,361,297 bytes) is in "04 — Layout & Final PDF". The brief links the other one; owner to confirm.
- **Instagram:** `@chloe.eats.atx` appears in Date Ideas, Exclusive and New to Austin; the Brand Bible (higher authority on identity) lists the live handle as UNLOCKED and the Dinner Spots summary says unresolved. Not linked.
- **Natural Gems:** no edition or check date printed; shown as "Mini-guide". Swim status in the PDF (Jacob's Well paused) is presented as dated, never guaranteed.
- **Exclusive Experiences:** the site states clearly that buying grants no membership, reservations, admission or privileges (as the PDF itself says).
- **Independence:** only Dinner Spots states "No restaurant paid to be included", so that claim appears only on its page.

## Collections

Start Here: New to Austin · Eat & Drink: Dinner Spots · Date & Connect: Being Single, Date Ideas · Explore & Escape: Natural Gems, Hill Country, Exclusive. All seven on Shop All.

## Bundle proposals (not offers)

| Id | Name | Contents |
|---|---|---|
| `cia-bundle-first-month` | First Month in Austin | New to Austin + Being Single |
| `cia-bundle-date-night` | Austin Date Night | Date Ideas + Dinner Spots |
| `cia-bundle-weekend-explorer` | Weekend Explorer | Natural Gems + Hill Country |
| `cia-bundle-complete` | Complete Austin Collection | all seven |

Shown only on non-Production deployments, labelled "Proposal · not on sale". In test mode a bundle costs exactly the sum of its guides' test prices (no invented discount).

## Stripe (QR DIGITAL, test mode)

| Guide | Test Product |
|---|---|
| New to Austin | `prod_VSjpsLrbCLnmCz` |
| Dinner Spots | `prod_VSjpiXtGJpFKPI` |
| Being Single | `prod_VSjp6hIedheOr8` |
| Date Ideas | `prod_VSjqLgJ3VftHWg` |
| Natural Gems | `prod_VSjqC5iDU1X4ln` |
| Hill Country | `prod_VSjnlLNyhC9zGx` |
| Exclusive | `prod_VSjq33WGpB5oG1` |

All carry metadata `storefront=chloe-in-austin`, `product_id=<id>`. No Price objects: prices aren't approved; test checkout uses inline `price_data` against these Products. Kate's products, prices and webhooks were not touched.
