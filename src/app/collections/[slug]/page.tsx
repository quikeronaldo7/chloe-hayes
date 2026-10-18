import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { collections, getCollection, getProduct, productsIn } from "@/catalogue";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { ProductCard } from "@/components/product-card";
import { ShopNav } from "@/components/shop-nav";
import { absoluteUrl } from "@/lib/config";

export function generateStaticParams() {
  return collections.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/collections/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const c = getCollection(slug);
  if (!c) return {};
  return { title: `${c.name} guides`, description: c.intro, alternates: { canonical: `/collections/${c.slug}` } };
}

/** What to look at next, from each collection: the other collections, one guide each. */
const elsewhere: Record<string, string[]> = {
  "start-here": ["cia-being-single", "cia-dinner-spots", "cia-hill-country"],
  "eat-and-drink": ["cia-date-ideas", "cia-exclusive", "cia-new-to-austin"],
  "date-and-connect": ["cia-dinner-spots", "cia-new-to-austin", "cia-exclusive"],
  "explore-and-escape": ["cia-new-to-austin", "cia-dinner-spots", "cia-date-ideas"],
};

export default async function CollectionPage({ params }: PageProps<"/collections/[slug]">) {
  const { slug } = await params;
  const c = getCollection(slug);
  if (!c) notFound();
  const items = productsIn(c.slug);
  const more = (elsewhere[c.slug] ?? []).map((id) => getProduct(id)!);

  return (
    <>
      <section className="wrap pb-6 pt-8">
        <Breadcrumbs items={[{ label: "Shop", href: "/shop" }, { label: c.name, href: `/collections/${c.slug}` }]} />
        <p className="t-eyebrow mt-8 text-terracotta">{c.eyebrow}</p>
        <h1 className="t-h1 mt-3 max-w-3xl text-balance">{c.name}</h1>
        <p className="t-lede mt-4 max-w-2xl text-ink-soft">{c.intro}</p>
        <div className="mt-8">
          <ShopNav current={c.slug} />
        </div>
      </section>
      <section className="section-tight" aria-labelledby="guides-title">
        <h2 id="guides-title" className="sr-only">Guides in {c.name}</h2>
        <ul className="wrap grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((p, i) => (
            <li key={p.id}>
              <ProductCard product={p} priority={i === 0} />
            </li>
          ))}
        </ul>
      </section>
      <section className="section-tight bg-paper-deep/50">
        <div className="wrap">
          <h2 className="t-eyebrow text-terracotta">Elsewhere in the collection</h2>
          <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
            {more.map((p) => (
              <li key={p.id}>
                <ProductCard product={p} compact />
              </li>
            ))}
            <li className="flex">
              <Link href="/shop" className="card flex w-full flex-col justify-center p-6 font-serif text-xl">
                See all seven guides <span aria-hidden className="mt-2 text-terracotta">→</span>
              </Link>
            </li>
          </ul>
        </div>
      </section>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `${c.name}: Chloe in Austin`,
          url: absoluteUrl(`/collections/${c.slug}`),
          hasPart: items.map((p) => ({ "@type": "Product", name: p.title, url: absoluteUrl(`/guides/${p.slug}`) })),
        }}
      />
    </>
  );
}
