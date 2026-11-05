import type { MetadataRoute } from "next";
import { collections, products } from "@/catalogue";
import { absoluteUrl } from "@/lib/config";
import { getSitemapEntries, studioEnabled } from "@/lib/server/content-studio";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const page = (path: string, priority: number): MetadataRoute.Sitemap[number] => ({ url: absoluteUrl(path), lastModified: now, changeFrequency: "weekly", priority });
  // Published, indexable Content Studio articles (only when the Studio is switched on).
  const journal: MetadataRoute.Sitemap = [];
  if (studioEnabled()) {
    const res = await getSitemapEntries();
    if (res.ok && res.data.entries.length) {
      journal.push(page("/journal", 0.7));
      for (const e of res.data.entries) journal.push({ url: absoluteUrl(e.path), lastModified: e.lastModified ? new Date(e.lastModified) : now, changeFrequency: "monthly", priority: 0.6 });
    }
  }
  return [
    page("/", 1),
    page("/shop", 0.9),
    ...collections.map((c) => page(`/collections/${c.slug}`, 0.8)),
    ...products.map((p) => page(`/guides/${p.slug}`, p.collection === "start-here" ? 1 : 0.9)),
    page("/about", 0.6),
    page("/help", 0.4),
    ...journal,
  ];
}
