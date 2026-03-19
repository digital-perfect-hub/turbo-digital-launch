import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { defaultWhyChoosePoints, type WhyChoosePoint, useSiteSettings } from "@/hooks/useSiteSettings";

const WhyChooseSection = () => {
  const { getSetting, getJsonSetting } = useSiteSettings();
  const points = getJsonSetting<WhyChoosePoint[]>("home_why_choose_points", defaultWhyChoosePoints);

  return (
    <section className="py-20 sm:py-24 md:py-28 bg-surface" aria-label="Warum wählen">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mb-14"
        >
          <p className="section-label">{getSetting("home_why_choose_kicker")}</p>
          <h2 className="section-title">{getSetting("home_why_choose_title")}</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {getSetting("home_why_choose_description")}
          </p>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {points.map((point, index) => (
            <motion.div
              key={point.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.45, delay: index * 0.05 }}
              className="glass-card p-6 h-full transition-transform duration-500 hover:scale-[1.01]"
              style={{ willChange: "transform, opacity" }}
            >
              <CheckCircle2 className="text-primary mb-4" size={22} />
              <h3 className="text-base font-bold mb-3">{point.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{point.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-10"
        >
          <button
            onClick={() => document.querySelector("#kontakt")?.scrollIntoView({ behavior: "smooth" })}
            className="btn-primary min-h-[44px]"
          >
            🚀 Unverbindlich anfragen
            <ArrowRight size={18} />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default WhyChooseSection;
