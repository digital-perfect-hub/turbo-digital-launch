import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { defaultWhyChoosePoints, type WhyChoosePoint, useSiteSettings } from "@/hooks/useSiteSettings";

const WhyChooseSection = () => {
  const { getSetting, getJsonSetting } = useSiteSettings();
  const points = getJsonSetting<WhyChoosePoint[]>("home_why_choose_points", defaultWhyChoosePoints);

  return (
    <section className="bg-surface py-24 sm:py-28 md:py-32" aria-label="Warum wählen">
      <div className="section-container">
        <div className="grid gap-8 xl:grid-cols-[0.8fr_1.2fr] xl:gap-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.55 }}
            className="premium-dark-card p-8 md:p-10 xl:sticky xl:top-24 xl:self-start"
          >
            <div className="relative z-10">
              <p className="section-label">{getSetting("home_why_choose_kicker")}</p>
              <h2 className="section-title max-w-3xl text-white">{getSetting("home_why_choose_title")}</h2>
              <p className="text-base leading-relaxed text-slate-300 md:text-lg">
                {getSetting("home_why_choose_description")}
              </p>

              <div className="mt-8 space-y-3">
                <div className="rounded-[1.2rem] border border-white/12 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white">
                  Mehr Premium-Wirkung ohne visuelle Leere
                </div>
                <div className="rounded-[1.2rem] border border-white/12 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white">
                  Mehr SEO-Logik statt hübscher Oberflächen allein
                </div>
                <div className="rounded-[1.2rem] border border-white/12 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white">
                  Mehr Abschlussstärke durch klare nächste Schritte
                </div>
              </div>

              <button
                onClick={() => document.querySelector("#kontakt")?.scrollIntoView({ behavior: "smooth" })}
                className="btn-primary mt-8 !px-6 !py-3 !text-sm"
              >
                Kostenlos anfragen
                <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>

          <div className="grid gap-4 md:grid-cols-2">
            {points.map((point, index) => (
              <motion.div
                key={point.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.45, delay: index * 0.05 }}
                className="premium-grid-card"
              >
                <div className="relative z-10">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <CheckCircle2 size={19} />
                    </div>
                    <span className="premium-pill">{String(index + 1).padStart(2, "0")}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{point.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{point.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseSection;
