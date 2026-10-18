import Image from "next/image";
import Link from "next/link";
import { getProduct, products, shopOrder, resolveProducts } from "@/catalogue";
import { Cactus, Cover } from "@/components/cover";
import { FaqList } from "@/components/faq";
import { ProductCard } from "@/components/product-card";
import { BundleGrid, HowItWorks, Pairing, SectionHead } from "@/components/sections";
import { storeFaqs } from "@/lib/faqs";
import { showProposals } from "@/lib/server/pricing";

const must = (id: string) => getProduct(id)!;

/** "Find your Austin": six ways in, each to one meaningful guide or collection. */
const doors = [
  { label: "I'm new to Austin", line: "Neighborhoods, costs, week one and your first 90 days.", href: "/guides/new-to-austin", guide: "cia-new-to-austin", tone: "bg-forest text-paper", sub: "text-paper/75" },
  { label: "I want amazing food", line: "Ten dinners worth planning a whole night around.", href: "/guides/10-best-dinner-spots", guide: "cia-dinner-spots", tone: "bg-terracotta text-paper", sub: "text-paper/80" },
  { label: "I need a great date", line: "Twelve dates with an actual plan attached.", href: "/guides/12-best-date-ideas", guide: "cia-date-ideas", tone: "bg-blush text-ink", sub: "text-ink-soft" },
  { label: "I want to meet people", line: "Run clubs, two-step, dinners with strangers: IRL.", href: "/guides/guide-to-being-single", guide: "cia-being-single", tone: "bg-sage text-forest-deep", sub: "text-forest/80" },
  { label: "I want to explore", line: "Swimming holes and Hill Country days out.", href: "/collections/explore-and-escape", guide: "cia-hill-country", tone: "bg-sky text-ink", sub: "text-ink-soft" },
  { label: "I want something special", line: "Private clubs, tiny counters, hidden doors.", href: "/guides/10-most-exclusive-experiences", guide: "cia-exclusive", tone: "bg-night text-paper", sub: "text-paper/70" },
];

const topics = ["Dinner reservations", "Swimming holes", "Two-step", "Hill Country", "Date nights", "Neighborhoods", "Hidden bars", "Run clubs", "Omakase drops", "River floats"];

export default function Home() {
  const flagship = must("cia-new-to-austin");
  const all = resolveProducts(shopOrder);
  const proposals = showProposals();

  return (
    <>
      {/* ---------------------------------------------------------------- HERO */}
      <section className="relative overflow-hidden">
        <div className="wrap grid items-center gap-10 pb-14 pt-8 sm:pt-12 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16 lg:pb-20 lg:pt-16">
          <div className="order-2 lg:order-1">
            <p className="inline-flex items-center gap-2 rounded-full bg-card px-3 py-1.5 text-[0.8rem] font-semibold text-forest ring-1 ring-line">
              <svg aria-hidden viewBox="0 0 120 120" className="h-4 w-4 text-forest">
                <Cactus />
              </svg>
              Austin guides by Chloe Hayes
            </p>
            <h1 className="t-display mt-6 text-balance">
              Good food. Great plans. <span className="accent-italic">Your Austin, sorted.</span>
            </h1>
            <p className="t-lede mt-6 max-w-xl text-ink-soft text-pretty">
              Curated guides to eating, exploring, dating and finding your people in Austin. Researched, checked and dated, so you spend less time
              with forty tabs open and more time out there.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/shop" className="btn">
                Explore the guides
              </Link>
              <Link href="/about" className="btn btn-outline">
                Meet Chloe
              </Link>
            </div>
            <p className="mt-8 t-small text-muted">7 guides · instant PDF download · clickable links & fill-in planners</p>
          </div>

          <div className="relative order-1 mx-auto w-full max-w-[30rem] lg:order-2">
            <div className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-b-[2rem] bg-sand">
              <Image
                src="/images/chloe/chloe-bbq-table.jpg"
                alt="Chloe at a crowded table, holding up a slice of brisket from a tray of barbecue"
                fill
                priority
                sizes="(min-width: 1024px) 30rem, 90vw"
                className="object-cover"
                style={{ objectPosition: "50% 35%" }}
              />
            </div>
            <span className="sticker absolute -left-3 top-[12%] h-24 w-24 bg-sun text-[0.68rem] text-forest-deep shadow-lg sm:-left-8 sm:h-28 sm:w-28">
              Food
              <br />
              first,
              <br />
              always
            </span>
            <div className="absolute -bottom-6 -right-2 w-[34%] rotate-[6deg] sm:-right-6">
              <Cover product={must("cia-hill-country")} sizes="160px" priority />
            </div>
            <div className="absolute -bottom-3 right-[26%] w-[30%] -rotate-[5deg]">
              <Cover product={must("cia-dinner-spots")} sizes="140px" />
            </div>
          </div>
        </div>

        <div className="overflow-hidden border-y border-line bg-card py-3" aria-hidden>
          <div className="marquee flex w-max gap-8 whitespace-nowrap font-serif text-lg italic text-forest" style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1' }}>
            {[...topics, ...topics].map((t, i) => (
              <span key={i} className="flex items-center gap-8">
                {t}
                <span className="text-terracotta not-italic">✦</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ FIND YOUR AUSTIN */}
      <section className="section" aria-labelledby="find-title">
        <div className="wrap">
          <SectionHead id="find-title" eyebrow="Where do you want to start?" title="Find your" accent="Austin" lede="Pick the sentence that sounds most like you. Each one goes straight to the right guide." />
          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {doors.map((d, i) => {
              const g = must(d.guide);
              return (
                <li key={d.label} data-reveal style={{ ["--reveal-delay" as string]: `${i * 60}ms` }}>
                  <Link href={d.href} className={`group grain relative flex h-full min-h-44 items-end justify-between gap-4 overflow-hidden rounded-[var(--radius-card)] p-6 ${d.tone}`}>
                    <span className="relative z-10 max-w-[62%]">
                      <span className="block font-serif text-[1.55rem] leading-tight" style={{ fontVariationSettings: '"SOFT" 100' }}>
                        {d.label}
                      </span>
                      <span className={`mt-2 block t-small ${d.sub}`}>{d.line}</span>
                      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold">
                        {g.shortTitle} <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
                      </span>
                    </span>
                    <span className="w-[30%] max-w-28 shrink-0 rotate-[5deg] transition-transform duration-500 group-hover:rotate-0">
                      <Cover product={g} sizes="112px" />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ---------------------------------------------------- FEATURED: FLAGSHIP */}
      <section className="grain bg-forest text-paper" aria-labelledby="flagship-title">
        <div className="wrap section grid items-center gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div className="mx-auto w-full max-w-sm" data-reveal>
            <div className="relative">
              <Cover product={flagship} sizes="(min-width: 1024px) 24rem, 80vw" />
              <span className="sticker absolute -bottom-6 -left-5 h-24 w-24 bg-sun text-[0.7rem] text-forest-deep shadow-lg">
                The
                <br />
                flagship
              </span>
            </div>
          </div>
          <div>
            <p className="t-eyebrow text-sun">Start here · 2026–27 edition</p>
            <h2 id="flagship-title" className="t-h1 mt-3 text-balance">
              New to Austin? <span className="italic text-sun" style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1' }}>This is your guide.</span>
            </h2>
            <p className="t-lede mt-5 max-w-xl text-paper/85 text-pretty">{flagship.lede}</p>
            <dl className="mt-8 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ["51", "pages"],
                ["12", "chapters"],
                ["2", "original maps"],
                ["284", "fillable fields"],
              ].map(([n, l]) => (
                <div key={l} className="rounded-2xl bg-paper/8 p-4 ring-1 ring-paper/15">
                  <dt className="sr-only">{l}</dt>
                  <dd>
                    <span className="block font-serif text-3xl text-sun">{n}</span>
                    <span className="text-sm text-paper/75">{l}</span>
                  </dd>
                </div>
              ))}
            </dl>
            <ul className="mt-8 grid max-w-xl gap-x-6 gap-y-2 text-[0.95rem] text-paper/85 sm:grid-cols-2">
              {flagship.contents.slice(0, 8).map((c, i) => (
                <li key={c.title} className="flex gap-3">
                  <span className="t-eyebrow mt-1 w-6 shrink-0 text-sun">{String(i + 1).padStart(2, "0")}</span>
                  {c.title}
                </li>
              ))}
              <li className="flex gap-3 text-paper/60">
                <span className="t-eyebrow mt-1 w-6 shrink-0">+4</span>
                more chapters, worksheets and a 90-day plan
              </li>
            </ul>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link href="/guides/new-to-austin" className="btn btn-light">
                See inside New to Austin
              </Link>
            </div>
          </div>
        </div>
        {flagship.previews?.[0] ? (
          <div className="overflow-hidden pb-14">
            <div className="wrap">
              <p className="t-eyebrow mb-3 text-paper/60">Pages 2–13 at a glance</p>
              <div className="relative overflow-hidden rounded-xl ring-1 ring-paper/15">
                <Image src={flagship.previews[0].image.src} alt={flagship.previews[0].image.alt} width={2603} height={293} sizes="100vw" className="h-auto w-full" />
              </div>
            </div>
          </div>
        ) : null}
      </section>

      {/* ------------------------------------------------- EXPLORE THE COLLECTION */}
      <section className="section" aria-labelledby="collection-title">
        <div className="wrap">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHead id="collection-title" eyebrow="The collection" title="Seven guides," accent="one very good city" lede="Food first, and everything fun about Austin after that." />
            <Link href="/shop" className="link-arrow">
              Shop all guides <span aria-hidden>→</span>
            </Link>
          </div>
          <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 lg:grid-cols-4">
            {all.map((p, i) => (
              <li key={p.id} data-reveal style={{ ["--reveal-delay" as string]: `${(i % 4) * 70}ms` }}>
                <ProductCard product={p} />
              </li>
            ))}
            <li className="flex">
              <Link href="/shop" className="group grain flex w-full flex-col gap-4 rounded-[var(--radius-card)] bg-terracotta p-6 text-paper">
                <span className="font-serif text-2xl leading-tight" style={{ fontVariationSettings: '"SOFT" 100' }}>
                  Not sure which one?
                </span>
                <span className="t-small text-paper/85">Browse by what you&rsquo;re in the mood for: eat, date, explore or settle in.</span>
                <span className="mt-auto inline-flex items-center gap-1 font-semibold">
                  Browse the shop <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
                </span>
              </Link>
            </li>
          </ul>
        </div>
      </section>

      {/* ------------------------------------------------------------ MEET CHLOE */}
      <section className="section-tight" aria-labelledby="meet-title">
        <div className="wrap grid items-center gap-10 rounded-[2rem] bg-blush/60 p-6 sm:p-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:p-14">
          <div className="relative mx-auto w-full max-w-md">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem]">
              <Image src="/images/chloe/chloe-portrait-warm.jpg" alt="Chloe smiling on a patio in warm evening light" fill sizes="(min-width: 1024px) 28rem, 90vw" className="object-cover" style={{ objectPosition: "50% 25%" }} />
            </div>
            <span className="absolute -bottom-5 -right-3 grid h-20 w-20 place-items-center rounded-full bg-forest font-serif text-2xl italic text-paper shadow-lg" aria-hidden style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1' }}>
              ch
            </span>
          </div>
          <div>
            <p className="t-eyebrow text-terracotta">Meet Chloe</p>
            <h2 id="meet-title" className="t-h2 mt-3 text-balance">
              Hi, I&rsquo;m Chloe. <span className="accent-italic">I&rsquo;m here for the food.</span>
            </h2>
            <div className="mt-5 max-w-xl space-y-4 text-[1.06rem] text-ink-soft">
              <p>
                I&rsquo;m 27, Canadian, and new to Austin, which means I&rsquo;m learning this city the best way I know: through what&rsquo;s on the
                plate, who made it, and why people will happily stand in line for it.
              </p>
              <p>
                These guides are what happens when that curiosity gets organized. Dinners worth planning a night around, the clubs and classes that are
                actually running, swimming holes worth the drive. Researched, checked, dated and linked to the official source, so your plans hold up.
              </p>
              <p className="font-serif text-xl italic text-forest" style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1' }}>
                Tell me what I&rsquo;m missing in Austin.
              </p>
            </div>
            <Link href="/about" className="link-arrow mt-7">
              More about Chloe <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- COMPANION GUIDES */}
      <section className="section" aria-labelledby="pairs-title">
        <div className="wrap">
          <SectionHead id="pairs-title" eyebrow="Better together" title="Guides that" accent="go together" lede="Not a must-buy-everything situation. Just the pairings that genuinely help each other." />
          <ul className="mt-10 grid gap-4 md:grid-cols-3">
            <li>
              <Pairing from="cia-dinner-spots" to="cia-date-ideas" why="Dinner sorted, plus twelve ideas for before, after, or the nights you don't want a tasting menu." />
            </li>
            <li>
              <Pairing from="cia-natural-gems" to="cia-hill-country" why="Both visit Wimberley and Dripping Springs: turn a swim stop into a whole day with lunch and a tasting." />
            </li>
            <li>
              <Pairing from="cia-new-to-austin" to="cia-being-single" why="The move and the first 90 days, then the full, checked list of where to meet people IRL." />
            </li>
          </ul>
        </div>
      </section>

      {/* ---------------------------------------------------- BUNDLES (preview) */}
      {proposals ? (
        <section className="section-tight bg-paper-deep/60" aria-labelledby="bundles-title">
          <div className="wrap">
            <SectionHead
              id="bundles-title"
              eyebrow="Bundles · internal preview"
              title="Bundle"
              accent="proposals"
              lede="Visible on the private preview only. Contents, names and prices need approval before any bundle goes on sale; none advertises a saving."
            />
            <div className="mt-10">
              <BundleGrid />
            </div>
          </div>
        </section>
      ) : null}

      {/* ----------------------------------------------------------- HOW IT WORKS */}
      <section className="section grain bg-forest-deep text-paper" aria-labelledby="how-title">
        <div className="wrap">
          <p className="t-eyebrow text-sun">How it works</p>
          <h2 id="how-title" className="t-h2 mt-3 max-w-2xl text-balance">
            From checkout to <span className="italic text-sun" style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1' }}>out the door</span> in minutes.
          </h2>
          <div className="mt-10">
            <HowItWorks dark />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ FAQS */}
      <section className="section" aria-labelledby="faq-title">
        <div className="wrap grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <SectionHead id="faq-title" eyebrow="Good questions" title="Before you" accent="buy" />
            <p className="mt-5 max-w-sm text-ink-soft">
              Anything else? The <Link href="/help" className="link-arrow">Help page</Link> has delivery details and a lost-download form.
            </p>
            <div className="mt-8 hidden w-40 lg:block">
              <BuyBoxHint />
            </div>
          </div>
          <FaqList items={storeFaqs} schema />
        </div>
      </section>
    </>
  );
}

/** A tiny decorative stack of three covers beside the FAQs. */
function BuyBoxHint() {
  const three = products.slice(0, 3);
  return (
    <div className="relative h-52">
      {three.map((p, i) => (
        <div key={p.id} className="absolute w-28" style={{ left: `${i * 22}%`, top: `${i * 8}%`, transform: `rotate(${(i - 1) * 7}deg)` }}>
          <Cover product={p} sizes="112px" />
        </div>
      ))}
    </div>
  );
}
