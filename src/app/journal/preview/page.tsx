import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleView } from "@/journal/article-view";
import { getPreview, studioEnabled } from "@/lib/server/content-studio";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Preview", robots: { index: false, follow: false } };

/**
 * Private draft preview, opened from the Content Studio with a signed 15-minute token.
 * The Studio checks the token; this page never caches, never indexes and is not linked anywhere.
 */
export default async function JournalPreviewPage({ searchParams }: PageProps<"/journal/preview">) {
  const { token } = await searchParams;
  if (!studioEnabled() || typeof token !== "string" || token.length > 2000) notFound();
  const res = await getPreview(token);
  if (!res.ok) {
    return (
      <div className="wrap section">
        <h1 className="t-h1">This preview link has expired.</h1>
        <p className="t-lede mt-4 text-ink-soft">Open the article in the Content Studio and click Preview again.</p>
      </div>
    );
  }
  return <ArticleView article={res.data} />;
}
