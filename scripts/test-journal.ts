/**
 * Content Studio journal integration tests (contract v1 fixtures). No network.
 *   npm run test:journal
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { StudioArticle } from "../src/lib/server/content-studio";
import { previewArticleId, verifyStudioSignature } from "../src/journal/studio-shared";
import { ArticleView } from "../src/journal/article-view";

let failed = 0;
let passed = 0;
const check = (name: string, ok: unknown, detail = "") => {
  if (ok) passed++;
  else {
    failed++;
    console.error(`✗ ${name}${detail ? ` (${detail})` : ""}`);
  }
};
const fixture = <T,>(name: string): T => JSON.parse(readFileSync(path.join(__dirname, "fixtures/content-studio", `${name}.json`), "utf8")) as T;

// Webhook signature (contract §11)
const hook = fixture<{ headers: Record<string, string>; body: unknown }>("revalidate-webhook");
const secret = "example-secret-do-not-use-0000000000000";
const raw = JSON.stringify(hook.body);
const t = Number(/t=(\d+)/.exec(hook.headers["X-QRV-Signature"])![1]) * 1000;
check("valid signature accepted", verifyStudioSignature(secret, raw, hook.headers["X-QRV-Signature"], t));
check("tampered body rejected", !verifyStudioSignature(secret, raw.replace("published", "unpublished"), hook.headers["X-QRV-Signature"], t));
check("wrong secret rejected", !verifyStudioSignature(secret.replace("0", "1"), raw, hook.headers["X-QRV-Signature"], t));
check("stale signature rejected", !verifyStudioSignature(secret, raw, hook.headers["X-QRV-Signature"], t + 301_000));
check("missing header rejected", !verifyStudioSignature(secret, raw, null, t));
check("short secret rejected", !verifyStudioSignature("short", raw, hook.headers["X-QRV-Signature"], t));

// Preview token parsing (the Studio verifies; the site only reads the article id)
const claims = Buffer.from(JSON.stringify({ brand: "chloe-in-austin", article: "42", exp: 1 })).toString("base64url");
check("preview id read", previewArticleId(`${claims}.sig`) === "42");
check("preview garbage rejected", previewArticleId("not-a-token") === null);
check("preview injection rejected", previewArticleId(`${Buffer.from(JSON.stringify({ article: "../x?y" })).toString("base64url")}.s`) === null);

// Rendering the full article fixture (every node and block type)
const article = fixture<StudioArticle>("article");
const html = renderToStaticMarkup(createElement(ArticleView, { article }));
check("h1 is the title", html.includes(`<h1 class="t-h1 mt-3 text-balance">${article.title}</h1>`));
check("body headings are h2/h3", html.includes("<h2>Day one: the South Bank</h2>") && html.includes("<h3>Costs at a glance</h3>"));
check("table rendered with header cells", html.includes("<table") && html.includes("<th"));
check("internal link uses site path", html.includes('href="/journal/where-to-eat-in-london-for-under-10"'));
check("external link kept", html.includes('href="https://tfl.gov.uk"'));
check("video uses privacy embed", html.includes('src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"'));
check("image has alt and caption", html.includes('alt="Photo for kate-hero"') && html.includes("The South Bank at dusk"));
check("CTA rendered", html.includes("Want the full plan?") && html.includes('href="/products/london-guide"'));
check("product block rendered", html.includes("Planning a trip? This helps."));
check("FAQs, sources, disclosure visible", html.includes("Is London expensive?") && html.includes("Transport for London") && html.includes("virtual travel creator"));
check("JSON-LD embedded and escaped", html.includes('application/ld+json') && !/<\/script><script/.test(html.split("application/ld+json")[1] ?? ""));
check("no raw script from content", !/<script(?![^>]*application\/ld\+json)/.test(html));

const preview = renderToStaticMarkup(createElement(ArticleView, { article: fixture<StudioArticle>("preview") }));
check("preview banner shown", preview.includes("Preview: this draft is not published"));
check("preview has no JSON-LD", !preview.includes("application/ld+json"));

// Hostile content is neutralised by the renderer as a second line of defence
const hostile: StudioArticle = {
  ...article,
  content: { root: { type: "root", children: [
    { type: "paragraph", children: [{ type: "link", fields: { url: "javascript:alert(1)" }, children: [{ type: "text", text: "x" }] }] },
    { type: "block", fields: { blockType: "videoEmbed", embedUrl: "https://evil.example/embed" } },
    { type: "script", children: [{ type: "text", text: "alert(1)" }] },
  ] } },
};
const hostileHtml = renderToStaticMarkup(createElement(ArticleView, { article: hostile }));
check("javascript: links dropped", !hostileHtml.includes("javascript:"));
check("unknown embed hosts dropped", !hostileHtml.includes("evil.example"));

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
