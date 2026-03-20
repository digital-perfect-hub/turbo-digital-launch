import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, BarChart3, Globe, ShieldCheck, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useGlobalTheme } from "@/hooks/useGlobalTheme";
import { buildRenderImageUrl } from "@/lib/image";
import heroFallback from "@/assets/hero-bg.jpg";

type HeroRecord = {
  badge_text?: string | null;
  headline?: string | null;
  subheadline?: string | null;
  cta_text?: string | null;
  stat1_label?: string | null;
  stat1_value?: string | null;
  stat2_label?: string | null;
  stat2_value?: string | null;
  stat3_label?: string | null;
  stat3_value?: string | null;
  image_url?: string | null;
  image_path?: string | null;
  image?: string | null;
  background_image_path?: string | null;
  background_mobile_image_path?: string | null;
  overlay_opacity?: number | null;
  visual_kicker?: string | null;
  visual_title?: string | null;
  visual_badge?: string | null;
  layer_kicker?: string | null;
  layer_title?: string | null;
  show_bottom_box1?: boolean | null;
  bottom_box1_kicker?: string | null;
  bottom_box1_title?: string | null;
  show_bottom_box2?: boolean | null;
  bottom_box2_kicker?: string | null;
  bottom_box2_title?: string | null;
};

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

const proofItems = [
  { icon: BadgeCheck, text: "Strukturierte Landingpages statt Flächen-Chaos" },
  { icon: BarChart3, text: "Conversion, Sichtbarkeit und Performance im selben System" },
  { icon: ShieldCheck, text: "Robuste Fallbacks, damit leere Admin-Daten nicht alles zerstören" },
];

const resolveImage = (path?: string | null, fallback: string = heroFallback, width = 1600) => {
  const trimmed = String(path || "").trim();
  if (!trimmed) return fallback;
  return trimmed.startsWith("http") ? trimmed : buildRenderImageUrl(trimmed, { width, quality: 86 });
};

const HeroSection = () => {
  const { settings } = useGlobalTheme();
  const { data: hero, isLoading } = useQuery({
    queryKey: ["hero_content"],
    queryFn: async (): Promise<HeroRecord | null> => {
      const { data, error } = await supabase.from("hero_content").select("*").limit(1).maybeSingle();
      if (error) throw error;
      return (data as HeroRecord | null) ?? null;
    },
  });

  const scrollTo = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const safeText = (value: string | null | undefined, fallback: string) => {
    const trimmed = value?.trim();
    return trimmed ? trimmed : fallback;
  };

  const headlineText = safeText(hero?.headline, fallbackHero.headline);
  const headlineLines = headlineText.split("\n").map((line) => line.trim()).filter(Boolean);
  const effectiveHeadlineLines = headlineLines.length > 0 ? headlineLines : fallbackHero.headline.split("\n");

  const heroBadge = safeText(hero?.badge_text, fallbackHero.badge_text);
  const heroSubheadline = safeText(hero?.subheadline, fallbackHero.subheadline);
  const heroCta = safeText(hero?.cta_text, fallbackHero.cta_text);

  const visualKicker = safeText(hero?.visual_kicker, "Hero Visual");
  const visualTitle = safeText(hero?.visual_title, "Ein starkes Bild sagt mehr als 1000 Worte.");
  const visualBadge = safeText(hero?.visual_badge, "Premium Intro");
  
  const layerKicker = safeText(hero?.layer_kicker, "Conversion Layer");
  const layerTitle = safeText(hero?.layer_title, "Premium Hero mit Bild, Signalwerten und CTA-Führung");

  const statItems = [
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

  const heroImageSrc = resolveImage(hero?.image_path || hero?.image_url || hero?.image, heroFallback, 1200);
  const bgImageSrc = resolveImage(hero?.background_image_path, heroFallback, 1920);
  const overlayAlpha = typeof hero?.overlay_opacity === 'number' ? Math.max(0, Math.min(100, hero.overlay_opacity)) / 100 : 0.58;

  return (
    <section id="hero" className="dark-section relative overflow-hidden pt-[158px] lg:pt-[178px]">
      <div className="absolute inset-0 z-0">
        <img src={bgImageSrc} alt="Hero Background" className="h-full w-full object-cover" loading="eager" />
      </div>
      
      <div className="absolute inset-0 z-0" style={{ backgroundColor: `rgba(6,13,36,${overlayAlpha})` }} />
      <div className="absolute inset-0 z-0 noise-overlay opacity-35" />
      <div className="absolute inset-x-0 bottom-0 z-0 h-40 bg-gradient-to-t from-[#eef3f9] to-transparent" />

      <div className="section-container relative z-10 py-14 md:py-20 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.45 }}
              className="section-label mb-6 border-white/10 bg-white/5 text-slate-200"
            >
              <Sparkles size={14} className="text-gold" />
              {heroBadge}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.55, delay: 0.05 }}
              className="max-w-4xl text-balance text-4xl font-extrabold leading-[0.97] tracking-[-0.05em] text-white sm:text-5xl lg:text-[4.7rem]"
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
              className="mt-7 max-w-2xl text-lg leading-relaxed text-slate-300 sm:text-xl"
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
              <button onClick={() => scrollTo("#kontakt")} className="btn-primary !px-7 !py-4 !text-base" style={{ '--tw-hover-bg': 'var(--cta-hover)' } as any}>
                {heroCta}
                <ArrowRight size={18} />
              </button>
              <button onClick={() => scrollTo("#portfolio")} className="btn-outline !border-white/12 !bg-white/5 !text-white hover:!bg-white/10">
                Projekte ansehen
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.55, delay: 0.24 }}
              className="mt-10 grid gap-4 sm:grid-cols-3"
            >
              {effectiveStats.map((item, idx) => (
                <div
                  key={`${item.label}-${idx}`}
                  className={`glass-card rounded-[1.55rem] border-white/10 bg-white/5 p-5 ${isLoading ? "premium-skeleton" : ""}`}
                >
                  <p className="text-xl font-extrabold tracking-[-0.03em] text-white md:text-2xl">{item.value}</p>
                  <p className="mt-2 text-sm font-medium text-slate-300">{item.label}</p>
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
            <div className={`premium-dark-card overflow-hidden p-4 sm:p-5 lg:p-6 ${isLoading ? "premium-skeleton" : ""}`}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,75,44,0.18),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(14,31,83,0.18),transparent_22%)]" />
              <div className="relative z-10 space-y-4">
                
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-slate-300">{visualKicker}</p>
                    <p className="mt-2 text-sm text-slate-400">{visualTitle}</p>
                  </div>
                  <span className="premium-pill border-white/10 bg-white/5 text-slate-100">
                    <Globe size={13} className="text-gold" />
                    {visualBadge}
                  </span>
                </div>

                <div className="relative overflow-hidden rounded-[1.7rem] border border-white/10 bg-slate-900">
                  <img src={heroImageSrc} alt={settings.company_name || "Digital-Perfect Hero"} className="h-[430px] w-full object-cover" loading="eager" />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.08),rgba(15,23,42,0.62))]" />

                  {/* Layer Oben Links */}
                  <div className="absolute left-4 top-4 rounded-2xl border border-white/15 bg-slate-950/60 px-4 py-3 backdrop-blur-xl sm:left-6 sm:top-6">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-300">{layerKicker}</p>
                    <p className="mt-2 text-sm font-semibold text-white">{layerTitle}</p>
                  </div>
                  
                  {/* SCHALTER-LOGIK: Die zwei Boxen unten */}
                  {(hero?.show_bottom_box1 !== false || hero?.show_bottom_box2 !== false) && (
                    <div className="absolute bottom-4 left-4 right-4 grid gap-3 sm:bottom-6 sm:left-6 sm:right-6 sm:grid-cols-2">
                      {hero?.show_bottom_box1 !== false && (
                        <div className="rounded-[1.4rem] border border-white/12 bg-slate-950/65 p-4 backdrop-blur-xl">
                          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-300">{safeText(hero?.bottom_box1_kicker, "Design-System")}</p>
                          <p className="mt-2 text-sm leading-relaxed text-white/90">{safeText(hero?.bottom_box1_title, "Farben, Typografie und Radien greifen vollautomatisch.")}</p>
                        </div>
                      )}
                      {hero?.show_bottom_box2 !== false && (
                        <div className="rounded-[1.4rem] border border-white/12 bg-slate-950/65 p-4 backdrop-blur-xl">
                          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-300">{safeText(hero?.bottom_box2_kicker, "Admin steuerbar")}</p>
                          <p className="mt-2 text-sm leading-relaxed text-white/90">{safeText(hero?.bottom_box2_title, "Bildpfad, Texte und Kennzahlen bleiben zentral pflegbar.")}</p>
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
          {proofItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.text} className="glass-card flex items-start gap-4 rounded-[1.6rem] border-white/10 bg-white/5 p-5">
                <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gold/10 text-gold">
                  <Icon size={18} />
                </div>
                <p className="text-sm leading-relaxed text-slate-200">{item.text}</p>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;