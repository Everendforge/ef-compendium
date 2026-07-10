import { useCallback, useEffect, useRef, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { BookOpen, FolderOpen, Home, Moon, Sun } from "lucide-react";
import compendiumIcon from "./assets/everend-compendium-icon.png";
import forgeLogoOnDark from "./assets/everend-forge-logo-on-dark.png";
import forgeLogoOnLight from "./assets/everend-forge-logo-on-light.png";
import { Reader, type ReaderMode } from "./components/Reader";
import { mapDefinitions } from "./components/MapsView";
import { SearchBox } from "./components/SearchBox";
import { timelineEntries } from "./components/TimelineView";
import { assembleSiteData } from "./lib/assemble";
import { sanitizeDom } from "./lib/sanitize-dom";
import {
  loadSettings,
  rememberUniverse,
  saveSettings,
  type CompendiumSettings,
} from "./settings";
import {
  indexVault,
  isTauriRuntime,
  openExternal,
  openVaultDialog,
  revealVault,
} from "./tauriBridge";
import { isDarkTheme, themeForPreset, toggledThemeMode } from "./themes";
import type { SiteData } from "./types";

const EVEREND_FORGE_GITHUB_URL = "https://github.com/Everendforge/everend-forge";
const BUY_SUITE_URL = "https://everendforge.com/buy-suite";
const COMPENDIUM_DOCS_URL = "https://github.com/Everendforge/everend-compendium";

function ForgeCornerLogo() {
  return (
    <>
      <img
        className="forge-logo forge-logo-on-light"
        src={forgeLogoOnLight}
        alt=""
        aria-hidden="true"
      />
      <img
        className="forge-logo forge-logo-on-dark"
        src={forgeLogoOnDark}
        alt=""
        aria-hidden="true"
      />
    </>
  );
}

type AppView = "home" | "reader";
type LoadState = "idle" | "loading" | "error";

function universeDisplayName(path: string) {
  return path.split(/[\\/]/).filter(Boolean).pop() ?? path;
}

function App() {
  const [settings, setSettings] = useState<CompendiumSettings>(() => loadSettings());
  const [view, setView] = useState<AppView>("home");
  const [site, setSite] = useState<SiteData>();
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [mode, setMode] = useState<ReaderMode>("web");
  const [route, setRoute] = useState("/");
  const [forgeMenuOpen, setForgeMenuOpen] = useState(false);
  const forgeMenuRef = useRef<HTMLDivElement | null>(null);
  const appliedPresetRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    if (!forgeMenuOpen) return;
    function handlePointerDown(event: PointerEvent) {
      if (forgeMenuRef.current?.contains(event.target as Node)) return;
      setForgeMenuOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [forgeMenuOpen]);

  const navigate = useCallback((nextRoute: string) => {
    setRoute(nextRoute);
  }, []);

  const applySite = useCallback((data: SiteData) => {
    setSite(data);
    setRoute("/");
    setView("reader");
    setLoadState("idle");
    setErrorMessage("");
    const preset = data.config.theme?.preset;
    if (preset && appliedPresetRef.current !== preset) {
      appliedPresetRef.current = preset;
      setSettings((current) => ({ ...current, theme: themeForPreset(preset) }));
    }
    document.documentElement.style.setProperty(
      "--cp-accent",
      data.config.theme?.accentColor ?? "#C89B3C",
    );
  }, []);

  const loadUniverse = useCallback(
    async (path: string) => {
      setLoadState("loading");
      setErrorMessage("");
      try {
        const result = await indexVault(path);
        const data = assembleSiteData(result.rootPath, result.files, sanitizeDom);
        applySite(data);
        setSettings((current) => rememberUniverse(current, result.rootPath));
      } catch (error) {
        setLoadState("error");
        setErrorMessage(error instanceof Error ? error.message : String(error));
      }
    },
    [applySite],
  );

  const openUniverse = useCallback(async () => {
    if (!isTauriRuntime()) {
      setLoadState("error");
      setErrorMessage("Open Everend Compendium as a desktop app to choose a universe folder.");
      return;
    }
    const path = await openVaultDialog();
    if (path) await loadUniverse(path);
  }, [loadUniverse]);

  const openRecentUniverse = useCallback(
    async (path?: string) => {
      const target = path ?? settings.recentUniverse;
      if (target) await loadUniverse(target);
    },
    [loadUniverse, settings.recentUniverse],
  );

  const toggleTheme = useCallback(() => {
    setSettings((current) => ({ ...current, theme: toggledThemeMode(current.theme) }));
  }, []);

  useEffect(() => {
    if (!isTauriRuntime()) return;

    let disposed = false;
    let unlisten: (() => void) | undefined;

    void listen<string>("compendium-menu", (event) => {
      if (event.payload === "cp:file:open-universe") void openUniverse();
      if (event.payload === "cp:file:reveal-universe" && site) {
        void revealVault(site.vaultPath);
      }
      if (event.payload === "cp:view:toggle-light-dark") toggleTheme();
      if (event.payload === "cp:view:mode-web") setMode("web");
      if (event.payload === "cp:view:mode-book") setMode("book");
      if (event.payload === "cp:view:reload") window.location.reload();
      if (event.payload === "cp:help:about") {
        setErrorMessage("Everend Compendium 0.2.0 - a readable edition of your universe.");
        setLoadState("error");
      }
      if (event.payload === "cp:help:docs") void openExternal(COMPENDIUM_DOCS_URL);
    }).then((nextUnlisten) => {
      if (disposed) {
        nextUnlisten();
      } else {
        unlisten = nextUnlisten;
      }
    });

    return () => {
      disposed = true;
      unlisten?.();
    };
  }, [openUniverse, site, toggleTheme]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setForgeMenuOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  async function readCurrentUniverse() {
    if (site) await loadUniverse(site.vaultPath);
  }

  if (view === "home" || !site) {
    return (
      <main className="home-shell">
        <header className="home-topbar">
          <div className="brand">
            <img className="app-brand-icon" src={compendiumIcon} alt="" aria-hidden="true" />
            <div>
              <h1>Everend Compendium</h1>
              <p>A readable edition of your universe</p>
            </div>
          </div>
          <button
            type="button"
            className="icon-button"
            onClick={toggleTheme}
            title="Toggle theme"
          >
            {isDarkTheme(settings.theme) ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </header>
        <section className="home-panel">
          <div className="home-hero">
            <div className="home-copy">
              <p className="eyebrow">Home</p>
              <h2>Choose a universe</h2>
              <p>
                Open a WorldNotion vault to read its published canon and stories as a
                living book.
              </p>
            </div>
            {site ? (
              <button
                type="button"
                className="active-universe-card"
                onClick={() => setView("reader")}
              >
                <span className="eyebrow">Continue reading</span>
                <strong>{site.title}</strong>
                <span>{site.entities.length} entries · {site.stories.length} stories</span>
              </button>
            ) : null}
          </div>
          <div className="home-actions">
            <button type="button" className="primary-action" onClick={openUniverse}>
              <FolderOpen size={16} />
              Open Universe
            </button>
            {settings.recentUniverse ? (
              <button type="button" onClick={() => void openRecentUniverse()}>
                <BookOpen size={16} />
                Open Recent
              </button>
            ) : null}
          </div>
          {loadState === "loading" ? <p className="home-status">Opening universe...</p> : null}
          {loadState === "error" && errorMessage ? (
            <div className="error-banner">{errorMessage}</div>
          ) : null}
          {settings.recentUniverses.length > 0 ? (
            <div className="recent-section">
              <p className="eyebrow">Recent universes</p>
              <ul className="recent-list">
                {settings.recentUniverses.map((path) => (
                  <li key={path}>
                    <button type="button" onClick={() => void openRecentUniverse(path)}>
                      <strong>{universeDisplayName(path)}</strong>
                      <span>{path}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      </main>
    );
  }

  const hasTimeline = timelineEntries(site).length > 0;
  const hasMaps = mapDefinitions(site).length > 0;

  return (
    <main className="app-shell compendium-shell">
      <div className="reader-top-bar" aria-label="Reader controls">
        <div ref={forgeMenuRef} className={`forge-corner-menu ${forgeMenuOpen ? "open" : ""}`}>
          <div className="forge-orbit-panel" aria-label="Everend menu">
            <button
              type="button"
              onClick={() =>
                void openExternal(EVEREND_FORGE_GITHUB_URL).then(() => setForgeMenuOpen(false))
              }
            >
              Github
            </button>
            <button
              type="button"
              onClick={() => void openExternal(BUY_SUITE_URL).then(() => setForgeMenuOpen(false))}
            >
              Buy Suite
            </button>
          </div>
          <button
            type="button"
            className="forge-corner-button"
            onClick={() => setForgeMenuOpen((open) => !open)}
            aria-expanded={forgeMenuOpen}
            aria-label="Open Everend menu"
            title="Everend menu"
          >
            <ForgeCornerLogo />
          </button>
        </div>

        <div className="reader-top-left">
          <button
            type="button"
            className="reader-icon-button"
            onClick={() => setView("home")}
            title="Home"
          >
            <Home size={15} />
          </button>
          <button
            type="button"
            className="reader-brand"
            onClick={() => navigate("/")}
            title={site.vaultPath}
          >
            {site.title}
          </button>
        </div>

        <nav className="reader-nav" aria-label="Primary navigation">
          <button
            type="button"
            className={route === "/" ? "active" : ""}
            onClick={() => navigate("/")}
          >
            Universe
          </button>
          <button
            type="button"
            className={route.startsWith("/stories/") ? "active" : ""}
            onClick={() => navigate("/stories/")}
          >
            Stories
          </button>
          <button
            type="button"
            className={route === "/graph/" ? "active" : ""}
            onClick={() => navigate("/graph/")}
          >
            Graph
          </button>
          {hasTimeline ? (
            <button
              type="button"
              className={route === "/timeline/" ? "active" : ""}
              onClick={() => navigate("/timeline/")}
            >
              Timeline
            </button>
          ) : null}
          {hasMaps ? (
            <button
              type="button"
              className={route === "/maps/" ? "active" : ""}
              onClick={() => navigate("/maps/")}
            >
              Maps
            </button>
          ) : null}
        </nav>

        <div className="reader-top-right">
          <div className="mode-switch" role="group" aria-label="Reading mode">
            <button
              type="button"
              className={mode === "web" ? "active" : ""}
              onClick={() => setMode("web")}
            >
              Web
            </button>
            <button
              type="button"
              className={mode === "book" ? "active" : ""}
              onClick={() => setMode("book")}
            >
              Book
            </button>
          </div>
          <SearchBox site={site} navigate={navigate} />
          <button
            type="button"
            className="reader-icon-button"
            onClick={toggleTheme}
            title="Toggle theme"
          >
            {isDarkTheme(settings.theme) ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </div>

      {loadState === "error" && errorMessage ? (
        <div className="reader-status">{errorMessage}</div>
      ) : null}

      <Reader
        site={site}
        mode={mode}
        route={route}
        navigate={navigate}
        refresh={() => void readCurrentUniverse()}
      />
    </main>
  );
}

export default App;
