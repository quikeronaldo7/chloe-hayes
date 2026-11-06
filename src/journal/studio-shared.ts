import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Pure helpers for the Content Studio integration, shared by the server client and tests.
 * No secrets are read here; callers pass them in.
 */

/** The Studio verifies the preview token; the site only reads which article it names. */
export const previewArticleId = (token: string): string | null => {
  try {
    const claims = JSON.parse(Buffer.from(token.split(".")[0] ?? "", "base64url").toString("utf8")) as { article?: unknown };
    return typeof claims.article === "string" && /^[A-Za-z0-9_-]{1,64}$/.test(claims.article) ? claims.article : null;
  } catch {
    return null;
  }
};

/** Verifies the Studio's `X-QRV-Signature: t=<unix>,v1=<hex>` header (contract §11). */
export function verifyStudioSignature(secret: string, rawBody: string, header: string | null, now = Date.now()): boolean {
  if (!header || secret.length < 32) return false;
  const parts = Object.fromEntries(
    header.split(",").map((p) => {
      const i = p.indexOf("=");
      return [p.slice(0, i).trim(), p.slice(i + 1).trim()];
    }),
  );
  const t = Number(parts.t);
  if (!Number.isFinite(t) || !parts.v1 || Math.abs(now / 1000 - t) > 300) return false;
  const expected = createHmac("sha256", secret).update(`${t}.${rawBody}`).digest("hex");
  const a = Buffer.from(String(parts.v1));
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
