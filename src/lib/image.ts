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
 * FIX: Umgeht die kostenpflichtige Supabase Render-API und lädt die Bilder 
 * direkt und sicher über die kostenlose Public URL.
 */
export const buildRenderImageUrl = (
  storagePath: string | null | undefined,
  options: ImageRenderOptions = {},
): string => {
  // Leitet Anfragen direkt auf die Raw-Funktion um
  return buildRawImageUrl(storagePath, options);
};

/**
 * FIX: Umgeht ebenfalls die kostenpflichtige Supabase Render-API für den Page-Builder.
 */
export const buildStrictRenderImageUrl = (
  storagePath: string | null | undefined,
  options: ImageRenderOptions = {},
): string => {
  // Leitet Anfragen direkt auf die Raw-Funktion um
  return buildRawImageUrl(storagePath, options);
};

/**
 * Lädt rohe öffentliche Dateien direkt aus dem Bucket.
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
