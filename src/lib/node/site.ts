import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { SiteData } from "../../types.js";
import { assembleSiteData } from "../assemble.js";
import { CONFIG_RELATIVE_PATH } from "../config.js";
import { findMarkdownAssets } from "../markdown.js";
import { isSafeVaultPath } from "../paths.js";
import { walkVaultFiles } from "./fs-source.js";
import { sanitizeNode } from "./render.js";

export function configPath(vaultPath: string) {
  return path.join(vaultPath, ...CONFIG_RELATIVE_PATH.split("/"));
}

export function loadSite(vaultPathInput: string): SiteData {
  const vaultPath = path.resolve(vaultPathInput);
  if (!fs.statSync(vaultPath).isDirectory())
    throw new Error(`${vaultPath} is not a vault directory.`);
  return assembleSiteData(vaultPath, walkVaultFiles(vaultPath), sanitizeNode);
}

export function createSiteDataFile(data: SiteData) {
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), "everend-compendium-"),
  );
  const file = path.join(directory, "site-data.json");
  fs.writeFileSync(file, JSON.stringify(data), "utf8");
  return {
    file,
    dispose: () => fs.rmSync(directory, { recursive: true, force: true }),
  };
}

export function copyReferencedAssets(data: SiteData, outputPath: string) {
  const assets = new Set(
    [
      data.config.site?.coverImage,
      data.config.site?.logo,
      ...data.entities.flatMap((entity) => findMarkdownAssets(entity.body)),
    ].filter((value): value is string => Boolean(value)),
  );
  for (const asset of assets) {
    if (!isSafeVaultPath(asset))
      throw new Error(`Refusing unsafe configured asset path: ${asset}`);
    const source = path.join(data.vaultPath, asset);
    if (!fs.existsSync(source) || !fs.statSync(source).isFile()) {
      data.warnings.push(`Referenced asset was not found: ${asset}`);
      continue;
    }
    const target = path.join(outputPath, "assets", asset);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(source, target);
  }
}
