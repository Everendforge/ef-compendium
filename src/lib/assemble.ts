import type { SiteData, SourceFile } from "../types.js";
import { CONFIG_RELATIVE_PATH, parseConfig } from "./config.js";
import { renderMarkdownWith, type Sanitizer } from "./markdown.js";
import { projectStories } from "./pathbranching.js";
import { entityLinkResolver, projectEntities } from "./vault.js";

function vaultBaseName(vaultPath: string) {
  const trimmed = vaultPath.replaceAll("\\", "/").replace(/\/+$/, "");
  return trimmed.split("/").pop() || trimmed;
}

/**
 * Pure assembly of the whole Compendium projection from in-memory files.
 * Both the Node CLI (fs walk + sanitize-html) and the desktop app
 * (Tauri index_vault + DOMPurify) call this single entry point.
 */
export function assembleSiteData(
  vaultPath: string,
  files: SourceFile[],
  sanitize: Sanitizer,
): SiteData {
  const config = parseConfig(
    files.find(
      (file) =>
        file.relativePath.replaceAll("\\", "/") === CONFIG_RELATIVE_PATH,
    )?.content,
  );
  const warnings: string[] = [];
  const entities = projectEntities(
    files,
    config.publication?.statuses ?? ["canon"],
    warnings,
    sanitize,
  );
  const stories = projectStories(files, warnings);

  const resolveLink = entityLinkResolver(entities);
  for (const story of stories) {
    for (const sequence of story.sequences) {
      for (const event of sequence.events) {
        event.html = event.text
          ? renderMarkdownWith(event.text, resolveLink, sanitize)
          : "";
      }
    }
  }

  const title = config.site?.title ?? vaultBaseName(vaultPath);
  return {
    vaultPath,
    config,
    title,
    description: config.site?.description ?? `A public guide to ${title}.`,
    entities,
    stories,
    warnings,
  };
}
