import type { CompendiumConfig } from "../types.js";

export const CONFIG_RELATIVE_PATH = ".everend/.compendium/settings.json";

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
  try {
    const value = JSON.parse(source) as CompendiumConfig;
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
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`${label} must be valid JSON: ${error.message}`);
    }
    throw error;
  }
}

export function serializeConfig(config: CompendiumConfig): string {
  return JSON.stringify(config, null, 2) + "\n";
}

export const starterConfig = JSON.stringify(
  {
    specVersion: "0.1",
    site: {
      title: "My Everend Compendium",
      description: "A public guide to this universe.",
    },
    theme: {
      preset: "midnight",
      accentColor: "#C89B3C",
    },
    publication: {
      statuses: ["canon"],
    },
    narrative: {
      mode: "scenes-and-relations",
    },
  },
  null,
  2
) + "\n";
