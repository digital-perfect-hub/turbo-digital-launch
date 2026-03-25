import type { CSSProperties } from "react";

export const HOMEPAGE_SECTION_IDS = [
  "intro",
  "trust",
  "why-choose",
  "audience",
  "services",
  "portfolio",
  "process",
  "shop",
  "testimonials",
  "team",
  "contact",
  "faq",
  "forum",
] as const;

export type HomepageSectionId = (typeof HOMEPAGE_SECTION_IDS)[number];

export const HOMEPAGE_SECTION_LABELS: Record<HomepageSectionId, string> = {
  intro: "Intro",
  trust: "Trust",
  "why-choose": "Why Choose",
  audience: "Audience",
  services: "Services",
  portfolio: "Portfolio",
  process: "Ablauf",
  shop: "Shop",
  testimonials: "Testimonials",
  team: "Team",
  contact: "Kontakt",
  faq: "FAQ",
  forum: "Forum Teaser",
};

export type HomepageSectionStyle = {
  inherit_theme: boolean;
  background_color: string;
  title_color: string;
  text_color: string;
  muted_color: string;
  badge_background_color: string;
  badge_text_color: string;
  card_background_color: string;
  card_border_color: string;
  card_title_color: string;
  card_text_color: string;
  card_muted_color: string;
  panel_background_color: string;
  panel_title_color: string;
  panel_text_color: string;
  button_background_color: string;
  button_text_color: string;
  accent_color: string;
};

export type HomepageSectionStyles = Record<HomepageSectionId, HomepageSectionStyle>;

export const createDefaultHomepageSectionStyle = (): HomepageSectionStyle => ({
  inherit_theme: true,
  background_color: "",
  title_color: "",
  text_color: "",
  muted_color: "",
  badge_background_color: "",
  badge_text_color: "",
  card_background_color: "",
  card_border_color: "",
  card_title_color: "",
  card_text_color: "",
  card_muted_color: "",
  panel_background_color: "",
  panel_title_color: "",
  panel_text_color: "",
  button_background_color: "",
  button_text_color: "",
  accent_color: "",
});

export const createDefaultHomepageSectionStyles = (): HomepageSectionStyles =>
  HOMEPAGE_SECTION_IDS.reduce((acc, id) => {
    acc[id] = createDefaultHomepageSectionStyle();
    return acc;
  }, {} as HomepageSectionStyles);

const isObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const asString = (value: unknown) => (typeof value === "string" ? value : "");

export const parseHomepageSectionStyles = (value: unknown): HomepageSectionStyles => {
  const defaults = createDefaultHomepageSectionStyles();
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

  const next = createDefaultHomepageSectionStyles();

  HOMEPAGE_SECTION_IDS.forEach((sectionId) => {
    const rawSection = parsed[sectionId];
    if (!isObject(rawSection)) return;

    next[sectionId] = {
      inherit_theme:
        typeof rawSection.inherit_theme === "boolean"
          ? rawSection.inherit_theme
          : createDefaultHomepageSectionStyle().inherit_theme,
      background_color: asString(rawSection.background_color),
      title_color: asString(rawSection.title_color),
      text_color: asString(rawSection.text_color),
      muted_color: asString(rawSection.muted_color),
      badge_background_color: asString(rawSection.badge_background_color),
      badge_text_color: asString(rawSection.badge_text_color),
      card_background_color: asString(rawSection.card_background_color),
      card_border_color: asString(rawSection.card_border_color),
      card_title_color: asString(rawSection.card_title_color) || asString(rawSection.card_text_color),
      card_text_color: asString(rawSection.card_text_color),
      card_muted_color: asString(rawSection.card_muted_color),
      panel_background_color: asString(rawSection.panel_background_color),
      panel_title_color:
        asString(rawSection.panel_title_color) || asString(rawSection.panel_text_color) || asString(rawSection.title_color),
      panel_text_color: asString(rawSection.panel_text_color),
      button_background_color: asString(rawSection.button_background_color),
      button_text_color: asString(rawSection.button_text_color),
      accent_color: asString(rawSection.accent_color),
    };
  });

  return next;
};

export const serializeHomepageSectionStyles = (styles: HomepageSectionStyles) => JSON.stringify(styles);

const addCssVar = (styles: CSSProperties, key: string, value: string) => {
  if (!value?.trim()) return;
  styles[key as any] = value.trim();
};

export const resolveHomepageSectionStyleVars = (
  allStyles: HomepageSectionStyles,
  sectionId: HomepageSectionId,
): CSSProperties => {
  const sectionStyle = allStyles[sectionId] ?? createDefaultHomepageSectionStyle();
  if (sectionStyle.inherit_theme) return {};

  const vars: CSSProperties = {};

  addCssVar(vars, "--homepage-section-bg", sectionStyle.background_color);
  addCssVar(vars, "--homepage-section-title", sectionStyle.title_color);
  addCssVar(vars, "--homepage-section-text", sectionStyle.text_color);
  addCssVar(vars, "--homepage-section-muted", sectionStyle.muted_color);
  addCssVar(vars, "--homepage-badge-bg", sectionStyle.badge_background_color);
  addCssVar(vars, "--homepage-badge-text", sectionStyle.badge_text_color);
  addCssVar(vars, "--homepage-card-title", sectionStyle.card_title_color || sectionStyle.card_text_color);
  addCssVar(vars, "--homepage-card-text", sectionStyle.card_text_color || sectionStyle.text_color);
  addCssVar(vars, "--homepage-card-muted", sectionStyle.card_muted_color || sectionStyle.muted_color);
  addCssVar(vars, "--homepage-panel-title", sectionStyle.panel_title_color || sectionStyle.panel_text_color || sectionStyle.title_color);
  addCssVar(vars, "--homepage-panel-text", sectionStyle.panel_text_color || sectionStyle.text_color);
  addCssVar(vars, "--homepage-dark-base", sectionStyle.background_color);

  addCssVar(vars, "--surface-page", sectionStyle.background_color);
  addCssVar(vars, "--surface-section", sectionStyle.background_color);
  addCssVar(vars, "--surface-page-foreground", sectionStyle.text_color);
  addCssVar(vars, "--surface-page-muted", sectionStyle.muted_color);
  addCssVar(vars, "--surface-section-foreground", sectionStyle.text_color);
  addCssVar(vars, "--surface-section-muted", sectionStyle.muted_color);
  addCssVar(vars, "--surface-title", sectionStyle.title_color || sectionStyle.text_color);
  addCssVar(vars, "--surface-card", sectionStyle.card_background_color);
  addCssVar(vars, "--surface-card-border", sectionStyle.card_border_color);
  addCssVar(vars, "--surface-card-title", sectionStyle.card_title_color || sectionStyle.card_text_color || sectionStyle.text_color);
  addCssVar(vars, "--surface-card-text", sectionStyle.card_text_color || sectionStyle.text_color);
  addCssVar(vars, "--surface-card-muted", sectionStyle.card_muted_color || sectionStyle.muted_color);

  addCssVar(vars, "--hero-panel-bg", sectionStyle.panel_background_color || sectionStyle.card_background_color || sectionStyle.background_color);
  addCssVar(vars, "--hero-panel-text", sectionStyle.panel_text_color || sectionStyle.text_color);
  addCssVar(vars, "--hero-headline", sectionStyle.panel_title_color || sectionStyle.panel_text_color || sectionStyle.title_color || sectionStyle.text_color);
  addCssVar(vars, "--hero-subheadline", sectionStyle.panel_text_color || sectionStyle.text_color || sectionStyle.muted_color);
  addCssVar(vars, "--hero-badge-bg", sectionStyle.badge_background_color);
  addCssVar(vars, "--hero-badge-text", sectionStyle.badge_text_color);

  addCssVar(vars, "--button-primary-bg", sectionStyle.button_background_color || sectionStyle.accent_color);
  addCssVar(vars, "--button-primary-text", sectionStyle.button_text_color);
  addCssVar(vars, "--theme-primary-hex", sectionStyle.accent_color || sectionStyle.button_background_color);

  return vars;
};

export const resolveHomepageSectionStyleVarsFromSettings = (
  settings: Record<string, unknown>,
  sectionId: HomepageSectionId,
): CSSProperties => {
  const allStyles = parseHomepageSectionStyles(settings.home_section_styles);
  return resolveHomepageSectionStyleVars(allStyles, sectionId);
};

// Backward compatibility for mixed patch states:
// older components may still import these helpers, but pattern rendering now runs via style vars/CSS overlays.
export const resolveHomepageSectionPatternClass = () => "";

export const resolveHomepageSectionPatternClassFromSettings = () => "";
