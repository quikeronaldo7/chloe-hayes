/**
 * Re-verifies every locked (FINAL) delivery file against its recorded SHA-256:
 *   npm run verify:delivery
 * Reads from the configured storage (STORAGE_DRIVER=local → PRIVATE_FILES_DIR, s3 → the bucket).
 * Exits non-zero on any missing or mismatched file. Pending entries are skipped: they deliver nothing.
 * `--allow-missing-local` (used by `npm run check`): a file absent from *local* storage (fresh checkout)
 * is a warning; a present-but-different file is always an error.
 */
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { delivery } from "../src/catalogue/delivery.server";
import { fetchPrivateFile } from "../src/lib/server/storage";

/**
 * `--settings <path>`: load storage settings from a git-ignored file (e.g. .env.storage.local)
 * so secrets never appear in a shell command or its history.
 * `--strict`: the launch check. Requires STORAGE_DRIVER=s3 and fails on anything not verified.
 */
function loadSettings() {
  const i = process.argv.indexOf("--settings");
  if (i !== -1) {
    const file = process.argv[i + 1];
    if (!file || !existsSync(file)) {
      console.error(`✗ --settings: ${file ?? "(no path)"} not found. Copy .env.storage.example to .env.storage.local and fill it in.`);
      process.exit(1);
    }
    process.loadEnvFile(file);
  }
  if (process.argv.includes("--strict") && process.env.STORAGE_DRIVER !== "s3") {
    console.error("✗ --strict needs STORAGE_DRIVER=s3: a local folder is not a storage launch check.");
    process.exit(1);
  }
}

async function main() {
  loadSettings();
  const all = Object.entries(delivery);
  const locked = all.flatMap(([id, d]) => (d.status === "final" ? d.files.map((f) => ({ id, f })) : []));
  const pending = all.filter(([, d]) => d.status === "pending").length;
  if (!locked.length) {
    console.log(`✓ No FINAL delivery files yet (${pending} products awaiting final files). Nothing to verify.`);
    return;
  }
  const allowMissingLocal =
    !process.argv.includes("--strict") && process.argv.includes("--allow-missing-local") && (process.env.STORAGE_DRIVER ?? "local") === "local";
  let bad = 0;
  let skipped = 0;
  for (const { id, f } of locked) {
    // The same check a customer download goes through (size + SHA-256 against the lock)…
    const res = await fetchPrivateFile(f);
    let body: Buffer | null = null;
    if (res.kind === "file") body = res.body;
    else if (res.kind === "redirect") {
      // …then the customer's own path: the signed URL, downloaded and re-hashed end to end.
      const r = await fetch(res.url);
      body = r.ok ? Buffer.from(await r.arrayBuffer()) : null;
    }
    const hash = body ? createHash("sha256").update(body).digest("hex") : null;
    if (hash === f.sha256 && body!.length === f.bytes) console.log(`✓ ${id}: ${f.filename}${res.kind === "redirect" ? " (bucket, via signed URL)" : ""}`);
    else if (res.kind === "missing" && allowMissingLocal) {
      skipped++;
      console.warn(`⚠ ${id}: ${f.filename} not in local storage (${f.key}); skipped`);
    } else {
      bad++;
      const why = res.kind === "missing" ? `missing at ${f.key}` : res.kind === "integrity" || res.kind === "error" ? `${res.kind}: ${res.detail}` : `sha256 ${hash} ≠ locked ${f.sha256}`;
      console.error(`✗ ${id}: ${f.filename} ${why}`);
    }
  }
  if (bad) {
    console.error(`\n${bad} locked file(s) failed verification. Customers get the support state for these, never another file.`);
    process.exit(1);
  }
  console.log(`✓ ${locked.length - skipped} locked file(s) verified${skipped ? `, ${skipped} not present locally (NOT a storage launch check: run with STORAGE_DRIVER=s3)` : ""}.`);
}

main();
