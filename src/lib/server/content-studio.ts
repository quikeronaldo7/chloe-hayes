import "server-only";
import { previewArticleId } from "@/journal/studio-shared";

export { previewArticleId, verifyStudioSignature } from "@/journal/studio-shared";

/**
 * QRVentures Content Studio client (server-only).
 * Contract: content-studio/docs/INTEGRATION-CONTRACT.md (v1) in quikeronaldo7/kate-anderson.
 *
 * Off unless CONTENT_STUDIO_URL and CONTENT_STUDIO_DELIVERY_TOKEN are set, so the site keeps
 * working exactly as before until the owner turns it on. Nothing here touches checkout,
 * payments, pricing or product delivery.
 */

export type StudioImage = {
  url: string;
  alt: string;
  width?: number;
  height?: number;
  caption?: string;
  credit?: string;
  sizes: Record<string, { url: string; width?: number; height?: number }>;
};
export type StudioProduct = { productId: string; title: string; path: string; url: string; summary?: string };
export type StudioArticleSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  path: string;
  url: string;
  heroImage: StudioImage | null;
  category: { name: string; slug: string } | null;
  author: { name: string; slug: string } | null;
  tags: { name: string; slug: string }[];
  publishedAt: string | null;
  modifiedAt: string | null;
  readingMinutes: number | null;
};
export type LexicalNode = { type: string; children?: LexicalNode[]; [key: string]: unknown };
export type StudioArticle = StudioArticleSummary & {
  content: { root: LexicalNode } | null;
  keyTakeaways: string[];
  faqs: { question: string; answer: string }[];
  sources: { title: string; url?: string; publisher?: string; accessedAt?: string }[];
  factCheckedAt: string | null;
  disclosure?: string;
  author: (StudioArticleSummary["author"] & { roleLine?: string; bio?: string; disclosure?: string; sameAs: string[] }) | null;
  relatedArticles: { slug: string; title: string; path: string; excerpt: string }[];
  relatedProducts: StudioProduct[];
  seo: { title: string; description: string; canonical: string; robots: { index: boolean; follow: boolean }; image: StudioImage | null };
  preview: boolean;
  jsonLd: Record<string, unknown>;
};
export type StudioList = { docs: StudioArticleSummary[]; page: number; totalPages: number; totalDocs: number };

/** Result type: `unavailable` means the Studio could not be reached; callers degrade gracefully. */
export type StudioResult<T> = { ok: true; data: T } | { ok: false; status: number; unavailable: boolean };

const TIMEOUT_MS = 5000;
export const JOURNAL_TAG = "journal";
export const articleTag = (slug: string) => `journal:${slug}`;

const config = () => {
  const url = process.env.CONTENT_STUDIO_URL?.trim().replace(/\/$/, "");
  const token = process.env.CONTENT_STUDIO_DELIVERY_TOKEN?.trim();
  return url && token && token.length >= 32 ? { url, token } : null;
};

export const studioEnabled = () => config() !== null;

async function studioFetch<T>(path: string, init: { tags?: string[]; preview?: boolean } = {}): Promise<StudioResult<T>> {
  const c = config();
  if (!c) return { ok: false, status: 503, unavailable: true };
  try {
    const res = await fetch(`${c.url}/api/delivery/v1${path}`, {
      headers: { Authorization: `Bearer ${c.token}`, Accept: "application/json" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      ...(init.preview ? { cache: "no-store" as const } : { next: { revalidate: 300, tags: [JOURNAL_TAG, ...(init.tags ?? [])] } }),
    });
    if (!res.ok) {
      if (res.status === 401) console.error("[content-studio] delivery token rejected");
      return { ok: false, status: res.status, unavailable: res.status >= 500 || res.status === 401 };
    }
    return { ok: true, data: (await res.json()) as T };
  } catch (error) {
    console.error("[content-studio] request failed", error instanceof Error ? error.message : error);
    return { ok: false, status: 503, unavailable: true };
  }
}

export const listArticles = (page = 1, category?: string) =>
  studioFetch<StudioList>(`/articles?limit=24&page=${page}${category ? `&category=${encodeURIComponent(category)}` : ""}`);

export const getArticle = (slug: string) =>
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ? studioFetch<StudioArticle>(`/articles/${slug}`, { tags: [articleTag(slug)] }) : Promise.resolve({ ok: false, status: 404, unavailable: false } as const);

export const getSitemapEntries = () => studioFetch<{ entries: { path: string; lastModified: string | null }[] }>("/sitemap");

export const getPreview = (token: string) => {
  const id = previewArticleId(token);
  if (!id) return Promise.resolve({ ok: false, status: 403, unavailable: false } as const);
  return studioFetch<StudioArticle>(`/preview/${id}?token=${encodeURIComponent(token)}`, { preview: true });
};

