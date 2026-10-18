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

const PROPOSAL = { amount: null, status: "pending", source: "Bundle proposal from the 18 Oct 2026 brief. Contents, name and price need owner approval." } as const;

/**
 * Bundle PROPOSALS (18 Oct 2026 brief). Not offers: shown only on preview
 * deployments, labelled as proposals, never discounted, never sold for real.
 */
export const bundles: Bundle[] = [
  {
    id: "cia-bundle-first-month",
    slug: "first-month-in-austin",
    title: "First Month in Austin",
    subtitle: "New to Austin + Guide to Being Single",
    includes: ["cia-new-to-austin", "cia-being-single"],
    why: "Settle in, then get out there: the move, the neighborhoods and your first 90 days, plus where to meet people IRL.",
    status: "proposal",
    price: PROPOSAL,
  },
  {
    id: "cia-bundle-date-night",
    slug: "austin-date-night",
    title: "Austin Date Night",
    subtitle: "12 Best Date Ideas + 10 Best Dinner Spots",
    includes: ["cia-date-ideas", "cia-dinner-spots"],
    why: "Twelve dates with a plan, and ten dinners worth dressing up for.",
    status: "proposal",
    price: PROPOSAL,
  },
  {
    id: "cia-bundle-weekend-explorer",
    slug: "weekend-explorer",
    title: "Weekend Explorer",
    subtitle: "5 Natural Gems + Hill Country Escapes",
    includes: ["cia-natural-gems", "cia-hill-country"],
    why: "Swimming holes and Hill Country days that share Wimberley and Dripping Springs.",
    status: "proposal",
    price: PROPOSAL,
  },
  {
    id: "cia-bundle-complete",
    slug: "complete-austin-collection",
    title: "Complete Austin Collection",
    subtitle: "All seven guides",
    includes: ["cia-new-to-austin", "cia-dinner-spots", "cia-being-single", "cia-date-ideas", "cia-natural-gems", "cia-hill-country", "cia-exclusive"],
    why: "Everything Chloe has made so far, in one library.",
    status: "proposal",
    price: PROPOSAL,
  },
];
