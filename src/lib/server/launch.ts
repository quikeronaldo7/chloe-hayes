import "server-only";
import { getProduct, getSellable, isBundle, type Sellable } from "@/catalogue";
import { isSellableIn, type PriceBook } from "@/catalogue/pricing";
import { getReadiness } from "@/catalogue/readiness";
import { deliveryFor } from "@/catalogue/delivery.server";
import { demoCheckoutEnabled } from "./stripe";
import { testCommerceEnabled } from "./pricing";

/**
 * CHECKOUT ELIGIBILITY: derived, never stored.
 *
 * REAL sales ("launch"): an item may be sold only when every launch field passes:
 *   content Final · PDF Final · price approved (in products.ts AND recorded in readiness.ts) ·
 *   sales copy Approved · imagery Final · delivery file locked by SHA-256.
 * A bundle passes only if it is approved itself and every guide inside is launch-ready.
 *
 * TEST sales ("test"): with test commerce on (Stripe test key, not Production,
 * CHLOE_TEST_COMMERCE=true), anything in the test price book may be bought in Stripe
 * test mode. Locked files are delivered; pending ones become stamped placeholders.
 *
 * DEMO ("demo"): `next dev` without Stripe. Click-through only.
 */

export type LaunchField = "content" | "design" | "price" | "salesCopy" | "imagery" | "delivery" | "offer";

export interface LaunchCheck {
  field: LaunchField;
  ok: boolean;
  state: string;
}

export const launchFieldLabels: Record<LaunchField, string> = {
  content: "Product content",
  design: "Customer PDF",
  price: "Price",
  salesCopy: "Website copy",
  imagery: "Imagery",
  delivery: "Delivery file",
  offer: "Offer approval",
};

export function launchChecks(s: Sellable): LaunchCheck[] {
  const r = getReadiness(s.id);
  const priceOk = s.price.status === "approved" && s.price.amount !== null && Boolean(r?.priceApproval);
  const common: LaunchCheck[] = [
    { field: "price", ok: priceOk, state: priceOk ? `Approved (${r!.priceApproval!.by}, ${r!.priceApproval!.on})` : "Awaiting approval" },
    { field: "salesCopy", ok: r?.salesCopy === "approved", state: r?.salesCopy ?? "Missing record" },
    { field: "imagery", ok: r?.imagery === "final", state: r?.imagery ?? "Missing record" },
  ];
  if (isBundle(s)) {
    const inner = s.includes.map(getProduct).filter(Boolean);
    const blocked = inner.filter((p) => !isLaunchReady(p!)).length;
    return [
      { field: "offer", ok: s.status === "approved", state: s.status === "approved" ? "Approved" : "Proposal" },
      ...common,
      { field: "delivery", ok: blocked === 0, state: blocked ? `Waiting on ${blocked} of ${inner.length} guides` : "All guides ready" },
    ];
  }
  const d = deliveryFor(s.id);
  return [
    { field: "content", ok: r?.content === "final", state: r?.content ?? "Missing record" },
    { field: "design", ok: r?.design === "final", state: r?.design ?? "Missing record" },
    ...common,
    { field: "delivery", ok: d?.status === "final", state: d?.status === "final" ? "Locked (SHA-256)" : "Pending" },
  ];
}

export function isLaunchReady(s: Sellable): boolean {
  return launchChecks(s).every((c) => c.ok);
}

export type CheckoutMode = "launch" | "test" | "demo";

export type CheckoutDecision =
  | { allowed: true; mode: CheckoutMode }
  | { allowed: false; code: "unknown" | "no-price" | "not-launch-ready"; message: string };

export function checkoutDecision(id: string, book: PriceBook): CheckoutDecision {
  const s = getSellable(id);
  if (!s) return { allowed: false, code: "unknown", message: "That guide doesn't exist." };
  if (!isSellableIn(book, id)) return { allowed: false, code: "no-price", message: `${s.title} isn't on sale yet.` };
  if (book.mode === "test") {
    if (testCommerceEnabled()) return { allowed: true, mode: "test" };
    if (demoCheckoutEnabled()) return { allowed: true, mode: "demo" };
    return { allowed: false, code: "not-launch-ready", message: `${s.title} isn't on sale yet.` };
  }
  if (isLaunchReady(s)) return { allowed: true, mode: "launch" };
  return { allowed: false, code: "not-launch-ready", message: `${s.title} is being finalized and isn't available to buy just yet.` };
}

