"use client";

import Link from "next/link";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="wrap section">
      <p className="t-eyebrow text-terracotta">Something went wrong</p>
      <h1 className="t-h1 mt-4 max-w-2xl text-balance">That page didn&rsquo;t load properly.</h1>
      <p className="t-lede mt-6 max-w-lg text-ink-soft">
        Please try again. If you&rsquo;ve just bought a guide, your library link can be resent from the{" "}
        <Link href="/help#resend" className="link-quiet font-semibold">Help page</Link>.
      </p>
      <div className="mt-10 flex flex-wrap gap-3">
        <button type="button" onClick={reset} className="btn">Try again</button>
        <Link href="/" className="btn btn-outline">Back home</Link>
      </div>
    </div>
  );
}
