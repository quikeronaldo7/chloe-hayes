import type { Policy } from "@/lib/policies";

/** One published store policy, with no placeholder notices. */
export function PolicyBody({ policy }: { policy: Policy }) {
  return (
    <div className="prose-chloe">
      <ul>
        {policy.facts.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>

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
