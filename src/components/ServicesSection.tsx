import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Monitor, ShoppingCart, Search, MapPin, Bot, Wrench, BarChart, Repeat, ArrowUpRight, Globe, Megaphone, Star, Shield } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const iconMap: Record<string, any> = { Monitor, ShoppingCart, Search, MapPin, Bot, Wrench, BarChart, Repeat, Globe, Megaphone, Star, Shield, BarChart3: BarChart };

const ServicesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const { data: services = [] } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase.from("services").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  return (
    <section id="services" className="py-24 md:py-36" ref={ref}>
      <div className="section-container">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} className="text-center mb-16">
          <p className="section-label">Unsere Leistungen</p>
          <h2 className="section-title">
            Webdesign, das für dich arbeitet.{" "}
            <span className="gradient-gold-text">Rund um die Uhr.</span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map((s, i) => {
            const Icon = iconMap[s.icon_name] || Globe;
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="glass-card p-6 group hover:border-primary/40 transition-all duration-300 cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight size={16} className="text-primary" />
                </div>
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                  <Icon className="text-primary" size={20} />
                </div>
                <h3 className="font-bold text-sm mb-2">{s.title}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">{s.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
