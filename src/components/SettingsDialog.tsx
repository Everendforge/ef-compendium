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
import type { LocalePreference } from "../i18n";
import { compendiumSettingsCopy, interfaceLocaleCopy, resolveInterfaceLocale } from "../i18n";

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
  localePreference,
  onLocalePreferenceChange,
}: {
  section: SettingsSection;
  onSectionChange: (section: SettingsSection) => void;
  onClose: () => void;
  appearance: ReactNode;
  universe?: ReactNode;
  onOpenDocs: () => void;
  suiteSettings?: SuiteSettings;
  localePreference: LocalePreference;
  onLocalePreferenceChange: (preference: LocalePreference) => void;
}) {
  const interfaceCopy = interfaceLocaleCopy(resolveInterfaceLocale(localePreference));
  const settingsText = compendiumSettingsCopy(resolveInterfaceLocale(localePreference));
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
            <h2 id="settings-title">{settingsText.title}</h2>
          </div>
          <button
            type="button"
            className="dialog-close"
            onClick={onClose}
            title={settingsText.close}
          >
            <X size={18} />
          </button>
        </header>
        <div className="settings-dialog-body">
          <nav className="settings-dialog-nav" aria-label={settingsText.sections}>
            {suiteSettings ? (
              <div className="settings-nav-group">
                <p>{settingsText.forge}</p>
                <button
                  type="button"
                  className={section === "suite" ? "active" : ""}
                  onClick={() => onSectionChange("suite")}
                >
                  <Settings2 size={16} />
                  <span>{settingsText.suite}</span>
                </button>
                <button
                  type="button"
                  className={section === "update" ? "active" : ""}
                  onClick={() => onSectionChange("update")}
                >
                  <RefreshCw size={16} />
                  <span>{settingsText.update}</span>
                </button>
              </div>
            ) : null}
            <div className="settings-nav-group app-settings-group">
              <p>{settingsText.application}</p>
              <button
                type="button"
                className={section === "appearance" ? "active" : ""}
                onClick={() => onSectionChange("appearance")}
              >
                <Palette size={16} />
                <span>{settingsText.appearance}</span>
              </button>
              {universe ? (
                <button
                  type="button"
                  className={section === "universe" ? "active" : ""}
                  onClick={() => onSectionChange("universe")}
                >
                  <BookOpen size={16} />
                  <span>{settingsText.universe}</span>
                </button>
              ) : null}
              <button
                type="button"
                className={section === "about" ? "active" : ""}
                onClick={() => onSectionChange("about")}
              >
                <Settings2 size={16} />
                <span>{settingsText.about}</span>
              </button>
            </div>
          </nav>
          <div className="settings-dialog-content">
            {section === "suite" && suiteSettings ? (
              <div className="settings-panel">
                <div className="settings-page-heading">
                  <Settings2 size={20} />
                  <div>
                    <h3>{settingsText.suiteTitle}</h3>
                    <p>
                      {settingsText.suiteDescription}
                    </p>
                  </div>
                </div>
                <div className="settings-control-panel">
                  <label className="typography-setting">
                    <span>{interfaceCopy.interfaceLanguage}</span>
                    <select value={localePreference} onChange={(event) => onLocalePreferenceChange(event.target.value as LocalePreference)}>
                      <option value="system">{interfaceCopy.system}</option>
                      <option value="en">English</option>
                      <option value="es">Español</option>
                    </select>
                  </label>
                  <label className="typography-setting">
                    <span>{settingsText.style}</span>
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
                    <span>{settingsText.typeface}</span>
                    <select
                      value={suiteSettings.primaryFont}
                      onChange={(event) =>
                        suiteSettings.onPrimaryFontChange(event.target.value)
                      }
                    >
                      <option value="sans">{settingsText.sans}</option>
                      <option value="serif">{settingsText.serif}</option>
                      <option value="humanist">{settingsText.humanist}</option>
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
                    <h3>{settingsText.updateTitle}</h3>
                    <p>
                      {settingsText.updateDescription}
                    </p>
                  </div>
                </div>
                <dl>
                  <div>
                    <dt>{settingsText.installedVersion}</dt>
                    <dd>{suiteSettings.update.currentVersion}</dd>
                  </div>
                  <div>
                    <dt>{settingsText.platform}</dt>
                    <dd>{suiteSettings.update.platform}</dd>
                  </div>
                  <div>
                    <dt>{settingsText.applicationId}</dt>
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
                      ? settingsText.checking
                      : suiteSettings.update.status === "available"
                        ? settingsText.available.replace("{{version}}", suiteSettings.update.availableVersion ?? "")
                        : suiteSettings.update.status === "downloading"
                          ? settingsText.downloading.replace("{{version}}", suiteSettings.update.availableVersion ?? "")
                          : suiteSettings.update.status === "up-to-date"
                            ? settingsText.upToDate
                            : suiteSettings.update.status === "error"
                              ? settingsText.updateFailed
                              : settingsText.ready}
                  </strong>
                  <p>
                    {suiteSettings.update.error ??
                      settingsText.updaterReady}
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
                    <RefreshCw size={14} /> {settingsText.check}
                  </button>
                  {suiteSettings.update.status === "available" ? (
                    <button
                      type="button"
                      className="primary-action"
                      onClick={suiteSettings.update.onInstall}
                    >
                      {settingsText.install}
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
                    <h3>{settingsText.appearanceTitle}</h3>
                    <p>
                      {settingsText.appearanceDescription}
                    </p>
                  </div>
                </div>
                <div className="settings-control-panel">
                  {!suiteSettings ? <label className="typography-setting">
                    <span>{interfaceCopy.interfaceLanguage}</span>
                    <select value={localePreference} onChange={(event) => onLocalePreferenceChange(event.target.value as LocalePreference)}>
                      <option value="system">{interfaceCopy.system}</option>
                      <option value="en">English</option>
                      <option value="es">Español</option>
                    </select>
                  </label> : null}
                  {appearance}
                </div>
              </>
            ) : null}
            {section === "universe" && universe ? (
              <>
                <div className="settings-page-heading">
                  <BookOpen size={20} />
                  <div>
                    <h3>{settingsText.universeTitle}</h3>
                    <p>{settingsText.universeDescription}</p>
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
                    <h3>{settingsText.aboutTitle}</h3>
                    <p>
                      {settingsText.aboutDescription}
                    </p>
                  </div>
                </div>
                <dl>
                  <div>
                    <dt>{settingsText.version}</dt>
                    <dd>0.2.0</dd>
                  </div>
                  <div>
                    <dt>{settingsText.canonSafety}</dt>
                    <dd>{settingsText.canonValue}</dd>
                  </div>
                </dl>
                <button type="button" onClick={onOpenDocs}>
                  <ExternalLink size={14} /> {settingsText.documentation}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
