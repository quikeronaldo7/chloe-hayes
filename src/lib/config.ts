/**
 * Public site configuration. Only NEXT_PUBLIC_* variables belong here because
 * this module is imported by client components too.
 */
export const siteConfig = {
  name: "Chloe in Austin",
  /** Storefront id: stamped on every Stripe session, and required by fulfilment. */
  storefront: "chloe-in-austin",
  title: "Chloe in Austin · Guides to eating, exploring, dating & finding your people",
  description:
    "Curated, research-checked guides to eating, exploring, dating and finding your people in Austin, from Chloe Hayes.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  currency: "usd",
  locale: "en-US",
  /**
   * Instagram: @chloe.eats.atx is printed in three of the guides, but the Brand Bible lists
   * Chloe's live handle as UNLOCKED and the Dinner Spots production notes say it is unresolved.
   * Not linked until the owner confirms it (set NEXT_PUBLIC_INSTAGRAM_CONFIRMED=true).
   */
  instagramHandle: "chloe.eats.atx",
  instagramConfirmed: process.env.NEXT_PUBLIC_INSTAGRAM_CONFIRMED === "true",
  /**
   * Customer support address. None is configured: chloeinaustin.com can send through
   * Resend but receiving is disabled, so no inbound mailbox is claimed anywhere.
   * Set NEXT_PUBLIC_SUPPORT_EMAIL once a real, monitored inbox exists.
   */
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || null,
};

export function absoluteUrl(path = "/") {
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}

export const instagramUrl = `https://www.instagram.com/${siteConfig.instagramHandle}/`;

/** One phrase for "how to reach us", honest about what exists. */
export function supportLine(): string {
  return siteConfig.supportEmail
    ? `email ${siteConfig.supportEmail}`
    : "use the “Resend my downloads” form on the Help page";
}
