import type Stripe from "stripe";
import { fulfilOrder, stripeDeps } from "@/lib/server/fulfilment";
import { getStripe } from "@/lib/server/stripe";

/**
 * Stripe webhook. Configure the endpoint `https://<site>/api/webhooks/stripe` in Stripe
 * with the events:
 *   checkout.session.completed
 *   checkout.session.async_payment_succeeded
 *
 * Fulfilment = email the customer their private library link (see lib/server/fulfilment.ts).
 * The success page shows the same library straight away, so email is a copy, not access.
 *
 * Responses: 200 once the event is fully handled (including "email not configured",
 * "refunded" and "not paid yet"); 500 when fulfilment should be retried, so Stripe
 * redelivers. A 200 here is not proof an email was sent.
 */
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers.get("stripe-signature");
  if (!secret || !signature) return new Response("Webhook not configured", { status: 400 });

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await req.text(), signature, secret);
  } catch (err) {
    console.error("[webhook] signature verification failed", err instanceof Error ? err.message : err);
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type !== "checkout.session.completed" && event.type !== "checkout.session.async_payment_succeeded") {
    return Response.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const outcome = await fulfilOrder(session.id, stripeDeps(stripe));
  if (outcome.result === "retry") {
    console.error(`[fulfilment] ${session.id} ${event.type}: will retry (${outcome.reason})`);
    return Response.json({ received: true, fulfilment: "retry" }, { status: 500 });
  }
  if (outcome.result === "email-not-configured") console.warn(`[fulfilment] ${session.id}: paid, email not sent (email is not configured)`);
  else console.info(`[fulfilment] ${session.id} ${event.type}: ${outcome.result}${"emailId" in outcome ? ` ${outcome.emailId}` : ""}`);
  return Response.json({ received: true, fulfilment: outcome.result });
}
