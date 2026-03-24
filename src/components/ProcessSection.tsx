import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { defaultProcessSteps, defaultSiteText, type ProcessStep, useSiteSettings } from "@/hooks/useSiteSettings";
import { resolveHomepageSectionStyleVarsFromSettings } from "@/lib/homepage-section-styles";

const navigateToTarget = (target: string) => {
  const normalized = (target || "").trim();
  if (!normalized) return;
  if (normalized.startsWith("#")) {
    document.querySelector(normalized)?.scrollIntoView({ behavior: "smooth" });
    return;
  }
  window.location.href = normalized;
};

const normalizeSteps = (steps: ProcessStep[]) =>
  steps.filter((step) => step?.step?.trim() && step?.title?.trim() && step?.description?.trim());

const ProcessSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { getSetting, getJsonSetting, settings } = useSiteSettings();
  const sectionStyleVars = resolveHomepageSectionStyleVarsFromSettings(settings, "process");

  const steps = normalizeSteps(getJsonSetting<ProcessStep[]>("home_process_steps", defaultProcessSteps));
  const kicker =
    getSetting("home_process_kicker", defaultSiteText.home_process_kicker).trim() || defaultSiteText.home_process_kicker;
  const title =
    getSetting("home_process_title", defaultSiteText.home_process_title).trim() || defaultSiteText.home_process_title;
  const ctaText =
    getSetting("home_process_cta_text", defaultSiteText.home_process_cta_text).trim() ||
    defaultSiteText.home_process_cta_text;
  const ctaLink =
    getSetting("home_process_cta_link", defaultSiteText.home_process_cta_link).trim() ||
    defaultSiteText.home_process_cta_link;

  return (
    <section id="ablauf" className="homepage-style-scope relative overflow-hidden dark-section py-24 md:py-32" ref={ref} style={sectionStyleVars}>
      <div className="noise-overlay pointer-events-none absolute inset-0 z-0 opacity-20" />

      <div className="section-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16 max-w-3xl md:mb-20"
        >
          <p className="section-label">{kicker}</p>
          <h2 className="section-title mt-4 max-w-4xl">{title}</h2>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:gap-8 xl:grid-cols-4">
          {steps.map((step, index) => (
            <motion.div
              key={`${step.step}-${index}`}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative flex h-full flex-col overflow-hidden rounded-[2rem] border p-8 transition-all duration-500 hover:shadow-xl sm:p-10 glass-card"
            >
              <div className="dark-ghost-index pointer-events-none absolute -bottom-8 -right-4 select-none text-[8rem] font-black leading-none transition-colors duration-500 group-hover:text-primary/10">
                {step.step}
              </div>

              <div className="relative z-10 flex flex-1 flex-col">
                <div className="mb-8">
                  {step.time ? (
                    <span className="dark-panel-kicker inline-flex rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
                      {step.time}
                    </span>
                  ) : (
                    <div className="h-7" />
                  )}
                </div>

                <h3 className="hero-stat-value mb-4 text-2xl font-bold leading-tight">{step.title}</h3>
                <p className="hero-stat-label flex-1 text-base leading-relaxed">{step.description}</p>
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
            onClick={() => navigateToTarget(ctaLink)}
            className="btn-primary !px-8 !py-4 text-base shadow-[0_0_40px_-10px_rgba(255,75,44,0.4)]"
          >
            {ctaText}
            <ArrowRight size={18} />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default ProcessSection;
