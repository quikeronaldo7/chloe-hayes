import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getProduct } from "@/catalogue";
import { Cover } from "@/components/cover";
import { JsonLd } from "@/components/json-ld";
import { absoluteUrl } from "@/lib/config";

/** Owner's definitive photo (golden_hour_stroll_at_austin_motel.png), shown uncropped at its own 1448×1086 ratio. */
const ABOUT_PHOTO = { src: "/images/chloe/chloe-golden-hour-austin-motel.jpg", alt: "Chloe in a yellow sundress walking past the Austin Motel sign at golden hour" };

/** What Chloe's recommendations promise, drawn only from what the guides actually contain. */
const promises = [
  ["An eye for the special ones", "The patio that glows at sunset, the counter with eight seats, the swimming hole worth the drive. I look for places with personality, not just a high rating."],
  ["The details that make the night", "What to order, what to book and when to go. Every recommendation comes with the small things that turn a good plan into a great one."],
  ["Curated, never crammed", "No lists of fifty maybes. Each guide is a short, considered edit of places worth your time, and every one has a reason it made the cut."],
  ["Planned properly", "Booking windows, how access really works, the best day to go, and the official link to confirm it all. So the plan you make is the plan that happens."],
  ["For every kind of Austin day", "Taco joint or tasting menu, first date or friend date, a lazy afternoon in the water or a night somewhere you need to know how to get into. I'm in for all of it."],
] as const;

/** "Where should I go?": each question points to the guide that answers it. */
const asks = [
  ["Just moved here?", "cia-new-to-austin"],
  ["Dinner worth dressing up for?", "cia-dinner-spots"],
  ["Planning a date?", "cia-date-ideas"],
  ["Ready to meet people?", "cia-being-single"],
  ["Need a swim stop?", "cia-natural-gems"],
  ["Craving a weekend away?", "cia-hill-country"],
  ["Want somewhere special?", "cia-exclusive"],
] as const;

export const metadata: Metadata = {
  title: "About Chloe",
  description: "Meet Chloe Hayes, your Austin insider with excellent taste: dinner reservations, first dates, hidden gems and weekend escapes, with the details that make them work.",
  alternates: { canonical: "/about" },
  openGraph: { images: [{ url: ABOUT_PHOTO.src, alt: ABOUT_PHOTO.alt }] },
};

/**
 * About copy: updated at the owner's request for an Austin-explorer voice. Keep
 * biography light, local discovery central, and make no unverifiable credentials,
 * memberships or specific first-hand visit claims.
 */
export default function AboutPage() {
  return (
    <>
      <section className="wrap grid gap-10 pb-16 pt-10 lg:grid-cols-[1fr_1fr] lg:items-start lg:gap-14 lg:pt-14">
        <div>
          <p className="t-eyebrow text-terracotta">About Chloe</p>
          <h1 className="t-display mt-4 text-balance">
            Your Austin insider, <span className="accent-italic">with excellent taste.</span>
          </h1>
          <p className="t-lede mt-6 font-serif text-ink">
            Hi, I&rsquo;m Chloe!
          </p>
          <div className="mt-4 max-w-xl space-y-4 text-[1.08rem] text-ink-soft text-pretty">
            <p>
              I came to Austin looking for a new adventure, and somewhere along the way, I completely fell for the city. The food, the energy,
              the little discoveries around every corner&mdash;there&rsquo;s always somewhere new to explore, and I love that.
            </p>
            <p>
              Before long, exploring turned into my favorite obsession, and sharing the good finds felt just as fun. So I started Chloe in Austin:
              my little corner of the internet for the places, plans, and adventures that make this city so special.
            </p>
            <p>
              I&rsquo;m your girl for the dinner reservation worth making, the first-date spot that isn&rsquo;t awkward, the hidden gem your friends
              haven&rsquo;t heard of yet, or the spontaneous weekend escape that somehow becomes your favorite memory.
            </p>
            <p>
              And my taste? A little bit of everything. I&rsquo;ll happily dress up for a beautiful tasting menu, then get equally excited about a
              neighborhood taco spot, a sunny patio, or a swimming hole on a hot Texas afternoon. Good food, great people, and a little adventure?
              Always yes.
            </p>
            <p>
              I also believe the best plans are the ones you can actually pull off. My guides go beyond the pretty pictures with thoughtful
              recommendations, booking details, what to order, when to go, and links to check before heading out.
            </p>
            <p className="text-ink">
              <strong className="font-semibold">Think of me as your Austin friend with the inside scoop.</strong> You bring the company.
              I&rsquo;ll bring the plans&mdash;and probably a few ideas for our next adventure. <span role="img" aria-label="cowboy hat face">🤠</span>
            </p>
          </div>
          <p className="mt-6 max-w-xl font-serif text-xl italic text-forest" style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1' }}>
            And if you&rsquo;ve discovered somewhere amazing that I haven&rsquo;t, you know I&rsquo;m going to want to hear about it.
          </p>
        </div>
        <figure className="relative order-first w-full lg:sticky lg:top-28 lg:order-none">
          <div className="overflow-hidden rounded-[2rem] bg-sand shadow-[0_30px_60px_-30px_rgba(42,36,32,0.45)] ring-1 ring-line">
            <Image src={ABOUT_PHOTO.src} alt={ABOUT_PHOTO.alt} width={1448} height={1086} priority sizes="(min-width: 1280px) 38rem, (min-width: 1024px) 46vw, 92vw" className="h-auto w-full" />
          </div>
          <figcaption className="mt-3 t-small text-muted">Golden hour on South Congress.</figcaption>
        </figure>
      </section>

      <section className="section-tight bg-paper-deep/60" aria-labelledby="why-title">
        <div className="wrap">
          <p className="t-eyebrow text-terracotta">Why ask Chloe</p>
          <h2 id="why-title" className="t-h2 mt-3 max-w-2xl text-balance">
            If you want to know where to go, <span className="accent-italic">I&rsquo;m your girl.</span>
          </h2>
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
            {promises.map(([t, d], i) => (
              <li key={t} className={`card p-6 ${i < 3 ? "lg:col-span-2" : "lg:col-span-3"} ${i === promises.length - 1 ? "sm:col-span-2" : ""}`}>
                <span aria-hidden className="text-xl text-terracotta">✦</span>
                <h3 className="t-h3 mt-2">{t}</h3>
                <p className="mt-2 text-ink-soft">{d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grain bg-forest text-paper">
        <div className="wrap section-tight">
          <div className="space-y-5 text-[1.08rem] text-paper/85">
            <h2 className="t-h2 text-paper">
              How the guides <span className="italic text-sun">get made</span>
            </h2>
            <ul className="grid gap-x-12 gap-y-4 md:grid-cols-2">
              {[
                ["Researched, not guessed.", "Every listing is checked against its official source, and each guide prints when it was checked."],
                ["Dated and linked.", "Prices, hours and booking windows change. The guides say so, and link straight to where you can confirm."],
                ["Honest about limits.", "If something's seasonal, sold out or never guaranteed (looking at you, swimming holes), it says that too."],
                ["Built to be used.", "Clickable links, planners you can type into, and a clear next step on every page."],
              ].map(([t, d]) => (
                <li key={t} className="flex gap-3">
                  <span aria-hidden className="text-sun">✦</span>
                  <span>
                    <strong className="text-paper">{t}</strong> {d}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <div className="wrap py-7">
        <p className="max-w-3xl text-sm text-ink-soft">
          <strong>A little transparency:</strong> Chloe is a virtual creator and guide persona. Some imagery is AI-generated; these guides are curated from research and credited sources rather than claiming personal visits to every featured place.
        </p>
      </div>

      <section className="section-tight pb-24" aria-labelledby="ask-title">
        <div className="wrap">
          <p className="t-eyebrow text-terracotta">Ask Chloe</p>
          <h2 id="ask-title" className="t-h2 mt-3 max-w-2xl text-balance">
            So, <span className="accent-italic">where should you go?</span>
          </h2>
          <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
            {asks.map(([q, id]) => {
              const g = getProduct(id)!;
              return (
                <li key={id}>
                  <Link href={`/guides/${g.slug}`} className="group block">
                    <div className="mx-auto w-[78%]">
                      <Cover product={g} sizes="200px" />
                    </div>
                    <p className="mt-4 font-serif text-xl leading-snug">{q}</p>
                    <p className="mt-1 t-small text-ink-soft">
                      <span className="underline decoration-line-strong underline-offset-4 group-hover:decoration-terracotta">{g.shortTitle}</span> <span aria-hidden>→</span>
                    </p>
                  </Link>
                </li>
              );
            })}
            <li className="flex">
              <Link href="/shop" className="grain flex w-full flex-col justify-end gap-2 rounded-[var(--radius-card)] bg-forest p-6 text-paper">
                <span className="font-serif text-2xl leading-tight">All seven guides</span>
                <span className="t-small text-paper/85">
                  Browse the shop <span aria-hidden>→</span>
                </span>
              </Link>
            </li>
          </ul>
        </div>
      </section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          url: absoluteUrl("/about"),
          mainEntity: { "@type": "Brand", name: "Chloe in Austin", description: "Curated Austin guides featuring Chloe Hayes, a virtual creator persona", image: absoluteUrl(ABOUT_PHOTO.src) },
        }}
      />
    </>
  );
}
