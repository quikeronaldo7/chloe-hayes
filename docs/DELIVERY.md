# Delivery: locked customer PDFs and private R2 storage

Paid files live only in Cloudflare R2 bucket **`chloe-hayes-products`**, not in the website's `/public` folder, not in Drive public links, and never in Kate's bucket.

## Status — 19 October 2026

**All seven final customer PDFs have been retrieved from the master Drive links, SHA-256-hashed locally, and uploaded to the private R2 bucket.** Cloudflare's object listing confirms each complete object key and exact byte size. The bucket's managed `r2.dev` public URL is **disabled** and no custom public domain is attached.

| Guide | Private object key | Bytes |
|---|---|---:|
| New to Austin | `guides/new-to-austin.81de3a09c483.pdf` | 15,058,167 |
| Dinner Spots | `guides/dinner-spots.f963e62196a4.pdf` | 11,441,931 |
| Being Single | `guides/being-single.3db379c16098.pdf` | 9,534,247 |
| Date Ideas | `guides/date-ideas.36134bfe2898.pdf` | 12,804,695 |
| Natural Gems | `guides/natural-gems.0a15e03c1d55.pdf` | 24,337,775 |
| Hill Country Escapes | `guides/hill-country-escapes.0ed03d3676bc.pdf` | 3,178,454 |
| Exclusive Experiences | `guides/exclusive.6084d508280d.pdf` | 10,513,766 |

The **full SHA-256** hashes, approved source file IDs, timestamps, and customer-facing filenames are locked in `src/catalogue/delivery.server.ts`. Each key contains the hash's first twelve hex characters. For Exclusive Experiences, the approved master brief points to the **10,513,766-byte** file, not the older similarly named 10,361,297-byte version.

### Outstanding: runtime S3 credentials

Vercel needs an **Object Read only** Cloudflare R2 token scoped strictly to `chloe-hayes-products`. Create it in Cloudflare R2 → Manage API Tokens and set these Vercel environment variables securely:

- `S3_ACCESS_KEY_ID` — R2 Access Key ID
- `S3_SECRET_ACCESS_KEY` — R2 Secret Access Key

`S3_ENDPOINT`, `S3_BUCKET`, and `STORAGE_DRIVER=s3` are already configured on the Vercel project. Scope new credentials to **Preview** initially. Never paste secrets into chat or commit them to GitHub. Redeploy Preview after adding credentials and the updated manifest.

The application refuses unconfigured or invalid S3 access, checks each R2 object through **HEAD size + GET full SHA-256**, then issues a **five-minute signed download URL**. Pending or corrupt PDFs must never be replaced by a customer-visible placeholder in live mode.

### Outstanding: end-to-end customer test

The Stripe test checkout and private library have succeeded. A Resend domain-restricted, sending-only credential has been installed on Vercel for purchase emails from `Chloe in Austin <hello@chloeinaustin.com>` (the verified sending domain currently has no receiving inbox).

After R2 credentials and new Preview deployment are available, test:
1. Buy a single guide in Stripe **test mode** with a test card.
2. Check the Stripe webhook response and whether the email was sent by the **application**.
3. Open the private library from the email; confirm the **real PDF**, not a test placeholder, downloads with correct name, page count, size, and SHA-256.
4. Buy a bundle; confirm each guide in the bundle is downloadable.
5. Refund a test order; check the private link refuses access.

Only after all tests and sales-copy/imagery-rights/legal approvals may production payments be enabled.

## Future guide revisions

For each edited PDF, get the owner's new approved master, hash it, upload to a **new hash-qualified key** in the same private bucket, and update the manifest in GitHub. Never overwrite the old object in place, since previously issued purchase links may need historical delivery. Verify the object's actual bytes before marking it final.

Do not enable public access (the `r2.dev` endpoint or a custom R2 domain) to paid files.
