/**
 * Chloe in Austin: catalogue integrity + commerce tests.
 *   npm run test:chloe
 * Pure Node (tsx, react-server conditions so server-only modules load). No network.
 */
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import type Stripe from "stripe";
import { bundles, collections, expandPurchase, getProduct, products } from "../src/catalogue";
import { addToCart, reconcile, summarise } from "../src/catalogue/cart";
import { delivery } from "../src/catalogue/delivery.server";
import { approvedPriceBook, bundleOffers, testPriceBook } from "../src/catalogue/pricing";
import { readiness } from "../src/catalogue/readiness";
import { siteConfig } from "../src/lib/config";
import { purchaseEmail, resendEmail } from "../src/lib/server/email";
import { fulfilOrder, type FulfilmentDeps } from "../src/lib/server/fulfilment";
import { isLaunchReady } from "../src/lib/server/launch";
import { buildLibrary, deliverablesFor } from "../src/lib/server/library";
import { orderFromSession, productIdMetadata, productIdsFromSession, type Order } from "../src/lib/server/orders";
import { activePriceBook, testCommerceEnabled } from "../src/lib/server/pricing";
import { isLiveStripeKey, liveKeyBlocked } from "../src/lib/server/stripe";
import { fetchPrivateFile } from "../src/lib/server/storage";
import { placeholdersAllowedFor } from "../src/lib/server/test-fulfilment";
import { createDownloadToken, createLibraryToken, readDownloadToken, readLibraryToken } from "../src/lib/server/tokens";

let failed = 0;
let passed = 0;
function check(name: string, ok: unknown, detail = "") {
  if (ok) passed++;
  else {
    failed++;
    console.error(`✗ ${name}${detail ? ` (${detail})` : ""}`);
  }
}
const section = (s: string) => console.log(`\n— ${s}`);

/** The owner's approved price list (18 Oct 2026), in cents. */
const APPROVED_PRICES: Record<string, number> = {
  "cia-new-to-austin": 3900,
  "cia-dinner-spots": 1900,
  "cia-being-single": 1900,
  "cia-date-ideas": 1900,
  "cia-natural-gems": 1900,
  "cia-hill-country": 1500,
  "cia-exclusive": 2400,
};
const APPROVED_BUNDLES: Record<string, number> = {
  "cia-bundle-first-month": 4900,
  "cia-bundle-date-night": 2900,
  "cia-bundle-weekend-explorer": 2900,
  "cia-bundle-complete": 9900,
};

async function main() {
  // -------------------------------------------------------------------------
  section("Catalogue integrity");
  check("exactly seven guides", products.length === 7, String(products.length));
  check("ids unique", new Set(products.map((p) => p.id)).size === 7);
  check("slugs unique", new Set(products.map((p) => p.slug)).size === 7);
  check("ids namespaced cia- (never collide with Kate's ka-)", [...products, ...bundles].every((x) => x.id.startsWith("cia-")));
  const inCollections = collections.flatMap((c) => c.products);
  check("every guide in exactly one collection", products.every((p) => inCollections.filter((x) => x === p.id).length === 1));
  check("collection membership matches product.collection", collections.every((c) => c.products.every((id) => getProduct(id)?.collection === c.slug)));
  check("New to Austin is Start Here", getProduct("cia-new-to-austin")?.collection === "start-here");
  const expected: Record<string, [string, number]> = {
    "cia-new-to-austin": ["New to Austin: The Ultimate Guide to Living, Exploring & Belonging in Austin", 51],
    "cia-dinner-spots": ["Chloe's 10 Best Dinner Spots in Austin", 19],
    "cia-being-single": ["Chloe's Guide to Being Single in Austin", 13],
    "cia-date-ideas": ["Chloe's 12 Best Date Ideas in Austin", 24],
    "cia-natural-gems": ["Chloe's 5 Natural Gems Around Austin", 8],
    "cia-hill-country": ["Chloe's Perfect Hill Country Escapes", 8],
    "cia-exclusive": ["Chloe's 10 Most Exclusive Experiences in Austin", 19],
  };
  for (const [id, [title, pages]] of Object.entries(expected)) {
    const p = getProduct(id);
    check(`${id} title matches the FINAL PDF`, p?.title === title, p?.title);
    check(`${id} page count ${pages}`, p?.specs.pages === pages, String(p?.specs.pages));
    check(`${id} chips agree with page count`, p?.chips.some((c) => c === `${pages} pages`));
  }
  check("New to Austin facts: 12 chapters, 2 maps, 284 fields", ["12 chapters", "2 maps", "284 fillable fields"].every((c) => getProduct("cia-new-to-austin")!.chips.includes(c)));
  check("Exclusive says it gives no access", getProduct("cia-exclusive")!.notFor.some((n) => /not a way past|Membership, reservations, guaranteed admission/i.test(n)));
  for (const p of products) {
    check(`${p.id}: related ids valid and not self`, p.related.every((r) => getProduct(r.id) && r.id !== p.id && r.why.length > 20));
    check(`${p.id}: has FAQs, contents, caveats`, p.faqs.length >= 2 && p.contents.length >= 4 && p.caveats.length >= 1);
    check(`${p.id}: approved price matches the owner's list`, p.price.status === "approved" && p.price.amount === APPROVED_PRICES[p.id], String(p.price.amount));
    for (const img of [p.cover.image, p.cover.photo, p.hero, ...(p.previews ?? []).map((x) => x.image)].filter(Boolean)) {
      check(`${p.id}: image exists ${img!.src}`, existsSync(path.join("public", img!.src)));
      check(`${p.id}: image has alt`, (img!.alt ?? "").length > 10);
    }
    check(`${p.id}: readiness record`, readiness[p.id]?.kind === "product");
    check(`${p.id}: delivery entry`, Boolean(delivery[p.id]));
  }
  check("required recommendations: Dinner → Dates", getProduct("cia-dinner-spots")!.related[0].id === "cia-date-ideas");
  check("required recommendations: Dates → Dinner", getProduct("cia-date-ideas")!.related[0].id === "cia-dinner-spots");
  check("required recommendations: Gems → Hill Country", getProduct("cia-natural-gems")!.related[0].id === "cia-hill-country");
  check("required recommendations: Hill Country → Gems", getProduct("cia-hill-country")!.related[0].id === "cia-natural-gems");
  check("required recommendations: New to Austin → Being Single", getProduct("cia-new-to-austin")!.related[0].id === "cia-being-single");
  check("four approved bundles at the owner's prices", bundles.length === 4 && bundles.every((b) => b.status === "approved" && b.price.status === "approved" && b.price.amount === APPROVED_BUNDLES[b.id]));
  check("bundle contents valid", bundles.every((b) => b.includes.every((id) => getProduct(id))));
  check("Complete Austin Collection has all seven", bundles.find((b) => b.slug === "complete-austin-collection")!.includes.length === 7);
  check("no paid PDFs in /public", !hasPdf("public"));

  // -------------------------------------------------------------------------
  section("Delivery manifest");
  for (const [id, d] of Object.entries(delivery)) {
    if (d.status === "final") {
      for (const f of d.files) {
        check(`${id}: key contains sha prefix`, f.key.includes(f.sha256.slice(0, 12)));
        check(`${id}: sha256 is 64 hex`, /^[0-9a-f]{64}$/.test(f.sha256));
      }
    } else check(`${id}: pending entry names its FINAL Drive file + size`, d.expected.every((e) => e.approvedSource.fileId && e.approvedSource.bytes > 0) && d.blocker.length > 10);
  }
  const hill = delivery["cia-hill-country"];
  check("All seven customer PDFs locked FINAL", Object.values(delivery).length === 7 && Object.values(delivery).every((d) => d.status === "final"));
  check("Hill Country locked FINAL", hill.status === "final");
  if (hill.status === "final" && existsSync("private-files")) {
    const r = await fetchPrivateFile(hill.files[0], { STORAGE_DRIVER: "local", PRIVATE_FILES_DIR: "private-files" });
    check("local storage serves Hill Country after size + SHA-256 check", r.kind === "file", r.kind);
    const local = path.join("private-files", hill.files[0].key);
    if (existsSync(local)) check("local file hash equals the lock", createHash("sha256").update(readFileSync(local)).digest("hex") === hill.files[0].sha256);
  }
  check("local storage refused on a deployed site", (await fetchPrivateFile(hill.status === "final" ? hill.files[0] : ({} as never), { STORAGE_DRIVER: "local", VERCEL_ENV: "preview" })).kind === "error");

  // -------------------------------------------------------------------------
  section("Price books (no invented prices)");
  const approved = approvedPriceBook();
  check("approved book = the 7 guides + 4 bundles at approved prices", Object.keys(approved.prices).length === 11 && Object.entries({ ...APPROVED_PRICES, ...APPROVED_BUNDLES }).every(([id, n]) => approved.prices[id] === n));
  const test = testPriceBook();
  check("test book carries approved guide prices (same figures as the shop)", products.every((p) => test.prices[p.id] === approved.prices[p.id]));
  check("test book: approved bundle at its price, proposals = exact sum (no invented discount)", bundles.every((b) => test.prices[b.id] === (approved.prices[b.id] ?? b.includes.reduce((n, id) => n + test.prices[id], 0))));
  const env = (o: Record<string, string>) => o;
  check("test commerce needs all three conditions", testCommerceEnabled(env({ STRIPE_SECRET_KEY: "sk_test_x", CHLOE_TEST_COMMERCE: "true", VERCEL_ENV: "preview" })));
  check("…not with a live key", !testCommerceEnabled(env({ STRIPE_SECRET_KEY: "sk_live_x", CHLOE_TEST_COMMERCE: "true", VERCEL_ENV: "preview" })));
  check("restricted live key is recognized", isLiveStripeKey("rk_live_x") && isLiveStripeKey("sk_live_x"));
  check("restricted key never unlocks Preview test commerce", !testCommerceEnabled(env({ STRIPE_SECRET_KEY: "rk_live_x", CHLOE_TEST_COMMERCE: "true", VERCEL_ENV: "preview" })));
  check("restricted live key blocked until explicitly enabled", liveKeyBlocked(env({ STRIPE_SECRET_KEY: "rk_live_x", LIVE_PAYMENTS_ENABLED: "false" })));
  check("restricted live key still requires explicit live enable", !liveKeyBlocked(env({ STRIPE_SECRET_KEY: "rk_live_x", LIVE_PAYMENTS_ENABLED: "true" })));

  check("…not in Production", !testCommerceEnabled(env({ STRIPE_SECRET_KEY: "sk_test_x", CHLOE_TEST_COMMERCE: "true", VERCEL_ENV: "production" })));
  check("…not without the flag", !testCommerceEnabled(env({ STRIPE_SECRET_KEY: "sk_test_x", VERCEL_ENV: "preview" })));
  check("Production always uses the approved book", activePriceBook(env({ STRIPE_SECRET_KEY: "sk_test_x", CHLOE_TEST_COMMERCE: "true", VERCEL_ENV: "production" })).mode === "approved");
  check("Preview with flag uses the test book", activePriceBook(env({ STRIPE_SECRET_KEY: "sk_test_x", CHLOE_TEST_COMMERCE: "true", VERCEL_ENV: "preview" })).mode === "test");
  {
    const offers = Object.fromEntries(bundleOffers().map((o) => [o.bundle.id, o]));
    check("Curated Guide Bundles shows all four", Object.keys(offers).length === 4);
    const discounted = (id: string, price: number, separately: number, saving: number) => offers[id]?.price === price && offers[id].separately === separately && offers[id].saving === saving;
    check("First Month: $49 vs $58 separately, saves $9", discounted("cia-bundle-first-month", 4900, 5800, 900), JSON.stringify(offers["cia-bundle-first-month"] ?? null));
    check("Date Night: $29 vs $38 separately, saves $9", discounted("cia-bundle-date-night", 2900, 3800, 900));
    check("Weekend Explorer: $29 vs $34 separately, saves $5", discounted("cia-bundle-weekend-explorer", 2900, 3400, 500));
    const c = offers["cia-bundle-complete"];
    check("Complete Collection: $99 vs $154 separately, saves $55", c?.price === 9900 && c.separately === 15400 && c.saving === 5500, JSON.stringify(c ?? null));
    check("bag: First Month bundle subtotal $49", summarise(["cia-bundle-first-month"], approved).subtotal === 4900);
    check("bag: three discounted bundles together $107", summarise(["cia-bundle-first-month", "cia-bundle-date-night", "cia-bundle-weekend-explorer"], approved).subtotal === 10700);
  }
  {
    // Fixture book (QA only, never shown): checks the saving maths and that proposals stay hidden.
    const fx = { mode: "approved" as const, prices: { "cia-new-to-austin": 3900, "cia-being-single": 1900, "cia-bundle-first-month": 4900 } };
    const orig = bundles.find((b) => b.id === "cia-bundle-first-month")!;
    (orig as { status: string }).status = "proposal";
    check("unapproved bundle never offered, even with a price", bundleOffers(["cia-bundle-first-month"], fx).length === 0);
    (orig as { status: string }).status = "approved";
    const [o] = bundleOffers(["cia-bundle-first-month"], fx);
    check("saving = guides separately − bundle price", o?.separately === 5800 && o.price === 4900 && o.saving === 900, JSON.stringify(o ?? null));
    check("bundle with an unpriced guide is not offered", bundleOffers(["cia-bundle-date-night"], fx).length === 0);
  }
  check("all eleven approved products and bundles are launch-ready", [...products, ...bundles].every(isLaunchReady));

  // -------------------------------------------------------------------------
  section("Bag rules");
  let r = addToCart([], "cia-not-a-guide", approved);
  check("approved book: an unknown item can't be added", r.note.kind !== "added" && r.ids.length === 0);
  check("approved book: an approved guide can be added", addToCart([], "cia-dinner-spots", approved).note.kind === "added");
  r = addToCart([], "cia-dinner-spots", test);
  check("add a guide", r.note.kind === "added" && r.ids.join() === "cia-dinner-spots");
  check("duplicate refused", addToCart(r.ids, "cia-dinner-spots", test).note.kind === "duplicate");
  const withDates = addToCart(r.ids, "cia-date-ideas", test).ids;
  const bundled = addToCart(withDates, "cia-bundle-date-night", test);
  check("bundle replaces the guides it contains", bundled.note.kind === "replaced" && bundled.ids.join() === "cia-bundle-date-night");
  check("guide covered by a bundle is refused", addToCart(bundled.ids, "cia-date-ideas", test).note.kind === "covered");
  check("bigger bundle replaces a smaller one it contains", addToCart(["cia-bundle-first-month"], "cia-bundle-complete", test).note.kind === "replaced");
  check("smaller bundle inside a bigger one is refused", addToCart(["cia-bundle-complete"], "cia-bundle-first-month", test).note.kind === "covered");
  check("bundle absorbs a guide it contains, keeps unrelated ones", addToCart(["cia-bundle-date-night", "cia-new-to-austin"], "cia-bundle-first-month", test).ids.join() === "cia-bundle-date-night,cia-bundle-first-month");
  const tampered = reconcile(["cia-dinner-spots", "cia-dinner-spots", "nope", 42, "cia-bundle-complete", "ka-london-guide"], test);
  check("reconcile: dupes, unknown, Kate ids and covered guides dropped", tampered.ids.join() === "cia-bundle-complete", tampered.ids.join());
  check("summary uses book prices ($39 + $24)", summarise(["cia-new-to-austin", "cia-exclusive"], test).subtotal === 6300);
  check("expandPurchase: bundle → guides", expandPurchase(["cia-bundle-weekend-explorer"]).map((p) => p.id).join() === "cia-natural-gems,cia-hill-country");

  // -------------------------------------------------------------------------
  section("Orders: storefront isolation (shared QR DIGITAL Stripe account)");
  const session = (o: Partial<Stripe.Checkout.Session>) =>
    ({ id: "cs_test_abc", payment_status: "paid", amount_total: 200, currency: "usd", created: 1792300000, livemode: false, customer_details: { email: "a@b.co", name: "Ana Test" }, metadata: {}, ...o }) as unknown as Stripe.Checkout.Session;
  const ours = session({ metadata: { ...productIdMetadata(["cia-hill-country", "cia-bundle-date-night"]), storefront: siteConfig.storefront, pricing: "test" } });
  check("our session → ids", productIdsFromSession(ours).join() === "cia-hill-country,cia-bundle-date-night");
  check("Kate's session (no storefront tag) → nothing", productIdsFromSession(session({ metadata: { product_ids: "ka-london-guide" } })).length === 0);
  check("foreign storefront tag → nothing", productIdsFromSession(session({ metadata: { product_ids: "cia-hill-country", storefront: "kate-anderson" } })).length === 0);
  check("long id lists split under Stripe's 500-char cap", Object.values(productIdMetadata(Array(60).fill("cia-new-to-austin"))).every((v) => v.length <= 500));

  // -------------------------------------------------------------------------
  section("Tokens");
  const lib = createLibraryToken("cs_test_abc");
  check("library token round-trips", readLibraryToken(lib)?.sessionId === "cs_test_abc");
  check("tampered token rejected", readLibraryToken(lib.slice(0, -2) + "xx") === null);
  check("expired token rejected", readLibraryToken(createLibraryToken("cs_test_abc", { expiresAt: 1 })) === null);
  const dl = createDownloadToken("cs_test_abc", "cia-hill-country", 0);
  check("download token round-trips", readDownloadToken(dl)?.productId === "cia-hill-country");
  check("library token isn't a download token", readDownloadToken(lib) === null);
  const [body] = lib.split(".");
  const foreign = Buffer.from(JSON.stringify({ ...JSON.parse(Buffer.from(body, "base64url").toString()), w: "kate" })).toString("base64url");
  check("token claiming another site rejected (even if re-signed is impossible, payload swap fails)", readLibraryToken(`${foreign}.${lib.split(".")[1]}`) === null);

  // -------------------------------------------------------------------------
  section("Library + delivery");
  const testOrder: Order = { id: "cs_test_abc", status: "paid", productIds: ["cia-bundle-weekend-explorer"], amountTotal: 200, currency: "usd", created: 1792300000, livemode: false, emailFulfilment: { state: "not-recorded" } };
  const liveOrder: Order = { ...testOrder, id: "cs_live_abc", livemode: true };
  const prev = { ...process.env };
  Object.assign(process.env, { STRIPE_SECRET_KEY: "sk_test_x", CHLOE_TEST_COMMERCE: "true", VERCEL_ENV: "preview" });
  check("test order may receive placeholders", placeholdersAllowedFor(testOrder));
  check("live order never receives placeholders", !placeholdersAllowedFor(liveOrder));
  check("Hill Country delivers the locked file", deliverablesFor("cia-hill-country", liveOrder)[0].kind === "file");
  check("Natural Gems delivers its real locked PDF on test orders", deliverablesFor("cia-natural-gems", testOrder)[0].kind === "file");
  check("Natural Gems delivers its real locked PDF on live orders", deliverablesFor("cia-natural-gems", liveOrder)[0].kind === "file");
  const items = buildLibrary(testOrder);
  check("bundle library shows both guides together", items.map((i) => i.product.id).join() === "cia-natural-gems,cia-hill-country");
  check("library download links are signed tokens", items.every((i) => i.files.every((f) => !f.href || f.href.startsWith("/api/download/"))));
  process.env = prev;

  // -------------------------------------------------------------------------
  section("Fulfilment (webhook) + email");
  const sent: { subject: string; html: string; key?: string }[] = [];
  const recorded: Record<string, string>[] = [];
  const deps = (s: Stripe.Checkout.Session, opts: Partial<FulfilmentDeps> = {}): FulfilmentDeps => ({
    retrieveSession: async () => s,
    recordEmail: async (_id, m) => recorded.push(m),
    send: async (email, o) => {
      sent.push({ subject: email.subject, html: email.html, key: o?.idempotencyKey });
      return { status: "accepted", id: "em_123" };
    },
    configured: () => true,
    now: () => new Date("2026-10-18T12:00:00Z"),
    ...opts,
  });
  Object.assign(process.env, { NEXT_PUBLIC_SITE_URL: "https://chloe-preview.example.com" });
  let out = await fulfilOrder("cs_test_abc", deps(ours));
  check("paid order emailed once", out.result === "emailed" && sent.length === 1, out.result);
  check("idempotency key per session", sent[0]?.key === "purchase-email/v2/cs_test_abc");
  check("email lists the unlocked guides", ["Chloe's Perfect Hill Country Escapes", "Chloe's 12 Best Date Ideas in Austin", "Chloe's 10 Best Dinner Spots in Austin"].every((t) => sent[0].html.includes(t.replace("'", "&#39;")) || sent[0].html.includes(t)));
  check("email is Chloe-branded, never Kate", sent[0].html.includes("Chloe in Austin") && !/kate/i.test(sent[0].html + sent[0].subject));
  check("test order email is labelled", sent[0].html.includes("Test order"));
  check("email state recorded on the session", recorded[0]?.email_status === "accepted" && recorded[0]?.email_id === "em_123");
  out = await fulfilOrder("cs_test_abc", deps(session({ ...ours, metadata: { ...ours.metadata, email_status: "accepted", email_id: "em_1", email_v: "2" } })));
  check("already-emailed is not sent again", out.result === "already-emailed");
  out = await fulfilOrder("cs_x", deps(session({ metadata: { product_ids: "ka-london-guide" } })));
  check("Kate's order on this webhook → nothing-to-send", out.result === "nothing-to-send");
  out = await fulfilOrder("cs_x", deps(session({ ...ours, payment_intent: { latest_charge: { refunded: true } } as never })));
  check("refunded order never emailed", out.result === "refunded");
  out = await fulfilOrder("cs_x", deps(session({ ...ours, payment_status: "unpaid" })));
  check("unpaid order waits", out.result === "not-paid");
  out = await fulfilOrder("cs_x", deps(ours, { send: async () => ({ status: "failed", reason: "rate_limit", httpStatus: 429, retryable: true }) }));
  check("provider failure → retry (webhook 500)", out.result === "retry");
  out = await fulfilOrder("cs_x", deps(ours, { configured: () => false }));
  check("no email config → acknowledged, nothing claimed", out.result === "email-not-configured");
  check("refunded order maps to refunded", orderFromSession(session({ payment_intent: { latest_charge: { refunded: true } } as never })).status === "refunded");
  const re = resendEmail([{ titles: ["Chloe's Perfect Hill Country Escapes"], url: "https://x/library/t" }]);
  check("resend email Chloe-branded", re.subject.includes("Chloe in Austin") && !/kate/i.test(re.html));
  const pe = purchaseEmail({ titles: ["A"], libraryUrl: "https://x/library/t" });
  check("no support inbox claimed when none configured", !siteConfig.supportEmail ? !/reply to this email/i.test(pe.html) : true);
  process.env = prev;

  // -------------------------------------------------------------------------
  section("Checkout API (POST /api/checkout)");
  const { POST } = await import("../src/app/api/checkout/route");
  const call = async (body: unknown, extra: Record<string, string | undefined> = {}) => {
    const saved = { ...process.env };
    Object.assign(process.env, { STRIPE_SECRET_KEY: "", CHLOE_TEST_COMMERCE: "", VERCEL_ENV: "preview", ALLOW_DEMO_CHECKOUT: "", ...extra });
    try {
      const res = await POST(new Request("http://x/api/checkout", { method: "POST", body: typeof body === "string" ? body : JSON.stringify(body) }));
      return { status: res.status, json: (await res.json()) as { error?: string; url?: string } };
    } finally {
      process.env = saved;
    }
  };
  let res = await call({ items: ["cia-hill-country"] });
  check("no provider configured → fail closed before checkout", res.status === 503, `${res.status} ${res.json.error}`);
  res = await call("not json");
  check("malformed body → 400", res.status === 400);
  res = await call({ items: [] });
  check("empty bag → 400", res.status === 400);
  res = await call({ items: ["ka-london-guide"] });
  check("Kate's product id → 404", res.status === 404);
  res = await call({ items: ["cia-hill-country"], prices: { "cia-hill-country": 1 } });
  check("browser-sent prices ignored (checkout not configured)", res.status === 503);
  res = await call({ items: ["cia-hill-country"] }, { STRIPE_SECRET_KEY: "sk_test_x", CHLOE_TEST_COMMERCE: "true", VERCEL_ENV: "production" });
  check("Production never sells at test prices (browsing-only too)", res.status === 403 || res.status === 409, String(res.status));
  res = await call({ items: ["cia-hill-country"] }, { STRIPE_SECRET_KEY: "sk_live_x", CHLOE_TEST_COMMERCE: "true" });
  check("live key cannot unlock checkout without live enable", res.status === 503, String(res.status));
  res = await call({ items: ["cia-hill-country"] }, { STRIPE_SECRET_KEY: "rk_live_x", CHLOE_TEST_COMMERCE: "true" });
  check("restricted live key cannot unlock checkout without live enable", res.status === 503, String(res.status));
  res = await call({ items: ["cia-hill-country"] }, { STRIPE_SECRET_KEY: "rk_live_x", STOREFRONT_MODE: "open", VERCEL_ENV: "production", LIVE_PAYMENTS_ENABLED: "false" });
  check("restricted key cannot enable production checkout alone", res.status === 503, String(res.status));
  res = await call({ items: ["cia-hill-country"] }, { STRIPE_SECRET_KEY: "sk_test_x", CHLOE_TEST_COMMERCE: "true", NEXT_PUBLIC_SITE_URL: "" , VERCEL_ENV: "preview", VERCEL_URL: "" });
  check("test mode without a safe HTTPS origin → refused before Stripe", res.status === 503, String(res.status));

  console.log(`\n${failed ? "✗" : "✓"} ${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
}

function hasPdf(dir: string): boolean {
  return readdirSync(dir).some((f) => {
    const full = path.join(dir, f);
    return statSync(full).isDirectory() ? hasPdf(full) : f.toLowerCase().endsWith(".pdf");
  });
}

main();
