import Link from "next/link";
import { resolveProducts } from "@/catalogue";
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
 * "Curated Guide Bundles": approved bundles only (see bundleOffers). Each card lists
 * what's inside and the bundle price. A saving (with the guides' combined price) is shown
 * only when the bundle really costs less; otherwise it says it's the same price.
 * Callers render nothing when there are no offers.
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
            <div className="mt-auto pt-5">
              <dl className="grid grid-cols-3 gap-3 border-t border-line pt-4 text-center">
                <div>
                  <dt className="t-eyebrow text-muted">Guides separately</dt>
                  <dd className="mt-1 font-serif text-lg tabular-nums text-ink-soft">{formatMoney(separately)}</dd>
                </div>
                <div>
                  <dt className="t-eyebrow text-terracotta">Bundle price</dt>
                  <dd className="mt-1 font-serif text-2xl tabular-nums">{formatMoney(price)}</dd>
                </div>
                <div>
                  <dt className="t-eyebrow text-muted">You save</dt>
                  <dd className={`mt-1 tabular-nums ${saving > 0 ? "font-serif text-lg text-terracotta-deep" : "pt-1 t-small text-muted"}`}>
                    {saving > 0 ? formatMoney(saving) : "Same price, one checkout"}
                  </dd>
                </div>
              </dl>
              <div className="mt-4 flex justify-center">
                <AddButton id={b.id} label="Add bundle to bag" />
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/** The "Curated Guide Bundles" section, or nothing when no bundle is approved. */
export function SaveWithBundles({ ids, headingId = "bundles-title", className = "section-tight bg-paper-deep/60" }: { ids?: readonly string[]; headingId?: string; className?: string }) {
  const offers = bundleOffers(ids);
  if (!offers.length) return null;
  return (
    <section className={className} aria-labelledby={headingId}>
      <div className="wrap">
        <SectionHead id={headingId} eyebrow="Bundles" title="Curated" accent="Guide Bundles" lede="Guides that work better together, in one bag and one download library." />
        <div className="mt-10">
          <BundleGrid offers={offers} />
        </div>
      </div>
    </section>
  );
}
