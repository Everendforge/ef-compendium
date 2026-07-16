import type { SourceFile, Story, StoryEvent } from "../types.js";
import { eventRoute, stableSlug, storyRoute } from "./paths.js";

type Json = Record<string, unknown>;
type Asset = { id: string; path: string; kind?: string };

const PB_ROOT = ".everend/.pathbranching";

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

function eventFrom(
  value: Json,
  storyId: string,
  assets: Map<string, string> = new Map(),
): StoryEvent | undefined {
  const event = record(value.event) ?? value;
  const id = valueString(event.id);
  const name = valueString(event.name);
  if (!id || !name) return undefined;
  const text = record(event.text);
  const cover = record(event.coverImage);
  const coverAssetId = cover && valueString(cover.assetId);
  const imagePaths = new Set<string>();
  if (coverAssetId && assets.has(coverAssetId)) {
    imagePaths.add(assets.get(coverAssetId)!);
  }
  const collectBeatImages = (value: unknown) => {
    const beat = record(value);
    const sceneImage = record(beat?.sceneImage);
    const assetId = sceneImage && valueString(sceneImage.assetId);
    const assetPath = assetId ? assets.get(assetId) : undefined;
    if (assetPath) imagePaths.add(assetPath);
  };
  (Array.isArray(event.dialogueBeats) ? event.dialogueBeats : []).forEach(
    collectBeatImages,
  );
  (Array.isArray(event.dialogues) ? event.dialogues : []).forEach((value) => {
    const dialogue = record(value);
    (Array.isArray(dialogue?.beats) ? dialogue.beats : []).forEach(
      collectBeatImages,
    );
  });
  return {
    id,
    name,
    description: valueString(event.description),
    text: text ? valueString(text.content) : undefined,
    canonRefs: list(event.canonRefs),
    coverImage: coverAssetId ? assets.get(coverAssetId) : undefined,
    images: imagePaths.size ? [...imagePaths] : undefined,
    route: eventRoute(storyId, id),
    html: "",
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

export function projectStories(
  files: SourceFile[],
  warnings: string[],
): Story[] {
  const byPath = new Map<string, string>();
  for (const file of files) {
    byPath.set(file.relativePath.replaceAll("\\", "/"), file.content);
  }
  const readJson = (relativePath: string): Json | undefined => {
    const content = byPath.get(relativePath);
    if (content === undefined) return undefined;
    try {
      return JSON.parse(content) as Json;
    } catch {
      return undefined;
    }
  };

  const manifest = readJson(`${PB_ROOT}/manifest.json`);
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
    const saved = readJson(relative.replaceAll("\\", "/"));
    if (!saved) {
      warnings.push(`Could not read PathBranching story ${name}.`);
      continue;
    }
    const assets = new Map(
      (Array.isArray(saved.assets) ? saved.assets : [])
        .map((item) => record(item))
        .filter((item): item is Json => Boolean(item))
        .flatMap((item) => {
          const asset: Asset = {
            id: valueString(item.id) ?? "",
            path: valueString(item.path) ?? "",
            kind: valueString(item.kind),
          };
          return asset.id && asset.path && asset.kind === "image"
            ? [[asset.id, asset.path] as const]
            : [];
        }),
    );
    if (relative.endsWith(".pathbranching.json")) {
      stories.push(legacyStory(saved, id, name));
      continue;
    }
    const sequences = list(saved.sequenceIds).flatMap((sequenceId) => {
      const sequenceFile = `${PB_ROOT}/stories/${pbSlug(id)}/sequences/${pbSlug(sequenceId)}/sequence.json`;
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
        const eventFile = `${PB_ROOT}/stories/${pbSlug(id)}/sequences/${pbSlug(sequenceId)}/events/${pbSlug(eventId)}.json`;
        const event = readJson(eventFile);
        const projected = event && eventFrom(event, id, assets);
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
