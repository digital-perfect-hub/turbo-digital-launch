import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ExternalLink } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const PortfolioSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { getSetting } = useSiteSettings();

  const { data: portfolioItems = [] } = useQuery({
    queryKey: ["portfolio_items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portfolio_items")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  return (
    <section id="portfolio" className="py-24 md:py-32 bg-surface" ref={ref}>
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mb-14"
        >
          <p className="section-label">{getSetting("home_portfolio_kicker")}</p>
          <h2 className="section-title">{getSetting("home_portfolio_title")}</h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {portfolioItems.map((item, index) => (
            <motion.a
              key={item.id}
              href={item.url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.06 }}
              className="glass-card overflow-hidden group"
            >
              <div className="relative h-60 overflow-hidden bg-muted">
                <img
                  src={item.image_url || ""}
                  alt={`Referenz ${item.title}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-card/10 to-transparent" />
                <div className="absolute top-4 right-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-card/90 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  <ExternalLink size={16} />
                </div>
              </div>
              <div className="p-6">
                <div className="flex gap-2 mb-4 flex-wrap">
                  {(item.tags || []).map((tag: string) => (
                    <span key={tag} className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary uppercase tracking-wide">
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{item.description}</p>
                <span className="text-sm font-semibold text-primary">🌐 Webseite besuchen</span>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PortfolioSection;
