import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap section">
      <p className="t-eyebrow text-terracotta">404</p>
      <h1 className="t-display mt-4 max-w-3xl text-balance">
        Wrong turn. <span className="accent-italic">Happens on I-35 too.</span>
      </h1>
      <p className="t-lede mt-6 max-w-lg text-ink-soft">That page isn&rsquo;t here. The guides are, though.</p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/" className="btn">Back home</Link>
        <Link href="/shop" className="btn btn-outline">Browse the guides</Link>
      </div>
    </div>
  );
}
