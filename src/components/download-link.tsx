"use client";

import { track } from "@/lib/analytics";

export function DownloadLink({ href, productId, format, children }: { href: string; productId: string; format: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 rounded-xl border border-line bg-paper px-3 py-3 transition-colors hover:border-ink sm:px-4"
      onClick={() => track("download_clicked", { product_id: productId, format })}
    >
      {children}
    </a>
  );
}
