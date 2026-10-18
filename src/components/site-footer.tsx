import Link from "next/link";
import { collections } from "@/catalogue";
import { instagramUrl, siteConfig } from "@/lib/config";
import { Badge } from "./wordmark";

export function SiteFooter() {
  return (
    <footer className="grain mt-auto bg-forest text-paper">
      <div className="wrap grid gap-12 py-16 sm:grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" className="inline-block rounded-full" aria-label="Chloe in Austin, home">
            <Badge alt="" className="w-44 sm:w-52" />
          </Link>
          <p className="mt-5 max-w-sm font-serif text-xl leading-snug text-paper/90" style={{ fontVariationSettings: '"SOFT" 100' }}>
            Good food. Great plans. <span className="italic text-sun">Your Austin, sorted.</span>
          </p>
          {siteConfig.instagramConfirmed ? (
            <a href={instagramUrl} target="_blank" rel="noopener" className="link-arrow mt-6 text-sun">
              @{siteConfig.instagramHandle} on Instagram <span aria-hidden>↗</span>
            </a>
          ) : null}
        </div>


        <FooterCol title="The guides">
          <li><Link href="/shop" className="link-quiet">Shop all guides</Link></li>
          {collections.map((c) => (
            <li key={c.slug}>
              <Link href={`/collections/${c.slug}`} className="link-quiet">
                {c.name}
              </Link>
            </li>
          ))}
        </FooterCol>
        <FooterCol title="Help">
          <li><Link href="/help" className="link-quiet">Help & FAQs</Link></li>
          <li><Link href="/help#resend" className="link-quiet">Resend my downloads</Link></li>
          <li><Link href="/help#how-it-works" className="link-quiet">How delivery works</Link></li>
          <li><Link href="/about" className="link-quiet">About Chloe</Link></li>
        </FooterCol>
        <FooterCol title="Legal">
          <li><Link href="/legal/terms" className="link-quiet">Terms of sale</Link></li>
          <li><Link href="/legal/refunds" className="link-quiet">Refunds</Link></li>
          <li><Link href="/legal/privacy" className="link-quiet">Privacy</Link></li>
        </FooterCol>
      </div>
      <div className="border-t border-paper/15">
        <div className="wrap flex flex-col gap-2 py-6 text-xs text-paper/65 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Chloe Hayes · Chloe in Austin. All rights reserved.</p>
          <p>Details in every guide are dated and linked to the official source.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="t-eyebrow text-sun">{title}</p>
      <ul className="mt-4 space-y-2.5 text-[0.95rem] text-paper/85">{children}</ul>
    </div>
  );
}
