import type { Metadata } from "next";
import Link from "next/link";
import { journal, journalCategories } from "@/journal";

export const metadata: Metadata = {
  title: "The Austin Journal",
  description: "Researched Austin stories from Chloe: where to eat, date ideas, moving to Austin, Hill Country and seasonal events.",
  // Not indexed until real, approved articles exist.
  robots: journal.length ? undefined : { index: false, follow: true },
  alternates: { canonical: "/journal" },
};

/**
 * The Austin Journal: editorial architecture, ready for approved articles
 * (src/journal/index.ts). Empty by design: nothing is published until it's researched
 * and approved. Not linked from the main navigation until the first article exists.
 */
export default function JournalPage() {
  return (
    <div className="wrap section">
      <p className="t-eyebrow text-terracotta">The Austin Journal</p>
      <h1 className="t-h1 mt-3 max-w-3xl text-balance">
        Stories are <span className="accent-italic">simmering.</span>
      </h1>
      <p className="t-lede mt-5 max-w-2xl text-ink-soft">Researched, dated Austin stories will live here. Nothing is published until it&rsquo;s been checked properly.</p>
      <ul className="mt-10 flex flex-wrap gap-2">
        {journalCategories.map((c) => (
          <li key={c.slug} className="chip bg-card ring-1 ring-line">
            {c.name}
          </li>
        ))}
      </ul>
      {journal.length ? null : (
        <p className="mt-10">
          <Link href="/shop" className="btn">In the meantime: the guides</Link>
        </p>
      )}
    </div>
  );
}
