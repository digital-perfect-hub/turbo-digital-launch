import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const IntroSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { getSetting } = useSiteSettings();

  return (
    <section className="py-24 md:py-32 bg-background" ref={ref}>
      <div className="section-container">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <p className="section-label">Digital-Perfect</p>
            <h2 className="section-title max-w-5xl">{getSetting("home_intro_title")}</h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="glass-card p-6 md:p-8"
          >
            <p className="text-base md:text-lg leading-relaxed text-muted-foreground whitespace-pre-line">
              {getSetting("home_intro_body")}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default IntroSection;
