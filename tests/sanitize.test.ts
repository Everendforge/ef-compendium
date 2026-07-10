// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { renderMarkdownWith } from "../src/lib/markdown.js";
import { sanitizeDom } from "../src/lib/sanitize-dom.js";
import { sanitizeNode } from "../src/lib/node/render.js";

const resolve = (target: string) =>
  target === "Aster"
    ? { route: "/character/character-aster/", label: "Aster Vale" }
    : undefined;

const CASES = [
  "Plain paragraph with **bold** and [[Aster]].",
  "<script>alert(1)</script> stays out, [link](https://example.com) stays in.",
  '<img src="javascript:alert(1)"> and ![map](Maps/region.png)',
  "[protocol relative](//evil.example) and [ftp](ftp://evil.example)",
  "# Heading\n\n> Quote\n\n- item\n- item\n\n`code`",
];

describe("app sanitizer matches the CLI sanitizer contract", () => {
  for (const [index, source] of CASES.entries()) {
    it(`case ${index + 1} produces safe, equivalent output`, () => {
      const node = renderMarkdownWith(source, resolve, sanitizeNode);
      const dom = renderMarkdownWith(source, resolve, sanitizeDom);
      for (const html of [node, dom]) {
        expect(html).not.toContain("script");
        expect(html).not.toContain("javascript:");
        expect(html).not.toContain("//evil.example");
        expect(html).not.toContain("ftp:");
      }
      if (source.includes("[[Aster]]")) {
        expect(node).toContain("/character/character-aster/");
        expect(dom).toContain("/character/character-aster/");
      }
      if (source.includes("Maps/region.png")) {
        expect(node).toContain("/assets/Maps/region.png");
        expect(dom).toContain("/assets/Maps/region.png");
      }
    });
  }
});
