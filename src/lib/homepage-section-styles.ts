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

export type HomepageSectionPatternType =
  | "none"
  | "dots"
  | "stars"
  | "constellation"
  | "orbits"
  | "code";

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
  pattern_type: HomepageSectionPatternType;
  pattern_intensity: number;
  pattern_accent_color: string;
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
  pattern_type: "none",
  pattern_intensity: 18,
  pattern_accent_color: "",
});

export const createDefaultHomepageSectionStyles = (): HomepageSectionStyles =>
  HOMEPAGE_SECTION_IDS.reduce((acc, id) => {
    acc[id] = createDefaultHomepageSectionStyle();
    return acc;
  }, {} as HomepageSectionStyles);

const isObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const asString = (value: unknown) => (typeof value === "string" ? value : "");

const asNumber = (value: unknown, fallback: number) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const normalizePatternType = (value: unknown): HomepageSectionPatternType => {
  if (typeof value !== "string") return "none";

  switch (value.trim().toLowerCase()) {
    case "dots":
    case "stars":
    case "constellation":
    case "orbits":
    case "code":
      return value.trim().toLowerCase() as HomepageSectionPatternType;
    case "grid":
      return "code";
    case "mesh":
      return "constellation";
    case "lines":
      return "orbits";
    case "noise":
      return "dots";
    default:
      return "none";
  }
};

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

    const accentColor = asString(rawSection.accent_color);
    const textColor = asString(rawSection.text_color);

    next[sectionId] = {
      inherit_theme:
        typeof rawSection.inherit_theme === "boolean"
          ? rawSection.inherit_theme
          : createDefaultHomepageSectionStyle().inherit_theme,
      background_color: asString(rawSection.background_color),
      title_color: asString(rawSection.title_color),
      text_color: textColor,
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
        asString(rawSection.panel_title_color) ||
        asString(rawSection.panel_text_color) ||
        asString(rawSection.title_color),
      panel_text_color: asString(rawSection.panel_text_color),
      button_background_color: asString(rawSection.button_background_color),
      button_text_color: asString(rawSection.button_text_color),
      accent_color: accentColor,
      pattern_type: normalizePatternType(rawSection.pattern_type ?? rawSection.background_pattern),
      pattern_intensity: clamp(asNumber(rawSection.pattern_intensity, 18), 0, 100),
      pattern_accent_color:
        asString(rawSection.pattern_accent_color) || accentColor || textColor,
    };
  });

  return next;
};

export const serializeHomepageSectionStyles = (styles: HomepageSectionStyles) => JSON.stringify(styles);

const addCssVar = (styles: CSSProperties, key: string, value: string) => {
  if (!value?.trim()) return;
  styles[key as never] = value.trim();
};

const svgToDataUri = (svg: string) =>
  `url("data:image/svg+xml,${svg
    .replace(/\s+/g, " ")
    .trim()
    .replace(/</g, "%3C")
    .replace(/>/g, "%3E")}")`;

const buildPatternSvg = (
  patternType: HomepageSectionPatternType,
  safeColor: string,
): { image: string; size: string; position: string; repeat: string } | null => {
  switch (patternType) {
    case "dots": {
      const svg = `
        <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none'>
          <circle cx='4' cy='4' r='1' fill='${safeColor}' fill-opacity='0.92'/>
          <circle cx='18' cy='7' r='0.9' fill='${safeColor}' fill-opacity='0.78'/>
          <circle cx='10' cy='18' r='1' fill='${safeColor}' fill-opacity='0.84'/>
          <circle cx='20' cy='20' r='0.75' fill='${safeColor}' fill-opacity='0.62'/>
        </svg>
      `;

      return {
        image: svgToDataUri(svg),
        size: "24px 24px",
        position: "0 0",
        repeat: "repeat",
      };
    }

    case "stars": {
      const svg = `
        <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 60' fill='none'>
          <path
            d='M18 14 C18.45 15.65 19.35 16.55 21 17 C19.35 17.45 18.45 18.35 18 20 C17.55 18.35 16.65 17.45 15 17 C16.65 16.55 17.55 15.65 18 14 Z'
            fill='${safeColor}'
            fill-opacity='0.92'
          />
          <circle cx='10' cy='11' r='0.9' fill='${safeColor}' fill-opacity='0.6'/>
          <circle cx='29' cy='24' r='0.75' fill='${safeColor}' fill-opacity='0.5'/>
          <circle cx='45' cy='15' r='1' fill='${safeColor}' fill-opacity='0.68'/>
          <circle cx='41' cy='40' r='0.8' fill='${safeColor}' fill-opacity='0.52'/>
        </svg>
      `;

      return {
        image: svgToDataUri(svg),
        size: "60px 60px",
        position: "0 0",
        repeat: "repeat",
      };
    }

    case "constellation": {
      const svg = `
        <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='none'>
          <line x1='16' y1='22' x2='44' y2='54' stroke='${safeColor}' stroke-width='0.5' stroke-opacity='0.5'/>
          <line x1='44' y1='54' x2='74' y2='30' stroke='${safeColor}' stroke-width='0.5' stroke-opacity='0.5'/>
          <line x1='44' y1='54' x2='82' y2='74' stroke='${safeColor}' stroke-width='0.5' stroke-opacity='0.42'/>
          <circle cx='16' cy='22' r='1.5' fill='${safeColor}' fill-opacity='0.82'/>
          <circle cx='44' cy='54' r='1.5' fill='${safeColor}' fill-opacity='0.88'/>
          <circle cx='74' cy='30' r='1.5' fill='${safeColor}' fill-opacity='0.76'/>
          <circle cx='82' cy='74' r='1.5' fill='${safeColor}' fill-opacity='0.72'/>
        </svg>
      `;

      return {
        image: svgToDataUri(svg),
        size: "100px 100px",
        position: "0 0",
        repeat: "repeat",
      };
    }

    case "orbits": {
      const svg = `
        <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 88 88' fill='none'>
          <circle cx='28' cy='28' r='12' stroke='${safeColor}' stroke-width='0.5' stroke-opacity='0.56' stroke-dasharray='2 4'/>
          <circle cx='58' cy='52' r='18' stroke='${safeColor}' stroke-width='0.5' stroke-opacity='0.48' stroke-dasharray='2 4'/>
          <circle cx='28' cy='28' r='1.25' fill='${safeColor}' fill-opacity='0.84'/>
          <circle cx='58' cy='52' r='1.25' fill='${safeColor}' fill-opacity='0.78'/>
          <circle cx='70' cy='20' r='0.9' fill='${safeColor}' fill-opacity='0.54'/>
        </svg>
      `;

      return {
        image: svgToDataUri(svg),
        size: "88px 88px",
        position: "0 0",
        repeat: "repeat",
      };
    }

    case "code": {
      const svg = `
        <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40' fill='none'>
          <path d='M8 7.5 V12.5 M5.5 10 H10.5' stroke='${safeColor}' stroke-width='0.5' stroke-linecap='round' stroke-opacity='0.7'/>
          <path d='M28 7.5 V12.5 M25.5 10 H30.5' stroke='${safeColor}' stroke-width='0.5' stroke-linecap='round' stroke-opacity='0.62'/>
          <path d='M18 19.5 V24.5 M15.5 22 H20.5' stroke='${safeColor}' stroke-width='0.5' stroke-linecap='round' stroke-opacity='0.72'/>
          <path d='M8 29.5 V34.5 M5.5 32 H10.5' stroke='${safeColor}' stroke-width='0.5' stroke-linecap='round' stroke-opacity='0.58'/>
          <path d='M28 29.5 V34.5 M25.5 32 H30.5' stroke='${safeColor}' stroke-width='0.5' stroke-linecap='round' stroke-opacity='0.66'/>
        </svg>
      `;

      return {
        image: svgToDataUri(svg),
        size: "40px 40px",
        position: "0 0",
        repeat: "repeat",
      };
    }

    default:
      return null;
  }
};

const addPatternVars = (vars: CSSProperties, sectionStyle: HomepageSectionStyle) => {
  vars["--homepage-pattern-image" as never] = "none";
  vars["--homepage-pattern-size" as never] = "auto";
  vars["--homepage-pattern-position" as never] = "0 0";
  vars["--homepage-pattern-repeat" as never] = "no-repeat";
  vars["--homepage-pattern-opacity" as never] = "0";

  if (!sectionStyle.pattern_type || sectionStyle.pattern_type === "none") return;

  const rawColor =
    sectionStyle.pattern_accent_color ||
    sectionStyle.accent_color ||
    sectionStyle.text_color ||
    sectionStyle.card_title_color ||
    sectionStyle.card_text_color ||
    "#0E1F53";

  const safeColor = rawColor.replace(/#/g, "%23");
  const pattern = buildPatternSvg(sectionStyle.pattern_type, safeColor);
  if (!pattern) return;

  addCssVar(vars, "--homepage-pattern-opacity", `${clamp(sectionStyle.pattern_intensity, 0, 100) / 100}`);
  addCssVar(vars, "--homepage-pattern-accent", rawColor);
  addCssVar(vars, "--homepage-pattern-image", pattern.image);
  addCssVar(vars, "--homepage-pattern-size", pattern.size);
  addCssVar(vars, "--homepage-pattern-position", pattern.position);
  addCssVar(vars, "--homepage-pattern-repeat", pattern.repeat);
};

export const resolveHomepageSectionStyleVars = (
  allStyles: HomepageSectionStyles,
  sectionId: HomepageSectionId,
): CSSProperties => {
  const sectionStyle = allStyles[sectionId] ?? createDefaultHomepageSectionStyle();
  const vars: CSSProperties = {};

  addPatternVars(vars, sectionStyle);

  if (sectionStyle.inherit_theme) return vars;

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

export const resolveHomepageSectionPatternClass = () => "";
export const resolveHomepageSectionPatternClassFromSettings = () => "";
