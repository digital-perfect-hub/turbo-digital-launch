import { sanitizeRichHtml } from "@/lib/content";
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

export type LandingPageBlock =
  | { id: string; type: "hero"; data: LandingHeroBlockData }
  | { id: string; type: "rich_text"; data: LandingRichTextBlockData }
  | { id: string; type: "trust"; data: LandingTrustBlockData }
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
              body_html: sanitizeRichHtml(asString(data.body_html)),
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
        case "faq":
          return {
            id,
            type: "faq",
            data: {
              kicker: asString(data.kicker),
              title: asString(data.title),
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
