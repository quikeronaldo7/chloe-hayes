import type { Policy } from "@/lib/policies";

/** One store policy: what already applies, then what the full text will add. */
export function PolicyBody({ policy }: { policy: Policy }) {
  return (
    <div className="prose-chloe">
      <ul>
        {policy.facts.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
      <p className="mt-5 rounded-xl border border-dashed border-line-strong bg-card px-4 py-3 t-small text-ink-soft">
        The full policy will be published here before the shop opens. It will also cover: {policy.covers.join("; ").toLowerCase()}.
      </p>
    </div>
  );
}

/** Small links to the policies, shown wherever someone can start checkout. */
export function PolicyLinks({ className = "" }: { className?: string }) {
  return (
    <p className={`text-xs text-muted ${className}`}>
      Before you buy: <a href="/help#terms-of-sale" className="underline underline-offset-2 hover:text-ink">Terms of Sale</a> ·{" "}
      <a href="/help#refunds" className="underline underline-offset-2 hover:text-ink">Refund &amp; Digital Product Policy</a> ·{" "}
      <a href="/help#privacy" className="underline underline-offset-2 hover:text-ink">Privacy</a>
    </p>
  );
}
