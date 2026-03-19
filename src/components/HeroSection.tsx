import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useGlobalTheme } from "@/hooks/useGlobalTheme";
import { buildRenderImageUrl } from "@/lib/image";

const HeroSection = () => {
  const { settings } = useGlobalTheme();
  const { data: hero } = useQuery({
    queryKey: ["hero_content"],
    queryFn: async () => {
      const { data, error } = await supabase.from("hero_content").select("*").limit(1).single();
      if (error) throw error;
      return data;
    },
  });

  const scrollTo = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const anyHero = hero as Record<string, unknown> | null;
  const headlineText = String(anyHero?.headline || "").trim();
  const headlineLines = headlineText ? headlineText.split("\n").filter(Boolean) : [];
  const effectiveHeadlineLines =
    headlineLines.length > 0 ? headlineLines : [settings.company_name].filter(Boolean) as string[];

  const heroImagePath =
    typeof anyHero?.image_url === "string"
      ? anyHero.image_url
      : typeof anyHero?.image_path === "string"
        ? anyHero.image_path
        : typeof anyHero?.image === "string"
          ? anyHero.image
          : "";

  const heroImageSrc =
    heroImagePath && !heroImagePath.startsWith("http")
      ? buildRenderImageUrl(heroImagePath, { width: 920, quality: 84 })
      : heroImagePath || "";

  const stats = [
    { label: hero?.stat1_label, value: hero?.stat1_value },
    { label: hero?.stat2_label, value: hero?.stat2_value },
    { label: hero?.stat3_label, value: hero?.stat3_value },
  ].filter((item) => item.label || item.value);

  return (
    <section id="hero" className="dark-section relative overflow-hidden pt-[150px] lg:pt-[172px]">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(251,191,36,0.12),transparent_30%),radial-gradient(circle_at_82%_20%,rgba(15,23,42,0.06),transparent_26%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]" />
        <div className="absolute inset-0 premium-soft-grid opacity-60" />
        <div className="absolute left-1/2 top-0 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="section-container relative z-10 py-14 md:py-20 lg:py-24">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.45 }}
              className="mb-7 inline-flex items-center gap-3 rounded-full border border-primary/25 bg-card/85 px-5 py-2.5 shadow-[0_14px_40px_-30px_rgba(251,191,36,0.75)] backdrop-blur-xl"
            >
              <Sparkles size={15} className="text-primary" />
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[hsl(var(--hero-fg)/0.8)]">
                {hero?.badge_text || settings.company_name || ""}
              </p>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.55, delay: 0.08 }}
              className="max-w-5xl text-5xl font-extrabold leading-[0.96] tracking-[-0.055em] text-balance text-[hsl(var(--midnight))] sm:text-6xl lg:text-[5.35rem]"
            >
              {effectiveHeadlineLines.map((line, idx) => (
                <span key={`${line}-${idx}`} className="block">
                  {idx === effectiveHeadlineLines.length - 1 ? (
                    <span className="inline-block rounded-[1.75rem] bg-[linear-gradient(90deg,rgba(251,191,36,0.16),rgba(255,255,255,0.7),rgba(251,191,36,0.1))] px-2 py-1 gradient-gold-text">
                      {line}
                    </span>
                  ) : (
                    line
                  )}
                </span>
              ))}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.55, delay: 0.16 }}
              className="mt-8 max-w-2xl text-lg leading-relaxed text-[hsl(var(--hero-fg)/0.76)] sm:text-xl"
            >
              {hero?.subheadline || ""}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.55, delay: 0.24 }}
              className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center"
            >
              <button
                onClick={() => scrollTo("#kontakt")}
                className="btn-primary !px-7 !py-4 !text-base sm:!text-lg"
                aria-label="Zur Anfrage"
              >
                {hero?.cta_text || "Jetzt anfragen"}
                <ArrowRight size={18} />
              </button>

              <button
                onClick={() => scrollTo("#portfolio")}
                className="btn-outline !px-7 !py-4 !text-base"
                aria-label="Referenzen ansehen"
              >
                Referenzen ansehen
              </button>
            </motion.div>

            {stats.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.55, delay: 0.3 }}
                className="mt-12 grid gap-4 sm:grid-cols-3"
              >
                {stats.map((item, idx) => (
                  <div key={`${item.label || item.value}-${idx}`} className="premium-card p-5">
                    <div className="relative z-10">
                      <p className="text-2xl font-extrabold tracking-[-0.04em] text-[hsl(var(--midnight))]">
                        {item.value}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.label}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : null}
          </div>

          <motion.div
            initial={{ opacity: 0, x: 36 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.65, delay: 0.12 }}
            className="relative min-h-[420px] lg:min-h-[640px]"
          >
            <div className="premium-card absolute inset-x-0 bottom-0 top-4 overflow-hidden rounded-[2.2rem] border-primary/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(248,250,252,0.92))]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,rgba(251,191,36,0.16),transparent_26%),radial-gradient(circle_at_85%_15%,rgba(15,23,42,0.08),transparent_24%)]" />
              <div className="absolute inset-x-6 top-6 h-px gold-divider" />

              <div className="relative z-10 flex h-full flex-col justify-between p-6 sm:p-8">
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Premium Setup</p>
                    <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
                      Struktur, Performance und Vertrauen in einem sauberen Light-Look mit klaren Conversion-Signalen.
                    </p>
                  </div>
                  <div className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-[hsl(var(--midnight))]">
                    Awwwards-Look
                  </div>
                </div>

                <div className="relative mx-auto flex w-full max-w-[30rem] flex-1 items-end justify-center py-8 lg:py-10">
                  {heroImageSrc ? (
                    <img
                      src={heroImageSrc}
                      alt={`${settings.company_name || "Hero"}`}
                      className="relative z-10 h-auto max-h-[29rem] w-full object-contain drop-shadow-[0_35px_65px_rgba(15,23,42,0.24)]"
                      loading="eager"
                    />
                  ) : (
                    <div className="relative z-10 grid w-full gap-4 sm:grid-cols-2">
                      <div className="premium-card p-6">
                        <div className="relative z-10 space-y-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Struktur</p>
                          <p className="text-2xl font-extrabold tracking-[-0.04em]">Whitespace</p>
                          <p className="text-sm text-muted-foreground">Mehr Ruhe, mehr Hierarchie, mehr Premium-Wirkung.</p>
                        </div>
                      </div>
                      <div className="premium-card p-6 sm:translate-y-8">
                        <div className="relative z-10 space-y-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Interaktion</p>
                          <p className="text-2xl font-extrabold tracking-[-0.04em]">Gold Hovers</p>
                          <p className="text-sm text-muted-foreground">Buttons, Links und Karten reagieren weich und hochwertig.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="premium-card ml-auto max-w-sm p-5 sm:p-6">
                  <div className="relative z-10">
                    <p className="text-sm font-bold text-[hsl(var(--midnight))]">{settings.company_name || "Digital-Perfect"}</p>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      Saubere Datenanbindung, starke Typografie und präzise Conversion-Wege statt nacktem HTML-Gerüst.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
