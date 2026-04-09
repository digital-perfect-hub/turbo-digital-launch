import { sanitizeRichHtml } from "@/lib/content";
import { buildStrictRenderImageUrl } from "@/lib/image";

export const RESERVED_PAGE_SLUGS = new Set([
  "admin",
  "login",
  "forum",
  "produkt",
  "impressum",
  "datenschutz",
  "agb",
]);

export type PageBlockType =
  | "hero"
  | "rich_text"
  | "feature_grid"
  | "image_text_split"
  | "cta_banner"
  | "faq";

export type BlockOption = {
  type: PageBlockType;
  label: string;
  description: string;
};

export const PAGE_BLOCK_OPTIONS: BlockOption[] = [
  { type: "hero", label: "Hero", description: "Starker Einstieg mit Headline, CTA und Badge." },
  { type: "rich_text", label: "Rich Text", description: "Freier Textblock für Einleitung oder Sales-Text." },
  { type: "feature_grid", label: "Feature Grid", description: "Vorteile oder Module in Kartenstruktur." },
  { type: "image_text_split", label: "Bild + Text", description: "Split-Sektion mit Bild, Text und Bulletpoints." },
  { type: "cta_banner", label: "CTA Banner", description: "Abschluss-Sektion mit Handlungsaufforderung." },
  { type: "faq", label: "FAQ", description: "Accordion für Einwände und Fragen." },
];

export type HeroStatItem = {
  label?: string;
  value?: string;
  helper?: string;
};

export type HeroProofItem = {
  icon?: string;
  text?: string;
  href?: string;
};

export type HeroBlockData = {
  badge?: string;
  badge_text?: string;
  headline?: string;
  subheadline?: string;
  primaryCtaLabel?: string;
  primaryCtaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  primary_cta_text?: string;
  primary_cta_href?: string;
  secondary_cta_text?: string;
  secondary_cta_href?: string;
  stats?: HeroStatItem[];
  proof_items?: HeroProofItem[];
  image_path?: string;
  image_url?: string;
  image?: string;
  image_alt?: string;
  background_image_path?: string;
  background_mobile_image_path?: string;
  overlay_opacity?: number;
  visual_kicker?: string;
  visual_title?: string;
  visual_badge?: string;
  layer_kicker?: string;
  layer_title?: string;
  show_visual_panel?: boolean;
  show_bottom_box1?: boolean;
  bottom_box1_kicker?: string;
  bottom_box1_title?: string;
  show_bottom_box2?: boolean;
  bottom_box2_kicker?: string;
  bottom_box2_title?: string;
};

export type RichTextBlockData = {
  kicker?: string;
  headline?: string;
  bodyHtml?: string;
};

export type FeatureGridItem = {
  title?: string;
  text?: string;
  iconKey?: string;
};

export type FeatureGridBlockData = {
  kicker?: string;
  headline?: string;
  description?: string;
  items: FeatureGridItem[];
};

export type ImageTextSplitBlockData = {
  kicker?: string;
  headline?: string;
  body?: string;
  imagePath?: string;
  imageAlt?: string;
  bullets: string[];
  imageSide?: "left" | "right";
  ctaLabel?: string;
  ctaHref?: string;
};

export type CtaBannerBlockData = {
  kicker?: string;
  headline?: string;
  description?: string;
  buttonLabel?: string;
  buttonHref?: string;
};

export type FaqItem = {
  question?: string;
  answer?: string;
};

export type FaqBlockData = {
  kicker?: string;
  headline?: string;
  items: FaqItem[];
};

export type PageBlock =
  | { id: string; type: "hero"; data: HeroBlockData }
  | { id: string; type: "rich_text"; data: RichTextBlockData }
  | { id: string; type: "feature_grid"; data: FeatureGridBlockData }
  | { id: string; type: "image_text_split"; data: ImageTextSplitBlockData }
  | { id: string; type: "cta_banner"; data: CtaBannerBlockData }
  | { id: string; type: "faq"; data: FaqBlockData };

export type PageRecord = {
  id: string;
  site_id: string;
  slug: string;
  seo_title: string | null;
  seo_description: string | null;
  content_blocks: PageBlock[];
  is_published: boolean;
  created_at?: string | null;
  updated_at?: string | null;
};

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `block-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export const createDefaultBlock = (type: PageBlockType): PageBlock => {
  switch (type) {
    case "hero":
      return {
        id: createId(),
        type,
        data: {
          badge: "White-Label SaaS",
          headline: "Skalierbare Landingpage unter deiner Marke",
          subheadline: "Mandantenfähig, performant und für Agenturen gebaut.",
          primaryCtaLabel: "Jetzt starten",
          primaryCtaHref: "/kontakt",
          secondaryCtaLabel: "Mehr erfahren",
          secondaryCtaHref: "#vorteile",
        },
      };
    case "rich_text":
      return {
        id: createId(),
        type,
        data: {
          kicker: "Einleitung",
          headline: "Klarer Kontext für deine Zielgruppe",
          bodyHtml:
            "<p>Hier beschreibst du Nutzen, Positionierung und die wichtigsten Unterschiede deiner Leistung.</p>",
        },
      };
    case "feature_grid":
      return {
        id: createId(),
        type,
        data: {
          kicker: "Vorteile",
          headline: "Das steckt in deinem Angebot",
          description: "Die wichtigsten Bausteine direkt im Überblick.",
          items: [
            { title: "Mandantenfähig", text: "Mehrere Sites in einem zentralen Hub steuern.", iconKey: "Building2" },
            { title: "Performant", text: "Mobile-first Struktur mit sauberem SPA-Setup.", iconKey: "TrendingUp" },
            { title: "Erweiterbar", text: "Module und Landingpages blockbasiert aufbauen.", iconKey: "Blocks" },
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
          body: "Ideal für Screenshots, Benefits oder Prozess-Erklärungen.",
          imagePath: "",
          imageAlt: "Page Builder Visual",
          bullets: ["Klare Argumente", "Saubere Bildausgabe über Render-API", "Stark für Sales-Pages"],
          imageSide: "right",
          ctaLabel: "Mehr erfahren",
          ctaHref: "#kontakt",
        },
      };
    case "cta_banner":
      return {
        id: createId(),
        type,
        data: {
          kicker: "Nächster Schritt",
          headline: "Bereit für deine nächste Landingpage?",
          description: "Starte jetzt mit einem strukturierten, white-label-fähigen Setup.",
          buttonLabel: "Kontakt aufnehmen",
          buttonHref: "/kontakt",
        },
      };
    case "faq":
      return {
        id: createId(),
        type,
        data: {
          kicker: "FAQ",
          headline: "Häufige Fragen",
          items: [
            {
              question: "Kann ich pro Site eigene Landingpages anlegen?",
              answer: "Ja. Jede Seite hängt direkt an der aktiven Site und ist sauber voneinander getrennt.",
            },
            {
              question: "Wer darf Seiten bearbeiten?",
              answer: "Globale Admins sowie Site-Owner, Site-Admins und Site-Editoren.",
            },
          ],
        },
      };
  }
};

export const normalizePageSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9äöüß\-\s/]/gi, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^\/+|\/+$/g, "")
    .replace(/^-/g, "")
    .replace(/-$/g, "");

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const asString = (value: unknown, fallback = "") => (typeof value === "string" ? value : fallback);

const asStringArray = (value: unknown) =>
  Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : [];

const asNumber = (value: unknown, fallback = 0) => (typeof value === "number" && Number.isFinite(value) ? value : fallback);

const asBoolean = (value: unknown, fallback = false) => (typeof value === "boolean" ? value : fallback);

const pickFirstString = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === "string") return value;
  }
  return "";
};

export const normalizePageBlocks = (value: unknown): PageBlock[] => {
  if (!Array.isArray(value)) return [];

  return value
    .map((entry): PageBlock | null => {
      if (!isObject(entry) || typeof entry.type !== "string") return null;
      const id = asString(entry.id, createId());

      switch (entry.type as PageBlockType) {
        case "hero": {
          const data = isObject(entry.data) ? entry.data : {};
          const stats = Array.isArray(data.stats)
            ? data.stats
                .filter(isObject)
                .map((item) => ({
                  label: asString(item.label),
                  value: asString(item.value),
                  helper: asString(item.helper),
                }))
                .filter((item) => item.label || item.value)
            : [];
          const proofItems = Array.isArray(data.proof_items)
            ? data.proof_items
                .filter(isObject)
                .map((item) => ({
                  icon: asString(item.icon),
                  text: asString(item.text),
                  href: asString(item.href),
                }))
                .filter((item) => item.text)
            : [];
          return {
            id,
            type: "hero",
            data: {
              badge: asString(data.badge),
              badge_text: pickFirstString(data.badge_text, data.badge),
              headline: asString(data.headline),
              subheadline: asString(data.subheadline),
              primaryCtaLabel: asString(data.primaryCtaLabel),
              primaryCtaHref: asString(data.primaryCtaHref),
              secondaryCtaLabel: asString(data.secondaryCtaLabel),
              secondaryCtaHref: asString(data.secondaryCtaHref),
              primary_cta_text: pickFirstString(data.primary_cta_text, data.primaryCtaLabel),
              primary_cta_href: pickFirstString(data.primary_cta_href, data.primaryCtaHref),
              secondary_cta_text: pickFirstString(data.secondary_cta_text, data.secondaryCtaLabel),
              secondary_cta_href: pickFirstString(data.secondary_cta_href, data.secondaryCtaHref),
              stats,
              proof_items: proofItems,
              image_path: asString(data.image_path),
              image_url: asString(data.image_url),
              image: asString(data.image),
              image_alt: asString(data.image_alt),
              background_image_path: asString(data.background_image_path),
              background_mobile_image_path: asString(data.background_mobile_image_path),
              overlay_opacity: asNumber(data.overlay_opacity, 0),
              visual_kicker: asString(data.visual_kicker),
              visual_title: asString(data.visual_title),
              visual_badge: asString(data.visual_badge),
              layer_kicker: asString(data.layer_kicker),
              layer_title: asString(data.layer_title),
              show_visual_panel: asBoolean(data.show_visual_panel, true),
              show_bottom_box1: asBoolean(data.show_bottom_box1, true),
              bottom_box1_kicker: asString(data.bottom_box1_kicker),
              bottom_box1_title: asString(data.bottom_box1_title),
              show_bottom_box2: asBoolean(data.show_bottom_box2, true),
              bottom_box2_kicker: asString(data.bottom_box2_kicker),
              bottom_box2_title: asString(data.bottom_box2_title),
            },
          };
        }
        case "rich_text": {
          const data = isObject(entry.data) ? entry.data : {};
          return {
            id,
            type: "rich_text",
            data: {
              kicker: asString(data.kicker),
              headline: asString(data.headline),
              bodyHtml: sanitizeRichHtml(asString(data.bodyHtml)),
            },
          };
        }
        case "feature_grid": {
          const data = isObject(entry.data) ? entry.data : {};
          const items = Array.isArray(data.items)
            ? data.items
                .filter(isObject)
                .map((item) => ({ title: asString(item.title), text: asString(item.text), iconKey: asString(item.iconKey) }))
            : [];
          return {
            id,
            type: "feature_grid",
            data: {
              kicker: asString(data.kicker),
              headline: asString(data.headline),
              description: asString(data.description),
              items,
            },
          };
        }
        case "image_text_split": {
          const data = isObject(entry.data) ? entry.data : {};
          return {
            id,
            type: "image_text_split",
            data: {
              kicker: asString(data.kicker),
              headline: asString(data.headline),
              body: asString(data.body),
              imagePath: asString(data.imagePath),
              imageAlt: asString(data.imageAlt),
              bullets: asStringArray(data.bullets),
              imageSide: data.imageSide === "left" ? "left" : "right",
              ctaLabel: asString(data.ctaLabel),
              ctaHref: asString(data.ctaHref),
            },
          };
        }
        case "cta_banner": {
          const data = isObject(entry.data) ? entry.data : {};
          return {
            id,
            type: "cta_banner",
            data: {
              kicker: asString(data.kicker),
              headline: asString(data.headline),
              description: asString(data.description),
              buttonLabel: asString(data.buttonLabel),
              buttonHref: asString(data.buttonHref),
            },
          };
        }
        case "faq": {
          const data = isObject(entry.data) ? entry.data : {};
          const items = Array.isArray(data.items)
            ? data.items
                .filter(isObject)
                .map((item) => ({ question: asString(item.question), answer: asString(item.answer) }))
            : [];
          return {
            id,
            type: "faq",
            data: {
              kicker: asString(data.kicker),
              headline: asString(data.headline),
              items,
            },
          };
        }
        default:
          return null;
      }
    })
    .filter((entry): entry is PageBlock => Boolean(entry));
};

export const toPageImageUrl = (value?: string | null, options?: { width?: number; quality?: number }) =>
  value ? buildStrictRenderImageUrl(value, { width: options?.width ?? 800, quality: options?.quality ?? 80 }) : "";

export const isReservedPageSlug = (slug: string) => RESERVED_PAGE_SLUGS.has(normalizePageSlug(slug));

export const getPageBlockLabel = (type: PageBlockType) =>
  PAGE_BLOCK_OPTIONS.find((item) => item.type === type)?.label ?? type;
