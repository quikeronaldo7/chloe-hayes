import Link from "next/link";
import { collectionOf, type Product } from "@/catalogue";
import { PriceTag } from "./buy-box";
import { Cover } from "./cover";

/** The catalogue card: real (or typeset) cover, exact title, an honest line, verified chips. */
export function ProductCard({ product, priority = false, compact = false }: { product: Product; priority?: boolean; compact?: boolean }) {
  const col = collectionOf(product);
  return (
    <article className="group relative flex h-full flex-col">
      <Link href={`/guides/${product.slug}`} className="block rounded-[var(--radius-card)] bg-paper-deep/70 p-[9%] pb-[7%] transition-colors group-hover:bg-sand/70">
        <Cover product={product} priority={priority} />
      </Link>
      <div className="mt-4 flex flex-1 flex-col">
        <p className="t-eyebrow text-terracotta">{col.name}</p>
        <h3 className={`mt-1.5 font-serif leading-snug ${compact ? "text-lg" : "text-[1.3rem]"}`}>
          <Link href={`/guides/${product.slug}`} className="after:absolute after:inset-0 hover:underline hover:decoration-1 hover:underline-offset-4">
            {product.title}
          </Link>
        </h3>
        {!compact ? <p className="mt-2 t-small text-ink-soft text-pretty">{product.summary}</p> : null}
        <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="What's inside">
          {product.chips.map((c) => (
            <li key={c} className="chip">
              {c}
            </li>
          ))}
        </ul>
        <div className="mt-auto pt-4">
          <PriceTag id={product.id} />
        </div>
      </div>
    </article>
  );
}
