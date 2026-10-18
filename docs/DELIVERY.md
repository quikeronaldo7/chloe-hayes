# Delivery: locking and uploading the guide PDFs

Paid files live only in the private Cloudflare R2 bucket **`chloe-hayes-products`** (exists, APAC, created 14 Oct 2026). Never in `/public`, never a Drive link. Kate's bucket (`kate-anderson-products`) is not used.

## State today

| Guide | State |
|---|---|
| Hill Country Escapes | **Locked**: `guides/hill-country-escapes.0ed03d3676bc.pdf`, 3,178,454 bytes, sha256 `0ed03d3676bc1c920eeaa4bbd0c5a20983481063471759b980a3653ee6d92eb3` (bytes retrieved from Drive and hashed). Not yet uploaded to R2 |
| The other six | **Pending**: Drive id, size and modified time recorded in `src/catalogue/delivery.server.ts`; bytes not yet retrieved (connector limit 10 MB) |

A pending guide never delivers anything to a real customer: the library shows "This download isn't ready yet" and logs `[delivery-failure]`. Stripe **test** orders on a preview with `CHLOE_TEST_COMMERCE=true` get a stamped placeholder PDF ("TEST PLACEHOLDER — NOT FOR CUSTOMERS") instead, generated per request.

## Lock a pending file (≈ 5 minutes each)

1. Download the exact FINAL file from Drive (ids in `delivery.server.ts`). Check its size matches the recorded bytes.
2. `sha256sum <file>`. Key: `guides/<slug>.<first 12 hex of sha>.pdf`.
3. In `delivery.server.ts`, replace the `pending(...)` entry with a `final` entry like Hill Country's (label, key, filename, sha256, bytes, source).
4. Put the file at `private-files/<key>` locally; `npm run verify:delivery` must print ✓.
5. `npm run storage:plan` prints the upload command (write token in a local AWS CLI profile `chloe-upload`, never in Vercel) and the strict verify.
6. `npm run verify:storage` with the **read-only** token in `.env.storage.local` must verify every locked file.

## Tokens (least privilege)

- **Runtime (Vercel):** R2 API token, *Object Read only*, scoped to `chloe-hayes-products` only → `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY`, `S3_ENDPOINT=https://<account id>.r2.cloudflarestorage.com`, `S3_BUCKET=chloe-hayes-products`, `STORAGE_DRIVER=s3`.
- **Upload (you, locally):** separate *Object Read & Write* token for the same bucket only.
- Keep public access (r2.dev / custom domain) **off** on the bucket.

## How a download is served

`/api/download/<30-minute token>` → re-checks the order with Stripe (refunded = refused) → HEAD the object (exact size) → hash its bytes once per ETag (SHA-256 must equal the lock) → 302 to a **5-minute** presigned URL with the customer filename. Any failure → `/download-unavailable`, never another file.
