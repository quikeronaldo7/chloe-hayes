"use client";

import { useState } from "react";
import { RESEND_ACKNOWLEDGEMENT } from "@/lib/resend-copy";

export function ResendForm() {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    setError("");
    const email = new FormData(e.currentTarget).get("email");
    try {
      const res = await fetch("/api/resend-library", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      if (res.ok) {
        setState("done");
        return;
      }
      setState("error");
      setError(((await res.json().catch(() => ({}))) as { error?: string }).error ?? "Something went wrong. Please try again.");
    } catch {
      setState("error");
      setError("We couldn't reach the site. Check your connection and try again.");
    }
  }

  if (state === "done") {
    return (
      <div role="status" className="rounded-xl bg-sage/70 p-5">
        <p className="font-serif text-xl">{RESEND_ACKNOWLEDGEMENT.title}</p>
        <p className="mt-2 t-small text-forest">{RESEND_ACKNOWLEDGEMENT.body}</p>
      </div>
    );
  }
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <label htmlFor="resend-email" className="sr-only">
        Email used at checkout
      </label>
      <input
        id="resend-email"
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder="The email you used at checkout"
        className="min-h-12 flex-1 rounded-full border border-line-strong bg-card px-5 text-base placeholder:text-muted focus:outline-none focus-visible:outline-2 focus-visible:outline-terracotta"
      />
      <button type="submit" className="btn" disabled={state === "sending"}>
        {state === "sending" ? "Sending…" : "Email my links"}
      </button>
      {state === "error" ? (
        <p role="alert" className="text-sm text-terracotta-deep sm:basis-full">
          {error}
        </p>
      ) : null}
    </form>
  );
}
