import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import type { StudioArticle } from "@/lib/server/content-studio";
import { RichText } from "./rich-text";

const dateFmt = new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "America/Chicago" });
const day = (iso: string | null) => (iso ? dateFmt.format(new Date(iso)) : null);

/** One journal article from the Content Studio. Everything the JSON-LD describes is visible here. */
export function ArticleView({ article: a }: { article: StudioArticle }) {
  const published = day(a.publishedAt);
  const modified = a.modifiedAt && a.modifiedAt.slice(0, 10) !== a.publishedAt?.slice(0, 10) ? day(a.modifiedAt) : null;
  const hero = a.heroImage;
  return (
    <article className="wrap section">
      <nav aria-label="Breadcrumb" className="text-[0.8rem] font-semibold text-muted">
        <ol className="flex flex-wrap items-center gap-2">
          <li><Link href="/" className="link-quiet">Home</Link> <span aria-hidden>/</span></li>
          <li><Link href="/journal" className="link-quiet">The Austin Journal</Link> <span aria-hidden>/</span></li>
          <li aria-current="page" className="text-ink">{a.title}</li>
        </ol>
      </nav>
      {a.preview ? (
        <p role="status" className="mt-4 rounded-xl bg-sun/40 p-3 text-sm font-semibold">Preview: this draft is not published. Do not share this link.</p>
      ) : null}
      <header className="mt-6 max-w-3xl">
        {a.category ? <p className="t-eyebrow text-terracotta">{a.category.name}</p> : null}
        <h1 className="t-h1 mt-3 text-balance">{a.title}</h1>
        {a.excerpt ? <p className="t-lede mt-4 text-ink-soft">{a.excerpt}</p> : null}
        <p className="mt-4 text-sm text-muted">
          {a.author ? <>By {a.author.name}</> : null}
          {published ? <> · <time dateTime={a.publishedAt ?? undefined}>{published}</time></> : null}
          {modified ? <> · Updated <time dateTime={a.modifiedAt ?? undefined}>{modified}</time></> : null}
          {a.readingMinutes ? <> · {a.readingMinutes} min read</> : null}
        </p>
      </header>
      {hero ? (
        <figure className="mt-8">
          {/* eslint-disable-next-line @next/next/no-img-element -- remote CMS media with known dimensions */}
          <img src={hero.sizes?.wide?.url ?? hero.url} alt={hero.alt} width={hero.width} height={hero.height} className="h-auto w-full rounded-3xl" fetchPriority="high" />
          {hero.caption ? <figcaption className="mt-2 text-sm text-muted">{hero.caption}</figcaption> : null}
        </figure>
      ) : null}
      <div className="mt-10 max-w-3xl">
        {a.keyTakeaways.length ? (
          <aside className="mb-8 rounded-2xl bg-card p-5 ring-1 ring-line" aria-label="Key takeaways">
            <p className="font-semibold">Key takeaways</p>
            <ul className="mt-2 list-disc pl-5">{a.keyTakeaways.map((t) => <li key={t}>{t}</li>)}</ul>
          </aside>
        ) : null}
        <RichText content={a.content} />
        {a.faqs.length ? (
          <section className="mt-12" aria-labelledby="faq">
            <h2 id="faq" className="t-h2">Questions</h2>
            <dl className="mt-4 space-y-4">
              {a.faqs.map((f) => (
                <div key={f.question}>
                  <dt className="font-semibold">{f.question}</dt>
                  <dd className="mt-1 text-ink-soft">{f.answer}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}
        {a.sources.length ? (
          <section className="mt-12 text-sm" aria-labelledby="sources">
            <h2 id="sources" className="t-h3">Sources</h2>
            <ul className="mt-2 list-disc pl-5">
              {a.sources.map((s) => (
                <li key={`${s.title}-${s.url}`}>
                  {s.url ? <a href={s.url} rel="noopener noreferrer">{s.title}</a> : s.title}
                  {s.publisher ? `, ${s.publisher}` : ""}
                  {s.accessedAt ? ` (accessed ${s.accessedAt})` : ""}
                </li>
              ))}
            </ul>
            {a.factCheckedAt ? <p className="mt-2 text-muted">Facts checked {day(a.factCheckedAt)}.</p> : null}
          </section>
        ) : null}
        {a.disclosure || a.author?.disclosure ? (
          <aside className="mt-10 rounded-xl p-4 text-sm text-ink-soft ring-1 ring-line" aria-label="Disclosure">
            {a.disclosure ? <p>{a.disclosure}</p> : null}
            {a.author?.disclosure ? <p className={a.disclosure ? "mt-2" : undefined}>{a.author.disclosure}</p> : null}
          </aside>
        ) : null}
        {a.relatedProducts.length ? (
          <section className="mt-12" aria-labelledby="guides">
            <h2 id="guides" className="t-h3">Guides for this</h2>
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
              {a.relatedProducts.map((p) => (
                <li key={p.productId}><Link href={p.path} className="block rounded-xl p-3 ring-1 ring-line hover:bg-paper-deep"><span className="font-semibold">{p.title}</span></Link></li>
              ))}
            </ul>
          </section>
        ) : null}
        {a.relatedArticles.length ? (
          <section className="mt-12" aria-labelledby="more">
            <h2 id="more" className="t-h3">More from the journal</h2>
            <ul className="mt-3 space-y-2">
              {a.relatedArticles.map((r) => <li key={r.slug}><Link href={r.path}>{r.title}</Link></li>)}
            </ul>
          </section>
        ) : null}
      </div>
      {a.preview ? null : <JsonLd data={a.jsonLd} />}
    </article>
  );
}

export function JournalUnavailable() {
  return (
    <div className="wrap section">
      <p className="t-eyebrow text-terracotta">The Austin Journal</p>
      <h1 className="t-h1 mt-3">This story is taking a breather.</h1>
      <p className="t-lede mt-4 text-ink-soft">We couldn&rsquo;t load it just now. Please try again in a few minutes.</p>
      <p className="mt-8"><Link href="/shop" className="btn">Browse the guides</Link></p>
    </div>
  );
}
