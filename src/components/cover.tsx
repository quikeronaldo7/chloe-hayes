import Image from "next/image";
import type { Product } from "@/catalogue";

const tones = {
  forest: { bg: "bg-forest", text: "text-paper", kicker: "text-sun", sticker: "bg-terracotta text-white", foot: "text-paper/70" },
  terracotta: { bg: "bg-terracotta", text: "text-paper", kicker: "text-blush", sticker: "bg-paper text-terracotta-deep", foot: "text-paper/75" },
  cream: { bg: "bg-card", text: "text-ink", kicker: "text-terracotta", sticker: "bg-forest text-paper", foot: "text-muted" },
  night: { bg: "bg-night", text: "text-paper", kicker: "text-sun", sticker: "bg-terracotta text-white", foot: "text-paper/60" },
  sage: { bg: "bg-sage", text: "text-forest-deep", kicker: "text-terracotta-deep", sticker: "bg-forest text-paper", foot: "text-forest/70" },
} as const;

const fade = { forest: "#24453a", terracotta: "#9d472d", cream: "#fffbf4", night: "#1d1a1c", sage: "#dbe3d0" } as const;

/**
 * A guide cover. "pdf" and "approved" covers are the real artwork; "typeset" covers are
 * set here in the guides' own design language (Fraunces title, kicker line, count sticker)
 * where the real cover couldn't be exported or isn't cleared. See docs/IMAGERY.md.
 */
export function Cover({ product, sizes = "(min-width: 1024px) 22vw, 45vw", priority = false }: { product: Product; sizes?: string; priority?: boolean }) {
  const c = product.cover;
  if (c.kind !== "typeset" && c.image) {
    return (
      <div className="cover bg-paper-deep">
        <Image src={c.image.src} alt={c.image.alt} fill sizes={sizes} priority={priority} className="object-cover" style={{ objectPosition: c.image.focus }} />
      </div>
    );
  }
  const t = tones[c.tone ?? "cream"];
  const lines = c.lines ?? [product.shortTitle];
  const [small, ...big] = lines.length > 1 ? lines : ["", ...lines];
  return (
    <div className={`cover grain ${t.bg} ${t.text}`} role="img" aria-label={`Cover: ${product.title}`}>
      {c.photo ? (
        <div className="absolute inset-x-0 bottom-0 h-1/2">
          <Image src={c.photo.src} alt="" fill sizes={sizes} className="object-cover" style={{ objectPosition: c.photo.focus }} />
          <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, ${fade[c.tone ?? "cream"]}, transparent 16%)` }} />
        </div>
      ) : null}
      <div className="tc">
        <div className="flex items-start justify-between gap-2">
          <p className={`tc-kicker ${t.kicker}`}>Chloe Hayes</p>
          {c.count ? (
            <span className={`sticker tc-count ${t.sticker}`}>
              <span>
                <b>{c.count}</b>
                {c.countLabel}
              </span>
            </span>
          ) : null}
        </div>
        <p className={`tc-title mt-[5cqi]`}>
          {small ? <span className="sm">{small}</span> : null}
          {big.map((l) => (
            <span key={l} className="lg">
              {l}
            </span>
          ))}
        </p>
        {!c.photo ? (
          <>
            <svg aria-hidden viewBox="0 0 120 120" className="mt-auto ml-auto h-[30cqi] w-[30cqi] opacity-25">
              <Cactus />
            </svg>
            <p className={`tc-foot mt-[4cqi] ${t.foot}`}>A Chloe Hayes city guide · Austin, Texas</p>
          </>
        ) : (
          <p className={`tc-foot mt-[3cqi] ${t.foot}`}>Austin, Texas</p>
        )}
      </div>
    </div>
  );
}

export function CoverThumb({ product }: { product: Product }) {
  return <Cover product={product} sizes="64px" />;
}

/** The little cactus mark, drawn once and reused. */
export function Cactus() {
  return (
    <g fill="currentColor">
      <path d="M52 112V30c0-6 4-11 8-11s8 5 8 11v82z" />
      <path d="M52 74H38c-6 0-10-5-10-11V44c0-4 3-7 6-7s6 3 6 7v18h12z" />
      <path d="M68 62h12V38c0-4 3-7 6-7s6 3 6 7v21c0 7-5 12-11 12H68z" />
    </g>
  );
}
