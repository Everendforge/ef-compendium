import { marked } from "marked";
import { isSafeVaultPath } from "./paths.js";

/** Sanitizes rendered HTML down to the Compendium allowlist. */
export type Sanitizer = (html: string) => string;

export type LinkResolver = (
  target: string,
) => { route: string; label: string } | undefined;

export const ALLOWED_TAGS = [
  "a",
  "p",
  "h1",
  "h2",
  "h3",
  "h4",
  "blockquote",
  "strong",
  "em",
  "code",
  "pre",
  "ul",
  "ol",
  "li",
  "hr",
  "br",
  "img",
];

export const ALLOWED_ATTRIBUTES: Record<string, string[]> = {
  a: ["href", "title"],
  img: ["src", "alt", "title"],
};

export const ALLOWED_SCHEMES = ["http", "https"];

export function findWikilinks(body: string) {
  return Array.from(
    body.matchAll(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g),
    (match) => match[1].trim(),
  );
}

export function findMarkdownAssets(body: string) {
  return Array.from(
    body.matchAll(/!\[[^\]]*\]\(([^\s)]+)(?:\s+[^)]*)?\)/g),
    (match) => match[1],
  ).filter(isSafeVaultPath);
}

export function renderMarkdownWith(
  body: string,
  resolveLink: LinkResolver,
  sanitize: Sanitizer,
) {
  const withAssets = body.replace(
    /!\[([^\]]*)\]\(([^\s)]+)(?:\s+[^)]*)?\)/g,
    (full, alt: string, asset: string) => {
      return isSafeVaultPath(asset) ? `![${alt}](/assets/${asset})` : full;
    },
  );
  const linked = withAssets.replace(
    /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,
    (_full, target: string, alias?: string) => {
      const resolved = resolveLink(target.trim());
      if (!resolved) return alias?.trim() || target.trim();
      return `[${alias?.trim() || resolved.label}](${resolved.route})`;
    },
  );
  return sanitize(marked.parse(linked, { async: false, breaks: true }));
}
