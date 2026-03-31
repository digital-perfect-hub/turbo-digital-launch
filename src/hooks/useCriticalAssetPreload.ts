import { useEffect, useMemo, useState } from "react";

const preloadImage = (src: string) =>
  new Promise<void>((resolve) => {
    const image = new Image();
    let settled = false;

    const finish = () => {
      if (settled) return;
      settled = true;
      resolve();
    };

    image.onload = () => {
      if (typeof image.decode === "function") {
        image.decode().catch(() => undefined).finally(finish);
        return;
      }
      finish();
    };

    image.onerror = finish;
    image.src = src;

    if (image.complete) {
      if (typeof image.decode === "function") {
        image.decode().catch(() => undefined).finally(finish);
      } else {
        finish();
      }
    }
  });

export const useCriticalAssetPreload = (sources: Array<string | null | undefined>) => {
  const sourceKey = sources.map((source) => String(source || "").trim()).filter(Boolean).join("||");
  const normalizedSources = useMemo(
    () => Array.from(new Set(sourceKey.split("||").map((source) => source.trim()).filter(Boolean))),
    [sourceKey],
  );
  const [isReady, setIsReady] = useState(normalizedSources.length === 0);

  useEffect(() => {
    let cancelled = false;

    if (normalizedSources.length === 0) {
      setIsReady(true);
      return;
    }

    setIsReady(false);

    Promise.all(normalizedSources.map(preloadImage))
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setIsReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [normalizedSources]);

  return {
    isReady,
    trackedAssets: normalizedSources,
  };
};
