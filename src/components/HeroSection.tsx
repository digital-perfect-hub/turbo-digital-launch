import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, BadgeCheck, BarChart3, Globe, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useGlobalTheme } from "@/hooks/useGlobalTheme";
import { buildRenderImageUrl } from "@/lib/image";
import { getLucideIcon } from "@/lib/lucide-icon-registry";
import { useHeroContent, type HeroRecord } from "@/hooks/useHeroContent";
import heroFallback from "@/assets/hero-bg.jpg";

const fallbackHero: Required<Pick<HeroRecord, "badge_text" | "headline" | "subheadline" | "cta_text">> = {
  badge_text: "Premium SaaS Look für Webdesign & SEO",
  headline: "Webseiten, Shops & SEO-Systeme\nmit Premium-Optik und echter Anfragekraft.",
  subheadline:
    "Digital-Perfect verbindet klare Conversion-Struktur, moderne Markenwirkung und technische Sauberkeit – damit dein Auftritt nicht nur schön aussieht, sondern sichtbar wird und verkauft.",
  cta_text: "Jetzt kostenlos beraten lassen",
};

type HeroStatItem = {
  label?: string | null;
  value?: string | null;
  helper?: string | null;
};

type HeroProofItem = {
  icon?: string | null;
  text?: string | null;
  href?: string | null;
};

export type HeroOverrideData = {
  badge?: string | null;
  badge_text?: string | null;
  headline?: string | null;
  subheadline?: string | null;
  primaryCtaLabel?: string | null;
  primaryCtaHref?: string | null;
  secondaryCtaLabel?: string | null;
  secondaryCtaHref?: string | null;
  primary_cta_text?: string | null;
  primary_cta_href?: string | null;
  secondary_cta_text?: string | null;
  secondary_cta_href?: string | null;
  stats?: HeroStatItem[] | null;
  proof_items?: HeroProofItem[] | null;
  image_path?: string | null;
  image_url?: string | null;
  image?: string | null;
  image_alt?: string | null;
  background_image_path?: string | null;
  background_mobile_image_path?: string | null;
  overlay_opacity?: number | null;
  visual_kicker?: string | null;
  visual_title?: string | null;
  visual_badge?: string | null;
  layer_kicker?: string | null;
  layer_title?: string | null;
  show_visual_panel?: boolean | null;
  show_bottom_box1?: boolean | null;
  bottom_box1_kicker?: string | null;
  bottom_box1_title?: string | null;
  show_bottom_box2?: boolean | null;
  bottom_box2_kicker?: string | null;
  bottom_box2_title?: string | null;
};

const fallbackStats: HeroStatItem[] = [
  { label: "Fokus", value: "Webdesign & SEO", helper: "System" },
  { label: "Look", value: "Premium SaaS", helper: "Qualität" },
  { label: "Ziel", value: "Mehr Anfragen", helper: "Conversion" },
];

const fallbackProofItems: Required<HeroProofItem>[] = [
  { icon: "BadgeCheck", text: "Strukturierte Landingpages statt Flächen-Chaos", href: "" },
  { icon: "BarChart3", text: "Conversion, Sichtbarkeit und Performance im selben System", href: "" },
  { icon: "ShieldCheck", text: "Robuste Fallbacks, damit leere Admin-Daten nicht alles zerstören", href: "" },
];

const proofIconMap: Record<string, LucideIcon> = {
  badgecheck: BadgeCheck,
  barchart3: BarChart3,
  chart: BarChart3,
  globe: Globe,
  shieldcheck: ShieldCheck,
  shield: ShieldCheck,
};

const resolveImage = (path?: string | null, fallback: string = heroFallback) => {
  const trimmed = String(path || "").trim();
  if (!trimmed) return fallback;
  return buildRenderImageUrl(trimmed, { width: 1600, quality: 82 });
};

const pickText = (...values: Array<string | null | undefined>) => {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) return trimmed;
  }
  return "";
};

const pickBoolean = (...values: Array<boolean | null | undefined>) => {
  for (const value of values) {
    if (typeof value === "boolean") return value;
  }
  return undefined;
};

const pickNumber = (...values: Array<number | null | undefined>) => {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }
  return undefined;
};

const normalizeStats = (items?: HeroStatItem[] | null) =>
  Array.isArray(items)
    ? items
        .map((item) => ({
          label: pickText(item?.label, "Signal"),
          value: pickText(item?.value, "Aktiv"),
          helper: pickText(item?.helper),
        }))
        .filter((item) => item.label || item.value)
    : [];

const normalizeProofItems = (items?: HeroProofItem[] | null) =>
  Array.isArray(items)
    ? items
        .map((item) => ({
          icon: pickText(item?.icon, "BadgeCheck"),
          text: pickText(item?.text),
          href: pickText(item?.href),
        }))
        .filter((item) => item.text)
    : [];

type HeroSectionProps = {
  hero?: HeroRecord | null;
  overrideData?: HeroOverrideData | null;
};

const HeroSection = ({ hero: prefetchedHero, overrideData }: HeroSectionProps) => {
  const { settings } = useGlobalTheme();
  const { hero: queriedHero, isLoading } = useHeroContent();
  const hero = prefetchedHero ?? queriedHero;

  if (isLoading && !hero && !overrideData) {
    return null;
  }

  const scrollTo = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const renderAction = ({
    label,
    href,
    variant,
  }: {
    label: string;
    href: string;
    variant: "primary" | "secondary";
  }) => {
    const classes =
      variant === "primary"
        ? "btn-primary !px-7 !py-4 !text-base"
        : "btn-outline hero-secondary-button !min-h-[56px] !px-6 !py-4 !text-base";

    const content = (
      <>
        <span>{label}</span>
        {variant === "primary" ? <ArrowRight size={18} /> : null}
      </>
    );

    if (!href) {
      return (
        <button type="button" className={classes}>
          {content}
        </button>
      );
    }

    if (href.startsWith("#")) {
      return (
        <button type="button" onClick={() => scrollTo(href)} className={classes}>
          {content}
        </button>
      );
    }

    if (/^https?:\/\//i.test(href)) {
      return (
        <a href={href} target="_blank" rel="noreferrer noopener" className={classes}>
          {content}
        </a>
      );
    }

    if (href.startsWith("/")) {
      return (
        <Link to={href} className={classes}>
          {content}
        </Link>
      );
    }

    return (
      <a href={href} className={classes}>
        {content}
      </a>
    );
  };

  const headlineText = pickText(overrideData?.headline, hero?.headline, fallbackHero.headline);
  const headlineLines = headlineText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const effectiveHeadlineLines = headlineLines.length > 0 ? headlineLines : fallbackHero.headline.split("\n");

  const heroBadge = pickText(overrideData?.badge_text, overrideData?.badge, hero?.badge_text, fallbackHero.badge_text);
  const heroSubheadline = pickText(overrideData?.subheadline, hero?.subheadline, fallbackHero.subheadline);
  const primaryCtaLabel = pickText(
    overrideData?.primary_cta_text,
    overrideData?.primaryCtaLabel,
    hero?.cta_text,
    fallbackHero.cta_text,
  );
  const primaryCtaHref = pickText(overrideData?.primary_cta_href, overrideData?.primaryCtaHref, "#kontakt");
  const secondaryCtaLabel = pickText(overrideData?.secondary_cta_text, overrideData?.secondaryCtaLabel, "Projekte ansehen");
  const secondaryCtaHref = pickText(overrideData?.secondary_cta_href, overrideData?.secondaryCtaHref, "#portfolio");

  const visualKicker = pickText(overrideData?.visual_kicker, hero?.visual_kicker, "Hero Visual");
  const visualTitle = pickText(overrideData?.visual_title, hero?.visual_title, "Ein starkes Bild sagt mehr als 1000 Worte.");
  const visualBadge = pickText(overrideData?.visual_badge, hero?.visual_badge, "Premium Intro");
  const layerKicker = pickText(overrideData?.layer_kicker, hero?.layer_kicker, "Conversion Layer");
  const layerTitle = pickText(
    overrideData?.layer_title,
    hero?.layer_title,
    "Premium Hero mit Bild, Signalwerten und CTA-Führung",
  );

  const overrideStats = normalizeStats(overrideData?.stats);
  const heroStats = [
    { label: hero?.stat1_label, value: hero?.stat1_value, helper: null },
    { label: hero?.stat2_label, value: hero?.stat2_value, helper: null },
    { label: hero?.stat3_label, value: hero?.stat3_value, helper: null },
  ]
    .filter((item) => item.label?.trim() || item.value?.trim())
    .map((item) => ({
      label: pickText(item.label, "Signal"),
      value: pickText(item.value, "Aktiv"),
      helper: pickText(item.helper),
    }));

  const effectiveStats = overrideStats.length > 0 ? overrideStats : heroStats.length > 0 ? heroStats : fallbackStats;

  const overrideProofItems = normalizeProofItems(overrideData?.proof_items);
  const effectiveProofItems = overrideProofItems.length > 0 ? overrideProofItems : fallbackProofItems;

  const heroImageSrc = resolveImage(
    pickText(overrideData?.image_path, overrideData?.image_url, overrideData?.image, hero?.image_path, hero?.image_url, hero?.image),
    heroFallback,
  );
  const bgImageSrc = resolveImage(
    pickText(overrideData?.background_image_path, hero?.background_image_path),
    heroFallback,
  );
  const bgMobileImageSrc = resolveImage(
    pickText(overrideData?.background_mobile_image_path, hero?.background_mobile_image_path, bgImageSrc),
    bgImageSrc,
  );
  const overlayAlpha = (pickNumber(overrideData?.overlay_opacity, hero?.overlay_opacity) ?? 58) / 100;

  const showVisualPanel = pickBoolean(overrideData?.show_visual_panel, true) !== false;
  const showBottomBox1 = pickBoolean(overrideData?.show_bottom_box1, hero?.show_bottom_box1, true) !== false;
  const showBottomBox2 = pickBoolean(overrideData?.show_bottom_box2, hero?.show_bottom_box2, true) !== false;
  const heroImageAlt = pickText(
    overrideData?.image_alt,
    settings.company_name ? `${settings.company_name} Hero Visual` : "Digital-Perfect Hero",
  );

  const proofGridClass =
    effectiveProofItems.length >= 3
      ? "md:grid-cols-2 xl:grid-cols-3"
      : effectiveProofItems.length === 2
        ? "md:grid-cols-2"
        : "grid-cols-1";

  return (
    <section id="hero" className="dark-section relative overflow-hidden pt-[158px] lg:pt-[178px]">
      <div className="absolute inset-0 z-0">
        <picture>
          <source media="(max-width: 768px)" srcSet={bgMobileImageSrc} />
          <img src={bgImageSrc} alt="Hero Background" className="h-full w-full object-cover" loading="eager" />
        </picture>
      </div>

      <div className="absolute inset-0 z-0" style={{ backgroundColor: "var(--hero-overlay-color)", opacity: overlayAlpha }} />
      <div className="absolute inset-0 z-0 noise-overlay opacity-35" />
      <div className="hero-bottom-fade absolute inset-x-0 bottom-0 z-0 h-40" />

      <div className="section-container relative z-10 py-14 md:py-20 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.06fr_0.94fr] lg:gap-16">
          <div className="max-w-[860px]">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.45 }}
              className="section-label hero-badge mb-6"
            >
              <Sparkles size={14} className="text-primary" />
              {heroBadge}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.55, delay: 0.05 }}
              className="hero-headline max-w-4xl text-balance text-4xl font-extrabold leading-[0.97] tracking-[-0.05em] sm:text-5xl lg:text-[4.7rem]"
            >
              {effectiveHeadlineLines.map((line, idx) => (
                <span key={`${line}-${idx}`} className={idx === effectiveHeadlineLines.length - 1 ? "block text-gradient-dark" : "block"}>
                  {line}
                </span>
              ))}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.55, delay: 0.12 }}
              className="hero-subheadline mt-7 max-w-2xl text-lg leading-relaxed sm:text-xl"
            >
              {heroSubheadline}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.55, delay: 0.18 }}
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              {renderAction({ label: primaryCtaLabel, href: primaryCtaHref, variant: "primary" })}
              {secondaryCtaLabel ? renderAction({ label: secondaryCtaLabel, href: secondaryCtaHref, variant: "secondary" }) : null}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.55, delay: 0.24 }}
              className="mt-10 flex flex-wrap gap-4"
            >
              {effectiveStats.map((item, idx) => (
                <div
                  key={`${item.label}-${idx}`}
                  className={`glass-card hero-stat-card min-w-[180px] flex-1 basis-[180px] rounded-[1.55rem] p-5 sm:min-w-[195px] ${
                    isLoading ? "premium-skeleton" : ""
                  }`}
                >
                  <p className="hero-stat-value text-[clamp(1.55rem,2.2vw,2.15rem)] font-extrabold leading-[1.04] tracking-[-0.03em] sm:whitespace-nowrap">
                    {item.value}
                  </p>
                  <p className="hero-stat-label mt-2 text-sm font-medium">{item.label}</p>
                  {item.helper ? <p className="hero-stat-label mt-1 text-xs opacity-80">{item.helper}</p> : null}
                </div>
              ))}
            </motion.div>
          </div>

          {showVisualPanel ? (
            <motion.div
              initial={{ opacity: 0, x: 34 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.65, delay: 0.1 }}
              className="relative"
            >
              <div className={`premium-dark-card overflow-hidden p-4 sm:p-5 lg:p-6 ${isLoading ? "premium-skeleton" : ""}`}>
                <div className="relative z-10 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="hero-panel-kicker text-[0.72rem] font-semibold uppercase tracking-[0.28em]">{visualKicker}</p>
                      <p className="hero-panel-muted mt-2 text-sm">{visualTitle}</p>
                    </div>
                    <span className="premium-pill hero-badge-pill">
                      <Globe size={13} className="text-primary" />
                      {visualBadge}
                    </span>
                  </div>

                  <div className="hero-visual-frame relative overflow-hidden rounded-[1.7rem]">
                    <img src={heroImageSrc} alt={heroImageAlt} className="h-[430px] w-full object-cover" loading="eager" />
                    <div className="hero-visual-overlay absolute inset-0" />

                    <div className="hero-overlay-card absolute left-4 top-4 rounded-2xl px-4 py-3 sm:left-6 sm:top-6">
                      <p className="hero-overlay-kicker text-[0.68rem] font-semibold uppercase tracking-[0.24em]">{layerKicker}</p>
                      <p className="hero-overlay-title mt-2 text-sm font-semibold">{layerTitle}</p>
                    </div>

                    {(showBottomBox1 || showBottomBox2) && (
                      <div className="absolute bottom-4 left-4 right-4 grid gap-3 sm:bottom-6 sm:left-6 sm:right-6 sm:grid-cols-2">
                        {showBottomBox1 ? (
                          <div className="hero-overlay-card rounded-[1.4rem] p-4">
                            <p className="hero-overlay-kicker text-[0.68rem] font-semibold uppercase tracking-[0.24em]">
                              {pickText(overrideData?.bottom_box1_kicker, hero?.bottom_box1_kicker, "Design-System")}
                            </p>
                            <p className="hero-overlay-body mt-2 text-sm leading-relaxed">
                              {pickText(
                                overrideData?.bottom_box1_title,
                                hero?.bottom_box1_title,
                                "Farben, Typografie und Radien greifen vollautomatisch.",
                              )}
                            </p>
                          </div>
                        ) : null}
                        {showBottomBox2 ? (
                          <div className="hero-overlay-card rounded-[1.4rem] p-4">
                            <p className="hero-overlay-kicker text-[0.68rem] font-semibold uppercase tracking-[0.24em]">
                              {pickText(overrideData?.bottom_box2_kicker, hero?.bottom_box2_kicker, "Admin steuerbar")}
                            </p>
                            <p className="hero-overlay-body mt-2 text-sm leading-relaxed">
                              {pickText(
                                overrideData?.bottom_box2_title,
                                hero?.bottom_box2_title,
                                "Bildpfad, Texte und Kennzahlen bleiben zentral pflegbar.",
                              )}
                            </p>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : null}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.22 }}
          className={`mt-10 grid gap-4 ${proofGridClass}`}
        >
          {effectiveProofItems.map((item, index) => {
            const Icon = proofIconMap[item.icon.toLowerCase()] ?? getLucideIcon(item.icon) ?? BadgeCheck;
            const proofBody = (
              <>
                <div className="hero-proof-icon inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl">
                  <Icon size={18} />
                </div>
                <p className="hero-proof-text text-sm leading-relaxed">{item.text}</p>
              </>
            );

            if (item.href) {
              return (
                <a key={`${item.text}-${index}`} href={item.href} className="glass-card hero-proof-card flex items-start gap-4 rounded-[1.6rem] p-5 transition hover:-translate-y-0.5">
                  {proofBody}
                </a>
              );
            }

            return (
              <div key={`${item.text}-${index}`} className="glass-card hero-proof-card flex items-start gap-4 rounded-[1.6rem] p-5">
                {proofBody}
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
