import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleView, JournalUnavailable } from "@/journal/article-view";
import { getArticle, studioEnabled } from "@/lib/server/content-studio";

/**
 * A journal article from the QRVentures Content Studio (published + approved only).
 * Cached for 5 minutes and refreshed immediately by the Studio's signed webhook
 * (/api/revalidate), so publishing never needs a deployment.
 */
export async function generateMetadata({ params }: PageProps<"/journal/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  if (!studioEnabled()) return {};
  const res = await getArticle(slug);
  if (!res.ok) return { robots: { index: false, follow: true } };
  const a = res.data;
  const image = a.seo.image ? (a.seo.image.sizes?.og ?? a.seo.image) : null;
  return {
    title: a.seo.title,
    description: a.seo.description,
    alternates: { canonical: a.seo.canonical },
    robots: { index: a.seo.robots.index, follow: a.seo.robots.follow },
    openGraph: {
      type: "article",
      title: a.seo.title,
      description: a.seo.description,
      url: a.url,
      publishedTime: a.publishedAt ?? undefined,
      modifiedTime: a.modifiedAt ?? undefined,
      authors: a.author ? [a.author.name] : undefined,
      images: image ? [{ url: image.url, width: image.width, height: image.height, alt: a.seo.image?.alt }] : undefined,
    },
  };
}

export default async function JournalArticlePage({ params }: PageProps<"/journal/[slug]">) {
  const { slug } = await params;
  if (!studioEnabled()) notFound();
  const res = await getArticle(slug);
  if (!res.ok) {
    if (res.unavailable) return <JournalUnavailable />;
    notFound();
  }
  return <ArticleView article={res.data} />;
}
