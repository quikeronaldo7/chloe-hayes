import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PolicyBody } from "@/components/policy";
import { policies, policyBySlug } from "@/lib/policies";

/**
 * The original policy URLs, kept for payment providers and old links. The same
 * content lives on the Help page (src/lib/policies.ts); the footer no longer links here.
 */
export function generateStaticParams() {
  return policies.map((p) => ({ page: p.legalSlug }));
}

export async function generateMetadata({ params }: PageProps<"/legal/[page]">): Promise<Metadata> {
  const { page } = await params;
  const p = policyBySlug(page);
  return p ? { title: p.title, robots: { index: false }, alternates: { canonical: `/help#${p.anchor}` } } : {};
}

export default async function LegalPage({ params }: PageProps<"/legal/[page]">) {
  const { page } = await params;
  const p = policyBySlug(page);
  if (!p) notFound();
  return (
    <div className="wrap-narrow section pb-24">
      <p className="t-eyebrow text-terracotta">Help & FAQs</p>
      <h1 className="t-h1 mt-3">{p.title}</h1>
      <div className="mt-8">
        <PolicyBody policy={p} />
      </div>
      <p className="mt-10 t-small">
        <Link href={`/help#${p.anchor}`} className="link-arrow">
          All policies on the Help page <span aria-hidden>→</span>
        </Link>
      </p>
    </div>
  );
}
