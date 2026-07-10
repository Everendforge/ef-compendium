import { normalizeThemeId, type ThemeId } from "./themes.js";

export const SETTINGS_KEY = "compendium.settings.v1";

export type CompendiumSettings = {
  theme: ThemeId;
  recentUniverse?: string;
  recentUniverses: string[];
};

const defaultSettings: CompendiumSettings = {
  theme: "compendium-dark",
  recentUniverses: [],
};

export function loadSettings(): CompendiumSettings {
  try {
    const stored = window.localStorage.getItem(SETTINGS_KEY);
    if (!stored) return { ...defaultSettings };
    const parsed = JSON.parse(stored) as Partial<CompendiumSettings>;
    return {
      theme: normalizeThemeId(parsed.theme),
      recentUniverse:
        typeof parsed.recentUniverse === "string"
          ? parsed.recentUniverse
          : undefined,
      recentUniverses: Array.isArray(parsed.recentUniverses)
        ? parsed.recentUniverses.filter(
            (value): value is string => typeof value === "string",
          )
        : [],
    };
  } catch {
    return { ...defaultSettings };
  }
}

export function saveSettings(settings: CompendiumSettings) {
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Persisting settings is best-effort.
  }
}

export function rememberUniverse(
  settings: CompendiumSettings,
  path: string,
): CompendiumSettings {
  return {
    ...settings,
    recentUniverse: path,
    recentUniverses: [
      path,
      ...settings.recentUniverses.filter((value) => value !== path),
    ].slice(0, 8),
  };
}
