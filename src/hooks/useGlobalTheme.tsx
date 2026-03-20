import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { buildRenderImageUrl } from "@/lib/image";
import { applyThemeToRoot, mergeThemeSettings, type GlobalThemeSettings } from "@/lib/theme-settings";

const GLOBAL_SETTINGS_SELECT = `
  id,
  primary_color_hex,
  secondary_color_hex,
  accent_color_hex,
  font_family,
  heading_font_family,
  body_font_family,
  company_name,
  logo_path,
  imprint_company,
  imprint_address,
  imprint_contact,
  imprint_legal,
  navigation_theme,
  hero_theme,
  surface_theme,
  button_theme,
  bg_main_hex,
  bg_card_hex,
  text_main_hex,
  text_muted_hex,
  border_color_hex,
  border_radius,
  inserted_at,
  updated_at
`;

export const useGlobalTheme = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["global_settings"],
    queryFn: async (): Promise<Partial<GlobalThemeSettings> | null> => {
      const { data, error } = await supabase
        .from("global_settings")
        .select(GLOBAL_SETTINGS_SELECT)
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return (data as Partial<GlobalThemeSettings> | null) ?? null;
    },
  });

  const settings = useMemo(() => mergeThemeSettings(data), [data]);

  useEffect(() => {
    applyThemeToRoot(data);
  }, [data]);

  const logoUrl = buildRenderImageUrl(settings.logo_path, { width: 320, quality: 80 });

  return {
    settings,
    rawSettings: data ?? null,
    isLoading,
    error,
    logoUrl,
  };
};
