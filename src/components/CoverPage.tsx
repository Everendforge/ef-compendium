import { useEffect, useState } from "react";
import type { SiteData } from "../types";
import { isTauriRuntime, vaultAssetDataUrl } from "../tauriBridge";
import { orderedTypes, type ReaderNavigation } from "./Reader";

export function CoverPage({
  site,
  navigate,
}: {
  site: SiteData;
  navigate: ReaderNavigation;
}) {
  const featured = site.entities[0];
  const [coverUrl, setCoverUrl] = useState<string>();
  const coverImage = site.config.site?.coverImage;

  useEffect(() => {
    setCoverUrl(undefined);
    if (!coverImage || !isTauriRuntime()) return;
    let disposed = false;
    void vaultAssetDataUrl(site.vaultPath, coverImage)
      .then((dataUrl) => {
        if (!disposed) setCoverUrl(dataUrl);
      })
      .catch(() => undefined);
    return () => {
      disposed = true;
    };
  }, [coverImage, site.vaultPath]);

  const types = orderedTypes(site);
  return (
    <>
      <section
        className="cover"
        style={
          coverUrl
            ? {
                backgroundImage: `linear-gradient(90deg, rgba(3,18,29,.9), rgba(3,18,29,.2)), url('${coverUrl}')`,
              }
            : undefined
        }
      >
        <div>
          <p className="chapter">The living archive</p>
          <h1>{site.title}</h1>
          <p>{site.description}</p>
          {featured ? (
            <button
              type="button"
              className="action"
              onClick={() => navigate(featured.route)}
            >
              Begin reading
            </button>
          ) : null}
        </div>
      </section>
      <section className="intro">
        <p className="kicker">A world in reference</p>
        <h2>Every person, place, and story in one readable edition.</h2>
        <p>
          This Compendium is generated from portable Markdown canon and editorial
          story scenes. Follow links, explore related entries, or search the archive.
        </p>
      </section>
      <section className="directory">
        <h2>Browse the archive</h2>
        <div className="type-list">
          {types.map((type) => {
            const first = site.entities.find((entity) => entity.type === type);
            return (
              <button
                key={type}
                type="button"
                onClick={() => first && navigate(first.route)}
              >
                <span>{type}</span>
                <strong>
                  {site.entities.filter((entity) => entity.type === type).length}
                </strong>
              </button>
            );
          })}
        </div>
      </section>
      {site.warnings.length > 0 ? (
        <section className="warnings">
          <h2>Warnings</h2>
          <ul>
            {site.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}
