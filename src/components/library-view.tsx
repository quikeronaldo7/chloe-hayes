import type { LibraryFile, LibraryItem } from "@/lib/server/library";
import { getProduct } from "@/catalogue";
import { Cover } from "./cover";
import { DownloadLink } from "./download-link";
import { SupportNote } from "./support";

/** The customer's library: every guide they own, together, with fresh download links. */
export function LibraryView({ items }: { items: LibraryItem[] }) {
  return (
    <ul className="grid gap-4">
      {items.map(({ product, files, note }) => {
        const full = getProduct(product.id)!;
        return (
          <li key={product.id} className="card p-5 sm:p-6">
            <div className="grid grid-cols-[4.5rem_1fr] items-center gap-4 sm:grid-cols-[6rem_1fr] sm:gap-6">
              <Cover product={full} sizes="96px" />
              <div className="min-w-0">
                <p className="t-eyebrow text-terracotta">
                  {product.specs.pages} pages · {product.specs.edition}
                </p>
                <h3 className="mt-1.5 font-serif text-[1.2rem] leading-snug sm:text-[1.3rem]">{product.title}</h3>
                {note ? <p className="mt-2 t-small text-muted">{note}</p> : null}
              </div>
            </div>
            <FileList id={product.id} files={files} />
          </li>
        );
      })}
    </ul>
  );
}

function FileList({ id, files }: { id: string; files: LibraryFile[] }) {
  return (
    <ul className="mt-4 flex flex-col gap-2">
      {files.map((f, i) =>
        f.href ? (
          <li key={f.href}>
            <DownloadLink href={f.href} productId={id} format={f.format}>
              <span className={`chip shrink-0 ${f.state === "placeholder" ? "bg-sun/50 text-ink" : "bg-forest text-paper"}`}>{f.state === "placeholder" ? "Test" : f.format}</span>
              <span className="min-w-0 flex-1 font-medium leading-snug">{f.label}</span>
              <span className="shrink-0 font-semibold text-terracotta">Download ↓</span>
            </DownloadLink>
          </li>
        ) : (
          <li key={`${id}-${i}`} className="rounded-xl border border-dashed border-line-strong px-4 py-3 text-ink-soft">
            <span className="font-medium">{f.label}</span>
            <span className="mt-1 block t-small">
              This download isn&rsquo;t ready yet. Nothing is wrong with your order. Please <SupportNote /> and we&rsquo;ll make sure you get it.
            </span>
          </li>
        ),
      )}
    </ul>
  );
}

export function LibraryNote() {
  return (
    <aside className="mt-12 rounded-[var(--radius-card)] bg-sage/70 p-6 sm:p-8">
      <p className="font-serif text-xl leading-snug text-forest-deep text-pretty" style={{ fontVariationSettings: '"SOFT" 100' }}>
        Save the PDFs to your phone so they&rsquo;re with you when you&rsquo;re out. For the fill-in pages, open them in Adobe Acrobat Reader, type
        away and hit save.
      </p>
      <p className="mt-3 t-small text-forest">Something not right? Please <SupportNote />.</p>
      <p className="mt-4 font-serif italic text-terracotta-deep" style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1' }}>
        Have the best time out there. Chloe
      </p>
    </aside>
  );
}
