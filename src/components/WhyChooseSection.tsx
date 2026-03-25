import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { defaultSiteText, defaultWhyChoosePoints, type WhyChoosePoint, useSiteSettings } from "@/hooks/useSiteSettings";
import { sanitizeRichHtml } from "@/lib/content";
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

const WhyChooseSection = () => {
  const { getSetting, getJsonSetting, settings } = useSiteSettings();
  const sectionStyleVars = resolveHomepageSectionStyleVarsFromSettings(settings, "why-choose");

  const points = getJsonSetting<WhyChoosePoint[]>("home_why_choose_points", defaultWhyChoosePoints).filter(
    (item) => item?.title?.trim() && item?.description?.trim(),
  );

  const kicker =
    getSetting("home_why_choose_kicker", defaultSiteText.home_why_choose_kicker).trim() ||
    defaultSiteText.home_why_choose_kicker;
  const title =
    getSetting("home_why_choose_title", defaultSiteText.home_why_choose_title).trim() ||
    defaultSiteText.home_why_choose_title;
  const bodyHtml =
    getSetting("home_why_choose_body", defaultSiteText.home_why_choose_body).trim() ||
    defaultSiteText.home_why_choose_body;
  const ctaText =
    getSetting("home_why_choose_cta_text", defaultSiteText.home_why_choose_cta_text).trim() ||
    defaultSiteText.home_why_choose_cta_text;
  const ctaLink =
    getSetting("home_why_choose_cta_link", defaultSiteText.home_why_choose_cta_link).trim() ||
    defaultSiteText.home_why_choose_cta_link;

  return (
    <section className="homepage-style-scope surface-section-shell relative overflow-hidden py-24 sm:py-32" aria-label="Warum wir?" style={sectionStyleVars}>
      <div className="pointer-events-none absolute -right-[10%] -top-[20%] h-[1000px] w-[1000px] bg-[radial-gradient(circle_at_center,hsl(var(--primary))_0%,transparent_50%)] opacity-[0.03] blur-[120px]" />

      <div className="section-container relative z-10">
        <div className="grid gap-12 xl:grid-cols-[0.85fr_1.15fr] xl:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="dark-panel-shell relative self-start overflow-hidden rounded-[2.5rem] p-10 xl:sticky xl:top-32 md:p-12 lg:p-14"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,color-mix(in_srgb,var(--hero-headline)_6%,transparent)_0%,transparent_50%)]" />

            <div className="relative z-10">
              <p className="dark-panel-kicker mb-6 inline-flex rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] backdrop-blur-md">
                {kicker}
              </p>

              <h2 className="dark-panel-title mb-6 text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-4xl md:text-5xl">
                {title}
              </h2>

              {bodyHtml ? (
                <div
                  className="dark-panel-body mb-10 text-lg leading-relaxed [&_p]:mb-4 [&_strong]:font-semibold"
                  dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(bodyHtml) }}
                />
              ) : null}

              <button
                onClick={() => navigateToTarget(ctaLink)}
                className="btn-primary !px-8 !py-4 !text-base shadow-[0_0_40px_-10px_rgba(var(--primary),0.4)]"
              >
                {ctaText}
                <ArrowRight size={18} />
              </button>
            </div>
          </motion.div>

          <div className="grid content-start gap-6 sm:gap-8 md:grid-cols-2">
            {points.map((point, index) => (
              <motion.div
                key={point.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-border bg-card p-8 shadow-sm transition-all duration-500 hover:shadow-xl"
              >
                <div className="pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 bg-[radial-gradient(circle_at_center,hsl(var(--primary))_0%,transparent_70%)] opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-[0.08]" />

                <div className="relative z-10 flex flex-1 flex-col">
                  <div className="mb-8 flex items-start justify-between gap-4">
                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform duration-500 group-hover:scale-110">
                      <CheckCircle2 size={24} strokeWidth={2.5} />
                    </div>

                    <span className="surface-index-number select-none text-4xl font-black transition-colors duration-500 group-hover:text-primary/10">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <h3 className="mb-3 text-xl font-bold leading-tight text-foreground">{point.title}</h3>
                  <p className="flex-1 text-base leading-relaxed text-muted-foreground">{point.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseSection;
