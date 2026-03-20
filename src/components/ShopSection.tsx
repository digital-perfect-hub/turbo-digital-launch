import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { buildRenderImageUrl } from "@/lib/image";

type ProductItem = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  price: number;
};

const fallbackProducts: ProductItem[] = [
  {
    id: "fallback-1",
    title: "Google Bewertungsständer NFC + QR",
    description: "Mehr lokale Bewertungen mit einem Scan oder Tap – perfekt für Restaurants, Studios und Dienstleister.",
    image_url: null,
    price: 89,
  },
  {
    id: "fallback-2",
    title: "Premium Tischaufsteller für Vertrauensaufbau",
    description: "Saubere Markenwirkung am Point of Sale und direkter Weg zu mehr Social Proof für dein Unternehmen.",
    image_url: null,
    price: 119,
  },
];

const ShopSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { getSetting } = useSiteSettings();

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async (): Promise<ProductItem[]> => {
      const { data, error } = await supabase
        .from("products")
        .select("id, title, description, image_url, price")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data as ProductItem[]) ?? [];
    },
  });

  const effectiveProducts = products.length > 0 ? products : fallbackProducts;

  return (
    <section id="shop" className="bg-background py-24 md:py-32" ref={ref}>
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-14 max-w-4xl"
        >
          <p className="section-label">{getSetting("home_shop_kicker")}</p>
          <h2 className="section-title">{getSetting("home_shop_title")}</h2>
          <p className="text-lg leading-relaxed text-slate-600">{getSetting("home_shop_description")}</p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 xl:max-w-5xl">
          {effectiveProducts.map((product, index) => (
            <motion.article
              key={product.id}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="premium-card overflow-hidden"
            >
              <div className="relative h-[250px] overflow-hidden border-b border-slate-200/70 bg-[radial-gradient(circle_at_top_left,rgba(255,75,44,0.15),transparent_26%),linear-gradient(180deg,#ffffff,#f8fafc)]">
                {product.image_url ? (
                  <img
                    src={buildRenderImageUrl(product.image_url, { width: 1200, quality: 84 })}
                    alt={product.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full items-end justify-between gap-4 p-6">
                    <div>
                      <div className="premium-pill">Local SEO Booster</div>
                      <p className="mt-4 max-w-xs text-lg font-bold leading-tight text-slate-900">Mehr Vertrauen und mehr Bewertungen direkt am Kontaktpunkt.</p>
                    </div>
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-slate-950 text-white shadow-[0_26px_50px_-30px_rgba(15,23,42,0.55)]">
                      <Star size={28} />
                    </div>
                  </div>
                )}
              </div>

              <div className="relative z-10 p-6">
                <h3 className="text-xl font-bold text-slate-900">{product.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{product.description}</p>
                <div className="mt-6 flex items-center justify-between gap-4">
                  <span className="text-2xl font-extrabold text-slate-900">€{Number(product.price).toFixed(2).replace(".", ",")}</span>
                  <button className="btn-outline !px-5 !py-3 !text-sm">
                    Mehr erfahren
                    <ArrowRight size={16} />
                  </button>
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
