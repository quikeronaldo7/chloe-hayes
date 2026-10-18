"use client";

import { useEffect } from "react";
import { track, type AnalyticsEvent } from "@/lib/analytics";

/** Fires one analytics event when mounted (e.g. product_viewed on a product page). */
export function TrackOnMount({ event, props }: { event: AnalyticsEvent; props?: Record<string, string | number | boolean | undefined> }) {
  const key = JSON.stringify(props);
  useEffect(() => {
    track(event, props);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, key]);
  return null;
}
