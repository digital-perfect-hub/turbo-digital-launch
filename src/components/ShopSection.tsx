import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, CheckCircle2, Image as ImageIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Database, Json } from "@/integrations/supabase/types";
import { buildRenderImageUrl } from "@/lib/image";
import { defaultSiteText, useSiteSettings } from "@/hooks/useSiteSettings";
import { Button } from "@/components/ui/button";
import { useSiteContext } from "@/context/SiteContext";
import { DEFAULT_SITE_ID } from "@/lib/site";
import { resolveHomepageSectionStyleVarsFromSettings } from "@/lib/homepage-section-styles";

type ProductItem = Database["public"]["Tables"]["products"]["Row"];

const normalizeFeatures = (value: Json | null | undefined): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/[\n,]/)
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  return [];
};

const ShopSection = () => {
  const { getSetting, settings } = useSiteSettings();
  const sectionStyleVars = resolveHomepageSectionStyleVarsFromSettings(settings, "shop");
  const { activeSiteId } = useSiteContext();
  const siteId = activeSiteId || DEFAULT_SITE_ID;

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", siteId],
    queryFn: async (): Promise<ProductItem[]> => {
      const { data, error } = await supabase
        .from("products")
        .select("id, title, slug, description, long_description, target_audience, demo_url, price, features, image_url, checkout_url, sort_order, is_visible, created_at, updated_at")
        .eq("site_id", siteId)
        .eq("is_visible", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return (data as ProductItem[]) ?? [];
    },
  });

  if (!isLoading && products.length === 0) return null;

  return (
    <section id="shop" className="homepage-style-scope surface-section-shell relative overflow-hidden py-24 sm:py-32" aria-label="Produkte & Pakete" style={sectionStyleVars}>
      <div className="section-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-16 max-w-3xl text-center md:mb-24"
        >
          <p className="section-label">{getSetting("home_shop_kicker", defaultSiteText.home_shop_kicker)}</p>
          <h2 className="section-title mt-4">{getSetting("home_shop_title", defaultSiteText.home_shop_title)}</h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            {getSetting("home_shop_description", defaultSiteText.home_shop_description)}
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:gap-10 xl:grid-cols-3">
          {products.map((product, index) => {
            const features = normalizeFeatures(product.features);
            const productImage = product.image_url
              ? buildRenderImageUrl(product.image_url, { width: 720, quality: 84 })
              : "";

            return (
              <motion.article
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className={`group relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl ${
                  isLoading ? "animate-pulse" : ""
                }`}
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden" style={{ background: "color-mix(in srgb, var(--surface-section) 70%, transparent)" }}>
                  {productImage ? (
                    <img
                      src={productImage}
                      alt={product.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center" style={{ background: "var(--surface-section)" }}>
                      <ImageIcon size={44} className="text-muted-foreground/50" strokeWidth={1.5} />
                    </div>
                  )}

                  <div className="surface-accent-pill absolute left-5 top-5 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] shadow-sm backdrop-blur-md">
                    Produkt
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      {product.slug ? (
                        <Link to={`/produkt/${product.slug}`} className="transition-colors hover:text-primary">
                          <h3 className="text-2xl font-bold leading-tight text-foreground">{product.title}</h3>
                        </Link>
                      ) : (
                        <h3 className="text-2xl font-bold leading-tight text-foreground">{product.title}</h3>
                      )}
                      <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                        {product.description || "Klare Leistung, fixer Preis und direkter Weg zum Checkout."}
                      </p>
                    </div>
                    <div
                      className="shrink-0 rounded-2xl border px-4 py-3 text-right"
                      style={{
                        background: "color-mix(in srgb, var(--button-primary-bg) 10%, var(--surface-card))",
                        borderColor: "color-mix(in srgb, var(--button-primary-bg) 18%, var(--surface-card-border))",
                      }}
                    >
                      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Preis</div>
                      <div className="mt-1 text-2xl font-black tracking-tight text-foreground">{product.price}</div>
                    </div>
                  </div>

                  <ul className="mt-8 space-y-3">
                    {features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground">
                        <span className="surface-check-icon mt-0.5">
                          <CheckCircle2 size={14} />
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8 space-y-3 border-t border-border pt-6">
                    {product.checkout_url ? (
                      <Button
                        asChild
                        className="btn-primary !h-14 !w-full !rounded-2xl !text-base transition-transform hover:scale-[1.01]"
                      >
                        <a href={product.checkout_url} target="_blank" rel="noreferrer">
                          Jetzt sichern
                          <ArrowUpRight size={18} />
                        </a>
                      </Button>
                    ) : (
                      <Button disabled className="h-14 w-full rounded-2xl text-base font-bold">
                        Checkout folgt
                      </Button>
                    )}

                    {product.slug && (
                      <Button asChild variant="outline" className="h-12 w-full rounded-2xl border-border text-sm font-semibold">
                        <Link to={`/produkt/${product.slug}`}>
                          Details ansehen
                          <ArrowRight size={16} />
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ShopSection;
