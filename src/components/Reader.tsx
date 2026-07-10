import { useMemo } from "react";
import type { Entity, SiteData } from "../types";
import { BookComingSoon } from "./BookComingSoon";
import { CoverPage } from "./CoverPage";
import { EntryPage } from "./EntryPage";
import { EventPage } from "./EventPage";
import { GraphView } from "./GraphView";
import { mapDefinitions, MapsView } from "./MapsView";
import { StoriesIndex } from "./StoriesIndex";
import { StoryPage } from "./StoryPage";
import { TimelineView } from "./TimelineView";

export type ReaderMode = "web" | "book";

export type ReaderNavigation = (route: string) => void;

export function orderedTypes(site: SiteData) {
  const order = site.config.navigation?.typeOrder ?? [];
  return [...new Set(site.entities.map((entity) => entity.type))].sort((a, b) => {
    return (
      (order.indexOf(a) + 1 || 999) - (order.indexOf(b) + 1 || 999) ||
      a.localeCompare(b)
    );
  });
}

function TocSidebar({
  site,
  route,
  navigate,
}: {
  site: SiteData;
  route: string;
  navigate: ReaderNavigation;
}) {
  const types = useMemo(() => orderedTypes(site), [site]);
  const hasMaps = useMemo(() => mapDefinitions(site).length > 0, [site]);
  return (
    <aside className="toc" aria-label="Table of contents">
      <p className="toc-title">Table of Contents</p>
      {types.map((type) => (
        <section key={type}>
          <h2>{type}</h2>
          <ul>
            {site.entities
              .filter((entity) => entity.type === type)
              .map((entity) => (
                <li key={entity.id}>
                  <button
                    type="button"
                    className={route === entity.route ? "active" : ""}
                    onClick={() => navigate(entity.route)}
                  >
                    {entity.name}
                  </button>
                </li>
              ))}
          </ul>
        </section>
      ))}
      {site.stories.length > 0 ? (
        <section>
          <h2>Stories</h2>
          <ul>
            {site.stories.map((story) => (
              <li key={story.id}>
                <button
                  type="button"
                  className={route === story.route ? "active" : ""}
                  onClick={() => navigate(story.route)}
                >
                  {story.name}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {hasMaps ? (
        <section>
          <h2>Maps</h2>
          <ul>
            <li>
              <button
                type="button"
                className={route === "/maps/" ? "active" : ""}
                onClick={() => navigate("/maps/")}
              >
                Atlas
              </button>
            </li>
          </ul>
        </section>
      ) : null}
    </aside>
  );
}

function findEntity(site: SiteData, route: string): Entity | undefined {
  return site.entities.find((entity) => entity.route === route);
}

export function Reader({
  site,
  mode,
  route,
  navigate,
  refresh,
}: {
  site: SiteData;
  mode: ReaderMode;
  route: string;
  navigate: ReaderNavigation;
  refresh: () => void;
}) {
  if (mode === "book") {
    return <BookComingSoon />;
  }

  let content: React.ReactNode;
  if (route === "/" ) {
    content = <CoverPage site={site} navigate={navigate} />;
  } else if (route === "/stories/") {
    content = <StoriesIndex site={site} navigate={navigate} />;
  } else if (route === "/graph/") {
    content = <GraphView site={site} navigate={navigate} />;
  } else if (route === "/timeline/") {
    content = <TimelineView site={site} navigate={navigate} />;
  } else if (route === "/maps/") {
    content = <MapsView site={site} navigate={navigate} />;
  } else {
    const entity = findEntity(site, route);
    if (entity) {
      content = <EntryPage site={site} entity={entity} navigate={navigate} />;
    } else {
      const story = site.stories.find((candidate) => candidate.route === route);
      if (story) {
        content = <StoryPage site={site} story={story} navigate={navigate} />;
      } else {
        const match = site.stories
          .flatMap((candidate) =>
            candidate.sequences.flatMap((sequence) =>
              sequence.events.map((event) => ({ story: candidate, event })),
            ),
          )
          .find(({ event }) => event.route === route);
        if (match) {
          content = (
            <EventPage
              site={site}
              story={match.story}
              event={match.event}
              navigate={navigate}
            />
          );
        } else {
          content = (
            <section className="page-title">
              <p className="chapter">Not found</p>
              <h1>This page is not part of the published Compendium.</h1>
              <button type="button" className="primary-action" onClick={refresh}>
                Reload universe
              </button>
            </section>
          );
        }
      }
    }
  }

  const fullBleed = route === "/graph/" || route === "/maps/";
  return (
    <div className={`reader-shell ${fullBleed ? "full-bleed" : ""}`}>
      {!fullBleed ? <TocSidebar site={site} route={route} navigate={navigate} /> : null}
      <div className="reader-main">{content}</div>
    </div>
  );
}
