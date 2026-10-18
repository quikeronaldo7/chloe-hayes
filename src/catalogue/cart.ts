import { getSellable, isBundle, type Sellable } from "./index";
import { bundleValue, isSellableIn, priceOf, type PriceBook } from "./pricing";

/**
 * BAG RULES (pure, shared by the browser and the server).
 *
 * A bag is an ordered list of catalogue ids (guides or bundles). Digital
 * products: quantity 1. The browser stores ids only; prices always come from the
 * active price book, and the server re-runs `reconcile` before creating a checkout.
 *
 *  - unknown ids and anything not sellable in the current price book are dropped
 *  - the same id never appears twice
 *  - adding a bundle removes the guides it already contains, and any smaller
 *    bundle it fully contains
 *  - adding a guide (or bundle) that a bundle in the bag already covers is refused
 *  - two bundles that partly overlap are never both charged: the second is refused
 */

export type CartNote =
  | { kind: "added"; id: string }
  | { kind: "duplicate"; id: string }
  | { kind: "covered"; id: string; by: string }
  | { kind: "replaced"; id: string; removed: string[] }
  | { kind: "overlap"; id: string; with: string }
  | { kind: "unavailable"; id: string };

const contentsOf = (s: Sellable): string[] => (isBundle(s) ? s.includes : [s.id]);

/** Try to add one id. Returns the new list and a note explaining what happened. */
export function addToCart(ids: string[], id: string, book: PriceBook): { ids: string[]; note: CartNote } {
  const s = getSellable(id);
  if (!s || !isSellableIn(book, id)) return { ids, note: { kind: "unavailable", id } };
  if (ids.includes(id)) return { ids, note: { kind: "duplicate", id } };

  const inCart = ids.map(getSellable).filter((x): x is Sellable => Boolean(x) && isSellableIn(book, x!.id));
  const mine = contentsOf(s);

  const covering = inCart.find((q) => isBundle(q) && mine.every((x) => contentsOf(q).includes(x)));
  if (covering) return { ids, note: { kind: "covered", id, by: covering.id } };

  if (isBundle(s)) {
    const removed = inCart.filter((q) => contentsOf(q).every((x) => mine.includes(x))).map((q) => q.id);
    const partial = inCart.find((q) => !removed.includes(q.id) && contentsOf(q).some((x) => mine.includes(x)));
    if (partial) return { ids, note: { kind: "overlap", id, with: partial.id } };
    const next = [...ids.filter((x) => !removed.includes(x)), id];
    return { ids: next, note: removed.length ? { kind: "replaced", id, removed } : { kind: "added", id } };
  }
  return { ids: [...ids, id], note: { kind: "added", id } };
}

export function removeFromCart(ids: string[], id: string): string[] {
  return ids.filter((x) => x !== id);
}

/**
 * Canonical form of any list of ids (e.g. a tampered request): bundles first,
 * largest first, so overlapping guides fold into them. Display order is kept.
 */
export function reconcile(raw: unknown, book: PriceBook): { ids: string[]; notes: CartNote[] } {
  const list = Array.isArray(raw) ? raw.filter((x): x is string => typeof x === "string").slice(0, 40) : [];
  const unique = [...new Set(list)];
  const size = (id: string) => {
    const s = getSellable(id);
    return s && isBundle(s) ? s.includes.length : 0;
  };
  const ordered = [...unique].sort((a, b) => size(b) - size(a));
  let ids: string[] = [];
  const notes: CartNote[] = [];
  for (const id of ordered) {
    const r = addToCart(ids, id, book);
    ids = r.ids;
    if (r.note.kind !== "added") notes.push(r.note);
  }
  ids.sort((a, b) => unique.indexOf(a) - unique.indexOf(b));
  return { ids, notes };
}

export interface CartSummary {
  lines: { item: Sellable; price: number; value?: number }[];
  subtotal: number;
}

export function summarise(ids: string[], book: PriceBook): CartSummary {
  const lines = ids
    .filter((id) => isSellableIn(book, id))
    .map((id) => ({ item: getSellable(id)!, price: priceOf(book, id)!, value: bundleValue(book, id) }));
  return { lines, subtotal: lines.reduce((s, l) => s + l.price, 0) };
}

/** Customer-facing sentence for a note. */
export function describeNote(n: CartNote): string {
  const t = (id: string) => getSellable(id)?.title ?? "That guide";
  switch (n.kind) {
    case "added":
      return `${t(n.id)} is in your bag.`;
    case "duplicate":
      return `${t(n.id)} is already in your bag.`;
    case "covered":
      return `${t(n.id)} is already included in ${t(n.by)}.`;
    case "replaced":
      return `${t(n.id)} replaces ${n.removed.map(t).join(" and ")}, which it already includes.`;
    case "overlap":
      return `${t(n.id)} shares guides with ${t(n.with)} in your bag. Remove one to choose the other.`;
    case "unavailable":
      return `${t(n.id)} isn't available to buy yet.`;
  }
}
