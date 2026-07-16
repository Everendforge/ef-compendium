import {
  BookOpen,
  ExternalLink,
  Palette,
  RefreshCw,
  Settings2,
  Type,
  X,
} from "lucide-react";
import type { ReactNode } from "react";
import type { SuiteSettings } from "../suiteChrome";

export type SettingsSection =
  "appearance" | "universe" | "about" | "suite" | "update";

export function SettingsDialog({
  section,
  onSectionChange,
  onClose,
  appearance,
  universe,
  onOpenDocs,
  suiteSettings,
}: {
  section: SettingsSection;
  onSectionChange: (section: SettingsSection) => void;
  onClose: () => void;
  appearance: ReactNode;
  universe?: ReactNode;
  onOpenDocs: () => void;
  suiteSettings?: SuiteSettings;
}) {
  return (
    <div
      className="dialog-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="settings-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        <header className="dialog-header">
          <div>
            <span className="dialog-kicker">Everend Compendium</span>
            <h2 id="settings-title">Settings</h2>
          </div>
          <button
            type="button"
            className="dialog-close"
            onClick={onClose}
            title="Close"
          >
            <X size={18} />
          </button>
        </header>
        <div className="settings-dialog-body">
          <nav className="settings-dialog-nav" aria-label="Settings sections">
            {suiteSettings ? (
              <div className="settings-nav-group">
                <p>Forge</p>
                <button
                  type="button"
                  className={section === "suite" ? "active" : ""}
                  onClick={() => onSectionChange("suite")}
                >
                  <Settings2 size={16} />
                  <span>Suite</span>
                </button>
                <button
                  type="button"
                  className={section === "update" ? "active" : ""}
                  onClick={() => onSectionChange("update")}
                >
                  <RefreshCw size={16} />
                  <span>Update</span>
                </button>
              </div>
            ) : null}
            <div className="settings-nav-group app-settings-group">
              <p>Application</p>
              <button
                type="button"
                className={section === "appearance" ? "active" : ""}
                onClick={() => onSectionChange("appearance")}
              >
                <Palette size={16} />
                <span>Appearance</span>
              </button>
              {universe ? (
                <button
                  type="button"
                  className={section === "universe" ? "active" : ""}
                  onClick={() => onSectionChange("universe")}
                >
                  <BookOpen size={16} />
                  <span>Universe</span>
                </button>
              ) : null}
              <button
                type="button"
                className={section === "about" ? "active" : ""}
                onClick={() => onSectionChange("about")}
              >
                <Settings2 size={16} />
                <span>About</span>
              </button>
            </div>
          </nav>
          <div className="settings-dialog-content">
            {section === "suite" && suiteSettings ? (
              <div className="settings-panel">
                <div className="settings-page-heading">
                  <Settings2 size={20} />
                  <div>
                    <h3>Everend Forge Suite</h3>
                    <p>
                      Shared preferences applied to every app in this Suite.
                    </p>
                  </div>
                </div>
                <div className="settings-control-panel">
                  <label className="typography-setting">
                    <span>Style</span>
                    <select
                      value={suiteSettings.style}
                      onChange={(event) =>
                        suiteSettings.onStyleChange(event.target.value)
                      }
                    >
                      <option value="worldnotion-light">
                        WorldNotion Light
                      </option>
                      <option value="worldnotion-dark">WorldNotion Dark</option>
                      <option value="github">GitHub Light</option>
                      <option value="github-dark">GitHub Dark</option>
                      <option value="one-light-pro">One Light Pro</option>
                      <option value="one-dark-pro">One Dark Pro</option>
                      <option value="dracula-light">Dracula Light</option>
                      <option value="dracula">Dracula</option>
                      <option value="light-owl">Light Owl</option>
                      <option value="night-owl">Night Owl</option>
                      <option value="material-lighter">Material Lighter</option>
                      <option value="material-palenight">
                        Material Palenight
                      </option>
                    </select>
                  </label>
                  <label className="typography-setting">
                    <span>Primary typeface</span>
                    <select
                      value={suiteSettings.primaryFont}
                      onChange={(event) =>
                        suiteSettings.onPrimaryFontChange(event.target.value)
                      }
                    >
                      <option value="sans">Sans serif</option>
                      <option value="serif">Serif editorial</option>
                      <option value="humanist">Humanist</option>
                    </select>
                  </label>
                </div>
              </div>
            ) : null}
            {section === "update" && suiteSettings?.update ? (
              <div className="settings-panel forge-update-panel">
                <div className="settings-page-heading">
                  <RefreshCw size={20} />
                  <div>
                    <h3>Everend Forge Update</h3>
                    <p>
                      Check, download, and install signed updates for the Suite.
                    </p>
                  </div>
                </div>
                <dl>
                  <div>
                    <dt>Installed version</dt>
                    <dd>{suiteSettings.update.currentVersion}</dd>
                  </div>
                  <div>
                    <dt>Platform</dt>
                    <dd>{suiteSettings.update.platform}</dd>
                  </div>
                  <div>
                    <dt>Application ID</dt>
                    <dd>
                      <code>{suiteSettings.update.identifier}</code>
                    </dd>
                  </div>
                </dl>
                <div
                  className={`forge-update-status ${suiteSettings.update.status}`}
                  role="status"
                >
                  <strong>
                    {suiteSettings.update.status === "checking"
                      ? "Checking for updates..."
                      : suiteSettings.update.status === "available"
                        ? `Version ${suiteSettings.update.availableVersion} is ready`
                        : suiteSettings.update.status === "downloading"
                          ? `Installing Everend Forge ${suiteSettings.update.availableVersion}...`
                          : suiteSettings.update.status === "up-to-date"
                            ? "You are up to date"
                            : suiteSettings.update.status === "error"
                              ? "Update check failed"
                              : "Ready to check for updates"}
                  </strong>
                  <p>
                    {suiteSettings.update.error ??
                      "The updater is ready to contact the release server."}
                  </p>
                </div>
                <div className="forge-update-actions">
                  <button
                    type="button"
                    onClick={suiteSettings.update.onCheck}
                    disabled={
                      suiteSettings.update.status === "checking" ||
                      suiteSettings.update.status === "downloading"
                    }
                  >
                    <RefreshCw size={14} /> Check for updates
                  </button>
                  {suiteSettings.update.status === "available" ? (
                    <button
                      type="button"
                      className="primary-action"
                      onClick={suiteSettings.update.onInstall}
                    >
                      Download and install
                    </button>
                  ) : null}
                </div>
              </div>
            ) : null}
            {section === "appearance" ? (
              <>
                <div className="settings-page-heading">
                  <Type size={20} />
                  <div>
                    <h3>Reading appearance</h3>
                    <p>
                      Choose a style and typeface that keep long entries
                      comfortable.
                    </p>
                  </div>
                </div>
                <div className="settings-control-panel">{appearance}</div>
              </>
            ) : null}
            {section === "universe" && universe ? (
              <>
                <div className="settings-page-heading">
                  <BookOpen size={20} />
                  <div>
                    <h3>Current universe</h3>
                    <p>Identity and local folder controls.</p>
                  </div>
                </div>
                {universe}
              </>
            ) : null}
            {section === "about" ? (
              <div className="about-settings">
                <div className="settings-page-heading">
                  <Settings2 size={20} />
                  <div>
                    <h3>About Compendium</h3>
                    <p>
                      A readable, public-facing projection of your Everend
                      universe.
                    </p>
                  </div>
                </div>
                <dl>
                  <div>
                    <dt>Version</dt>
                    <dd>0.2.0</dd>
                  </div>
                  <div>
                    <dt>Canon safety</dt>
                    <dd>Read-only; corrections are review proposals</dd>
                  </div>
                </dl>
                <button type="button" onClick={onOpenDocs}>
                  <ExternalLink size={14} /> Open documentation
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
