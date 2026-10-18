import Image from "next/image";

/**
 * The logo system, from the approved Western Badge direction (Drive: "Chloe in Austin —
 * Western Badge Logo Concept v2", Revision Round 2, 18 Oct 2026):
 *  - Wordmark: compact mark (hat + cactus, /brand/chloe-mark.svg) + live "Chloe in Austin" type. Header.
 *  - Badge: the full approved badge artwork. Footer and larger brand moments.
 *  - Favicon / app icon: the compact mark alone (src/app/icon.svg, apple-icon.png).
 */
export function Wordmark({ light = false }: { light?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 ${light ? "text-paper" : "text-ink"}`}>
      <Image src="/brand/chloe-mark.svg" alt="" width={40} height={40} className="h-9 w-9 shrink-0 sm:h-10 sm:w-10" priority unoptimized />
      <span className="font-serif text-[1.25rem] leading-none tracking-[-0.02em] xs:text-[1.35rem] sm:text-[1.5rem]" style={{ fontVariationSettings: '"SOFT" 100' }}>
        Chloe <span className={`italic ${light ? "text-sun" : "text-terracotta"}`} style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1' }}>in</span> Austin
      </span>
    </span>
  );
}

/** The full badge. Decorative next to a text name, so pass `alt` only where it stands alone. */
export function Badge({ className = "", alt = "Chloe in Austin" }: { className?: string; alt?: string }) {
  return <Image src="/brand/chloe-in-austin-badge.png" alt={alt} width={800} height={799} sizes="(min-width: 640px) 13rem, 11rem" className={`h-auto ${className}`} />;
}
