import { useMemo } from "react";
import type { Entity, SiteData } from "../types";
import type { ReaderNavigation } from "./Reader";

type TimelineEntry = {
  entity: Entity;
  label: string;
  sortValue: number;
};

/** Extracts the first number in a date-like string ("Year 1024", "1024-05-12"). */
function sortValueFor(value: string): number | undefined {
  const match = value.match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : undefined;
}

export function timelineEntries(site: SiteData): TimelineEntry[] {
  const entries: TimelineEntry[] = [];
  for (const entity of site.entities) {
    const dateValue = entity.date ?? entity.start;
    if (!dateValue) continue;
    const sortValue = sortValueFor(dateValue);
    if (sortValue === undefined) continue;
    const label = entity.end ? `${dateValue} – ${entity.end}` : dateValue;
    entries.push({ entity, label, sortValue });
  }
  return entries.sort(
    (left, right) =>
      left.sortValue - right.sortValue ||
      left.entity.name.localeCompare(right.entity.name),
  );
}

export function TimelineView({
  site,
  navigate,
}: {
  site: SiteData;
  navigate: ReaderNavigation;
}) {
  const entries = useMemo(() => timelineEntries(site), [site]);

  if (entries.length === 0) {
    return (
      <section className="page-title">
        <p className="chapter">Timeline</p>
        <h1>No dated entries yet.</h1>
        <p>
          Add a <code>date:</code> (or <code>start:</code> / <code>end:</code>)
          field to an entity's frontmatter to place it on the timeline.
        </p>
      </section>
    );
  }

  let lastEra: number | undefined;
  return (
    <>
      <section className="page-title">
        <p className="chapter">Chronology</p>
        <h1>Timeline</h1>
        <p>Every dated entry of the universe, in canonical order.</p>
      </section>
      <ol className="timeline">
        {entries.map(({ entity, label, sortValue }) => {
          const era = Math.trunc(sortValue);
          const showEra = era !== lastEra;
          lastEra = era;
          return (
            <li key={entity.id}>
              {showEra ? <p className="timeline-era">{era}</p> : null}
              <div className="timeline-item">
                <span className="timeline-date">{label}</span>
                <button type="button" onClick={() => navigate(entity.route)}>
                  {entity.name}
                </button>
                <span className="timeline-type">{entity.type}</span>
              </div>
            </li>
          );
        })}
      </ol>
    </>
  );
}
