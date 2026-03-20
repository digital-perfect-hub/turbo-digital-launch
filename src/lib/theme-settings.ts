import type { Json } from "@/integrations/supabase/types";

export type FontOption = "default" | "jakarta" | "inter" | "serif" | "space-grotesk";

export type NavigationTheme = {
  background_color: string | null;
  text_color: string | null;
  muted_text_color: string | null;
  border_color: string | null;
  hover_background_color: string | null;
  hover_text_color: string | null;
  cta_background_color: string | null;
  cta_text_color: string | null;
  topbar_background_color: string | null;
  topbar_text_color: string | null;
  topbar_accent_color: string | null;
  logo_badge_background_color: string | null;
  logo_badge_text_color: string | null;
};

export type HeroTheme = {
  background_color: string | null;
  overlay_color: string | null;
  badge_background_color: string | null;
  badge_text_color: string | null;
  headline_color: string | null;
  headline_highlight_color: string | null;
  subheadline_color: string | null;
  secondary_button_background_color: string | null;
  secondary_button_text_color: string | null;
  secondary_button_border_color: string | null;
  stat_card_background_color: string | null;
  stat_value_color: string | null;
  stat_label_color: string | null;
  proof_card_background_color: string | null;
  proof_text_color: string | null;
  proof_icon_background_color: string | null;
  proof_icon_color: string | null;
  visual_panel_background_color: string | null;
  visual_panel_text_color: string | null;
};

export type SurfaceTheme = {
  page_background_color: string | null;
  section_background_color: string | null;
  card_background_color: string | null;
  card_border_color: string | null;
  card_text_color: string | null;
  card_muted_color: string | null;
};

export type ButtonTheme = {
  primary_background_color: string | null;
  primary_text_color: string | null;
  secondary_background_color: string | null;
  secondary_text_color: string | null;
  secondary_border_color: string | null;
};

export type GlobalThemeSettings = {
  id: string;
  primary_color_hex: string | null;
  secondary_color_hex: string | null;
  accent_color_hex: string | null;
  font_family: string | null;
  heading_font_family: FontOption | null;
  body_font_family: FontOption | null;
  company_name: string | null;
  logo_path: string | null;
  imprint_company: string | null;
  imprint_address: string | null;
  imprint_contact: string | null;
  imprint_legal: string | null;
  navigation_theme: NavigationTheme | null;
  hero_theme: HeroTheme | null;
  surface_theme: SurfaceTheme | null;
  button_theme: ButtonTheme | null;
};

export const FALLBACK_PRIMARY_HEX = "#FF8400";
export const FALLBACK_SECONDARY_HEX = "#0E1F53";
export const FALLBACK_ACCENT_HEX = "#14B8A6";
const FALLBACK_PRIMARY_TUPLE = "31 100% 50%";
const FALLBACK_SECONDARY_TUPLE = "225 71% 19%";
const FALLBACK_ACCENT_TUPLE = "173 80% 40%";

export const defaultNavigationTheme: NavigationTheme = {
  background_color: "rgba(255,255,255,0.92)",
  text_color: "#0E1F53",
  muted_text_color: "#475569",
  border_color: "rgba(255,255,255,0.65)",
  hover_background_color: "rgba(14,31,83,0.08)",
  hover_text_color: "#0E1F53",
  cta_background_color: "#FF8400",
  cta_text_color: "#FFFFFF",
  topbar_background_color: "rgba(255,255,255,0.84)",
  topbar_text_color: "#334155",
  topbar_accent_color: "#FF8400",
  logo_badge_background_color: "#07112F",
  logo_badge_text_color: "#FFFFFF",
};

export const defaultHeroTheme: HeroTheme = {
  background_color: "#0E1F53",
  overlay_color: "rgba(6,13,36,0.58)",
  badge_background_color: "rgba(255,255,255,0.08)",
  badge_text_color: "#E2E8F0",
  headline_color: "#FFFFFF",
  headline_highlight_color: "#FFB566",
  subheadline_color: "#CBD5E1",
  secondary_button_background_color: "rgba(255,255,255,0.08)",
  secondary_button_text_color: "#FFFFFF",
  secondary_button_border_color: "rgba(255,255,255,0.18)",
  stat_card_background_color: "rgba(255,255,255,0.08)",
  stat_value_color: "#FFFFFF",
  stat_label_color: "#CBD5E1",
  proof_card_background_color: "rgba(255,255,255,0.07)",
  proof_text_color: "#E2E8F0",
  proof_icon_background_color: "rgba(255,132,0,0.12)",
  proof_icon_color: "#FFB566",
  visual_panel_background_color: "rgba(7,17,47,0.72)",
  visual_panel_text_color: "#E2E8F0",
};

export const defaultSurfaceTheme: SurfaceTheme = {
  page_background_color: "#EEF3F9",
  section_background_color: "#F6F8FC",
  card_background_color: "rgba(255,255,255,0.86)",
  card_border_color: "rgba(148,163,184,0.22)",
  card_text_color: "#0E1F53",
  card_muted_color: "#64748B",
};

export const defaultButtonTheme: ButtonTheme = {
  primary_background_color: "#FF8400",
  primary_text_color: "#FFFFFF",
  secondary_background_color: "rgba(255,255,255,0.84)",
  secondary_text_color: "#0E1F53",
  secondary_border_color: "rgba(148,163,184,0.26)",
};

export const defaultTheme: GlobalThemeSettings = {
  id: "default",
  primary_color_hex: FALLBACK_PRIMARY_HEX,
  secondary_color_hex: FALLBACK_SECONDARY_HEX,
  accent_color_hex: FALLBACK_ACCENT_HEX,
  font_family: "default",
  heading_font_family: "jakarta",
  body_font_family: "inter",
  company_name: "Digital-Perfect Premium",
  logo_path: null,
  imprint_company: null,
  imprint_address: null,
  imprint_contact: null,
  imprint_legal: null,
  navigation_theme: defaultNavigationTheme,
  hero_theme: defaultHeroTheme,
  surface_theme: defaultSurfaceTheme,
  button_theme: defaultButtonTheme,
};

export const normalizeHex = (value: string | null | undefined): string | null => {
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

type HslParts = {
  h: number;
  s: number;
  l: number;
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

const mergeBucket = <T extends Record<string, string | null>>(defaults: T, bucket?: T | null | Json): T => ({
  ...defaults,
  ...(bucket && typeof bucket === "object" && !Array.isArray(bucket) ? (bucket as Partial<T>) : {}),
});

export const mergeThemeSettings = (data?: Partial<GlobalThemeSettings> | null): GlobalThemeSettings => ({
  ...defaultTheme,
  ...(data || {}),
  navigation_theme: mergeBucket(defaultNavigationTheme, data?.navigation_theme),
  hero_theme: mergeBucket(defaultHeroTheme, data?.hero_theme),
  surface_theme: mergeBucket(defaultSurfaceTheme, data?.surface_theme),
  button_theme: mergeBucket(defaultButtonTheme, data?.button_theme),
});

const resolveHeadingFont = (settings: GlobalThemeSettings): string => {
  const choice = settings.heading_font_family || settings.font_family || "jakarta";
  if (choice === "inter") return 'Inter, system-ui, sans-serif';
  if (choice === "serif") return 'Georgia, "Times New Roman", serif';
  if (choice === "space-grotesk") return '"Plus Jakarta Sans", Inter, system-ui, sans-serif';
  return '"Plus Jakarta Sans", Inter, system-ui, sans-serif';
};

const resolveBodyFont = (settings: GlobalThemeSettings): string => {
  const choice = settings.body_font_family || (settings.font_family === "serif" ? "serif" : "inter");
  if (choice === "serif") return 'Georgia, "Times New Roman", serif';
  if (choice === "jakarta") return '"Plus Jakarta Sans", Inter, system-ui, sans-serif';
  return 'Inter, system-ui, sans-serif';
};

const setCssVar = (root: HTMLElement, name: string, value: string | null | undefined, fallback: string) => {
  root.style.setProperty(name, value?.trim() ? value : fallback);
};

export const applyThemeToRoot = (rawSettings?: Partial<GlobalThemeSettings> | null) => {
  const settings = mergeThemeSettings(rawSettings);
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
  root.style.setProperty("--sidebar-primary-foreground", primaryForeground);
  root.style.setProperty("--sidebar-accent", shiftLightness(secondaryParts, 6));
  root.style.setProperty("--sidebar-accent-foreground", "0 0% 100%");
  root.style.setProperty("--sidebar-border", shiftLightness(secondaryParts, 12));
  root.style.setProperty("--sidebar-ring", primaryTuple);

  root.style.setProperty("--app-font-heading", resolveHeadingFont(settings));
  root.style.setProperty("--app-font-body", resolveBodyFont(settings));

  const nav = settings.navigation_theme!;
  const hero = settings.hero_theme!;
  const surface = settings.surface_theme!;
  const buttons = settings.button_theme!;

  setCssVar(root, "--nav-bg", nav.background_color, defaultNavigationTheme.background_color!);
  setCssVar(root, "--nav-text", nav.text_color, defaultNavigationTheme.text_color!);
  setCssVar(root, "--nav-muted", nav.muted_text_color, defaultNavigationTheme.muted_text_color!);
  setCssVar(root, "--nav-border", nav.border_color, defaultNavigationTheme.border_color!);
  setCssVar(root, "--nav-hover-bg", nav.hover_background_color, defaultNavigationTheme.hover_background_color!);
  setCssVar(root, "--nav-hover-text", nav.hover_text_color, defaultNavigationTheme.hover_text_color!);
  setCssVar(root, "--nav-cta-bg", nav.cta_background_color, defaultNavigationTheme.cta_background_color!);
  setCssVar(root, "--nav-cta-text", nav.cta_text_color, defaultNavigationTheme.cta_text_color!);
  setCssVar(root, "--nav-topbar-bg", nav.topbar_background_color, defaultNavigationTheme.topbar_background_color!);
  setCssVar(root, "--nav-topbar-text", nav.topbar_text_color, defaultNavigationTheme.topbar_text_color!);
  setCssVar(root, "--nav-topbar-accent", nav.topbar_accent_color, defaultNavigationTheme.topbar_accent_color!);
  setCssVar(root, "--nav-logo-badge-bg", nav.logo_badge_background_color, defaultNavigationTheme.logo_badge_background_color!);
  setCssVar(root, "--nav-logo-badge-text", nav.logo_badge_text_color, defaultNavigationTheme.logo_badge_text_color!);

  setCssVar(root, "--hero-bg-color", hero.background_color, defaultHeroTheme.background_color!);
  setCssVar(root, "--hero-overlay-color", hero.overlay_color, defaultHeroTheme.overlay_color!);
  setCssVar(root, "--hero-badge-bg", hero.badge_background_color, defaultHeroTheme.badge_background_color!);
  setCssVar(root, "--hero-badge-text", hero.badge_text_color, defaultHeroTheme.badge_text_color!);
  setCssVar(root, "--hero-headline", hero.headline_color, defaultHeroTheme.headline_color!);
  setCssVar(root, "--hero-highlight", hero.headline_highlight_color, defaultHeroTheme.headline_highlight_color!);
  setCssVar(root, "--hero-subheadline", hero.subheadline_color, defaultHeroTheme.subheadline_color!);
  setCssVar(root, "--hero-secondary-btn-bg", hero.secondary_button_background_color, defaultHeroTheme.secondary_button_background_color!);
  setCssVar(root, "--hero-secondary-btn-text", hero.secondary_button_text_color, defaultHeroTheme.secondary_button_text_color!);
  setCssVar(root, "--hero-secondary-btn-border", hero.secondary_button_border_color, defaultHeroTheme.secondary_button_border_color!);
  setCssVar(root, "--hero-stat-bg", hero.stat_card_background_color, defaultHeroTheme.stat_card_background_color!);
  setCssVar(root, "--hero-stat-value", hero.stat_value_color, defaultHeroTheme.stat_value_color!);
  setCssVar(root, "--hero-stat-label", hero.stat_label_color, defaultHeroTheme.stat_label_color!);
  setCssVar(root, "--hero-proof-bg", hero.proof_card_background_color, defaultHeroTheme.proof_card_background_color!);
  setCssVar(root, "--hero-proof-text", hero.proof_text_color, defaultHeroTheme.proof_text_color!);
  setCssVar(root, "--hero-proof-icon-bg", hero.proof_icon_background_color, defaultHeroTheme.proof_icon_background_color!);
  setCssVar(root, "--hero-proof-icon", hero.proof_icon_color, defaultHeroTheme.proof_icon_color!);
  setCssVar(root, "--hero-panel-bg", hero.visual_panel_background_color, defaultHeroTheme.visual_panel_background_color!);
  setCssVar(root, "--hero-panel-text", hero.visual_panel_text_color, defaultHeroTheme.visual_panel_text_color!);

  setCssVar(root, "--surface-page", surface.page_background_color, defaultSurfaceTheme.page_background_color!);
  setCssVar(root, "--surface-section", surface.section_background_color, defaultSurfaceTheme.section_background_color!);
  setCssVar(root, "--surface-card", surface.card_background_color, defaultSurfaceTheme.card_background_color!);
  setCssVar(root, "--surface-card-border", surface.card_border_color, defaultSurfaceTheme.card_border_color!);
  setCssVar(root, "--surface-card-text", surface.card_text_color, defaultSurfaceTheme.card_text_color!);
  setCssVar(root, "--surface-card-muted", surface.card_muted_color, defaultSurfaceTheme.card_muted_color!);

  setCssVar(root, "--button-primary-bg", buttons.primary_background_color, defaultButtonTheme.primary_background_color!);
  setCssVar(root, "--button-primary-text", buttons.primary_text_color, defaultButtonTheme.primary_text_color!);
  setCssVar(root, "--button-secondary-bg", buttons.secondary_background_color, defaultButtonTheme.secondary_background_color!);
  setCssVar(root, "--button-secondary-text", buttons.secondary_text_color, defaultButtonTheme.secondary_text_color!);
  setCssVar(root, "--button-secondary-border", buttons.secondary_border_color, defaultButtonTheme.secondary_border_color!);
};
