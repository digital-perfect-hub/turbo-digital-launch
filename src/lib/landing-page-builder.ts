import { sanitizeRichHtmlWithoutH1 } from "@/lib/content";
import type { HeroProofIcon, TrustPoint, TrustPointIcon } from "@/hooks/useSiteSettings";


type JsonObject = Record<string, unknown>;

export type LandingHeroStat = {
  label: string;
  value: string;
};

export type LandingHeroProofItem = {
  icon?: HeroProofIcon;
  text: string;
};

export type LandingHeroBlockData = {
  badge_text?: string;
  headline?: string;
  subheadline?: string;
  primary_cta_text?: string;
  primary_cta_href?: string;
  secondary_cta_text?: string;
  secondary_cta_href?: string;
  stats?: LandingHeroStat[];
  proof_items?: LandingHeroProofItem[];
  image_path?: string;
  image_url?: string;
  image?: string;
  background_image_path?: string;
  background_mobile_image_path?: string;
  overlay_opacity?: number;
  visual_kicker?: string;
  visual_title?: string;
  visual_badge?: string;
  layer_kicker?: string;
  layer_title?: string;
  show_bottom_box1?: boolean;
  bottom_box1_kicker?: string;
  bottom_box1_title?: string;
  show_bottom_box2?: boolean;
  bottom_box2_kicker?: string;
  bottom_box2_title?: string;
};

export type LandingRichTextBlockData = {
  kicker?: string;
  headline?: string;
  body_html?: string;
};

export type LandingTrustItem = {
  title: string;
  desc: string;
  icon?: TrustPointIcon;
};

export type LandingTrustBlockData = {
  kicker?: string;
  title?: string;
  description?: string;
  items: LandingTrustItem[];
};

export type LandingFeatureGridItem = {
  title: string;
  text: string;
  iconKey?: string;
};

export type LandingFeatureGridBlockData = {
  kicker?: string;
  headline?: string;
  description?: string;
  items: LandingFeatureGridItem[];
};

export type LandingImageTextSplitBlockData = {
  kicker?: string;
  headline?: string;
  body_html?: string;
  image_path?: string;
  image_alt?: string;
  bullets: string[];
  image_side?: "left" | "right";
  mobile_image_first?: boolean;
  cta_label?: string;
  cta_href?: string;
};

export type LandingCtaBannerBlockData = {
  kicker?: string;
  headline?: string;
  description?: string;
  button_label?: string;
  button_href?: string;
  image_path?: string;
  image_alt?: string;
  tone?: "accent" | "light" | "dark";
  campaign_id?: string;
  campaign_name?: string;
  placement?: "inline" | "top" | "sidebar" | "sticky_mobile";
  starts_at?: string;
  ends_at?: string;
  is_campaign_active?: boolean;
};

export type LandingFaqItem = {
  question: string;
  answer: string;
};

export type LandingFaqBlockData = {
  kicker?: string;
  title?: string;
  description?: string;
  items: LandingFaqItem[];
};

export type LandingPageBlockType =
  | "hero"
  | "rich_text"
  | "trust"
  | "feature_grid"
  | "image_text_split"
  | "cta_banner"
  | "faq";

export type LandingPageBlockOption = {
  type: LandingPageBlockType;
  label: string;
  description: string;
};

export const LANDING_PAGE_BLOCK_OPTIONS: LandingPageBlockOption[] = [
  { type: "hero", label: "Hero", description: "Einstieg mit Headline, CTA und Visual." },
  { type: "rich_text", label: "Rich Text", description: "Freier Content-Block für Einleitung oder SEO-Text." },
  { type: "feature_grid", label: "Feature Grid", description: "Vorteile oder Module in Kartenstruktur." },
  { type: "image_text_split", label: "Bild + Text", description: "Split-Sektion mit Bild, Text und Benefits." },
  { type: "trust", label: "Trust", description: "Vertrauen, Vorteile und Positionierung." },
  { type: "cta_banner", label: "Promo Banner", description: "Promo-, Werbe- oder CTA-Banner mit optionalem Bild." },
  { type: "faq", label: "FAQ", description: "Fragen und Einwände sauber abfangen." },
];

export type LandingPageBlock =
  | { id: string; type: "hero"; data: LandingHeroBlockData }
  | { id: string; type: "rich_text"; data: LandingRichTextBlockData }
  | { id: string; type: "trust"; data: LandingTrustBlockData }
  | { id: string; type: "feature_grid"; data: LandingFeatureGridBlockData }
  | { id: string; type: "image_text_split"; data: LandingImageTextSplitBlockData }
  | { id: string; type: "cta_banner"; data: LandingCtaBannerBlockData }
  | { id: string; type: "faq"; data: LandingFaqBlockData };

export type LandingPageRecord = {
  id: string;
  slug: string;
  meta_title: string | null;
  meta_description: string | null;
  is_published: boolean;
  page_blocks: LandingPageBlock[];
};

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `landing-block-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const isObject = (value: unknown): value is JsonObject =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const asString = (value: unknown, fallback = "") => (typeof value === "string" ? value : fallback);

const asBoolean = (value: unknown, fallback = false) => (typeof value === "boolean" ? value : fallback);

const asNumber = (value: unknown) => (typeof value === "number" && Number.isFinite(value) ? value : undefined);

const asStringArray = (value: unknown) =>
  Array.isArray(value)
    ? value
        .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
        .filter(Boolean)
    : [];

const TRUST_ICONS: TrustPointIcon[] = ["users", "gauge", "chart", "shield"];
const HERO_PROOF_ICONS: HeroProofIcon[] = ["badge", "chart", "shield", "globe"];

const asTrustIcon = (value: unknown): TrustPointIcon | undefined =>
  typeof value === "string" && TRUST_ICONS.includes(value as TrustPointIcon) ? (value as TrustPointIcon) : undefined;

const asHeroProofIcon = (value: unknown): HeroProofIcon | undefined =>
  typeof value === "string" && HERO_PROOF_ICONS.includes(value as HeroProofIcon) ? (value as HeroProofIcon) : undefined;

const asHeroStats = (value: unknown): LandingHeroStat[] => {
  if (!Array.isArray(value)) return [];

  return value
    .filter(isObject)
    .map((item) => ({
      label: asString(item.label).trim(),
      value: asString(item.value).trim(),
    }))
    .filter((item) => item.label && item.value);
};

const asHeroProofItems = (value: unknown): LandingHeroProofItem[] => {
  if (!Array.isArray(value)) return [];

  return value
    .filter(isObject)
    .map((item) => ({
      icon: asHeroProofIcon(item.icon),
      text: asString(item.text).trim(),
    }))
    .filter((item) => item.text);
};

const asTrustItems = (value: unknown): TrustPoint[] => {
  if (!Array.isArray(value)) return [];

  return value
    .filter(isObject)
    .map((item) => ({
      title: asString(item.title).trim(),
      desc: asString(item.desc).trim(),
      icon: asTrustIcon(item.icon),
    }))
    .filter((item) => item.title && item.desc);
};

const asFeatureItems = (value: unknown): LandingFeatureGridItem[] => {
  if (!Array.isArray(value)) return [];

  return value
    .filter(isObject)
    .map((item) => ({
      title: asString(item.title).trim(),
      text: asString(item.text).trim(),
      iconKey: asString(item.iconKey ?? item.icon_key).trim(),
    }))
    .filter((item) => item.title || item.text);
};

const asFaqItems = (value: unknown): LandingFaqItem[] => {
  if (!Array.isArray(value)) return [];

  return value
    .filter(isObject)
    .map((item) => ({
      question: asString(item.question).trim(),
      answer: asString(item.answer).trim(),
    }))
    .filter((item) => item.question && item.answer);
};

export const normalizeLandingPageSlug = (pathname: string) =>
  pathname
    .trim()
    .toLowerCase()
    .replace(/^\/+|\/+$/g, "")
    .replace(/\/+/g, "/");

export const createDefaultLandingPageBlock = (type: LandingPageBlockType): LandingPageBlock => {
  switch (type) {
    case "hero":
      return {
        id: createId(),
        type,
        data: {
          badge_text: "Digitale Präsenz",
          headline: "Landingpage mit klarer Positionierung und sauberem Funnel",
          subheadline: "Mobile-first, conversion-stark und für lokale Sichtbarkeit gebaut.",
          primary_cta_text: "Jetzt anfragen",
          primary_cta_href: "/kontakt",
          secondary_cta_text: "Mehr erfahren",
          secondary_cta_href: "#vorteile",
          stats: [
            { label: "Fokus", value: "Leads" },
            { label: "System", value: "White-Label" },
          ],
          proof_items: [
            { icon: "badge", text: "Premium Positionierung" },
            { icon: "shield", text: "Saubere Technik & SEO" },
          ],
        },
      };
    case "rich_text":
      return {
        id: createId(),
        type,
        data: {
          kicker: "Einordnung",
          headline: "Warum diese Seite relevant ist",
          body_html: "<p>Beschreibe hier klar den Nutzen, den lokalen Kontext und den Unterschied zu Standard-Agenturen.</p>",
        },
      };
    case "feature_grid":
      return {
        id: createId(),
        type,
        data: {
          kicker: "Vorteile",
          headline: "Das steckt drin",
          description: "Die wichtigsten Punkte direkt im Überblick.",
          items: [
            { title: "Schnell", text: "Klare Nutzerführung und starke Struktur.", iconKey: "Zap" },
            { title: "Messbar", text: "Fokus auf Leads statt auf Deko.", iconKey: "BarChart3" },
            { title: "Skalierbar", text: "Ideal für SEO-Landingpages und Services.", iconKey: "Rocket" },
          ],
        },
      };
    case "image_text_split":
      return {
        id: createId(),
        type,
        data: {
          kicker: "Visual",
          headline: "Bild und Argumentation sauber kombiniert",
          body_html: "<p>Nutze diesen Block für Prozess, Screenshots oder greifbare Vorteile.</p>",
          bullets: ["Klare Argumentation", "Sauberes Visual", "Starker CTA"],
          image_side: "right",
          mobile_image_first: false,
          cta_label: "Jetzt ansehen",
          cta_href: "/kontakt",
        },
      };
    case "trust":
      return {
        id: createId(),
        type,
        data: {
          kicker: "Warum wir",
          title: "Vertrauen entsteht durch Substanz",
          description: "Echte Vorteile statt leere Floskeln.",
          items: [
            { title: "Klarer Prozess", desc: "Saubere Struktur von Strategie bis Launch.", icon: "gauge" },
            { title: "Saubere Technik", desc: "Performance, Mobile und SEO greifen zusammen.", icon: "shield" },
          ],
        },
      };
    case "cta_banner":
      return {
        id: createId(),
        type,
        data: {
          kicker: "Nächster Schritt",
          headline: "Lass uns daraus einen Lead-Magneten machen",
          description: "Sauber aufgebaut, schnell live und für Mobile optimiert.",
          button_label: "Kostenloses Gespräch sichern",
          button_href: "/kontakt",
          tone: "accent",
        },
      };
    case "faq":
      return {
        id: createId(),
        type,
        data: {
          kicker: "FAQ",
          title: "Häufige Fragen",
          description: "Einwände früh sauber beantworten.",
          items: [
            { question: "Wie schnell kann die Seite live gehen?", answer: "Je nach Umfang oft in wenigen Tagen bis wenigen Wochen." },
            { question: "Ist die Seite mobil optimiert?", answer: "Ja, die Blöcke sind mobile-first aufgebaut und werden im Admin vorab geprüft." },
          ],
        },
      };
  }
};

export const cloneLandingPageBlocks = (blocks: LandingPageBlock[]): LandingPageBlock[] =>
  normalizeLandingPageBlocks(JSON.parse(JSON.stringify(blocks ?? [])));

export const getLandingPageBlockLabel = (type: LandingPageBlockType) =>
  LANDING_PAGE_BLOCK_OPTIONS.find((item) => item.type === type)?.label ?? type;

export const summarizeLandingPageBlock = (block: LandingPageBlock) => {
  switch (block.type) {
    case "hero":
      return block.data.headline || block.data.badge_text || "Hero";
    case "rich_text":
      return block.data.headline || block.data.kicker || "Rich Text";
    case "feature_grid":
      return block.data.headline || `${block.data.items.length} Features`;
    case "image_text_split":
      return block.data.headline || (block.data.image_path ? "Bild + Text mit Visual" : "Bild + Text");
    case "trust":
      return block.data.title || `${block.data.items.length} Trust-Punkte`;
    case "cta_banner":
      return block.data.campaign_name || block.data.headline || block.data.kicker || "Promo Banner";
    case "faq":
      return block.data.title || `${block.data.items.length} FAQ-Einträge`;
    default:
      return block.type;
  }
};

export const normalizeLandingPageBlocks = (value: unknown): LandingPageBlock[] => {
  if (!Array.isArray(value)) return [];

  return value
    .map((entry): LandingPageBlock | null => {
      if (!isObject(entry) || typeof entry.type !== "string") return null;

      const id = asString(entry.id, createId());
      const data = isObject(entry.data) ? entry.data : {};

      switch (entry.type) {
        case "hero":
          return {
            id,
            type: "hero",
            data: {
              badge_text: asString(data.badge_text),
              headline: asString(data.headline),
              subheadline: asString(data.subheadline),
              primary_cta_text: asString(data.primary_cta_text),
              primary_cta_href: asString(data.primary_cta_href),
              secondary_cta_text: asString(data.secondary_cta_text),
              secondary_cta_href: asString(data.secondary_cta_href),
              stats: asHeroStats(data.stats),
              proof_items: asHeroProofItems(data.proof_items),
              image_path: asString(data.image_path),
              image_url: asString(data.image_url),
              image: asString(data.image),
              background_image_path: asString(data.background_image_path),
              background_mobile_image_path: asString(data.background_mobile_image_path),
              overlay_opacity: asNumber(data.overlay_opacity),
              visual_kicker: asString(data.visual_kicker),
              visual_title: asString(data.visual_title),
              visual_badge: asString(data.visual_badge),
              layer_kicker: asString(data.layer_kicker),
              layer_title: asString(data.layer_title),
              show_bottom_box1: asBoolean(data.show_bottom_box1, true),
              bottom_box1_kicker: asString(data.bottom_box1_kicker),
              bottom_box1_title: asString(data.bottom_box1_title),
              show_bottom_box2: asBoolean(data.show_bottom_box2, true),
              bottom_box2_kicker: asString(data.bottom_box2_kicker),
              bottom_box2_title: asString(data.bottom_box2_title),
            },
          };
        case "rich_text":
          return {
            id,
            type: "rich_text",
            data: {
              kicker: asString(data.kicker),
              headline: asString(data.headline),
              body_html: sanitizeRichHtmlWithoutH1(asString(data.body_html)),
            },
          };
        case "trust":
          return {
            id,
            type: "trust",
            data: {
              kicker: asString(data.kicker),
              title: asString(data.title),
              description: asString(data.description),
              items: asTrustItems(data.items),
            },
          };
        case "feature_grid":
          return {
            id,
            type: "feature_grid",
            data: {
              kicker: asString(data.kicker),
              headline: asString(data.headline),
              description: asString(data.description),
              items: asFeatureItems(data.items),
            },
          };
        case "image_text_split":
          return {
            id,
            type: "image_text_split",
            data: {
              kicker: asString(data.kicker),
              headline: asString(data.headline),
              body_html: sanitizeRichHtmlWithoutH1(asString(data.body_html ?? data.body)),
              image_path: asString(data.image_path ?? data.imagePath),
              image_alt: asString(data.image_alt ?? data.imageAlt),
              bullets: asStringArray(data.bullets),
              image_side: data.image_side === "left" || data.imageSide === "left" ? "left" : "right",
              mobile_image_first: asBoolean(data.mobile_image_first),
              cta_label: asString(data.cta_label ?? data.ctaLabel),
              cta_href: asString(data.cta_href ?? data.ctaHref),
            },
          };
        case "cta_banner":
          return {
            id,
            type: "cta_banner",
            data: {
              kicker: asString(data.kicker),
              headline: asString(data.headline),
              description: asString(data.description),
              button_label: asString(data.button_label ?? data.buttonLabel),
              button_href: asString(data.button_href ?? data.buttonHref),
              image_path: asString(data.image_path ?? data.imagePath),
              image_alt: asString(data.image_alt ?? data.imageAlt),
              tone:
                data.tone === "dark" || data.tone === "light" || data.tone === "accent"
                  ? data.tone
                  : "accent",
              campaign_id: asString(data.campaign_id),
              campaign_name: asString(data.campaign_name),
              placement:
                data.placement === "top" || data.placement === "sidebar" || data.placement === "sticky_mobile" || data.placement === "inline"
                  ? data.placement
                  : "inline",
              starts_at: asString(data.starts_at),
              ends_at: asString(data.ends_at),
              is_campaign_active: asBoolean(data.is_campaign_active, true),
            },
          };
        case "faq":
          return {
            id,
            type: "faq",
            data: {
              kicker: asString(data.kicker),
              title: asString(data.title ?? data.headline),
              description: asString(data.description),
              items: asFaqItems(data.items),
            },
          };
        default:
          return null;
      }
    })
    .filter((block): block is LandingPageBlock => Boolean(block));
};
