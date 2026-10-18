import Link from "next/link";
import { JsonLd } from "./json-ld";
import { absoluteUrl } from "@/lib/config";

export function Breadcrumbs({ items }: { items: { label: string; href: string }[] }) {
  return (
    <>
      <nav aria-label="Breadcrumb" className="text-[0.8rem] font-semibold text-muted">
        <ol className="flex flex-wrap items-center gap-2">
          {items.map((item, i) => (
            <li key={item.href} className="flex items-center gap-2">
              {i < items.length - 1 ? (
                <>
                  <Link href={item.href} className="link-quiet">
                    {item.label}
                  </Link>
                  <span aria-hidden>/</span>
                </>
              ) : (
                <span aria-current="page" className="text-ink">
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: items.map((item, i) => ({ "@type": "ListItem", position: i + 1, name: item.label, item: absoluteUrl(item.href) })),
        }}
      />
    </>
  );
}
