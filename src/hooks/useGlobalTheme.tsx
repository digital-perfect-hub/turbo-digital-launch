import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { buildRenderImageUrl } from "@/lib/image";
import { useSiteContext } from "@/context/SiteContext";
import { DEFAULT_SITE_ID } from "@/lib/site";
import {
  applyThemeToRoot,
  defaultButtonTheme,
  defaultHeroTheme,
  defaultNavigationTheme,
  defaultSurfaceTheme,
  mergeThemeSettings,
  type GlobalThemeSettings as BaseThemeSettings,
} from "@/lib/theme-settings";

export type GlobalThemeSettings = BaseThemeSettings & {
  use_text_logo: boolean | null;
  text_logo_color_hex: string | null;
  show_logo_dot: boolean | null;
  logo_dot_color_hex: string | null;
  logo_font_family: string | null;
  nav_text_color_hex: string | null;
  nav_hover_color_hex: string | null;
  nav_font_weight: string | null;
  nav_font_style: string | null;
  nav_font_family: string | null;
  nav_show_underline: boolean | null;
  nav_underline_color_hex: string | null;
  nav_animate_underline: boolean | null;
  footer_bg_hex: string | null;
  footer_description: string | null;
  social_instagram_url: string | null;
  social_linkedin_url: string | null;
  show_socials: boolean | null;
  footer_nav_links: any | null;
  footer_legal_links: any | null;
  website_title: string | null;
  favicon_path: string | null;
  meta_title: string | null;
  meta_description: string | null;
  og_image_path: string | null;
  tracking_head_code: string | null;
  tracking_body_code: string | null;
  enable_tab_retention: boolean | null;
  tab_retention_texts: any | null;
};

const defaultTheme: GlobalThemeSettings = {
  ...mergeThemeSettings({
    id: "default",
    cta_hover_hex: "#E03A1E",
    company_name: "Digital-Perfect",
  }),
  primary_color_hex: "#FF4B2C",
  secondary_color_hex: "#0E1F53",
  accent_color_hex: "#0E1F53",
  bg_main_hex: "#F8FAFC",
  bg_card_hex: "#FFFFFF",
  text_main_hex: "#0F172A",
  text_muted_hex: "#64748B",
  border_color_hex: "#E2E8F0",
  border_radius: "1rem",
  company_name: "Digital-Perfect",
  logo_path: null,
  use_text_logo: false,
  text_logo_color_hex: "#0F172A",
  show_logo_dot: true,
  logo_dot_color_hex: null,
  logo_font_family: "default",
  cta_hover_hex: "#E03A1E",
  footer_bg_hex: "#020617",
  nav_text_color_hex: "#94A3B8",
  nav_hover_color_hex: "#FF4B2C",
  nav_font_weight: "bold",
  nav_font_style: "normal",
  nav_font_family: "default",
  nav_show_underline: false,
  nav_underline_color_hex: "#FF4B2C",
  nav_animate_underline: true,
  imprint_company: null,
  imprint_address: null,
  imprint_contact: null,
  imprint_legal: null,
  footer_description: "Premium Webdesign, SEO und digitale Vertriebsmaschinen.",
  social_instagram_url: null,
  social_linkedin_url: null,
  show_socials: true,
  footer_nav_links: [{ label: "Leistungen", url: "#leistungen" }, { label: "Projekte", url: "#portfolio" }],
  footer_legal_links: [{ label: "Impressum", url: "/impressum" }, { label: "Datenschutz", url: "/datenschutz" }],
  website_title: "Digital-Perfect",
  favicon_path: null,
  meta_title: null,
  meta_description: "Premium Webdesign & SEO",
  og_image_path: null,
  tracking_head_code: null,
  tracking_body_code: null,
  enable_tab_retention: true,
  tab_retention_texts: ["Komm doch zurück! 👋", "Wir vermissen dich 🥺"],
  navigation_theme: defaultNavigationTheme,
  hero_theme: defaultHeroTheme,
  surface_theme: defaultSurfaceTheme,
  button_theme: defaultButtonTheme,
};

export const useGlobalTheme = () => {
  const { activeSiteId } = useSiteContext();
  const siteId = activeSiteId || DEFAULT_SITE_ID;

  const { data, isLoading, error } = useQuery({
    queryKey: ["global_settings", siteId],
    enabled: Boolean(siteId),
    queryFn: async () => {
      const { data, error } = await supabase.from("global_settings").select("*").eq("site_id", siteId).limit(1).maybeSingle();
      if (error) throw error;
      return (data as unknown as Partial<GlobalThemeSettings> | null) ?? null;
    },
  });

  const settings = useMemo<GlobalThemeSettings>(() => {
    const mergedTheme = mergeThemeSettings(data as Partial<BaseThemeSettings> | null) as BaseThemeSettings;
    return {
      ...defaultTheme,
      ...(data || {}),
      ...mergedTheme,
      navigation_theme: mergedTheme.navigation_theme ?? defaultNavigationTheme,
      hero_theme: mergedTheme.hero_theme ?? defaultHeroTheme,
      surface_theme: mergedTheme.surface_theme ?? defaultSurfaceTheme,
      button_theme: mergedTheme.button_theme ?? defaultButtonTheme,
    };
  }, [data]);

  useEffect(() => {
    const root = document.documentElement;

    applyThemeToRoot(settings as BaseThemeSettings);

    root.style.setProperty("--cta-hover", settings.cta_hover_hex || settings.button_theme?.primary_background_color || settings.primary_color_hex || "#E03A1E");
    root.style.setProperty("--footer-bg", settings.footer_bg_hex || "var(--theme-secondary-hex)");

    if (settings.nav_text_color_hex) root.style.setProperty("--nav-text", settings.nav_text_color_hex);
    if (settings.nav_hover_color_hex) root.style.setProperty("--nav-hover-text", settings.nav_hover_color_hex);
    if (settings.nav_underline_color_hex) root.style.setProperty("--nav-underline", settings.nav_underline_color_hex);

    let baseTitle = "Digital-Perfect";
    if (settings.meta_title) {
      baseTitle = settings.meta_title;
    } else if (settings.website_title) {
      baseTitle = settings.website_title;
    } else if (settings.company_name) {
      baseTitle = settings.company_name;
    }
    document.title = baseTitle;

    if (settings.favicon_path) {
      const resolvedFavicon = buildRenderImageUrl(settings.favicon_path, { width: 128, quality: 100 });

      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = resolvedFavicon;
    }

    if (settings.enable_tab_retention !== false) {
      const retentionTexts = Array.isArray(settings.tab_retention_texts) && settings.tab_retention_texts.length > 0
        ? settings.tab_retention_texts
        : ["Komm doch zurück! 👋", "Wir vermissen dich 🥺"];

      let timeoutIds: number[] = [];

      const handleVisibilityChange = () => {
        if (document.hidden) {
          timeoutIds.forEach(window.clearTimeout);
          timeoutIds = [];

          if (retentionTexts.length > 0) {
            document.title = retentionTexts[0];
            for (let i = 1; i < retentionTexts.length; i++) {
              const timeoutId = window.setTimeout(() => {
                document.title = retentionTexts[i];
              }, i * 3000);
              timeoutIds.push(timeoutId);
            }
          }
        } else {
          timeoutIds.forEach(window.clearTimeout);
          timeoutIds = [];
          document.title = baseTitle;
        }
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);
      return () => {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        timeoutIds.forEach(window.clearTimeout);
      };
    }
  }, [settings]);

  const resolvedLogoUrl = settings.logo_path
    ? buildRenderImageUrl(settings.logo_path, { width: 320, quality: 80 })
    : "";

  return {
    settings,
    rawSettings: data ?? null,
    isLoading,
    error,
    logoUrl: resolvedLogoUrl,
  };
};
