import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const ShopSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { getSetting } = useSiteSettings();

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  return (
    <section id="shop" className="py-24 md:py-32 bg-background" ref={ref}>
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mb-14"
        >
          <p className="section-label">{getSetting("home_shop_kicker")}</p>
          <h2 className="section-title">{getSetting("home_shop_title")}</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {getSetting("home_shop_description")}
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 max-w-5xl gap-6">
          {products.map((product, index) => (
            <motion.article
              key={product.id}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="glass-card overflow-hidden"
            >
              <div className="aspect-[4/3] bg-muted overflow-hidden">
                <img
                  src={product.image_url || ""}
                  alt={product.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{product.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">{product.description}</p>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-2xl font-extrabold text-foreground">
                    €{Number(product.price).toFixed(2).replace(".", ",")}
                  </span>
                  <button className="btn-outline !px-5 !py-2.5">Mehr erfahren</button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShopSection;
