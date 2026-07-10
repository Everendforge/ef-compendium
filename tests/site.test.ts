import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { renderMarkdown } from "../src/lib/node/render.js";
import { loadSite } from "../src/lib/node/site.js";
import { exportMarkdown } from "../src/lib/node/markdown-export.js";

const fixture = path.resolve("tests/fixtures/vault");

describe("Compendium source projection", () => {
  it("publishes only canon entities and resolves wikilinks/backlinks", () => {
    const site = loadSite(fixture);
    expect(site.entities.map((entity) => entity.id)).toEqual([
      "character:aster",
      "location:northwatch",
    ]);
    expect(site.entities[1].backlinks).toContain("character:aster");
    expect(site.entities[0].html).toContain("/location/location-northwatch/");
  });

  it("projects editorial PathBranching data and not executable state", () => {
    const site = loadSite(fixture);
    const story = site.stories[0];
    const event = story.sequences[0].events[0];
    expect(event).toMatchObject({
      name: "Arrival at Northwatch",
      canonRefs: ["character:aster", "location:northwatch"],
    });
    expect(JSON.stringify(event)).not.toContain("SECRET DECISION");
    expect(JSON.stringify(event)).not.toContain("hidden");
    expect(site.stories[1].sequences[0].events[0].name).toBe("Legacy scene");
  });

  it("removes unsafe HTML while retaining resolved internal links", () => {
    const html = renderMarkdown("<script>alert(1)</script> [[Aster]]", () => ({
      route: "/character/character-aster/",
      label: "Aster Vale",
    }));
    expect(html).not.toContain("script");
    expect(html).toContain("/character/character-aster/");
  });

  it("exports a portable Markdown bundle", () => {
    const output = fs.mkdtempSync(
      path.join(os.tmpdir(), "compendium-markdown-"),
    );
    exportMarkdown(loadSite(fixture), output);
    expect(
      fs.readFileSync(path.join(output, "manifest.json"), "utf8"),
    ).toContain("character:aster");
    expect(
      fs.readFileSync(path.join(output, "stories", "main.md"), "utf8"),
    ).toContain("Arrival at Northwatch");
    fs.rmSync(output, { recursive: true, force: true });
  });
});
