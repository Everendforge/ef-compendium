import DOMPurify from "dompurify";
import { ALLOWED_TAGS, type Sanitizer } from "./markdown.js";

const SCHEME = /^[a-z][a-z0-9+.-]*:/i;

let hooked = false;
function ensureHook() {
  if (hooked) return;
  hooked = true;
  // Match the CLI sanitizer contract: only http/https absolute URLs,
  // relative URLs allowed, protocol-relative URLs rejected.
  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    for (const attribute of ["href", "src"]) {
      const value = node.getAttribute?.(attribute);
      if (!value) continue;
      const trimmed = value.trim();
      const scheme = trimmed.match(SCHEME);
      const disallowedScheme = scheme && !/^https?:$/i.test(scheme[0]);
      if (disallowedScheme || trimmed.startsWith("//")) {
        node.removeAttribute(attribute);
      }
    }
  });
}

/** DOMPurify backed sanitizer used by the desktop app renderer. */
export const sanitizeDom: Sanitizer = (html) => {
  ensureHook();
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: ["href", "title", "src", "alt"],
  });
};
