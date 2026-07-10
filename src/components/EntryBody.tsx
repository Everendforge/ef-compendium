import { useEffect, useRef } from "react";
import {
  isTauriRuntime,
  openExternal,
  vaultAssetDataUrl,
} from "../tauriBridge";
import type { ReaderNavigation } from "./Reader";

/**
 * Renders sanitized projection HTML. Internal links navigate in-app,
 * external links open in the system browser, and /assets/ images are
 * resolved from the vault through the Tauri backend.
 */
export function EntryBody({
  html,
  vaultPath,
  navigate,
}: {
  html: string;
  vaultPath: string;
  navigate: ReaderNavigation;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container || !isTauriRuntime()) return;
    for (const img of Array.from(container.querySelectorAll("img"))) {
      const src = img.getAttribute("src") ?? "";
      if (!src.startsWith("/assets/")) continue;
      const relativePath = decodeURI(src.slice("/assets/".length));
      img.removeAttribute("src");
      void vaultAssetDataUrl(vaultPath, relativePath)
        .then((dataUrl) => {
          img.src = dataUrl;
        })
        .catch(() => {
          img.alt = img.alt || relativePath;
        });
    }
  }, [html, vaultPath]);

  function handleClick(event: React.MouseEvent) {
    const anchor = (event.target as HTMLElement).closest("a");
    if (!anchor) return;
    const href = anchor.getAttribute("href") ?? "";
    if (href.startsWith("/")) {
      event.preventDefault();
      navigate(href);
    } else if (/^https?:/i.test(href)) {
      event.preventDefault();
      void openExternal(href);
    }
  }

  return (
    <div
      ref={ref}
      className="entry-body"
      onClick={handleClick}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
