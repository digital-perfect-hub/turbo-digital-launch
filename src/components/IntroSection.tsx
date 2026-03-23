import { motion } from "framer-motion";
import { ArrowRight, Layers3, SearchCheck, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { useGlobalTheme } from "@/hooks/useGlobalTheme";
import { defaultIntroQuickWins, defaultSiteText, type IntroQuickWin, useSiteSettings } from "@/hooks/useSiteSettings";
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

const normalizeQuickWins = (wins: IntroQuickWin[]) =>
  wins
    .filter((item) => item?.title?.trim() && item?.text?.trim())
    .map((item) => ({
      ...item,
      icon: item.icon && introIconMap[item.icon] ? item.icon : "layers",
    }));

const IntroSection = () => {
  const { getSetting, getJsonSetting } = useSiteSettings();
  const { settings } = useGlobalTheme();

  const introBadge =
    getSetting("home_intro_badge", settings.company_name || defaultSiteText.home_intro_badge).trim() ||
    settings.company_name ||
    defaultSiteText.home_intro_badge;

  const introTitle = getSetting("home_intro_title", defaultSiteText.home_intro_title).trim() || defaultSiteText.home_intro_title;
  const introBody = getSetting("home_intro_body", defaultSiteText.home_intro_body).trim();
  const introCtaText =
    getSetting("home_intro_cta_text", defaultSiteText.home_intro_cta_text).trim() || defaultSiteText.home_intro_cta_text;
  const introCtaLink =
    getSetting("home_intro_cta_link", defaultSiteText.home_intro_cta_link).trim() || defaultSiteText.home_intro_cta_link;

  const quickWins = normalizeQuickWins(
    getJsonSetting<IntroQuickWin[]>("home_intro_quick_wins", defaultIntroQuickWins)?.length
      ? getJsonSetting<IntroQuickWin[]>("home_intro_quick_wins", defaultIntroQuickWins)
      : defaultIntroQuickWins,
  );

  return (
    <section className="relative overflow-hidden bg-background py-24 sm:py-32" aria-label="Intro">
      <div className="section-container relative z-10">
        <div className="grid items-center gap-8 xl:grid-cols-[1fr_1fr] xl:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="dark-panel-shell relative overflow-hidden rounded-[2.5rem] p-10 md:p-14"
          >
            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 bg-[radial-gradient(circle_at_center,hsl(var(--primary))_0%,transparent_60%)] opacity-20 blur-[80px]" />

            <div className="relative z-10">
              <p className="dark-panel-kicker mb-6 inline-flex rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] backdrop-blur-md">
                {introBadge}
              </p>

              <h2 className="dark-panel-title mb-8 text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-4xl md:text-5xl">
                {introTitle}
              </h2>

              {introBody ? (
                <div
                  className="dark-panel-body max-w-2xl text-base leading-8 [&_p]:mb-4 [&_strong]:font-semibold"
                  dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(introBody) }}
                />
              ) : null}

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <button
                  onClick={() => navigateToTarget(introCtaLink)}
                  className="btn-primary !px-8 !py-4 shadow-[0_0_40px_-10px_rgba(var(--primary),0.4)]"
                >
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
              const Icon = introIconMap[item.icon || "layers"] || Layers3;

              return (
                <div
                  key={item.title}
                  className="group relative flex items-start gap-6 overflow-hidden rounded-[2rem] border border-border bg-card p-8 shadow-sm transition-all duration-500 hover:shadow-xl"
                >
                  <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 bg-[radial-gradient(circle_at_center,hsl(var(--primary))_0%,transparent_70%)] opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-[0.08]" />

                  <div className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform duration-500 group-hover:scale-110">
                    <Icon size={24} />
                  </div>

                  <div>
                    <h3 className="mb-2 text-xl font-bold text-foreground">{item.title}</h3>
                    <p className="leading-relaxed text-muted-foreground">{item.text}</p>
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
