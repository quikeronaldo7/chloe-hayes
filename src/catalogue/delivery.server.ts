import "server-only";

/**
 * DELIVERY MANIFEST (server-only): what a customer of each guide receives.
 *
 * Chloe's files live in her own private bucket (`chloe-hayes-products`, Cloudflare
 * R2), never Kate's, never /public, never a Drive link. Bundles expand to their
 * guides, so they have no entry here.
 *
 *  "final": locked to the exact approved artifact. The SHA-256 is the authoritative
 *     lock: the storage key contains its first 12 hex characters, the download
 *     route re-verifies size + hash before handing out a 5-minute signed URL, and
 *     `npm run verify:delivery` re-hashes every locked file.
 *
 *  "pending": the FINAL file is identified (Drive id, size, modified time) but its
 *     exact bytes haven't been retrieved and hashed yet. The Drive connector caps
 *     transfers at 10 MB, and these PDFs are 9.5–24 MB. Nothing pending is ever
 *     delivered to a real customer: the library shows a support state. Stripe
 *     *test* orders on a non-production deployment with ALLOW_TEST_FULFILMENT=true
 *     receive a stamped placeholder instead (see lib/server/test-fulfilment.ts).
 *
 * To lock a pending file: download it, `npm run storage:hash -- <file>`, upload to
 * the key printed, paste the lock here. docs/DELIVERY.md has the exact steps.
 */

export type FileFormat = "PDF";

export interface DriveSource {
  fileId: string;
  modifiedTime: string;
  name: string;
}

export interface ExpectedFile {
  label: string;
  format: FileFormat;
  /** The FINAL file as identified in Drive (size from Drive metadata), not yet hashed. */
  approvedSource: DriveSource & { bytes: number };
}

export interface LockedFile {
  label: string;
  format: FileFormat;
  /** Object key in private storage. Must contain the first 12 hex chars of `sha256`. */
  key: string;
  /** Exact filename the customer's download is saved as. */
  filename: string;
  sha256: string;
  bytes: number;
  source: DriveSource;
}

export interface PendingDelivery {
  status: "pending";
  expected: ExpectedFile[];
  blocker: string;
  note?: string;
}

export interface FinalDelivery {
  status: "final";
  approved: { by: string; on: string; instruction: string };
  files: LockedFile[];
  note?: string;
}

export type Delivery = PendingDelivery | FinalDelivery;

const MASTER_BRIEF: FinalDelivery["approved"] = {
  by: "Owner (QR DIGITAL)",
  on: "2026-10-18",
  instruction: "Master implementation prompt, 18 Oct 2026: the seven products already exist; use the actual final PDF files linked in Part 5.",
};

const TOO_LARGE = "Over the Drive connector's 10 MB transfer limit: bytes not yet retrieved and hashed (docs/DELIVERY.md).";

const pending = (label: string, fileId: string, name: string, modifiedTime: string, bytes: number, blocker = TOO_LARGE): PendingDelivery => ({
  status: "pending",
  expected: [{ label, format: "PDF", approvedSource: { fileId, name, modifiedTime, bytes } }],
  blocker,
});

export const delivery: Record<string, Delivery> = {
  "cia-new-to-austin": pending(
    "New to Austin: The Ultimate Guide (interactive PDF)",
    "1ubUyPipbj7mEWqmDxNarJVaYAzMuB1l8",
    "Chloe-New-to-Austin-Ultimate-Guide_FINAL.pdf",
    "2026-10-18T05:56:04.263Z",
    15058167,
  ),
  "cia-dinner-spots": pending(
    "Chloe's 10 Best Dinner Spots in Austin (interactive PDF)",
    "18zwRX8Ok1pqkQAUHv7j3wldF1JcxeQpq",
    "Chloes_10_Best_Dinner_Spots_in_Austin_FINAL_INTERACTIVE.pdf",
    "2026-10-15T03:38:22.093Z",
    11441931,
  ),
  "cia-being-single": pending(
    "Chloe's Guide to Being Single in Austin (PDF)",
    "1_rLeVFi1Xpyb4nsOKGNuaHhf8QngaIx8",
    "Chloes_Guide_to_Being_Single_in_Austin_FINAL_v3.pdf",
    "2026-10-15T04:04:54.988Z",
    9534247,
    "9.5 MB: under the connector's stated limit, but the transfer failed twice (response too large). Retrieve directly (docs/DELIVERY.md).",
  ),
  "cia-date-ideas": pending(
    "Chloe's 12 Best Date Ideas in Austin (PDF)",
    "1LZeLIhChmKPSLiCLBLSWW57q9Qw43sLe",
    "Chloe-12-Best-Date-Ideas-in-Austin_FINAL.pdf",
    "2026-10-16T09:43:53.475Z",
    12804695,
  ),
  "cia-natural-gems": pending(
    "Chloe's 5 Natural Gems Around Austin (PDF)",
    "1m3A-rpDnDaeyY6L51q_IqA_5QjoRm4k-",
    "Chloes_5_Natural_Gems_Around_Austin_FINAL_LINKED.pdf",
    "2026-10-15T03:34:20.656Z",
    24337775,
  ),
  "cia-hill-country": {
    status: "final",
    approved: MASTER_BRIEF,
    files: [
      {
        label: "Chloe's Perfect Hill Country Escapes (PDF)",
        format: "PDF",
        key: "guides/hill-country-escapes.0ed03d3676bc.pdf",
        filename: "Chloe's Perfect Hill Country Escapes.pdf",
        sha256: "0ed03d3676bc1c920eeaa4bbd0c5a20983481063471759b980a3653ee6d92eb3",
        bytes: 3178454,
        source: { fileId: "1KSd7g3SeFlOM-tzMqbpo8svVNvV5lw0A", modifiedTime: "2026-10-15T03:32:43.930Z", name: "Chloes_Perfect_Hill_Country_Escapes_FINAL.pdf" },
      },
    ],
  },
  "cia-exclusive": pending(
    "Chloe's 10 Most Exclusive Experiences in Austin (interactive PDF)",
    "1g5bPgQR1vlzzlWFwFK4zDuZ9mpLssJPq",
    "Chloe-10-Most-Exclusive-Experiences-in-Austin_FINAL.pdf",
    "2026-10-17T08:23:59.404Z",
    10513766,
    "Over the 10 MB transfer limit. Also: a second FINAL.pdf with a different size (10,361,297 bytes, id 1rUu3uX9W8KHYE-fUq3W6jBMnYzZqAFFZ) sits in '04 — Layout & Final PDF'. The brief links this one; confirm which is master.",
  ),
};

export function deliveryFor(id: string): Delivery | undefined {
  return delivery[id];
}

export function isDeliveryFinal(id: string): boolean {
  return delivery[id]?.status === "final";
}
