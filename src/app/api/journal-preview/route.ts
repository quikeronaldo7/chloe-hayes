import { NextResponse, type NextRequest } from "next/server";
import { studioEnabled } from "@/lib/server/content-studio";

/** Entry point for "Preview on site" links from the Content Studio (contract §12). */
export function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!studioEnabled() || !token || token.length > 2000) return new NextResponse("Not found", { status: 404 });
  const res = NextResponse.redirect(new URL(`/journal/preview?token=${encodeURIComponent(token)}`, req.url), 303);
  res.headers.set("Cache-Control", "private, no-store");
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  res.headers.set("Referrer-Policy", "no-referrer");
  return res;
}
