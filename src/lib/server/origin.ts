import "server-only";

/**
 * The site origin for links that leave the request: Stripe success/cancel URLs,
 * emailed library links, product images sent to Stripe.
 *
 * Deployed (Vercel Preview or Production), the origin must be HTTPS and must not be
 * localhost, a loopback/private address or anything unparseable. Candidates, in order:
 *   1. NEXT_PUBLIC_SITE_URL (the stable Preview alias now, the canonical domain later)
 *   2. Vercel's own system variables: VERCEL_PROJECT_PRODUCTION_URL in Production,
 *      VERCEL_BRANCH_URL (the stable branch alias) in Preview, then VERCEL_URL
 * Request headers (Host, X-Forwarded-Host) are never trusted for this.
 *
 * Locally (no VERCEL_ENV) any http(s) origin is allowed, including localhost.
 * If nothing valid resolves, this returns null and callers fail safely: no localhost
 * redirect, no broken email link.
 */
export type Env = Record<string, string | undefined>;

export function isDeployed(env: Env = process.env): boolean {
  return env.VERCEL_ENV === "preview" || env.VERCEL_ENV === "production" || env.VERCEL === "1";
}

const PRIVATE_HOST = [
  /^localhost$/i,
  /\.localhost$/i,
  /^127\./,
  /^0\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^169\.254\./,
  /^\[?::1\]?$/,
  /^\[?::\]?$/,
  /^\[?f[cd][0-9a-f]{2}:/i,
  /^\[?fe80:/i,
];

/** Parses a candidate into a bare origin ("https://host"), or null if unusable here. */
export function validOrigin(raw: string | undefined, deployed: boolean): string | null {
  const value = raw?.trim();
  if (!value) return null;
  let url: URL;
  try {
    url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(value) ? value : `https://${value}`);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  if (url.username || url.password) return null;
  if (deployed) {
    if (url.protocol !== "https:") return null;
    if (PRIVATE_HOST.some((re) => re.test(url.hostname))) return null;
    if (!url.hostname.includes(".")) return null;
  }
  return url.origin;
}

export function siteOrigin(env: Env = process.env): string | null {
  const deployed = isDeployed(env);
  const candidates = [
    env.NEXT_PUBLIC_SITE_URL,
    env.VERCEL_ENV === "production" ? env.VERCEL_PROJECT_PRODUCTION_URL : env.VERCEL_BRANCH_URL,
    env.VERCEL_URL,
  ];
  if (!deployed) candidates.push("http://localhost:3000");
  for (const c of candidates) {
    const origin = validOrigin(c, deployed);
    if (origin) return origin;
  }
  return null;
}

/** Absolute URL on the validated origin, or null when no safe origin exists. */
export function siteUrl(path: string, env: Env = process.env): string | null {
  const origin = siteOrigin(env);
  return origin ? `${origin}${path.startsWith("/") ? path : `/${path}`}` : null;
}

/**
 * A 303 to a page on this site, as a relative Location. The browser resolves it
 * against the URL it actually requested, so it can never point at localhost or a
 * different host, whatever the configuration says.
 */
export function redirectToPath(path: string): Response {
  if (!path.startsWith("/") || path.startsWith("//")) throw new Error("redirectToPath needs a site-relative path");
  return new Response(null, { status: 303, headers: { Location: path, "Cache-Control": "private, no-store" } });
}
