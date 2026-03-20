import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart,
  Bot,
  Globe,
  MapPin,
  Megaphone,
  Monitor,
  Repeat,
  Search,
  Shield,
  ShoppingCart,
  Star,
  Wrench,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { defaultSiteText, useSiteSettings } from "@/hooks/useSiteSettings";

type ServiceItem = {
  id: string;
  icon_name: string | null;
  title: string | null;
  description: string | null;
};

const iconMap: Record<string, any> = {
  Monitor,
  ShoppingCart,
  Search,
  MapPin,
  Bot,
  Wrench,
  BarChart,
  Repeat,
  Globe,
  Megaphone,
  Star,
  Shield,
  BarChart3: BarChart,
};

const fallbackServices: ServiceItem[] = [
  {
    id: "fallback-webdesign",
    icon_name: "Monitor",
    title: "Webdesign mit klarer Conversion-Struktur",
    description:
      "Saubere Layouts, verständliche Nutzerführung und ein Premium-Look, der Vertrauen aufbaut statt nur Fläche zu füllen.",
  },
  {
    id: "fallback-shop",
    icon_name: "ShoppingCart",
    title: "Onlineshops, die wirklich verkaufen",
    description:
      "Shop-Strukturen mit starker Produktlogik, schnellen Wegen zum Kauf und einer Basis, die langfristig mitwachsen kann.",
  },
  {
    id: "fallback-seo",
    icon_name: "Search",
    title: "Technisches SEO für echte Sichtbarkeit",
    description:
      "Indexierung, Struktur, interne Verlinkung und Performance werden sauber aufgesetzt, damit Google versteht, wofür deine Website steht.",
  },
  {
    id: "fallback-support",
    icon_name: "Shield",
    title: "Persönliche Betreuung statt Agentur-Chaos",
    description:
      "Direkte Kommunikation, klare nächste Schritte und Lösungen, die nicht im PM-Loop verschwinden.",
  },
];

const ServicesSection = () => {
  const { getSetting } = useSiteSettings();

  const { data: services = [], isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: async (): Promise<ServiceItem[]> => {
      const { data, error } = await supabase
        .from("services")
        .select("id, icon_name, title, description")
        .eq("is_visible", true)
        .order("sort_order");
      if (error) throw error;
      return (data as ServiceItem[]) ?? [];
    },
  });

  const safeText = (value: string | null | undefined, fallback: string) => (value?.trim() ? value : fallback);
  const effectiveServices = services.length > 0 ? services : fallbackServices;

  return (
    <section id="services" className="bg-background py-24 sm:py-28 md:py-32" aria-label="Leistungen">
      <div className="section-container">
        <div className="mb-14 grid gap-6 xl:grid-cols-[1.1fr_0.9fr] xl:items-end">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <p className="section-label">{getSetting("home_services_kicker", defaultSiteText.home_services_kicker)}</p>
            <h2 className="section-title">{getSetting("home_services_title", defaultSiteText.home_services_title)}</h2>
            <p className="text-lg leading-relaxed text-slate-600">
              {getSetting("home_services_description", defaultSiteText.home_services_description)}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="premium-card p-6 md:p-7"
          >
            <div className="relative z-10">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Leistungsfokus</p>
              <p className="mt-3 text-base leading-relaxed text-slate-700">
                Von der Positionierung über Design bis zur Sichtbarkeit bauen wir keine hübsche Hülle, sondern eine Website,
                die Vertrauen, Klicktiefe und Anfragen systematisch verstärkt.
              </p>
              <button
                onClick={() => document.querySelector("#kontakt")?.scrollIntoView({ behavior: "smooth" })}
                className="btn-outline mt-5 !px-5 !py-3 !text-sm"
              >
                Projekt besprechen
                <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {effectiveServices.map((service, index) => {
            const Icon = iconMap[service.icon_name || ""] || Globe;
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className={`premium-grid-card ${isLoading ? "premium-skeleton" : ""}`}
              >
                <div className="relative z-10">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-[1.25rem] border border-gold/30 bg-gold/10 text-gold-dark shadow-[0_18px_40px_-28px_rgba(255,75,44,0.66)]">
                      <Icon size={24} />
                    </div>
                    <span className="premium-pill">{String(index + 1).padStart(2, "0")}</span>
                  </div>

                  <h3 className="text-xl font-bold leading-tight text-slate-900">
                    {safeText(service.title, fallbackServices[index]?.title ?? "Leistung")}
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-slate-600">
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
