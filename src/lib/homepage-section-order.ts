import { HOMEPAGE_SECTION_IDS, type HomepageSectionId } from "@/lib/homepage-section-styles";

export const DEFAULT_HOMEPAGE_SECTION_ORDER: HomepageSectionId[] = [
  "intro",
  "trust",
  "why-choose",
  "audience",
  "services",
  "forum",
  "shop",
  "portfolio",
  "team",
  "process",
  "testimonials",
  "contact",
  "faq",
];

const isSectionId = (value: unknown): value is HomepageSectionId =>
  typeof value === "string" && HOMEPAGE_SECTION_IDS.includes(value as HomepageSectionId);

const dedupe = (items: HomepageSectionId[]) => Array.from(new Set(items));

export const normalizeHomepageSectionOrder = (value: unknown): HomepageSectionId[] => {
  let parsed: unknown = value;

  if (typeof value === "string") {
    try {
      parsed = JSON.parse(value);
    } catch {
      parsed = value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  const candidate = Array.isArray(parsed) ? parsed.filter(isSectionId) : [];
  const unique = dedupe(candidate);
  const missing = DEFAULT_HOMEPAGE_SECTION_ORDER.filter((sectionId) => !unique.includes(sectionId));

  return [...unique, ...missing];
};

export const serializeHomepageSectionOrder = (order: HomepageSectionId[]) =>
  JSON.stringify(normalizeHomepageSectionOrder(order));

export const moveHomepageSection = (
  order: HomepageSectionId[],
  sectionId: HomepageSectionId,
  direction: "up" | "down",
): HomepageSectionId[] => {
  const next = [...normalizeHomepageSectionOrder(order)];
  const currentIndex = next.indexOf(sectionId);
  if (currentIndex === -1) return next;

  const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
  if (targetIndex < 0 || targetIndex >= next.length) return next;

  [next[currentIndex], next[targetIndex]] = [next[targetIndex], next[currentIndex]];
  return next;
};
