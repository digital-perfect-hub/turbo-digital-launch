import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_SITE_ID } from "@/lib/site";
import { buildRawImageUrl } from "@/lib/image";

const getFileExtension = (fileName: string) => {
  const segments = fileName.split(".");
  return segments.length > 1 ? segments.pop()?.toLowerCase() || "bin" : "bin";
};

export const buildSiteAssetPath = (siteId: string | null | undefined, folder: string, file: File) => {
  const safeSiteId = siteId || DEFAULT_SITE_ID;
  const fileExt = getFileExtension(file.name);
  return `sites/${safeSiteId}/${folder}/${crypto.randomUUID()}.${fileExt}`;
};

const persistMediaAssetRecord = async ({
  siteId,
  file,
  filePath,
  folder,
  title,
  altText,
}: {
  siteId: string | null | undefined;
  file: File;
  filePath: string;
  folder?: string;
  title?: string;
  altText?: string;
}) => {
  if (!siteId) return;

  const payload = {
    site_id: siteId,
    bucket: "branding",
    storage_path: filePath,
    public_url: buildRawImageUrl(filePath),
    title: title?.trim() || file.name,
    alt_text: altText?.trim() || null,
    folder: folder || "landing-pages",
    mime_type: file.type || null,
    file_size: Number.isFinite(file.size) ? file.size : null,
  };

  const { error } = await supabase.from("media_assets" as never).insert(payload as never);
  if (error && !String(error.message || "").toLowerCase().includes("duplicate")) {
    throw error;
  }
};

export const uploadBrandingAsset = async (file: File, folder: string, siteId?: string | null) => {
  const filePath = buildSiteAssetPath(siteId, folder, file);

  const { error } = await supabase.storage.from("branding").upload(filePath, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) throw error;

  return filePath;
};

export const uploadSupportAttachment = async (ticketId: string, file: File) => {
  const filePath = `${ticketId}/${buildSiteAssetPath(null, "attachments", file).split('/').pop()}`;

  const { error } = await supabase.storage.from("support-attachments").upload(filePath, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) throw error;

  return filePath;
};

export const createSupportAttachmentSignedUrl = async (filePath: string, expiresIn = 60 * 10) => {
  const { data, error } = await supabase.storage.from("support-attachments").createSignedUrl(filePath, expiresIn);
  if (error) throw error;
  return data.signedUrl;
};

export const uploadLandingPageAsset = async (
  file: File,
  siteId?: string | null,
  options?: { folder?: string; title?: string; altText?: string },
) => {
  const folder = options?.folder || "landing-pages";
  const filePath = buildSiteAssetPath(siteId, folder, file);

  const { error } = await supabase.storage.from("branding").upload(filePath, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) throw error;

  await persistMediaAssetRecord({
    siteId,
    file,
    filePath,
    folder,
    title: options?.title,
    altText: options?.altText,
  });

  return filePath;
};

export const uploadManagedMediaAsset = async (
  file: File,
  siteId?: string | null,
  options?: { folder?: string; title?: string; altText?: string },
) => {
  const filePath = await uploadLandingPageAsset(file, siteId, options);
  return {
    storage_path: filePath,
    public_url: buildRawImageUrl(filePath),
  };
};
