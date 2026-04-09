import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, BarChart3, Globe, ShieldCheck, Sparkles } from "lucide-react";
import { useGlobalTheme } from "@/hooks/useGlobalTheme";
import { buildRenderImageUrl } from "@/lib/image";
import { useHeroContent, type HeroRecord } from "@/hooks/useHeroContent";
import type { LandingHeroBlockData } from "@/lib/landing-page-builder";
import heroFallback from "@/assets/hero-bg.jpg";

const fallbackHero: Required<Pick<HeroRecord, "badge_text" | "headline" | "subheadline" | "cta_text">> = {
  badge_text: "Premium SaaS Look für Webdesign & SEO",
  headline: "Webseiten, Shops & SEO-Systeme\nmit Premium-Optik und echter Anfragekraft.",
  subheadline:
    "Digital-Perfect verbindet klare Conversion-Struktur, moderne Markenwirkung und technische Sauberkeit – damit dein Auftritt nicht nur schön aussieht, sondern sichtbar wird und verkauft.",
  cta_text: "Jetzt kostenlos beraten lassen",
};

const fallbackStats = [
  { label: "Fokus", value: "Webdesign & SEO" },
  { label: "Look", value: "Premium SaaS Niveau" },
  { label: "Ziel", value: "Mehr Anfragen" },
];

const fallbackProofItems = [
  { icon: BadgeCheck, text: "Strukturierte Landingpages statt Flächen-Chaos" },
  { icon: BarChart3, text: "Conversion, Sichtbarkeit und Performance im selben System" },
  { icon: ShieldCheck, text: "Robuste Fallbacks, damit leere Admin-Daten nicht alles zerstören" },
];

const proofIconMap = {
  badge: BadgeCheck,
  chart: BarChart3,
  shield: ShieldCheck,
  globe: Globe,
};

const resolveImage = (path?: string | null, fallback: string = heroFallback) => {
  const trimmed = String(path || "").trim();
  if (!trimmed) return fallback;
  return buildRenderImageUrl(trimmed, { width: 1600, quality: 82 });
};

type HeroSectionProps = {
  hero?: HeroRecord | null;
  overrideData?: LandingHeroBlockData | null;
};

const HeroSection = ({ hero: prefetchedHero, overrideData }: HeroSectionProps) => {
  const { settings } = useGlobalTheme();
  const { hero: queriedHero, isLoading } = useHeroContent();
  const isOverrideMode = Boolean(overrideData);
  const hero = (overrideData as (LandingHeroBlockData & HeroRecord) | null) ?? prefetchedHero ?? queriedHero;

  if (isLoading && !hero && !isOverrideMode && !prefetchedHero) {
    return null;
  }

  const scrollTo = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const safeText = (value: string | null | undefined, fallback: string) => {
    const trimmed = value?.trim();
    return trimmed ? trimmed : fallback;
  };

  const headlineText = safeText(hero?.headline, fallbackHero.headline);
  const headlineLines = headlineText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const effectiveHeadlineLines = headlineLines.length > 0 ? headlineLines : fallbackHero.headline.split("\n");

  const heroBadge = safeText(hero?.badge_text, fallbackHero.badge_text);
  const heroSubheadline = safeText(hero?.subheadline, fallbackHero.subheadline);

  const primaryCtaText = isOverrideMode
    ? overrideData?.primary_cta_text?.trim() || ""
    : safeText(hero?.cta_text, fallbackHero.cta_text);
  const primaryCtaHref = overrideData?.primary_cta_href?.trim() || "";
  const secondaryCtaText = isOverrideMode ? overrideData?.secondary_cta_text?.trim() || "" : "Projekte ansehen";
  const secondaryCtaHref = overrideData?.secondary_cta_href?.trim() || "";

  const visualKicker = safeText(hero?.visual_kicker, "Hero Visual");
  const visualTitle = safeText(hero?.visual_title, "Ein starkes Bild sagt mehr als 1000 Worte.");
  const visualBadge = safeText(hero?.visual_badge, "Premium Intro");
  const layerKicker = safeText(hero?.layer_kicker, "Conversion Layer");
  const layerTitle = safeText(hero?.layer_title, "Premium Hero mit Bild, Signalwerten und CTA-Führung");

  const statItems =
    overrideData?.stats && overrideData.stats.length > 0
      ? overrideData.stats.filter((item) => item.label?.trim() && item.value?.trim())
      : [
          { label: hero?.stat1_label, value: hero?.stat1_value },
          { label: hero?.stat2_label, value: hero?.stat2_value },
          { label: hero?.stat3_label, value: hero?.stat3_value },
        ]
          .filter((item) => item.label?.trim() || item.value?.trim())
          .map((item) => ({
            label: safeText(item.label, "Signal"),
            value: safeText(item.value, "Aktiv"),
          }));

  const effectiveStats = statItems.length > 0 ? statItems : fallbackStats;

  const effectiveProofItems =
    overrideData?.proof_items && overrideData.proof_items.length > 0
      ? overrideData.proof_items
          .filter((item) => item.text?.trim())
          .map((item) => ({
            icon: proofIconMap[item.icon || "badge"] || BadgeCheck,
            text: item.text,
          }))
      : fallbackProofItems;

  const heroImageSrc = resolveImage(hero?.image_path || hero?.image_url || hero?.image, heroFallback);
  const bgImageSrc = resolveImage(hero?.background_image_path, heroFallback);
  const bgMobileImageSrc = hero?.background_mobile_image_path
    ? resolveImage(hero?.background_mobile_image_path, bgImageSrc)
    : bgImageSrc;
  const overlayAlpha =
    typeof hero?.overlay_opacity === "number" ? Math.max(0, Math.min(100, hero.overlay_opacity)) / 100 : 0.58;

  const renderPrimaryAction = () => {
    if (!primaryCtaText) return null;

    if (primaryCtaHref) {
      return (
        <a href={primaryCtaHref} className="btn-primary !px-7 !py-4 !text-base" style={{ "--tw-hover-bg": "var(--cta-hover)" } as any}>
          {primaryCtaText}
          <ArrowRight size={18} />
        </a>
      );
    }

    return (
      <button onClick={() => scrollTo("#kontakt")} className="btn-primary !px-7 !py-4 !text-base" style={{ "--tw-hover-bg": "var(--cta-hover)" } as any}>
        {primaryCtaText}
        <ArrowRight size={18} />
      </button>
    );
  };

  const renderSecondaryAction = () => {
    if (!secondaryCtaText) return null;

    if (secondaryCtaHref) {
      return (
        <a
          href={secondaryCtaHref}
          className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/16 bg-white/10 px-6 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/14"
        >
          {secondaryCtaText}
        </a>
      );
    }

    return (
      <button onClick={() => scrollTo("#portfolio")} className="btn-outline hero-secondary-button">
        {secondaryCtaText}
      </button>
    );
  };

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
        <div className="grid items-center gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16">
          <div className="max-w-3xl">
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
                <span
                  key={`${line}-${idx}`}
                  className={idx === effectiveHeadlineLines.length - 1 ? "block text-gradient-dark" : "block"}
                >
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
              {renderPrimaryAction()}
              {renderSecondaryAction()}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.55, delay: 0.24 }}
              className="mt-10 grid gap-4 sm:grid-cols-3"
            >
              {effectiveStats.map((item, idx) => (
                <div key={`${item.label}-${idx}`} className={`glass-card hero-stat-card rounded-[1.55rem] p-5 ${isLoading && !isOverrideMode ? "premium-skeleton" : ""}`}>
                  <p className="hero-stat-value text-xl font-extrabold tracking-[-0.03em] md:text-2xl">{item.value}</p>
                  <p className="hero-stat-label mt-2 text-sm font-medium">{item.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 34 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.65, delay: 0.1 }}
            className="relative"
          >
            <div className={`premium-dark-card overflow-hidden p-4 sm:p-5 lg:p-6 ${isLoading && !isOverrideMode ? "premium-skeleton" : ""}`}>
              <div className="relative z-10 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="hero-panel-kicker text-[0.72rem] font-semibold uppercase tracking-[0.28em]">
                      {visualKicker}
                    </p>
                    <p className="hero-panel-muted mt-2 text-sm">{visualTitle}</p>
                  </div>
                  <span className="premium-pill hero-badge-pill">
                    <Globe size={13} className="text-primary" />
                    {visualBadge}
                  </span>
                </div>

                <div className="hero-visual-frame relative overflow-hidden rounded-[1.7rem]">
                  <img src={heroImageSrc} alt={settings.company_name || "Digital-Perfect Hero"} className="h-[430px] w-full object-cover" loading="eager" />
                  <div className="hero-visual-overlay absolute inset-0" />

                  <div className="hero-overlay-card absolute left-4 top-4 rounded-2xl px-4 py-3 sm:left-6 sm:top-6">
                    <p className="hero-overlay-kicker text-[0.68rem] font-semibold uppercase tracking-[0.24em]">
                      {layerKicker}
                    </p>
                    <p className="hero-overlay-title mt-2 text-sm font-semibold">{layerTitle}</p>
                  </div>

                  {(hero?.show_bottom_box1 !== false || hero?.show_bottom_box2 !== false) && (
                    <div className="absolute bottom-4 left-4 right-4 grid gap-3 sm:bottom-6 sm:left-6 sm:right-6 sm:grid-cols-2">
                      {hero?.show_bottom_box1 !== false && (
                        <div className="hero-overlay-card rounded-[1.4rem] p-4">
                          <p className="hero-overlay-kicker text-[0.68rem] font-semibold uppercase tracking-[0.24em]">
                            {safeText(hero?.bottom_box1_kicker, "Design-System")}
                          </p>
                          <p className="hero-overlay-body mt-2 text-sm leading-relaxed">
                            {safeText(
                              hero?.bottom_box1_title,
                              "Farben, Typografie und Radien greifen vollautomatisch.",
                            )}
                          </p>
                        </div>
                      )}
                      {hero?.show_bottom_box2 !== false && (
                        <div className="hero-overlay-card rounded-[1.4rem] p-4">
                          <p className="hero-overlay-kicker text-[0.68rem] font-semibold uppercase tracking-[0.24em]">
                            {safeText(hero?.bottom_box2_kicker, "Admin steuerbar")}
                          </p>
                          <p className="hero-overlay-body mt-2 text-sm leading-relaxed">
                            {safeText(
                              hero?.bottom_box2_title,
                              "Bildpfad, Texte und Kennzahlen bleiben zentral pflegbar.",
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.22 }}
          className="mt-10 grid gap-4 xl:grid-cols-3"
        >
          {effectiveProofItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.text} className="glass-card hero-proof-card flex items-start gap-4 rounded-[1.6rem] p-5">
                <div className="hero-proof-icon inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl">
                  <Icon size={18} />
                </div>
                <p className="hero-proof-text text-sm leading-relaxed">{item.text}</p>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
