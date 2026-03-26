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

export type HeroBlockData = {
  badge?: string;
  headline?: string;
  subheadline?: string;
  primaryCtaLabel?: string;
  primaryCtaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
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

export const normalizePageBlocks = (value: unknown): PageBlock[] => {
  if (!Array.isArray(value)) return [];

  return value
    .map((entry): PageBlock | null => {
      if (!isObject(entry) || typeof entry.type !== "string") return null;
      const id = asString(entry.id, createId());

      switch (entry.type as PageBlockType) {
        case "hero": {
          const data = isObject(entry.data) ? entry.data : {};
          return {
            id,
            type: "hero",
            data: {
              badge: asString(data.badge),
              headline: asString(data.headline),
              subheadline: asString(data.subheadline),
              primaryCtaLabel: asString(data.primaryCtaLabel),
              primaryCtaHref: asString(data.primaryCtaHref),
              secondaryCtaLabel: asString(data.secondaryCtaLabel),
              secondaryCtaHref: asString(data.secondaryCtaHref),
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
