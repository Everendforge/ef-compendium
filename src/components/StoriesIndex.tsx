import type { SiteData } from "../types";
import type { ReaderNavigation } from "./Reader";

export function StoriesIndex({
  site,
  navigate,
}: {
  site: SiteData;
  navigate: ReaderNavigation;
}) {
  return (
    <>
      <section className="page-title">
        <p className="chapter">Narrative archive</p>
        <h1>Stories</h1>
        <p>
          Editorial scenes and their canon relationships, without
          interactive-game logic.
        </p>
      </section>
      <section className="story-list">
        {site.stories.map((story) => (
          <article key={story.id}>
            <h2>
              <button type="button" onClick={() => navigate(story.route)}>
                {story.name}
              </button>
            </h2>
            <p>
              {story.sequences.reduce(
                (total, sequence) => total + sequence.events.length,
                0,
              )}{" "}
              published scenes
            </p>
          </article>
        ))}
        {site.stories.length === 0 ? <p>No published stories yet.</p> : null}
      </section>
    </>
  );
}
