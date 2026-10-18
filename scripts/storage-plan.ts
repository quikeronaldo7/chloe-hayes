/**
 * Prints the exact permanent-storage upload plan for every FINAL (locked) file:
 *   npm run storage:plan
 * It uploads nothing. Bytes are copied unchanged; the SHA-256 in the manifest is
 * checked before upload (locally) and after upload (strict verify against the bucket).
 *
 * Two separate credentials, never the same one:
 *   - UPLOAD (you, once): an R2/S3 token with Object Write on this bucket only, kept in a
 *     local AWS CLI profile. Never put it in Vercel.
 *   - RUNTIME (the site): an Object Read-only token, set in Vercel as S3_ACCESS_KEY_ID /
 *     S3_SECRET_ACCESS_KEY. The site never needs to write.
 * The aws CLI does not read S3_ACCESS_KEY_ID / S3_SECRET_ACCESS_KEY; it uses its own
 * credentials (a named profile below).
 */
import { delivery } from "../src/catalogue/delivery.server";

const locked = Object.entries(delivery).flatMap(([id, d]) =>
  d.status === "final" ? d.files.map((f) => ({ id, ...f })) : [],
);

const out = (s = "") => console.log(s);
out(`# ${locked.length} locked file(s). Run from the repo root with the approved files in ./private-files.`);
out("# Placeholders: <ACCOUNT_ID>, <BUCKET>. Region for Cloudflare R2 is \"auto\"; for AWS use the bucket's region.\n");

out("# 0. One-time: a local profile holding the UPLOAD (write) token. Not the site's read-only token.");
out("aws configure --profile chloe-upload        # Access key + secret of the write token; region: auto (R2) or e.g. eu-west-2 (AWS)");
out('export ENDPOINT="https://<ACCOUNT_ID>.r2.cloudflarestorage.com"   # AWS S3: https://s3.<region>.amazonaws.com');
out('export BUCKET="<BUCKET>"\n');

out("# 1. Confirm each local file is byte-identical to its lock (must print OK for every file)");
for (const f of locked) out(`echo "${f.sha256}  private-files/${f.key}" | sha256sum -c -`);

out("\n# 2. Upload unchanged, to the exact key in the manifest.");
out("#    AWS S3: --checksum-algorithm SHA256 makes S3 verify the bytes in transit and store the checksum.");
out("#    Cloudflare R2: if the CLI's checksum headers are rejected, drop that flag and run with");
out("#    AWS_REQUEST_CHECKSUM_CALCULATION=when_required; step 3 re-hashes every byte either way.");
for (const f of locked)
  out(`aws s3 cp "private-files/${f.key}" "s3://$BUCKET/${f.key}" --endpoint-url "$ENDPOINT" --profile chloe-upload --content-type application/pdf --checksum-algorithm SHA256`);

out("\n# 3. Strict verification with the site's READ-ONLY runtime credentials (the same values Vercel uses).");
out("#    Each object is checked the way a customer download is (HEAD size + full SHA-256), then downloaded");
out("#    through its signed URL and hashed again. Must end with \"N locked file(s) verified\" and no warnings.");
out("STORAGE_DRIVER=s3 S3_ENDPOINT=\"$ENDPOINT\" S3_BUCKET=\"$BUCKET\" S3_REGION=auto \\");
out("  S3_ACCESS_KEY_ID=<read-only key id> S3_SECRET_ACCESS_KEY=<read-only secret> npm run verify:delivery");

out("\n# Keys, sizes and fingerprints (authoritative: src/catalogue/delivery.server.ts)");
for (const f of locked) out(`# ${f.id}  ${f.key}  ${f.bytes} bytes  sha256 ${f.sha256}`);
