import type { Metadata } from "next";
import Link from "next/link";
import { expandPurchase, getProduct } from "@/catalogue";
import { ClearPurchased } from "@/components/cart";
import { LibraryNote, LibraryView } from "@/components/library-view";
import { ProductCard } from "@/components/product-card";
import { PurchaseTracker } from "@/components/purchase-tracker";
import { SupportNote } from "@/components/support";
import { toMajor } from "@/lib/money";
import { buildLibrary, libraryPath } from "@/lib/server/library";
import { getOrder } from "@/lib/server/orders";

export const metadata: Metadata = { title: "Thank you", robots: { index: false } };

export default async function SuccessPage({ searchParams }: PageProps<"/checkout/success">) {
  const { session_id } = await searchParams;
  const order = typeof session_id === "string" ? await getOrder(session_id) : null;

  if (!order || !order.productIds.length) {
    return (
      <Message title="We couldn't find that order.">
        If you&rsquo;ve just paid, give it a moment and refresh this page: your Stripe receipt confirms the payment. You can also <SupportNote />.
      </Message>
    );
  }
  if (order.status === "refunded") {
    return <Message title="This order has been refunded.">Downloads are no longer available for this order.</Message>;
  }
  if (order.status !== "paid") {
    return (
      <Message title="Your payment is processing.">
        Some payment methods take a few minutes to confirm. Once it does, your guides appear right here, so refresh in a little while.
      </Message>
    );
  }

  const items = buildLibrary(order);
  const owned = new Set(expandPurchase(order.productIds).map((p) => p.id));
  const first = items[0] ? getProduct(items[0].product.id) : undefined;
  // One gentle next step from the guide's own companion list, never something already owned.
  const next = first?.related.map((r) => getProduct(r.id)!).find((p) => !owned.has(p.id));
  const emailed = order.emailFulfilment.state === "accepted";

  return (
    <div className="wrap max-w-4xl section-tight">
      <ClearPurchased ids={order.productIds} />
      <PurchaseTracker orderId={order.id} value={toMajor(order.amountTotal)} currency={order.currency.toUpperCase()} items={order.productIds.join(",")} />
      {order.demo ? <p className="mb-6 rounded-xl bg-sun/30 px-4 py-3 text-sm">Demo checkout (local development): no payment was taken.</p> : null}
      {order.livemode === false ? <p className="mb-6 rounded-xl bg-sun/30 px-4 py-3 text-sm">Stripe test-mode order: no real payment was taken.</p> : null}

      <p className="t-eyebrow text-terracotta">Thank you!</p>
      <h1 className="t-h1 mt-3 text-balance">
        You&rsquo;re all set. <span className="accent-italic">Let&rsquo;s go.</span>
      </h1>
      {/* Email is mentioned only once Resend accepted it (recorded by the webhook). */}
      <p className="t-lede mt-5 text-ink-soft">
        {emailed ? (
          <>Your guides are below, and we&rsquo;ve emailed your private library link{order.email ? ` to ${order.email}` : ""} so you can come back any time.</>
        ) : (
          <>
            Your guides are below. <a href={libraryPath(order.id)} className="link-quiet font-semibold">Bookmark your private library</a> so you can come back any time.
          </>
        )}
      </p>

      <div className="mt-10">
        <LibraryView items={items} />
      </div>
      <LibraryNote />

      {next ? (
        <section className="mt-16">
          <p className="t-eyebrow text-terracotta">When you&rsquo;re ready</p>
          <h2 className="t-h3 mt-2">One that pairs nicely</h2>
          <div className="mt-6 max-w-[15rem]">
            <ProductCard product={next} compact />
          </div>
        </section>
      ) : null}
      <p className="mt-12 t-small">
        <Link href="/shop" className="link-arrow">
          Back to the shop <span aria-hidden>→</span>
        </Link>
      </p>
    </div>
  );
}

function Message({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="wrap-narrow section">
      <h1 className="t-h1 text-balance">{title}</h1>
      <p className="t-lede mt-6 text-ink-soft">{children}</p>
    </div>
  );
}
