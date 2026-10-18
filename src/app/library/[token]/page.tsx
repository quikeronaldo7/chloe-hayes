import type { Metadata } from "next";
import Link from "next/link";
import { LibraryNote, LibraryView } from "@/components/library-view";
import { SupportNote } from "@/components/support";
import { TrackOnMount } from "@/components/track";
import { storefrontOpen } from "@/lib/storefront";
import { buildLibrary } from "@/lib/server/library";
import { getOrder } from "@/lib/server/orders";
import { readLibraryToken } from "@/lib/server/tokens";

export const metadata: Metadata = { title: "Your library", robots: { index: false, follow: false } };

/** The private library. Every visit re-checks the order with Stripe: refunds revoke access. */
export default async function LibraryPage({ params }: PageProps<"/library/[token]">) {
  const { token } = await params;
  const claim = storefrontOpen() ? readLibraryToken(token) : null;
  const order = claim ? await getOrder(claim.sessionId) : null;

  if (order?.status === "refunded") {
    return <Notice title="This order has been refunded.">Downloads are no longer available for this order.</Notice>;
  }
  if (order?.status === "unpaid") {
    return (
      <Notice title="This order isn’t complete yet.">
        The payment hasn&rsquo;t been confirmed. Some payment methods take a few minutes, so open this link again a little later.
      </Notice>
    );
  }
  if (!order || !order.productIds.length) {
    return (
      <Notice title="This library link isn’t working.">
        It may have expired or been mistyped. Get a fresh one with{" "}
        <Link href="/help#resend" className="link-quiet font-semibold">
          Resend my downloads
        </Link>
        .
      </Notice>
    );
  }

  const date = new Date(order.created * 1000).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
  return (
    <div className="wrap max-w-4xl section-tight">
      <TrackOnMount event="library_opened" props={{ order_id: order.id }} />
      {order.livemode === false ? <p className="mb-6 rounded-xl bg-sun/30 px-4 py-3 text-sm">Stripe test-mode order: no real payment was taken.</p> : null}
      <p className="t-eyebrow text-terracotta">Your library</p>
      <h1 className="t-h1 mt-3 text-balance">
        Your Austin, <span className="accent-italic">all in one place.</span>
      </h1>
      <p className="mt-4 text-ink-soft">Bookmark this page. Download buttons refresh every time you open it, and stay private to you.</p>
      <p className="mt-2 t-small text-muted">
        Order of {date}
        {order.email ? <> · {order.email}</> : null}
      </p>
      <div className="mt-10">
        <LibraryView items={buildLibrary(order)} />
      </div>
      <LibraryNote />
    </div>
  );
}

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="wrap-narrow section">
      <p className="t-eyebrow text-terracotta">Your library</p>
      <h1 className="t-h1 mt-3">{title}</h1>
      <p className="t-lede mt-6 text-ink-soft">
        {children} Questions? Please <SupportNote />.
      </p>
    </div>
  );
}
