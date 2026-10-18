/**
 * THE AUSTIN JOURNAL: editorial content model.
 *
 * Add an article here only when it is researched, fact-checked and approved.
 * Never publish placeholder or generated filler (Project Bible §38). Each article can
 * point at the guides it relates to, so editorial traffic finds the right product.
 */

export interface JournalCategory {
  slug: string;
  name: string;
}

export const journalCategories: JournalCategory[] = [
  { slug: "where-to-eat", name: "Where to eat" },
  { slug: "austin-restaurants", name: "Austin restaurants" },
  { slug: "date-ideas", name: "Date ideas" },
  { slug: "local-experiences", name: "Local experiences" },
  { slug: "moving-to-austin", name: "Moving to Austin" },
  { slug: "hill-country", name: "Hill Country" },
  { slug: "seasonal-events", name: "Seasonal events" },
  { slug: "hidden-gems", name: "Hidden gems" },
];

export interface JournalArticle {
  slug: string;
  title: string;
  category: JournalCategory["slug"];
  /** ISO date the facts were last checked. Required. */
  checked: string;
  summary: string;
  /** Guide ids this story relates to. */
  relatedGuides: string[];
  /** Approved by, and when. Articles without approval are never listed. */
  approval: { by: string; on: string };
  /** Article body as plain paragraphs (swap for MDX when the first article is written). */
  body: string[];
  /** Affiliate or sponsored links must be disclosed here, and the article must work without them. */
  disclosure?: string;
}

export const journal: JournalArticle[] = [];
