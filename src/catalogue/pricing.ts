import { bundles, getBundle, getProduct, getSellable, isBundle, products } from "./index";
import type { Bundle } from "./types";

/**
 * PRICE BOOKS
 *
 * A price book is the list of things that can be bought on this deployment, and
 * what each costs in minor units. The browser receives the active book from the
 * server as a prop and never decides it; the checkout API re-derives it.
 *
 *  "approved"  Real prices. Only guides and bundles whose price the owner has
 *              approved (status "approved", amount set). On 18 Oct 2026 this book
 *              is EMPTY: nothing has an approved price, so nothing can be bought.
 *
 *  "test"      QA prices for Stripe *test mode* only. Approved prices carry over;
 *              every unpriced guide costs TEST_UNIT and an unapproved bundle costs
 *              exactly the sum of its guides (no invented discount).
 *              The server hands this book out only when all of these hold:
 *                - STRIPE_SECRET_KEY is a test key (sk_test_…), or `next dev` demo checkout
 *                - not Vercel Production
 *                - CHLOE_TEST_COMMERCE=true
 *              (see src/lib/server/pricing.ts). Test prices are always labelled
 *              "Test price" on screen and can never reach a live Stripe session.
 */

export type PriceBookMode = "approved" | "test";

export interface PriceBook {
  mode: PriceBookMode;
  prices: Record<string, number>;
}

/** $1.00: obviously not a real price, and above Stripe's minimum charge. */
export const TEST_UNIT = 100;

export function approvedPriceBook(): PriceBook {
  const prices: Record<string, number> = {};
  for (const p of products) if (p.price.status === "approved" && p.price.amount !== null) prices[p.id] = p.price.amount;
  for (const b of bundles) {
    // A bundle is sellable only once it is approved AND every guide inside is.
    if (b.status === "approved" && b.price.status === "approved" && b.price.amount !== null && b.includes.every((id) => id in prices)) {
      prices[b.id] = b.price.amount;
    }
  }
  return { mode: "approved", prices };
}

export function testPriceBook(): PriceBook {
  // Approved prices carry over, so a test checkout shows the same figure as the shop;
  // anything still unpriced costs TEST_UNIT (bundles: the sum of their guides).
  const approved = approvedPriceBook().prices;
  const prices: Record<string, number> = {};
  for (const p of products) prices[p.id] = approved[p.id] ?? TEST_UNIT;
  for (const b of bundles) prices[b.id] = approved[b.id] ?? b.includes.reduce((sum, id) => sum + prices[id], 0);
  return { mode: "test", prices };
}

export const priceOf = (book: PriceBook, id: string): number | null => (id in book.prices ? book.prices[id] : null);

/** What the guides inside a bundle cost bought one by one in this book. */
export function bundleValue(book: PriceBook, id: string): number | undefined {
  const b = getBundle(id);
  if (!b) return undefined;
  const parts = b.includes.map((x) => priceOf(book, x));
  return parts.some((n) => n === null) ? undefined : parts.reduce<number>((s, n) => s + (n ?? 0), 0);
}

export function isSellableIn(book: PriceBook, id: string): boolean {
  const s = getSellable(id);
  if (!s || priceOf(book, id) === null) return false;
  return isBundle(s) ? s.includes.every((x) => getProduct(x)) : true;
}

export interface BundleOffer {
  bundle: Bundle;
  /** The approved bundle price. */
  price: number;
  /** The same guides bought one by one at their approved prices. */
  separately: number;
  /** separately − price; 0 when the bundle is not cheaper. */
  saving: number;
}

/**
 * "Save with Bundles": the bundles customers may see. Only owner-approved bundles whose
 * price, and every guide inside, is approved; savings come from approved prices only.
 * On 18 Oct 2026 no bundle is approved, so this is empty and the sections don't render.
 */
export function bundleOffers(ids: readonly string[] = bundles.map((b) => b.id), book: PriceBook = approvedPriceBook()): BundleOffer[] {
  return ids.flatMap((id) => {
    const bundle = getBundle(id);
    const price = priceOf(book, id);
    const separately = bundleValue(book, id);
    if (!bundle || bundle.status !== "approved" || price === null || separately === undefined) return [];
    return [{ bundle, price, separately, saving: Math.max(0, separately - price) }];
  });
}
