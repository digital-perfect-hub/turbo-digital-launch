import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Monitor,
  ShoppingCart,
  Search,
  MapPin,
  Bot,
  Wrench,
  BarChart,
  Repeat,
  ArrowUpRight,
  Globe,
  Megaphone,
  Star,
  Shield,
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
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { getSetting } = useSiteSettings();

  const { data: services = [] } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase.from("services").select("*").eq("is_visible", true).order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  return (
    <section id="services" className="py-24 md:py-32 bg-background" ref={ref}>
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mb-14"
        >
          <p className="section-label">{getSetting("home_services_kicker")}</p>
          <h2 className="section-title">{getSetting("home_services_title")}</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {getSetting("home_services_description")}
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {services.map((service, index) => {
            const Icon = iconMap[service.icon_name] || Globe;
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="glass-card p-6 group relative overflow-hidden"
              >
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight size={16} className="text-primary" />
                </div>
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                  <Icon className="text-primary" size={22} />
                </div>
                <h3 className="text-lg font-bold mb-3">{service.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-10">
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
