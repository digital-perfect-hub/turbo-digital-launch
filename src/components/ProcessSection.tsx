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
    <section id="ablauf" className="dark-section py-24 md:py-32 relative overflow-hidden" ref={ref}>
      {/* Subtiles Rauschen für Premium-Tiefe */}
      <div className="absolute inset-0 z-0 noise-overlay opacity-20 pointer-events-none" />
      
      <div className="section-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16 md:mb-20 max-w-3xl"
        >
          <p className="section-label border-white/10 bg-white/5 text-slate-300">
            {getSetting("home_process_kicker", "Ablauf")}
          </p>
          <h2 className="section-title max-w-4xl text-white mt-4">
            {getSetting("home_process_title", "Der Weg zum Launch.")}
          </h2>
        </motion.div>

        <div className="grid gap-6 lg:gap-8 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative h-full rounded-[2rem] border border-white/10 bg-white/5 p-8 sm:p-10 transition-all duration-500 hover:bg-white/10 hover:border-white/20 overflow-hidden flex flex-col"
            >
              {/* Wasserzeichen-Zahl */}
              <div className="absolute -right-4 -bottom-8 text-[8rem] font-black text-white/[0.03] transition-colors duration-500 group-hover:text-primary/10 pointer-events-none select-none leading-none">
                {step.step}
              </div>

              <div className="relative z-10 flex-1 flex flex-col">
                <div className="mb-8">
                  {step.time ? (
                    <span className="inline-flex rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-300 backdrop-blur-md">
                      {step.time}
                    </span>
                  ) : (
                    <div className="h-7" /> /* Platzhalter für konsistente Höhe */
                  )}
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-4 leading-tight">{step.title}</h3>
                <p className="text-base leading-relaxed text-slate-400 flex-1">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <button
            onClick={() => document.querySelector("#kontakt")?.scrollIntoView({ behavior: "smooth" })}
            className="btn-primary !px-8 !py-4 text-base shadow-[0_0_40px_-10px_rgba(255,75,44,0.4)]"
          >
            Jetzt Erstgespräch vereinbaren
            <ArrowRight size={18} />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default ProcessSection;