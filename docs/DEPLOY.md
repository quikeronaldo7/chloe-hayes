# Deploying the protected preview (Vercel project `chloe-hayes`)

Project `chloe-hayes` · id `prj_TchL8Kz6g9QuhKQ8sTdgUwy8PfTY` · team `team_sJn5GEx7OfU2GhKzKlsyvIp3`. Code: `quikeronaldo7/chloe-hayes` (`main`, and an identical `preview` branch).

The Claude session couldn't do these steps: its network policy blocks `api.vercel.com`. They take about five minutes in the Vercel dashboard.

## 0. Before connecting: make sure nothing goes public

`chloeinaustin.com` is attached to this project's **Production** environment. Connecting a repo deploys the production branch to Production.

1. **Settings → Deployment Protection → Vercel Authentication**: confirm it is set to **All Deployments** (not "Standard Protection", which leaves production custom domains public). Keep it on.
2. Optional, extra safety: **Settings → Git → Production Branch** → set it to `production` (a branch that doesn't exist yet). Then `main` and `preview` only ever create **Preview** deployments until you deliberately create `production`.

Even if Production were reached, the code is safe: Production is browsing-only, has no approved prices, hides bundle proposals and refuses checkout.

## 1. Connect the repository

**Settings → Git → Connect Git Repository** → GitHub → `quikeronaldo7/chloe-hayes`. Framework is detected as Next.js; leave build settings at their defaults.

## 2. Environment variables (Preview environment)

The site **renders without any variables** (browse-only, "Price coming soon"). For full test commerce, add to **Preview** only:

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | the preview's stable branch URL, e.g. `https://chloe-hayes-git-preview-<team>.vercel.app` |
| `DOWNLOAD_TOKEN_SECRET` | output of `openssl rand -base64 48` (new, Chloe-only; required for the library and downloads) |
| `STRIPE_SECRET_KEY` | QR DIGITAL **test** secret key (`sk_test_…`) |
| `STRIPE_WEBHOOK_SECRET` | from step 4 |
| `CHLOE_TEST_COMMERCE` | `true` (Preview only, never Production) |
| `LIVE_PAYMENTS_ENABLED` | `false` |
| `RESEND_API_KEY` | a Resend key with sending access |
| `EMAIL_FROM` | `Chloe in Austin <hello@chloeinaustin.com>` |
| `STORAGE_DRIVER` / `S3_*` | after the R2 read-only token exists (docs/DELIVERY.md) |

Production: set nothing yet (or `LIVE_PAYMENTS_ENABLED=false`). Don't set `STOREFRONT_MODE=open`.

## 3. Deploy

**Deployments → Create Deployment** → branch `preview` (or push any commit). The URL looks like `chloe-hayes-git-preview-….vercel.app`, behind Vercel Authentication.

## 4. Stripe test webhook

In Stripe **test mode** (QR DIGITAL): Developers → Webhooks → Add endpoint `https://<preview URL>/api/webhooks/stripe`, events `checkout.session.completed` and `checkout.session.async_payment_succeeded`. Copy the signing secret to `STRIPE_WEBHOOK_SECRET`, then redeploy. Vercel Authentication blocks Stripe's webhook calls unless you add a **Protection Bypass for Automation** secret and append `?x-vercel-protection-bypass=<secret>` to the endpoint URL (Settings → Deployment Protection).

## 5. Verify

1. Open the preview: banner reads "Private preview · not public · Stripe TEST mode, $1 test prices".
2. Buy Hill Country Escapes with card `4242 4242 4242 4242`: success page, then library, then the email from hello@chloeinaustin.com.
3. Refund the payment in Stripe (test mode): the library link stops working.
