import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Stateless signed tokens (HMAC-SHA256). Used for:
 *  - library links  { k: "lib", s: <checkout session id> }      long-lived, re-verified against Stripe
 *  - download links { k: "dl", s, p: <product id>, f: <file index> } short-lived
 */

type TokenPayload =
  | { k: "lib"; s: string; e: number; w?: string }
  | { k: "dl"; s: string; p: string; f: number; e: number; w?: string };

/** Site claim: a token minted by another storefront (even with a reused secret) never validates here. */
const SITE = "cia";

function secret(): string {
  const value = process.env.DOWNLOAD_TOKEN_SECRET;
  if (value && value.length >= 32) return value;
  if (process.env.NODE_ENV === "production") {
    throw new Error("DOWNLOAD_TOKEN_SECRET must be set (32+ characters) in production.");
  }
  return "dev-only-insecure-secret-change-me-please-0000";
}

const b64 = (buf: Buffer | string) => Buffer.from(buf).toString("base64url");

function sign(data: string): string {
  return createHmac("sha256", secret()).update(data).digest("base64url");
}

function encode(payload: TokenPayload): string {
  const body = b64(JSON.stringify({ ...payload, w: SITE }));
  return `${body}.${sign(body)}`;
}

function decode(token: string): TokenPayload | null {
  const [body, mac] = token.split(".");
  if (!body || !mac) return null;
  const expected = Buffer.from(sign(body));
  const given = Buffer.from(mac);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as TokenPayload;
    if (typeof payload.e !== "number" || payload.e < Date.now() / 1000) return null;
    if (payload.w !== SITE) return null;
    return payload;
  } catch {
    return null;
  }
}

const DAY = 60 * 60 * 24;
const now = () => Math.floor(Date.now() / 1000);

export const LIBRARY_LINK_DAYS = 365;

/**
 * Library links last a year from when they are issued; access is still re-checked with
 * Stripe every visit. Pass `expiresAt` (unix seconds) for a deterministic token: the
 * purchase email uses order time + one year, so a retried send carries byte-identical
 * content. Links issued later (resend-my-links, the success page) start a fresh year.
 */
export function createLibraryToken(sessionId: string, opts: { ttlSeconds?: number; expiresAt?: number } = {}): string {
  return encode({ k: "lib", s: sessionId, e: opts.expiresAt ?? now() + (opts.ttlSeconds ?? LIBRARY_LINK_DAYS * DAY) });
}

export function readLibraryToken(token: string): { sessionId: string } | null {
  const p = decode(token);
  return p && p.k === "lib" ? { sessionId: p.s } : null;
}

/** Download links are short-lived and minted fresh each time the library renders. */
export function createDownloadToken(sessionId: string, productId: string, fileIndex: number, ttlSeconds = 60 * 30): string {
  return encode({ k: "dl", s: sessionId, p: productId, f: fileIndex, e: now() + ttlSeconds });
}

export function readDownloadToken(token: string): { sessionId: string; productId: string; fileIndex: number } | null {
  const p = decode(token);
  return p && p.k === "dl" ? { sessionId: p.s, productId: p.p, fileIndex: p.f } : null;
}
