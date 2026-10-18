import type { Metadata } from "next";
import Link from "next/link";
import { getProductBySlug } from "@/catalogue";
import { OpenBagButton } from "@/components/cart";
import { Cover } from "@/components/cover";

export const metadata: Metadata = { title: "Checkout cancelled", robots: { index: false } };

export default async function CancelledPage({ searchParams }: PageProps<"/checkout/cancelled">) {
  const { guide, from } = await searchParams;
  const product = typeof guide === "string" ? getProductBySlug(guide) : undefined;
  const fromBag = from === "bag";

  return (
    <div className="wrap section grid items-center gap-12 md:grid-cols-12">
      <div className="md:col-span-7">
        <p className="t-eyebrow text-terracotta">Checkout closed</p>
        <h1 className="t-h1 mt-3 text-balance">No worries. No payment was taken.</h1>
        <p className="t-lede mt-5 max-w-lg text-ink-soft">
          {product ? `${product.title} is right here whenever you're ready.` : fromBag ? "Your bag is exactly as you left it." : "Everything is still here whenever you're ready."}
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          {product ? (
            <Link href={`/guides/${product.slug}`} className="btn">
              Back to {product.shortTitle}
            </Link>
          ) : fromBag ? (
            <OpenBagButton className="btn" />
          ) : null}
          <Link href="/shop" className="btn btn-outline">
            Browse the guides
          </Link>
        </div>
        <p className="mt-6 t-small text-muted">
          Had a problem paying? Card declines and expired sessions are the usual culprits. Try again, or another card. Questions first? The{" "}
          <Link href="/help" className="link-quiet font-semibold">
            Help page
          </Link>{" "}
          covers how buying works.
        </p>
      </div>
      {product ? (
        <div className="mx-auto w-[60%] max-w-xs md:col-span-4 md:col-start-9 md:w-full">
          <Cover product={product} sizes="320px" />
        </div>
      ) : null}
    </div>
  );
}
