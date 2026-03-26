import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_SITE_ID } from "@/lib/site";

const getFileExtension = (fileName: string) => {
  const segments = fileName.split(".");
  return segments.length > 1 ? segments.pop()?.toLowerCase() || "bin" : "bin";
};

export const buildSiteAssetPath = (siteId: string | null | undefined, folder: string, file: File) => {
  const safeSiteId = siteId || DEFAULT_SITE_ID;
  const fileExt = getFileExtension(file.name);
  return `sites/${safeSiteId}/${folder}/${crypto.randomUUID()}.${fileExt}`;
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
