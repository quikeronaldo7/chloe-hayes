import "server-only";
import { siteConfig } from "@/lib/config";

/**
 * Email adapter (Resend HTTP API).
 *
 * `sendEmail` reports exactly what happened:
 *   accepted  Resend returned 2xx with an email id. Accepted for delivery, not proof
 *             it reached an inbox.
 *   skipped   RESEND_API_KEY or EMAIL_FROM is missing. Nothing was sent. In local
 *             development the message is printed to the console; that never counts
 *             as sent.
 *   failed    network error, timeout, non-2xx or an unusable response. `retryable`
 *             says whether trying again later could help.
 * Logs carry status codes and Resend's error name only: never the message body,
 * signed links, recipients or keys.
 */

type Env = Record<string, string | undefined>;

interface Email {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export type SendResult =
  | { status: "accepted"; id: string }
  | { status: "skipped"; reason: "unconfigured" }
  | { status: "failed"; reason: string; httpStatus?: number; retryable: boolean };

const RESEND_API = "https://api.resend.com";
const TIMEOUT_MS = 10_000;

/** Both are required: the key, and a sender on a domain verified in Resend (never a Gmail address). */
export function emailConfigured(env: Env = process.env): boolean {
  return Boolean(env.RESEND_API_KEY && env.EMAIL_FROM);
}

export async function sendEmail(email: Email, opts: { idempotencyKey?: string; env?: Env } = {}): Promise<SendResult> {
  const env = opts.env ?? process.env;
  if (!emailConfigured(env)) {
    if (env.NODE_ENV === "development") console.info(`[email:not-sent] Email isn't configured. Would send "${email.subject}":\n${email.text}`);
    else console.warn("[email] skipped: RESEND_API_KEY and EMAIL_FROM must both be set");
    return { status: "skipped", reason: "unconfigured" };
  }
  let res: Response;
  try {
    res = await fetch(`${RESEND_API}/emails`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
        // Same key + same payload within 24 hours: Resend returns the original result instead of sending again.
        ...(opts.idempotencyKey ? { "Idempotency-Key": opts.idempotencyKey } : {}),
      },
      body: JSON.stringify({ from: env.EMAIL_FROM, to: [email.to], subject: email.subject, html: email.html, text: email.text, ...(siteConfig.supportEmail ? { reply_to: siteConfig.supportEmail } : {}) }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (err) {
    const reason = err instanceof Error && err.name === "TimeoutError" ? "timeout" : "network-error";
    console.error(`[email] send failed: ${reason}`);
    return { status: "failed", reason, retryable: true };
  }
  const body = (await res.json().catch(() => null)) as { id?: unknown; name?: unknown } | null;
  if (!res.ok) {
    const name = typeof body?.name === "string" ? body.name : "unknown";
    // 409 concurrent_idempotent_requests: the same send is still in flight. 429/5xx: try later.
    const retryable = res.status === 409 || res.status === 429 || res.status >= 500;
    console.error(`[email] send failed: HTTP ${res.status} ${name}`);
    return { status: "failed", reason: name, httpStatus: res.status, retryable };
  }
  if (typeof body?.id !== "string" || !body.id) {
    console.error(`[email] send failed: HTTP ${res.status} without an email id`);
    return { status: "failed", reason: "invalid-response", httpStatus: res.status, retryable: true };
  }
  return { status: "accepted", id: body.id };
}

// --- Templates ---------------------------------------------------------------
// Chloe in Austin: cream paper, forest green, terracotta, matching the guides.

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

const C = { paper: "#F7F1E6", card: "#FFFBF4", ink: "#2A2420", soft: "#5E544B", line: "#E6D9C4", forest: "#24453A", terracotta: "#B9573A" };

/** How customers get help, stated only as far as it really exists. */
function helpLine(helpUrl: string | null): string {
  const page = helpUrl ? `<a href="${helpUrl}" style="color:${C.terracotta}">Help page</a>` : "Help page";
  return siteConfig.supportEmail
    ? `Questions? Reply to this email or write to ${esc(siteConfig.supportEmail)}.`
    : `Lost this email or need a fresh link? Use &ldquo;Resend my downloads&rdquo; on the ${page}.`;
}

function layout(body: string, helpUrl: string | null): string {
  return `<!doctype html><html><body style="margin:0;background:${C.paper};padding:32px 14px;font-family:Georgia,'Times New Roman',serif;color:${C.ink}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:${C.card};border:1px solid ${C.line};border-radius:14px;overflow:hidden">
<tr><td style="background:${C.forest};padding:22px 32px;color:${C.paper};font:600 13px/1 Helvetica,Arial,sans-serif;letter-spacing:.22em;text-transform:uppercase">Chloe in Austin <span style="color:#E9B98F">&#10022;</span></td></tr>
<tr><td style="padding:32px 32px 36px;font-size:17px;line-height:1.6">${body}</td></tr>
</table>
<p style="max-width:560px;margin:20px auto 0;text-align:center;font:12px/1.6 Helvetica,Arial,sans-serif;color:${C.soft}">${helpLine(helpUrl)}</p>
</body></html>`;
}

const button = (href: string, label: string) =>
  `<p style="margin:28px 0;text-align:center"><a href="${href}" style="display:inline-block;background:${C.terracotta};color:#fff;text-decoration:none;padding:14px 28px;border-radius:999px;font:600 14px Helvetica,Arial,sans-serif;letter-spacing:.04em">${label}</a></p>`;

export function purchaseEmail(args: { name?: string; titles: string[]; libraryUrl: string; helpUrl?: string | null; testOrder?: boolean }) {
  const hello = args.name ? `Hi ${esc(args.name.split(" ")[0])},` : "Hi there,";
  const one = args.titles.length === 1;
  const list = args.titles.map((t) => `<li style="margin:6px 0">${esc(t)}</li>`).join("");
  const test = args.testOrder
    ? `<p style="margin:0 0 20px;padding:10px 14px;background:#FDECC8;border-radius:8px;font:13px/1.5 Helvetica,Arial,sans-serif">Test order (Stripe test mode). No real payment was taken.</p>`
    : "";
  const help = args.helpUrl ?? null;
  return {
    subject: one ? `Your copy of ${args.titles[0]}` : "Your Chloe in Austin guides",
    html: layout(
      `${test}<p style="margin-top:0">${hello}</p>
<p>Thank you so much. ${one ? "Your guide is" : "Your guides are"} ready and waiting:</p>
<ul style="padding-left:20px">${list}</ul>
${button(args.libraryUrl, "Open my library")}
<p><strong style="font-family:Helvetica,Arial,sans-serif;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:${C.forest}">How to download</strong><br>
Open your library and tap <em>Download</em> next to each guide. Save the PDF to your phone or computer so it&rsquo;s always with you, links and all.</p>
<p>Some guides have fill-in pages. They work best in Adobe Acrobat Reader: type, save, and your notes stay with the file.</p>
<p>Your library link is private and works for a year, so keep this email somewhere safe. The download buttons inside refresh every time you open it.</p>
<p>Austin moves fast, so give a reservation or opening time a quick check on the official link before you go.</p>
<p style="margin-bottom:0">Have the best time out there.<br><span style="font-style:italic;color:${C.terracotta}">Chloe</span></p>`,
      help,
    ),
    text: `${args.testOrder ? "TEST ORDER (Stripe test mode). No real payment was taken.\n\n" : ""}${hello}

Thank you so much. ${one ? "Your guide is" : "Your guides are"} ready:
${args.titles.map((t) => `- ${t}`).join("\n")}

Open your library: ${args.libraryUrl}

How to download: open your library and tap Download next to each guide. Save the PDF to your phone or computer. Fill-in pages work best in Adobe Acrobat Reader.

Your library link is private and works for a year, so keep this email. ${siteConfig.supportEmail ? `Questions? Write to ${siteConfig.supportEmail}.` : `Need a fresh link? Use "Resend my downloads" on the Help page${help ? `: ${help}` : ""}.`}

Have the best time out there.
Chloe`,
  };
}

export function resendEmail(links: { titles: string[]; url: string }[], helpUrl: string | null = null) {
  const items = links
    .map((l) => `<p style="margin:16px 0"><a href="${l.url}" style="color:${C.terracotta};font-weight:bold">${esc(l.titles.join(", "))}</a></p>`)
    .join("");
  return {
    subject: "Your Chloe in Austin library links",
    html: layout(`<p style="margin-top:0">Hi there,</p><p>Here are fresh links to your guides:</p>${items}<p>Each link works for a year from today. You can ask for new ones on the Help page any time.</p><p style="margin-bottom:0"><span style="font-style:italic;color:${C.terracotta}">Chloe</span></p>`, helpUrl),
    text: `Hi there,\n\nHere are fresh links to your guides:\n\n${links.map((l) => `${l.titles.join(", ")}\n${l.url}`).join("\n\n")}\n\nEach link works for a year from today. You can ask for new ones on the Help page any time.\n\nChloe`,
  };
}
