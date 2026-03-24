import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { defaultAudienceItems, defaultSiteText, type AudienceItem, useSiteSettings } from "@/hooks/useSiteSettings";
import { resolveHomepageSectionStyleVarsFromSettings } from "@/lib/homepage-section-styles";

const normalizeAudience = (items: AudienceItem[]) =>
  items
    .filter((item) => item?.title?.trim() && item?.description?.trim())
    .map((item) => ({
      ...item,
      emoji: item.emoji?.trim() || "✨",
      bullets: Array.isArray(item.bullets) ? item.bullets.filter((bullet) => bullet?.trim()) : [],
    }));

const AudienceSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { getSetting, getJsonSetting, settings } = useSiteSettings();
  const sectionStyleVars = resolveHomepageSectionStyleVarsFromSettings(settings, "audience");

  const audience = normalizeAudience(getJsonSetting<AudienceItem[]>("home_audience_items", defaultAudienceItems));
  const kicker =
    getSetting("home_audience_kicker", defaultSiteText.home_audience_kicker).trim() || defaultSiteText.home_audience_kicker;
  const title =
    getSetting("home_audience_title", defaultSiteText.home_audience_title).trim() || defaultSiteText.home_audience_title;
  const description =
    getSetting("home_audience_description", defaultSiteText.home_audience_description).trim() ||
    defaultSiteText.home_audience_description;
  const badge =
    getSetting("home_audience_item_badge", defaultSiteText.home_audience_item_badge).trim() ||
    defaultSiteText.home_audience_item_badge;

  return (
    <section className="homepage-style-scope surface-page-shell bg-background py-24 md:py-32" ref={ref} style={sectionStyleVars}>
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-14 max-w-4xl"
        >
          <p className="section-label">{kicker}</p>
          <h2 className="section-title">{title}</h2>
          <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">{description}</p>
        </motion.div>

        <div className="grid gap-5 lg:grid-cols-3">
          {audience.map((item, index) => (
            <motion.article
              key={`${item.title}-${index}`}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: index * 0.08 }}
              className="premium-grid-card"
            >
              <div className="relative z-10">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div className="surface-emoji-chip inline-flex h-14 w-14 items-center justify-center rounded-[1.35rem] text-2xl">
                    {item.emoji}
                  </div>
                  <span className="premium-pill">{badge}</span>
                </div>

                <h3 className="text-xl font-bold text-foreground">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.description}</p>

                {item.bullets.length ? (
                  <ul className="mt-6 space-y-3">
                    {item.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AudienceSection;
