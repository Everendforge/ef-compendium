import YAML from "yaml";
import type { CompendiumConfig } from "../types.js";

export const CONFIG_RELATIVE_PATH = ".everend/compendium.yaml";

export const defaultConfig: CompendiumConfig = {
  specVersion: "0.1",
  theme: { preset: "midnight", accentColor: "#C89B3C" },
  publication: { statuses: ["canon"] },
  narrative: { mode: "scenes-and-relations" },
};

export function parseConfig(
  source: string | undefined,
  label = CONFIG_RELATIVE_PATH,
): CompendiumConfig {
  if (source === undefined) return structuredClone(defaultConfig);
  const value = YAML.parse(source) as CompendiumConfig;
  if (!value || value.specVersion !== "0.1")
    throw new Error(`${label} must set specVersion: "0.1".`);
  if (value.publication?.statuses?.length === 0)
    throw new Error(`${label} publication.statuses cannot be empty.`);
  if (value.narrative?.mode && value.narrative.mode !== "scenes-and-relations")
    throw new Error(`${label} has an unsupported narrative mode.`);
  return {
    ...structuredClone(defaultConfig),
    ...value,
    site: { ...defaultConfig.site, ...value.site },
    theme: { ...defaultConfig.theme, ...value.theme },
    navigation: { ...defaultConfig.navigation, ...value.navigation },
    publication: { ...defaultConfig.publication, ...value.publication },
    narrative: { ...defaultConfig.narrative, ...value.narrative },
  };
}

export function serializeConfig(config: CompendiumConfig) {
  return YAML.stringify(config);
}

export const starterConfig = [
  'specVersion: "0.1"',
  "site:",
  "  title: My Everend Compendium",
  "  description: A public guide to this universe.",
  "theme:",
  "  preset: midnight",
  '  accentColor: "#C89B3C"',
  "publication:",
  "  statuses: [canon]",
  "narrative:",
  "  mode: scenes-and-relations",
  "",
].join("\n");
