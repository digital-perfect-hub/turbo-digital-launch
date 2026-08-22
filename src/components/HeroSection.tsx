import { motion } from "framer-motion";
import { ArrowRight, Globe, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useGlobalTheme } from "@/hooks/useGlobalTheme";
import { defaultSiteText, useSiteSettings } from "@/hooks/useSiteSettings";
import { buildRenderImageUrl } from "@/lib/image";
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

type HeroSectionProps = {
  hero?: HeroRecord | null;
  overrideData?: HeroOverrideData | null;
};

const HeroSection = ({ hero: prefetchedHero, overrideData }: HeroSectionProps) => {
  const { settings } = useGlobalTheme();
  const { getSetting } = useSiteSettings();
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
  const secondaryCtaLabel = pickText(
    overrideData?.secondary_cta_text,
    overrideData?.secondaryCtaLabel,
    getSetting("home_hero_secondary_cta_text", defaultSiteText.home_hero_secondary_cta_text),
    "Pakete ansehen",
  );
  const secondaryCtaHref = pickText(
    overrideData?.secondary_cta_href,
    overrideData?.secondaryCtaHref,
    getSetting("home_hero_secondary_cta_link", defaultSiteText.home_hero_secondary_cta_link),
    "#seo-pakete",
  );

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

  const heroImageSrc = resolveImage(
    pickText(overrideData?.image_path, overrideData?.image_url, overrideData?.image, hero?.image_path, hero?.image_url, hero?.image),
    heroFallback,
  );

  const showVisualPanel = pickBoolean(overrideData?.show_visual_panel, hero?.show_visual_panel, true) !== false;
  const showBottomBox1 = pickBoolean(overrideData?.show_bottom_box1, hero?.show_bottom_box1, true) !== false;
  const showBottomBox2 = pickBoolean(overrideData?.show_bottom_box2, hero?.show_bottom_box2, true) !== false;
  const heroImageAlt = pickText(
    overrideData?.image_alt,
    settings.company_name ? `${settings.company_name} Hero Visual` : "Digital-Perfect Hero",
  );

  return (
    <section id="hero" className="dark-section relative overflow-hidden pt-[128px] lg:pt-[148px]">
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(120% 90% at 88% -10%, color-mix(in srgb, var(--theme-primary-hex) 20%, transparent) 0%, transparent 48%), linear-gradient(180deg, var(--hero-bg-color) 0%, color-mix(in srgb, var(--hero-bg-color) 84%, black 16%) 100%)",
        }}
      />

      <div className="section-container relative z-10 py-10 md:py-14 lg:py-16">
        <div className={`grid items-center gap-12 ${showVisualPanel ? "lg:grid-cols-[1.06fr_0.94fr] lg:gap-16" : ""}`}>
          <div className={showVisualPanel ? "max-w-[860px]" : "max-w-3xl"}>
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
      </div>
    </section>
  );
};

export default HeroSection;
