import type { Metadata } from "next";
import Link from "next/link";
import { SupportNote } from "@/components/support";

export const metadata: Metadata = { title: "Download unavailable", robots: { index: false, follow: false } };

const copy = {
  expired: { title: "This download link has expired.", body: "Download links last thirty minutes, to keep your files private. Open your library again for a fresh one." },
  unverified: { title: "We couldn't verify this purchase.", body: "The link may belong to a different order, or the payment may not have completed." },
  refunded: { title: "This order has been refunded.", body: "Downloads are no longer available for this order." },
  unavailable: { title: "This download is temporarily unavailable.", body: "Nothing is wrong with your order: we'll make sure you get it." },
} as const;

/** Shown whenever a download can't be served. A different or older file is never served instead. */
export default async function DownloadUnavailablePage({ searchParams }: PageProps<"/download-unavailable">) {
  const { reason } = await searchParams;
  const key = (typeof reason === "string" && reason in copy ? reason : "unavailable") as keyof typeof copy;
  const c = copy[key];
  return (
    <div className="wrap-narrow section">
      <p className="t-eyebrow text-terracotta">Your library</p>
      <h1 className="t-h1 mt-3 text-balance">{c.title}</h1>
      <p className="t-lede mt-6 text-ink-soft">
        {c.body} Need a hand? Please <SupportNote />.
      </p>
      <div className="mt-10 flex flex-wrap gap-3">
        {key !== "refunded" ? (
          <Link href="/help#resend" className="btn">
            Get my library link again
          </Link>
        ) : null}
        <Link href="/help" className="btn btn-outline">
          Help & downloads
        </Link>
      </div>
    </div>
  );
}
