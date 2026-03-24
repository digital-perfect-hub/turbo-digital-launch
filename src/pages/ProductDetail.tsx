import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowUpRight, CheckCircle2, Eye, Globe, Image as ImageIcon, Layers3, MonitorSmartphone, ShieldCheck, Sparkles, Users2 } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { Database, Json } from "@/integrations/supabase/types";
import { buildRenderImageUrl } from "@/lib/image";
import { useSiteContext } from "@/context/SiteContext";
import { DEFAULT_SITE_ID } from "@/lib/site";

type ProductRecord = Database["public"]["Tables"]["products"]["Row"];

type ProductUpsell = {
  id: string;
  title: string;
  price_numeric: number;
  stripe_price_id: string;
};

const PRODUCT_SELECT = "id, title, slug, description, long_description, target_audience, price, features, image_url, demo_url, checkout_url, stripe_price_id, tax_rate, cta_text, cta_color, upsells, sort_order, is_visible, created_at, updated_at";

const truncate = (value: string, maxChars: number) => {
  const clean = (value || "").trim();
  if (!clean) return "";
  if (clean.length <= maxChars) return clean;
  return clean.slice(0, maxChars).trimEnd();
};

const upsertMeta = (attrs: { name?: string; property?: string }, content: string) => {
  if (!content) return;

  const selector = attrs.name
    ? `meta[name="${attrs.name}"]`
    : attrs.property
      ? `meta[property="${attrs.property}"]`
      : "";

  if (!selector) return;

  let el = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    if (attrs.name) el.setAttribute("name", attrs.name);
    if (attrs.property) el.setAttribute("property", attrs.property);
    document.head.appendChild(el);
  }

  el.setAttribute("content", content);
};

const upsertLink = (rel: string, href: string) => {
  if (!href) return;

  let el = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }

  el.setAttribute("href", href);
};

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

const normalizeUpsells = (value: Json | null | undefined): ProductUpsell[] => {
  if (!Array.isArray(value)) return [];

  return value
    .map((entry) => {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) return null;

      const id = typeof entry.id === "string" && entry.id.trim() ? entry.id.trim() : crypto.randomUUID();
      const title = typeof entry.title === "string" ? entry.title.trim() : "";
      const stripePriceId = typeof entry.stripe_price_id === "string" ? entry.stripe_price_id.trim() : "";
      const numericValue = typeof entry.price_numeric === "number"
        ? entry.price_numeric
        : typeof entry.price_numeric === "string"
          ? Number(entry.price_numeric)
          : 0;

      if (!title) return null;

      return {
        id,
        title,
        price_numeric: Number.isFinite(numericValue) ? numericValue : 0,
        stripe_price_id: stripePriceId,
      };
    })
    .filter((entry): entry is ProductUpsell => Boolean(entry));
};

const splitParagraphs = (value: string | null | undefined): string[] => {
  return (value || "")
    .split(/\n{2,}/)
    .map((entry) => entry.trim())
    .filter(Boolean);
};

const parseNumericPrice = (value: string | null | undefined) => {
  const raw = (value || "").trim();
  if (!raw) return 0;

  const normalized = raw
    .replace(/\s/g, "")
    .replace(/€/g, "")
    .replace(/\.(?=\d{3}(\D|$))/g, "")
    .replace(/,(?=\d{1,2}(\D|$))/g, ".");

  const match = normalized.match(/-?\d+(?:\.\d+)?/);
  const parsed = match ? Number(match[0]) : 0;
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("de-AT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};


const ProductDetail = () => {
  const { activeSiteId } = useSiteContext();
  const siteId = activeSiteId || DEFAULT_SITE_ID;
  const { slug = "" } = useParams();
  const location = useLocation();
  const [selectedUpsellIds, setSelectedUpsellIds] = useState<string[]>([]);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ["product-detail", siteId, slug],
    enabled: Boolean(slug),
    queryFn: async (): Promise<ProductRecord | null> => {
      const { data, error } = await supabase
        .from("products")
        .select(PRODUCT_SELECT)
        .eq("site_id", siteId)
        .eq("slug", slug)
        .eq("is_visible", true)
        .maybeSingle();

      if (error) throw error;
      return (data as ProductRecord | null) ?? null;
    },
  });

  const features = useMemo(() => normalizeFeatures(product?.features), [product?.features]);
  const upsells = useMemo(() => normalizeUpsells(product?.upsells), [product?.upsells]);
  const detailImage = useMemo(() => {
    if (!product?.image_url) return "";
    return buildRenderImageUrl(product.image_url, { width: 1600, quality: 86 });
  }, [product?.image_url]);
  const longDescriptionParagraphs = useMemo(() => splitParagraphs(product?.long_description), [product?.long_description]);
  const selectedUpsells = useMemo(() => upsells.filter((item) => selectedUpsellIds.includes(item.id)), [selectedUpsellIds, upsells]);
  const baseNetPrice = useMemo(() => parseNumericPrice(product?.price), [product?.price]);
  const taxRate = useMemo(() => {
    const parsed = typeof product?.tax_rate === "number" ? product.tax_rate : Number(product?.tax_rate ?? 19);
    return Number.isFinite(parsed) ? parsed : 19;
  }, [product?.tax_rate]);
  const upsellNetPrice = useMemo(() => selectedUpsells.reduce((sum, item) => sum + item.price_numeric, 0), [selectedUpsells]);
  const netTotal = baseNetPrice + upsellNetPrice;
  const taxAmount = netTotal * (taxRate / 100);
  const grossTotal = netTotal + taxAmount;
  const ctaText = (product?.cta_text || "Jetzt sichern").trim() || "Jetzt sichern";

  useEffect(() => {
    setSelectedUpsellIds([]);
  }, [slug]);

  useEffect(() => {
    if (!product) return;

    const metaTitle = truncate(`${product.title} kaufen | Digital-Perfect`, 60);
    const metaDescription = truncate(
      product.description || `${product.title} mit Demo, Premium-Features und direktem Checkout jetzt ansehen.`,
      155,
    );

    document.title = metaTitle;
    upsertMeta({ name: "description" }, metaDescription);
    upsertMeta({ property: "og:title" }, metaTitle);
    upsertMeta({ property: "og:description" }, metaDescription);
    upsertMeta({ property: "og:type" }, "product");
    if (detailImage) upsertMeta({ property: "og:image" }, detailImage);
    upsertLink("canonical", `${window.location.origin}/produkt/${product.slug}`);
  }, [detailImage, product]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const checkoutState = params.get("checkout");

    if (checkoutState === "cancel") {
      toast.info("Checkout abgebrochen. Deine Auswahl ist hier weiter sichtbar.");
    }
  }, [location.search]);

  const toggleUpsell = (upsellId: string, checked: boolean) => {
    setSelectedUpsellIds((prev) => {
      if (checked) return [...prev, upsellId];
      return prev.filter((id) => id !== upsellId);
    });
  };

  const handleCheckout = async () => {
    if (!product?.stripe_price_id?.trim()) {
      toast.error("Für dieses Produkt fehlt aktuell die Stripe Price ID.");
      return;
    }

    const selectedPriceIds = [product.stripe_price_id, ...selectedUpsells.map((item) => item.stripe_price_id).filter(Boolean)];
    const uniquePriceIds = Array.from(new Set(selectedPriceIds.map((id) => id.trim()).filter(Boolean)));

    if (!uniquePriceIds.length) {
      toast.error("Es konnten keine Stripe Preise für den Checkout ermittelt werden.");
      return;
    }

    setIsCheckoutLoading(true);
    try {
      const successUrl = `${window.location.origin}/produkt/${product.slug}?checkout=success`;
      const cancelUrl = `${window.location.origin}/produkt/${product.slug}?checkout=cancel`;

      const { data, error } = await supabase.functions.invoke("create-stripe-checkout", {
        body: {
          priceIds: uniquePriceIds,
          successUrl,
          cancelUrl,
        },
      });

      if (error) throw error;

      const checkoutUrl = typeof data?.url === "string" ? data.url : "";
      if (!checkoutUrl) throw new Error("Stripe hat keine Checkout-URL zurückgegeben.");

      window.location.assign(checkoutUrl);
    } catch (checkoutError: any) {
      toast.error(checkoutError?.message || "Checkout konnte nicht gestartet werden.");
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  return (
    <div className="surface-page-shell min-h-screen bg-[var(--surface-page)]">
      <Header forceSolid solidBackgroundClassName="!bg-[var(--theme-secondary-hex)] border-b border-white/10 shadow-lg shadow-slate-950/20" />
      <main className="pt-28 md:pt-32">
        {isLoading ? (
          <section className="py-20 sm:py-24">
            <div className="section-container">
              <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="surface-card-shell rounded-[2rem] border p-8 shadow-sm">
                  <div className="animate-pulse space-y-5">
                    <div className="h-4 w-28 rounded-full bg-slate-200" />
                    <div className="h-12 w-2/3 rounded-2xl bg-slate-200" />
                    <div className="h-5 w-full rounded-xl bg-slate-200" />
                    <div className="h-5 w-5/6 rounded-xl bg-slate-200" />
                    <div className="h-64 rounded-[2rem] bg-slate-200" />
                  </div>
                </div>
                <div className="surface-card-shell rounded-[2rem] border p-8 shadow-sm">
                  <div className="animate-pulse space-y-4">
                    <div className="h-5 w-24 rounded-full bg-slate-200" />
                    <div className="h-10 w-36 rounded-2xl bg-slate-200" />
                    <div className="h-4 w-full rounded-xl bg-slate-200" />
                    <div className="h-4 w-5/6 rounded-xl bg-slate-200" />
                    <div className="h-14 w-full rounded-2xl bg-slate-200" />
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : error || !product ? (
          <section className="py-20 sm:py-24">
            <div className="section-container">
              <div className="surface-card-shell rounded-[2rem] border p-10 text-center shadow-sm">
                <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full" style={{ background: "color-mix(in srgb, var(--button-primary-bg) 12%, transparent)", color: "var(--button-primary-bg)" }}>
                  <Layers3 size={28} />
                </div>
                <h1 className="mt-6 text-3xl font-black tracking-tight text-foreground">Produkt nicht gefunden</h1>
                <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
                  Dieses Produkt ist aktuell nicht verfügbar oder der Link ist veraltet. Prüfe den Slug oder geh zurück zur Startseite.
                </p>
                <Button asChild className="btn-primary mt-8 !h-12 !rounded-2xl px-6">
                  <Link to="/">
                    <ArrowLeft size={18} />
                    Zur Startseite
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        ) : (
          <section className="py-14 sm:py-16 md:py-20">
            <div className="section-container">
              <div className="mb-8">
                <Link to="/#shop" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
                  <ArrowLeft size={16} />
                  Zur Produktübersicht
                </Link>
              </div>

              <div className="grid gap-8 xl:grid-cols-[minmax(0,1.15fr)_380px] xl:items-start">
                <div className="space-y-8">
                  <section className="surface-card-shell overflow-hidden rounded-[2.2rem] border shadow-sm">
                    <div className="grid gap-8 p-8 md:p-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
                      <div>
                        <div className="surface-accent-pill px-4 py-2 text-xs font-bold uppercase tracking-[0.2em]">
                          Produkt-Landingpage
                        </div>
                        <h1 className="mt-6 text-4xl font-black tracking-tight text-foreground sm:text-5xl">{product.title}</h1>
                        <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted-foreground">
                          {product.description || "Premium-Produkt mit direktem Checkout, Live-Demo und klarer Leistungsstruktur."}
                        </p>

                        <div className="mt-8 flex flex-wrap items-center gap-4">
                          <div className="rounded-[1.5rem] border border-border bg-[var(--surface-section)] px-5 py-4">
                            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Preis</div>
                            <div className="mt-1 text-3xl font-black tracking-tight text-foreground">{product.price}</div>
                          </div>
                          {product.target_audience && (
                            <div className="rounded-[1.5rem] border border-border bg-[var(--surface-section)] px-5 py-4">
                              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Für wen?</div>
                              <div className="mt-1 text-sm font-semibold text-foreground">{product.target_audience}</div>
                            </div>
                          )}
                        </div>

                        <div className="mt-8 flex flex-wrap gap-4">
                          <Button
                            onClick={handleCheckout}
                            disabled={isCheckoutLoading || !product.stripe_price_id}
                            className="btn-primary !h-14 !rounded-2xl px-7 text-base font-bold shadow-lg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isCheckoutLoading ? "Checkout wird vorbereitet..." : ctaText}
                            <ArrowUpRight size={18} />
                          </Button>

                          {product.checkout_url && (
                            <Button asChild variant="outline" className="h-14 rounded-2xl border-border bg-background/70 px-7 text-base font-semibold text-foreground">
                              <a href={product.checkout_url} target="_blank" rel="noreferrer">
                                Externen Link öffnen
                                <ArrowUpRight size={18} />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="overflow-hidden rounded-[2rem] border border-border bg-[var(--surface-section)] shadow-inner">
                        <div className="aspect-[16/11] w-full overflow-hidden" style={{ background: "var(--surface-section)" }}>
                          {detailImage ? (
                            <img src={detailImage} alt={product.title} className="h-full w-full object-cover" loading="lazy" />
                          ) : (
                            <div className="flex h-full items-center justify-center text-muted-foreground/40" style={{ background: "linear-gradient(135deg, var(--surface-section), color-mix(in srgb, var(--surface-section) 82%, black))" }}>
                              <ImageIcon size={54} strokeWidth={1.5} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </section>

                  {product.demo_url && (
                    <section className="surface-card-shell rounded-[2.2rem] border p-8 shadow-sm md:p-10">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.2em]" style={{ background: "color-mix(in srgb, var(--theme-secondary-hex) 8%, transparent)", color: "var(--theme-secondary-hex)" }}>
                            <Eye size={14} />
                            Live-View
                          </div>
                          <h2 className="mt-5 text-3xl font-black tracking-tight text-foreground">Sieh das System live in Aktion</h2>
                          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
                            Direkt im Browser-Mockup. Ohne Sales-Blabla — der Kunde sieht sofort, wie sich das Produkt anfühlt.
                          </p>
                        </div>
                      </div>

                      <div className="mt-8 overflow-hidden rounded-[2rem] border border-border shadow-[0_30px_80px_-36px_rgba(15,23,42,0.6)]" style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--theme-secondary-hex) 94%, black 6%), color-mix(in srgb, var(--theme-secondary-hex) 80%, var(--button-primary-bg) 20%))" }}>
                        <div className="flex items-center gap-2 border-b px-5 py-4" style={{ borderColor: "color-mix(in srgb, hsl(var(--secondary-foreground)) 10%, transparent)" }}>
                          <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
                          <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
                          <span className="h-3 w-3 rounded-full bg-[#28C840]" />
                          <div className="ml-4 rounded-full px-4 py-1 text-xs" style={{ background: "color-mix(in srgb, hsl(var(--secondary-foreground)) 10%, transparent)", color: "color-mix(in srgb, hsl(var(--secondary-foreground)) 72%, transparent)" }}>
                            {product.demo_url}
                          </div>
                        </div>
                        <div className="aspect-[16/10] w-full bg-[var(--surface-card)]">
                          <iframe
                            src={product.demo_url}
                            title={`${product.title} Live Demo`}
                            className="h-full w-full"
                            loading="lazy"
                            referrerPolicy="strict-origin-when-cross-origin"
                          />
                        </div>
                      </div>
                    </section>
                  )}

                  <section className="surface-card-shell rounded-[2.2rem] border p-8 shadow-sm md:p-10">
                    <div className="surface-accent-pill px-4 py-2 text-xs font-bold uppercase tracking-[0.2em]">
                      <Sparkles size={14} />
                      Deep-Dive
                    </div>
                    <h2 className="mt-5 text-3xl font-black tracking-tight text-foreground">Was genau drin ist</h2>
                    <div className="mt-8 grid gap-6 lg:grid-cols-2">
                      <div className="rounded-[1.8rem] border border-border bg-[var(--surface-section)] p-6">
                        <h3 className="text-lg font-black text-foreground">Leistungsumfang</h3>
                        <ul className="mt-5 space-y-3">
                          {features.length ? (
                            features.map((feature) => (
                              <li key={feature} className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground">
                                <span className="surface-check-icon mt-0.5">
                                  <CheckCircle2 size={14} />
                                </span>
                                <span>{feature}</span>
                              </li>
                            ))
                          ) : (
                            <li className="text-sm leading-relaxed text-muted-foreground">Für dieses Produkt wurden noch keine Features gepflegt.</li>
                          )}
                        </ul>
                      </div>

                      <div className="rounded-[1.8rem] border border-border bg-[var(--surface-section)] p-6">
                        <h3 className="text-lg font-black text-foreground">Strategischer Nutzen</h3>
                        <div className="mt-5 space-y-4 text-sm leading-7 text-muted-foreground">
                          {longDescriptionParagraphs.length ? (
                            longDescriptionParagraphs.map((paragraph, index) => <p key={`${paragraph}-${index}`}>{paragraph}</p>)
                          ) : (
                            <p>
                              Dieses Produkt ist darauf ausgelegt, Conversion, Klarheit und Geschwindigkeit im Vertrieb zu erhöhen — ohne unnötigen Setup-Overhead.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="rounded-[2.2rem] border border-border p-8 shadow-sm md:p-10" style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--theme-secondary-hex) 94%, black 6%) 0%, color-mix(in srgb, var(--theme-secondary-hex) 78%, var(--button-primary-bg) 22%) 100%)", color: "hsl(var(--secondary-foreground))" }}>
                    <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.2em]" style={{ background: "color-mix(in srgb, hsl(var(--secondary-foreground)) 10%, transparent)", color: "color-mix(in srgb, hsl(var(--secondary-foreground)) 85%, transparent)" }}>
                      <ShieldCheck size={14} />
                      Upsell-Preview
                    </div>
                    <h2 className="mt-5 text-3xl font-black tracking-tight">Erweitere dein System</h2>
                    <p className="mt-3 max-w-3xl text-base leading-relaxed" style={{ color: "color-mix(in srgb, hsl(var(--secondary-foreground)) 75%, transparent)" }}>
                      Im Checkout können optionale Erweiterungen direkt mitgewählt werden — perfekt für Pre-Framing bei High-Ticket-Angeboten.
                    </p>

                    <div className="mt-8 grid gap-4 md:grid-cols-3">
                      <div className="rounded-[1.6rem] border p-5" style={{ borderColor: "color-mix(in srgb, hsl(var(--secondary-foreground)) 12%, transparent)", background: "color-mix(in srgb, hsl(var(--secondary-foreground)) 5%, transparent)" }}>
                        <div className="text-sm font-bold">Community Forum</div>
                        <div className="mt-2 text-2xl font-black">+99€</div>
                        <p className="mt-3 text-sm leading-relaxed" style={{ color: "color-mix(in srgb, hsl(var(--secondary-foreground)) 70%, transparent)" }}>Mehr Bindung, schnellere Aktivierung und höhere Kundenloyalität.</p>
                      </div>
                      <div className="rounded-[1.6rem] border p-5" style={{ borderColor: "color-mix(in srgb, hsl(var(--secondary-foreground)) 12%, transparent)", background: "color-mix(in srgb, hsl(var(--secondary-foreground)) 5%, transparent)" }}>
                        <div className="text-sm font-bold">Priority Support</div>
                        <div className="mt-2 text-2xl font-black">+149€</div>
                        <p className="mt-3 text-sm leading-relaxed" style={{ color: "color-mix(in srgb, hsl(var(--secondary-foreground)) 70%, transparent)" }}>Schnellere Reaktionszeit für Kunden, die keine Reibung tolerieren.</p>
                      </div>
                      <div className="rounded-[1.6rem] border p-5" style={{ borderColor: "color-mix(in srgb, hsl(var(--secondary-foreground)) 12%, transparent)", background: "color-mix(in srgb, hsl(var(--secondary-foreground)) 5%, transparent)" }}>
                        <div className="text-sm font-bold">Launch-Paket</div>
                        <div className="mt-2 text-2xl font-black">+249€</div>
                        <p className="mt-3 text-sm leading-relaxed" style={{ color: "color-mix(in srgb, hsl(var(--secondary-foreground)) 70%, transparent)" }}>Setup-Hilfe, Assets und Conversion-Feinschliff für einen starken Start.</p>
                      </div>
                    </div>
                  </section>
                </div>

                <aside className="xl:sticky xl:top-32">
                  <div className="overflow-hidden rounded-[2.2rem] border border-border bg-card shadow-[0_28px_70px_-38px_rgba(15,23,42,0.35)]">
                    <div className="border-b border-border px-7 py-6" style={{ background: "var(--theme-secondary-hex)", color: "hsl(var(--secondary-foreground))" }}>
                      <div className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "color-mix(in srgb, hsl(var(--secondary-foreground)) 70%, transparent)" }}>Edge-Checkout</div>
                      <div className="mt-2 text-3xl font-black tracking-tight">{product.price}</div>
                      <p className="mt-2 text-sm leading-relaxed" style={{ color: "color-mix(in srgb, hsl(var(--secondary-foreground)) 75%, transparent)" }}>Wähle optionale Erweiterungen direkt hier. Der Checkout wird sicher über Stripe gestartet.</p>
                    </div>

                    <div className="space-y-7 px-7 py-7">
                      <div>
                        <div className="text-sm font-black text-foreground">Optional dazubuchen</div>
                        <div className="mt-4 space-y-3">
                          {upsells.length ? (
                            upsells.map((upsell) => {
                              const isSelected = selectedUpsellIds.includes(upsell.id);
                              const isDisabled = !upsell.stripe_price_id;

                              return (
                                <label
                                  key={upsell.id}
                                  className={`flex cursor-pointer items-start gap-3 rounded-[1.4rem] border p-4 transition-all ${
                                    isSelected ? "border-primary/40 bg-primary/5" : "border-border bg-[var(--surface-section)]"
                                  } ${isDisabled ? "cursor-not-allowed opacity-60" : "hover:border-primary/30"}`}
                                >
                                  <Checkbox
                                    checked={isSelected}
                                    disabled={isDisabled}
                                    onCheckedChange={(checked) => toggleUpsell(upsell.id, checked === true)}
                                    className="mt-1"
                                  />
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-3">
                                      <span className="text-sm font-semibold text-foreground">{upsell.title}</span>
                                      <span className="shrink-0 text-sm font-black text-foreground">+ {formatCurrency(upsell.price_numeric)}</span>
                                    </div>
                                    {isDisabled && <p className="mt-2 text-xs text-muted-foreground">Stripe Price ID fehlt — Upsell aktuell nicht aktiv.</p>}
                                  </div>
                                </label>
                              );
                            })
                          ) : (
                            <div className="rounded-[1.4rem] border border-dashed border-border bg-[var(--surface-section)] p-4 text-sm text-muted-foreground">
                              Noch keine Upsells gepflegt.
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="rounded-[1.8rem] border border-border bg-[var(--surface-section)] p-5">
                        <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
                          <span>Netto</span>
                          <span className="font-semibold text-foreground">{formatCurrency(netTotal)}</span>
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-4 text-sm text-muted-foreground">
                          <span>Steuer ({taxRate.toFixed(2).replace(/\.00$/, "")}%)</span>
                          <span className="font-semibold text-foreground">{formatCurrency(taxAmount)}</span>
                        </div>
                        <div className="mt-4 border-t border-border pt-4">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-base font-black text-foreground">Brutto gesamt</span>
                            <span className="text-2xl font-black tracking-tight text-foreground">{formatCurrency(grossTotal)}</span>
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={handleCheckout}
                        disabled={isCheckoutLoading || !product.stripe_price_id}
                        className="btn-primary !h-14 !w-full !rounded-2xl text-base font-bold shadow-lg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isCheckoutLoading ? "Checkout wird vorbereitet..." : ctaText}
                        <ArrowUpRight size={18} />
                      </Button>

                      <div className="space-y-3 rounded-[1.6rem] border border-border bg-card p-4">
                        <div className="flex items-start gap-3 text-sm text-muted-foreground">
                          <MonitorSmartphone size={18} className="mt-0.5 text-primary" />
                          <span>Checkout läuft extern über Stripe — kein fragiles Cart-Management im Frontend.</span>
                        </div>
                        <div className="flex items-start gap-3 text-sm text-muted-foreground">
                          <Globe size={18} className="mt-0.5 text-primary" />
                          <span>Automatische Steuerberechnung läuft im Stripe Checkout abhängig vom Land des Käufers.</span>
                        </div>
                        {product.target_audience && (
                          <div className="flex items-start gap-3 text-sm text-muted-foreground">
                            <Users2 size={18} className="mt-0.5 text-primary" />
                            <span>{product.target_audience}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
