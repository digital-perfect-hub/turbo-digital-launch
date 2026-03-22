import { motion } from "framer-motion";
import { BarChart3, Gauge, Shield, Users } from "lucide-react";
import { defaultTrustPoints, type TrustPoint, useSiteSettings } from "@/hooks/useSiteSettings";

const iconMap = {
  users: Users,
  gauge: Gauge,
  chart: BarChart3,
  shield: Shield,
} satisfies Record<string, typeof Users>;

const TrustSection = () => {
  const { getSetting, getJsonSetting } = useSiteSettings();
  const trustPoints = getJsonSetting<TrustPoint[]>("home_trust_points", defaultTrustPoints).filter((item) => item?.title?.trim() && item?.desc?.trim());
  const trustDescription = getSetting("home_trust_description", "").trim();

  return (
    <section className="relative z-20 bg-background pb-8 -mt-8 md:-mt-10" aria-label="Vertrauen">
      <div className="section-container">
        <div className="premium-card p-5 md:p-7 lg:p-8">
          <div className="mb-6 max-w-3xl">
            <p className="section-label">{getSetting("home_trust_kicker", "Vertrauen & System")}</p>
            <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
              {getSetting("home_trust_title", "Warum dieser Auftritt nicht nur schön, sondern belastbar ist")}
            </h2>
            {trustDescription ? <p className="mt-4 text-base leading-relaxed text-slate-600">{trustDescription}</p> : null}
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
                  className="rounded-[1.4rem] border border-slate-200/85 bg-white/88 p-5 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.16)]"
                >
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon size={20} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{feature.desc}</p>
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
