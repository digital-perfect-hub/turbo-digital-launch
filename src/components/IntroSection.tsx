import { motion } from "framer-motion";
import { ArrowRight, Layers3, SearchCheck, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { useGlobalTheme } from "@/hooks/useGlobalTheme";
import { defaultIntroQuickWins, type IntroQuickWin, useSiteSettings } from "@/hooks/useSiteSettings";
import { sanitizeRichHtml } from "@/lib/content";

const introIconMap = {
  layers: Layers3,
  search: SearchCheck,
  zap: Zap,
  shield: ShieldCheck,
  sparkles: Sparkles,
} satisfies Record<string, typeof Layers3>;

const navigateToTarget = (target: string) => {
  const normalized = (target || "").trim();
  if (!normalized) return;
  if (normalized.startsWith("#")) {
    document.querySelector(normalized)?.scrollIntoView({ behavior: "smooth" });
    return;
  }
  window.location.href = normalized;
};

const IntroSection = () => {
  const { getSetting, getJsonSetting } = useSiteSettings();
  const { settings } = useGlobalTheme();
  const introBody = getSetting("home_intro_body", "");
  const introBadge = getSetting("home_intro_badge", settings.company_name || "Digital-Perfect") || settings.company_name || "Digital-Perfect";
  const introCtaText = getSetting("home_intro_cta_text", "Jetzt starten").trim() || "Jetzt starten";
  const introCtaLink = getSetting("home_intro_cta_link", "#kontakt").trim() || "#kontakt";
  const quickWins = getJsonSetting<IntroQuickWin[]>("home_intro_quick_wins", defaultIntroQuickWins)
    .filter((item) => item?.title?.trim() && item?.text?.trim())
    .map((item) => ({
      ...item,
      icon: introIconMap[item.icon || "layers"] || Layers3,
    }));

  return (
    <section className="bg-background py-24 sm:py-32 relative overflow-hidden" aria-label="Intro">
      <div className="section-container relative z-10">
        <div className="grid gap-8 xl:grid-cols-[1fr_1fr] xl:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="rounded-[2.5rem] bg-slate-950 p-10 md:p-14 relative overflow-hidden shadow-2xl"
          >
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-[radial-gradient(circle_at_center,hsl(var(--primary))_0%,transparent_60%)] opacity-20 blur-[80px] pointer-events-none" />

            <div className="relative z-10">
              <p className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-slate-300 backdrop-blur-md mb-6">
                {introBadge}
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-[1.1] tracking-tight mb-8">
                {getSetting("home_intro_title", "Wir machen aus deiner Webseite einen Vertriebskanal.")}
              </h2>

              {introBody ? (
                <div
                  className="max-w-2xl text-base leading-8 text-slate-300 [&_p]:mb-4 [&_strong]:text-white"
                  dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(introBody) }}
                />
              ) : null}

              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <button onClick={() => navigateToTarget(introCtaLink)} className="btn-primary !px-8 !py-4 shadow-[0_0_40px_-10px_rgba(var(--primary),0.4)]">
                  {introCtaText}
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid gap-6"
          >
            {quickWins.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="group relative rounded-[2rem] border border-border bg-card p-8 shadow-sm transition-all duration-500 hover:shadow-xl overflow-hidden flex gap-6 items-start">
                  <div className="absolute -right-12 -top-12 w-32 h-32 bg-[radial-gradient(circle_at_center,hsl(var(--primary))_0%,transparent_70%)] opacity-0 group-hover:opacity-[0.08] transition-opacity duration-500 blur-2xl pointer-events-none" />

                  <div className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform duration-500 group-hover:scale-110">
                    <Icon size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">{item.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{item.text}</p>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default IntroSection;
