export type ImageRenderOptions = {
  width?: number;
  quality?: number;
};

type StorageLocation = {
  bucket: string;
  objectPath: string;
};

const SUPABASE_BASE_URL = (import.meta.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
const STORAGE_PUBLIC_SEGMENT = "/storage/v1/object/public/";
const STORAGE_RENDER_SEGMENT = "/storage/v1/render/image/public/";
const LEGACY_RENDER_SEGMENT = "/render/image/public/";
const BRANDING_BUCKET = "branding";
const BRANDING_OBJECT_PREFIX = "sites";

const encodeObjectPath = (objectPath: string) =>
  objectPath
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");

const toStorageBase = () => (SUPABASE_BASE_URL ? `${SUPABASE_BASE_URL}/storage/v1` : "/storage/v1");

const toRenderPath = (bucket: string, objectPath: string, options: ImageRenderOptions) => {
  const width = options.width ?? 600;
  const quality = options.quality ?? 80;
  const encodedBucket = encodeURIComponent(bucket);
  const encodedObjectPath = encodeObjectPath(objectPath);

  return `${toStorageBase()}/render/image/public/${encodedBucket}/${encodedObjectPath}?width=${width}&quality=${quality}`;
};

const toRawPath = (bucket: string, objectPath: string) => {
  const encodedBucket = encodeURIComponent(bucket);
  const encodedObjectPath = encodeObjectPath(objectPath);
  return `${toStorageBase()}/object/public/${encodedBucket}/${encodedObjectPath}`;
};

const inferStorageLocation = (segments: string[]): StorageLocation | null => {
  if (!segments.length) return null;

  if (segments[0] === BRANDING_OBJECT_PREFIX && segments.length >= 3) {
    return {
      bucket: BRANDING_BUCKET,
      objectPath: segments.join("/"),
    };
  }

  const [bucket, ...rest] = segments;
  if (!bucket || !rest.length) return null;

  return {
    bucket,
    objectPath: rest.join("/"),
  };
};

const normalizeKnownStoragePath = (value: string): StorageLocation | null => {
  const pathWithoutQuery = value.split("?")[0];

  for (const segment of [STORAGE_PUBLIC_SEGMENT, STORAGE_RENDER_SEGMENT, LEGACY_RENDER_SEGMENT]) {
    if (!pathWithoutQuery.includes(segment)) continue;

    const [, rawPath = ""] = pathWithoutQuery.split(segment);
    const decodedRawPath = decodeURIComponent(rawPath);
    return inferStorageLocation(decodedRawPath.split("/").filter(Boolean));
  }

  return null;
};

const resolveStorageLocation = (value: string): StorageLocation | null => {
  const normalizedKnownPath = normalizeKnownStoragePath(value);
  if (normalizedKnownPath) return normalizedKnownPath;

  return inferStorageLocation(value.split("?")[0].split("/").filter(Boolean));
};

/**
 * Builds a URL for the Supabase Render-API:
 * https://<project>.supabase.co/storage/v1/render/image/public/<BUCKET>/<OBJECT_PATH>?width=600&quality=80
 *
 * Supported DB formats:
 * - bucket/path/to/image.jpg
 * - sites/<siteId>/products/image.webp (implicit branding bucket)
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
      const normalized = resolveStorageLocation(`${url.pathname}${url.search}`);
      return normalized ? toRenderPath(normalized.bucket, normalized.objectPath, options) : trimmed;
    } catch {
      return trimmed;
    }
  }

  const normalizedStoragePath = resolveStorageLocation(trimmed);
  if (!normalizedStoragePath) return trimmed;

  return toRenderPath(normalizedStoragePath.bucket, normalizedStoragePath.objectPath, options);
};

/**
 * Architektur-Fix: Bypasst die Render-API und lädt das rohe Bild direkt aus dem öffentlichen Bucket.
 * Wird strategisch im Admin-Panel genutzt, um den 403 Forbidden Fehler des Free-Tiers zu umgehen.
 */
export const buildRawImageUrl = (
  storagePath: string | null | undefined,
  _options?: ImageRenderOptions,
): string => {
  if (!storagePath) return "";

  const trimmed = storagePath.trim();
  if (!trimmed) return "";

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const url = new URL(trimmed);
      const normalized = resolveStorageLocation(`${url.pathname}${url.search}`);
      return normalized ? toRawPath(normalized.bucket, normalized.objectPath) : trimmed;
    } catch {
      return trimmed;
    }
  }

  const normalizedStoragePath = resolveStorageLocation(trimmed);
  if (!normalizedStoragePath) return trimmed;

  return toRawPath(normalizedStoragePath.bucket, normalizedStoragePath.objectPath);
};
