import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/config";

/** Production allows crawling (once public); every other deployment is closed to crawlers. */
export default function robots(): MetadataRoute.Robots {
  if (process.env.VERCEL_ENV !== "production") return { rules: [{ userAgent: "*", disallow: "/" }] };
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/library/", "/checkout/", "/bundles", "/journal"] }],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
