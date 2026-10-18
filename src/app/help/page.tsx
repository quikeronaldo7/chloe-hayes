import type { Metadata } from "next";
import { FaqList } from "@/components/faq";
import { PolicyBody } from "@/components/policy";
import { ResendForm } from "@/components/resend-form";
import { HowItWorks, SectionHead } from "@/components/sections";
import { siteConfig } from "@/lib/config";
import { storeFaqs } from "@/lib/faqs";
import { policies } from "@/lib/policies";

export const metadata: Metadata = {
  title: "Help & downloads",
  description: "How buying and downloading Chloe in Austin guides works, which apps to use, and how to get your download links again.",
  alternates: { canonical: "/help" },
};

export default function HelpPage() {
  return (
    <>
      <section className="wrap pb-10 pt-10 sm:pt-14">
        <p className="t-eyebrow text-terracotta">Help</p>
        <h1 className="t-h1 mt-3 max-w-3xl text-balance">
          Help, downloads <span className="accent-italic">& the fine print.</span>
        </h1>
        <p className="t-lede mt-4 max-w-2xl text-ink-soft">How buying works, which apps to open your guides in, and how to get your links again if the email goes missing.</p>
      </section>

      <section id="resend" className="wrap scroll-mt-28">
        <div className="grid gap-8 rounded-[2rem] bg-blush/60 p-6 sm:p-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="t-eyebrow text-terracotta-deep">Lost your download link?</p>
            <h2 className="t-h2 mt-2">Resend my downloads</h2>
            <p className="mt-3 text-ink-soft">Enter the email you used at checkout. If it matches a purchase, we&rsquo;ll send fresh links to your private library, valid for a year.</p>
          </div>
          <ResendForm />
        </div>
      </section>

      <section id="how-it-works" className="section-tight scroll-mt-24">
        <div className="wrap">
          <SectionHead eyebrow="How it works" title="From checkout to" accent="out the door" />
          <div className="mt-8">
            <HowItWorks />
          </div>
        </div>
      </section>

      <section className="section-tight">
        <div className="wrap grid gap-5 md:grid-cols-3">
          {[
            ["Your library", "It opens right after payment and the link is emailed to you. It works on any device for a year from purchase, and each download button inside refreshes every time you open it."],
            ["Opening the guides", "Any PDF app works for reading and links. For the fill-in pages (New to Austin, Dinner Spots, Most Exclusive), the guides recommend the free Adobe Acrobat Reader so your answers save."],
            ["On your phone", "Tap Download, then save the PDF to Files (iPhone) or Downloads (Android). It's yours, and the links work whenever you have signal."],
          ].map(([t, d]) => (
            <div key={t} className="card p-6">
              <h2 className="t-h3">{t}</h2>
              <p className="mt-2 t-small text-ink-soft">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="faq" className="section-tight scroll-mt-24">
        <div className="wrap grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <SectionHead eyebrow="FAQs" title="Good" accent="questions" />
            <p className="mt-5 max-w-sm text-ink-soft">
              {siteConfig.supportEmail ? (
                <>
                  Still stuck? Email <a href={`mailto:${siteConfig.supportEmail}`} className="link-arrow">{siteConfig.supportEmail}</a>.
                </>
              ) : (
                <>A direct support inbox is being set up. Until then, the resend form above is the fastest way back to your guides.</>
              )}
            </p>
            <p className="mt-4 max-w-sm t-small text-ink-soft">
              Looking for the fine print? See the <a href="#terms-of-sale" className="link-arrow">Terms of Sale</a>,{" "}
              <a href="#refunds" className="link-arrow">Refund &amp; Digital Product Policy</a> and <a href="#privacy" className="link-arrow">Privacy</a> below.
            </p>
          </div>
          <FaqList items={storeFaqs} schema />
        </div>
      </section>

      <section id="policies" className="section-tight scroll-mt-24 pb-24">
        <div className="wrap grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <SectionHead eyebrow="Policies" title="The" accent="fine print" />
            <nav aria-label="Policies" className="mt-6 flex flex-col gap-2 t-small">
              {policies.map((p) => (
                <a key={p.anchor} href={`#${p.anchor}`} className="link-arrow">
                  {p.title} <span aria-hidden>↓</span>
                </a>
              ))}
            </nav>
          </div>
          <div className="space-y-12">
            {policies.map((p) => (
              <section key={p.anchor} id={p.anchor} aria-labelledby={`${p.anchor}-title`} className="scroll-mt-28">
                <h3 id={`${p.anchor}-title`} className="t-h3">
                  {p.title}
                </h3>
                <div className="mt-3">
                  <PolicyBody policy={p} />
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
