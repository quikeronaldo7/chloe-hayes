import { getProduct } from "@/catalogue";
import { deliverablesFor, logDeliveryFailure, orderDownloadKeys } from "@/lib/server/library";
import { getOrder } from "@/lib/server/orders";
import { redirectToPath } from "@/lib/server/origin";
import { storefrontOpen } from "@/lib/storefront";
import { attachmentHeader, fetchPrivateFile } from "@/lib/server/storage";
import { placeholderPdf } from "@/lib/server/test-fulfilment";
import { readDownloadToken } from "@/lib/server/tokens";

/**
 * GET /api/download/<signed token>
 * Verifies the short-lived token, re-checks the order is still paid (refunds
 * revoke access), then serves exactly the locked file for that product, a test
 * placeholder (test orders only), or the support page. Never a substitute.
 *
 * Every failure is a 303 to /download-unavailable with a *relative* Location, so the
 * browser stays on the host it asked: a deployed site can never bounce a customer to
 * localhost, whatever NEXT_PUBLIC_SITE_URL says.
 */
export async function GET(_req: Request, ctx: RouteContext<"/api/download/[token]">) {
  if (!storefrontOpen()) return redirectToPath("/download-unavailable");
  const { token } = await ctx.params;
  const claim = readDownloadToken(token);
  if (!claim) return redirectToPath("/download-unavailable?reason=expired");

  const order = await getOrder(claim.sessionId);
  if (!order) return redirectToPath("/download-unavailable?reason=unverified");
  if (order.status === "refunded") return redirectToPath("/download-unavailable?reason=refunded");
  if (order.status !== "paid") return redirectToPath("/download-unavailable?reason=unverified");
  if (!orderDownloadKeys(order).includes(claim.productId)) return redirectToPath("/download-unavailable?reason=unverified");

  const item = deliverablesFor(claim.productId, order)[claim.fileIndex];
  const failure = (reason: string, extra: Record<string, unknown> = {}) => {
    logDeliveryFailure(reason, { order: order.id, product: claim.productId, file: claim.fileIndex, ...extra });
    return redirectToPath("/download-unavailable");
  };
  if (!item || item.kind === "unavailable") return failure("no-approved-file");

  if (item.kind === "placeholder") {
    const title = getProduct(claim.productId)?.title ?? claim.productId;
    return fileResponse(placeholderPdf({ productTitle: title, fileLabel: item.label, orderId: order.id }), "application/pdf", `TEST PLACEHOLDER - ${title}.pdf`);
  }

  const { file } = item;
  let result;
  try {
    result = await fetchPrivateFile(file);
  } catch (err) {
    return failure("storage-error", { key: file.key, detail: err instanceof Error ? err.message : "unknown" });
  }
  switch (result.kind) {
    case "redirect": // the bucket object was verified against the lock first
      return new Response(null, { status: 302, headers: { Location: result.url, "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex" } });
    case "file": // local development; fetchPrivateFile has already checked bytes and SHA-256
      return fileResponse(result.body, result.contentType, file.filename);
    case "missing":
      return failure("missing-in-storage", { key: file.key });
    case "integrity":
      return failure("sha256-mismatch", { key: file.key, detail: result.detail });
    case "error":
      return failure("storage-error", { key: file.key, detail: result.detail });
  }
}

function fileResponse(body: Buffer, contentType: string, filename: string) {
  return new Response(new Uint8Array(body), {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": attachmentHeader(filename),
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
