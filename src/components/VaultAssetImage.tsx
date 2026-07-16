import { useEffect, useState } from "react";
import { isTauriRuntime, vaultAssetDataUrl } from "../tauriBridge";

export function VaultAssetImage({
  path,
  vaultPath,
  alt,
  className,
}: {
  path: string;
  vaultPath: string;
  alt: string;
  className: string;
}) {
  const [url, setUrl] = useState<string>();

  useEffect(() => {
    setUrl(undefined);
    if (!isTauriRuntime() || !path) return;
    let disposed = false;
    void vaultAssetDataUrl(vaultPath, path)
      .then((dataUrl) => {
        if (!disposed) setUrl(dataUrl);
      })
      .catch(() => undefined);
    return () => {
      disposed = true;
    };
  }, [path, vaultPath]);

  return url ? <img src={url} alt={alt} className={className} /> : null;
}
