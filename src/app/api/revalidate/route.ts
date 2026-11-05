import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { siteConfig } from "@/lib/config";
import { articleTag, JOURNAL_TAG, verifyStudioSignature } from "@/lib/server/content-studio";

/**
 * Signed revalidation webhook from the Content Studio (contract §11).
 * Only clears journal caches; it has no other side effects and is safe to retry.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.CONTENT_STUDIO_REVALIDATE_SECRET?.trim() ?? "";
  const raw = await req.text();
  if (raw.length > 10_000 || !verifyStudioSignature(secret, raw, req.headers.get("x-qrv-signature"))) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }
  let event: { brand?: string; slug?: string; previousSlug?: string };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Bad body." }, { status: 400 });
  }
  if (event.brand !== siteConfig.storefront) return NextResponse.json({ error: "Wrong brand." }, { status: 400 });
  const slugOk = (s: unknown): s is string => typeof s === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s);
  // Unpublished articles must disappear at once, so stale content is not served.
  revalidateTag(JOURNAL_TAG, { expire: 0 });
  for (const s of [event.slug, event.previousSlug].filter(slugOk)) {
    revalidateTag(articleTag(s), { expire: 0 });
    revalidatePath(`/journal/${s}`);
  }
  revalidatePath("/journal");
  revalidatePath("/sitemap.xml");
  return NextResponse.json({ ok: true });
}
