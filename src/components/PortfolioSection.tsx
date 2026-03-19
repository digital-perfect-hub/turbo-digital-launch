import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { buildRenderImageUrl } from "@/lib/image";

type PortfolioItem = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  is_visible: boolean | null;
  sort_order: number | null;
  tags: string[] | null;
  url: string | null;
};

type PortfolioCardProps = {
  item: PortfolioItem;
  index: number;
};

const PortfolioCard = ({ item, index }: PortfolioCardProps) => {
  const cardImage = item.image_url
    ? buildRenderImageUrl(item.image_url, { width: 1280, quality: 84 })
    : "";
  const tags = Array.isArray(item.tags) ? item.tags.filter(Boolean).slice(0, 3) : [];

  const content = (
    <div className="relative z-10 flex h-full flex-col">
      <div className="relative overflow-hidden border-b border-border/70 bg-muted/40">
        <div className="absolute inset-x-6 top-5 z-20 flex items-center justify-between gap-4">
          <div className="rounded-full border border-primary/20 bg-card/90 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-primary backdrop-blur-xl">
            Projekt
          </div>
          {item.url ? (
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-primary/20 bg-card/90 text-[hsl(var(--midnight))] opacity-0 transition-all duration-300 group-hover:opacity-100 backdrop-blur-xl">
              <ExternalLink size={17} />
            </div>
          ) : null}
        </div>

        <div className="aspect-[16/10] overflow-hidden">
          {cardImage ? (
            <img
              src={cardImage}
              alt={`Referenz ${item.title}`}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,rgba(251,191,36,0.18),rgba(255,255,255,0.92),rgba(15,23,42,0.08))] p-8 text-center">
              <span className="text-lg font-bold tracking-tight text-[hsl(var(--midnight))]">{item.title}</span>
            </div>
          )}
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(15,23,42,0.08)] via-transparent to-transparent" />
      </div>

      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[hsl(var(--midnight))]"
            >
              {tag}
            </span>
          ))}
        </div>

        <h3 className="mt-5 text-2xl font-extrabold tracking-[-0.04em] text-[hsl(var(--midnight))]">
          {item.title}
        </h3>
        <div className="mt-4 h-px w-24 gold-divider" />
        <p className="mt-5 flex-1 text-sm leading-7 text-muted-foreground sm:text-[0.95rem]">
          {item.description}
        </p>

        <div className="mt-8 flex items-center justify-between gap-4">
          <span className="text-sm font-semibold text-[hsl(var(--midnight))]">
            {item.url ? "Webseite besuchen" : "Projekt ansehen"}
          </span>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Premium Case
          </span>
        </div>
      </div>
    </div>
  );

  const animationProps = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-50px" },
    transition: { duration: 0.45, delay: index * 0.05 },
    className:
      "group premium-card-interactive overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary/40",
    style: { willChange: "transform, opacity" as const },
  };

  if (item.url) {
    return (
      <motion.a
        key={item.id}
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        {...animationProps}
      >
        {content}
      </motion.a>
    );
  }

  return (
    <motion.article key={item.id} {...animationProps}>
      {content}
    </motion.article>
  );
};

const PortfolioSection = () => {
  const { getSetting } = useSiteSettings();

  const { data: portfolioItems = [] } = useQuery({
    queryKey: ["portfolio_items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portfolio_items")
        .select("*")
        .eq("is_visible", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data || []) as PortfolioItem[];
    },
  });

  return (
    <section id="portfolio" className="bg-surface py-24 sm:py-28 md:py-36" aria-label="Portfolio">
      <div className="section-container">
        <div className="grid gap-12 xl:grid-cols-[0.88fr_1.12fr] xl:items-end">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.55 }}
            className="max-w-4xl"
          >
            <p className="section-label">{getSetting("home_portfolio_kicker")}</p>
            <h2 className="section-title max-w-5xl">{getSetting("home_portfolio_title")}</h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="premium-card p-6 sm:p-8"
          >
            <div className="relative z-10 grid gap-6 sm:grid-cols-3">
              {[
                { value: `${portfolioItems.length}+`, label: "sichtbare Referenzen" },
                { value: "Render API", label: "optimierte Bildausgabe" },
                { value: "Light UI", label: "ruhige Premium-Präsentation" },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-2xl font-extrabold tracking-[-0.04em] text-[hsl(var(--midnight))]">{item.value}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {portfolioItems.map((item, index) => (
            <PortfolioCard key={item.id} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PortfolioSection;
