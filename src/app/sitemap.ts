import type { MetadataRoute } from "next";
import { collections, products } from "@/catalogue";
import { absoluteUrl } from "@/lib/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const page = (path: string, priority: number): MetadataRoute.Sitemap[number] => ({ url: absoluteUrl(path), lastModified: now, changeFrequency: "weekly", priority });
  return [
    page("/", 1),
    page("/shop", 0.9),
    ...collections.map((c) => page(`/collections/${c.slug}`, 0.8)),
    ...products.map((p) => page(`/guides/${p.slug}`, p.collection === "start-here" ? 1 : 0.9)),
    page("/about", 0.6),
    page("/help", 0.4),
  ];
}
