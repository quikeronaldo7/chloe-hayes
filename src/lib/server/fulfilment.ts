import "server-only";
import type Stripe from "stripe";
import { emailConfigured, purchaseEmail, sendEmail, type SendResult } from "./email";
import { purchaseEmailLibraryUrl, unlockedTitles } from "./library";
import { siteUrl } from "./origin";
import { EMAIL_META, EMAIL_META_VERSION, orderFromSession } from "./orders";

/**
 * Purchase fulfilment = email the customer their private library link.
 *
 * Access never depends on email: the success page and library work from Stripe alone.
 * Email is recorded as sent only when Resend accepted it (an email id came back); that
 * id is then written to the Checkout Session metadata.
 *
 * Retries and duplicates:
 *   - Every attempt re-reads the session (with the charge expanded), so a delayed or
 *     replayed event never emails a refunded or still-pending order.
 *   - The send carries Idempotency-Key `purchase-email/v2/<session id>` and a
 *     byte-identical payload (the library link is pinned to order time + one year;
 *     resend-my-links issues fresh links instead, so an old order never gets an expired one).
 *     Concurrent or repeated deliveries inside Resend's 24-hour window collapse into
 *     one email.
 *   - If the send or the metadata write fails, the webhook answers 500 and Stripe
 *     retries. Accepted-but-not-recorded is recovered on retry by the same key.
 * Residual risk: Stripe can retry for up to three days, Resend keeps keys for 24 hours.
 * If the metadata write kept failing for more than 24 hours after acceptance, a later
 * retry could send a second, identical email. That is preferred to never sending.
 * Nothing here is exactly-once.
 */

export type FulfilmentOutcome =
  | { result: "emailed"; emailId: string }
  | { result: "already-emailed"; emailId: string }
  | { result: "email-not-configured" }
  | { result: "not-paid" }
  | { result: "refunded" }
  | { result: "nothing-to-send" }
  | { result: "retry"; reason: string };

export interface FulfilmentDeps {
  retrieveSession: (id: string) => Promise<Stripe.Checkout.Session>;
  recordEmail: (id: string, metadata: Record<string, string>) => Promise<unknown>;
  send: typeof sendEmail;
  configured: () => boolean;
  now: () => Date;
}

export function stripeDeps(stripe: Stripe): FulfilmentDeps {
  return {
    retrieveSession: (id) => stripe.checkout.sessions.retrieve(id, { expand: ["payment_intent.latest_charge"] }),
    recordEmail: (id, metadata) => stripe.checkout.sessions.update(id, { metadata }),
    send: sendEmail,
    configured: () => emailConfigured(),
    now: () => new Date(),
  };
}

export const purchaseEmailKey = (sessionId: string) => `purchase-email/v2/${sessionId}`;

export async function fulfilOrder(sessionId: string, deps: FulfilmentDeps): Promise<FulfilmentOutcome> {
  let session: Stripe.Checkout.Session;
  try {
    session = await deps.retrieveSession(sessionId);
  } catch (err) {
    return { result: "retry", reason: `session-retrieve-failed: ${err instanceof Error ? err.message : "unknown"}` };
  }
  const order = orderFromSession(session);
  if (order.status === "refunded") return { result: "refunded" };
  if (order.status !== "paid") return { result: "not-paid" }; // async payment: the *_succeeded event follows
  if (!order.email || !order.productIds.length) return { result: "nothing-to-send" };
  if (session.livemode && session.metadata?.pricing !== "approved") {
    // Should be impossible (checkout refuses it); log loudly so it is caught. The library shows
    // the support state for anything without locked files, never a substitute.
    console.error(`[delivery-failure] live order ${order.id} contains items that were not launch-ready`);
  }
  if (order.emailFulfilment.state === "accepted") return { result: "already-emailed", emailId: order.emailFulfilment.id };

  // No provider configured (e.g. Preview today): acknowledge, record nothing, claim nothing.
  if (!deps.configured()) return { result: "email-not-configured" };

  const url = purchaseEmailLibraryUrl(order);
  if (!url) return { result: "retry", reason: "no-site-origin" };

  const email = purchaseEmail({ name: order.name, titles: unlockedTitles(order), libraryUrl: url, helpUrl: siteUrl("/help#resend"), testOrder: session.livemode === false });
  const sent: SendResult = await deps.send({ to: order.email, ...email }, { idempotencyKey: purchaseEmailKey(order.id) });
  if (sent.status === "skipped") return { result: "email-not-configured" };
  if (sent.status === "failed") return { result: "retry", reason: `email-${sent.reason}${sent.httpStatus ? `-${sent.httpStatus}` : ""}` };

  try {
    await deps.recordEmail(order.id, {
      [EMAIL_META.status]: "accepted",
      [EMAIL_META.id]: sent.id,
      [EMAIL_META.at]: deps.now().toISOString(),
      [EMAIL_META.version]: EMAIL_META_VERSION,
    });
  } catch (err) {
    // Resend accepted it but it isn't recorded. Retry: the same key returns the same email id.
    return { result: "retry", reason: `record-failed after accepted ${sent.id}: ${err instanceof Error ? err.message : "unknown"}` };
  }
  return { result: "emailed", emailId: sent.id };
}
