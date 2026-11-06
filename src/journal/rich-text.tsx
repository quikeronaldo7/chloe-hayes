import Link from "next/link";
import type { ReactNode } from "react";
import type { LexicalNode, StudioImage, StudioProduct } from "@/lib/server/content-studio";

/**
 * Renders Content Studio rich text (sanitized Lexical JSON, contract §6) as accessible HTML.
 * Unknown nodes render their children or nothing; this never throws on new content types.
 */

const FORMAT = { bold: 1, italic: 2, strikethrough: 4, underline: 8, code: 16, subscript: 32, superscript: 64 };

const safeHref = (href: unknown): string | null =>
  typeof href === "string" && (/^https:\/\//.test(href) || /^\/(?!\/)/.test(href) || /^mailto:/.test(href)) ? href : null;

function Text({ node }: { node: LexicalNode }) {
  let out: ReactNode = String(node.text ?? "");
  const f = Number(node.format ?? 0);
  if (f & FORMAT.code) out = <code>{out}</code>;
  if (f & FORMAT.bold) out = <strong>{out}</strong>;
  if (f & FORMAT.italic) out = <em>{out}</em>;
  if (f & FORMAT.underline) out = <u>{out}</u>;
  if (f & FORMAT.strikethrough) out = <s>{out}</s>;
  if (f & FORMAT.subscript) out = <sub>{out}</sub>;
  if (f & FORMAT.superscript) out = <sup>{out}</sup>;
  return <>{out}</>;
}

function Figure({ image }: { image: StudioImage }) {
  const src = image.sizes?.wide?.url ?? image.url;
  return (
    <figure className="my-8">
      {/* eslint-disable-next-line @next/next/no-img-element -- remote CMS media; dimensions provided to avoid layout shift */}
      <img src={src} alt={image.alt} width={image.width} height={image.height} loading="lazy" className="h-auto w-full rounded-2xl" />
      {image.caption || image.credit ? (
        <figcaption className="mt-2 text-sm text-muted">
          {image.caption}
          {image.credit ? <span> · {image.credit}</span> : null}
        </figcaption>
      ) : null}
    </figure>
  );
}

function Products({ products, note }: { products: StudioProduct[]; note?: string }) {
  return (
    <aside className="my-8 rounded-2xl bg-card p-5 ring-1 ring-line" aria-label="Related guides">
      {note ? <p className="font-semibold">{note}</p> : null}
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {products.map((p) => (
          <li key={p.productId}>
            <Link href={p.path} className="block rounded-xl p-3 ring-1 ring-line hover:bg-paper">
              <span className="font-semibold">{p.title}</span>
              {p.summary ? <span className="mt-1 block text-sm text-ink-soft">{p.summary}</span> : null}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function Block({ fields }: { fields: Record<string, unknown> }) {
  switch (fields.blockType) {
    case "videoEmbed": {
      const src = typeof fields.embedUrl === "string" && /^https:\/\/(www\.youtube-nocookie\.com|player\.vimeo\.com)\//.test(fields.embedUrl) ? fields.embedUrl : null;
      if (!src) return null;
      return (
        <figure className="my-8">
          <div className="relative aspect-video overflow-hidden rounded-2xl">
            <iframe src={src} title={String(fields.title ?? "Video")} loading="lazy" allow="encrypted-media; picture-in-picture" allowFullScreen className="absolute inset-0 h-full w-full" />
          </div>
          {fields.caption ? <figcaption className="mt-2 text-sm text-muted">{String(fields.caption)}</figcaption> : null}
        </figure>
      );
    }
    case "callToAction": {
      const href = safeHref(fields.href);
      if (!href) return null;
      return (
        <aside className={`my-8 rounded-2xl p-6 ${fields.style === "subtle" ? "ring-1 ring-line" : "bg-card ring-1 ring-line"}`}>
          <p className="t-h3">{String(fields.heading ?? "")}</p>
          {fields.text ? <p className="mt-2 text-ink-soft">{String(fields.text)}</p> : null}
          <p className="mt-4">
            <Link href={href} className="btn">{String(fields.buttonLabel ?? "Learn more")}</Link>
          </p>
        </aside>
      );
    }
    case "productRecommendation": {
      const products = Array.isArray(fields.products) ? (fields.products as StudioProduct[]) : [];
      return products.length ? <Products products={products} note={typeof fields.note === "string" ? fields.note : undefined} /> : null;
    }
    default:
      return null;
  }
}

function Node({ node }: { node: LexicalNode }): ReactNode {
  const kids = (node.children ?? []).map((c, i) => <Node key={i} node={c} />);
  switch (node.type) {
    case "root":
      return <>{kids}</>;
    case "text":
      return <Text node={node} />;
    case "linebreak":
      return <br />;
    case "tab":
      return " ";
    case "paragraph":
      return kids.length ? <p>{kids}</p> : null;
    case "heading": {
      const tag = node.tag === "h3" ? "h3" : node.tag === "h4" ? "h4" : "h2";
      const Tag = tag;
      return <Tag>{kids}</Tag>;
    }
    case "list":
      return node.listType === "number" ? <ol className="list-decimal pl-5">{kids}</ol> : <ul>{kids}</ul>;
    case "listitem":
      return <li>{kids}</li>;
    case "quote":
      return <blockquote className="my-6 border-l-4 border-terracotta pl-4 italic">{kids}</blockquote>;
    case "horizontalrule":
      return <hr className="my-8 border-line" />;
    case "link":
    case "autolink": {
      const fields = (node.fields ?? {}) as { url?: string; newTab?: boolean; linkType?: string };
      const href = safeHref(fields.url);
      if (!href) return <>{kids}</>;
      if (href.startsWith("/")) return <Link href={href}>{kids}</Link>;
      return (
        <a href={href} {...(fields.newTab ? { target: "_blank" } : {})} rel={fields.newTab ? "noopener noreferrer" : undefined}>
          {kids}
        </a>
      );
    }
    case "upload": {
      const value = node.value as StudioImage | undefined;
      return value?.url ? <Figure image={value} /> : null;
    }
    case "table":
      return (
        <div className="my-6 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <tbody>{kids}</tbody>
          </table>
        </div>
      );
    case "tablerow":
      return <tr className="border-b border-line">{kids}</tr>;
    case "tablecell": {
      const Cell = Number(node.headerState ?? 0) > 0 ? "th" : "td";
      return <Cell className="p-2 align-top [&>p]:m-0">{kids}</Cell>;
    }
    case "block":
      return <Block fields={(node.fields ?? {}) as Record<string, unknown>} />;
    default:
      return kids.length ? <>{kids}</> : null;
  }
}

export function RichText({ content }: { content: { root: LexicalNode } | null }) {
  if (!content?.root) return null;
  return (
    <div className="prose-chloe">
      <Node node={content.root} />
    </div>
  );
}
