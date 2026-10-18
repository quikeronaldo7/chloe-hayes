"use client";

/**
 * One tiny tracking function for the whole funnel. It forwards to whatever
 * is installed (Plausible, GA4 via gtag, or a GTM dataLayer) and does
 * nothing otherwise. Add a provider here, not in components.
 *
 * Funnel events:
 *   product_viewed · bundle_viewed · product_cta_clicked · add_on_toggled
 *   checkout_started · checkout_failed · purchase_completed
 *   finder_used · email_signup · library_opened · download_clicked
 */

export type AnalyticsEvent =
  | "product_viewed"
  | "bundle_viewed"
  | "product_cta_clicked"
  | "add_on_toggled"
  | "checkout_started"
  | "checkout_failed"
  | "purchase_completed"
  | "finder_used"
  | "email_signup"
  | "library_opened"
  | "download_clicked"
  | "shop_filtered"
  | "add_to_bag"
  | "remove_from_bag";

type Props = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Props; revenue?: { currency: string; amount: number } }) => void;
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function track(event: AnalyticsEvent, props: Props = {}) {
  if (typeof window === "undefined") return;
  const clean = Object.fromEntries(Object.entries(props).filter(([, v]) => v !== undefined)) as Props;

  if (event === "purchase_completed" && typeof clean.value === "number") {
    window.plausible?.(event, { props: clean, revenue: { currency: String(clean.currency ?? "USD").toUpperCase(), amount: clean.value } });
    window.gtag?.("event", "purchase", { transaction_id: clean.order_id, value: clean.value, currency: clean.currency, items: clean.items });
  } else {
    window.plausible?.(event, { props: clean });
    window.gtag?.("event", event, clean);
  }
  window.dataLayer?.push({ event, ...clean });

  if (process.env.NODE_ENV === "development") console.debug("[track]", event, clean);
}
