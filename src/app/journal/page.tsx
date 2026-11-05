import type { Metadata } from "next";
import Link from "next/link";
import { journal, journalCategories } from "@/journal";
import { listArticles, studioEnabled, type StudioArticleSummary } from "@/lib/server/content-studio";

const dateFmt = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "America/Chicago" });

/** Approved, published stories from the Content Studio when it is switched on; otherwise none. */
async function loadStories(): Promise<{ stories: StudioArticleSummary[]; unavailable: boolean }> {
  if (!studioEnabled()) return { stories: [], unavailable: false };
  const res = await listArticles(1);
  return res.ok ? { stories: res.data.docs, unavailable: false } : { stories: [], unavailable: res.unavailable };
}

export async function generateMetadata(): Promise<Metadata> {
  const { stories } = await loadStories();
  const hasStories = stories.length > 0 || journal.length > 0;
  return {
    title: "The Austin Journal",
    description: "Researched Austin stories from Chloe: where to eat, date ideas, moving to Austin, Hill Country and seasonal events.",
    // Not indexed until real, approved articles exist.
    robots: hasStories ? undefined : { index: false, follow: true },
    alternates: { canonical: "/journal" },
  };
}

/**
 * The Austin Journal. Articles come from the QRVentures Content Studio (published and approved
 * only) when CONTENT_STUDIO_URL is set; until then the page stays empty by design. Not linked
 * from the main navigation until the first article exists.
 */
export default async function JournalPage() {
  const { stories, unavailable } = await loadStories();
  if (!stories.length) {
    return (
      <div className="wrap section">
        <p className="t-eyebrow text-terracotta">The Austin Journal</p>
        <h1 className="t-h1 mt-3 max-w-3xl text-balance">
          Stories are <span className="accent-italic">simmering.</span>
        </h1>
        <p className="t-lede mt-5 max-w-2xl text-ink-soft">
          {unavailable ? "We couldn’t load the latest stories just now. Please check back shortly." : "Researched, dated Austin stories will live here. Nothing is published until it’s been checked properly."}
        </p>
        <ul className="mt-10 flex flex-wrap gap-2">
          {journalCategories.map((c) => (
            <li key={c.slug} className="chip bg-card ring-1 ring-line">
              {c.name}
            </li>
          ))}
        </ul>
        <p className="mt-10">
          <Link href="/shop" className="btn">In the meantime: the guides</Link>
        </p>
      </div>
    );
  }
  return (
    <div className="wrap section">
      <p className="t-eyebrow text-terracotta">The Austin Journal</p>
      <h1 className="t-h1 mt-3 max-w-3xl text-balance">Researched Austin stories</h1>
      <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {stories.map((s) => (
          <li key={s.id}>
            <Link href={s.path} className="group block">
              {s.heroImage ? (
                // eslint-disable-next-line @next/next/no-img-element -- remote CMS media with known dimensions
                <img src={s.heroImage.sizes?.card?.url ?? s.heroImage.url} alt={s.heroImage.alt} width={s.heroImage.sizes?.card?.width ?? s.heroImage.width} height={s.heroImage.sizes?.card?.height ?? s.heroImage.height} loading="lazy" className="aspect-[3/2] w-full rounded-2xl object-cover" />
              ) : null}
              {s.category ? <p className="t-eyebrow mt-4 text-terracotta">{s.category.name}</p> : null}
              <h2 className="t-h3 mt-2 group-hover:underline">{s.title}</h2>
              {s.excerpt ? <p className="mt-2 text-ink-soft">{s.excerpt}</p> : null}
              {s.publishedAt ? <p className="mt-2 text-sm text-muted">{dateFmt.format(new Date(s.publishedAt))}</p> : null}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
