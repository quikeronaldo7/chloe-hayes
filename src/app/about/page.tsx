import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getProduct } from "@/catalogue";
import { Cover } from "@/components/cover";
import { JsonLd } from "@/components/json-ld";
import { absoluteUrl } from "@/lib/config";

export const metadata: Metadata = {
  title: "About Chloe",
  description: "Chloe Hayes is 27, Canadian and new to Austin: a culinary storyteller learning the city through food, people and the stories behind them.",
  alternates: { canonical: "/about" },
  openGraph: { images: [{ url: "/images/chloe/chloe-portrait-warm.jpg", alt: "Chloe Hayes" }] },
};

/**
 * Only established canon from the Brand Bible v1.1: 27, Canadian, Austin home base
 * ("new to ATX"), culinary storyteller, travels because of food, and her personality.
 * Hometown, previous city, move date/reason, education, jobs and relationship status
 * are deliberately UNLOCKED and must not be written here.
 */
export default function AboutPage() {
  return (
    <>
      <section className="wrap grid items-center gap-10 pb-16 pt-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:pt-14">
        <div>
          <p className="t-eyebrow text-terracotta">About Chloe</p>
          <h1 className="t-display mt-4 text-balance">
            Food first. <span className="accent-italic">Everything else follows.</span>
          </h1>
          <p className="t-lede mt-6 max-w-xl text-ink-soft text-pretty">
            I&rsquo;m Chloe Hayes: 27, Canadian, and new to Austin. I&rsquo;m a culinary storyteller, which is a fancy way of saying I learn a place
            through what people cook, who&rsquo;s cooking it, and why everyone keeps coming back.
          </p>
        </div>
        <div className="relative mx-auto w-full max-w-md">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem]">
            <Image src="/images/chloe/chloe-portrait-warm.jpg" alt="Chloe smiling on a patio in warm evening light" fill priority sizes="(min-width: 1024px) 28rem, 90vw" className="object-cover" style={{ objectPosition: "50% 25%" }} />
          </div>
          <span className="sticker absolute -left-4 bottom-10 h-24 w-24 bg-sun text-[0.68rem] text-forest-deep shadow-lg">
            New
            <br />
            to ATX
          </span>
        </div>
      </section>

      <section className="grain bg-forest text-paper">
        <div className="wrap section-tight grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="space-y-5 text-[1.08rem] text-paper/85">
            <h2 className="t-h2 text-paper">
              Why a <span className="italic text-sun">new</span> girl in town?
            </h2>
            <p>
              Because I don&rsquo;t have to pretend I&rsquo;ve known Austin forever. I get to do what you&rsquo;d do: ask the second question, read
              the fine print on the reservation page, and work out which places are actually worth it.
            </p>
            <p>
              I&rsquo;ll walk into a bakery for one thing and leave knowing the story behind it. (I said I was getting one. It was four.) That
              curiosity is the whole engine behind these guides.
            </p>
          </div>
          <div className="space-y-5 text-[1.08rem] text-paper/85">
            <h2 className="t-h2 text-paper">
              How the guides <span className="italic text-sun">get made</span>
            </h2>
            <ul className="space-y-4">
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

      <section className="section-tight">
        <div className="wrap grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="relative aspect-[16/9] overflow-hidden rounded-[1.5rem]">
            <Image src="/images/chloe/chloe-south-congress.jpg" alt="Chloe walking along South Congress at golden hour" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </div>
          <div>
            <p className="t-eyebrow text-terracotta">What I&rsquo;m not</p>
            <ul className="mt-4 space-y-3 text-[1.05rem]">
              <li>Not a restaurant scorecard. Not everything is a 10/10.</li>
              <li>Not a luxury-only foodie. A great taco and a tasting menu can both be the night.</li>
              <li>Not a fake local. I&rsquo;m learning, and I&rsquo;d love your help.</li>
            </ul>
            <p className="mt-8 font-serif text-2xl italic text-forest" style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1' }}>
              Tell me what I&rsquo;m missing in Austin.
            </p>
          </div>
        </div>
      </section>

      <section className="section-tight pb-24">
        <div className="wrap rounded-[2rem] bg-blush/60 p-8 sm:p-12">
          <div className="grid items-center gap-10 md:grid-cols-[1fr_auto]">
            <div>
              <h2 className="t-h2 text-balance">
                Start where I&rsquo;d <span className="accent-italic">start</span>.
              </h2>
              <p className="mt-4 max-w-lg text-ink-soft">If you&rsquo;re new here too, the flagship covers neighborhoods, real costs, making friends and your first 90 days.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/guides/new-to-austin" className="btn">
                  New to Austin
                </Link>
                <Link href="/shop" className="btn btn-outline">
                  All seven guides
                </Link>
              </div>
            </div>
            <div className="mx-auto w-40 rotate-3">
              <Cover product={getProduct("cia-new-to-austin")!} sizes="160px" />
            </div>
          </div>
        </div>
      </section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          url: absoluteUrl("/about"),
          mainEntity: { "@type": "Person", name: "Chloe Hayes", jobTitle: "Culinary storyteller", homeLocation: { "@type": "Place", name: "Austin, Texas" }, image: absoluteUrl("/images/chloe/chloe-portrait-warm.jpg") },
        }}
      />
    </>
  );
}
