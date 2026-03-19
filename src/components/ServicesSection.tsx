import { motion } from "framer-motion";
import {
  ArrowUpRight,
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
import { useSiteSettings } from "@/hooks/useSiteSettings";

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

const ServicesSection = () => {
  const { getSetting } = useSiteSettings();

  const { data: services = [] } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("is_visible", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  return (
    <section id="services" className="bg-background py-24 sm:py-28 md:py-36" aria-label="Leistungen">
      <div className="section-container">
        <div className="grid gap-12 xl:grid-cols-[0.92fr_1.08fr] xl:items-end">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <p className="section-label">{getSetting("home_services_kicker")}</p>
            <h2 className="section-title max-w-4xl">{getSetting("home_services_title")}</h2>
            <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
              {getSetting("home_services_description")}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="premium-card p-6 sm:p-8"
          >
            <div className="relative z-10 grid gap-6 sm:grid-cols-3">
              {[
                { value: `${services.length}+`, label: "Leistungsbausteine" },
                { value: "100%", label: "Premium Light Design-System" },
                { value: "AT / DE", label: "Fokus auf klare Sichtbarkeit" },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-2xl font-extrabold tracking-[-0.04em] text-[hsl(var(--midnight))]">{item.value}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {services.map((service, index) => {
            const Icon = iconMap[service.icon_name] || Globe;
            const orderLabel = String(index + 1).padStart(2, "0");

            return (
              <motion.article
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="group premium-card-interactive min-h-[22rem] p-6 sm:p-7"
                style={{ willChange: "transform, opacity" }}
              >
                <div className="relative z-10 flex h-full flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-[1.35rem] border border-primary/20 bg-[linear-gradient(180deg,rgba(251,191,36,0.18),rgba(255,255,255,0.95))] shadow-[0_18px_40px_-28px_rgba(251,191,36,0.9)]">
                      <Icon className="text-[hsl(var(--midnight))]" size={24} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        {orderLabel}
                      </span>
                      <div className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary transition-all duration-300 group-hover:scale-105">
                        <ArrowUpRight size={16} />
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex-1">
                    <h3 className="text-2xl font-extrabold tracking-[-0.04em] text-[hsl(var(--midnight))]">
                      {service.title}
                    </h3>
                    <div className="mt-4 h-px w-20 gold-divider" />
                    <p className="mt-5 text-sm leading-7 text-muted-foreground sm:text-[0.95rem]">
                      {service.description}
                    </p>
                  </div>

                  <div className="mt-8 flex items-center justify-between gap-4">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                      Klar. Elegant. Skalierbar.
                    </span>
                    <span className="text-sm font-semibold text-[hsl(var(--midnight))]">Mehr erfahren</span>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>

        <div className="mt-12 flex justify-start">
          <button
            onClick={() => document.querySelector("#kontakt")?.scrollIntoView({ behavior: "smooth" })}
            className="btn-outline"
          >
            Zum Kontaktformular
          </button>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
