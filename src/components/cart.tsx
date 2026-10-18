"use client";

import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { getSellable, isBundle } from "@/catalogue";
import { addToCart, describeNote, reconcile, removeFromCart, summarise, type CartNote } from "@/catalogue/cart";
import type { PriceBook } from "@/catalogue/pricing";
import { track } from "@/lib/analytics";
import { formatMoney } from "@/lib/money";
import { CoverThumb } from "./cover";

/**
 * The bag. Only catalogue ids are stored (localStorage, synced across tabs).
 * Prices come from the price book the server hands to this provider, and the
 * server recalculates everything again at checkout.
 */

const KEY = "cia-bag-v1";

interface CartContext {
  ids: string[];
  ready: boolean;
  book: PriceBook;
  shopOpen: boolean;
  add: (id: string, opts?: { open?: boolean }) => CartNote;
  remove: (id: string) => void;
  clear: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  note: CartNote | null;
  checkout: (ids?: string[], location?: string) => Promise<void>;
  busy: boolean;
  error: string;
}

const Ctx = createContext<CartContext | null>(null);

export function useCart(): CartContext {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

// A tiny external store over localStorage, so every tab and component sees the same bag.
const EMPTY: string[] = [];
const listeners = new Set<() => void>();
let memory: string[] = EMPTY;
let lastRaw: string | null | undefined;
let lastIds: string[] = EMPTY;

function readRaw(): string[] {
  let raw: string | null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    return memory;
  }
  if (raw !== lastRaw) {
    lastRaw = raw;
    try {
      const parsed = JSON.parse(raw ?? "[]");
      lastIds = Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : EMPTY;
    } catch {
      lastIds = EMPTY;
    }
  }
  return lastIds;
}

function write(ids: string[]) {
  memory = ids;
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    /* private mode: the bag lives in memory for this tab only */
  }
  listeners.forEach((l) => l());
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) onChange();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

const noopSubscribe = () => () => {};

export function CartProvider({ children, book, shopOpen }: { children: React.ReactNode; book: PriceBook; shopOpen: boolean }) {
  const raw = useSyncExternalStore(subscribe, readRaw, () => EMPTY);
  // Anything not sellable in this deployment's price book quietly drops out of view.
  const ids = useMemo(() => reconcile(raw, book).ids, [raw, book]);
  const ready = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState<CartNote | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Coming back from Stripe with the back button restores the page from cache.
    const onShow = () => setBusy(false);
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);

  const add = useCallback(
    (id: string, opts?: { open?: boolean }) => {
      const r = addToCart(reconcile(readRaw(), book).ids, id, book);
      write(r.ids);
      setNote(r.note);
      setError("");
      if (opts?.open !== false) setOpen(true);
      track("add_to_bag", { product_id: id, result: r.note.kind });
      return r.note;
    },
    [book],
  );

  const remove = useCallback((id: string) => {
    write(removeFromCart(readRaw(), id));
    setNote(null);
    track("remove_from_bag", { product_id: id });
  }, []);

  const clear = useCallback(() => {
    write([]);
    setNote(null);
  }, []);

  const checkout = useCallback(
    async (items?: string[], location = "bag") => {
      const list = items ?? reconcile(readRaw(), book).ids;
      if (!list.length) return;
      setBusy(true);
      setError("");
      track("checkout_started", { items: list.join(","), location });
      try {
        const res = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: list }) });
        const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
        if (!res.ok || !data.url) throw new Error(data.error ?? "We couldn't start checkout. Please try again.");
        window.location.assign(data.url);
      } catch (err) {
        const message = err instanceof Error ? err.message : "We couldn't start checkout. Please try again.";
        setError(message);
        setBusy(false);
        track("checkout_failed", { items: list.join(","), reason: message });
      }
    },
    [book],
  );

  const value = useMemo(
    () => ({ ids, ready, book, shopOpen, add, remove, clear, open, setOpen, note, checkout, busy, error }),
    [ids, ready, book, shopOpen, add, remove, clear, open, note, checkout, busy, error],
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      <CartDrawer />
    </Ctx.Provider>
  );
}

/** On the success page: take what was just bought out of the bag. */
export function ClearPurchased({ ids }: { ids: string[] }) {
  const { remove } = useCart();
  const key = ids.join(",");
  useEffect(() => {
    for (const id of key.split(",")) if (id && readRaw().includes(id)) remove(id);
  }, [key, remove]);
  return null;
}

export function OpenBagButton({ className = "" }: { className?: string }) {
  const { setOpen } = useCart();
  return (
    <button type="button" className={className} onClick={() => setOpen(true)}>
      Open your bag
    </button>
  );
}

/** Header trigger with a live count. */
export function CartButton({ className = "" }: { className?: string }) {
  const { ids, ready, setOpen } = useCart();
  const count = ready ? ids.length : 0;
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className={`relative inline-flex min-h-11 items-center gap-2 rounded-full px-3 font-semibold transition-colors hover:bg-paper-deep ${className}`}
      aria-label={count ? `Your bag, ${count} ${count === 1 ? "item" : "items"}` : "Your bag, empty"}
      aria-haspopup="dialog"
    >
      <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 8Z" />
        <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
      </svg>
      <span className="hidden text-sm sm:inline">Bag</span>
      <span
        className={`grid h-5 min-w-5 place-items-center rounded-full px-1 text-[0.7rem] tabular-nums transition-all duration-300 ${
          count ? "scale-100 bg-terracotta text-white" : "scale-90 bg-paper-deep text-muted"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function CartDrawer() {
  const { ids, open, setOpen, note, remove, clear, checkout, busy, error, book } = useCart();
  const panel = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const opener = useRef<Element | null>(null);
  const { lines, subtotal } = summarise(ids, book);
  const test = book.mode === "test";

  useEffect(() => {
    if (!open) return;
    opener.current = document.activeElement;
    document.documentElement.style.overflow = "hidden";
    const t = window.setTimeout(() => closeBtn.current?.focus(), 30);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key !== "Tab" || !panel.current) return;
      const focusable = panel.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
      (opener.current as HTMLElement | null)?.focus?.();
    };
  }, [open, setOpen]);

  return (
    <div className={`fixed inset-0 z-[70] transition-[visibility] duration-500 ${open ? "visible" : "pointer-events-none invisible"}`} aria-hidden={!open}>
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close your bag"
        onClick={() => setOpen(false)}
        className={`absolute inset-0 bg-ink/35 backdrop-blur-[2px] transition-opacity duration-500 ${open ? "opacity-100" : "opacity-0"}`}
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bag-title"
        className={`absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col rounded-t-[1.5rem] bg-paper transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:inset-y-3 sm:right-3 sm:left-auto sm:max-h-none sm:w-[28rem] sm:rounded-[1.5rem] ${
          open ? "translate-x-0 translate-y-0 shadow-[0_-24px_60px_-30px_rgba(42,36,32,.5)]" : "translate-y-full sm:translate-x-[110%] sm:translate-y-0"
        }`}
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        inert={!open}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 id="bag-title" className="t-h3">
            Your bag
          </h2>
          <button ref={closeBtn} type="button" onClick={() => setOpen(false)} className="rounded-full px-3 py-2 text-sm font-semibold hover:bg-paper-deep">
            Close
          </button>
        </div>

        {test ? (
          <p className="border-b border-line bg-sun/25 px-6 py-2.5 text-[0.8rem] font-medium">
            Test mode: $1 test prices, Stripe test cards only. Nothing here is a real price.
          </p>
        ) : null}

        <p aria-live="polite" className={note && note.kind !== "added" ? "border-b border-line bg-blush/70 px-6 py-3 text-sm" : "sr-only"}>
          {note ? describeNote(note) : ""}
        </p>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col justify-center px-6 py-14">
            <p className="t-h3">Your bag is empty (for now).</p>
            <p className="mt-3 text-ink-soft">Start with the flagship, or have a browse.</p>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
              <Link href="/guides/new-to-austin" onClick={() => setOpen(false)} className="link-arrow">
                New to Austin <span aria-hidden>→</span>
              </Link>
              <Link href="/shop" onClick={() => setOpen(false)} className="link-arrow">
                All guides <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-6">
              {lines.map(({ item, price }) => {
                const bundle = isBundle(item);
                const first = bundle ? getSellable(item.includes[0]) : item;
                return (
                  <li key={item.id} className="flex gap-4 py-5">
                    <div className="w-14 shrink-0">{first && !isBundle(first) ? <CoverThumb product={first} /> : null}</div>
                    <div className="min-w-0 flex-1">
                      <p className="t-eyebrow text-terracotta">{bundle ? `Bundle · ${item.includes.length} guides` : "Digital guide · PDF"}</p>
                      {bundle ? (
                        <p className="mt-1 font-serif text-[1.08rem] leading-snug">{item.title}</p>
                      ) : (
                        <Link href={`/guides/${item.slug}`} onClick={() => setOpen(false)} className="mt-1 block font-serif text-[1.08rem] leading-snug hover:underline">
                          {item.title}
                        </Link>
                      )}
                      <button type="button" onClick={() => remove(item.id)} className="mt-2 text-xs text-muted underline underline-offset-4 hover:text-ink">
                        Remove<span className="sr-only"> {item.title}</span>
                      </button>
                    </div>
                    <p className="font-serif tabular-nums">{formatMoney(price)}</p>
                  </li>
                );
              })}
            </ul>

            <div className="border-t border-line px-6 py-5">
              <p className="flex items-baseline justify-between">
                <span className="t-eyebrow">Subtotal{test ? " (test)" : ""}</span>
                <span className="font-serif text-xl tabular-nums">{formatMoney(subtotal)}</span>
              </p>
              <p className="mt-1 text-xs text-muted">Promo codes can be added at checkout.</p>
              <button type="button" className="btn mt-4 w-full" disabled={busy} onClick={() => checkout(undefined, "bag")}>
                {busy ? "Opening secure checkout…" : "Checkout"}
              </button>
              <p role="alert" className="mt-2 min-h-4 text-sm text-terracotta-deep">
                {error}
              </p>
              <div className="flex items-center justify-between text-xs text-muted">
                <span>Secure checkout by Stripe · instant download library</span>
                <button type="button" onClick={clear} className="underline underline-offset-4 hover:text-ink">
                  Clear bag
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
