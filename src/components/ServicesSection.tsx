import { motion } from "framer-motion";
import { ArrowRight, Monitor } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { defaultSiteText, useSiteSettings } from "@/hooks/useSiteSettings";
import { useSiteContext } from "@/context/SiteContext";
import { DEFAULT_SITE_ID } from "@/lib/site";
import { resolveHomepageSectionStyleVarsFromSettings } from "@/lib/homepage-section-styles";
import { getLucideIcon } from "@/lib/lucide-icon-registry";

type ServiceItem = {
  id: string;
  icon_name: string | null;
  title: string | null;
  description: string | null;
};

const fallbackServices: ServiceItem[] = [
  {
    id: "fallback-webdesign",
    icon_name: "Monitor",
    title: "Webdesign mit klarer Conversion-Struktur",
    description: "Saubere Layouts, verständliche Nutzerführung und ein Premium-Look, der Vertrauen aufbaut statt nur Fläche zu füllen.",
  },
  {
    id: "fallback-seo",
    icon_name: "Search",
    title: "Sichtbarkeit & Suchmaschinen-Optimierung",
    description: "Technische Sauberkeit und strategischer Content, damit deine Seite nicht nur existiert, sondern aktiv gefunden wird.",
  },
  {
    id: "fallback-shop",
    icon_name: "ShoppingCart",
    title: "E-Commerce & digitale Verkaufswege",
    description: "Onlineshops, die schnelle Ladezeiten mit psychologisch optimierten Checkouts verbinden.",
  },
];

const safeText = (value: string | null | undefined, fallback: string) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
};

const ServicesSection = () => {
  const { getSetting, settings } = useSiteSettings();
  const sectionStyleVars = resolveHomepageSectionStyleVarsFromSettings(settings, "services");
  const { activeSiteId } = useSiteContext();
  const siteId = activeSiteId || DEFAULT_SITE_ID;

  const { data: services, isLoading } = useQuery({
    queryKey: ["services", siteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("site_id", siteId)
        .eq("is_visible", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as ServiceItem[];
    },
  });

  const effectiveServices = services?.length ? services : fallbackServices;

  return (
    <section id="leistungen" className="homepage-style-scope surface-section-shell py-24 sm:py-32 relative overflow-hidden" aria-label="Unsere Leistungen" style={sectionStyleVars}>
      <div className="section-container relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 md:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <p className="section-label">{getSetting("home_services_kicker", "Expertise")}</p>
            <h2 className="section-title mt-4">
              {getSetting("home_services_title", defaultSiteText.home_services_title)}
            </h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <button
              onClick={() => document.querySelector("#kontakt")?.scrollIntoView({ behavior: "smooth" })}
              className="btn-outline hidden md:inline-flex"
            >
              Projekt anfragen
              <ArrowRight size={18} />
            </button>
          </motion.div>
        </div>

        <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {effectiveServices.map((service, index) => {
            const Icon = getLucideIcon(service.icon_name, Monitor);

            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`group relative h-full rounded-[2.5rem] border border-border bg-card p-8 sm:p-10 shadow-sm transition-all duration-500 hover:shadow-xl overflow-hidden flex flex-col ${isLoading ? "animate-pulse bg-muted" : ""}`}
              >
                <div className="relative z-10 flex-1 flex flex-col">
                  <div className="mb-8 flex items-center justify-between">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3">
                      <Icon size={28} strokeWidth={1.5} />
                    </div>
                    <span className="surface-index-number text-4xl font-extrabold group-hover:text-primary/10 transition-colors duration-500">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold leading-tight text-foreground mb-4">
                    {safeText(service.title, fallbackServices[index]?.title ?? "Leistung")}
                  </h3>
                  <p className="text-base leading-relaxed text-muted-foreground flex-1">
                    {safeText(service.description, fallbackServices[index]?.description ?? "")}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
