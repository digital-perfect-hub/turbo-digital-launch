export type ImageRenderOptions = {
  width?: number;
  quality?: number;
};

const STORAGE_PUBLIC_SEGMENT = "/storage/v1/object/public/";
const STORAGE_RENDER_SEGMENT = "/storage/v1/render/image/public/";

const toRenderPath = (bucket: string, objectPath: string, options: ImageRenderOptions) => {
  const width = options.width ?? 600;
  const quality = options.quality ?? 80;

  return `/render/image/public/${encodeURIComponent(bucket)}/${encodeURIComponent(objectPath)}?width=${width}&quality=${quality}`;
};

/**
 * Builds a URL for the Render-API:
 * /render/image/public/<BUCKET>/<OBJECT_PATH>?width=600&quality=80
 *
 * Supported DB formats:
 * - bucket/path/to/image.jpg
 * - /storage/v1/object/public/bucket/path/to/image.jpg
 * - full https://.../storage/v1/object/public/bucket/path/to/image.jpg
 * - existing /render/image/public/... URLs are normalized with width/quality params
 */
export const buildRenderImageUrl = (
  storagePath: string | null | undefined,
  options: ImageRenderOptions = {},
): string => {
  if (!storagePath) return "";

  const trimmed = storagePath.trim();
  if (!trimmed) return "";

  const width = options.width ?? 600;
  const quality = options.quality ?? 80;

  const normalizeStorageSegments = (value: string) => {
    if (value.includes(STORAGE_PUBLIC_SEGMENT)) {
      const [, rawPath = ""] = value.split(STORAGE_PUBLIC_SEGMENT);
      const [bucket, ...rest] = rawPath.split("/");
      if (bucket && rest.length) return toRenderPath(bucket, rest.join("/"), { width, quality });
    }

    if (value.includes(STORAGE_RENDER_SEGMENT)) {
      const [, rawPath = ""] = value.split(STORAGE_RENDER_SEGMENT);
      const [bucket, ...rest] = rawPath.split("/");
      if (bucket && rest.length) return toRenderPath(bucket, decodeURIComponent(rest.join("/")), { width, quality });
    }

    return null;
  };

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const url = new URL(trimmed);
      const normalized = normalizeStorageSegments(url.pathname);
      return normalized ?? trimmed;
    } catch {
      return trimmed;
    }
  }

  const normalizedStoragePath = normalizeStorageSegments(trimmed);
  if (normalizedStoragePath) return normalizedStoragePath;

  const [bucket, ...rest] = trimmed.split("/");
  const objectPath = rest.join("/");

  if (!bucket || !objectPath) {
    return trimmed;
  }

  return toRenderPath(bucket, objectPath, { width, quality });
};
