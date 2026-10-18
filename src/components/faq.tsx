import type { Faq } from "@/catalogue";
import { JsonLd } from "./json-ld";

export function FaqList({ items, schema = false }: { items: Faq[]; schema?: boolean }) {
  return (
    <>
      <div className="divide-y divide-line border-y border-line">
        {items.map((f) => (
          <details key={f.q} className="group">
            <summary className="flex items-start justify-between gap-6 py-5 font-serif text-[1.18rem] leading-snug" style={{ fontVariationSettings: '"SOFT" 100' }}>
              {f.q}
              <span aria-hidden className="faq-icon mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-paper-deep text-lg leading-none transition-transform duration-300">
                +
              </span>
            </summary>
            <p className="max-w-2xl pb-6 text-ink-soft">{f.a}</p>
          </details>
        ))}
      </div>
      {schema ? (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
          }}
        />
      ) : null}
    </>
  );
}
