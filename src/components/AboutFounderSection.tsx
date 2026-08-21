import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, Quote } from "lucide-react";
import { defaultTestimonials, useSiteSettings } from "@/hooks/useSiteSettings";
import {
  resolveHomepageSectionPatternClassFromSettings,
  resolveHomepageSectionStyleVarsFromSettings,
} from "@/lib/homepage-section-styles";
import founderPhoto from "@/assets/dp-hero-markus.png";

const navigateToTarget = (target: string) => {
  const normalized = (target || "").trim();
  if (!normalized) return;
  if (normalized.startsWith("#")) {
    document.querySelector(normalized)?.scrollIntoView({ behavior: "smooth" });
    return;
  }
  window.location.href = normalized;
};

const featuredTestimonial = defaultTestimonials[0];

const AboutFounderSection = () => {
  const { getSetting, settings } = useSiteSettings();
  const sectionStyleVars = resolveHomepageSectionStyleVarsFromSettings(settings, "founder");
  const sectionPatternClass = resolveHomepageSectionPatternClassFromSettings(settings, "founder");

  const kicker = getSetting("home_founder_kicker", "Persönlich statt anonym");
  const title = getSetting("home_founder_title", "Ein Ansprechpartner, keine Agentur-Warteschlange.");
  const body = getSetting(
    "home_founder_body",
    "Hinter Digital-Perfect steht Markus Schulz. Strategie, Design und technische Umsetzung laufen bei einer Person zusammen – ohne Weitergabe an wechselnde Ansprechpartner und ohne Briefing, das auf dem Weg verloren geht.",
  );
  const ctaText = getSetting("home_founder_cta_text", "Weitere Kundenstimmen ansehen");

  return (
    <section
      id="ueber-markus"
      className={`homepage-style-scope surface-section-shell ${sectionPatternClass} relative overflow-hidden py-24 sm:py-32`}
      aria-label="Über Markus"
      style={sectionStyleVars}
    >
      <div className="section-container relative z-10">
        <div className="grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="relative mx-auto w-full max-w-sm"
          >
            <div className="overflow-hidden rounded-[2rem] border shadow-[0_38px_110px_-62px_rgba(14,31,83,0.32)]" style={{ borderColor: "var(--surface-card-border)" }}>
              <img src={founderPhoto} alt="Markus Schulz, Digital-Perfect" className="h-full w-full object-cover" loading="lazy" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.12 }}
          >
            <p className="section-label">{kicker}</p>
            <h2 className="section-title mt-4">{title}</h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{body}</p>

            {featuredTestimonial ? (
              <div
                className="mt-8 rounded-[1.6rem] border p-6 md:p-7"
                style={{
                  borderColor: "color-mix(in srgb, var(--surface-card-border) 58%, var(--theme-secondary-hex) 42%)",
                  background: "linear-gradient(180deg, var(--surface-card) 0%, color-mix(in srgb, var(--surface-card) 88%, var(--theme-secondary-hex) 7%) 100%)",
                }}
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Quote size={18} />
                </div>
                <p className="text-base leading-relaxed text-[var(--surface-card-text)]">“{featuredTestimonial.text}”</p>
                <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-[var(--surface-card-muted)]">
                  <BadgeCheck size={16} className="text-primary" />
                  {featuredTestimonial.name} · {featuredTestimonial.role}
                </div>
              </div>
            ) : null}

            <button
              onClick={() => navigateToTarget("#testimonials")}
              className="btn-outline hero-secondary-button mt-8 inline-flex items-center gap-2 !px-6 !py-3.5 !text-base"
            >
              {ctaText}
              <ArrowRight size={16} />
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutFounderSection;
