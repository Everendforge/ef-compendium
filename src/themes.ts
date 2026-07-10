export type ThemeId = "compendium-light" | "compendium-dark";
export type ThemeMode = "light" | "dark";

export type ThemeDefinition = {
  id: ThemeId;
  label: string;
  isDark: boolean;
  mode: ThemeMode;
};

export const THEMES: ThemeDefinition[] = [
  { id: "compendium-light", label: "Parchment", isDark: false, mode: "light" },
  { id: "compendium-dark", label: "Midnight", isDark: true, mode: "dark" },
];

export const THEME_IDS = THEMES.map((theme) => theme.id);

export function normalizeThemeId(value: unknown): ThemeId {
  if (value === "light") return "compendium-light";
  if (value === "dark") return "compendium-dark";
  return THEME_IDS.includes(value as ThemeId)
    ? (value as ThemeId)
    : "compendium-dark";
}

export function isDarkTheme(themeId: ThemeId) {
  return themeId === "compendium-dark";
}

export function toggledThemeMode(themeId: ThemeId): ThemeId {
  return isDarkTheme(themeId) ? "compendium-light" : "compendium-dark";
}

/** Initial theme suggested by a compendium.yaml theme preset. */
export function themeForPreset(preset: string | undefined): ThemeId {
  if (preset === "parchment" || preset === "ink") return "compendium-light";
  return "compendium-dark";
}
