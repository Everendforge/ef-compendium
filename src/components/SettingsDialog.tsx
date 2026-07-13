import {
  BookOpen,
  ExternalLink,
  Palette,
  Settings2,
  Type,
  X,
} from "lucide-react";
import type { ReactNode } from "react";

export type SettingsSection = "appearance" | "universe" | "about";

export function SettingsDialog({
  section,
  onSectionChange,
  onClose,
  appearance,
  universe,
  onOpenDocs,
}: {
  section: SettingsSection;
  onSectionChange: (section: SettingsSection) => void;
  onClose: () => void;
  appearance: ReactNode;
  universe?: ReactNode;
  onOpenDocs: () => void;
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
          </nav>
          <div className="settings-dialog-content">
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
