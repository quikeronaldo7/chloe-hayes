import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getProduct } from "@/catalogue";
import { Cover } from "@/components/cover";
import { JsonLd } from "@/components/json-ld";
import { absoluteUrl } from "@/lib/config";

/** Owner-approved: Chloe in the yellow dress outside the Austin Motel (same photo as the New to Austin cover). */
const ABOUT_PHOTO = { src: "/images/chloe/chloe-austin-motel-yellow-dress.jpg", alt: "Chloe in a yellow sundress under the Austin Motel sign on South Congress" };

export const metadata: Metadata = {
  title: "About Chloe",
  description: "Meet Chloe Hayes, your Austin insider with excellent taste: dinner reservations, first dates, hidden gems and weekend escapes, with the details that make them work.",
  alternates: { canonical: "/about" },
  openGraph: { images: [{ url: ABOUT_PHOTO.src, alt: ABOUT_PHOTO.alt }] },
};

/**
 * About copy: owner-approved text (18 Oct 2026), used verbatim. Anything beyond it
 * (hometown, previous city, education, jobs, relationship status) stays UNLOCKED per
 * the Brand Bible v1.1 and must not be added here.
 */
export default function AboutPage() {
  return (
    <>
      <section className="wrap grid gap-10 pb-16 pt-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-16 lg:pt-14">
        <div>
          <p className="t-eyebrow text-terracotta">About Chloe</p>
          <h1 className="t-display mt-4 text-balance">
            Your Austin insider, <span className="accent-italic">with excellent taste.</span>
          </h1>
          <p className="t-lede mt-6 font-serif text-ink">
            Hi, I&rsquo;m Chloe! <span role="img" aria-label="Canadian flag">🇨🇦</span>
          </p>
          <div className="mt-4 max-w-xl space-y-4 text-[1.08rem] text-ink-soft text-pretty">
            <p>I came to Austin for a new adventure, and somewhere along the way, finding the city&rsquo;s best spots became my favorite obsession.</p>
            <p>
              I&rsquo;m the friend who knows where to make dinner reservations, which new places are worth the hype, where to go on a first date, and
              which little hidden gems deserve a spot on your weekend calendar.
            </p>
            <p>
              I&rsquo;m equally happy at a neighborhood taco joint or a beautiful tasting menu. Give me good food, great company, and a place with a
              little personality, and I&rsquo;m in.
            </p>
            <p>
              I&rsquo;ve made it my mission to discover the Austin experiences actually worth your time. The romantic spots, the fun nights out, the
              secret corners, the beautiful escapes, and those special places you&rsquo;ll want to tell your friends about.
            </p>
            <p>
              And because a great recommendation is only useful when you can actually experience it, my guides go beyond pretty pictures. I bring you
              the details: what to order, what to book, when to go, and how to make the most of it.
            </p>
            <p className="text-ink">
              <strong className="font-semibold">Consider me your Austin girl with the inside scoop.</strong> You bring the company. I&rsquo;ll bring the
              plans. <span role="img" aria-label="cowboy hat face">🤠</span>
            </p>
          </div>
          <p className="mt-6 max-w-xl font-serif text-xl italic text-forest" style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1' }}>
            And if you&rsquo;ve discovered somewhere amazing that I haven&rsquo;t, you know I&rsquo;m going to want to hear about it.
          </p>
        </div>
        <div className="relative order-first mx-auto w-full max-w-sm sm:max-w-md lg:sticky lg:top-28 lg:order-none">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem]">
            <Image src={ABOUT_PHOTO.src} alt={ABOUT_PHOTO.alt} fill priority sizes="(min-width: 1024px) 28rem, 90vw" className="object-cover" style={{ objectPosition: "50% 40%" }} />
          </div>
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
          mainEntity: { "@type": "Person", name: "Chloe Hayes", jobTitle: "Culinary storyteller", homeLocation: { "@type": "Place", name: "Austin, Texas" }, image: absoluteUrl(ABOUT_PHOTO.src) },
        }}
      />
    </>
  );
}
