import { siteConfig } from "./config";

/**
 * What the Help page says after a resend request: identical for every address (unknown,
 * paid, refunded) and whatever happened next, so it never promises a send.
 */
export const RESEND_ACKNOWLEDGEMENT = {
  title: "Got it. If that email bought a guide, fresh links are on their way.",
  body: `Library links only ever go to an address used for a completed purchase. Nothing after a few minutes? Check spam${
    siteConfig.supportEmail ? `, then email ${siteConfig.supportEmail}` : ", and make sure it's the address you used at checkout"
  }.`,
};
