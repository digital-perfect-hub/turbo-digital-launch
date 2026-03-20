import { motion } from "framer-motion";
import { ArrowRight, Layers3, SearchCheck, Zap } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useGlobalTheme } from "@/hooks/useGlobalTheme";

const quickWins = [
  {
    icon: Layers3,
    title: "Klarere Angebotsarchitektur",
    text: "Leistungen, Nutzen und Vertrauen werden in eine Reihenfolge gebracht, die Besucher sofort verstehen.",
  },
  {
    icon: SearchCheck,
    title: "SEO als Fundament",
    text: "Technische Sauberkeit, sinnvolle Seitenlogik und indexierbare Inhalte statt bloßer Design-Hülle.",
  },
  {
    icon: Zap,
    title: "Schneller zur Anfrage",
    text: "Prägnante Headlines, stärkere CTA-Wege und weniger Reibung vom Einstieg bis zum Kontakt.",
  },
];

const IntroSection = () => {
  const { getSetting } = useSiteSettings();
  const { settings } = useGlobalTheme();

  return (
    <section className="bg-background py-24 sm:py-28 md:py-32" aria-label="Intro">
      <div className="section-container">
        <div className="grid gap-6 xl:grid-cols-[1.04fr_0.96fr] xl:gap-8">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.55 }}
            className="premium-card p-8 md:p-10 lg:p-12"
          >
            <div className="relative z-10">
              <p className="section-label">{settings.company_name || "Digital-Perfect"}</p>
              <h2 className="section-title max-w-4xl">{getSetting("home_intro_title")}</h2>
              <p className="max-w-3xl whitespace-pre-line text-base leading-relaxed text-slate-600 md:text-lg">
                {getSetting("home_intro_body")}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  onClick={() => document.querySelector("#kontakt")?.scrollIntoView({ behavior: "smooth" })}
                  className="btn-primary !px-6 !py-3 !text-sm"
                >
                  Analyse starten
                  <ArrowRight size={16} />
                </button>
                <span className="premium-pill">Positionierung, SEO & Premium-Design in einem System</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="grid gap-4"
          >
            {quickWins.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="premium-grid-card" style={{ transitionDelay: `${index * 30}ms` }}>
                  <div className="relative z-10 flex items-start gap-4">
                    <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-[0_22px_44px_-26px_rgba(15,23,42,0.55)]">
                      <Icon size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.text}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default IntroSection;
