"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

/** Fires purchase_completed once per order, even if the success page is reloaded. */
export function PurchaseTracker({ orderId, value, currency, items }: { orderId: string; value: number; currency: string; items: string }) {
  useEffect(() => {
    const key = `cia-purchase-${orderId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      /* storage unavailable: track anyway */
    }
    track("purchase_completed", { order_id: orderId, value, currency, items });
  }, [orderId, value, currency, items]);
  return null;
}
