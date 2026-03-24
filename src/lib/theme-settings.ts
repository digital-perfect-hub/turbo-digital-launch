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
  page_foreground_color?: string | null;
  page_muted_color?: string | null;
  section_background_color: string | null;
  section_foreground_color?: string | null;
  section_muted_color?: string | null;
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
  bg_main_hex: string | null;
  bg_card_hex: string | null;
  text_main_hex: string | null;
  text_muted_hex: string | null;
  border_color_hex: string | null;
  border_radius: string | null;
  cta_hover_hex?: string | null;
  inserted_at?: string | null;
  updated_at?: string | null;
};

export const FALLBACK_PRIMARY_HEX = "#FF4B2C";
export const FALLBACK_SECONDARY_HEX = "#0E1F53";
export const FALLBACK_ACCENT_HEX = "#0E1F53";
export const FALLBACK_BG_MAIN_HEX = "#FFFFFF";
export const FALLBACK_BG_CARD_HEX = "#F8FAFC";
export const FALLBACK_TEXT_MAIN_HEX = "#0F172A";
export const FALLBACK_TEXT_MUTED_HEX = "#64748B";
export const FALLBACK_BORDER_HEX = "#E2E8F0";
export const FALLBACK_RADIUS = "0.5rem";
const FALLBACK_PRIMARY_TUPLE = "9 100% 59%";
const FALLBACK_SECONDARY_TUPLE = "225 71% 19%";
const FALLBACK_ACCENT_TUPLE = "225 71% 19%";
const FALLBACK_BG_MAIN_TUPLE = "0 0% 100%";
const FALLBACK_BG_CARD_TUPLE = "210 40% 98%";
const FALLBACK_TEXT_MAIN_TUPLE = "222 47% 11%";
const FALLBACK_TEXT_MUTED_TUPLE = "215 16% 47%";
const FALLBACK_BORDER_TUPLE = "214 32% 91%";

export const defaultNavigationTheme: NavigationTheme = {
  background_color: "rgba(255,255,255,0.92)",
  text_color: "#0E1F53",
  muted_text_color: "#475569",
  border_color: "rgba(255,255,255,0.65)",
  hover_background_color: "rgba(14,31,83,0.08)",
  hover_text_color: "#0E1F53",
  cta_background_color: "#FF4B2C",
  cta_text_color: "#FFFFFF",
  topbar_background_color: "rgba(255,255,255,0.84)",
  topbar_text_color: "#334155",
  topbar_accent_color: "#FF4B2C",
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
  proof_icon_background_color: "rgba(255,75,44,0.12)",
  proof_icon_color: "#FFB566",
  visual_panel_background_color: "rgba(7,17,47,0.72)",
  visual_panel_text_color: "#E2E8F0",
};

export const defaultSurfaceTheme: SurfaceTheme = {
  page_background_color: FALLBACK_BG_MAIN_HEX,
  page_foreground_color: FALLBACK_TEXT_MAIN_HEX,
  page_muted_color: FALLBACK_TEXT_MUTED_HEX,
  section_background_color: "#F6F8FC",
  section_foreground_color: FALLBACK_TEXT_MAIN_HEX,
  section_muted_color: FALLBACK_TEXT_MUTED_HEX,
  card_background_color: "rgba(255,255,255,0.86)",
  card_border_color: "rgba(148,163,184,0.22)",
  card_text_color: FALLBACK_TEXT_MAIN_HEX,
  card_muted_color: FALLBACK_TEXT_MUTED_HEX,
};

export const defaultButtonTheme: ButtonTheme = {
  primary_background_color: "#FF4B2C",
  primary_text_color: "#FFFFFF",
  secondary_background_color: "rgba(255,255,255,0.84)",
  secondary_text_color: FALLBACK_TEXT_MAIN_HEX,
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
  bg_main_hex: FALLBACK_BG_MAIN_HEX,
  bg_card_hex: FALLBACK_BG_CARD_HEX,
  text_main_hex: FALLBACK_TEXT_MAIN_HEX,
  text_muted_hex: FALLBACK_TEXT_MUTED_HEX,
  border_color_hex: FALLBACK_BORDER_HEX,
  border_radius: FALLBACK_RADIUS,
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
const tupleToCssColor = (tuple: string) => `hsl(${tuple})`;

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
  const bgMainParts = hexToHslParts(settings.bg_main_hex, parseFallbackTuple(FALLBACK_BG_MAIN_TUPLE));
  const bgCardParts = hexToHslParts(settings.bg_card_hex, parseFallbackTuple(FALLBACK_BG_CARD_TUPLE));
  const textMainParts = hexToHslParts(settings.text_main_hex, parseFallbackTuple(FALLBACK_TEXT_MAIN_TUPLE));
  const textMutedParts = hexToHslParts(settings.text_muted_hex, parseFallbackTuple(FALLBACK_TEXT_MUTED_TUPLE));
  const borderParts = hexToHslParts(settings.border_color_hex, parseFallbackTuple(FALLBACK_BORDER_TUPLE));

  const primaryTuple = toTuple(primaryParts);
  const secondaryTuple = toTuple(secondaryParts);
  const accentTuple = toTuple(accentParts);
  const bgMainTuple = toTuple(bgMainParts);
  const bgCardTuple = toTuple(bgCardParts);
  const textMainTuple = toTuple(textMainParts);
  const textMutedTuple = toTuple(textMutedParts);
  const borderTuple = toTuple(borderParts);

  const primaryForeground = getReadableForeground(primaryParts, textMainTuple);
  const secondaryForeground = getReadableForeground(secondaryParts, textMainTuple, "0 0% 100%");
  const accentForeground = getReadableForeground(accentParts, textMainTuple);

  root.style.setProperty("--theme-primary-hex", normalizeHex(settings.primary_color_hex) ?? FALLBACK_PRIMARY_HEX);
  root.style.setProperty("--theme-secondary-hex", normalizeHex(settings.secondary_color_hex) ?? FALLBACK_SECONDARY_HEX);
  root.style.setProperty("--theme-accent-hex", normalizeHex(settings.accent_color_hex) ?? FALLBACK_ACCENT_HEX);
  root.style.setProperty("--theme-bg-main-hex", normalizeHex(settings.bg_main_hex) ?? FALLBACK_BG_MAIN_HEX);
  root.style.setProperty("--theme-bg-card-hex", normalizeHex(settings.bg_card_hex) ?? FALLBACK_BG_CARD_HEX);
  root.style.setProperty("--theme-text-main-hex", normalizeHex(settings.text_main_hex) ?? FALLBACK_TEXT_MAIN_HEX);
  root.style.setProperty("--theme-text-muted-hex", normalizeHex(settings.text_muted_hex) ?? FALLBACK_TEXT_MUTED_HEX);
  root.style.setProperty("--theme-border-hex", normalizeHex(settings.border_color_hex) ?? FALLBACK_BORDER_HEX);
  root.style.setProperty("--theme-radius", settings.border_radius?.trim() || FALLBACK_RADIUS);

  root.style.setProperty("--primary", primaryTuple);
  root.style.setProperty("--primary-foreground", primaryForeground);
  root.style.setProperty("--secondary", secondaryTuple);
  root.style.setProperty("--secondary-foreground", secondaryForeground);
  root.style.setProperty("--accent", accentTuple);
  root.style.setProperty("--accent-foreground", accentForeground);
  root.style.setProperty("--ring", primaryTuple);

  root.style.setProperty("--background", bgMainTuple);
  root.style.setProperty("--card", bgCardTuple);
  root.style.setProperty("--popover", bgCardTuple);
  root.style.setProperty("--foreground", textMainTuple);
  root.style.setProperty("--card-foreground", textMainTuple);
  root.style.setProperty("--popover-foreground", textMainTuple);
  root.style.setProperty("--muted", shiftLightness(bgCardParts, -2, -4));
  root.style.setProperty("--muted-foreground", textMutedTuple);
  root.style.setProperty("--border", borderTuple);
  root.style.setProperty("--input", borderTuple);
  root.style.setProperty("--surface", bgCardTuple);
  root.style.setProperty("--surface-raised", bgMainTuple);
  root.style.setProperty("--hero-bg", secondaryTuple);
  root.style.setProperty("--radius", settings.border_radius?.trim() || FALLBACK_RADIUS);

  root.style.setProperty("--gold", primaryTuple);
  root.style.setProperty("--gold-light", shiftLightness(primaryParts, 12, 6));
  root.style.setProperty("--gold-dark", shiftLightness(primaryParts, -12, -6));
  root.style.setProperty("--emerald", accentTuple);
  root.style.setProperty("--emerald-light", shiftLightness(accentParts, 10, 4));

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

  const surfacePageFallback = normalizeHex(settings.bg_main_hex) ?? FALLBACK_BG_MAIN_HEX;
  const surfaceSectionFallback = normalizeHex(settings.bg_card_hex) ?? FALLBACK_BG_CARD_HEX;
  const surfaceCardFallback = normalizeHex(settings.bg_card_hex) ?? FALLBACK_BG_CARD_HEX;
  const surfaceCardBorderFallback = normalizeHex(settings.border_color_hex) ?? FALLBACK_BORDER_HEX;
  const surfaceCardTextFallback = normalizeHex(settings.text_main_hex) ?? FALLBACK_TEXT_MAIN_HEX;
  const surfaceCardMutedFallback = normalizeHex(settings.text_muted_hex) ?? FALLBACK_TEXT_MUTED_HEX;

  const surfacePageParts = hexToHslParts(normalizeHex(surface.page_background_color) ?? surfacePageFallback, bgMainParts);
  const surfaceSectionParts = hexToHslParts(normalizeHex(surface.section_background_color) ?? surfaceSectionFallback, bgCardParts);
  const surfaceCardParts = hexToHslParts(normalizeHex(surface.card_background_color) ?? surfaceCardFallback, bgCardParts);

  const surfacePageForegroundAuto = tupleToCssColor(getReadableForeground(surfacePageParts, textMainTuple));
  const surfacePageMutedAuto = tupleToCssColor(getReadableForeground(surfacePageParts, textMutedTuple, "215 20% 78%"));
  const surfaceSectionForegroundAuto = tupleToCssColor(getReadableForeground(surfaceSectionParts, textMainTuple));
  const surfaceSectionMutedAuto = tupleToCssColor(getReadableForeground(surfaceSectionParts, textMutedTuple, "215 20% 78%"));
  const surfaceCardTextAuto = tupleToCssColor(getReadableForeground(surfaceCardParts, textMainTuple));
  const surfaceCardMutedAuto = tupleToCssColor(getReadableForeground(surfaceCardParts, textMutedTuple, "215 20% 78%"));

  const buttonPrimaryBg = normalizeHex(buttons.primary_background_color) ?? normalizeHex(settings.primary_color_hex) ?? defaultButtonTheme.primary_background_color!;
  const buttonPrimaryParts = hexToHslParts(buttonPrimaryBg, primaryParts);
  const buttonPrimaryTextAuto = tupleToCssColor(getReadableForeground(buttonPrimaryParts, textMainTuple));
  const buttonPrimaryHoverAuto = tupleToCssColor(shiftLightness(buttonPrimaryParts, -8, -4));

  const buttonSecondaryBg = normalizeHex(buttons.secondary_background_color) ?? normalizeHex(surface.card_background_color) ?? surfaceCardFallback;
  const buttonSecondaryParts = hexToHslParts(buttonSecondaryBg, surfaceCardParts);
  const buttonSecondaryTextAuto = tupleToCssColor(getReadableForeground(buttonSecondaryParts, textMainTuple));

  const navCtaBg = normalizeHex(nav.cta_background_color) ?? defaultNavigationTheme.cta_background_color!;
  const navCtaParts = hexToHslParts(navCtaBg, primaryParts);
  const navCtaTextAuto = tupleToCssColor(getReadableForeground(navCtaParts, textMainTuple));

  setCssVar(root, "--nav-bg", nav.background_color, defaultNavigationTheme.background_color!);
  setCssVar(root, "--nav-text", nav.text_color, defaultNavigationTheme.text_color!);
  setCssVar(root, "--nav-muted", nav.muted_text_color, defaultNavigationTheme.muted_text_color!);
  setCssVar(root, "--nav-border", nav.border_color, defaultNavigationTheme.border_color!);
  setCssVar(root, "--nav-hover-bg", nav.hover_background_color, defaultNavigationTheme.hover_background_color!);
  setCssVar(root, "--nav-hover-text", nav.hover_text_color, defaultNavigationTheme.hover_text_color!);
  setCssVar(root, "--nav-cta-bg", nav.cta_background_color, defaultNavigationTheme.cta_background_color!);
  setCssVar(root, "--nav-cta-text", nav.cta_text_color, navCtaTextAuto);
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

  setCssVar(root, "--surface-page", surface.page_background_color, surfacePageFallback);
  setCssVar(root, "--surface-page-foreground", surface.page_foreground_color, surfacePageForegroundAuto);
  setCssVar(root, "--surface-page-muted", surface.page_muted_color, surfacePageMutedAuto);
  setCssVar(root, "--surface-section", surface.section_background_color, surfaceSectionFallback);
  setCssVar(root, "--surface-section-foreground", surface.section_foreground_color, surfaceSectionForegroundAuto);
  setCssVar(root, "--surface-section-muted", surface.section_muted_color, surfaceSectionMutedAuto);
  setCssVar(root, "--surface-card", surface.card_background_color, surfaceCardFallback);
  setCssVar(root, "--surface-card-border", surface.card_border_color, surfaceCardBorderFallback);
  setCssVar(root, "--surface-card-text", surface.card_text_color, surfaceCardTextAuto);
  setCssVar(root, "--surface-card-muted", surface.card_muted_color, surfaceCardMutedAuto);

  setCssVar(root, "--button-primary-bg", buttons.primary_background_color || settings.primary_color_hex, buttonPrimaryBg);
  setCssVar(root, "--button-primary-text", buttons.primary_text_color, buttonPrimaryTextAuto);
  root.style.setProperty("--button-primary-hover", normalizeHex(settings.cta_hover_hex) ?? buttonPrimaryHoverAuto);
  setCssVar(root, "--button-secondary-bg", buttons.secondary_background_color, defaultButtonTheme.secondary_background_color!);
  setCssVar(root, "--button-secondary-text", buttons.secondary_text_color, buttonSecondaryTextAuto);
  setCssVar(root, "--button-secondary-border", buttons.secondary_border_color, surfaceCardBorderFallback);
};
