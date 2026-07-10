import { useEffect, useMemo, useState } from "react";
import type { Entity, SiteData } from "../types";
import { findMarkdownAssets } from "../lib/markdown";
import { stableSlug } from "../lib/paths";
import { isTauriRuntime, vaultAssetDataUrl } from "../tauriBridge";
import type { ReaderNavigation } from "./Reader";

type MapDefinition = {
  entity: Entity;
  imagePath?: string;
  pins: Entity[];
};

export function mapDefinitions(site: SiteData): MapDefinition[] {
  const maps = site.entities.filter(
    (entity) => stableSlug(entity.type) === "map",
  );
  return maps.map((entity) => ({
    entity,
    imagePath: findMarkdownAssets(entity.body)[0],
    pins: site.entities.filter(
      (candidate) =>
        candidate.map !== undefined &&
        (candidate.map === entity.id || candidate.map === entity.name) &&
        candidate.mapX !== undefined &&
        candidate.mapY !== undefined,
    ),
  }));
}

export function MapsView({
  site,
  navigate,
}: {
  site: SiteData;
  navigate: ReaderNavigation;
}) {
  const maps = useMemo(() => mapDefinitions(site), [site]);
  const [activeId, setActiveId] = useState<string>();
  const active = maps.find((map) => map.entity.id === activeId) ?? maps[0];
  const [imageUrl, setImageUrl] = useState<string>();
  const [imageError, setImageError] = useState("");

  useEffect(() => {
    setImageUrl(undefined);
    setImageError("");
    if (!active?.imagePath) return;
    if (!isTauriRuntime()) {
      setImageError("Map images load in the desktop app.");
      return;
    }
    let disposed = false;
    void vaultAssetDataUrl(site.vaultPath, decodeURI(active.imagePath))
      .then((dataUrl) => {
        if (!disposed) setImageUrl(dataUrl);
      })
      .catch((error: unknown) => {
        if (!disposed) {
          setImageError(error instanceof Error ? error.message : String(error));
        }
      });
    return () => {
      disposed = true;
    };
  }, [active?.imagePath, site.vaultPath]);

  if (maps.length === 0) {
    return (
      <section className="page-title">
        <p className="chapter">Maps</p>
        <h1>No maps published yet.</h1>
        <p>
          Create an entity with <code>type: Map</code> whose body embeds the map
          image. Other entities can pin themselves with <code>map</code>,{" "}
          <code>mapX</code>, and <code>mapY</code> (0–100) frontmatter.
        </p>
      </section>
    );
  }

  return (
    <div className="maps-view">
      <header className="maps-header">
        <p className="chapter">Atlas</p>
        <h1>{active.entity.name}</h1>
        {maps.length > 1 ? (
          <div className="maps-tabs" role="tablist">
            {maps.map((map) => (
              <button
                key={map.entity.id}
                type="button"
                role="tab"
                aria-selected={map.entity.id === active.entity.id}
                className={map.entity.id === active.entity.id ? "active" : ""}
                onClick={() => setActiveId(map.entity.id)}
              >
                {map.entity.name}
              </button>
            ))}
          </div>
        ) : null}
      </header>
      <div className="map-stage">
        {imageUrl ? (
          <div className="map-frame">
            <img src={imageUrl} alt={active.entity.name} />
            {active.pins.map((pin) => (
              <button
                key={pin.id}
                type="button"
                className="map-pin"
                style={{ left: `${pin.mapX}%`, top: `${pin.mapY}%` }}
                title={pin.name}
                onClick={() => navigate(pin.route)}
              >
                <span className="map-pin-dot" />
                <span className="map-pin-label">{pin.name}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="map-placeholder">
            {active.imagePath
              ? imageError || "Loading map..."
              : "This map entity has no embedded image."}
          </div>
        )}
      </div>
      <footer className="maps-footer">
        <button type="button" onClick={() => navigate(active.entity.route)}>
          Read about {active.entity.name}
        </button>
        <span>{active.pins.length} pinned entries</span>
      </footer>
    </div>
  );
}
