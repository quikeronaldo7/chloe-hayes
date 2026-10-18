import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { bundlesContaining, collectionOf, getProduct, getProductBySlug, products } from "@/catalogue";
import { approvedPriceBook, priceOf } from "@/catalogue/pricing";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BuyBox } from "@/components/buy-box";
import { Cover } from "@/components/cover";
import { FaqList } from "@/components/faq";
import { JsonLd } from "@/components/json-ld";
import { ProductCard } from "@/components/product-card";
import { BundleGrid, SectionHead } from "@/components/sections";
import { TrackOnMount } from "@/components/track";
import { absoluteUrl, siteConfig } from "@/lib/config";
import { showProposals } from "@/lib/server/pricing";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/guides/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = getProductBySlug(slug);
  if (!p) return {};
  const image = p.cover.image ?? p.hero ?? p.cover.photo;
  return {
    title: p.seo.title,
    description: p.seo.description,
    alternates: { canonical: `/guides/${p.slug}` },
    openGraph: { title: p.title, description: p.seo.description, type: "website", images: image ? [{ url: image.src, alt: image.alt }] : undefined },
  };
}

const accents = {
  terracotta: { band: "bg-blush/70", text: "text-terracotta-deep" },
  forest: { band: "bg-sage/80", text: "text-forest" },
  plum: { band: "bg-[#f1dde3]", text: "text-plum" },
  sky: { band: "bg-sky/80", text: "text-forest" },
  gold: { band: "bg-sand/80", text: "text-terracotta-deep" },
} as const;

export default async function GuidePage({ params }: PageProps<"/guides/[slug]">) {
  const { slug } = await params;
  const p = getProductBySlug(slug);
  if (!p) notFound();
  const col = collectionOf(p);
  const a = accents[p.accent];
  const related = p.related.map((r) => ({ ...r, product: getProduct(r.id)! }));
  const inBundles = showProposals() ? bundlesContaining(p.id) : [];
  const approvedPrice = priceOf(approvedPriceBook(), p.id);

  return (
    <>
      <TrackOnMount event="product_viewed" props={{ product_id: p.id }} />

      {/* ------------------------------------------------------------ HERO */}
      <section className={`${a.band}`}>
        <div className="wrap pt-6">
          <Breadcrumbs
            items={[
              { label: "Shop", href: "/shop" },
              { label: col.name, href: `/collections/${col.slug}` },
              { label: p.shortTitle, href: `/guides/${p.slug}` },
            ]}
          />
        </div>
        <div className="wrap grid items-start gap-10 pb-14 pt-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16 lg:pb-20">
          <div className="mx-auto w-full max-w-[22rem] lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:max-w-[26rem]">
            <Cover product={p} priority sizes="(min-width: 1024px) 26rem, 80vw" />
            <p className="mt-4 text-center t-small text-muted">
              {p.cover.kind === "typeset" ? "Cover shown as a website rendering in the guide's style." : p.cover.kind === "pdf" ? "The actual cover, page 1 of the guide." : "The approved cover artwork."}
            </p>
          </div>
          <div>
            <p className={`t-eyebrow ${a.text}`}>
              {col.name} · {p.specs.edition}
            </p>
            <h1 className="t-h1 mt-3 text-balance">{p.title}</h1>
            <p className="t-lede mt-5 text-ink-soft text-pretty">{p.lede}</p>
            <ul className="mt-6 flex flex-wrap gap-2" aria-label="At a glance">
              {p.chips.map((c) => (
                <li key={c} className="chip bg-card ring-1 ring-line">
                  {c}
                </li>
              ))}
              {p.specs.checked ? <li className="chip bg-card ring-1 ring-line">{p.specs.checked}</li> : null}
            </ul>
            <div className="mt-8">
              <BuyBox id={p.id} />
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- PROMISE / FOR */}
      <section className="section-tight">
        <div className="wrap grid gap-10 lg:grid-cols-3 lg:gap-12">
          <div className="lg:col-span-1">
            <p className="t-eyebrow text-terracotta">What it helps you do</p>
            <p className="mt-3 font-serif text-[1.65rem] leading-snug text-balance" style={{ fontVariationSettings: '"SOFT" 100' }}>
              {p.promise}
            </p>
          </div>
          <div className="card p-6">
            <h2 className="t-eyebrow text-forest">Made for</h2>
            <ul className="mt-4 space-y-3">
              {p.bestFor.map((b) => (
                <li key={b} className="flex gap-3">
                  <span aria-hidden className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-forest text-[0.65rem] text-paper">✓</span>
                  {b}
                </li>
              ))}
            </ul>
          </div>
          <div className="card p-6">
            <h2 className="t-eyebrow text-terracotta-deep">What it isn&rsquo;t</h2>
            <ul className="mt-4 space-y-3 text-ink-soft">
              {p.notFor.map((b) => (
                <li key={b} className="flex gap-3">
                  <span aria-hidden className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-paper-deep text-[0.7rem]">–</span>
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- INSIDE */}
      <section className="section-tight" aria-labelledby="inside-title">
        <div className="wrap grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <div>
            <SectionHead id="inside-title" eyebrow="What's inside" title="Everything in" accent="the guide" />
            <ol className="mt-8 divide-y divide-line border-y border-line">
              {p.contents.map((c, i) => (
                <li key={c.title} className="grid grid-cols-[2.5rem_1fr] gap-3 py-4">
                  <span className="font-serif text-xl text-terracotta">{String(i + 1).padStart(2, "0")}</span>
                  <span>
                    <span className="block font-semibold">{c.title}</span>
                    {c.detail ? <span className="mt-0.5 block t-small text-ink-soft">{c.detail}</span> : null}
                  </span>
                </li>
              ))}
            </ol>
          </div>
          <aside className="space-y-5">
            <div className="card p-6">
              <h2 className="t-eyebrow text-forest">Edition & format</h2>
              <dl className="mt-4 divide-y divide-line text-[0.95rem]">
                {[
                  ["Pages", String(p.specs.pages)],
                  ["Edition", p.specs.edition],
                  ...(p.specs.checked ? [["Checked", p.specs.checked.replace(/^(Research |Details )?checked /i, "")]] : []),
                  ["Format", p.specs.format],
                  ["Delivery", "Instant download from your private library"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-6 py-2.5">
                    <dt className="text-muted">{k}</dt>
                    <dd className="text-right font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="card p-6">
              <h2 className="t-eyebrow text-forest">Interactive features</h2>
              <ul className="mt-4 space-y-2.5 text-[0.95rem]">
                {p.specs.interactive.map((x) => (
                  <li key={x} className="flex gap-3">
                    <span aria-hidden className="text-terracotta">✦</span>
                    {x}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>

      {/* ---------------------------------------------------------- PREVIEWS */}
      {p.previews?.length ? (
        <section className="section-tight" aria-labelledby="preview-title">
          <div className="wrap">
            <SectionHead id="preview-title" eyebrow="A look inside" title="Sample" accent="pages" lede="A few pages so you know what you're getting. The full guide is delivered after purchase." />
            <ul className={`mt-8 grid gap-5 ${p.previews.some((x) => x.ratio > 2) ? "" : "sm:grid-cols-2 lg:max-w-4xl"}`}>
              {p.previews.map((x) => (
                <li key={x.image.src}>
                  <figure>
                    <div className="overflow-hidden rounded-xl bg-paper-deep ring-1 ring-line">
                      <Image src={x.image.src} alt={x.image.alt} width={1100} height={Math.round(1100 / x.ratio)} sizes={x.ratio > 2 ? "100vw" : "(min-width: 640px) 28rem, 100vw"} className="h-auto w-full" />
                    </div>
                    <figcaption className="mt-2 t-small text-muted">{x.caption}</figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* ---------------------------------------------------------- CAVEATS */}
      <section className="section-tight">
        <div className="wrap">
          <div className="grid gap-6 rounded-[var(--radius-card)] border-2 border-dashed border-line-strong p-6 sm:p-8 lg:grid-cols-[14rem_1fr]">
            <div>
              <p className="t-eyebrow text-terracotta-deep">Good to know</p>
              <p className="mt-2 font-serif text-xl leading-snug">Austin moves fast. The guide is honest about it.</p>
            </div>
            <ul className="space-y-2.5 text-ink-soft">
              {p.caveats.map((c) => (
                <li key={c} className="flex gap-3">
                  <span aria-hidden className="text-terracotta">•</span>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- BUNDLES */}
      {inBundles.length ? (
        <section className="section-tight bg-paper-deep/60" aria-labelledby="bundle-title">
          <div className="wrap">
            <SectionHead id="bundle-title" eyebrow="Bundles · internal preview" title="Also in" accent="these proposals" lede="Preview only: not on sale and not priced until approved." />
            <div className="mt-8">
              <BundleGrid items={inBundles} />
            </div>
          </div>
        </section>
      ) : null}

      {/* ---------------------------------------------------------- RELATED */}
      <section className="section-tight" aria-labelledby="related-title">
        <div className="wrap">
          <SectionHead id="related-title" eyebrow="Pairs well with" title="If you like this," accent="you might want" />
          <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <li key={r.id} className="grid grid-cols-[42%_1fr] gap-5 sm:grid-cols-1">
                <ProductCard product={r.product} compact />
                <p className="self-center t-small text-ink-soft sm:self-auto">
                  <span className="font-semibold text-ink">Why: </span>
                  {r.why}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------------------------------------------------------- FAQ */}
      <section className="section-tight pb-24" aria-labelledby="pfaq-title">
        <div className="wrap grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <SectionHead id="pfaq-title" eyebrow="Questions" title="About this" accent="guide" />
            <p className="mt-5 text-ink-soft">
              Delivery, devices and lost downloads are covered on the{" "}
              <Link href="/help" className="link-arrow">
                Help page
              </Link>
              .
            </p>
          </div>
          <FaqList items={p.faqs} schema />
        </div>
      </section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: p.title,
          description: p.seo.description,
          sku: p.id,
          category: "Digital travel guide (PDF)",
          brand: { "@type": "Brand", name: siteConfig.name },
          image: absoluteUrl((p.cover.image ?? p.hero ?? p.cover.photo)?.src ?? "/icon.svg"),
          url: absoluteUrl(`/guides/${p.slug}`),
          // Offers only once a price is approved: never a placeholder price in structured data.
          ...(approvedPrice !== null
            ? { offers: { "@type": "Offer", price: (approvedPrice / 100).toFixed(2), priceCurrency: "USD", availability: "https://schema.org/InStock", url: absoluteUrl(`/guides/${p.slug}`) } }
            : {}),
        }}
      />
    </>
  );
}
