export type ImageRenderOptions = {
  width?: number;
  quality?: number;
};

const SUPABASE_BASE_URL = (import.meta.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
const STORAGE_PUBLIC_SEGMENT = "/storage/v1/object/public/";
const STORAGE_RENDER_SEGMENT = "/storage/v1/render/image/public/";
const LEGACY_RENDER_SEGMENT = "/render/image/public/";

const encodeObjectPath = (objectPath: string) =>
  objectPath
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");

const toRenderPath = (bucket: string, objectPath: string, options: ImageRenderOptions) => {
  const width = options.width ?? 600;
  const quality = options.quality ?? 80;
  const encodedBucket = encodeURIComponent(bucket);
  const encodedObjectPath = encodeObjectPath(objectPath);
  const base = SUPABASE_BASE_URL ? `${SUPABASE_BASE_URL}/storage/v1` : "/storage/v1";

  return `${base}/render/image/public/${encodedBucket}/${encodedObjectPath}?width=${width}&quality=${quality}`;
};

const normalizeKnownStoragePath = (value: string, options: ImageRenderOptions) => {
  const pathWithoutQuery = value.split("?")[0];

  for (const segment of [STORAGE_PUBLIC_SEGMENT, STORAGE_RENDER_SEGMENT, LEGACY_RENDER_SEGMENT]) {
    if (!pathWithoutQuery.includes(segment)) continue;

    const [, rawPath = ""] = pathWithoutQuery.split(segment);
    const decodedRawPath = decodeURIComponent(rawPath);
    const [bucket, ...rest] = decodedRawPath.split("/").filter(Boolean);

    if (bucket && rest.length) {
      return toRenderPath(bucket, rest.join("/"), options);
    }
  }

  return null;
};

/**
 * Builds a URL for the Supabase Render-API:
 * https://<project>.supabase.co/storage/v1/render/image/public/<BUCKET>/<OBJECT_PATH>?width=600&quality=80
 *
 * Supported DB formats:
 * - bucket/path/to/image.jpg
 * - /storage/v1/object/public/bucket/path/to/image.jpg
 * - https://.../storage/v1/object/public/bucket/path/to/image.jpg
 * - /storage/v1/render/image/public/bucket/path/to/image.jpg?... 
 * - https://.../storage/v1/render/image/public/bucket/path/to/image.jpg?... 
 * - legacy /render/image/public/... URLs are normalized too
 */
export const buildRenderImageUrl = (
  storagePath: string | null | undefined,
  options: ImageRenderOptions = {},
): string => {
  if (!storagePath) return "";

  const trimmed = storagePath.trim();
  if (!trimmed) return "";

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const url = new URL(trimmed);
      const normalized = normalizeKnownStoragePath(url.pathname, options);
      return normalized ?? trimmed;
    } catch {
      return trimmed;
    }
  }

  const normalizedStoragePath = normalizeKnownStoragePath(trimmed, options);
  if (normalizedStoragePath) return normalizedStoragePath;

  const [bucket, ...rest] = trimmed.split("/");
  const objectPath = rest.join("/");

  if (!bucket || !objectPath) {
    return trimmed;
  }

  return toRenderPath(bucket, objectPath, options);
};
