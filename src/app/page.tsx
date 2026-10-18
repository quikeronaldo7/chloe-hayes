import Image from "next/image";
import Link from "next/link";
import { getProduct, products, shopOrder, resolveProducts } from "@/catalogue";
import { approvedPriceBook, priceOf } from "@/catalogue/pricing";
import { formatMoney } from "@/lib/money";
import { Cactus, Cover } from "@/components/cover";
import { FaqList } from "@/components/faq";
import { ProductCard } from "@/components/product-card";
import { HowItWorks, Pairing, SaveWithBundles, SectionHead } from "@/components/sections";
import { storeFaqs } from "@/lib/faqs";

const must = (id: string) => getProduct(id)!;

/** Approved homepage categories (owner copy, 18 Oct 2026). Each links to its collection or guide. */
const categories = [
  { title: "Eat Well", line: "Great restaurants, unforgettable dinners, and the places actually worth making a reservation for.", href: "/collections/eat-and-drink", cta: "Eat & Drink guides", guides: ["cia-dinner-spots"], tone: "bg-terracotta text-paper", sub: "text-paper/85" },
  { title: "Date Better", line: "First dates, romantic nights, and creative experiences that go beyond another dinner and drinks.", href: "/collections/date-and-connect", cta: "Date & Connect guides", guides: ["cia-date-ideas", "cia-being-single"], tone: "bg-blush text-ink", sub: "text-ink-soft" },
  { title: "Explore More", line: "Natural swimming holes, Hill Country escapes, and beautiful places just outside the city.", href: "/collections/explore-and-escape", cta: "Explore & Escape guides", guides: ["cia-natural-gems", "cia-hill-country"], tone: "bg-sage text-forest-deep", sub: "text-forest" },
  { title: "Find the Good Stuff", line: "Hidden gems, exclusive experiences, and memorable spots you might otherwise miss.", href: "/guides/10-most-exclusive-experiences", cta: "10 Most Exclusive Experiences", guides: ["cia-exclusive"], tone: "bg-night text-paper", sub: "text-paper/80" },
];

const topics = ["Dinner reservations", "Date nights", "Neighborhoods", "Swimming holes", "Run clubs", "Hidden bars", "Hill Country weekends", "Two-step", "Making friends", "Omakase drops", "River floats"];

export default function Home() {
  const flagship = must("cia-new-to-austin");
  // The CTA shows a price only once it is approved in the catalogue (none is, as of 18 Oct 2026).
  const flagshipPrice = priceOf(approvedPriceBook(), flagship.id);
  const all = resolveProducts(shopOrder);

  return (
    <>
      {/* ------------------------------------------------- 1. FLAGSHIP (hero) */}
      <section className="relative overflow-hidden" aria-labelledby="flagship-title">
        <div className="wrap grid items-center gap-10 pb-16 pt-8 sm:pt-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:pb-24 lg:pt-16">
          <div className="order-2 lg:order-1">
            <p className="inline-flex items-center gap-2 rounded-full bg-card px-3 py-1.5 text-[0.8rem] font-semibold text-forest ring-1 ring-line">
              <svg aria-hidden viewBox="0 0 120 120" className="h-4 w-4 text-forest">
                <Cactus />
              </svg>
              The flagship guide · 2026–27 edition
            </p>
            <h1 id="flagship-title" className="t-display mt-6 text-balance">
              New to Austin? <span className="block whitespace-nowrap text-[0.78em] leading-[1.06] sm:text-[0.84em]"><span className="accent-italic">I&rsquo;ve got you.</span> <span aria-hidden className="inline-block align-[0.08em] text-[0.62em]">💛</span></span>
            </h1>
            <p className="t-lede mt-6 max-w-xl text-ink-soft text-pretty">Moving somewhere new is exciting. Figuring everything out? A little overwhelming.</p>
            <p className="mt-4 max-w-xl text-[1.06rem] text-ink-soft text-pretty">
              Meet the <strong className="font-semibold text-ink">New to Austin Ultimate Guide</strong>: your shortcut to discovering the city, finding your
              favorite spots, and feeling at home faster. From where to eat and what to explore to making the most of your weekends, consider this your
              Austin starter pack.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/guides/new-to-austin" className="btn">
                Explore the Ultimate Guide{flagshipPrice !== null ? <> &mdash; {formatMoney(flagshipPrice)}</> : null}
              </Link>
              <Link href="/shop" className="btn btn-outline">
                Shop all guides
              </Link>
            </div>
            <ul className="mt-8 flex flex-wrap gap-2" aria-label="What's inside New to Austin">
              {flagship.chips.map((c) => (
                <li key={c} className="chip bg-card ring-1 ring-line">
                  {c}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative order-1 mx-auto w-full max-w-[30rem] lg:order-2">
            <div className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-b-[2rem] bg-sky">
              <Image
                src="/images/chloe/chloe-zilker-picnic.jpg"
                alt="Chloe smiling at a picnic on Zilker Park's lawn, with the downtown Austin skyline behind her"
                fill
                priority
                sizes="(min-width: 1024px) 30rem, 90vw"
                className="object-cover"
                style={{ objectPosition: "50% 40%" }}
              />
            </div>
            <span className="sticker absolute -left-3 top-[12%] h-24 w-24 bg-sun text-[0.68rem] text-forest-deep shadow-lg sm:-left-8 sm:h-28 sm:w-28">
              Your
              <br />
              Austin
              <br />
              starter pack
            </span>
            <Link href="/guides/new-to-austin" className="group absolute -bottom-6 -right-2 w-[38%] rotate-[5deg] sm:-right-6" aria-label="New to Austin: The Ultimate Guide">
              <Cover product={flagship} sizes="190px" priority />
            </Link>
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

      {/* --------------------------------------------- 2. FOUR GUIDE CATEGORIES */}
      <section className="section" aria-labelledby="categories-title">
        <div className="wrap">
          <SectionHead id="categories-title" eyebrow="The guides" title="A little something for every" accent="Austin adventure" align="center" />
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((c, i) => (
              <li key={c.title} data-reveal style={{ ["--reveal-delay" as string]: `${i * 70}ms` }}>
                <article className={`grain relative flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] p-6 ${c.tone}`}>
                  <h3 className="font-serif text-[1.7rem] leading-tight" style={{ fontVariationSettings: '"SOFT" 100' }}>
                    <Link href={c.href} className="hover:underline hover:decoration-1 hover:underline-offset-4">
                      {c.title}
                    </Link>
                  </h3>
                  <p className={`mt-2 t-small ${c.sub}`}>{c.line}</p>
                  <ul className="mt-6 flex items-end gap-3" aria-label={`${c.title} guides`}>
                    {c.guides.map((id, gi) => {
                      const g = must(id);
                      return (
                        <li key={id} className={`w-[40%] max-w-28 ${gi ? "-rotate-3" : "rotate-3"}`}>
                          <Link href={`/guides/${g.slug}`} className="group block" aria-label={g.title}>
                            <Cover product={g} sizes="112px" />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                  <Link href={c.href} className="mt-auto inline-flex items-center gap-1 pt-6 text-sm font-semibold">
                    {c.cta} <span aria-hidden>→</span>
                  </Link>
                </article>
              </li>
            ))}
          </ul>
          <div className="mt-10 text-center">
            <Link href="/shop" className="btn">
              Shop all guides
            </Link>
          </div>
        </div>
      </section>

      {/* --------------------------------------------- 3. WHY THE GUIDES */}
      <section className="section-tight" aria-labelledby="why-title">
        <div className="wrap">
          <div className="grain grid gap-10 rounded-[2rem] bg-forest p-8 text-paper sm:p-12 lg:grid-cols-[1fr_1fr] lg:gap-16 lg:p-16">
            <div>
              <h2 id="why-title" className="t-h1 text-balance">
                Less searching. <span className="italic text-sun" style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1' }}>More living.</span>
              </h2>
              <p className="t-lede mt-6 max-w-md text-paper/85 text-pretty">
                Because life&rsquo;s too short to spend three hours Googling where to go on a Friday night.
              </p>
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-[1.06rem] text-paper/85">My guides bring together, all in one place:</p>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {["Curated recommendations", "Practical tips", "Useful details", "Direct links"].map((t) => (
                  <li key={t} className="flex items-center gap-3 rounded-2xl bg-paper/8 px-4 py-3 ring-1 ring-paper/15">
                    <span aria-hidden className="text-sun">✦</span>
                    <span className="font-medium">{t}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-8 font-serif text-2xl leading-snug" style={{ fontVariationSettings: '"SOFT" 100' }}>
                A little less planning. <span className="italic text-sun" style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1' }}>A lot more Austin.</span>{" "}
                <span aria-hidden>✨</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------- EXPLORE THE COLLECTION */}
      <section className="section" aria-labelledby="collection-title">
        <div className="wrap">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHead id="collection-title" eyebrow="The collection" title="Seven guides," accent="one very good city" lede="From great dinners and new friends to hidden gems, memorable dates, and weekend escapes." />
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
              Hi, I&rsquo;m Chloe. <span className="accent-italic">Good food, great people, and everything in between.</span>
            </h2>
            <div className="mt-5 max-w-xl space-y-4 text-[1.06rem] text-ink-soft">
              <p>
                I&rsquo;m 27, Canadian, and new to Austin. I love discovering a city through its people, neighborhoods, food, and all the little experiences that make it feel like home.
              </p>
              <p>
                These guides are what happens when that curiosity gets organized: dinners worth planning a night around, dates that beat dinner-and-a-movie,
                the clubs and classes that are actually running, swimming holes worth the drive, Hill Country weekends and the rooms that are hard to get
                into. Researched, checked, dated and linked to the official source, so your plans hold up.
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

      {/* ---------------------------------------------------- SAVE WITH BUNDLES (approved only) */}
      <SaveWithBundles />

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
