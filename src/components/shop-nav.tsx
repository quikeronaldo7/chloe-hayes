import Link from "next/link";
import { collections } from "@/catalogue";

/** Collection filter pills: real links, so every view has its own shareable URL. */
export function ShopNav({ current }: { current?: string }) {
  const items = [{ href: "/shop", label: "All guides", key: "all", count: 7 }, ...collections.map((c) => ({ href: `/collections/${c.slug}`, label: c.name, key: c.slug, count: c.products.length }))];
  return (
    <nav aria-label="Browse by collection" className="rail -mx-[var(--gutter)] overflow-x-auto px-[var(--gutter)]">
      <ul className="flex w-max gap-2">
        {items.map((i) => {
          const on = (current ?? "all") === i.key;
          return (
            <li key={i.key}>
              <Link
                href={i.href}
                aria-current={on ? "page" : undefined}
                className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors ${on ? "bg-ink text-paper" : "bg-card ring-1 ring-line hover:bg-paper-deep"}`}
              >
                {i.label}
                <span className={`text-xs tabular-nums ${on ? "text-paper/70" : "text-muted"}`}>{i.count}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
