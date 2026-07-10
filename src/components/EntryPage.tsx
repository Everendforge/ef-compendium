import type { Entity, SiteData } from "../types";
import { EntryBody } from "./EntryBody";
import type { ReaderNavigation } from "./Reader";

export function EntryPage({
  site,
  entity,
  navigate,
}: {
  site: SiteData;
  entity: Entity;
  navigate: ReaderNavigation;
}) {
  const related = entity.backlinks
    .map((id) => site.entities.find((candidate) => candidate.id === id))
    .filter((value): value is Entity => Boolean(value));
  const appearances = site.stories.flatMap((story) =>
    story.sequences.flatMap((sequence) =>
      sequence.events
        .filter((event) => event.canonRefs.includes(entity.id))
        .map((event) => ({ event, story })),
    ),
  );

  return (
    <div className="entry-layout">
      <article className="entry">
        <div className="entry-heading">
          <p className="chapter">{entity.type}</p>
          <h1>{entity.name}</h1>
          {entity.tags.length > 0 ? (
            <p className="tags">{entity.tags.join(" · ")}</p>
          ) : null}
        </div>
        <EntryBody html={entity.html} vaultPath={site.vaultPath} navigate={navigate} />
      </article>
      <aside className="related">
        <section>
          <h2>Related entries</h2>
          {related.length ? (
            <ul>
              {related.map((item) => (
                <li key={item.id}>
                  <button type="button" onClick={() => navigate(item.route)}>
                    {item.name}
                  </button>
                  <span>{item.type}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No published backlinks yet.</p>
          )}
        </section>
        <section>
          <h2>Appears in stories</h2>
          {appearances.length ? (
            <ul>
              {appearances.map(({ event, story }) => (
                <li key={event.route}>
                  <button type="button" onClick={() => navigate(event.route)}>
                    {event.name}
                  </button>
                  <span>{story.name}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No published scenes reference this entry.</p>
          )}
        </section>
      </aside>
    </div>
  );
}
