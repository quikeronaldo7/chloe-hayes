import type { Metadata } from "next";
import Link from "next/link";
import { collections, productsIn } from "@/catalogue";
import { JsonLd } from "@/components/json-ld";
import { ProductCard } from "@/components/product-card";
import { BundleGrid, SectionHead } from "@/components/sections";
import { ShopNav } from "@/components/shop-nav";
import { absoluteUrl } from "@/lib/config";
import { showProposals } from "@/lib/server/pricing";

export const metadata: Metadata = {
  title: "Shop all guides",
  description: "All seven Chloe in Austin guides: New to Austin, 10 Best Dinner Spots, Being Single, 12 Best Date Ideas, 5 Natural Gems, Hill Country Escapes and 10 Most Exclusive Experiences.",
  alternates: { canonical: "/shop" },
};

export default function ShopPage() {
  return (
    <>
      <section className="wrap pb-8 pt-10 sm:pt-14">
        <p className="t-eyebrow text-terracotta">Shop all</p>
        <h1 className="t-h1 mt-3 max-w-3xl text-balance">
          Every guide, <span className="accent-italic">all in one place.</span>
        </h1>
        <p className="t-lede mt-4 max-w-2xl text-ink-soft">Seven guides to eating, exploring, dating and settling into Austin. Start anywhere: they work on their own and even better together.</p>
        <div className="mt-8">
          <ShopNav />
        </div>
      </section>

      {collections.map((c, ci) => (
        <section key={c.slug} className={`section-tight ${ci % 2 ? "bg-paper-deep/50" : ""}`} aria-labelledby={`c-${c.slug}`}>
          <div className="wrap">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionHead id={`c-${c.slug}`} eyebrow={c.eyebrow} title={c.name} lede={c.intro} />
              <Link href={`/collections/${c.slug}`} className="link-arrow t-small">
                View {c.name} <span aria-hidden>→</span>
              </Link>
            </div>
            <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 lg:grid-cols-4">
              {productsIn(c.slug).map((p, i) => (
                <li key={p.id}>
                  <ProductCard product={p} priority={ci === 0 && i === 0} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ))}

      {showProposals() ? (
        <section className="section-tight" aria-labelledby="shop-bundles">
          <div className="wrap">
            <SectionHead id="shop-bundles" eyebrow="Bundles · internal preview" title="Bundle" accent="proposals" lede="Preview only: not on sale and not priced until the owner approves them." />
            <div className="mt-8">
              <BundleGrid />
            </div>
          </div>
        </section>
      ) : null}

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Chloe in Austin: all guides",
          url: absoluteUrl("/shop"),
          hasPart: collections.flatMap((c) => productsIn(c.slug)).map((p) => ({ "@type": "Product", name: p.title, url: absoluteUrl(`/guides/${p.slug}`) })),
        }}
      />
    </>
  );
}
