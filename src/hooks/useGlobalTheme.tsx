import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { buildRenderImageUrl } from "@/lib/image";

export type GlobalThemeSettings = {
  id: string;
  primary_color_hex: string | null;
  secondary_color_hex: string | null;
  accent_color_hex: string | null;
  bg_main_hex: string | null;
  bg_card_hex: string | null;
  text_main_hex: string | null;
  text_muted_hex: string | null;
  border_color_hex: string | null;
  border_radius: string | null;
  font_family: string | null;
  company_name: string | null;
  logo_path: string | null;
  use_text_logo: boolean | null;
  text_logo_color_hex: string | null;
  show_logo_dot: boolean | null; // NEU
  logo_dot_color_hex: string | null; // NEU
  logo_font_family: string | null;
  cta_hover_hex: string | null;
  footer_bg_hex: string | null;
  imprint_company: string | null;
  imprint_address: string | null;
  imprint_contact: string | null;
  imprint_legal: string | null;
};

const defaultTheme: GlobalThemeSettings = {
  id: "default",
  primary_color_hex: "#FF4B2C",
  secondary_color_hex: "#0E1F53",
  accent_color_hex: "#0E1F53",
  bg_main_hex: "#F8FAFC",
  bg_card_hex: "#FFFFFF",
  text_main_hex: "#0F172A",
  text_muted_hex: "#64748B",
  border_color_hex: "#E2E8F0",
  border_radius: "1rem",
  font_family: "default",
  company_name: "Digital-Perfect",
  logo_path: null,
  use_text_logo: false,
  text_logo_color_hex: "#0F172A",
  show_logo_dot: true, // NEU
  logo_dot_color_hex: null, // NEU (Fallback ist Primary)
  logo_font_family: "default",
  cta_hover_hex: "#E03A1E",
  footer_bg_hex: "#020617",
  imprint_company: null,
  imprint_address: null,
  imprint_contact: null,
  imprint_legal: null,
};

const normalizeHex = (value: string | null | undefined): string | null => {
  if (!value) return null;
  let normalized = value.trim();
  if (!normalized.startsWith("#")) normalized = `#${normalized}`;
  return /^#([0-9a-fA-F]{6})$/.test(normalized) ? normalized.toUpperCase() : null;
};

const hexToHslParts = (hex: string | null | undefined, fallback: string): string => {
  const normalizedHex = normalizeHex(hex);
  if (!normalizedHex) return fallback;

  const r = parseInt(normalizedHex.slice(1, 3), 16) / 255;
  const g = parseInt(normalizedHex.slice(3, 5), 16) / 255;
  const b = parseInt(normalizedHex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const delta = max - min;
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r: h = ((g - b) / delta) % 6; break;
      case g: h = (b - r) / delta + 2; break;
      case b: h = (r - g) / delta + 4; break;
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }
  return `${h} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

export const useGlobalTheme = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["global_settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("global_settings").select("*").limit(1).maybeSingle();
      if (error) throw error;
      return (data as unknown as GlobalThemeSettings | null) ?? null;
    },
  });

  const settings = useMemo(() => ({ ...defaultTheme, ...(data || {}) }), [data]);

  useEffect(() => {
    const root = document.documentElement;

    root.style.setProperty("--primary", hexToHslParts(settings.primary_color_hex, "9 100% 59%"));
    root.style.setProperty("--secondary", hexToHslParts(settings.secondary_color_hex, "225 71% 19%"));
    root.style.setProperty("--accent", hexToHslParts(settings.accent_color_hex, "225 71% 19%"));
    
    root.style.setProperty("--background", hexToHslParts(settings.bg_main_hex, "210 38% 98%"));
    root.style.setProperty("--card", hexToHslParts(settings.bg_card_hex, "0 0% 100%"));
    root.style.setProperty("--foreground", hexToHslParts(settings.text_main_hex, "225 71% 19%"));
    root.style.setProperty("--muted-foreground", hexToHslParts(settings.text_muted_hex, "220 12% 42%"));
    root.style.setProperty("--border", hexToHslParts(settings.border_color_hex, "215 24% 88%"));
    root.style.setProperty("--radius", settings.border_radius || "1rem");

    if (settings.cta_hover_hex) root.style.setProperty("--cta-hover", settings.cta_hover_hex);
    if (settings.footer_bg_hex) root.style.setProperty("--footer-bg", settings.footer_bg_hex);

    if (settings.font_family === "jakarta") {
      root.style.setProperty("--app-font-heading", '"Plus Jakarta Sans", Inter, system-ui, sans-serif');
    } else if (settings.font_family === "serif") {
      root.style.setProperty("--app-font-heading", 'Georgia, "Times New Roman", serif');
    } else {
      root.style.setProperty("--app-font-heading", '"Plus Jakarta Sans", Inter, system-ui, sans-serif');
    }
  }, [settings]);

  const resolvedLogoUrl = settings.logo_path?.startsWith("http") 
    ? settings.logo_path 
    : buildRenderImageUrl(settings.logo_path, { width: 320, quality: 80 });

  return {
    settings,
    rawSettings: data ?? null,
    isLoading,
    error,
    logoUrl: resolvedLogoUrl,
  };
};