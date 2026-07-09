import fs from "node:fs";
import path from "node:path";
import type { Story, StoryEvent } from "../types.js";
import { eventRoute, stableSlug, storyRoute } from "./paths.js";

type Json = Record<string, unknown>;
const readJson = (file: string): Json | undefined => {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")) as Json;
  } catch {
    return undefined;
  }
};
const list = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
const record = (value: unknown): Json | undefined =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Json)
    : undefined;
const valueString = (value: unknown) =>
  typeof value === "string" ? value : undefined;
const pbSlug = (value: string) => stableSlug(value);

function eventFrom(value: Json, storyId: string): StoryEvent | undefined {
  const event = record(value.event) ?? value;
  const id = valueString(event.id);
  const name = valueString(event.name);
  if (!id || !name) return undefined;
  const text = record(event.text);
  return {
    id,
    name,
    description: valueString(event.description),
    text: text ? valueString(text.content) : undefined,
    canonRefs: list(event.canonRefs),
    route: eventRoute(storyId, id),
  };
}

function legacyStory(value: Json, id: string, name: string): Story {
  const events = (Array.isArray(value.events) ? value.events : [])
    .map((item) => record(item))
    .filter((item): item is Json => Boolean(item))
    .map((item) => eventFrom(item, id))
    .filter((item): item is StoryEvent => Boolean(item));
  return {
    id,
    name: valueString(value.name) ?? name,
    route: storyRoute(id),
    sequences: [{ id: "legacy", name: "Scenes", events }],
  };
}

export function readStories(vaultPath: string, warnings: string[]): Story[] {
  const root = path.join(vaultPath, ".everend", ".pathbranching");
  const manifest = readJson(path.join(root, "manifest.json"));
  const entries = Array.isArray(manifest?.stories) ? manifest.stories : [];
  const stories: Story[] = [];
  for (const entryValue of entries) {
    const entry = record(entryValue);
    const id = entry && valueString(entry.id);
    const name = entry && valueString(entry.name);
    const relative = entry && valueString(entry.path);
    if (!id || !name || !relative || relative.includes("..")) {
      warnings.push("Ignored an invalid PathBranching story manifest entry.");
      continue;
    }
    const saved = readJson(path.join(vaultPath, relative));
    if (!saved) {
      warnings.push(`Could not read PathBranching story ${name}.`);
      continue;
    }
    if (relative.endsWith(".pathbranching.json")) {
      stories.push(legacyStory(saved, id, name));
      continue;
    }
    const sequences = list(saved.sequenceIds).flatMap((sequenceId) => {
      const sequenceFile = path.join(
        root,
        "stories",
        pbSlug(id),
        "sequences",
        pbSlug(sequenceId),
        "sequence.json",
      );
      const sequenceSource = readJson(sequenceFile);
      const sequence = sequenceSource
        ? (record(sequenceSource.sequence) ?? sequenceSource)
        : undefined;
      if (!sequence) {
        warnings.push(`Could not read sequence ${sequenceId} in ${name}.`);
        return [];
      }
      const eventIds = list(sequence.eventIds);
      const events = eventIds.flatMap((eventId) => {
        const eventFile = path.join(
          root,
          "stories",
          pbSlug(id),
          "sequences",
          pbSlug(sequenceId),
          "events",
          `${pbSlug(eventId)}.json`,
        );
        const event = readJson(eventFile);
        const projected = event && eventFrom(event, id);
        return projected ? [projected] : [];
      });
      return [
        {
          id: sequenceId,
          name: valueString(sequence.name) ?? sequenceId,
          events,
        },
      ];
    });
    stories.push({
      id,
      name: valueString(saved.name) ?? name,
      route: storyRoute(id),
      sequences,
    });
  }
  return stories;
}
