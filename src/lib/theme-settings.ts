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
  title_color_hex?: string | null; // NEU: Manuelle Titel-Farbe
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

export const FALLBACK_PRIMARY_HEX = "#FF6B2C";
export const FALLBACK_SECONDARY_HEX = "#0E1F53";
export const FALLBACK_ACCENT_HEX = "#FF6B2C";
export const FALLBACK_BG_MAIN_HEX = "#0B1020";
export const FALLBACK_BG_CARD_HEX = "#11172A";
export const FALLBACK_TEXT_MAIN_HEX = "#F8FAFC";
export const FALLBACK_TEXT_MUTED_HEX = "#A5B4C7";
export const FALLBACK_BORDER_HEX = "#23314F";
export const FALLBACK_RADIUS = "0.5rem";
const FALLBACK_PRIMARY_TUPLE = "18 100% 59%";
const FALLBACK_SECONDARY_TUPLE = "225 71% 19%";
const FALLBACK_ACCENT_TUPLE = "18 100% 59%";
const FALLBACK_BG_MAIN_TUPLE = "226 49% 8%";
const FALLBACK_BG_CARD_TUPLE = "226 42% 12%";
const FALLBACK_TEXT_MAIN_TUPLE = "210 40% 98%";
const FALLBACK_TEXT_MUTED_TUPLE = "214 23% 71%";
const FALLBACK_BORDER_TUPLE = "221 39% 22%";

export const defaultNavigationTheme: NavigationTheme = {
  background_color: "rgba(4, 15, 47, 0.85)",
  text_color: "#FFFFFF",
  muted_text_color: "rgba(255, 255, 255, 0.72)",
  border_color: "rgba(255, 255, 255, 0.14)",
  hover_background_color: "rgba(255, 75, 44, 0.08)",
  hover_text_color: "#FF4B2C",
  cta_background_color: "#FF4B2C",
  cta_text_color: "#FFFFFF",
  topbar_background_color: "rgba(4, 15, 47, 0.77)",
  topbar_text_color: "#FFFFFF",
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
  headline_highlight_color: "#FF6B2C",
  subheadline_color: "#CBD5E1",
  secondary_button_background_color: "rgba(255,255,255,0.08)",
  secondary_button_text_color: "#FFFFFF",
  secondary_button_border_color: "rgba(255,255,255,0.18)",
  stat_card_background_color: "rgba(255,255,255,0.08)",
  stat_value_color: "#FFFFFF",
  stat_label_color: "#CBD5E1",
  proof_card_background_color: "rgba(255,255,255,0.07)",
  proof_text_color: "#E2E8F0",
  proof_icon_background_color: "rgba(255,107,44,0.12)",
  proof_icon_color: "#FF6B2C",
  visual_panel_background_color: "rgba(7,17,47,0.72)",
  visual_panel_text_color: "#E2E8F0",
};

export const defaultSurfaceTheme: SurfaceTheme = {
  page_background_color: FALLBACK_BG_MAIN_HEX,
  page_foreground_color: FALLBACK_TEXT_MAIN_HEX,
  page_muted_color: FALLBACK_TEXT_MUTED_HEX,
  section_background_color: "#11172A",
  section_foreground_color: FALLBACK_TEXT_MAIN_HEX,
  section_muted_color: FALLBACK_TEXT_MUTED_HEX,
  card_background_color: "rgba(17,23,42,0.86)",
  card_border_color: "rgba(35,49,79,0.92)",
  card_text_color: FALLBACK_TEXT_MAIN_HEX,
  card_muted_color: FALLBACK_TEXT_MUTED_HEX,
};

export const defaultButtonTheme: ButtonTheme = {
  primary_background_color: "#FF6B2C",
  primary_text_color: "#FFFFFF",
  secondary_background_color: "rgba(255,255,255,0.84)",
  secondary_text_color: "#0F172A",
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

type RgbaParts = {
  r: number;
  g: number;
  b: number;
  a: number;
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

const hexToRgbParts = (hex: string | null | undefined, fallback: RgbaParts): RgbaParts => {
  const normalizedHex = normalizeHex(hex);
  if (!normalizedHex) return fallback;

  return {
    r: parseInt(normalizedHex.slice(1, 3), 16),
    g: parseInt(normalizedHex.slice(3, 5), 16),
    b: parseInt(normalizedHex.slice(5, 7), 16),
    a: 1,
  };
};

const parseCssColor = (value: string | null | undefined): RgbaParts | null => {
  const normalizedHex = normalizeHex(value);
  if (normalizedHex) {
    return hexToRgbParts(normalizedHex, { r: 15, g: 23, b: 42, a: 1 });
  }

  const safeValue = value?.trim();
  if (!safeValue) return null;

  const rgbaMatch = safeValue.match(/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(0|1|0?\.\d+))?\s*\)$/i);
  if (!rgbaMatch) return null;

  const [, r, g, b, alpha] = rgbaMatch;
  return {
    r: Math.max(0, Math.min(255, parseInt(r, 10))),
    g: Math.max(0, Math.min(255, parseInt(g, 10))),
    b: Math.max(0, Math.min(255, parseInt(b, 10))),
    a: alpha === undefined ? 1 : Math.max(0, Math.min(1, parseFloat(alpha))),
  };
};

const blendRgb = (foreground: RgbaParts, background: RgbaParts): RgbaParts => ({
  r: Math.round(foreground.r * foreground.a + background.r * (1 - foreground.a)),
  g: Math.round(foreground.g * foreground.a + background.g * (1 - foreground.a)),
  b: Math.round(foreground.b * foreground.a + background.b * (1 - foreground.a)),
  a: 1,
});

const resolveBackgroundRgb = (value: string | null | undefined, fallback: string): RgbaParts => {
  const fallbackRgb = parseCssColor(fallback) || { r: 255, g: 255, b: 255, a: 1 };
  const parsed = parseCssColor(value);
  if (!parsed) return fallbackRgb;
  if (parsed.a >= 0.999) return { ...parsed, a: 1 };
  return blendRgb(parsed, fallbackRgb);
};

const getRelativeLuminance = ({ r, g, b }: RgbaParts) => {
  const toLinear = (channel: number) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };

  const red = toLinear(r);
  const green = toLinear(g);
  const blue = toLinear(b);

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
};

const getContrastRatio = (foreground: RgbaParts, background: RgbaParts) => {
  const lighter = Math.max(getRelativeLuminance(foreground), getRelativeLuminance(background));
  const darker = Math.min(getRelativeLuminance(foreground), getRelativeLuminance(background));
  return (lighter + 0.05) / (darker + 0.05);
};

const resolveReadableColor = ({
  explicitColor,
  backgroundColor,
  backgroundFallback,
  darkCandidate,
  lightCandidate = "#FFFFFF",
  minimumContrast = 6.0, // ERHÖHT: Zwingt dunkle Farben (wie dein Blau) sofort radikal zu weißer Schrift
}: {
  explicitColor?: string | null;
  backgroundColor?: string | null;
  backgroundFallback: string;
  darkCandidate: string;
  lightCandidate?: string;
  minimumContrast?: number;
}) => {
  const resolvedBackground = resolveBackgroundRgb(backgroundColor, backgroundFallback);
  const explicitRgb = parseCssColor(explicitColor);

  if (explicitRgb && getContrastRatio(explicitRgb, resolvedBackground) >= minimumContrast) {
    const explicitHex = normalizeHex(explicitColor);
    return explicitHex ?? explicitColor ?? darkCandidate;
  }

  const darkRgb = parseCssColor(darkCandidate) || { r: 15, g: 23, b: 42, a: 1 };
  const lightRgb = parseCssColor(lightCandidate) || { r: 255, g: 255, b: 255, a: 1 };

  const darkContrast = getContrastRatio(darkRgb, resolvedBackground);
  const lightContrast = getContrastRatio(lightRgb, resolvedBackground);

  if (lightContrast > darkContrast) return normalizeHex(lightCandidate) ?? lightCandidate;
  return normalizeHex(darkCandidate) ?? darkCandidate;
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

  const textMainHex = normalizeHex(settings.text_main_hex) ?? FALLBACK_TEXT_MAIN_HEX;
  const textMutedHex = normalizeHex(settings.text_muted_hex) ?? FALLBACK_TEXT_MUTED_HEX;
  const primaryHex = normalizeHex(settings.primary_color_hex) ?? FALLBACK_PRIMARY_HEX;
  const secondaryHex = normalizeHex(settings.secondary_color_hex) ?? FALLBACK_SECONDARY_HEX;
  const accentHex = normalizeHex(settings.accent_color_hex) ?? FALLBACK_ACCENT_HEX;
  const bgMainHex = normalizeHex(settings.bg_main_hex) ?? FALLBACK_BG_MAIN_HEX;
  const bgCardHex = normalizeHex(settings.bg_card_hex) ?? FALLBACK_BG_CARD_HEX;
  const borderHex = normalizeHex(settings.border_color_hex) ?? FALLBACK_BORDER_HEX;

  const primaryForeground = getReadableForeground(primaryParts, textMainTuple);
  const secondaryForeground = getReadableForeground(secondaryParts, textMainTuple, "0 0% 100%");
  const accentForeground = getReadableForeground(accentParts, textMainTuple);

  root.style.setProperty("--theme-primary-hex", primaryHex);
  root.style.setProperty("--theme-secondary-hex", secondaryHex);
  root.style.setProperty("--theme-accent-hex", accentHex);
  root.style.setProperty("--theme-bg-main-hex", bgMainHex);
  root.style.setProperty("--theme-bg-card-hex", bgCardHex);
  root.style.setProperty("--theme-text-main-hex", textMainHex);
  root.style.setProperty("--theme-text-muted-hex", textMutedHex);
  root.style.setProperty("--theme-border-hex", borderHex);
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

  const surfacePageFallback = bgMainHex;
  const surfaceSectionFallback = bgCardHex;
  const surfaceCardFallback = bgCardHex;
  const surfaceCardBorderFallback = borderHex;
  const surfaceCardTextFallback = textMainHex;
  const surfaceCardMutedFallback = textMutedHex;

  const surfacePageParts = hexToHslParts(normalizeHex(surface.page_background_color) ?? surfacePageFallback, bgMainParts);
  const surfaceSectionParts = hexToHslParts(normalizeHex(surface.section_background_color) ?? surfaceSectionFallback, bgCardParts);
  const surfaceCardParts = hexToHslParts(normalizeHex(surface.card_background_color) ?? surfaceCardFallback, bgCardParts);

  const surfacePageForegroundAuto = tupleToCssColor(getReadableForeground(surfacePageParts, textMainTuple));
  const surfacePageMutedAuto = tupleToCssColor(getReadableForeground(surfacePageParts, textMutedTuple, "215 20% 78%"));
  const surfaceSectionForegroundAuto = tupleToCssColor(getReadableForeground(surfaceSectionParts, textMainTuple));
  const surfaceSectionMutedAuto = tupleToCssColor(getReadableForeground(surfaceSectionParts, textMutedTuple, "215 20% 78%"));
  const surfaceCardTextAuto = tupleToCssColor(getReadableForeground(surfaceCardParts, textMainTuple));
  const surfaceCardMutedAuto = tupleToCssColor(getReadableForeground(surfaceCardParts, textMutedTuple, "215 20% 78%"));

  const safeSurfacePageForeground = resolveReadableColor({
    explicitColor: surface.page_foreground_color,
    backgroundColor: surface.page_background_color,
    backgroundFallback: surfacePageFallback,
    darkCandidate: surfaceCardTextFallback,
  });
  const safeSurfacePageMuted = resolveReadableColor({
    explicitColor: surface.page_muted_color,
    backgroundColor: surface.page_background_color,
    backgroundFallback: surfacePageFallback,
    darkCandidate: surfaceCardMutedFallback,
    lightCandidate: "#CBD5E1",
    minimumContrast: 3.1,
  });
  const safeSurfaceSectionForeground = resolveReadableColor({
    explicitColor: surface.section_foreground_color,
    backgroundColor: surface.section_background_color,
    backgroundFallback: surfaceSectionFallback,
    darkCandidate: surfaceCardTextFallback,
  });
  const safeSurfaceSectionMuted = resolveReadableColor({
    explicitColor: surface.section_muted_color,
    backgroundColor: surface.section_background_color,
    backgroundFallback: surfaceSectionFallback,
    darkCandidate: surfaceCardMutedFallback,
    lightCandidate: "#CBD5E1",
    minimumContrast: 3.1,
  });
  const safeSurfaceCardText = resolveReadableColor({
    explicitColor: surface.card_text_color,
    backgroundColor: surface.card_background_color,
    backgroundFallback: surfaceCardFallback,
    darkCandidate: surfaceCardTextFallback,
  });
  const safeSurfaceCardMuted = resolveReadableColor({
    explicitColor: surface.card_muted_color,
    backgroundColor: surface.card_background_color,
    backgroundFallback: surfaceCardFallback,
    darkCandidate: surfaceCardMutedFallback,
    lightCandidate: "#CBD5E1",
    minimumContrast: 3.1,
  });

  const buttonPrimaryBg = normalizeHex(buttons.primary_background_color) ?? primaryHex ?? defaultButtonTheme.primary_background_color!;
  const buttonPrimaryParts = hexToHslParts(buttonPrimaryBg, primaryParts);
  const buttonPrimaryTextAuto = resolveReadableColor({
    explicitColor: buttons.primary_text_color,
    backgroundColor: buttonPrimaryBg,
    backgroundFallback: buttonPrimaryBg,
    darkCandidate: textMainHex,
  });
  const buttonPrimaryHoverAuto = tupleToCssColor(shiftLightness(buttonPrimaryParts, -8, -4));

  const buttonSecondaryBg = normalizeHex(buttons.secondary_background_color) ?? normalizeHex(surface.card_background_color) ?? surfaceCardFallback;
  const buttonSecondaryTextAuto = resolveReadableColor({
    explicitColor: buttons.secondary_text_color,
    backgroundColor: buttons.secondary_background_color || surface.card_background_color,
    backgroundFallback: buttonSecondaryBg,
    darkCandidate: textMainHex,
  });

  const navBg = nav.background_color || defaultNavigationTheme.background_color!;
  const navTopbarBg = nav.topbar_background_color || defaultNavigationTheme.topbar_background_color!;
  const navBadgeBg = nav.logo_badge_background_color || defaultNavigationTheme.logo_badge_background_color!;
  const navCtaBg = normalizeHex(nav.cta_background_color) ?? defaultNavigationTheme.cta_background_color!;
  const navSafeText = resolveReadableColor({
    explicitColor: nav.text_color,
    backgroundColor: nav.background_color,
    backgroundFallback: defaultNavigationTheme.background_color!,
    darkCandidate: textMainHex,
  });
  const navSafeMuted = resolveReadableColor({
    explicitColor: nav.muted_text_color,
    backgroundColor: nav.background_color,
    backgroundFallback: defaultNavigationTheme.background_color!,
    darkCandidate: textMutedHex,
    lightCandidate: "#CBD5E1",
    minimumContrast: 3.1,
  });
  const navSafeHoverText = resolveReadableColor({
    explicitColor: nav.hover_text_color,
    backgroundColor: nav.hover_background_color || nav.background_color,
    backgroundFallback: nav.background_color || defaultNavigationTheme.background_color!,
    darkCandidate: textMainHex,
  });
  const navCtaTextAuto = resolveReadableColor({
    explicitColor: nav.cta_text_color,
    backgroundColor: navCtaBg,
    backgroundFallback: navCtaBg,
    darkCandidate: textMainHex,
  });
  const navSafeTopbarText = resolveReadableColor({
    explicitColor: nav.topbar_text_color,
    backgroundColor: nav.topbar_background_color,
    backgroundFallback: defaultNavigationTheme.topbar_background_color!,
    darkCandidate: textMutedHex,
  });
  const navSafeBadgeText = resolveReadableColor({
    explicitColor: nav.logo_badge_text_color,
    backgroundColor: nav.logo_badge_background_color,
    backgroundFallback: navBadgeBg,
    darkCandidate: textMainHex,
  });

  const heroBg = hero.background_color || defaultHeroTheme.background_color!;
  const heroPanelBg = hero.visual_panel_background_color || defaultHeroTheme.visual_panel_background_color!;
  const heroBadgeBg = hero.badge_background_color || defaultHeroTheme.badge_background_color!;
  const heroStatBg = hero.stat_card_background_color || defaultHeroTheme.stat_card_background_color!;
  const heroProofBg = hero.proof_card_background_color || defaultHeroTheme.proof_card_background_color!;
  const heroSecondaryBtnBg = hero.secondary_button_background_color || defaultHeroTheme.secondary_button_background_color!;
  const heroSafeBadgeText = resolveReadableColor({
    explicitColor: hero.badge_text_color,
    backgroundColor: hero.badge_background_color,
    backgroundFallback: heroBg,
    darkCandidate: textMainHex,
  });
  const heroSafeHeadline = resolveReadableColor({
    explicitColor: hero.headline_color,
    backgroundColor: hero.background_color,
    backgroundFallback: defaultHeroTheme.background_color!,
    darkCandidate: textMainHex,
  });
  const heroSafeHighlight = resolveReadableColor({
    explicitColor: hero.headline_highlight_color,
    backgroundColor: hero.background_color,
    backgroundFallback: defaultHeroTheme.background_color!,
    darkCandidate: primaryHex,
    lightCandidate: "#FFFFFF",
    minimumContrast: 3.2,
  });
  const heroSafeSubheadline = resolveReadableColor({
    explicitColor: hero.subheadline_color,
    backgroundColor: hero.background_color,
    backgroundFallback: defaultHeroTheme.background_color!,
    darkCandidate: textMutedHex,
    lightCandidate: "#CBD5E1",
    minimumContrast: 3.1,
  });
  const heroSafeSecondaryBtnText = resolveReadableColor({
    explicitColor: hero.secondary_button_text_color,
    backgroundColor: hero.secondary_button_background_color,
    backgroundFallback: heroBg,
    darkCandidate: textMainHex,
  });
  const heroSafeStatValue = resolveReadableColor({
    explicitColor: hero.stat_value_color,
    backgroundColor: hero.stat_card_background_color,
    backgroundFallback: heroBg,
    darkCandidate: textMainHex,
  });
  const heroSafeStatLabel = resolveReadableColor({
    explicitColor: hero.stat_label_color,
    backgroundColor: hero.stat_card_background_color,
    backgroundFallback: heroBg,
    darkCandidate: textMutedHex,
    lightCandidate: "#CBD5E1",
    minimumContrast: 3.1,
  });
  const heroSafeProofText = resolveReadableColor({
    explicitColor: hero.proof_text_color,
    backgroundColor: hero.proof_card_background_color,
    backgroundFallback: heroBg,
    darkCandidate: textMutedHex,
    lightCandidate: "#CBD5E1",
    minimumContrast: 3.1,
  });
  const heroSafeProofIcon = resolveReadableColor({
    explicitColor: hero.proof_icon_color,
    backgroundColor: hero.proof_icon_background_color,
    backgroundFallback: heroProofBg,
    darkCandidate: primaryHex,
  });
  const heroSafePanelText = resolveReadableColor({
    explicitColor: hero.visual_panel_text_color,
    backgroundColor: hero.visual_panel_background_color,
    backgroundFallback: heroBg,
    darkCandidate: textMutedHex,
    lightCandidate: "#E2E8F0",
    minimumContrast: 3.1,
  });

  setCssVar(root, "--nav-bg", navBg, defaultNavigationTheme.background_color!);
  setCssVar(root, "--nav-text", navSafeText, defaultNavigationTheme.text_color!);
  setCssVar(root, "--nav-muted", navSafeMuted, defaultNavigationTheme.muted_text_color!);
  setCssVar(root, "--nav-border", nav.border_color, defaultNavigationTheme.border_color!);
  setCssVar(root, "--nav-hover-bg", nav.hover_background_color, defaultNavigationTheme.hover_background_color!);
  setCssVar(root, "--nav-hover-text", navSafeHoverText, defaultNavigationTheme.hover_text_color!);
  setCssVar(root, "--nav-cta-bg", navCtaBg, defaultNavigationTheme.cta_background_color!);
  setCssVar(root, "--nav-cta-text", navCtaTextAuto, navCtaTextAuto);
  setCssVar(root, "--nav-topbar-bg", navTopbarBg, defaultNavigationTheme.topbar_background_color!);
  setCssVar(root, "--nav-topbar-text", navSafeTopbarText, defaultNavigationTheme.topbar_text_color!);
  setCssVar(root, "--nav-topbar-accent", nav.topbar_accent_color, defaultNavigationTheme.topbar_accent_color!);
  setCssVar(root, "--nav-logo-badge-bg", navBadgeBg, defaultNavigationTheme.logo_badge_background_color!);
  setCssVar(root, "--nav-logo-badge-text", navSafeBadgeText, defaultNavigationTheme.logo_badge_text_color!);

  setCssVar(root, "--hero-bg-color", heroBg, defaultHeroTheme.background_color!);
  setCssVar(root, "--hero-overlay-color", hero.overlay_color, defaultHeroTheme.overlay_color!);
  setCssVar(root, "--hero-badge-bg", heroBadgeBg, defaultHeroTheme.badge_background_color!);
  setCssVar(root, "--hero-badge-text", heroSafeBadgeText, defaultHeroTheme.badge_text_color!);
  setCssVar(root, "--hero-headline", heroSafeHeadline, defaultHeroTheme.headline_color!);
  setCssVar(root, "--hero-highlight", heroSafeHighlight, defaultHeroTheme.headline_highlight_color!);
  setCssVar(root, "--hero-subheadline", heroSafeSubheadline, defaultHeroTheme.subheadline_color!);
  setCssVar(root, "--hero-secondary-btn-bg", heroSecondaryBtnBg, defaultHeroTheme.secondary_button_background_color!);
  setCssVar(root, "--hero-secondary-btn-text", heroSafeSecondaryBtnText, defaultHeroTheme.secondary_button_text_color!);
  setCssVar(root, "--hero-secondary-btn-border", hero.secondary_button_border_color, defaultHeroTheme.secondary_button_border_color!);
  setCssVar(root, "--hero-stat-bg", heroStatBg, defaultHeroTheme.stat_card_background_color!);
  setCssVar(root, "--hero-stat-value", heroSafeStatValue, defaultHeroTheme.stat_value_color!);
  setCssVar(root, "--hero-stat-label", heroSafeStatLabel, defaultHeroTheme.stat_label_color!);
  setCssVar(root, "--hero-proof-bg", heroProofBg, defaultHeroTheme.proof_card_background_color!);
  setCssVar(root, "--hero-proof-text", heroSafeProofText, defaultHeroTheme.proof_text_color!);
  setCssVar(root, "--hero-proof-icon-bg", hero.proof_icon_background_color, defaultHeroTheme.proof_icon_background_color!);
  setCssVar(root, "--hero-proof-icon", heroSafeProofIcon, defaultHeroTheme.proof_icon_color!);
  setCssVar(root, "--hero-panel-bg", heroPanelBg, defaultHeroTheme.visual_panel_background_color!);
  setCssVar(root, "--hero-panel-text", heroSafePanelText, defaultHeroTheme.visual_panel_text_color!);

  setCssVar(root, "--surface-page", surface.page_background_color, surfacePageFallback);
  setCssVar(root, "--surface-page-foreground", safeSurfacePageForeground, surfacePageForegroundAuto);
  setCssVar(root, "--surface-page-muted", safeSurfacePageMuted, surfacePageMutedAuto);
  setCssVar(root, "--surface-section", surface.section_background_color, surfaceSectionFallback);
  setCssVar(root, "--surface-section-foreground", safeSurfaceSectionForeground, surfaceSectionForegroundAuto);
  setCssVar(root, "--surface-section-muted", safeSurfaceSectionMuted, surfaceSectionMutedAuto);
  setCssVar(root, "--surface-title", surface.title_color_hex || safeSurfaceSectionForeground, surfaceSectionForegroundAuto);
  setCssVar(root, "--surface-card", surface.card_background_color, surfaceCardFallback);
  setCssVar(root, "--surface-card-border", surface.card_border_color, surfaceCardBorderFallback);
  setCssVar(root, "--surface-card-text", safeSurfaceCardText, surfaceCardTextAuto);
  setCssVar(root, "--surface-card-muted", safeSurfaceCardMuted, surfaceCardMutedAuto);

  setCssVar(root, "--button-primary-bg", buttonPrimaryBg, buttonPrimaryBg);
  setCssVar(root, "--button-primary-text", buttonPrimaryTextAuto, buttonPrimaryTextAuto);
  root.style.setProperty("--button-primary-hover", normalizeHex(settings.cta_hover_hex) ?? buttonPrimaryHoverAuto);
  setCssVar(root, "--button-secondary-bg", buttons.secondary_background_color, defaultButtonTheme.secondary_background_color!);
  setCssVar(root, "--button-secondary-text", buttonSecondaryTextAuto, buttonSecondaryTextAuto);
  setCssVar(root, "--button-secondary-border", buttons.secondary_border_color, surfaceCardBorderFallback);
};
