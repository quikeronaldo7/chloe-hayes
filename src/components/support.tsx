import Link from "next/link";
import { siteConfig } from "@/lib/config";

/**
 * "How to get help", saying only what exists: the support inbox once one is configured
 * (NEXT_PUBLIC_SUPPORT_EMAIL), otherwise the self-service resend form.
 */
export function SupportNote() {
  return siteConfig.supportEmail ? (
    <>
      email{" "}
      <a href={`mailto:${siteConfig.supportEmail}`} className="link-quiet font-semibold">
        {siteConfig.supportEmail}
      </a>
    </>
  ) : (
    <>
      use{" "}
      <Link href="/help#resend" className="link-quiet font-semibold">
        Resend my downloads
      </Link>{" "}
      on the Help page
    </>
  );
}
