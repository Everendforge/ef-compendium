import { useMemo, useRef, useState } from "react";
import type { SiteData } from "../types";
import type { ReaderNavigation } from "./Reader";

type SearchEntry = { name: string; type: string; route: string };

export function SearchBox({
  site,
  navigate,
}: {
  site: SiteData;
  navigate: ReaderNavigation;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const entries = useMemo<SearchEntry[]>(
    () => [
      ...site.entities.map((entity) => ({
        name: entity.name,
        type: entity.type,
        route: entity.route,
      })),
      ...site.stories.flatMap((story) =>
        story.sequences.flatMap((sequence) =>
          sequence.events.map((event) => ({
            name: event.name,
            type: story.name,
            route: event.route,
          })),
        ),
      ),
    ],
    [site],
  );

  const matches = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];
    return entries
      .filter((entry) =>
        `${entry.name} ${entry.type}`.toLowerCase().includes(trimmed),
      )
      .slice(0, 8);
  }, [entries, query]);

  return (
    <div className="search">
      <input
        ref={inputRef}
        type="search"
        placeholder="Search the Compendium..."
        autoComplete="off"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && matches.length > 0) {
            navigate(matches[0].route);
            setQuery("");
          }
          if (event.key === "Escape") setQuery("");
        }}
        aria-label="Search the Compendium"
      />
      {matches.length > 0 ? (
        <ul className="search-results">
          {matches.map((entry) => (
            <li key={entry.route}>
              <button
                type="button"
                onClick={() => {
                  navigate(entry.route);
                  setQuery("");
                }}
              >
                {entry.name} <span>· {entry.type}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
