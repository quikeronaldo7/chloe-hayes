import { siteConfig } from "@/lib/config";
import { emailConfigured, resendEmail, sendEmail } from "@/lib/server/email";
import { freshLibraryUrl, purchasedTitles } from "@/lib/server/library";
import { findOrdersByEmail } from "@/lib/server/orders";
import { siteOrigin, siteUrl } from "@/lib/server/origin";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * POST /api/resend-library  { email }
 * Emails fresh library links for every paid, unrefunded order under that address.
 *
 * Privacy: the answer is identical for an unknown address, an address with purchases
 * and an address whose purchases were refunded, so it can't be used to check who
 * bought what. The only different answer is global: when email isn't available at
 * all, everyone is told so (503) before any lookup happens.
 * The success answer (`{ ok: true }`, shown as RESEND_ACKNOWLEDGEMENT) is an
 * acknowledgement, not a promise: it is returned whether the send was accepted, failed
 * at the provider or the lookup itself failed, and those failures are only logged
 * (there is no retry queue). The wording points to support for exactly that reason.
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { email?: unknown } | null;
  const clean = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!EMAIL.test(clean) || clean.length > 254) return Response.json({ error: "Please enter the email you used at checkout." }, { status: 400 });

  if (!emailConfigured() || !siteOrigin()) {
    return Response.json({ error: siteConfig.supportEmail ? `We can't send emails right now. Please write to ${siteConfig.supportEmail} and we'll send your links.` : "We can't send emails right now. Please try again a little later." }, { status: 503 });
  }

  try {
    const orders = await findOrdersByEmail(clean);
    if (orders.length) {
      const links = orders.flatMap((o) => {
        const url = freshLibraryUrl(o.id);
        return url ? [{ titles: purchasedTitles(o), url }] : [];
      });
      const sent = await sendEmail({ to: clean, ...resendEmail(links, siteUrl("/help#resend")) });
      if (sent.status !== "accepted") console.error(`[resend-library] links not sent: ${sent.status}${sent.status === "failed" ? ` ${sent.reason}` : ""}`);
    }
  } catch (err) {
    console.error("[resend-library] lookup failed", err instanceof Error ? err.message : err);
  }
  return Response.json({ ok: true });
}
