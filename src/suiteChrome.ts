import type { ReactNode } from "react";

export type SuiteSettings = {
  primaryFont: string;
  onPrimaryFontChange: (font: string) => void;
  style: string;
  onStyleChange: (style: string) => void;
  onToggleStyleMode: () => void;
  update: SuiteUpdateControls;
};

export type SuiteUpdateStatus =
  "idle" | "checking" | "up-to-date" | "available" | "downloading" | "error";

export type SuiteUpdateControls = {
  appName: string;
  currentVersion: string;
  identifier: string;
  platform: string;
  status: SuiteUpdateStatus;
  availableVersion?: string;
  releaseNotes?: string;
  progress?: number;
  downloadedBytes?: number;
  contentLength?: number;
  lastCheckedAt?: string;
  error?: string;
  onCheck: () => void;
  onInstall: () => void;
};

export const SUITE_STYLE_OPTIONS = [
  ["worldnotion-light", "WorldNotion Light"],
  ["worldnotion-dark", "WorldNotion Dark"],
  ["github", "GitHub Light"],
  ["github-dark", "GitHub Dark"],
  ["one-light-pro", "One Light Pro"],
  ["one-dark-pro", "One Dark Pro"],
  ["dracula-light", "Dracula Light"],
  ["dracula", "Dracula"],
  ["light-owl", "Light Owl"],
  ["night-owl", "Night Owl"],
  ["material-lighter", "Material Lighter"],
  ["material-palenight", "Material Palenight"],
] as const;

export type SuiteChrome = {
  active: boolean;
  sharedUniversePath?: string;
  onHome?: () => void;
  renderAppSwitcher: () => ReactNode;
  suiteSettings?: SuiteSettings;
};
