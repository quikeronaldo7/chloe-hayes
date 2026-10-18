"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getSellable } from "@/catalogue";
import { priceOf } from "@/catalogue/pricing";
import { useCart } from "@/components/cart";
import { track } from "@/lib/analytics";
import { formatMoney } from "@/lib/money";

/** Price line that is honest about the deployment: approved, test, or coming soon. */
export function PriceTag({ id, className = "" }: { id: string; className?: string }) {
  const { book } = useCart();
  const price = priceOf(book, id);
  if (price === null) return <span className={`chip bg-sand text-ink ${className}`}>Price coming soon</span>;
  return (
    <span className={`inline-flex items-baseline gap-2 ${className}`}>
      <span className="font-serif text-2xl tabular-nums">{formatMoney(price)}</span>
      {book.mode === "test" ? <span className="chip bg-sun/40 text-ink">Test price</span> : null}
    </span>
  );
}

/**
 * The purchase moment: Buy now (straight to Stripe) or Add to bag, plus a sticky bar on
 * mobile once the buttons scroll away. When nothing can be bought on this deployment
 * (no approved price yet), it says so plainly. There are never dead buy buttons.
 */
export function BuyBox({ id }: { id: string }) {
  const { checkout, busy, error, add, book, shopOpen } = useCart();
  const [showBar, setShowBar] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const item = getSellable(id);
  const price = priceOf(book, id);
  const sellable = shopOpen && price !== null;

  useEffect(() => {
    const el = ref.current;
    if (!el || !sellable) return;
    let frame = 0;
    const check = () => {
      frame = 0;
      setShowBar(el.getBoundingClientRect().bottom < 0);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [sellable]);

  if (!item) return null;

  if (!sellable) {
    return (
      <div className="card p-5">
        <p className="t-eyebrow text-terracotta">Coming soon</p>
        <p className="mt-2 font-serif text-xl leading-snug">This guide is finished. The shop isn&rsquo;t open quite yet.</p>
        <p className="mt-2 t-small text-ink-soft">Prices are being finalized. Have a look around in the meantime: every guide, sample page and FAQ is here.</p>
        <Link href="/help" className="link-arrow mt-4 t-small">
          How buying will work <span aria-hidden>→</span>
        </Link>
      </div>
    );
  }

  function buy(location: string) {
    track("product_cta_clicked", { product_id: id, location });
    void checkout([id], location);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <PriceTag id={id} />
        <span className="t-small text-muted">Digital PDF · instant download library</span>
      </div>
      <div ref={ref} className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button type="button" className="btn w-full sm:w-auto sm:min-w-[14rem]" disabled={busy} onClick={() => buy("buy_box")}>
          {busy ? "Opening secure checkout…" : "Buy now"}
        </button>
        <button type="button" className="btn btn-outline w-full sm:w-auto" onClick={() => add(id)}>
          Add to bag
        </button>
      </div>
      <p role="alert" className="mt-3 min-h-5 text-sm text-terracotta-deep">
        {error}
      </p>
      {book.mode === "test" ? (
        <p className="t-small text-muted">Preview test mode: pay with Stripe test card 4242 4242 4242 4242. No real money moves.</p>
      ) : null}

      <div
        aria-hidden={!showBar}
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 backdrop-blur transition-[transform,visibility] duration-500 lg:hidden ${
          showBar ? "visible translate-y-0" : "invisible translate-y-full"
        }`}
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="wrap flex items-center justify-between gap-4 py-3">
          <div className="min-w-0">
            <p className="truncate font-serif text-[1.02rem] leading-tight">{"shortTitle" in item ? item.shortTitle : item.title}</p>
            <p className="text-sm text-muted tabular-nums">
              {formatMoney(price!)}
              {book.mode === "test" ? " · test" : ""}
            </p>
          </div>
          <button type="button" tabIndex={showBar ? 0 : -1} className="btn min-h-11 shrink-0 px-5" disabled={busy} onClick={() => buy("sticky_bar")}>
            {busy ? "Opening…" : "Buy now"}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Small "Add to bag" for cards and bundle rows, only when the item is sellable here. */
export function AddButton({ id, label = "Add to bag", className = "" }: { id: string; label?: string; className?: string }) {
  const { add, book, shopOpen } = useCart();
  if (!shopOpen || priceOf(book, id) === null) return null;
  return (
    <button type="button" onClick={() => add(id)} className={`btn min-h-10 px-4 py-2 text-sm ${className}`}>
      {label}
    </button>
  );
}
