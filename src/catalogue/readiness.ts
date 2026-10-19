/**
 * LAUNCH READINESS (storefront layer)
 *
 * One record per guide and per bundle. It records how far each part is from
 * launch. It never holds prices (products.ts) and can't mark delivery ready by
 * hand (that's derived from the manifest in delivery.server.ts).
 *
 * Checkout eligibility for REAL sales is derived from these records, the price
 * and the manifest in `src/lib/server/launch.ts`. It is never stored.
 * Safe to import in the browser.
 */

export type Stage = "draft" | "revising" | "final";
export type CopyStatus = "draft" | "needs-review" | "approved";
export type ImageryStatus = "pending" | "final";

/** Recorded only when the owner explicitly approves something for launch. */
export interface Approval {
  by: string;
  on: string;
  basis: string;
}

export interface Readiness {
  kind: "product" | "bundle";
  /** Product content and the customer PDF. Bundles derive these from their guides. */
  content?: Stage;
  design?: Stage;
  priceApproval?: Approval;
  salesCopy: CopyStatus;
  imagery: ImageryStatus;
  /** Open items shown in docs/LAUNCH-CHECKLIST.md. */
  notes: string[];
}

/** The owner's pricing approval in the 18 Oct 2026 corrections brief. */
const PRICES_APPROVED: Approval = { by: "Owner", on: "2026-10-18", basis: "Storefront corrections briefs: approved guide prices and all four bundle prices." };

/**
 * The seven customer PDFs are FINAL per the 18 Oct 2026 master brief ("These
 * products already exist… use the actual final PDF files"). Website copy was
 * written from the final PDFs and approved through the owner's final site
 * review and explicit 19 Oct launch request. Imagery still has commercial-use
 * rights questions (docs/IMAGERY.md).
 */
const finalPdf = (notes: string[] = []): Readiness => ({
  kind: "product",
  content: "final",
  design: "final",
  priceApproval: PRICES_APPROVED,
  salesCopy: "approved",
  imagery: "pending",
  notes,
});

export const readiness: Record<string, Readiness> = {
  "cia-new-to-austin": finalPdf([
    "PRODUCTION_SUMMARY open items: confirm Zilker rent ($2,115), the 'Greetings from Austin' mural cover, Hamilton Pool/Wimberley/Salt Lick image provenance and the @chloe.eats.atx handle.",
    "In-PDF recommendation boxes are unlinked until storefront URLs are approved (content.json → meta.storefront_links).",
  ]),
  "cia-dinner-spots": finalPdf([
    "Production summary: confirm commercial permission for restaurant images (some look like Instagram screenshots; Red Ash and the Uchi banner were marked REVIEW-NOT-APPROVED).",
  ]),
  "cia-being-single": finalPdf(["Several featured events are one-off October 2026 dates: plan a content refresh."]),
  "cia-date-ideas": finalPdf(["Several venue images are marked SELECTED-GENERATED or RIGHTS-PENDING in Drive (e.g. Museum of Illusions)."]),
  "cia-natural-gems": finalPdf(["Edition/date isn't printed in the PDF. Swim status changes; plan periodic re-checks."]),
  "cia-hill-country": finalPdf(),
  "cia-exclusive": finalPdf(["Some venue images are third-party (e.g. a Google Maps credit on Pershing House): confirm rights."]),
  "cia-bundle-first-month": { kind: "bundle", priceApproval: PRICES_APPROVED, salesCopy: "approved", imagery: "final", notes: [] },
  "cia-bundle-date-night": { kind: "bundle", priceApproval: PRICES_APPROVED, salesCopy: "approved", imagery: "final", notes: [] },
  "cia-bundle-weekend-explorer": { kind: "bundle", priceApproval: PRICES_APPROVED, salesCopy: "approved", imagery: "final", notes: [] },
  "cia-bundle-complete": { kind: "bundle", priceApproval: PRICES_APPROVED, salesCopy: "approved", imagery: "final", notes: [] },
};

export function getReadiness(id: string): Readiness | undefined {
  return readiness[id];
}
