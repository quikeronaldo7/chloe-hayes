import Link from "next/link";
import { collectionOf, type Product } from "@/catalogue";
import { CardPrice } from "./buy-box";
import { Cover } from "./cover";

/**
 * The catalogue card: cover, category and title, description, chips, then the price row
 * straight after the details. In a `.card-grid` list the card's five parts share the row's
 * subgrid tracks, so every price row in a grid row lines up without floating to the bottom.
 */
export function ProductCard({ product, priority = false, compact = false }: { product: Product; priority?: boolean; compact?: boolean }) {
  const col = collectionOf(product);
  return (
    <article className="product-card group relative flex h-full flex-col">
      <Link href={`/guides/${product.slug}`} className="block rounded-[var(--radius-card)] bg-paper-deep/70 p-[9%] pb-[7%] transition-colors group-hover:bg-sand/70">
        <Cover product={product} priority={priority} />
      </Link>
      <div className="mt-4">
        <p className="t-eyebrow text-terracotta">{col.name}</p>
        <h3 className={`mt-1.5 font-serif leading-snug ${compact ? "text-lg" : "text-[1.3rem]"}`}>
          <Link href={`/guides/${product.slug}`} className="after:absolute after:inset-0 hover:underline hover:decoration-1 hover:underline-offset-4">
            {product.title}
          </Link>
        </h3>
      </div>
      {compact ? <div aria-hidden /> : <p className="mt-2 t-small text-ink-soft text-pretty">{product.summary}</p>}
      <ul className="mt-3 flex flex-wrap content-start gap-1.5" aria-label="What's inside">
        {product.chips.map((c) => (
          <li key={c} className="chip">
            {c}
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-t border-line/70 pt-3">
        <CardPrice id={product.id} />
        <span aria-hidden className="t-small font-semibold text-terracotta-deep transition-transform group-hover:translate-x-0.5">
          View guide →
        </span>
      </div>
    </article>
  );
}
