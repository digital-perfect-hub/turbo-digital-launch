import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { buildRenderImageUrl } from "@/lib/image";

export type GlobalThemeSettings = {
  id: string;
  primary_color_hex: string | null;
  secondary_color_hex: string | null;
  font_family: string | null;
  company_name: string | null;
  logo_path: string | null;
  imprint_company: string | null;
  imprint_address: string | null;
  imprint_contact: string | null;
  imprint_legal: string | null;
};

const defaultTheme: GlobalThemeSettings = {
  id: "default",
  primary_color_hex: "#fbbf24",
  secondary_color_hex: "#d4af37",
  font_family: "default",
  company_name: "Digital-Perfect",
  logo_path: null,
  imprint_company: null,
  imprint_address: null,
  imprint_contact: null,
  imprint_legal: null,
};

const hexToHslTuple = (hex: string | null | undefined, fallback: string): string => {
  if (!hex) return fallback;

  let value = hex.trim();
  if (value.startsWith("#")) value = value.slice(1);
  if (value.length === 3) value = value.split("").map((c) => c + c).join("");
  if (value.length !== 6) return fallback;

  const r = parseInt(value.slice(0, 2), 16) / 255;
  const g = parseInt(value.slice(2, 4), 16) / 255;
  const b = parseInt(value.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));

    switch (max) {
      case r:
        h = ((g - b) / delta) % 6;
        break;
      case g:
        h = (b - r) / delta + 2;
        break;
      case b:
        h = (r - g) / delta + 4;
        break;
    }

    h *= 60;
    if (h < 0) h += 360;
  }

  const hRound = Math.round(h);
  const sRound = Math.round(s * 100);
  const lRound = Math.round(l * 100);

  return `${hRound} ${sRound}% ${lRound}%`;
};

export const useGlobalTheme = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["global_settings"],
    queryFn: async (): Promise<GlobalThemeSettings> => {
      const { data, error } = await supabase.from("global_settings" as any).select("*").limit(1).single();
      if (error) throw error;
      return data as unknown as GlobalThemeSettings;
    },
  });

  const settings = useMemo<GlobalThemeSettings>(
    () => ({ ...defaultTheme, ...(data || {}) }),
    [data],
  );

  useEffect(() => {
    const root = document.documentElement;

    const primaryHsl = hexToHslTuple(settings.primary_color_hex, "42 80% 50%");
    const secondaryHsl = hexToHslTuple(settings.secondary_color_hex, "155 60% 40%");

    root.style.setProperty("--primary", primaryHsl);
    root.style.setProperty("--secondary", secondaryHsl);
    root.style.setProperty("--accent", primaryHsl);
    root.style.setProperty("--ring", primaryHsl);
    root.style.setProperty("--gold", primaryHsl);

    // Keep gold gradients in sync with primary color
    const parts = primaryHsl.split(" ");
    const h = parts[0];
    const s = parts[1]; // includes trailing '%'
    const l = parseInt(parts[2]?.replace("%", "") || "50", 10);
    const goldLight = `${h} ${s} ${Math.min(l + 10, 92)}%`;
    const goldDark = `${h} ${s} ${Math.max(l - 18, 18)}%`;
    root.style.setProperty("--gold-light", goldLight);
    root.style.setProperty("--gold-dark", goldDark);

    if (settings.font_family === "jakarta") {
      root.style.setProperty("--app-font-heading", '"Plus Jakarta Sans", Inter, system-ui, sans-serif');
      root.style.setProperty("--app-font-body", "Inter, system-ui, sans-serif");
    } else if (settings.font_family === "serif") {
      root.style.setProperty("--app-font-heading", 'Georgia, "Times New Roman", serif');
      root.style.setProperty("--app-font-body", 'Georgia, "Times New Roman", serif');
    } else {
      root.style.setProperty("--app-font-heading", '"Plus Jakarta Sans", Inter, system-ui, sans-serif');
      root.style.setProperty("--app-font-body", "Inter, system-ui, sans-serif");
    }
  }, [settings]);

  const logoUrl = buildRenderImageUrl(settings.logo_path, { width: 320, quality: 80 });

  return {
    settings,
    isLoading,
    error,
    logoUrl,
  };
};

