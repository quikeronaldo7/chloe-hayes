import Link from "next/link";
import { collections } from "@/catalogue";
import { instagramUrl, siteConfig } from "@/lib/config";
import { Wordmark } from "./wordmark";

export function SiteFooter() {
  return (
    <footer className="grain mt-auto bg-forest text-paper">
      <div className="wrap grid gap-12 py-16 sm:grid-cols-2 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <Link href="/" className="inline-block rounded-full" aria-label="Chloe in Austin, home">
            <Wordmark light />
          </Link>
          <p className="mt-5 max-w-sm font-serif text-xl leading-snug text-paper/90" style={{ fontVariationSettings: '"SOFT" 100' }}>
            Good food. Great plans. <span className="italic text-sun">Your Austin, sorted.</span>
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sun">
            {instagramUrl ? (
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Chloe on Instagram" title="Instagram" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-paper/30 transition-colors hover:bg-paper/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.7" cy="6.4" r="1" fill="currentColor" stroke="none"/></svg>
              </a>
            ) : null}
            {siteConfig.facebookUrl ? (
              <a href={siteConfig.facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Chloe on Facebook" title="Facebook" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-paper/30 transition-colors hover:bg-paper/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M13.7 21v-8.2h2.8l.4-3.2h-3.2V7.5c0-.9.3-1.5 1.6-1.5H17V3.1c-.3 0-1.2-.1-2.4-.1-2.5 0-4.2 1.5-4.2 4.3v2.3H7.6v3.2h2.8V21h3.3Z"/></svg>
              </a>
            ) : null}
          </div>
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
      </div>
      <div className="border-t border-paper/15">
        <div className="wrap flex flex-col gap-2 py-6 text-xs text-paper/65 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Chloe Hayes · Chloe in Austin. All rights reserved.</p>
          <nav aria-label="Legal" className="-my-1 flex gap-4 [&>a]:py-1">
            <Link href="/legal/terms" className="hover:text-paper">Terms</Link>
            <Link href="/legal/refunds" className="hover:text-paper">Refunds</Link>
            <Link href="/legal/privacy" className="hover:text-paper">Privacy</Link>
          </nav>
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
