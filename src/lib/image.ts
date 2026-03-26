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
 */
export const buildRenderImageUrl = (
  storagePath: string | null | undefined,
  options: ImageRenderOptions = {},
): string => {
  return buildRawImageUrl(storagePath, options);
};

/**
 * Erzwingt für den Page-Builder die Render-API-Ausgabe.
 * Fallbackt nur dann auf den Originalwert, wenn kein bekannter Storage-Pfad vorliegt.
 */
export const buildStrictRenderImageUrl = (
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
 * Lädt rohe öffentliche Dateien direkt aus dem Bucket.
 * Nur für Admin-Previews / Upload-Vorschauen gedacht.
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
