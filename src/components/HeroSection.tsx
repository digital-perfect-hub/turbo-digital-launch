import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/dp-hero-markus.png";

const HeroSection = () => {
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

  return (
    <section id="hero" className="relative overflow-hidden dark-section pt-[132px] lg:pt-[152px]">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,hsl(var(--secondary)/0.25),transparent_34%),linear-gradient(90deg,hsl(var(--hero-bg)),hsl(158_70%_14%))]" />
        <div className="absolute inset-0 noise-overlay opacity-40" />
      </div>

      <div className="section-container relative z-10 py-12 md:py-16 lg:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="max-w-3xl">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="mb-5 text-sm uppercase tracking-[0.28em] text-[hsl(var(--hero-fg)/0.7)]"
            >
              {hero?.badge_text || "DIGITAL-PERFECT"}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08 }}
              className="max-w-4xl text-4xl sm:text-5xl lg:text-[4rem] font-extrabold leading-[1.08] text-balance"
            >
              <span className="gradient-gold-text">Bullenpower</span> für Webdesign,
              <br />
              Onlineshops & SEO: Dein Turbo für
              <br />
              digitale Sichtbarkeit & planbare
              <br />
              Anfragen.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.16 }}
              className="mt-8 max-w-2xl text-xl leading-relaxed text-[hsl(var(--hero-fg)/0.82)]"
            >
              {hero?.subheadline || "Websites & Onlineshops mit klarem Fokus auf Performance und messbaren Ergebnissen."}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.24 }}
              className="mt-10"
            >
              <button onClick={() => scrollTo("#kontakt")} className="btn-primary !rounded-full !px-7 !py-4 !text-lg">
                🚀 Zur Anfrage — 1 Minute
                <ArrowRight size={18} />
              </button>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 36 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, delay: 0.12 }}
            className="relative min-h-[340px] lg:min-h-[520px]"
          >
            <img
              src={heroImage}
              alt="Markus Schulz von Digital-Perfect"
              className="absolute bottom-0 right-0 h-full w-auto max-w-full object-contain"
              loading="eager"
            />

            <div className="absolute right-0 bottom-8 lg:bottom-20 max-w-sm rounded-[1.75rem] border border-border/20 bg-card/10 backdrop-blur-xl p-6 text-[hsl(var(--hero-fg))] shadow-2xl">
              <p className="font-bold text-lg">Markus Schulz</p>
              <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--hero-fg)/0.8)]">
                Experte für Webdesign, SEO & digitale Sichtbarkeit. Über 6 Jahre Erfahrung in der Entwicklung leistungsstarker Websites – mit Fokus auf Performance, maximale Sichtbarkeit und nachhaltige Lead-Gewinnung.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
