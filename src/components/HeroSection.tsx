import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

  const stats = hero
    ? [
        { value: hero.stat1_value, label: hero.stat1_label },
        { value: hero.stat2_value, label: hero.stat2_label },
        { value: hero.stat3_value, label: hero.stat3_label },
      ]
    : [
        { value: "6+", label: "Jahre Erfahrung" },
        { value: "50+", label: "Projekte umgesetzt" },
        { value: "1000%", label: "Mehr org. Traffic" },
      ];

  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden dark-section">
      <div className="absolute inset-0">
        <div className="absolute inset-0" style={{ backgroundColor: 'hsl(220 15% 6%)' }} />
        <div className="absolute top-0 right-0 w-[80%] h-[80%] bg-gradient-to-bl from-primary/8 via-emerald/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[60%] h-[60%] bg-gradient-to-tr from-primary/5 via-transparent to-transparent rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="section-container relative z-10 py-32 md:py-40">
        <div className="max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 mb-8">
            <Sparkles size={14} className="text-primary" />
            <span className="text-xs font-semibold text-primary tracking-wide uppercase">
              {hero?.badge_text || "Digital-Perfect · AT/DE"}
            </span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.08] mb-8">
            <span className="gradient-gold-text">Bullenpower</span> für{" "}
            <br className="hidden sm:block" />
            {hero?.headline?.replace("Bullenpower für ", "") || "Webdesign, Onlineshops & SEO"}
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="text-lg md:text-xl max-w-xl mb-12 leading-relaxed opacity-70">
            {hero?.subheadline || "Dein Turbo für digitale Sichtbarkeit & planbare Anfragen in AT/DE."}
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="flex flex-col sm:flex-row gap-4">
            <button onClick={() => scrollTo("#kontakt")} className="btn-primary animate-glow-pulse">
              🚀 {hero?.cta_text || "Kostenlos Beraten lassen"}
              <ArrowRight size={18} />
            </button>
            <button onClick={() => scrollTo("#portfolio")} className="btn-outline">
              Portfolio ansehen
            </button>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.6 }} className="flex flex-wrap gap-8 md:gap-12 mt-16 pt-8 border-t border-white/10">
            {stats.map((stat, i) => (
              <div key={i}>
                <div className="text-2xl md:text-3xl font-extrabold text-primary">{stat.value}</div>
                <div className="text-sm mt-1 opacity-60">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
