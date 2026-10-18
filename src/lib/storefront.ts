/**
 * Storefront mode: whether this deployment sells, or is browsing-only.
 *
 *   Production (VERCEL_ENV=production): browsing-only unless STOREFRONT_MODE=open is set
 *     deliberately. The public site launches as a catalogue: every page, price and
 *     description is visible, nothing can be bought, and the checkout API refuses.
 *   Preview / local: open unless STOREFRONT_MODE=browse, so checkout and download
 *     testing on Preview keeps working.
 *
 * Read on the server only (pages are rendered per deployment with that deployment's
 * environment). The browser is told the result through props; it never decides.
 * Opening the shop in Production also needs live Stripe, storage, email and approvals:
 * see docs/LAUNCH-CHECKLIST.md. This switch alone never enables payments.
 */
export function storefrontOpen(env: Record<string, string | undefined> = process.env): boolean {
  const mode = env.STOREFRONT_MODE?.trim().toLowerCase();
  if (env.VERCEL_ENV === "production") return mode === "open";
  return mode !== "browse";
}

/** Customer-facing wording while the shop is closed. */
export const SHOP_CLOSED = {
  eyebrow: "Coming soon",
  title: "This edition is being finalised.",
  body: "The shop opens soon. Until then, have a wander: every guide, route and travel tool is here to explore.",
  api: "The shop isn't open yet. Every edition is being finalised; you're welcome to browse in the meantime.",
};
