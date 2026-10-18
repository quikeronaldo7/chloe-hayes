import "server-only";
import type Stripe from "stripe";
import { getSellable } from "@/catalogue";
import { siteConfig } from "@/lib/config";
import { demoCheckoutEnabled, getStripe, stripeConfigured } from "./stripe";

/**
 * In V1, Stripe is the order database. A Checkout Session is the order:
 * it holds the customer email, amount, payment status and (in metadata)
 * the catalogue product ids. Nothing else is stored.
 */
export interface Order {
  id: string;
  status: "paid" | "unpaid" | "refunded";
  email?: string;
  name?: string;
  productIds: string[];
  amountTotal: number;
  currency: string;
  created: number;
  /** Stripe livemode. False for test-mode sessions; undefined for local demo orders. */
  livemode?: boolean;
  demo?: boolean;
  /** The purchase email, as recorded by this implementation (see EMAIL_META). Never inferred. */
  emailFulfilment: EmailFulfilment;
}

/**
 * Purchase-email state, stored on the Checkout Session's metadata (Stripe stays the order
 * store). Written only after Resend accepted the message and returned an id.
 * The older `delivery_emailed=true` flag on the PaymentIntent was also written when email
 * was merely logged, so it is ignored: an order with only that flag reads "not recorded".
 */
export const EMAIL_META = { status: "email_status", id: "email_id", at: "email_accepted_at", version: "email_v" } as const;
export const EMAIL_META_VERSION = "2";

export type EmailFulfilment = { state: "accepted"; id: string; at?: string } | { state: "not-recorded" };

export function emailFulfilmentFrom(metadata: Record<string, string> | null | undefined): EmailFulfilment {
  const m = metadata ?? {};
  if (m[EMAIL_META.version] === EMAIL_META_VERSION && m[EMAIL_META.status] === "accepted" && m[EMAIL_META.id]) {
    return { state: "accepted", id: m[EMAIL_META.id], at: m[EMAIL_META.at] };
  }
  return { state: "not-recorded" };
}

const DEMO_PREFIX = "demo_";

export function createDemoSessionId(productIds: string[]): string {
  return DEMO_PREFIX + Buffer.from(JSON.stringify({ ids: productIds, t: Date.now() })).toString("base64url");
}

function readDemoSession(id: string): Order | null {
  if (!demoCheckoutEnabled() || !id.startsWith(DEMO_PREFIX)) return null;
  try {
    const { ids, t } = JSON.parse(Buffer.from(id.slice(DEMO_PREFIX.length), "base64url").toString("utf8")) as {
      ids: string[];
      t: number;
    };
    const productIds = ids.filter((pid) => getSellable(pid));
    return {
      id,
      status: "paid",
      email: "demo@example.com",
      productIds,
      amountTotal: 0,
      currency: "usd",
      created: Math.floor(t / 1000),
      demo: true,
      emailFulfilment: { state: "not-recorded" },
    };
  } catch {
    return null;
  }
}

/**
 * Stripe metadata values are capped at 500 characters, so a large order's ids are
 * split across product_ids, product_ids_2, product_ids_3…
 */
export function productIdMetadata(ids: string[]): Record<string, string> {
  const chunks: string[] = [];
  let current = "";
  for (const id of ids) {
    const next = current ? `${current},${id}` : id;
    if (next.length > 490) {
      chunks.push(current);
      current = id;
    } else current = next;
  }
  if (current) chunks.push(current);
  return Object.fromEntries(chunks.map((c, i) => [i === 0 ? "product_ids" : `product_ids_${i + 1}`, c]));
}

/**
 * Chloe and Kate share one Stripe account (QR DIGITAL), so every webhook endpoint on it
 * receives both stores' events. A session belongs to Chloe only when it carries
 * `storefront=chloe-in-austin`; anything else yields no products, so it is never
 * fulfilled, shown in a library or resent from here.
 */
export const isOurSession = (session: Pick<Stripe.Checkout.Session, "metadata">) => session.metadata?.storefront === siteConfig.storefront;

export function productIdsFromSession(session: Stripe.Checkout.Session): string[] {
  if (!isOurSession(session)) return [];
  const m = session.metadata ?? {};
  const keys = Object.keys(m)
    .filter((k) => k === "product_ids" || /^product_ids_\d+$/.test(k))
    .sort((a, b) => (a === "product_ids" ? 1 : Number(a.split("_")[2])) - (b === "product_ids" ? 1 : Number(b.split("_")[2])));
  return keys
    .map((k) => m[k])
    .join(",")
    .split(",")
    .map((s) => s.trim())
    .filter((pid) => pid && getSellable(pid));
}

/**
 * Maps a Checkout Session to an order. Refund state needs `payment_intent.latest_charge`
 * expanded: a session without it can't be classed as refunded, so use `getOrder` (which
 * expands it) wherever access or messaging depends on the answer.
 */
export function orderFromSession(session: Stripe.Checkout.Session): Order {
  const pi = typeof session.payment_intent === "object" ? session.payment_intent : null;
  const charge = pi && typeof pi.latest_charge === "object" ? pi.latest_charge : null;
  const paid = session.payment_status === "paid" || session.payment_status === "no_payment_required";
  return {
    id: session.id,
    status: charge?.refunded ? "refunded" : paid ? "paid" : "unpaid",
    emailFulfilment: emailFulfilmentFrom(session.metadata),
    email: session.customer_details?.email ?? session.customer_email ?? undefined,
    name: session.customer_details?.name ?? undefined,
    productIds: productIdsFromSession(session),
    amountTotal: session.amount_total ?? 0,
    currency: session.currency ?? "usd",
    created: session.created,
    livemode: session.livemode,
  };
}

export async function getOrder(sessionId: string): Promise<Order | null> {
  const demo = readDemoSession(sessionId);
  if (demo) return demo;
  if (!stripeConfigured() || !sessionId.startsWith("cs_")) return null;
  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent.latest_charge"],
    });
    return orderFromSession(session);
  } catch (err) {
    console.error("[orders] could not retrieve session", sessionId, err instanceof Error ? err.message : err);
    return null;
  }
}

/**
 * Paid, unrefunded orders for an email: used by "resend my downloads".
 * List results don't carry the expanded charge, so each candidate is re-read with
 * `getOrder` before it counts: a refunded order is never resent.
 */
export async function findOrdersByEmail(email: string, lookup: (id: string) => Promise<Order | null> = getOrder): Promise<Order[]> {
  if (!stripeConfigured()) return [];
  const sessions = await getStripe().checkout.sessions.list({
    customer_details: { email },
    status: "complete",
    limit: 20,
  });
  const candidates = sessions.data.map(orderFromSession).filter((o) => o.status === "paid" && o.productIds.length);
  const current = await Promise.all(candidates.map((o) => lookup(o.id)));
  return current.filter((o): o is Order => o !== null && o.status === "paid" && o.productIds.length > 0);
}
