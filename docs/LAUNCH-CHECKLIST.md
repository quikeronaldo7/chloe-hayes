# Chloe in Austin — launch readiness

**Updated 19 October 2026.** Deployment and payment states must be kept separate: a Vercel production build can be READY while public access and paid checkout remain intentionally closed. Kate's website, webhook, and product records are not part of this launch.

## Completed and independently verified

- All seven approved PDFs retrieved from master Drive links and SHA-256 locked in `src/catalogue/delivery.server.ts`.
- All seven uploaded to the **private** Cloudflare R2 bucket `chloe-hayes-products` under `guides/<slug>.<sha-prefix>.pdf`. Cloudflare object names and sizes agree with the approved bundle. R2 public managed domain is disabled, and there are no custom public R2 domains.
- R2 **Object Read only** credentials installed in Vercel Preview **and Production**. PDF download verifies remote object size and SHA-256 before returning a five-minute presigned URL.
- All seven product guide prices and four discounted bundle prices recorded from owner approval (18 October): First Month $49; Date Night $29; Weekend Explorer $29; Complete Collection $99. Individual guide prices remain unchanged.
- Eleven **live** Stripe Products with fixed default USD Prices created in QR DIGITAL (19 October) with `storefront=chloe-in-austin` and `product_id` metadata. The code references their exact live Product and Price IDs. This does **not** activate live payments.
- Dedicated **live** Stripe webhook at `https://chloeinaustin.com/api/webhooks/stripe`, events `checkout.session.completed` and `checkout.session.async_payment_succeeded`, with signing secret installed in Vercel **Production**. Kate's live webhook untouched.
- Dedicated **test** Stripe webhook on the protected Preview alias, with Vercel automation bypass, and test secret installed in **Preview**.
- The deployed **Preview** successfully processed a Stripe test-card purchase. Its private library showed a real locked PDF (no placeholder) and returned a presigned Cloudflare R2 URL for the correct object.
- Resend verified `chloeinaustin.com` for **outbound** email. Domain-restricted sending-only key installed in Vercel; confirmed a Chloe test purchase email was **delivered** to the test buyer on 19 October.
- Updated code deployed to both Vercel Preview and Production. Production domain `chloeinaustin.com` and www are assigned and verified.
- See `docs/DELIVERY.md` for locked R2 object paths and credentials.

## Not yet live — intentional safeguards

- Vercel **Production**: `STOREFRONT_MODE=browse`; `LIVE_PAYMENTS_ENABLED=false`; no live `STRIPE_SECRET_KEY` installed yet. Site currently shows a **Coming Soon** purchase state. **Do not set `STOREFRONT_MODE=open` before the remaining approvals and checks pass**.
- Vercel Authentication still protects all deployments: `ssoProtection.deploymentType=all`. Public visitors do not yet have unrestricted access.
- Preview uses its separate `sk_test_` Stripe key and `CHLOE_TEST_COMMERCE=true`; never put this test key in Production.
- `SELLER_VERIFIED=false`, `CHLOE_EMAIL_VERIFIED=false`, and `CHLOE_LIVE_ACTIVATION_APPROVED=false`: intentionally not marked true without real owner approvals.

## Manual account tasks before opening public sales

1. **Live Stripe secret**: owner must copy `sk_live_…` from QR DIGITAL's live Stripe API-key dashboard directly into Vercel Environment Variables as **Sensitive**, key `STRIPE_SECRET_KEY`, **Production only**. Never paste it into chat or GitHub. The live webhook signing secret is already in Vercel.
2. **Legal seller and policies**: owner confirms legal seller (QR DIGITAL LLC or alternative), official address/jurisdiction, tax handling, digital guide personal-use licence, privacy/contact details and actual digital-product refund rules. `src/lib/policies.ts` is *not* an approved final legal agreement; do not present placeholders as finalized terms.
3. **Support receiving**: choose a monitored customer-service email destination and enable forwarding/receiving of `hello@chloeinaustin.com`, or provide a separate working support inbox. Current Resend verification is *outgoing only*. Confirm support receipt and reply.
4. **Rights and truthful identity**: owner must approve commercial rights for all website and in-PDF restaurant/venue/Google Maps/mural photos, plus AI-generated Chloe depiction in named settings, and decide the transparent AI-persona disclosure. See `docs/IMAGERY.md` and the seven PDF masters.
5. **Editorial/merchant approvals**: website sales copy still marked `needs-review`; imagery `pending` in `src/catalogue/readiness.ts`. Resolve the New-to-Austin image/rent provenance checks and confirm whether the chosen Exclusive Experiences master (10,513,766 bytes) is the intended one. Do not change readiness flags by guessing.

## Final end-to-end QA

- Repeat a test purchase for **one discounted bundle**, verify the emailed library contains the exact guides and both real PDFs download.
- In Stripe test mode, refund a test transaction and verify the previously valid library/download links refuse refunded access.
- With production payment credentials and the complete approved policies/rights/operational checks, deploy with `LIVE_PAYMENTS_ENABLED=true` and `STOREFRONT_MODE=open`. Perform **one controlled real-money purchase** and receipt/email/download test, then optionally refund it.
- Remove Vercel Authentication from the **Production** custom domain (keep Preview protected), only after the owner's final public-launch authorization and successful live-payment QA.

**Never make all deployments public just to unblock the Stripe test webhook.** Its protected Preview bypass is already configured.

## Future refreshes

Guides contain date-sensitive venue information (one-off October 2026 events, prices, reservations, swim access). Establish a content review cadence and upload revised PDFs under new hash-qualified object keys, without overwriting earlier customer files.
