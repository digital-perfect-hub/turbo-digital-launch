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
