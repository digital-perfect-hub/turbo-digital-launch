import { motion } from "framer-motion";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useGlobalTheme } from "@/hooks/useGlobalTheme";

const IntroSection = () => {
  const { getSetting } = useSiteSettings();
  const { settings } = useGlobalTheme();

  return (
    <section className="py-20 sm:py-24 md:py-28 bg-background" aria-label="Intro">
      <div className="section-container">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
          >
            <p className="section-label">{settings.company_name || "Digital-Perfect"}</p>
            <h2 className="section-title max-w-5xl">{getSetting("home_intro_title")}</h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            style={{ willChange: "transform, opacity" }}
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
