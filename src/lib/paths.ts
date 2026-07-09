import path from "node:path";

export function stableSlug(value: string) {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "entry"
  );
}

export function entityRoute(type: string, id: string) {
  return `/${stableSlug(type)}/${stableSlug(id)}/`;
}

export function storyRoute(id: string) {
  return `/stories/${stableSlug(id)}/`;
}

export function eventRoute(storyId: string, eventId: string) {
  return `/stories/${stableSlug(storyId)}/${stableSlug(eventId)}/`;
}

export function isSafeVaultPath(relativePath: string) {
  const normalized = path.posix.normalize(relativePath.replaceAll("\\", "/"));
  return (
    !path.isAbsolute(relativePath) &&
    normalized !== ".." &&
    !normalized.startsWith("../")
  );
}
