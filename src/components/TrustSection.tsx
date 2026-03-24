import { motion } from "framer-motion";
import { BarChart3, Gauge, Shield, Users } from "lucide-react";
import { defaultSiteText, defaultTrustPoints, type TrustPoint, useSiteSettings } from "@/hooks/useSiteSettings";
import { resolveHomepageSectionStyleVarsFromSettings } from "@/lib/homepage-section-styles";

const iconMap = {
  users: Users,
  gauge: Gauge,
  chart: BarChart3,
  shield: Shield,
} satisfies Record<string, typeof Users>;

const normalizeTrustPoints = (points: TrustPoint[]) =>
  points
    .filter((item) => item?.title?.trim() && item?.desc?.trim())
    .map((item) => ({
      ...item,
      icon: item.icon && iconMap[item.icon] ? item.icon : "users",
    }));

const TrustSection = () => {
  const { getSetting, getJsonSetting, settings } = useSiteSettings();
  const sectionStyleVars = resolveHomepageSectionStyleVarsFromSettings(settings, "trust");

  const trustPoints = normalizeTrustPoints(getJsonSetting<TrustPoint[]>("home_trust_points", defaultTrustPoints));
  const kicker =
    getSetting("home_trust_kicker", defaultSiteText.home_trust_kicker).trim() || defaultSiteText.home_trust_kicker;
  const title =
    getSetting("home_trust_title", defaultSiteText.home_trust_title).trim() || defaultSiteText.home_trust_title;
  const description =
    getSetting("home_trust_description", defaultSiteText.home_trust_description).trim() ||
    defaultSiteText.home_trust_description;

  return (
    <section className="homepage-style-scope surface-page-shell relative z-20 -mt-8 bg-background pb-8 md:-mt-10" aria-label="Vertrauen" style={sectionStyleVars}>
      <div className="section-container">
        <div className="premium-card p-5 md:p-7 lg:p-8">
          <div className="mb-6 max-w-3xl">
            <p className="section-label">{kicker}</p>
            <h2 className="homepage-section-title mt-4 text-2xl font-black tracking-tight md:text-3xl">{title}</h2>
            {description ? <p className="homepage-section-muted mt-4 text-base leading-relaxed">{description}</p> : null}
          </div>

          <div className="relative z-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {trustPoints.map((feature, index) => {
              const Icon = iconMap[feature.icon || "users"] || Users;

              return (
                <motion.article
                  key={`${feature.title}-${index}`}
                  initial={{ opacity: 0, y: 26 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.45, delay: index * 0.05 }}
                  className="rounded-[1.4rem] border border-border bg-card p-5 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.16)]"
                >
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon size={20} />
                  </div>
                  <h3 className="text-base font-bold text-foreground">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{feature.desc}</p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
