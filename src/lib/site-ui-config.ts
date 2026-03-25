import type { CSSProperties } from "react";
import { HOMEPAGE_SECTION_IDS, type HomepageSectionId, type HomepageSectionPattern } from "@/lib/homepage-section-styles";

export type HomepageSectionVisibility = Record<HomepageSectionId, boolean>;

export const createDefaultHomepageSectionVisibility = (): HomepageSectionVisibility =>
  HOMEPAGE_SECTION_IDS.reduce((acc, sectionId) => {
    acc[sectionId] = true;
    return acc;
  }, {} as HomepageSectionVisibility);

const isObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

export const parseHomepageSectionVisibility = (value: unknown): HomepageSectionVisibility => {
  const defaults = createDefaultHomepageSectionVisibility();
  if (!value) return defaults;

  let parsed: unknown = value;

  if (typeof value === "string") {
    try {
      parsed = JSON.parse(value);
    } catch {
      return defaults;
    }
  }

  if (!isObject(parsed)) return defaults;

  HOMEPAGE_SECTION_IDS.forEach((sectionId) => {
    if (typeof parsed[sectionId] === "boolean") {
      defaults[sectionId] = parsed[sectionId] as boolean;
    }
  });

  return defaults;
};

export const serializeHomepageSectionVisibility = (value: HomepageSectionVisibility) => JSON.stringify(value);

export type LoadingScreenMode = "spinner" | "bar" | "both";
export type LoadingScreenFontFamily = "default" | "sans" | "display" | "serif" | "mono";
export type LoadingScreenSize = "sm" | "md" | "lg" | "xl";

export type LoadingScreenConfig = {
  heading: string;
  subtext: string;
  mode: LoadingScreenMode;
  show_percentage: boolean;
  progress_prefix: string;
  progress_suffix: string;
  background_color: string;
  text_color: string;
  accent_color: string;
  spinner_color: string;
  track_color: string;
  fill_color: string;
  heading_font_family: LoadingScreenFontFamily;
  subtext_font_family: LoadingScreenFontFamily;
  progress_font_family: LoadingScreenFontFamily;
  heading_size: LoadingScreenSize;
  subtext_size: LoadingScreenSize;
};

export const createDefaultLoadingScreenConfig = (): LoadingScreenConfig => ({
  heading: "DIGITAL-PERFECT",
  subtext: "System wird geladen...",
  mode: "both",
  show_percentage: true,
  progress_prefix: "",
  progress_suffix: "%",
  background_color: "#0F172A",
  text_color: "#FFFFFF",
  accent_color: "#FF4B2C",
  spinner_color: "#FFFFFF",
  track_color: "rgba(255,255,255,0.12)",
  fill_color: "#FF4B2C",
  heading_font_family: "display",
  subtext_font_family: "default",
  progress_font_family: "mono",
  heading_size: "lg",
  subtext_size: "sm",
});

export const parseLoadingScreenConfig = (value: unknown): LoadingScreenConfig => {
  const defaults = createDefaultLoadingScreenConfig();
  if (!value) return defaults;

  let parsed: unknown = value;
  if (typeof value === "string") {
    try {
      parsed = JSON.parse(value);
    } catch {
      return defaults;
    }
  }

  if (!isObject(parsed)) return defaults;

  return {
    heading: typeof parsed.heading === "string" && parsed.heading.trim() ? parsed.heading : defaults.heading,
    subtext: typeof parsed.subtext === "string" && parsed.subtext.trim() ? parsed.subtext : defaults.subtext,
    mode: parsed.mode === "spinner" || parsed.mode === "bar" || parsed.mode === "both" ? parsed.mode : defaults.mode,
    show_percentage: typeof parsed.show_percentage === "boolean" ? parsed.show_percentage : defaults.show_percentage,
    progress_prefix: typeof parsed.progress_prefix === "string" ? parsed.progress_prefix : defaults.progress_prefix,
    progress_suffix: typeof parsed.progress_suffix === "string" ? parsed.progress_suffix : defaults.progress_suffix,
    background_color: typeof parsed.background_color === "string" && parsed.background_color.trim() ? parsed.background_color : defaults.background_color,
    text_color: typeof parsed.text_color === "string" && parsed.text_color.trim() ? parsed.text_color : defaults.text_color,
    accent_color: typeof parsed.accent_color === "string" && parsed.accent_color.trim() ? parsed.accent_color : defaults.accent_color,
    spinner_color: typeof parsed.spinner_color === "string" && parsed.spinner_color.trim() ? parsed.spinner_color : defaults.spinner_color,
    track_color: typeof parsed.track_color === "string" && parsed.track_color.trim() ? parsed.track_color : defaults.track_color,
    fill_color: typeof parsed.fill_color === "string" && parsed.fill_color.trim() ? parsed.fill_color : defaults.fill_color,
    heading_font_family:
      parsed.heading_font_family === "sans" ||
      parsed.heading_font_family === "display" ||
      parsed.heading_font_family === "serif" ||
      parsed.heading_font_family === "mono" ||
      parsed.heading_font_family === "default"
        ? parsed.heading_font_family
        : defaults.heading_font_family,
    subtext_font_family:
      parsed.subtext_font_family === "sans" ||
      parsed.subtext_font_family === "display" ||
      parsed.subtext_font_family === "serif" ||
      parsed.subtext_font_family === "mono" ||
      parsed.subtext_font_family === "default"
        ? parsed.subtext_font_family
        : defaults.subtext_font_family,
    progress_font_family:
      parsed.progress_font_family === "sans" ||
      parsed.progress_font_family === "display" ||
      parsed.progress_font_family === "serif" ||
      parsed.progress_font_family === "mono" ||
      parsed.progress_font_family === "default"
        ? parsed.progress_font_family
        : defaults.progress_font_family,
    heading_size: parsed.heading_size === "sm" || parsed.heading_size === "md" || parsed.heading_size === "lg" || parsed.heading_size === "xl" ? parsed.heading_size : defaults.heading_size,
    subtext_size: parsed.subtext_size === "sm" || parsed.subtext_size === "md" || parsed.subtext_size === "lg" || parsed.subtext_size === "xl" ? parsed.subtext_size : defaults.subtext_size,
  };
};

export const serializeLoadingScreenConfig = (value: LoadingScreenConfig) => JSON.stringify(value);

export type FooterStyleConfig = {
  background_color: string;
  text_color: string;
  muted_color: string;
  subtle_color: string;
  divider_color: string;
  social_background_color: string;
  social_text_color: string;
  social_border_color: string;
  link_hover_color: string;
  accent_color: string;
  glow_color: string;
  pattern_type: HomepageSectionPattern;
  pattern_opacity: number;
};

export const createDefaultFooterStyleConfig = (): FooterStyleConfig => ({
  background_color: "#070B16",
  text_color: "#F8FAFC",
  muted_color: "rgba(226,232,240,0.78)",
  subtle_color: "rgba(226,232,240,0.58)",
  divider_color: "rgba(226,232,240,0.12)",
  social_background_color: "rgba(255,255,255,0.05)",
  social_text_color: "#F8FAFC",
  social_border_color: "rgba(226,232,240,0.12)",
  link_hover_color: "#FF4B2C",
  accent_color: "#FF4B2C",
  glow_color: "rgba(255,75,44,0.18)",
  pattern_type: "grid",
  pattern_opacity: 0.16,
});

export const parseFooterStyleConfig = (value: unknown): FooterStyleConfig => {
  const defaults = createDefaultFooterStyleConfig();
  if (!value) return defaults;

  let parsed: unknown = value;
  if (typeof value === "string") {
    try {
      parsed = JSON.parse(value);
    } catch {
      return defaults;
    }
  }

  if (!isObject(parsed)) return defaults;

  const patternType =
    parsed.pattern_type === "grid" ||
    parsed.pattern_type === "mesh" ||
    parsed.pattern_type === "lines" ||
    parsed.pattern_type === "noise" ||
    parsed.pattern_type === "none"
      ? parsed.pattern_type
      : defaults.pattern_type;

  const numericOpacity = typeof parsed.pattern_opacity === "number" ? parsed.pattern_opacity : Number(parsed.pattern_opacity);

  return {
    background_color: typeof parsed.background_color === "string" && parsed.background_color.trim() ? parsed.background_color : defaults.background_color,
    text_color: typeof parsed.text_color === "string" && parsed.text_color.trim() ? parsed.text_color : defaults.text_color,
    muted_color: typeof parsed.muted_color === "string" && parsed.muted_color.trim() ? parsed.muted_color : defaults.muted_color,
    subtle_color: typeof parsed.subtle_color === "string" && parsed.subtle_color.trim() ? parsed.subtle_color : defaults.subtle_color,
    divider_color: typeof parsed.divider_color === "string" && parsed.divider_color.trim() ? parsed.divider_color : defaults.divider_color,
    social_background_color: typeof parsed.social_background_color === "string" && parsed.social_background_color.trim() ? parsed.social_background_color : defaults.social_background_color,
    social_text_color: typeof parsed.social_text_color === "string" && parsed.social_text_color.trim() ? parsed.social_text_color : defaults.social_text_color,
    social_border_color: typeof parsed.social_border_color === "string" && parsed.social_border_color.trim() ? parsed.social_border_color : defaults.social_border_color,
    link_hover_color: typeof parsed.link_hover_color === "string" && parsed.link_hover_color.trim() ? parsed.link_hover_color : defaults.link_hover_color,
    accent_color: typeof parsed.accent_color === "string" && parsed.accent_color.trim() ? parsed.accent_color : defaults.accent_color,
    glow_color: typeof parsed.glow_color === "string" && parsed.glow_color.trim() ? parsed.glow_color : defaults.glow_color,
    pattern_type: patternType,
    pattern_opacity: Number.isFinite(numericOpacity) ? Math.min(Math.max(numericOpacity, 0), 0.45) : defaults.pattern_opacity,
  };
};

export const serializeFooterStyleConfig = (value: FooterStyleConfig) => JSON.stringify(value);

export const resolveFooterStyleVars = (config: FooterStyleConfig): CSSProperties => ({
  ["--footer-bg" as any]: config.background_color,
  ["--footer-text" as any]: config.text_color,
  ["--footer-muted" as any]: config.muted_color,
  ["--footer-subtle" as any]: config.subtle_color,
  ["--footer-divider-color" as any]: config.divider_color,
  ["--footer-social-bg" as any]: config.social_background_color,
  ["--footer-social-text" as any]: config.social_text_color,
  ["--footer-social-border" as any]: config.social_border_color,
  ["--footer-link-hover" as any]: config.link_hover_color,
  ["--homepage-pattern-opacity" as any]: String(config.pattern_opacity),
  ["--homepage-pattern-accent" as any]: config.accent_color,
  ["--footer-glow-color" as any]: config.glow_color,
});
