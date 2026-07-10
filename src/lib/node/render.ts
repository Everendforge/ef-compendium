import sanitizeHtml from "sanitize-html";
import {
  ALLOWED_ATTRIBUTES,
  ALLOWED_SCHEMES,
  ALLOWED_TAGS,
  renderMarkdownWith,
  type LinkResolver,
  type Sanitizer,
} from "../markdown.js";

/** sanitize-html backed sanitizer used by the CLI/static-site pipeline. */
export const sanitizeNode: Sanitizer = (html) =>
  sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    allowedSchemes: ALLOWED_SCHEMES,
    allowProtocolRelative: false,
  });

export function renderMarkdown(body: string, resolveLink: LinkResolver) {
  return renderMarkdownWith(body, resolveLink, sanitizeNode);
}
