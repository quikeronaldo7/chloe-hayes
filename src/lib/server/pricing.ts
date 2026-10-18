import "server-only";
import { approvedPriceBook, testPriceBook, type PriceBook } from "@/catalogue/pricing";
import { demoCheckoutEnabled } from "./stripe";

type Env = Record<string, string | undefined>;

/**
 * TEST COMMERCE: isolated QA prices for an end-to-end purchase in Stripe test mode.
 * All three must hold, checked on the server for every request:
 *   1. STRIPE_SECRET_KEY is a test key (sk_test_…)
 *   2. not Vercel Production (VERCEL_ENV !== "production")
 *   3. CHLOE_TEST_COMMERCE === "true", set deliberately on Preview only
 * A live key, a production deployment, or a missing flag means the approved book.
 */
export function testCommerceConditions(env: Env = process.env) {
  return {
    stripeTestKey: (env.STRIPE_SECRET_KEY ?? "").startsWith("sk_test_"),
    notProduction: env.VERCEL_ENV !== "production",
    explicitlyAllowed: env.CHLOE_TEST_COMMERCE === "true",
  };
}

export function testCommerceEnabled(env: Env = process.env): boolean {
  const c = testCommerceConditions(env);
  return c.stripeTestKey && c.notProduction && c.explicitlyAllowed;
}

/**
 * The price book this deployment sells from right now. `next dev` demo checkout (no
 * Stripe at all, see stripe.ts) also uses test prices so the flow can be clicked through.
 */
export function activePriceBook(env: Env = process.env): PriceBook {
  if (testCommerceEnabled(env)) return testPriceBook();
  if (env === process.env && demoCheckoutEnabled()) return testPriceBook();
  return approvedPriceBook();
}
