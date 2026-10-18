import type Stripe from "stripe";
import { getSellable, isBundle } from "@/catalogue";
import { reconcile } from "@/catalogue/cart";
import { priceOf } from "@/catalogue/pricing";
import { siteConfig, supportLine } from "@/lib/config";
import { SHOP_CLOSED, storefrontOpen } from "@/lib/storefront";
import { checkoutDecision } from "@/lib/server/launch";
import { createDemoSessionId, productIdMetadata } from "@/lib/server/orders";
import { siteOrigin } from "@/lib/server/origin";
import { activePriceBook } from "@/lib/server/pricing";
import { demoCheckoutEnabled, getStripe, liveKeyBlocked, stripeConfigured } from "@/lib/server/stripe";

/**
 * POST /api/checkout  { items: string[] }   the bag, or Buy now with one id
 *
 * The browser sends catalogue ids only. The server reconciles them (no duplicates,
 * nothing charged twice inside a bundle), checks every item may be sold right now,
 * and prices everything from the server-side price book. Any other field is ignored.
 */
export async function POST(req: Request) {
  if (!storefrontOpen()) return Response.json({ error: SHOP_CLOSED.api, closed: true }, { status: 403 });

  let body: { items?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!Array.isArray(body.items) || !body.items.length) return Response.json({ error: "Your bag is empty." }, { status: 400 });
  if (body.items.some((id) => typeof id !== "string" || !getSellable(id))) {
    return Response.json({ error: "Something in your bag no longer exists. Please refresh and try again." }, { status: 404 });
  }

  const book = activePriceBook();
  const { ids } = reconcile(body.items, book);
  if (!ids.length) return Response.json({ error: "Nothing in your bag can be bought yet." }, { status: 409 });

  // Every item must be sellable right now. Never drop one silently.
  const decisions = ids.map((id) => ({ id, d: checkoutDecision(id, book) }));
  const refused = decisions.filter((x) => !x.d.allowed);
  if (refused.length) {
    const names = refused.map((x) => getSellable(x.id)?.title ?? x.id);
    return Response.json({ error: `${names.join(" and ")} ${names.length === 1 ? "isn't" : "aren't"} available to buy just yet.`, refused: refused.map((x) => x.id) }, { status: 409 });
  }

  if (demoCheckoutEnabled()) {
    return Response.json({ url: `/checkout/success?session_id=${createDemoSessionId(ids)}`, demo: true });
  }
  if (!stripeConfigured()) {
    return Response.json({ error: `Checkout isn't connected yet. Please ${supportLine()} later.` }, { status: 503 });
  }
  if (liveKeyBlocked()) {
    console.error("[checkout] refused: a live Stripe key is configured but live payments are not enabled");
    return Response.json({ error: "Checkout is temporarily unavailable. Please try again later." }, { status: 503 });
  }
  // Test prices can never reach a live session: the test book needs an sk_test_ key (lib/server/pricing.ts),
  // and this re-checks it at the last moment.
  if (book.mode === "test" && !(process.env.STRIPE_SECRET_KEY ?? "").startsWith("sk_test_")) {
    console.error("[checkout] refused: test price book without a Stripe test key");
    return Response.json({ error: "Checkout is temporarily unavailable. Please try again later." }, { status: 503 });
  }

  const origin = siteOrigin();
  if (!origin) {
    console.error("[checkout] refused: no valid site origin (set NEXT_PUBLIC_SITE_URL to this deployment's HTTPS URL)");
    return Response.json({ error: "Checkout is temporarily unavailable. Please try again later." }, { status: 503 });
  }

  const live = (process.env.STRIPE_SECRET_KEY ?? "").startsWith("sk_live_");
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = ids.map((id) => {
    const s = getSellable(id)!;
    if (book.mode === "approved" && s.stripe?.priceId) return { price: s.stripe.priceId, quantity: 1 };
    const productId = live ? s.stripe?.liveProductId : s.stripe?.testProductId;
    const cover = !isBundle(s) && s.cover.image ? `${origin}${s.cover.image.src}` : undefined;
    return {
      quantity: 1,
      price_data: {
        currency: siteConfig.currency,
        unit_amount: priceOf(book, id)!, // checkoutDecision refuses anything without a price
        ...(productId
          ? { product: productId }
          : {
              product_data: {
                name: book.mode === "test" ? `${s.title} (TEST)` : s.title,
                description: s.subtitle,
                ...(cover ? { images: [cover] } : {}),
                metadata: { product_id: s.id, storefront: siteConfig.storefront },
              },
            }),
      },
    };
  });

  const metadata = { ...productIdMetadata(ids), storefront: siteConfig.storefront, source: "website", pricing: book.mode };
  const single = ids.length === 1 ? getSellable(ids[0]) : undefined;
  const cancelTo = single && !isBundle(single) ? `/checkout/cancelled?guide=${single.slug}` : "/checkout/cancelled?from=bag";

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      metadata,
      payment_intent_data: { metadata, description: `Chloe in Austin: ${ids.map((id) => getSellable(id)!.title).join(", ")}`.slice(0, 1000) },
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      ...(process.env.STRIPE_AUTOMATIC_TAX === "true" ? { automatic_tax: { enabled: true } } : {}),
      ...(process.env.STRIPE_REQUIRE_TERMS === "true" ? { consent_collection: { terms_of_service: "required" as const } } : {}),
      custom_text: {
        submit: {
          message:
            book.mode === "test"
              ? "TEST MODE: use a Stripe test card. No real payment is taken."
              : "Digital guides: your download library opens straight after payment.",
        },
      },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}${cancelTo}`,
    });
    return Response.json({ url: session.url });
  } catch (err) {
    console.error("[checkout] session create failed", err);
    return Response.json({ error: "We couldn't start checkout. Please try again in a moment." }, { status: 502 });
  }
}
