import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { defaultAudienceItems, type AudienceItem, useSiteSettings } from "@/hooks/useSiteSettings";

const AudienceSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { getSetting, getJsonSetting } = useSiteSettings();
  const audience = getJsonSetting<AudienceItem[]>("home_audience_items", defaultAudienceItems);

  return (
    <section className="bg-background py-24 md:py-32" ref={ref}>
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-14 max-w-4xl"
        >
          <p className="section-label">{getSetting("home_audience_kicker")}</p>
          <h2 className="section-title">{getSetting("home_audience_title")}</h2>
          <p className="max-w-3xl text-lg leading-relaxed text-slate-600">{getSetting("home_audience_description")}</p>
        </motion.div>

        <div className="grid gap-5 lg:grid-cols-3">
          {audience.map((item, index) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: index * 0.08 }}
              className="premium-grid-card"
            >
              <div className="relative z-10">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-[1.35rem] bg-slate-950 text-2xl shadow-[0_26px_48px_-30px_rgba(15,23,42,0.55)]">
                    {item.emoji}
                  </div>
                  <span className="premium-pill">Passender Fit</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.description}</p>
                <ul className="mt-6 space-y-3">
                  {item.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-3 text-sm leading-relaxed text-slate-700">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AudienceSection;
