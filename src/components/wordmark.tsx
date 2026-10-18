import { Cactus } from "./cover";

/** "Chloe in Austin" with a small cactus: the site's mark. */
export function Wordmark({ light = false, size = "md" }: { light?: boolean; size?: "md" | "lg" }) {
  const big = size === "lg";
  return (
    <span className={`inline-flex items-center gap-2 ${light ? "text-paper" : "text-ink"}`}>
      <span className={`grid shrink-0 place-items-center rounded-full ${light ? "bg-paper text-forest" : "bg-forest text-paper"} ${big ? "h-12 w-12" : "h-9 w-9"}`}>
        <svg aria-hidden viewBox="0 0 120 120" className={big ? "h-7 w-7" : "h-5 w-5"}>
          <Cactus />
        </svg>
      </span>
      <span className={`font-serif leading-none tracking-[-0.02em] ${big ? "text-[2.1rem]" : "text-[1.25rem] xs:text-[1.35rem] sm:text-[1.5rem]"}`} style={{ fontVariationSettings: '"SOFT" 100' }}>
        Chloe <span className={`italic ${light ? "text-sun" : "text-terracotta"}`} style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1' }}>in</span> Austin
      </span>
    </span>
  );
}
