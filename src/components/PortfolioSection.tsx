import { motion } from "framer-motion";
import { ArrowUpRight, LayoutTemplate, ShieldCheck, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { defaultSiteText, useSiteSettings } from "@/hooks/useSiteSettings";
import { buildRenderImageUrl } from "@/lib/image";
import { useSiteContext } from "@/context/SiteContext";
import { DEFAULT_SITE_ID } from "@/lib/site";
import { resolveHomepageSectionStyleVarsFromSettings } from "@/lib/homepage-section-styles";

type PortfolioItem = Database["public"]["Tables"]["portfolio_items"]["Row"];

const fallbackPortfolioItems: PortfolioItem[] = [
  {
    id: "fallback-portfolio-1",
    title: "SEO-Landingpage mit klarer Conversion-Hierarchie",
    description:
      "Premium-Light Layout mit lesbaren Headlines, sauberer Informationsarchitektur und einer CTA-Führung, die direkt auf Anfragen ausgerichtet ist.",
    image_url: null,
    url: null,
    tags: ["Landingpage", "SEO", "Conversion"],
    sort_order: 0,
    is_visible: true,
    created_at: new Date(0).toISOString(),
    updated_at: new Date(0).toISOString(),
  },
  {
    id: "fallback-portfolio-2",
    title: "Onlineshop-Struktur für verkaufsstarke Nutzerwege",
    description:
      "Ein robuster Shop-Auftritt mit klarer Produktnavigation, Vertrauenssignalen und einer visuellen Sprache, die auch ohne echte Referenzbilder professionell wirkt.",
    image_url: null,
    url: null,
    tags: ["Shop", "UX", "Performance"],
    sort_order: 1,
    is_visible: true,
    created_at: new Date(0).toISOString(),
    updated_at: new Date(0).toISOString(),
  },
  {
    id: "fallback-portfolio-3",
    title: "Unternehmenswebsite mit technischer SEO-Basis",
    description:
      "Strukturierte Inhaltsblöcke, starke Lesbarkeit und ein stabiles Portfolio-Modul, das nicht zusammenfällt, wenn der Admin noch nichts gepflegt hat.",
    image_url: null,
    url: null,
    tags: ["Unternehmensseite", "Tech SEO", "Premium UI"],
    sort_order: 2,
    is_visible: true,
    created_at: new Date(0).toISOString(),
    updated_at: new Date(0).toISOString(),
  },
];

const placeholderTiles = [
  { title: "Struktur", text: "Klare Inhaltslogik statt Leerraum-Chaos.", icon: LayoutTemplate },
  { title: "Vertrauen", text: "Premium-Look mit ruhiger Informationsführung.", icon: ShieldCheck },
  { title: "Wirkung", text: "Sichtbare Qualität auch ohne echtes Referenzbild.", icon: Sparkles },
];

const PORTFOLIO_SELECT = "id, title, description, image_url, url, tags, sort_order, is_visible, created_at, updated_at";

const PortfolioSection = () => {
  const { getSetting, settings } = useSiteSettings();
  const sectionStyleVars = resolveHomepageSectionStyleVarsFromSettings(settings, "portfolio");
  const { activeSiteId } = useSiteContext();
  const siteId = activeSiteId || DEFAULT_SITE_ID;

  const { data: portfolioItems = [], isLoading } = useQuery({
    queryKey: ["portfolio_items", siteId],
    queryFn: async (): Promise<PortfolioItem[]> => {
      const { data, error } = await supabase
        .from("portfolio_items")
        .select(PORTFOLIO_SELECT)
        .eq("site_id", siteId)
        .eq("is_visible", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data as PortfolioItem[]) ?? [];
    },
  });

  const effectiveItems = portfolioItems.length > 0 ? portfolioItems : fallbackPortfolioItems;

  return (
    <section id="portfolio" className="homepage-style-scope surface-section-shell bg-surface py-24 sm:py-28 md:py-32" aria-label="Portfolio" style={sectionStyleVars}>
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.55 }}
          className="mb-14 max-w-4xl"
        >
          <p className="section-label">{getSetting("home_portfolio_kicker", defaultSiteText.home_portfolio_kicker)}</p>
          <h2 className="section-title">{getSetting("home_portfolio_title", defaultSiteText.home_portfolio_title)}</h2>
        </motion.div>

        <div className="grid gap-5 xl:grid-cols-3">
          {effectiveItems.map((item, index) => {
            const hasImage = Boolean(item.image_url);
            
            // BUGFIX: Wenn die URL schon fertig von Supabase kommt ("http..."), nicht nochmal durch Render-API jagen
            const imageSrc = hasImage ? buildRenderImageUrl(item.image_url, { width: 1200, quality: 84 }) : "";

            return (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className={`premium-card overflow-hidden ${isLoading ? "premium-skeleton" : ""}`}
              >
                <div className="relative z-10">
                  {hasImage ? (
                    <div className="relative h-[250px] overflow-hidden border-b" style={{ borderColor: "var(--surface-card-border)", background: "color-mix(in srgb, var(--surface-section) 78%, transparent)" }}>
                      <img src={imageSrc} alt={item.title || "Projekt"} className="h-full w-full object-cover" loading="lazy" />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_10%,rgba(15,23,42,0.45)_100%)]" />
                    </div>
                  ) : (
                    <div className="grid gap-3 border-b p-5 sm:grid-cols-3" style={{ borderColor: "var(--surface-card-border)", background: "radial-gradient(circle at top left, color-mix(in srgb, var(--button-primary-bg) 18%, transparent) 0%, transparent 26%), linear-gradient(180deg, color-mix(in srgb, var(--surface-card) 94%, white 6%), color-mix(in srgb, var(--surface-section) 90%, transparent))" }}>
                      {placeholderTiles.map((tile) => {
                        const Icon = tile.icon;
                        return (
                          <div key={tile.title} className="rounded-[1.3rem] border p-4 shadow-[0_20px_40px_-32px_rgba(15,23,42,0.22)]" style={{ borderColor: "var(--surface-card-border)", background: "var(--surface-card)" }}>
                            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl" style={{ background: "var(--theme-secondary-hex)", color: "hsl(var(--secondary-foreground))" }}>
                              <Icon size={18} />
                            </div>
                            <p className="text-sm font-bold text-[var(--surface-card-text)]">{tile.title}</p>
                            <p className="mt-2 text-xs leading-relaxed text-[var(--surface-card-muted)]">{tile.text}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="p-6 md:p-7">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <span className="premium-pill">Case {String(index + 1).padStart(2, "0")}</span>
                      {item.url ? (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-300 hover:text-primary"
                          style={{ borderColor: "var(--surface-card-border)", background: "color-mix(in srgb, var(--surface-card) 90%, white)", color: "var(--surface-card-text)" }}
                          aria-label={`Projekt ${item.title || "öffnen"}`}
                        >
                          <ArrowUpRight size={16} />
                        </a>
                      ) : null}
                    </div>

                    <h3 className="text-xl font-bold leading-tight text-[var(--surface-card-text)]">{item.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-[var(--surface-card-muted)]">{item.description || "Beschreibung folgt."}</p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {(item.tags && item.tags.length > 0 ? item.tags : ["Premium UI", "SEO", "Performance"]).map((tag) => (
                        <span key={tag} className="premium-pill">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PortfolioSection;