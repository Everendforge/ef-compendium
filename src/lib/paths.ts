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

function normalizePosix(relativePath: string) {
  const segments: string[] = [];
  for (const segment of relativePath.replaceAll("\\", "/").split("/")) {
    if (!segment || segment === ".") continue;
    if (segment === "..") {
      if (segments.length === 0 || segments[segments.length - 1] === "..") {
        segments.push("..");
      } else {
        segments.pop();
      }
      continue;
    }
    segments.push(segment);
  }
  return segments.join("/") || ".";
}

export function isSafeVaultPath(relativePath: string) {
  const forwarded = relativePath.replaceAll("\\", "/");
  const isAbsolute = forwarded.startsWith("/") || /^[a-zA-Z]:/.test(forwarded);
  const normalized = normalizePosix(relativePath);
  return !isAbsolute && normalized !== ".." && !normalized.startsWith("../");
}
