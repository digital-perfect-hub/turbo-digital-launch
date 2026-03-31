import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { buildRenderImageUrl } from "@/lib/image";
import { DEFAULT_SITE_ID } from "@/lib/site";
import { useSiteContext } from "@/context/SiteContext";

export type HeroRecord = {
  badge_text?: string | null;
  headline?: string | null;
  subheadline?: string | null;
  cta_text?: string | null;
  stat1_label?: string | null;
  stat1_value?: string | null;
  stat2_label?: string | null;
  stat2_value?: string | null;
  stat3_label?: string | null;
  stat3_value?: string | null;
  image_url?: string | null;
  image_path?: string | null;
  image?: string | null;
  background_image_path?: string | null;
  background_mobile_image_path?: string | null;
  overlay_opacity?: number | null;
  visual_kicker?: string | null;
  visual_title?: string | null;
  visual_badge?: string | null;
  layer_kicker?: string | null;
  layer_title?: string | null;
  show_bottom_box1?: boolean | null;
  bottom_box1_kicker?: string | null;
  bottom_box1_title?: string | null;
  show_bottom_box2?: boolean | null;
  bottom_box2_kicker?: string | null;
  bottom_box2_title?: string | null;
};

const resolveImage = (path?: string | null) => {
  const trimmed = String(path || "").trim();
  if (!trimmed) return "";
  return buildRenderImageUrl(trimmed, { width: 1600, quality: 82 });
};

export const getCriticalHeroImageUrls = (hero: HeroRecord | null | undefined) => {
  if (!hero) return [];

  return Array.from(
    new Set(
      [
        resolveImage(hero.background_image_path),
        resolveImage(hero.background_mobile_image_path),
        resolveImage(hero.image_path || hero.image_url || hero.image),
      ].filter(Boolean),
    ),
  );
};

export const useHeroContent = () => {
  const { activeSiteId } = useSiteContext();
  const siteId = activeSiteId || DEFAULT_SITE_ID;

  const query = useQuery({
    queryKey: ["hero_content", siteId],
    enabled: Boolean(siteId),
    queryFn: async (): Promise<HeroRecord | null> => {
      const { data, error } = await supabase.from("hero_content").select("*").eq("site_id", siteId).limit(1).maybeSingle();
      if (error) throw error;
      return (data as HeroRecord | null) ?? null;
    },
  });

  return {
    hero: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
  };
};
