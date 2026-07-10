import fs from "node:fs";
import path from "node:path";
import type { SiteData } from "../../types.js";

const frontmatter = (entries: Record<string, string | string[] | undefined>) =>
  [
    "---",
    ...Object.entries(entries).flatMap(([key, value]) =>
      value === undefined
        ? []
        : [
            `${key}: ${Array.isArray(value) ? `[${value.join(", ")}]` : JSON.stringify(value)}`,
          ],
    ),
    "---",
    "",
  ].join("\n");

export function exportMarkdown(data: SiteData, outputPath: string) {
  fs.mkdirSync(outputPath, { recursive: true });
  fs.mkdirSync(path.join(outputPath, "stories"), { recursive: true });
  for (const entity of data.entities) {
    const file = path.join(
      outputPath,
      "entities",
      `${entity.id.replace(/[^a-z0-9_-]+/gi, "-")}.md`,
    );
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(
      file,
      frontmatter({
        id: entity.id,
        type: entity.type,
        name: entity.name,
        status: entity.status,
        tags: entity.tags,
      }) +
        entity.body +
        "\n",
    );
  }
  for (const story of data.stories) {
    const sections = story.sequences.flatMap((sequence) => [
      `## ${sequence.name}`,
      "",
      ...sequence.events.flatMap((event) => [
        `### ${event.name}`,
        "",
        event.description ?? event.text ?? "",
        "",
      ]),
    ]);
    fs.writeFileSync(
      path.join(
        outputPath,
        "stories",
        `${story.id.replace(/[^a-z0-9_-]+/gi, "-")}.md`,
      ),
      frontmatter({ id: story.id, type: "story", name: story.name }) +
        [`# ${story.name}`, "", ...sections].join("\n"),
    );
  }
  fs.writeFileSync(
    path.join(outputPath, "manifest.json"),
    JSON.stringify(
      {
        specVersion: "0.1",
        title: data.title,
        entities: data.entities.map(({ id, name, type }) => ({
          id,
          name,
          type,
        })),
        stories: data.stories.map(({ id, name }) => ({ id, name })),
      },
      null,
      2,
    ) + "\n",
  );
}
