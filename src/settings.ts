import { normalizeThemeId, type ThemeId } from "./themes.js";
import { normalizePrimaryFont, type PrimaryFontId } from "./typography.js";
import { normalizeLocalePreference, type LocalePreference } from "./i18n";

export const SETTINGS_KEY = "compendium.settings.v1";

export type CompendiumSettings = {
  /** Interface language only; universe publication content is never modified. */
  localePreference: LocalePreference;
  theme: ThemeId;
  primaryFont: PrimaryFontId;
  recentUniverse?: string;
  recentUniverses: string[];
};

const defaultSettings: CompendiumSettings = {
  localePreference: "system",
  theme: "worldnotion-dark",
  primaryFont: "serif",
  recentUniverses: [],
};

export function loadSettings(): CompendiumSettings {
  try {
    const stored = window.localStorage.getItem(SETTINGS_KEY);
    if (!stored) return { ...defaultSettings };
    const parsed = JSON.parse(stored) as Partial<CompendiumSettings>;
    return {
      localePreference: normalizeLocalePreference(parsed.localePreference),
      theme: normalizeThemeId(parsed.theme),
      primaryFont: normalizePrimaryFont(parsed.primaryFont),
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
