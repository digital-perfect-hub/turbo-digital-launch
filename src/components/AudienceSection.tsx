import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { defaultAudienceItems, type AudienceItem, useSiteSettings } from "@/hooks/useSiteSettings";

const AudienceSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { getSetting, getJsonSetting } = useSiteSettings();
  const audience = getJsonSetting<AudienceItem[]>("home_audience_items", defaultAudienceItems);

  return (
    <section className="py-24 md:py-32 bg-background" ref={ref}>
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mb-14"
        >
          <p className="section-label">{getSetting("home_audience_kicker")}</p>
          <h2 className="section-title">{getSetting("home_audience_title")}</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {getSetting("home_audience_description")}
          </p>
        </motion.div>

        <div className="grid gap-5 lg:grid-cols-3">
          {audience.map((item, index) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: index * 0.08 }}
              className="glass-card p-7"
            >
              <div className="text-3xl mb-4">{item.emoji}</div>
              <h3 className="text-xl font-bold mb-3">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">{item.description}</p>
              <ul className="space-y-3">
                {item.bullets.map((bullet) => (
                  <li key={bullet} className="text-sm text-foreground/85 leading-relaxed flex gap-3">
                    <span className="text-primary font-bold">•</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AudienceSection;
