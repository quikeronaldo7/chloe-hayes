import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

/**
 * Legal pages. Nothing here is presented as final: the seller entity, refund policy,
 * licence terms and privacy details need owner approval (docs/LAUNCH-CHECKLIST.md §Legal).
 * Each page says plainly that the policy isn't published yet and lists what it will cover.
 */
const pages = {
  terms: {
    title: "Terms of sale",
    covers: [
      "Who is selling (the legal seller and contact details)",
      "What you buy: a personal-use licence to a digital PDF guide",
      "How delivery works: your private library and download links",
      "Pricing, currency, taxes and promo codes",
      "Accuracy: venue details, prices and access change, and the guides link to official sources",
      "Governing law",
    ],
  },
  refunds: {
    title: "Refunds",
    covers: ["Whether and when refunds are available for digital guides", "How to request one", "What happens to your library access after a refund"],
  },
  privacy: {
    title: "Privacy",
    covers: [
      "What we collect at checkout (through Stripe) and why",
      "Order emails (sent through Resend) and download access",
      "Analytics, if any are switched on",
      "How long data is kept and how to ask for it to be deleted",
    ],
  },
} as const;

type Key = keyof typeof pages;

export function generateStaticParams() {
  return Object.keys(pages).map((page) => ({ page }));
}

export async function generateMetadata({ params }: PageProps<"/legal/[page]">): Promise<Metadata> {
  const { page } = await params;
  const p = pages[page as Key];
  return p ? { title: p.title, robots: { index: false } } : {};
}

export default async function LegalPage({ params }: PageProps<"/legal/[page]">) {
  const { page } = await params;
  const p = pages[page as Key];
  if (!p) notFound();
  return (
    <div className="wrap-narrow section pb-24">
      <p className="t-eyebrow text-terracotta">Legal</p>
      <h1 className="t-h1 mt-3">{p.title}</h1>
      <div className="mt-8 rounded-xl border-2 border-dashed border-line-strong bg-card p-6">
        <p className="font-semibold">This policy hasn&rsquo;t been published yet.</p>
        <p className="mt-2 text-ink-soft">It will appear here, in full, before the shop opens. No real purchase can be made until it does.</p>
      </div>
      <div className="prose-chloe mt-10">
        <h2>What it will cover</h2>
        <ul>
          {p.covers.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </div>
      <p className="mt-10 t-small">
        <Link href="/help" className="link-arrow">
          Back to Help <span aria-hidden>→</span>
        </Link>
      </p>
    </div>
  );
}
