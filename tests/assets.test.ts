import { describe, expect, it } from "vitest";
import {
  presentationFromProperties,
  resolveVaultAssetPath,
} from "../src/lib/assets.js";
import { renderMarkdownWith } from "../src/lib/markdown.js";
import { sanitizeNode } from "../src/lib/node/render.js";

describe("vault asset integration", () => {
  it("resolves nested WorldNotion presentation values relative to the note", () => {
    const properties = JSON.stringify({
      entityTypes: {
        definitions: [
          {
            id: "character",
            presentation: { portraitPropertyId: "portrait" },
          },
        ],
      },
      customFields: {
        definitions: [
          {
            id: "identity",
            children: [{ id: "portrait", type: "image" }],
          },
        ],
      },
    });
    expect(
      presentationFromProperties(
        properties,
        "character",
        { identity: { portrait: "portrait.png" } },
        ["Characters/portrait.png"],
        "Characters/Mara.md",
      ),
    ).toEqual({ portrait: "Characters/portrait.png" });
  });

  it("keeps external markdown images external and rewrites local paths", () => {
    const html = renderMarkdownWith(
      "![remote](https://example.com/remote.png) ![local](Maps/region.png)",
      () => undefined,
      sanitizeNode,
      (asset) => resolveVaultAssetPath(["Maps/region.png"], undefined, asset),
    );
    expect(html).toContain('src="https://example.com/remote.png"');
    expect(html).toContain('src="/assets/Maps/region.png"');
  });
});
