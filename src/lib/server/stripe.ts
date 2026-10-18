import "server-only";
import Stripe from "stripe";

let client: Stripe | null = null;

export function stripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

/**
 * Live payments stay off until explicitly enabled. A live secret key on its own
 * is not enough: LIVE_PAYMENTS_ENABLED=true must also be set, deliberately, at launch.
 */
export function liveKeyBlocked(env: Record<string, string | undefined> = process.env): boolean {
  return (env.STRIPE_SECRET_KEY ?? "").startsWith("sk_live_") && env.LIVE_PAYMENTS_ENABLED !== "true";
}

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set.");
  client ??= new Stripe(key, { appInfo: { name: "chloe-in-austin-shop" } });
  return client;
}

/**
 * Demo checkout lets the whole purchase → library → download flow be clicked
 * through on a developer's machine with no Stripe account.
 *
 * It can never run on a deployed site. Three independent conditions must ALL hold:
 *   1. NODE_ENV === "development" (only `next dev`; every `next build` inlines
 *      "production", so this whole branch is compiled out of deployed code)
 *   2. no STRIPE_SECRET_KEY is configured
 *   3. ALLOW_DEMO_CHECKOUT=true is set explicitly
 * Demo session ids ("demo_…") are rejected everywhere else, so a forged one
 * grants nothing on a deployed site.
 */
export function demoCheckoutEnabled(): boolean {
  if (process.env.NODE_ENV !== "development") return false;
  return !stripeConfigured() && process.env.ALLOW_DEMO_CHECKOUT === "true";
}
