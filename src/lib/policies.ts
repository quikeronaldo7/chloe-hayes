/**
 * Customer-facing store policies for Chloe in Austin.
 * Effective 19 October 2026. Owner approved commercial launch and confirmed
 * QR DIGITAL LLC as the legal seller. Keep promises aligned with checkout and
 * fulfilment code. These policies provide a voluntary 14-day return window
 * in addition to (not instead of) any rights required by applicable law.
 */
export interface Policy {
  anchor: string;
  legalSlug: "terms" | "refunds" | "privacy";
  title: string;
  facts: string[];
  covers: string[];
}

const support = "chloehayes.eats@gmail.com";

export const policies: Policy[] = [
  {
    anchor: "terms-of-sale",
    legalSlug: "terms",
    title: "Terms of Sale",
    facts: [
      "Effective 19 October 2026. Chloe in Austin digital guides are sold by QR DIGITAL LLC, a Wyoming limited liability company. Customer questions: " + support + ".",
      "Each purchase is a downloadable PDF or a clearly described bundle of PDFs, not a physical item. Prices are shown in US dollars, and the amount charged (including any applicable taxes or discounts) is confirmed at Stripe Checkout before you pay.",
      "After a successful payment, your private download library opens in the browser and a library link is emailed to the address provided at checkout. The library link remains available for one year from purchase, and you can request fresh links using the Help page. Save your downloaded PDFs for ongoing personal use.",
      "Your purchase includes a personal, non-exclusive, non-transferable licence to use the guides. You may not resell, redistribute, publicly upload, or reproduce the PDFs for commercial use.",
      "Guides are researched planning resources; they do not include restaurant reservations, memberships, tickets, private access, medical, financial or legal advice, or guarantees that any business will accept a booking.",
      "Opening times, pricing, events, access rules, availability and third-party links may change after publication. Check with the official provider before travelling or making a reservation.",
      "Refunds are governed by our Refund & Digital Product Policy below. Nothing here restricts consumer rights that apply under your local law.",
      "Chloe Hayes is a virtual creator persona. Some brand visuals are AI-generated, and guide recommendations draw on research and cited sources rather than implying Chloe personally visited every location.",
    ],
    covers: [],
  },
  {
    anchor: "refunds",
    legalSlug: "refunds",
    title: "Refund & Digital Product Policy",
    facts: [
      "We want the guides to be useful. You may request a refund within 14 days of purchase by emailing " + support + " from your checkout email address. Include the guide or order details so we can find your payment.",
      "We offer refunds for accidental purchases, duplicate orders, download problems that we cannot resolve, or a guide materially different from its description. We also consider other requests within the 14-day window in good faith.",
      "For a technical problem, we can first resend your library link or help you open the PDF. You do not have to accept troubleshooting instead of any refund to which you are legally entitled.",
      "Approved refunds go back to the original payment method through Stripe. Your bank determines when the credit appears. Once a purchase is refunded, access to its private library and new download links is revoked. Files already saved to your own device cannot be remotely erased.",
      "If applicable consumer law gives you stronger cancellation, refund or remedy rights, those rights still apply.",
    ],
    covers: [],
  },
  {
    anchor: "privacy",
    legalSlug: "privacy",
    title: "Privacy",
    facts: [
      "QR DIGITAL LLC operates Chloe in Austin. For privacy questions, corrections, or deletion requests, contact " + support + ".",
      "To fulfil an order, we process your name, email, purchased items, payment status and order details. Stripe processes card payments; we do not receive your full card number.",
      "We use Resend to send purchase and download-link emails, Vercel to host the website, and private Cloudflare R2 storage to deliver PDFs through short-lived signed links. Service providers process information only as needed to operate the store.",
      "A shopping bag may be stored locally in your browser so your selections persist. Essential technical and security logs may be collected by hosting and payment providers. We do not currently operate a newsletter sign-up or sell customer information to advertisers.",
      "We retain order, payment and support records as reasonably necessary to provide your download library, respond to refunds or disputes, prevent abuse, and comply with tax or accounting obligations. You may ask us to review, correct or delete information, subject to legal recordkeeping requirements.",
      "Access to a purchased library is tied to a secure token and order status. Do not publicly share private links. Contact us if a link is exposed.",
      "Third-party websites linked from the guides have their own terms and privacy practices. This policy covers the Chloe in Austin storefront, not those other providers.",
    ],
    covers: [],
  },
];

export const policyBySlug = (slug: string) => policies.find((p) => p.legalSlug === slug);
