/**
 * Store policies, shown as sections of the Help page (/help#terms-of-sale, #privacy,
 * #refunds) and at the original /legal/* URLs, which stay live for payment providers.
 *
 * These are not final legal policies: the owner has confirmed QR DIGITAL LLC
 * as the seller, but its address, licence, refunds, retention and governing law
 * still require owner/legal approval
 * (docs/LAUNCH-CHECKLIST.md). Each policy states only what the store already does,
 * says plainly that the full text isn't published, and lists what it will cover.
 */
export interface Policy {
  /** Anchor on the Help page. */
  anchor: string;
  /** Slug of the matching /legal/[page] route. */
  legalSlug: "terms" | "refunds" | "privacy";
  title: string;
  /** What is already true of how the store works. */
  facts: string[];
  /** What the full policy will cover once approved. */
  covers: string[];
}

export const policies: Policy[] = [
  {
    anchor: "terms-of-sale",
    legalSlug: "terms",
    title: "Terms of Sale",
    facts: [
      "QR DIGITAL LLC is the legal seller of Chloe in Austin's digital guides.",
      "You're buying a digital PDF guide for your own personal use. Nothing physical is shipped.",
      "Your private library opens straight after payment, and the link is emailed to you.",
      "Prices are in US dollars and confirmed at checkout. Promo codes, when offered, are entered at checkout.",
      "Payment is handled by Stripe. We never see or store your card details.",
      "Venue details, prices and access rules change. Every guide is dated and links to official sources so you can confirm before you go.",
      "A guide is research and planning help. It doesn't include reservations, memberships or guaranteed access anywhere.",
    ],
    covers: ["The legal seller's business address and contact details", "The exact personal-use licence wording", "Taxes", "Governing law"],
  },
  {
    anchor: "privacy",
    legalSlug: "privacy",
    title: "Privacy",
    facts: [
      "Checkout runs on Stripe, which collects your payment details. We receive your name, email and order details so we can deliver your guides.",
      "Order and download emails are sent through our email provider, Resend, only about your purchase.",
      "There's no newsletter or marketing list.",
    ],
    covers: ["Analytics, if any are switched on", "How long order data is kept", "How to ask for your data to be deleted"],
  },
  {
    anchor: "refunds",
    legalSlug: "refunds",
    title: "Refund & Digital Product Policy",
    facts: [
      "Guides are digital and delivered instantly to your private library.",
      "Your library works on any device, and you can get fresh links any time with “Resend my downloads” above.",
      "If an order is refunded, its library and download links stop working.",
    ],
    covers: ["Whether and when refunds are available for digital guides", "How to request one"],
  },
];

export const policyBySlug = (slug: string) => policies.find((p) => p.legalSlug === slug);
