import fs from "node:fs";
import type { SiteData } from "../types.js";

export function getSiteData(): SiteData {
  const source = process.env.COMPENDIUM_SOURCE;
  if (!source)
    throw new Error("COMPENDIUM_SOURCE is required to render a Compendium.");
  return JSON.parse(fs.readFileSync(source, "utf8")) as SiteData;
}
