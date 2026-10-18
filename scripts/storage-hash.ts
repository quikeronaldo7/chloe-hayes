/**
 * Prints the exact byte count and SHA-256 of objects already in the bucket, read-only:
 *   npm run storage:hash -- japan/the-japan-guide.2ef999670fbf.pdf [more keys…]
 * Settings come from .env.storage.local (the read-only token), never from the command line.
 * Use it to lock a file that was uploaded directly (e.g. one too large for the Drive connector):
 * the printed hash must start with the 12 characters in the key, and the byte count must match Drive.
 */
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { describeRequestError, parseS3Config, presignS3Url } from "../src/lib/server/storage";

async function main() {
  const settings = ".env.storage.local";
  if (!existsSync(settings)) {
    console.error(`✗ ${settings} not found. Copy .env.storage.example to ${settings} and fill in the read-only token.`);
    process.exit(1);
  }
  process.loadEnvFile(settings);
  const parsed = parseS3Config();
  if (!parsed.ok) {
    console.error(`✗ ${parsed.problem}`);
    process.exit(1);
  }
  const keys = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  if (!keys.length) {
    console.error("Usage: npm run storage:hash -- <object key> [more keys…]");
    process.exit(2);
  }
  let bad = 0;
  for (const key of keys) {
    try {
      const r = await fetch(presignS3Url({ ...parsed.config, key, expiresIn: 60, method: "GET" }), { cache: "no-store" });
      if (!r.ok || !r.body) throw new Error(`HTTP ${r.status}${r.status === 404 ? " (no such object)" : r.status === 403 ? " (access denied)" : ""}`);
      const hash = createHash("sha256");
      let bytes = 0;
      for await (const chunk of r.body as unknown as AsyncIterable<Uint8Array>) {
        bytes += chunk.length;
        hash.update(chunk);
      }
      const sha = hash.digest("hex");
      const prefix = key.match(/\.([0-9a-f]{12})\.[a-z]+$/)?.[1];
      const note = prefix ? (sha.startsWith(prefix) ? "key prefix matches" : `✗ KEY PREFIX ${prefix} DOES NOT MATCH`) : "key has no hash prefix";
      if (prefix && !sha.startsWith(prefix)) bad++;
      console.log(`${key}\t${bytes} bytes\tsha256 ${sha}\t(${note})`);
    } catch (err) {
      bad++;
      console.error(`✗ ${key}: ${err instanceof Error && err.message.startsWith("HTTP") ? err.message : describeRequestError(err)}`);
    }
  }
  process.exit(bad ? 1 : 0);
}

main();
