import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ShoppingCart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const ShopSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  return (
    <section id="shop" className="py-24 md:py-36" ref={ref}>
      <div className="section-container">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} className="text-center mb-16">
          <p className="section-label">Margen-Booster & Upsell</p>
          <h2 className="section-title">
            Dein Schlüssel zu mehr <span className="gradient-gold-text">Vertrauen & Anfragen</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base">
            NFC- & QR-Bewertungsständer – ein einziger Tap oder Scan für 5-10x mehr Bewertungen.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 max-w-3xl mx-auto gap-6">
          {products.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass-card overflow-hidden group hover:border-primary/40 transition-all duration-300"
            >
              <div className="relative h-64 overflow-hidden bg-muted">
                <img src={p.image_url || ""} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
              </div>
              <div className="p-6">
                <h3 className="font-bold text-lg mb-1">{p.title}</h3>
                <p className="text-muted-foreground text-sm mb-4">{p.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-extrabold text-primary">€{Number(p.price).toFixed(2).replace('.', ',')}</span>
                  <button className="btn-primary !px-5 !py-2.5 !text-sm">
                    <ShoppingCart size={16} />
                    In den Warenkorb
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShopSection;
