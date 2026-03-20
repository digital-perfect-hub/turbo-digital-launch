import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { defaultProcessSteps, type ProcessStep, useSiteSettings } from "@/hooks/useSiteSettings";

const ProcessSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { getSetting, getJsonSetting } = useSiteSettings();
  const steps = getJsonSetting<ProcessStep[]>("home_process_steps", defaultProcessSteps);

  return (
    <section id="ablauf" className="dark-section py-24 md:py-32" ref={ref}>
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-14 max-w-4xl"
        >
          <p className="section-label">{getSetting("home_process_kicker")}</p>
          <h2 className="section-title max-w-4xl text-white">{getSetting("home_process_title")}</h2>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.07 }}
              className="glass-card p-6"
            >
              <div className="mb-5 flex items-center justify-between gap-3">
                <div className="premium-number">{step.step}</div>
                {step.time ? <span className="text-xs font-semibold text-slate-300">{step.time}</span> : null}
              </div>
              <h3 className="text-lg font-bold text-white">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">{step.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-10"
        >
          <button
            onClick={() => document.querySelector("#kontakt")?.scrollIntoView({ behavior: "smooth" })}
            className="btn-primary"
          >
            Jetzt kostenlos beraten lassen
            <ArrowRight size={18} />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default ProcessSection;
