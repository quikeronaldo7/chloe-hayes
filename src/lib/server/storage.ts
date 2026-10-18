import "server-only";
import { createHash, createHmac } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { isDeployed } from "./origin";

/**
 * Private file storage for paid products.
 *
 *  STORAGE_DRIVER=local (default, development only): files are read from
 *    PRIVATE_FILES_DIR (default ./private-files, git-ignored), hashed, and
 *    streamed through the app. Refused on a deployed site.
 *  STORAGE_DRIVER=s3: any S3-compatible bucket (Cloudflare R2 recommended, AWS S3
 *    works). The bucket stays private. Before a customer gets a short-lived signed
 *    URL, the server checks the object exists, has the locked size, and that its
 *    bytes hash to the locked SHA-256 (see `verifyS3Object`). The customer's
 *    browser then downloads directly from the bucket: the PDF never passes through
 *    a Function response (the London Guide is 7.4 MB; Vercel caps responses at 4.5 MB).
 *
 * Files are never placed in /public. Callers get a typed result and map every
 * failure to the same support page; raw storage errors never reach customers.
 */

export interface ExpectedObject {
  key: string;
  filename: string;
  sha256: string;
  bytes: number;
}

export type StorageResult =
  | { kind: "redirect"; url: string }
  | { kind: "file"; body: Buffer; contentType: string; filename: string }
  | { kind: "missing" }
  | { kind: "integrity"; detail: string }
  | { kind: "error"; detail: string };

const contentTypes: Record<string, string> = {
  ".pdf": "application/pdf",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".zip": "application/zip",
};

/** Content-Disposition that survives non-ASCII titles (RFC 6266 / 5987). */
export function attachmentHeader(filename: string): string {
  const ascii = filename.normalize("NFKD").replace(/[^\x20-\x7e]/g, "").replace(/["\\]/g, "").replace(/\s+/g, " ").trim() || "download";
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
}

const sha256 = (b: Buffer) => createHash("sha256").update(b).digest("hex");

export async function fetchPrivateFile(file: ExpectedObject, env: Record<string, string | undefined> = process.env): Promise<StorageResult> {
  const driver = env.STORAGE_DRIVER ?? "local";
  if (driver === "s3") return fetchS3(file, env);
  if (driver !== "local") return { kind: "error", detail: `unknown STORAGE_DRIVER "${driver}"` };
  // A deployed site has no private-files folder: production delivery requires STORAGE_DRIVER=s3.
  if (isDeployed(env)) return { kind: "error", detail: "local storage is not available on a deployed site; set STORAGE_DRIVER=s3" };

  const root = path.resolve(/*turbopackIgnore: true*/ env.PRIVATE_FILES_DIR ?? "private-files");
  const full = path.resolve(/*turbopackIgnore: true*/ root, file.key);
  if (!full.startsWith(root + path.sep)) return { kind: "missing" }; // path traversal guard
  let body: Buffer;
  try {
    body = await readFile(/*turbopackIgnore: true*/ full);
  } catch {
    return { kind: "missing" };
  }
  if (body.length !== file.bytes || sha256(body) !== file.sha256) return { kind: "integrity", detail: `local ${file.key}: ${body.length} bytes, sha256 ${sha256(body)}` };
  return { kind: "file", body, filename: file.filename, contentType: contentTypes[path.extname(full)] ?? "application/octet-stream" };
}

// --- S3-compatible delivery ------------------------------------------------------

export interface S3Config {
  endpoint: string;
  bucket: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  pathStyle: boolean;
}

export type S3ConfigResult = { ok: true; config: S3Config; notes: string[] } | { ok: false; problem: string };

const clean = (v: string | undefined) => v?.trim().replace(/^(["'])(.*)\1$/, "$2").trim() ?? "";

/**
 * Reads and normalises the bucket settings, explaining any problem in words (never echoing
 * a key). Harmless copy-paste variants are accepted: surrounding spaces or quotes, a missing
 * "https://", and the "/<bucket>" suffix Cloudflare's dashboard shows on its S3 API URL.
 * Anything else that can't be a valid HTTPS endpoint is refused before a request is made.
 */
export function parseS3Config(env: Record<string, string | undefined> = process.env): S3ConfigResult {
  const missing = ["S3_ENDPOINT", "S3_BUCKET", "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY"].filter((k) => !clean(env[k]));
  if (missing.length) return { ok: false, problem: `S3 storage is not fully configured: ${missing.join(", ")} missing` };
  const bucket = clean(env.S3_BUCKET);
  const notes: string[] = [];
  let raw = clean(env.S3_ENDPOINT);
  // Chat tools and docs often turn a URL into a Markdown link: [https://…](https://…). Name that exact mistake.
  if (/^\[[^\]]*\]\([^)]*\)$/.test(raw) || /^<https?:\/\/[^>]+>$/.test(raw)) {
    return { ok: false, problem: "S3_ENDPOINT was pasted as a Markdown link ([…](…) or <…>): paste only the plain URL, https://<account ID>.r2.cloudflarestorage.com" };
  }
  if (/[<>{}\s]/.test(raw)) return { ok: false, problem: "S3_ENDPOINT contains a placeholder or spaces: use https://<your 32-character account ID>.r2.cloudflarestorage.com" };
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(raw)) {
    raw = `https://${raw}`;
    notes.push("S3_ENDPOINT had no https:// (added)");
  }
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return { ok: false, problem: "S3_ENDPOINT is not a valid URL: use https://<account ID>.r2.cloudflarestorage.com" };
  }
  if (url.protocol !== "https:") return { ok: false, problem: "S3_ENDPOINT must start with https://" };
  if (url.username || url.password || url.search || url.hash) return { ok: false, problem: "S3_ENDPOINT must be just the endpoint address, with no credentials, ? or #" };
  const path = url.pathname.replace(/\/+$/, "");
  if (path === `/${bucket}`) notes.push("S3_ENDPOINT ended with the bucket name (removed)");
  else if (path) return { ok: false, problem: `S3_ENDPOINT has an unexpected path "${path}": it should end at the host name` };
  const host = url.hostname.toLowerCase();
  if (host.endsWith(".r2.cloudflarestorage.com") && !/^[0-9a-f]{32}(\.(eu|fedramp))?\.r2\.cloudflarestorage\.com$/.test(host)) {
    return { ok: false, problem: `S3_ENDPOINT host "${host}" doesn't look like <32-character account ID>.r2.cloudflarestorage.com` };
  }
  return {
    ok: true,
    notes,
    config: {
      endpoint: url.origin, // e.g. https://<account>.r2.cloudflarestorage.com
      bucket,
      region: clean(env.S3_REGION) || "auto",
      accessKeyId: clean(env.S3_ACCESS_KEY_ID),
      secretAccessKey: clean(env.S3_SECRET_ACCESS_KEY),
      // R2 needs path-style; AWS works with either.
      pathStyle: clean(env.S3_PATH_STYLE) !== "false",
    },
  };
}

/** The normalised config, or null when it is unusable (see `parseS3Config` for why). */
export function s3Config(env: Record<string, string | undefined> = process.env): S3Config | null {
  const r = parseS3Config(env);
  return r.ok ? r.config : null;
}

/**
 * A request error in words, for logs: the error, its message and the underlying cause code
 * (ENOTFOUND, ECONNREFUSED, CERT_…, UND_ERR_CONNECT_TIMEOUT…). Query strings are removed,
 * so a signed URL (key id, signature) can never end up in a log.
 */
export function describeRequestError(err: unknown): string {
  const strip = (s: string) => s.replace(/(https?:\/\/[^\s?]+)\?\S*/g, "$1?…");
  if (!(err instanceof Error)) return "request failed";
  const cause = err.cause as { code?: string; message?: string } | undefined;
  const causeText = cause ? ` (${[cause.code, cause.message].filter(Boolean).map((x) => strip(String(x))).join(": ")})` : "";
  return `${err.name}: ${strip(err.message)}${causeText}`;
}

const TIMEOUT_MS = 15_000;
const BODY_TIMEOUT_MS = 60_000;
const DOWNLOAD_TTL_SECONDS = 300;

/**
 * Objects whose bytes this server instance has already hashed, keyed by
 * key + ETag + version. A changed object has a different ETag, so it is re-hashed.
 */
const verified = new Map<string, true>();

async function fetchS3(file: ExpectedObject, env: Record<string, string | undefined>): Promise<StorageResult> {
  const parsed = parseS3Config(env);
  if (!parsed.ok) return { kind: "error", detail: `config: ${parsed.problem}` };
  const cfg = parsed.config;
  const check = await verifyS3Object(cfg, file);
  if (check.kind !== "ok") return check;
  // The type comes from the delivered filename, not from whatever the upload stored.
  const params: Record<string, string> = { "response-content-disposition": attachmentHeader(file.filename) };
  const type = contentTypes[path.extname(file.filename).toLowerCase()];
  if (type) params["response-content-type"] = type;
  // On a versioned bucket (AWS), pin the exact version that was verified.
  if (check.versionId) params.versionId = check.versionId;
  return { kind: "redirect", url: presignS3Url({ ...cfg, key: file.key, expiresIn: DOWNLOAD_TTL_SECONDS, params }) };
}

type VerifyResult = { kind: "ok"; etag: string; versionId?: string } | Extract<StorageResult, { kind: "missing" | "integrity" | "error" }>;

/**
 * Proves the stored object is the locked artifact before it is handed out:
 *   1. HEAD: the object exists and has exactly the locked byte count.
 *   2. Unless this instance already hashed this exact ETag/version: GET it (server
 *      side, bounded by size and a timeout), SHA-256 it, compare to the lock, and
 *      confirm the GET returned the same ETag the HEAD saw.
 * Boundary: between this check and the customer's download (a five-minute signed
 * URL) the object could only change if someone with *upload* credentials overwrote
 * it; the runtime key is read-only. On a versioned bucket the URL is pinned to the
 * verified version, which closes that gap entirely.
 */
export async function verifyS3Object(cfg: S3Config, file: ExpectedObject): Promise<VerifyResult> {
  const sign = (method: "GET" | "HEAD") => presignS3Url({ ...cfg, key: file.key, expiresIn: 60, method });
  let head: Response;
  try {
    head = await fetch(sign("HEAD"), { method: "HEAD", signal: AbortSignal.timeout(TIMEOUT_MS), cache: "no-store" });
  } catch (err) {
    return { kind: "error", detail: `HEAD ${file.key}: ${describeRequestError(err)}` };
  }
  if (head.status === 404) return { kind: "missing" };
  if (!head.ok) return { kind: "error", detail: `HEAD ${file.key}: HTTP ${head.status}${statusHint(head.status)}` };
  const length = Number(head.headers.get("content-length"));
  if (length !== file.bytes) return { kind: "integrity", detail: `${file.key}: ${length} bytes, locked ${file.bytes}` };
  const etag = head.headers.get("etag") ?? "";
  const versionId = head.headers.get("x-amz-version-id") ?? undefined;
  const cacheKey = `${file.key}|${etag}|${versionId ?? ""}|${file.sha256}`;
  if (etag && verified.has(cacheKey)) return { kind: "ok", etag, versionId };

  let get: Response;
  try {
    // The whole body is read under this signal: allow time for the largest guide (17.5 MB).
    get = await fetch(sign("GET"), { signal: AbortSignal.timeout(BODY_TIMEOUT_MS), cache: "no-store" });
  } catch (err) {
    return { kind: "error", detail: `GET ${file.key}: ${describeRequestError(err)}` };
  }
  if (get.status === 404) return { kind: "missing" };
  if (!get.ok || !get.body) return { kind: "error", detail: `GET ${file.key}: HTTP ${get.status}${statusHint(get.status)}` };
  if (etag && get.headers.get("etag") && get.headers.get("etag") !== etag) return { kind: "error", detail: `${file.key} changed during verification` };

  const hash = createHash("sha256");
  let size = 0;
  try {
    const reader = get.body.getReader();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > file.bytes) {
        await reader.cancel();
        return { kind: "integrity", detail: `${file.key}: larger than locked ${file.bytes} bytes` };
      }
      hash.update(value);
    }
  } catch (err) {
    return { kind: "error", detail: `GET ${file.key} (reading body): ${describeRequestError(err)}` };
  }
  const digest = hash.digest("hex");
  if (size !== file.bytes || digest !== file.sha256) return { kind: "integrity", detail: `${file.key}: ${size} bytes, sha256 ${digest}` };
  if (etag) verified.set(cacheKey, true);
  return { kind: "ok", etag, versionId };
}

/** What an HTTP refusal from the bucket usually means, for the log line. */
function statusHint(status: number): string {
  if (status === 401 || status === 403) return " (access denied: check S3_ACCESS_KEY_ID/S3_SECRET_ACCESS_KEY are the read-only key for this bucket, copied exactly)";
  if (status === 400) return " (request rejected: check S3_REGION=auto and S3_ENDPOINT)";
  return "";
}

/** Test hook: forget which objects this instance has verified. */
export function resetVerifiedCache() {
  verified.clear();
}

// --- Minimal AWS Signature V4 query presigning (no SDK needed) ---------------

const rfc3986 = (s: string) =>
  encodeURIComponent(s).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);

const hmac = (key: Buffer | string, data: string) => createHmac("sha256", key).update(data).digest();

export interface PresignInput {
  endpoint: string;
  bucket: string;
  key: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  expiresIn: number;
  pathStyle: boolean;
  method?: "GET" | "HEAD";
  params?: Record<string, string>;
  now?: Date;
}

/** AWS SigV4 presigned GET/HEAD. Verified against AWS's published test vector (see scripts/verify-presign.ts). */
export function presignS3Url(i: PresignInput): string {
  const endpoint = new URL(i.endpoint);
  const host = i.pathStyle ? endpoint.host : `${i.bucket}.${endpoint.host}`;
  const amzDate = (i.now ?? new Date()).toISOString().replace(/[:-]|\.\d{3}/g, ""); // 20261001T120000Z
  const date = amzDate.slice(0, 8);
  const scope = `${date}/${i.region}/s3/aws4_request`;

  const segments = i.pathStyle ? [i.bucket, ...i.key.split("/")] : i.key.split("/");
  const canonicalPath = "/" + segments.map(rfc3986).join("/");
  const params: Record<string, string> = {
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": `${i.accessKeyId}/${scope}`,
    "X-Amz-Date": amzDate,
    "X-Amz-Expires": String(i.expiresIn),
    "X-Amz-SignedHeaders": "host",
    ...i.params,
  };
  const query = Object.keys(params)
    .sort()
    .map((k) => `${rfc3986(k)}=${rfc3986(params[k])}`)
    .join("&");

  const canonicalRequest = [i.method ?? "GET", canonicalPath, query, `host:${host}`, "", "host", "UNSIGNED-PAYLOAD"].join("\n");
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, scope, createHash("sha256").update(canonicalRequest).digest("hex")].join("\n");
  const signingKey = hmac(hmac(hmac(hmac(`AWS4${i.secretAccessKey}`, date), i.region), "s3"), "aws4_request");
  const signature = createHmac("sha256", signingKey).update(stringToSign).digest("hex");

  return `${endpoint.protocol}//${host}${canonicalPath}?${query}&X-Amz-Signature=${signature}`;
}
