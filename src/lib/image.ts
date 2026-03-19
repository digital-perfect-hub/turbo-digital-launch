export type ImageRenderOptions = {
  width?: number;
  quality?: number;
};

/**
 * Builds a URL for the Render-API:
 * /render/image/public/<BUCKET>/<OBJECT_PATH>?width=600&quality=80
 *
 * The value from the database should be in the form "bucket/path/to/image.jpg".
 */
export const buildRenderImageUrl = (
  storagePath: string | null | undefined,
  options: ImageRenderOptions = {},
): string => {
  if (!storagePath) return "";

  const [bucket, ...rest] = storagePath.split("/");
  const objectPath = rest.join("/");

  if (!bucket || !objectPath) {
    // Fallback: return as-is if the format is unexpected
    return storagePath;
  }

  const width = options.width ?? 600;
  const quality = options.quality ?? 80;

  return `/render/image/public/${encodeURIComponent(bucket)}/${encodeURIComponent(
    objectPath,
  )}?width=${width}&quality=${quality}`;
};

