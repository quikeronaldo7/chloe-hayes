"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CartButton } from "./cart";
import { Wordmark } from "./wordmark";

export const NAV = [
  { href: "/shop", label: "Shop All" },
  { href: "/collections/eat-and-drink", label: "Eat & Drink" },
  { href: "/collections/date-and-connect", label: "Date & Connect" },
  { href: "/collections/explore-and-escape", label: "Explore & Escape" },
  { href: "/guides/new-to-austin", label: "New to Austin" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  const pathname = usePathname();
  // The menu is open "on" a path: navigating anywhere closes it, with no effect needed.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const setOpen = (next: boolean | ((o: boolean) => boolean)) => setOpenOn((typeof next === "function" ? next(open) : next) ? pathname : null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    if (!open) return;
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenOn(null);
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const active = (href: string) => pathname === href || (href !== "/" && pathname.startsWith(href + "/"));

  return (
    <header className={`sticky top-0 z-50 transition-[background-color,box-shadow] duration-300 ${scrolled || open ? "bg-paper/92 shadow-[0_1px_0_var(--color-line)] backdrop-blur-md" : "bg-paper"}`}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-[60] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-paper">
        Skip to content
      </a>
      <div className="wrap flex h-[var(--header-h)] items-center justify-between gap-4">
        <Link href="/" aria-label="Chloe in Austin, home" className="shrink-0">
          <Wordmark />
        </Link>

        <nav aria-label="Main" className="hidden xl:block">
          <ul className="flex items-center gap-1">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  aria-current={active(n.href) ? "page" : undefined}
                  className={`rounded-full px-3 py-2 text-[0.92rem] font-medium transition-colors hover:bg-paper-deep ${active(n.href) ? "bg-paper-deep text-terracotta-deep" : ""}`}
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1">
          <CartButton />
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full px-3 text-sm font-semibold hover:bg-paper-deep xl:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((o) => !o)}
          >
            <span aria-hidden className="relative block h-3 w-4">
              <span className={`absolute left-0 h-[2px] w-4 rounded bg-current transition-transform ${open ? "top-[5px] rotate-45" : "top-0"}`} />
              <span className={`absolute left-0 top-[5px] h-[2px] w-4 rounded bg-current transition-opacity ${open ? "opacity-0" : ""}`} />
              <span className={`absolute left-0 h-[2px] w-4 rounded bg-current transition-transform ${open ? "top-[5px] -rotate-45" : "top-[10px]"}`} />
            </span>
            <span className="sr-only xs:not-sr-only">Menu</span>
          </button>
        </div>
      </div>

      <div id="mobile-menu" hidden={!open} className="xl:hidden">
        <nav aria-label="Mobile" className="wrap h-[calc(100dvh-var(--header-h))] overflow-y-auto pb-10 pt-4">
          <ul className="divide-y divide-line border-y border-line">
            {NAV.map((n, i) => (
              <li key={n.href}>
                <Link href={n.href} className="flex items-baseline justify-between py-4 font-serif text-[1.65rem]" aria-current={active(n.href) ? "page" : undefined}>
                  {n.label}
                  <span className="t-eyebrow text-muted">0{i + 1}</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-8 grid grid-cols-2 gap-3 text-sm">
            <Link href="/help" className="card p-4 font-semibold">
              Help & downloads
            </Link>
            <Link href="/help#faq" className="card p-4 font-semibold">
              FAQs
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
