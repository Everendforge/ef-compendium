import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { loadConfig } from "./config.js";
import { readStories } from "./pathbranching.js";
import { isSafeVaultPath } from "./paths.js";
import { findMarkdownAssets, indexVault } from "./vault.js";
import type { SiteData } from "../types.js";

export function loadSite(vaultPathInput: string): SiteData {
  const vaultPath = path.resolve(vaultPathInput);
  if (!fs.statSync(vaultPath).isDirectory())
    throw new Error(`${vaultPath} is not a vault directory.`);
  const config = loadConfig(vaultPath);
  const warnings: string[] = [];
  const entities = indexVault(
    vaultPath,
    config.publication?.statuses ?? ["canon"],
    warnings,
  );
  const stories = readStories(vaultPath, warnings);
  const title = config.site?.title ?? path.basename(vaultPath);
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
