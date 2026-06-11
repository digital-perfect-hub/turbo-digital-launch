import { motion } from "framer-motion";
import { ArrowUpRight, LayoutTemplate, ShieldCheck, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { defaultSiteText, useSiteSettings } from "@/hooks/useSiteSettings";
import { buildRawImageUrl } from "@/lib/image";
import { useSiteContext } from "@/context/SiteContext";
import { DEFAULT_SITE_ID } from "@/lib/site";
import {
  resolveHomepageSectionPatternClassFromSettings,
  resolveHomepageSectionStyleVarsFromSettings,
} from "@/lib/homepage-section-styles";

type PortfolioItem = Database["public"]["Tables"]["portfolio_items"]["Row"];

type RenderImageOptions = {
  width: number;
  quality: number;
};

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

const toSupabaseRenderUrl = (
  storagePath: string | null | undefined,
  options: RenderImageOptions,
) => {
  const rawUrl = buildRawImageUrl(storagePath);
  if (!rawUrl) return "";

  try {
    const isRelative = rawUrl.startsWith("/");
    const url = new URL(rawUrl, "https://digital-perfect.local");

    if (!url.pathname.includes("/storage/v1/object/public/")) {
      return rawUrl;
    }

    url.pathname = url.pathname.replace(
      "/storage/v1/object/public/",
      "/storage/v1/render/image/public/",
    );
    url.searchParams.set("width", String(options.width));
    url.searchParams.set("quality", String(options.quality));

    return isRelative ? `${url.pathname}${url.search}` : url.toString();
  } catch {
    return rawUrl;
  }
};

const getGridClassName = (count: number) => {
  if (count <= 1) return "mx-auto grid w-full max-w-[620px] gap-6";
  if (count === 2) return "mx-auto grid max-w-6xl gap-6 md:grid-cols-2";
  return "grid gap-6 md:grid-cols-2 xl:grid-cols-3";
};

const PortfolioSection = () => {
  const { getSetting, settings } = useSiteSettings();
  const sectionStyleVars = resolveHomepageSectionStyleVarsFromSettings(settings, "portfolio");
  const sectionPatternClass = resolveHomepageSectionPatternClassFromSettings(settings, "portfolio");
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
    <section
      id="portfolio"
      className={`homepage-style-scope surface-section-shell ${sectionPatternClass} relative py-24 sm:py-28 md:py-32`}
      aria-label="Portfolio"
      style={sectionStyleVars}
    >
      <div className="section-container relative z-10">
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

        <div className={getGridClassName(effectiveItems.length)}>
          {effectiveItems.map((item, index) => {
            const hasImage = Boolean(item.image_url);
            const imageSrc = hasImage
              ? toSupabaseRenderUrl(item.image_url, { width: 800, quality: 80 })
              : "";

            return (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className={`group relative flex h-full flex-col overflow-hidden rounded-[2rem] border transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_42px_120px_-58px_rgba(14,31,83,0.28)] ${
                  isLoading ? "premium-skeleton" : ""
                }`}
                style={{
                  borderColor: "color-mix(in srgb, var(--surface-card-border) 62%, var(--theme-secondary-hex) 38%)",
                  background:
                    "linear-gradient(180deg, var(--surface-card) 0%, color-mix(in srgb, var(--surface-card) 88%, var(--theme-secondary-hex) 7%) 100%)",
                  boxShadow: "0 34px 96px -58px rgba(14,31,83,0.26)",
                }}
              >
                <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,transparent,color-mix(in_srgb,var(--theme-secondary-hex)_34%,transparent),transparent)] opacity-90" />

                {hasImage ? (
                  <div
                    className="relative aspect-[16/10] overflow-hidden border-b"
                    style={{
                      borderColor: "var(--surface-card-border)",
                      background: "color-mix(in srgb, var(--surface-section) 82%, transparent)",
                    }}
                  >
                    <img
                      src={imageSrc}
                      alt={item.title || "Projekt"}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.025]"
                      loading="lazy"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(15,23,42,0.08)_100%)]" />
                  </div>
                ) : (
                  <div
                    className="grid gap-3 border-b p-5 sm:grid-cols-3"
                    style={{
                      borderColor: "var(--surface-card-border)",
                      background:
                        "linear-gradient(135deg, color-mix(in srgb, var(--surface-card) 94%, white 6%) 0%, color-mix(in srgb, var(--surface-card) 86%, var(--theme-secondary-hex) 6%) 100%)",
                    }}
                  >
                    {placeholderTiles.map((tile) => {
                      const Icon = tile.icon;
                      return (
                        <div
                          key={tile.title}
                          className="rounded-[1.3rem] border p-4 shadow-[0_20px_40px_-32px_rgba(15,23,42,0.22)]"
                          style={{
                            borderColor: "var(--surface-card-border)",
                            background: "color-mix(in srgb, var(--surface-card) 92%, white 8%)",
                          }}
                        >
                          <div
                            className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl"
                            style={{
                              background: "color-mix(in srgb, var(--theme-secondary-hex) 90%, white 10%)",
                              color: "hsl(var(--secondary-foreground))",
                            }}
                          >
                            <Icon size={18} />
                          </div>
                          <p className="text-sm font-bold text-[var(--surface-card-text)]">{tile.title}</p>
                          <p className="mt-2 text-xs leading-relaxed text-[var(--surface-card-muted)]">{tile.text}</p>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex flex-1 flex-col p-6 md:p-7">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <span className="premium-pill">Case {String(index + 1).padStart(2, "0")}</span>
                    {item.url ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-300 hover:-translate-y-0.5 hover:text-primary"
                        style={{
                          borderColor: "var(--surface-card-border)",
                          background: "color-mix(in srgb, var(--surface-card) 92%, white 8%)",
                          color: "var(--surface-card-text)",
                        }}
                        aria-label={`Projekt ${item.title || "öffnen"}`}
                      >
                        <ArrowUpRight size={16} />
                      </a>
                    ) : null}
                  </div>

                  <h3 className="text-2xl font-bold leading-tight tracking-[-0.03em] text-[var(--surface-card-text)]">
                    {item.title}
                  </h3>
                  <p className="mt-4 flex-1 text-sm leading-7 text-[var(--surface-card-muted)] md:text-[0.98rem]">
                    {item.description || "Beschreibung folgt."}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-2.5">
                    {(item.tags && item.tags.length > 0 ? item.tags : ["Premium UI", "SEO", "Performance"]).map((tag) => (
                      <span key={tag} className="premium-pill">
                        {tag}
                      </span>
                    ))}
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
