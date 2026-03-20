import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { buildRenderImageUrl } from "@/lib/image";

export type GlobalThemeSettings = {
  id: string;
  primary_color_hex: string | null;
  secondary_color_hex: string | null;
  accent_color_hex: string | null;
  font_family: string | null;
  company_name: string | null;
  logo_path: string | null;
  imprint_company: string | null;
  imprint_address: string | null;
  imprint_contact: string | null;
  imprint_legal: string | null;
};

const FALLBACK_PRIMARY_HEX = "#FF4B2C";
const FALLBACK_SECONDARY_HEX = "#0E1F53";
const FALLBACK_ACCENT_HEX = "#0E1F53";
const FALLBACK_PRIMARY_TUPLE = "9 100% 59%";
const FALLBACK_SECONDARY_TUPLE = "225 71% 19%";
const FALLBACK_ACCENT_TUPLE = "225 71% 19%";

const defaultTheme: GlobalThemeSettings = {
  id: "default",
  primary_color_hex: FALLBACK_PRIMARY_HEX,
  secondary_color_hex: FALLBACK_SECONDARY_HEX,
  accent_color_hex: FALLBACK_ACCENT_HEX,
  font_family: "default",
  company_name: "Digital-Perfect Premium",
  logo_path: null,
  imprint_company: null,
  imprint_address: null,
  imprint_contact: null,
  imprint_legal: null,
};

type HslParts = {
  h: number;
  s: number;
  l: number;
};

const normalizeHex = (value: string | null | undefined): string | null => {
  if (!value) return null;

  let normalized = value.trim();
  if (!normalized) return null;
  if (!normalized.startsWith("#")) normalized = `#${normalized}`;

  const shortHexMatch = normalized.match(/^#([0-9a-fA-F]{3})$/);
  if (shortHexMatch) {
    const [, shortHex] = shortHexMatch;
    normalized = `#${shortHex
      .split("")
      .map((char) => `${char}${char}`)
      .join("")}`;
  }

  return /^#([0-9a-fA-F]{6})$/.test(normalized) ? normalized.toUpperCase() : null;
};

const hexToHslParts = (hex: string | null | undefined, fallback: HslParts): HslParts => {
  const normalizedHex = normalizeHex(hex);
  if (!normalizedHex) return fallback;

  const r = parseInt(normalizedHex.slice(1, 3), 16) / 255;
  const g = parseInt(normalizedHex.slice(3, 5), 16) / 255;
  const b = parseInt(normalizedHex.slice(5, 7), 16) / 255;

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

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
};

const parseFallbackTuple = (tuple: string): HslParts => {
  const [h = "0", s = "0%", l = "0%"] = tuple.split(" ");
  return {
    h: parseInt(h, 10),
    s: parseInt(s.replace("%", ""), 10),
    l: parseInt(l.replace("%", ""), 10),
  };
};

const toTuple = ({ h, s, l }: HslParts): string => `${h} ${s}% ${l}%`;

const shiftLightness = (parts: HslParts, amount: number, saturationShift = 0): string =>
  toTuple({
    h: parts.h,
    s: Math.max(8, Math.min(100, parts.s + saturationShift)),
    l: Math.max(4, Math.min(96, parts.l + amount)),
  });

const getReadableForeground = (parts: HslParts, darkFallback: string, lightFallback = "0 0% 100%") =>
  parts.l >= 62 ? darkFallback : lightFallback;

export const useGlobalTheme = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["global_settings"],
    queryFn: async (): Promise<GlobalThemeSettings | null> => {
      const { data, error } = await supabase
        .from("global_settings" as any)
        .select("*")
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return (data as unknown as GlobalThemeSettings | null) ?? null;
    },
  });

  const settings = useMemo<GlobalThemeSettings>(() => ({ ...defaultTheme, ...(data || {}) }), [data]);

  useEffect(() => {
    const root = document.documentElement;

    const primaryParts = hexToHslParts(settings.primary_color_hex, parseFallbackTuple(FALLBACK_PRIMARY_TUPLE));
    const secondaryParts = hexToHslParts(settings.secondary_color_hex, parseFallbackTuple(FALLBACK_SECONDARY_TUPLE));
    const accentParts = hexToHslParts(settings.accent_color_hex, parseFallbackTuple(FALLBACK_ACCENT_TUPLE));

    const primaryTuple = toTuple(primaryParts);
    const secondaryTuple = toTuple(secondaryParts);
    const accentTuple = toTuple(accentParts);

    const primaryForeground = getReadableForeground(primaryParts, secondaryTuple);
    const secondaryForeground = getReadableForeground(secondaryParts, "0 0% 100%", secondaryTuple);
    const accentForeground = getReadableForeground(accentParts, secondaryTuple);

    root.style.setProperty("--theme-primary-hex", normalizeHex(settings.primary_color_hex) ?? FALLBACK_PRIMARY_HEX);
    root.style.setProperty("--theme-secondary-hex", normalizeHex(settings.secondary_color_hex) ?? FALLBACK_SECONDARY_HEX);
    root.style.setProperty("--theme-accent-hex", normalizeHex(settings.accent_color_hex) ?? FALLBACK_ACCENT_HEX);

    root.style.setProperty("--primary", primaryTuple);
    root.style.setProperty("--primary-foreground", primaryForeground);
    root.style.setProperty("--secondary", secondaryTuple);
    root.style.setProperty("--secondary-foreground", secondaryForeground);
    root.style.setProperty("--accent", accentTuple);
    root.style.setProperty("--accent-foreground", accentForeground);
    root.style.setProperty("--ring", primaryTuple);

    root.style.setProperty("--gold", primaryTuple);
    root.style.setProperty("--gold-light", shiftLightness(primaryParts, 12, 6));
    root.style.setProperty("--gold-dark", shiftLightness(primaryParts, -12, -6));
    root.style.setProperty("--emerald", accentTuple);
    root.style.setProperty("--emerald-light", shiftLightness(accentParts, 10, 4));

    root.style.setProperty("--foreground", secondaryTuple);
    root.style.setProperty("--card-foreground", secondaryTuple);
    root.style.setProperty("--popover-foreground", secondaryTuple);
    root.style.setProperty("--hero-fg", secondaryTuple);
    root.style.setProperty("--muted-foreground", shiftLightness(secondaryParts, 28, -16));
    root.style.setProperty("--border", shiftLightness(secondaryParts, 74, -26));
    root.style.setProperty("--input", shiftLightness(secondaryParts, 74, -26));
    root.style.setProperty("--surface", shiftLightness(secondaryParts, 86, -20));
    root.style.setProperty("--surface-raised", "0 0% 100%");
    root.style.setProperty("--hero-bg", shiftLightness(secondaryParts, 86, -18));

    root.style.setProperty("--sidebar-background", shiftLightness(secondaryParts, -2));
    root.style.setProperty("--sidebar-foreground", "0 0% 100%");
    root.style.setProperty("--sidebar-primary", primaryTuple);
    root.style.setProperty("--sidebar-primary-foreground", "0 0% 100%");
    root.style.setProperty("--sidebar-accent", shiftLightness(primaryParts, 6, -4));
    root.style.setProperty("--sidebar-accent-foreground", "0 0% 100%");
    root.style.setProperty("--sidebar-border", shiftLightness(secondaryParts, 10));
    root.style.setProperty("--sidebar-ring", primaryTuple);

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
    rawSettings: data ?? null,
    isLoading,
    error,
    logoUrl,
  };
};
