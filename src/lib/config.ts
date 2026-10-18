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
   * Socials, shown in the footer (owner request, 18 Oct 2026).
   * Instagram: @chloe.eats.atx, the handle printed in the Date Ideas, Exclusive and New to
   * Austin guides. Set NEXT_PUBLIC_INSTAGRAM_HANDLE to change it, or to "" to hide it.
   * Facebook: the owner's verified page (added by the owner, 18 Oct 2026). NEXT_PUBLIC_FACEBOOK_URL
   * overrides it; "" hides it.
   */
  instagramHandle: (process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE ?? "chloe.eats.atx").trim().replace(/^@/, ""),
  facebookUrl: (process.env.NEXT_PUBLIC_FACEBOOK_URL ?? "https://www.facebook.com/profile.php?id=61593967931557").trim() || null,
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

export const instagramUrl = siteConfig.instagramHandle ? `https://www.instagram.com/${siteConfig.instagramHandle}/` : null;

/** One phrase for "how to reach us", honest about what exists. */
export function supportLine(): string {
  return siteConfig.supportEmail
    ? `email ${siteConfig.supportEmail}`
    : "use the “Resend my downloads” form on the Help page";
}
