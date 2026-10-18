import Link from "next/link";
import { getProduct, resolveProducts } from "@/catalogue";
import { bundleOffers, type BundleOffer } from "@/catalogue/pricing";
import { formatMoney } from "@/lib/money";
import { AddButton } from "./buy-box";
import { Cover } from "./cover";

/** Section heading: eyebrow, serif title with an italic accent, optional lede. */
export function SectionHead({ eyebrow, title, accent, lede, id, align = "left" }: { eyebrow: string; title: string; accent?: string; lede?: string; id?: string; align?: "left" | "center" }) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="t-eyebrow text-terracotta">{eyebrow}</p>
      <h2 id={id} className="t-h2 mt-3 text-balance">
        {title} {accent ? <span className="accent-italic">{accent}</span> : null}
      </h2>
      {lede ? <p className="t-lede mt-4 text-ink-soft text-pretty">{lede}</p> : null}
    </div>
  );
}

/** How buying works. Each step is what the code does (docs/QA.md). */
export function HowItWorks({ dark = false }: { dark?: boolean }) {
  const steps = [
    { n: "01", t: "Choose your guide", d: "Buy one now or fill your bag. Every page shows exactly what's inside." },
    { n: "02", t: "Secure checkout", d: "Pay on Stripe's secure hosted checkout. Got a promo code? Add it there." },
    { n: "03", t: "Your private library", d: "It opens the moment payment goes through, and the link is emailed to you too." },
    { n: "04", t: "Start exploring", d: "Download the PDF, tap the links, fill in the planners. Austin's waiting." },
  ];
  return (
    <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((s, i) => (
        <li key={s.n} data-reveal style={{ ["--reveal-delay" as string]: `${i * 80}ms` }} className={`rounded-[var(--radius-card)] p-6 ${dark ? "bg-paper/8 ring-1 ring-paper/15" : "card"}`}>
          <span className={`sticker h-12 w-12 text-sm ${dark ? "bg-sun text-forest-deep" : "bg-terracotta text-white"}`}>{s.n}</span>
          <h3 className="t-h3 mt-5">{s.t}</h3>
          <p className={`mt-2 t-small ${dark ? "text-paper/75" : "text-ink-soft"}`}>{s.d}</p>
        </li>
      ))}
    </ol>
  );
}

/**
 * "Save with Bundles": approved bundles only (see bundleOffers). Each card lists what's
 * inside, the bundle price, the guides' combined price and the saving, all from approved
 * prices. Callers render nothing when there are no offers.
 */
export function BundleGrid({ offers }: { offers: BundleOffer[] }) {
  return (
    <ul className="grid gap-5 md:grid-cols-2">
      {offers.map(({ bundle: b, price, separately, saving }) => {
        const guides = resolveProducts(b.includes);
        return (
          <li key={b.id} className="card relative flex flex-col overflow-hidden p-6 sm:p-7">
            {saving > 0 ? <span className="chip absolute right-5 top-5 bg-terracotta text-white">Save {formatMoney(saving)}</span> : null}
            <p className="t-eyebrow text-terracotta">{guides.length} guides</p>
            <h3 className="t-h3 mt-2 pr-28">{b.title}</h3>
            <p className="mt-2 t-small text-ink-soft">{b.why}</p>
            <div className="mt-6 flex items-end">
              {guides.slice(0, 7).map((g, i) => (
                <Link key={g.id} href={`/guides/${g.slug}`} className="group w-[22%] max-w-24 shrink-0" style={{ marginLeft: i ? "-6%" : 0, zIndex: 10 - i, transform: `rotate(${(i - (guides.length - 1) / 2) * 3}deg)` }}>
                  <Cover product={g} sizes="96px" />
                  <span className="sr-only">{g.title}</span>
                </Link>
              ))}
            </div>
            <p className="mt-6 t-eyebrow text-muted">What&rsquo;s included</p>
            <ul className="mt-2 space-y-1 t-small">
              {guides.map((g) => (
                <li key={g.id}>· {g.title}</li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-line pt-4">
              <p className="flex items-baseline gap-2">
                <span className="font-serif text-2xl tabular-nums">{formatMoney(price)}</span>
                {saving > 0 ? (
                  <span className="t-small text-muted">
                    <span className="sr-only">instead of </span>
                    <s className="tabular-nums">{formatMoney(separately)}</s> separately
                  </span>
                ) : null}
              </p>
              <AddButton id={b.id} label="Add bundle to bag" />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/** The "Save with Bundles" section, or nothing when no bundle is approved. */
export function SaveWithBundles({ ids, headingId = "bundles-title", className = "section-tight bg-paper-deep/60" }: { ids?: readonly string[]; headingId?: string; className?: string }) {
  const offers = bundleOffers(ids);
  if (!offers.length) return null;
  return (
    <section className={className} aria-labelledby={headingId}>
      <div className="wrap">
        <SectionHead id={headingId} eyebrow="Bundles" title="Save with" accent="Bundles" lede="Guides that work better together, in one bag and one download library." />
        <div className="mt-10">
          <BundleGrid offers={offers} />
        </div>
      </div>
    </section>
  );
}

/** A companion pairing: two covers and the reason they belong together. */
export function Pairing({ from, to, why }: { from: string; to: string; why: string }) {
  const a = getProduct(from)!;
  const b = getProduct(to)!;
  return (
    <div className="card flex h-full flex-col p-6">
      <div className="flex items-center gap-3">
        <Link href={`/guides/${a.slug}`} className="group w-20 shrink-0">
          <Cover product={a} sizes="80px" />
        </Link>
        <span aria-hidden className="font-serif text-3xl text-terracotta">+</span>
        <Link href={`/guides/${b.slug}`} className="group w-20 shrink-0">
          <Cover product={b} sizes="80px" />
        </Link>
      </div>
      <p className="mt-5 font-serif text-lg leading-snug">
        {a.shortTitle} <span className="text-terracotta">&</span> {b.shortTitle}
      </p>
      <p className="mt-2 t-small text-ink-soft">{why}</p>
    </div>
  );
}
