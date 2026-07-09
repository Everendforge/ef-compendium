import fs from "node:fs";
import path from "node:path";
import { marked } from "marked";
import sanitizeHtml from "sanitize-html";
import YAML from "yaml";
import type { Entity } from "../types.js";
import { entityRoute, isSafeVaultPath } from "./paths.js";

type ParsedDocument = { frontmatter: Record<string, unknown>; body: string };

function walk(directory: string, result: string[] = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === ".everend" || entry.name.startsWith(".")) continue;
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(file, result);
    else if (entry.isFile() && entry.name.endsWith(".md")) result.push(file);
  }
  return result;
}

function parseDocument(source: string): ParsedDocument | undefined {
  if (!source.startsWith("---\n")) return undefined;
  const end = source.indexOf("\n---", 4);
  if (end < 0) return undefined;
  return {
    frontmatter: YAML.parse(source.slice(4, end)) ?? {},
    body: source.slice(end + 4).trim(),
  };
}

function asStringList(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function lookupKeys(entity: Entity) {
  const fileBase = path.basename(entity.path, path.extname(entity.path));
  return [entity.id, entity.name, fileBase, ...entity.aliases].map((value) =>
    value.trim().toLowerCase(),
  );
}

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

export function renderMarkdown(
  body: string,
  resolveLink: (target: string) => { route: string; label: string } | undefined,
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
  return sanitizeHtml(marked.parse(linked, { async: false, breaks: true }), {
    allowedTags: [
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
    ],
    allowedAttributes: { a: ["href", "title"], img: ["src", "alt", "title"] },
    allowedSchemes: ["http", "https"],
    allowProtocolRelative: false,
  });
}

export function indexVault(
  vaultPath: string,
  publishedStatuses: string[],
  warnings: string[],
): Entity[] {
  const entities: Entity[] = [];
  const seenIds = new Set<string>();
  for (const fullPath of walk(vaultPath)) {
    const relativePath = path
      .relative(vaultPath, fullPath)
      .replaceAll(path.sep, "/");
    const parentName = path.basename(path.dirname(fullPath));
    if (path.basename(fullPath) === `${parentName}.md`) continue;
    const parsed = parseDocument(fs.readFileSync(fullPath, "utf8"));
    if (!parsed) continue;
    const { id, type, name, status } = parsed.frontmatter;
    if (
      typeof id !== "string" ||
      !id.trim() ||
      typeof type !== "string" ||
      !type.trim() ||
      typeof name !== "string" ||
      !name.trim() ||
      typeof status !== "string" ||
      !status.trim()
    ) {
      warnings.push(`${relativePath} is missing required entity frontmatter.`);
      continue;
    }
    if (!publishedStatuses.includes(status)) continue;
    if (seenIds.has(id)) {
      warnings.push(`${relativePath} has duplicate published id ${id}.`);
      continue;
    }
    seenIds.add(id);
    entities.push({
      id,
      type,
      name,
      status,
      tags: asStringList(parsed.frontmatter.tags),
      aliases: asStringList(parsed.frontmatter.aliases),
      parentId:
        typeof parsed.frontmatter.parentId === "string"
          ? parsed.frontmatter.parentId
          : undefined,
      childrenIds: asStringList(parsed.frontmatter.childrenIds),
      path: relativePath,
      body: parsed.body,
      wikilinks: findWikilinks(parsed.body),
      backlinks: [],
      route: entityRoute(type, id),
      html: "",
    });
  }

  const byKey = new Map<string, Entity>();
  entities.forEach((entity) =>
    lookupKeys(entity).forEach((key) => byKey.set(key, entity)),
  );
  entities.forEach((entity) => {
    entity.wikilinks.forEach((target) => {
      const resolved = byKey.get(target.toLowerCase());
      if (resolved) resolved.backlinks.push(entity.id);
    });
    entity.html = renderMarkdown(entity.body, (target) => {
      const resolved = byKey.get(target.toLowerCase());
      return resolved
        ? { route: resolved.route, label: resolved.name }
        : undefined;
    });
  });
  return entities.sort((left, right) => left.name.localeCompare(right.name));
}
