import { supabase } from "@/integrations/supabase/client";

export const upsertSiteSetting = async (siteId: string, key: string, value: string) => {
  const { error } = await supabase
    .from("site_settings")
    .upsert({ site_id: siteId, key, value }, { onConflict: "site_id,key" });

  if (error) throw error;
};
