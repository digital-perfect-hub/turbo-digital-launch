import { motion } from "framer-motion";
import { ArrowRight, Eye, ShoppingBag } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { buildRenderImageUrl } from "@/lib/image";

type ProductItem = Database["public"]["Tables"]["products"]["Row"];

const fallbackProducts: ProductItem[] = [
  {
    id: "fallback-1",
    title: "Premium Website Audit",
    description: "Tiefgehende Analyse deiner aktuellen Website inklusive Conversion-Schwächen und technischer SEO-Fehler.",
    image_url: null,
    price: 299,
    is_visible: true,
    sort_order: 0,
    created_at: new Date(0).toISOString(),
    updated_at: new Date(0).toISOString(),
  },
  {
    id: "fallback-2",
    title: "NFC Google Bewertungsaufsteller",
    description: "Hochwertiger Acryl-Aufsteller für deinen Point of Sale. Kunden tappen einfach mit dem Handy und bewerten dich.",
    image_url: null,
    price: 89,
    is_visible: true,
    sort_order: 1,
    created_at: new Date(0).toISOString(),
    updated_at: new Date(0).toISOString(),
  },
];

const ShopSection = () => {
  const { getSetting } = useSiteSettings();

  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_visible", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as ProductItem[];
    },
  });

  const effectiveProducts = products?.length ? products : fallbackProducts;

  if (!isLoading && effectiveProducts.length === 0) return null;

  return (
    <section id="shop" className="bg-background py-24 sm:py-32 relative overflow-hidden" aria-label="Produkte & Pakete">
      <div className="section-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="mb-16 md:mb-24 text-center max-w-3xl mx-auto"
        >
          <p className="section-label">{getSetting("home_shop_kicker", "Pakete & Produkte")}</p>
          <h2 className="section-title mt-4">{getSetting("home_shop_title", "Klare Lösungen. Fixe Preise.")}</h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            Zubuchbare Leistungen und Produkte, die deinen Umsatz direkt hebeln. Transparent, messbar und auf Performance getrimmt.
          </p>
        </motion.div>

        <div className="grid gap-8 lg:gap-10 md:grid-cols-2 lg:grid-cols-3">
          {effectiveProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`group relative flex flex-col overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm hover:shadow-xl transition-all duration-500 ${isLoading ? "animate-pulse" : ""}`}
            >
              {/* Dynamischer Background Glow */}
              <div className="absolute -top-32 -left-32 w-64 h-64 bg-[radial-gradient(circle_at_center,hsl(var(--primary))_0%,transparent_70%)] opacity-0 group-hover:opacity-[0.06] transition-opacity duration-500 blur-3xl pointer-events-none" />

              {/* Bild-Bereich */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100/50">
                {product.image_url ? (
                  <img
                    src={buildRenderImageUrl(product.image_url, { width: 600, quality: 85 })}
                    alt={product.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
                    <ShoppingBag size={48} className="text-slate-300" strokeWidth={1} />
                  </div>
                )}
                <div className="absolute top-5 right-5 inline-flex items-center gap-1.5 rounded-full bg-background/90 backdrop-blur-md px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-foreground shadow-sm">
                  <Eye size={14} className="text-primary" /> Shop
                </div>
              </div>

              {/* Content-Bereich */}
              <div className="flex flex-1 flex-col p-8">
                <h3 className="text-2xl font-bold text-foreground leading-tight mb-3">{product.title}</h3>
                <p className="text-muted-foreground leading-relaxed flex-1">
                  {product.description || "Detailbeschreibung folgt."}
                </p>

                <div className="mt-8 pt-6 border-t border-border flex items-center justify-between gap-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Preis</span>
                    <span className="text-3xl font-black text-foreground tracking-tight">
                      €{Number(product.price).toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                  <button className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform duration-300 hover:bg-primary hover:text-white hover:scale-105">
                    <ArrowRight size={24} />
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