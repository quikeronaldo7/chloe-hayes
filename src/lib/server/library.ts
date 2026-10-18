import "server-only";
import { expandPurchase, getSellable, type Product } from "@/catalogue";
import { deliveryFor, type LockedFile } from "@/catalogue/delivery.server";
import { siteUrl } from "./origin";
import { placeholdersAllowedFor } from "./test-fulfilment";
import { createDownloadToken, createLibraryToken, LIBRARY_LINK_DAYS } from "./tokens";
import type { Order } from "./orders";

/**
 * What one guide in an order delivers, resolved per request:
 *   "file"         a locked, approved PDF (delivery status "final")
 *   "placeholder"  a stamped test PDF (Stripe test orders under test commerce only)
 *   "unavailable"  the final file isn't locked yet: support state, never a substitute
 */
export type Deliverable =
  | { kind: "file"; label: string; format: string; file: LockedFile }
  | { kind: "placeholder"; label: string; format: "PDF" }
  | { kind: "unavailable"; label: string; format: string };

export function deliverablesFor(id: string, order: Order): Deliverable[] {
  const d = deliveryFor(id);
  if (!d) return [{ kind: "unavailable", label: getSellable(id)?.title ?? id, format: "" }];
  if (d.status === "final") return d.files.map((file) => ({ kind: "file", label: file.label, format: file.format, file }));
  if (placeholdersAllowedFor(order)) return d.expected.map((f) => ({ kind: "placeholder", label: f.label, format: "PDF" }));
  return d.expected.map((f) => ({ kind: "unavailable", label: f.label, format: f.format }));
}

export function logDeliveryFailure(reason: string, detail: Record<string, unknown>) {
  console.error(`[delivery-failure] ${JSON.stringify({ reason, ...detail, at: new Date().toISOString() })}`);
}

export interface LibraryFile {
  label: string;
  format: string;
  href?: string;
  state: "ready" | "placeholder" | "unavailable";
}

export interface LibraryItem {
  product: Pick<Product, "id" | "slug" | "title" | "shortTitle" | "cover" | "collection" | "specs">;
  files: LibraryFile[];
  note?: string;
}

function filesFor(id: string, order: Order): LibraryFile[] {
  return deliverablesFor(id, order).map((x, i) =>
    x.kind === "unavailable"
      ? { label: x.label, format: x.format, state: "unavailable" as const }
      : {
          label: x.kind === "placeholder" ? `${x.label} (test placeholder)` : x.label,
          format: x.format,
          href: `/api/download/${createDownloadToken(order.id, id, i)}`,
          state: x.kind === "placeholder" ? ("placeholder" as const) : ("ready" as const),
        },
  );
}

/** Every guide id a download token for this order may name. */
export function orderDownloadKeys(order: Order): string[] {
  return expandPurchase(order.productIds).map((p) => p.id);
}

/** Everything a paid order unlocks, with fresh short-lived download links. */
export function buildLibrary(order: Order): LibraryItem[] {
  return expandPurchase(order.productIds).map((p) => {
    const files = filesFor(p.id, order);
    if (files.some((f) => f.state === "unavailable") && !order.demo) {
      logDeliveryFailure("final-file-not-locked", { order: order.id, product: p.id, livemode: order.livemode });
    }
    return {
      product: { id: p.id, slug: p.slug, title: p.title, shortTitle: p.shortTitle, cover: p.cover, collection: p.collection, specs: p.specs },
      files,
      note: deliveryFor(p.id)?.note,
    };
  });
}

/** Site-relative library path for links rendered on this site. */
export function libraryPath(sessionId: string): string {
  return `/library/${createLibraryToken(sessionId)}`;
}

/**
 * The library URL inside the purchase email, pinned to order time + one year so every
 * webhook retry builds a byte-identical email (Resend idempotency). Null without a safe origin.
 */
export function purchaseEmailLibraryUrl(order: Pick<Order, "id" | "created">): string | null {
  return siteUrl(`/library/${createLibraryToken(order.id, { expiresAt: order.created + LIBRARY_LINK_DAYS * 24 * 60 * 60 })}`);
}

/** A library URL issued now (resend-my-downloads): valid for a year from this moment. */
export function freshLibraryUrl(orderId: string, nowSeconds = Math.floor(Date.now() / 1000)): string | null {
  return siteUrl(`/library/${createLibraryToken(orderId, { expiresAt: nowSeconds + LIBRARY_LINK_DAYS * 24 * 60 * 60 })}`);
}

/** Titles as bought (a bundle is listed by its name). */
export function purchasedTitles(order: Order): string[] {
  return order.productIds.map((id) => getSellable(id)?.title).filter((t): t is string => Boolean(t));
}

/** Every guide the order unlocks, by title. */
export function unlockedTitles(order: Order): string[] {
  return expandPurchase(order.productIds).map((p) => p.title);
}
