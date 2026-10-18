/**
 * Catalogue types.
 *
 * Everything in this folder except `delivery.server.ts` is safe to ship to the
 * browser. File locations and anything else that is part of the paid product
 * live in `delivery.server.ts`, which is server-only.
 */

export type CollectionSlug = "start-here" | "eat-and-drink" | "date-and-connect" | "explore-and-escape";

export interface ImageRef {
  src: string;
  alt: string;
  /** CSS object-position, e.g. "50% 30%". Defaults to centre. */
  focus?: string;
}

export interface Price {
  /**
   * Approved price in minor units (cents). `null` = awaiting owner approval:
   * the product shows "Price coming soon" and cannot be bought for real.
   */
  amount: number | null;
  /** "approved": the owner set this price. "pending": never infer a number. */
  status: "approved" | "pending";
  /** Where the price comes from, or why it's pending. Docs only, never shown. */
  source: string;
}

/**
 * How the cover shown on the site is produced.
 *   "pdf"        page 1 of the FINAL customer PDF, rendered
 *   "approved"   the approved cover layout export from the product folder
 *   "typeset"    a website rendering in the guide's own design language, used where the
 *                cover could not be exported or isn't cleared (see docs/IMAGERY.md)
 */
export type CoverKind = "pdf" | "approved" | "typeset";

export interface Cover {
  kind: CoverKind;
  image?: ImageRef;
  /** Typeset covers. */
  tone?: "forest" | "terracotta" | "cream" | "night" | "sage";
  count?: string;
  countLabel?: string;
  /** Title as set on the typeset cover: [small line, big line, …]. */
  lines?: string[];
  /** Optional photograph inset on a typeset cover (cleared brand imagery only). */
  photo?: ImageRef;
}

export interface Preview {
  image: ImageRef;
  caption: string;
  /** Width / height of the image. */
  ratio: number;
}

export interface Faq {
  q: string;
  a: string;
}

/** Facts extracted from the FINAL PDF. Each is shown only because the PDF supports it. */
export interface Specs {
  pages: number;
  edition: string;
  /** As printed in the guide, e.g. "Research checked October 2026". */
  checked?: string;
  format: string;
  /** Interactive features actually present. */
  interactive: string[];
}

export interface Product {
  /** Stable SKU. Never change once sold: it is stored in Stripe metadata. */
  id: string;
  slug: string;
  /** Exact title from the FINAL PDF. Never abbreviated here. */
  title: string;
  /** Short label for navigation, the bag and tight spaces. */
  shortTitle: string;
  /** One line used on cards. */
  subtitle: string;
  collection: CollectionSlug;
  price: Price;
  /** Stripe Product id (QR DIGITAL, per mode) and an optional approved Price id. */
  stripe?: { testProductId?: string; liveProductId?: string; priceId?: string };

  cover: Cover;
  /** Photograph for the product hero and Open Graph, when a cleared one exists. */
  hero?: ImageRef;

  lede: string;
  summary: string;
  promise: string;
  bestFor: string[];
  notFor: string[];
  contents: { title: string; detail?: string }[];
  /** Short format chips shown on cards, e.g. "19 pages". */
  chips: string[];
  specs: Specs;
  caveats: string[];
  previews?: Preview[];
  /** Companion recommendations, most relevant first, each with its reason. */
  related: { id: string; why: string }[];
  faqs: Faq[];
  accent: "terracotta" | "forest" | "plum" | "sky" | "gold";
  seo: { title: string; description: string };
}

/**
 * A bundle. Bundles are PROPOSALS until the owner approves contents, name and
 * price: they appear only on preview deployments, are never sold for real, and
 * never advertise a saving.
 */
export interface Bundle {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  includes: string[];
  why: string;
  status: "proposal" | "approved";
  price: Price;
  stripe?: { testProductId?: string; liveProductId?: string; priceId?: string };
}

export interface Collection {
  slug: CollectionSlug;
  name: string;
  navLabel: string;
  eyebrow: string;
  intro: string;
  /** Product ids in display order. */
  products: string[];
}

export type Sellable = Product | Bundle;
