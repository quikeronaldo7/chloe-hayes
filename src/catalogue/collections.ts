import type { Bundle, Collection } from "./types";

export const collections: Collection[] = [
  {
    slug: "start-here",
    name: "Start Here",
    navLabel: "New to Austin",
    eyebrow: "Just moved, or about to",
    intro: "The flagship: everything from choosing a neighborhood to your first 90 days, and a gateway to the rest of the collection.",
    products: ["cia-new-to-austin"],
  },
  {
    slug: "eat-and-drink",
    name: "Eat & Drink",
    navLabel: "Eat & Drink",
    eyebrow: "Food first, always",
    intro: "The dinners worth planning a whole night around, and exactly how to get the table.",
    products: ["cia-dinner-spots"],
  },
  {
    slug: "date-and-connect",
    name: "Date & Connect",
    navLabel: "Date & Connect",
    eyebrow: "Meet people, plan better nights",
    intro: "Where to meet people in real life, and twelve dates with an actual plan attached.",
    products: ["cia-being-single", "cia-date-ideas"],
  },
  {
    slug: "explore-and-escape",
    name: "Explore & Escape",
    navLabel: "Explore & Escape",
    eyebrow: "Out of the city, behind the door",
    intro: "Swimming holes, Hill Country days and the places with no sign on the door.",
    products: ["cia-natural-gems", "cia-hill-country", "cia-exclusive"],
  },
];

/**
 * Bundles, all four owner-approved on 18 Oct 2026. Only approved bundles with an
 * approved price appear to customers (Curated Guide Bundles). First Month, Date Night
 * and Weekend Explorer have owner-approved discounted prices (18 Oct 2026):
 * $49 / $29 / $29 respectively; Complete Austin Collection stays $99 vs $154.
 */
export const bundles: Bundle[] = [
  {
    id: "cia-bundle-first-month",
    stripe: { liveProductId: "prod_VT89adrp187Ko1", priceId: "price_1USBtOIhfSP7AoZwUePkyX4I" },
    slug: "first-month-in-austin",
    title: "First Month in Austin",
    subtitle: "New to Austin + Guide to Being Single",
    includes: ["cia-new-to-austin", "cia-being-single"],
    why: "Settle in, then get out there: the move, the neighborhoods and your first 90 days, plus where to meet people IRL.",
    status: "approved",
    price: { amount: 4900, status: "approved", source: "Owner-approved discounted bundle price, 18 Oct 2026: $49 vs $58 separately (save $9)." },
  },
  {
    id: "cia-bundle-date-night",
    stripe: { liveProductId: "prod_VT89n2RDaboJtr", priceId: "price_1USBtQIhfSP7AoZwUzWQLyew" },
    slug: "austin-date-night",
    title: "Austin Date Night",
    subtitle: "12 Best Date Ideas + 10 Best Dinner Spots",
    includes: ["cia-date-ideas", "cia-dinner-spots"],
    why: "Twelve dates with a plan, and ten dinners worth dressing up for.",
    status: "approved",
    price: { amount: 2900, status: "approved", source: "Owner-approved discounted bundle price, 18 Oct 2026: $29 vs $38 separately (save $9)." },
  },
  {
    id: "cia-bundle-weekend-explorer",
    stripe: { liveProductId: "prod_VT89QbV2aMfCYB", priceId: "price_1USBtSIhfSP7AoZwbnFWHMwq" },
    slug: "weekend-explorer",
    title: "Weekend Explorer",
    subtitle: "5 Natural Gems + Hill Country Escapes",
    includes: ["cia-natural-gems", "cia-hill-country"],
    why: "Swimming holes and Hill Country days that share Wimberley and Dripping Springs.",
    status: "approved",
    price: { amount: 2900, status: "approved", source: "Owner-approved discounted bundle price, 18 Oct 2026: $29 vs $34 separately (save $5)." },
  },
  {
    id: "cia-bundle-complete",
    stripe: { liveProductId: "prod_VT892waMC87jj6", priceId: "price_1USBtUIhfSP7AoZwTduqcMt1" },
    slug: "complete-austin-collection",
    title: "Complete Austin Collection",
    subtitle: "All seven guides",
    includes: ["cia-new-to-austin", "cia-dinner-spots", "cia-being-single", "cia-date-ideas", "cia-natural-gems", "cia-hill-country", "cia-exclusive"],
    why: "Everything Chloe has made so far, in one library.",
    // Owner-approved bundle and price (18 Oct 2026): $99 for all seven ($154 bought separately).
    status: "approved",
    price: { amount: 9900, status: "approved", source: "Owner-approved bundle price, 18 Oct 2026." },
  },
];
