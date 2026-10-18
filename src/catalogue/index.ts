import { bundles, collections } from "./collections";
import { products } from "./products";
import type { Bundle, CollectionSlug, Product, Sellable } from "./types";

export { products, bundles, collections };
export type * from "./types";

const productById = new Map(products.map((p) => [p.id, p]));
const bundleById = new Map(bundles.map((b) => [b.id, b]));

export function getProduct(id: string): Product | undefined {
  return productById.get(id);
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getBundle(id: string): Bundle | undefined {
  return bundleById.get(id);
}

/** Anything that can be in the bag: a guide or a bundle. */
export function getSellable(id: string): Sellable | undefined {
  return productById.get(id) ?? bundleById.get(id);
}

export const isBundle = (s: Sellable): s is Bundle => "includes" in s;

export function resolveProducts(ids: (string | undefined)[] | undefined): Product[] {
  return (ids ?? []).map((id) => (id ? productById.get(id) : undefined)).filter((p): p is Product => Boolean(p));
}

export function getCollection(slug: string) {
  return collections.find((c) => c.slug === slug);
}

export function productsIn(slug: CollectionSlug): Product[] {
  return resolveProducts(getCollection(slug)?.products);
}

export function collectionOf(p: Product) {
  return getCollection(p.collection)!;
}

/** Bundles that contain this guide, smallest first. */
export function bundlesContaining(id: string): Bundle[] {
  return bundles.filter((b) => b.includes.includes(id)).sort((a, b) => a.includes.length - b.includes.length);
}

/** Every guide a purchase unlocks (bundles expand to their contents). */
export function expandPurchase(ids: string[]): Product[] {
  const out = new Map<string, Product>();
  for (const id of ids) {
    const b = bundleById.get(id);
    if (b) for (const inner of resolveProducts(b.includes)) out.set(inner.id, inner);
    const p = productById.get(id);
    if (p) out.set(p.id, p);
  }
  return [...out.values()];
}

/** Title shown in the bag, the library and emails. Bundles use their name. */
export const sellableTitle = (s: Sellable) => s.title;

/** Shop order: flagship first, then by collection. */
export const shopOrder = collections.flatMap((c) => c.products);
