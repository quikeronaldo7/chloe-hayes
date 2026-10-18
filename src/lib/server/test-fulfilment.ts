import "server-only";

/**
 * TEST FULFILMENT
 *
 * While the final customer files are being revised, test orders can be fulfilled
 * with placeholder PDFs stamped "TEST PLACEHOLDER — NOT FOR CUSTOMERS".
 *
 * Placeholders exist only when ALL of these hold at request time:
 *   1. STRIPE_SECRET_KEY is a test key (starts with "sk_test_")
 *   2. the Vercel environment is not production (VERCEL_ENV !== "production")
 *   3. CHLOE_TEST_COMMERCE === "true" (the same switch that turns on test prices)
 * and, per order, the Checkout Session is a Stripe test-mode session
 * (livemode false, id "cs_test_…"). A live-mode payment can never receive one,
 * and a local demo order (no Stripe at all) never receives one either.
 */

export interface TestFulfilmentConditions {
  stripeTestKey: boolean;
  notVercelProduction: boolean;
  explicitlyAllowed: boolean;
}

export function testFulfilmentConditions(env: Record<string, string | undefined> = process.env): TestFulfilmentConditions {
  return {
    stripeTestKey: (env.STRIPE_SECRET_KEY ?? "").startsWith("sk_test_"),
    notVercelProduction: env.VERCEL_ENV !== "production",
    explicitlyAllowed: env.CHLOE_TEST_COMMERCE === "true",
  };
}

export function testFulfilmentEnabled(env: Record<string, string | undefined> = process.env): boolean {
  const c = testFulfilmentConditions(env);
  return c.stripeTestKey && c.notVercelProduction && c.explicitlyAllowed;
}

/** Order-level gate: the environment allows it AND the order itself is a Stripe test-mode order. */
export function placeholdersAllowedFor(
  order: { id: string; livemode?: boolean; demo?: boolean },
  env: Record<string, string | undefined> = process.env,
): boolean {
  return testFulfilmentEnabled(env) && order.livemode === false && !order.demo && order.id.startsWith("cs_test_");
}

export const PLACEHOLDER_STAMP = "TEST PLACEHOLDER — NOT FOR CUSTOMERS";

// --- Placeholder PDF ----------------------------------------------------------
// A one-page PDF written by hand (Helvetica, WinAnsi), so no dependency and no
// stored file: it is generated per request and can't be mistaken for a product.

const winAnsi: Record<string, number> = { "—": 0x97, "–": 0x96, "’": 0x92, "‘": 0x91, "“": 0x93, "”": 0x94, "·": 0xb7, "…": 0x85 };

function pdfString(text: string): string {
  let out = "";
  for (const ch of text) {
    const code = winAnsi[ch] ?? ch.codePointAt(0)!;
    if (ch === "(" || ch === ")" || ch === "\\") out += "\\" + ch;
    else if (code >= 0x20 && code < 0x7f) out += ch;
    else if (code <= 0xff) out += "\\" + code.toString(8).padStart(3, "0");
    else out += "?";
  }
  return `(${out})`;
}

export function placeholderPdf(input: { productTitle: string; fileLabel: string; orderId: string }): Buffer {
  const lines: [size: number, y: number, text: string, red?: boolean][] = [
    [20, 700, PLACEHOLDER_STAMP, true],
    [16, 640, input.productTitle],
    [12, 616, `Stands in for: ${input.fileLabel}`],
    [11, 580, "This is not the product. The final customer file has not been approved yet."],
    [11, 562, "Generated only for Stripe test-mode orders on a non-production deployment."],
    [9, 520, `Test order ${input.orderId.slice(0, 24)}…  ·  ${new Date().toISOString()}`],
    [20, 120, PLACEHOLDER_STAMP, true],
  ];
  const content = lines
    .map(([size, y, text, red]) => `${red ? "0.49 0.18 0.2 rg" : "0.12 0.11 0.09 rg"} BT /F1 ${size} Tf 56 ${y} Td ${pdfString(text)} Tj ET`)
    .join("\n");

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>",
    `<< /Length ${Buffer.byteLength(content, "latin1")} >>\nstream\n${content}\nendstream`,
  ];

  let pdf = "%PDF-1.4\n%\xe2\xe3\xcf\xd3\n";
  const offsets: number[] = [];
  objects.forEach((body, i) => {
    offsets.push(Buffer.byteLength(pdf, "latin1"));
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xref = Buffer.byteLength(pdf, "latin1");
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.map((o) => `${String(o).padStart(10, "0")} 00000 n \n`).join("");
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(pdf, "latin1");
}
