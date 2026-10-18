import { siteConfig } from "./config";

const formatters = new Map<string, Intl.NumberFormat>();

/** Formats minor units as a price. Whole amounts drop the decimals: "$24", "$19.50". */
export function formatMoney(amount: number, currency = siteConfig.currency): string {
  const whole = amount % 100 === 0;
  const key = `${currency}-${whole}`;
  let f = formatters.get(key);
  if (!f) {
    f = new Intl.NumberFormat(siteConfig.locale, {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: whole ? 0 : 2,
      maximumFractionDigits: whole ? 0 : 2,
    });
    formatters.set(key, f);
  }
  return f.format(amount / 100);
}

export const toMajor = (amount: number) => amount / 100;

/** Text label for a price that may still be pending approval. */
export function priceLabel(amount: number | null): string {
  return amount === null ? "price to be confirmed" : formatMoney(amount);
}
