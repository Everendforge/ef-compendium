import type { Entity, SiteData, Story, StoryEvent } from "../types";
import { EntryBody } from "./EntryBody";
import { VaultAssetImage } from "./VaultAssetImage";
import type { ReaderNavigation } from "./Reader";

export function EventPage({
  site,
  story,
  event,
  navigate,
}: {
  site: SiteData;
  story: Story;
  event: StoryEvent;
  navigate: ReaderNavigation;
}) {
  const refs = event.canonRefs
    .map((id) => site.entities.find((entity) => entity.id === id))
    .filter((value): value is Entity => Boolean(value));

  return (
    <div className="entry-layout">
      <article className="entry">
        {event.coverImage ? (
          <VaultAssetImage
            path={event.coverImage}
            vaultPath={site.vaultPath}
            alt=""
            className="event-cover-image"
          />
        ) : null}
        {event.images && event.images.length > 1 ? (
          <div className="event-image-gallery" aria-label="Scene images">
            {event.images.slice(1).map((path) => (
              <VaultAssetImage
                key={path}
                path={path}
                vaultPath={site.vaultPath}
                alt=""
                className="event-scene-image"
              />
            ))}
          </div>
        ) : null}
        <div className="entry-heading">
          <p className="chapter">{story.name}</p>
          <h1>{event.name}</h1>
          {event.description ? <p>{event.description}</p> : null}
        </div>
        {event.html ? (
          <EntryBody
            html={event.html}
            vaultPath={site.vaultPath}
            navigate={navigate}
          />
        ) : null}
      </article>
      <aside className="related">
        <section>
          <h2>Canon references</h2>
          {refs.length ? (
            <ul>
              {refs.map((entity) => (
                <li key={entity.id}>
                  <button type="button" onClick={() => navigate(entity.route)}>
                    {entity.name}
                  </button>
                  <span>{entity.type}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No canon references in this scene.</p>
          )}
        </section>
      </aside>
    </div>
  );
}
