import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/config";
import { studioEnabled } from "@/lib/server/content-studio";

/** Production allows crawling (once public); every other deployment is closed to crawlers. */
export default function robots(): MetadataRoute.Robots {
  if (process.env.VERCEL_ENV !== "production") return { rules: [{ userAgent: "*", disallow: "/" }] };
  return {
    // The journal opens to crawlers only once the Content Studio is switched on; previews never do.
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/library/", "/checkout/", "/bundles", studioEnabled() ? "/journal/preview" : "/journal"] }],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
