import { ChangeEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, ExternalLink, Image as ImageIcon, Plus, RefreshCw, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database, Json } from "@/integrations/supabase/types";
import { buildRawImageUrl } from "@/lib/image";
import { useSiteModules } from "@/hooks/useSiteModules";
import { ModuleLockedState } from "@/components/admin/ModuleLockedState";
import { useAuth } from "@/hooks/useAuth";
import { useSiteContext } from "@/context/SiteContext";
import { DEFAULT_SITE_ID } from "@/lib/site";
import { buildSiteAssetPath } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

type ProductRecord = Database["public"]["Tables"]["products"]["Row"];
type ProductPayload = Database["public"]["Tables"]["products"]["Insert"];

type ProductUpsell = {
  id: string;
  title: string;
  price_numeric: number;
  stripe_price_id: string;
};

type ProductFormState = {
  id?: string;
  title: string;
  slug: string;
  description: string;
  long_description: string;
  target_audience: string;
  price: string;
  stripe_price_id: string;
  tax_rate: number;
  cta_text: string;
  cta_color: string;
  featuresText: string;
  upsells: ProductUpsell[];
  image_url: string;
  demo_url: string;
  checkout_url: string;
  sort_order: number;
  is_visible: boolean;
};

const PRODUCTS_SELECT = "id, title, slug, description, long_description, target_audience, price, stripe_price_id, tax_rate, cta_text, cta_color, features, upsells, image_url, demo_url, checkout_url, sort_order, is_visible, created_at, updated_at";

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
      const priceNumeric = typeof entry.price_numeric === "number"
        ? entry.price_numeric
        : typeof entry.price_numeric === "string"
          ? Number(entry.price_numeric)
          : 0;

      return {
        id,
        title,
        price_numeric: Number.isFinite(priceNumeric) ? priceNumeric : 0,
        stripe_price_id: stripePriceId,
      };
    })
    .filter((entry): entry is ProductUpsell => Boolean(entry));
};

const parseFeaturesInput = (value: string): string[] => {
  return value
    .split(/[\n,]/)
    .map((entry) => entry.trim())
    .filter(Boolean);
};

const slugify = (value: string) => {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
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

const normalizeColor = (value: string | null | undefined) => {
  const color = (value || "").trim();
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color) ? color : "#FF4B2C";
};

const createEmptyUpsell = (): ProductUpsell => ({
  id: crypto.randomUUID(),
  title: "",
  price_numeric: 0,
  stripe_price_id: "",
});

const toFormState = (item?: Partial<ProductRecord> & { id?: string }, nextSortOrder = 0): ProductFormState => ({
  id: item?.id,
  title: item?.title?.trim() || "",
  slug: item?.slug?.trim() || "",
  description: item?.description?.trim() || "",
  long_description: item?.long_description?.trim() || "",
  target_audience: item?.target_audience?.trim() || "",
  price: typeof item?.price === "string" ? item.price : "",
  stripe_price_id: item?.stripe_price_id?.trim() || "",
  tax_rate: Number.isFinite(Number(item?.tax_rate)) ? Number(item?.tax_rate) : 19,
  cta_text: item?.cta_text?.trim() || "Jetzt sichern",
  cta_color: normalizeColor(item?.cta_color),
  featuresText: normalizeFeatures(item?.features).join("\n"),
  upsells: normalizeUpsells(item?.upsells),
  image_url: item?.image_url?.trim() || "",
  demo_url: item?.demo_url?.trim() || "",
  checkout_url: item?.checkout_url?.trim() || "",
  sort_order: Number.isFinite(Number(item?.sort_order)) ? Number(item?.sort_order) : nextSortOrder,
  is_visible: item?.is_visible ?? true,
});

const AdminProducts = () => {
  const qc = useQueryClient();
  const { isGlobalAdmin } = useAuth();
  const { activeSiteId } = useSiteContext();
  const siteId = activeSiteId || DEFAULT_SITE_ID;
  const [editing, setEditing] = useState<ProductFormState | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const { hasShop, isLoading: modulesLoading } = useSiteModules();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin-products", siteId],
    queryFn: async (): Promise<ProductRecord[]> => {
      const { data, error } = await supabase.from("products").select(PRODUCTS_SELECT).eq("site_id", siteId).order("sort_order", { ascending: true });
      if (error) throw error;
      return (data as ProductRecord[]) ?? [];
    },
  });

  const nextSortOrder = useMemo(() => {
    if (!products.length) return 0;
    return Math.max(...products.map((item) => item.sort_order || 0)) + 1;
  }, [products]);

  const previewImage = useMemo(() => {
    if (!editing?.image_url) return "";
    return buildRawImageUrl(editing.image_url);
  }, [editing?.image_url]);

  const previewFeatures = useMemo(() => parseFeaturesInput(editing?.featuresText || ""), [editing?.featuresText]);
  const detailHref = editing?.slug ? `/produkt/${editing.slug}` : "/produkt/produkt-slug";
  const previewBaseNet = useMemo(() => parseNumericPrice(editing?.price), [editing?.price]);
  const previewUpsellNet = useMemo(() => (editing?.upsells || []).reduce((sum, item) => sum + (Number.isFinite(item.price_numeric) ? item.price_numeric : 0), 0), [editing?.upsells]);
  const previewNet = previewBaseNet + previewUpsellNet;
  const previewTax = previewNet * (((editing?.tax_rate ?? 19) || 19) / 100);
  const previewGross = previewNet + previewTax;

  const openCreateForm = () => {
    setEditing(toFormState(undefined, nextSortOrder));
    setIsSlugManuallyEdited(false);
  };

  const openEditForm = (product: ProductRecord) => {
    setEditing(toFormState(product, nextSortOrder));
    setIsSlugManuallyEdited(true);
  };

  const closeForm = () => {
    setEditing(null);
    setIsSlugManuallyEdited(false);
  };

  const saveMutation = useMutation({
    mutationFn: async (item: ProductFormState) => {
      const payload: ProductPayload = {
        title: item.title.trim(),
        slug: slugify(item.slug || item.title),
        description: item.description.trim() || null,
        long_description: item.long_description.trim() || null,
        target_audience: item.target_audience.trim() || null,
        price: item.price.trim(),
        stripe_price_id: item.stripe_price_id.trim() || null,
        tax_rate: Number.isFinite(Number(item.tax_rate)) ? Number(item.tax_rate) : 19,
        cta_text: item.cta_text.trim() || "Jetzt sichern",
        cta_color: normalizeColor(item.cta_color),
        features: parseFeaturesInput(item.featuresText),
        upsells: item.upsells
          .map((upsell) => ({
            id: upsell.id || crypto.randomUUID(),
            title: upsell.title.trim(),
            price_numeric: Number.isFinite(Number(upsell.price_numeric)) ? Number(upsell.price_numeric) : 0,
            stripe_price_id: upsell.stripe_price_id.trim(),
          }))
          .filter((upsell) => upsell.title) as unknown as Json,
        image_url: item.image_url.trim() || null,
        demo_url: item.demo_url.trim() || null,
        checkout_url: item.checkout_url.trim() || null,
        sort_order: Number.isFinite(Number(item.sort_order)) ? Number(item.sort_order) : 0,
        is_visible: item.is_visible,
      };

      if (!payload.slug) throw new Error("Bitte einen gültigen Slug hinterlegen.");
      if (!payload.price) throw new Error("Bitte einen Preistext hinterlegen.");

      if (item.id) {
        const { error } = await supabase.from("products").update(payload).eq("id", item.id);
        if (error) throw error;
        return;
      }

      const { error } = await supabase.from("products").insert({ ...payload, site_id: siteId });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      closeForm();
      toast.success("Produkt erfolgreich gespeichert.");
    },
    onError: (error: Error) => toast.error(error.message || "Fehler beim Speichern"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Produkt gelöscht.");
    },
    onError: (error: Error) => toast.error(error.message || "Fehler beim Löschen"),
  });

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editing) return;

    setIsUploading(true);
    try {
      const filePath = buildSiteAssetPath(siteId, "products", file);
      const { error: uploadError } = await supabase.storage.from("branding").upload(filePath, file);
      if (uploadError) throw uploadError;

      setEditing((prev) => (prev ? { ...prev, image_url: filePath } : prev));
toast.success("Produktbild erfolgreich hochgeladen.");
    } catch (error: any) {
      toast.error(`Upload fehlgeschlagen: ${error.message}`);
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const handleTitleChange = (value: string) => {
    setEditing((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        title: value,
        slug: !isSlugManuallyEdited ? slugify(value) : prev.slug,
      };
    });
  };

  const regenerateSlug = () => {
    setEditing((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        slug: slugify(prev.title),
      };
    });
    setIsSlugManuallyEdited(false);
  };

  const updateUpsell = (upsellId: string, patch: Partial<ProductUpsell>) => {
    setEditing((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        upsells: prev.upsells.map((upsell) => (upsell.id === upsellId ? { ...upsell, ...patch } : upsell)),
      };
    });
  };

  const addUpsell = () => {
    setEditing((prev) => {
      if (!prev) return prev;
      return { ...prev, upsells: [...prev.upsells, createEmptyUpsell()] };
    });
  };

  const removeUpsell = (upsellId: string) => {
    setEditing((prev) => {
      if (!prev) return prev;
      return { ...prev, upsells: prev.upsells.filter((upsell) => upsell.id !== upsellId) };
    });
  };

  if (isLoading || modulesLoading) return <div className="p-6 font-medium text-slate-500">Laden...</div>;

  if (!hasShop) {
    return (
      <ModuleLockedState
        moduleName="Shop"
        title="Shop-Modul ist aktuell gesperrt"
        description="Produktverwaltung, Checkout-Setup und Upsells werden erst sichtbar, wenn das Shop-Entitlement für diese Site aktiviert ist."
        canSelfActivate={isGlobalAdmin}
      />
    );
  }

  return (
    <div className="max-w-6xl p-6">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Shop</h1>
          <p className="mt-1 text-sm text-slate-500">Lean-Shop mit Detailseiten, Edge-Checkout und live berechenbaren Upsells.</p>
        </div>
        {!editing && (
          <Button onClick={openCreateForm} className="rounded-xl bg-[#FF4B2C] text-white shadow-md shadow-[#FF4B2C]/20 hover:bg-[#E03A1E]">
            <Plus size={16} className="mr-2" /> Neues Produkt
          </Button>
        )}
      </div>

      {editing ? (
        <div className="mb-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="product-title" className="text-slate-700">Produkttitel</Label>
                  <Input
                    id="product-title"
                    value={editing.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="z. B. Digital-Perfect SaaS Lizenz"
                    className="rounded-xl border-slate-200 bg-slate-50 focus:border-[#FF4B2C]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product-price" className="text-slate-700">Preistext</Label>
                  <Input
                    id="product-price"
                    value={editing.price}
                    onChange={(e) => setEditing({ ...editing, price: e.target.value })}
                    placeholder="599€ / Monat"
                    className="rounded-xl border-slate-200 bg-slate-50 focus:border-[#FF4B2C]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-slug" className="text-slate-700">Slug</Label>
                <div className="flex gap-2">
                  <Input
                    id="product-slug"
                    value={editing.slug}
                    onChange={(e) => {
                      setEditing({ ...editing, slug: slugify(e.target.value) });
                      setIsSlugManuallyEdited(true);
                    }}
                    placeholder="digital-perfect-saas-lizenz"
                    className="rounded-xl border-slate-200 bg-slate-50 focus:border-[#FF4B2C]"
                  />
                  <Button type="button" variant="outline" onClick={regenerateSlug} className="rounded-xl border-slate-200 px-4 text-slate-700">
                    <RefreshCw size={16} className="mr-2" /> Neu
                  </Button>
                </div>
                <p className="text-xs text-slate-500">Frontend-Route: <span className="font-semibold text-slate-700">{detailHref}</span></p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-description" className="text-slate-700">Kurzbeschreibung</Label>
                <Textarea
                  id="product-description"
                  rows={4}
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  placeholder="Kurz, klar, premium. Was bekommt der Kunde konkret?"
                  className="resize-none rounded-xl border-slate-200 bg-slate-50 focus:border-[#FF4B2C]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-target-audience" className="text-slate-700">Zielgruppe</Label>
                <Input
                  id="product-target-audience"
                  value={editing.target_audience}
                  onChange={(e) => setEditing({ ...editing, target_audience: e.target.value })}
                  placeholder="Für Agenturen, Coaches, lokale Dienstleister ..."
                  className="rounded-xl border-slate-200 bg-slate-50 focus:border-[#FF4B2C]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-features" className="text-slate-700">Features</Label>
                <Textarea
                  id="product-features"
                  rows={6}
                  value={editing.featuresText}
                  onChange={(e) => setEditing({ ...editing, featuresText: e.target.value })}
                  placeholder={"Je Zeile ein Feature\nSetup inklusive\nPersönliches Onboarding\nPriority Support"}
                  className="resize-none rounded-xl border-slate-200 bg-slate-50 focus:border-[#FF4B2C]"
                />
                <p className="text-xs text-slate-500">Jede Zeile wird als eigener Bulletpoint in JSONB gespeichert.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-long-description" className="text-slate-700">Long Description</Label>
                <Textarea
                  id="product-long-description"
                  rows={7}
                  value={editing.long_description}
                  onChange={(e) => setEditing({ ...editing, long_description: e.target.value })}
                  placeholder={"Hier kommt der Deep-Dive rein.\n\nAm besten in sinnvollen Absätzen für die Detailseite."}
                  className="resize-none rounded-xl border-slate-200 bg-slate-50 focus:border-[#FF4B2C]"
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="product-demo-url" className="text-slate-700">Demo-URL</Label>
                  <Input
                    id="product-demo-url"
                    value={editing.demo_url}
                    onChange={(e) => setEditing({ ...editing, demo_url: e.target.value })}
                    placeholder="https://demo.deine-seite.de"
                    className="rounded-xl border-slate-200 bg-slate-50 focus:border-[#FF4B2C]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product-checkout" className="text-slate-700">Legacy Checkout-URL</Label>
                  <Input
                    id="product-checkout"
                    value={editing.checkout_url}
                    onChange={(e) => setEditing({ ...editing, checkout_url: e.target.value })}
                    placeholder="https://checkout.stripe.com/..."
                    className="rounded-xl border-slate-200 bg-slate-50 focus:border-[#FF4B2C]"
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                <div className="space-y-2 xl:col-span-2">
                  <Label htmlFor="product-stripe-price-id" className="text-slate-700">Stripe Price ID</Label>
                  <Input
                    id="product-stripe-price-id"
                    value={editing.stripe_price_id}
                    onChange={(e) => setEditing({ ...editing, stripe_price_id: e.target.value })}
                    placeholder="price_1234567890"
                    className="rounded-xl border-slate-200 bg-slate-50 focus:border-[#FF4B2C]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product-tax-rate" className="text-slate-700">Steuersatz</Label>
                  <Input
                    id="product-tax-rate"
                    type="number"
                    step="0.01"
                    value={editing.tax_rate}
                    onChange={(e) => setEditing({ ...editing, tax_rate: Number(e.target.value) })}
                    className="rounded-xl border-slate-200 bg-slate-50 focus:border-[#FF4B2C]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product-cta-text" className="text-slate-700">CTA Text</Label>
                  <Input
                    id="product-cta-text"
                    value={editing.cta_text}
                    onChange={(e) => setEditing({ ...editing, cta_text: e.target.value })}
                    placeholder="Jetzt sichern"
                    className="rounded-xl border-slate-200 bg-slate-50 focus:border-[#FF4B2C]"
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-[1fr_160px]">
                <div className="space-y-3">
                  <Label className="font-bold text-slate-700">Produktbild</Label>
                  <div className="flex items-center gap-5 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex h-20 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
                      {previewImage ? (
                        <img src={previewImage} alt="Produktbild Vorschau" className="h-full w-full rounded-lg object-cover" />
                      ) : (
                        <ImageIcon className="text-slate-300" />
                      )}
                    </div>
                    <div>
                      <Label
                        htmlFor="product-image-upload"
                        className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition-all hover:border-[#FF4B2C] hover:text-[#FF4B2C]"
                      >
                        {isUploading ? "Lädt..." : <><Upload size={14} className="mr-2" /> Bild hochladen</>}
                      </Label>
                      <input id="product-image-upload" type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={isUploading} />
                      <p className="mt-2 text-xs text-slate-500">Upload in den Bucket branding / products/</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product-sort" className="text-slate-700">Reihenfolge</Label>
                  <Input
                    id="product-sort"
                    type="number"
                    value={editing.sort_order}
                    onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })}
                    className="rounded-xl border-slate-200 bg-slate-50 focus:border-[#FF4B2C]"
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-[1fr_220px]">
                <div className="space-y-2">
                  <Label htmlFor="product-cta-color-text" className="text-slate-700">CTA Farbe</Label>
                  <Input
                    id="product-cta-color-text"
                    value={editing.cta_color}
                    onChange={(e) => setEditing({ ...editing, cta_color: normalizeColor(e.target.value) })}
                    placeholder="#FF4B2C"
                    className="rounded-xl border-slate-200 bg-slate-50 focus:border-[#FF4B2C]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-cta-color" className="text-slate-700">Farbpicker</Label>
                  <Input
                    id="product-cta-color"
                    type="color"
                    value={normalizeColor(editing.cta_color)}
                    onChange={(e) => setEditing({ ...editing, cta_color: e.target.value })}
                    className="h-11 rounded-xl border-slate-200 bg-slate-50 p-1 focus:border-[#FF4B2C]"
                  />
                </div>
              </div>

              <div className="space-y-4 rounded-[1.8rem] border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Upsells</h3>
                    <p className="mt-1 text-sm text-slate-500">Lokaler Listen-Editor für die Checkout-Sidebar.</p>
                  </div>
                  <Button type="button" variant="outline" onClick={addUpsell} className="rounded-xl border-slate-200 text-slate-700">
                    <Plus size={16} className="mr-2" /> Upsell hinzufügen
                  </Button>
                </div>

                {editing.upsells.length ? (
                  <div className="space-y-4">
                    {editing.upsells.map((upsell, index) => (
                      <div key={upsell.id} className="rounded-[1.5rem] border border-slate-200 bg-white p-4">
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <div className="text-sm font-bold text-slate-900">Upsell #{index + 1}</div>
                          <Button type="button" variant="ghost" onClick={() => removeUpsell(upsell.id)} className="h-9 rounded-xl px-3 text-slate-500 hover:bg-red-50 hover:text-red-600">
                            <Trash2 size={15} className="mr-2" /> Entfernen
                          </Button>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1fr_180px]">
                          <div className="space-y-2">
                            <Label className="text-slate-700">Titel</Label>
                            <Input
                              value={upsell.title}
                              onChange={(e) => updateUpsell(upsell.id, { title: e.target.value })}
                              placeholder="Community Forum"
                              className="rounded-xl border-slate-200 bg-slate-50 focus:border-[#FF4B2C]"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-slate-700">Preis netto</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={upsell.price_numeric}
                              onChange={(e) => updateUpsell(upsell.id, { price_numeric: Number(e.target.value) })}
                              className="rounded-xl border-slate-200 bg-slate-50 focus:border-[#FF4B2C]"
                            />
                          </div>
                        </div>
                        <div className="mt-4 space-y-2">
                          <Label className="text-slate-700">Stripe Price ID</Label>
                          <Input
                            value={upsell.stripe_price_id}
                            onChange={(e) => updateUpsell(upsell.id, { stripe_price_id: e.target.value })}
                            placeholder="price_upsell123456"
                            className="rounded-xl border-slate-200 bg-slate-50 focus:border-[#FF4B2C]"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[1.4rem] border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500">
                    Noch keine Upsells angelegt. Über „Upsell hinzufügen“ kannst du Order-Bumps vorbereiten.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-5 md:p-6">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Live-Vorschau</div>
              <div className="mt-4 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
                <div className="aspect-[16/10] w-full overflow-hidden bg-slate-100">
                  {previewImage ? (
                    <img src={previewImage} alt="Produkt Preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ImageIcon className="text-slate-300" size={40} />
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="inline-flex items-center rounded-full bg-[#FF4B2C]/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[#FF4B2C]">
                    Premium Paket
                  </div>
                  <h3 className="mt-4 text-2xl font-black tracking-tight text-slate-900">{editing.title || "Produkttitel"}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{editing.description || "Hier sieht der Kunde sofort, was das Produkt leistet."}</p>

                  <div className="mt-6 rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#FF4B2C]">Sidebar Kalkulation</div>
                    <div className="mt-3 space-y-2 text-sm text-slate-600">
                      <div className="flex items-center justify-between gap-4">
                        <span>Netto</span>
                        <span className="font-semibold text-slate-900">{formatCurrency(previewNet)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span>Steuer ({editing.tax_rate || 19}%)</span>
                        <span className="font-semibold text-slate-900">{formatCurrency(previewTax)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4 border-t border-slate-200 pt-3">
                        <span className="font-black text-slate-900">Brutto</span>
                        <span className="text-lg font-black text-[#0E1F53]">{formatCurrency(previewGross)}</span>
                      </div>
                    </div>
                  </div>

                  <ul className="mt-6 space-y-3">
                    {previewFeatures.length ? (
                      previewFeatures.map((feature) => (
                        <li key={feature} className="flex items-start gap-3 text-sm leading-relaxed text-slate-700">
                          <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                            <CheckCircle2 size={14} />
                          </span>
                          <span>{feature}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-slate-500">Noch keine Features eingetragen.</li>
                    )}
                  </ul>

                  <div className="mt-6 grid gap-3">
                    {editing.upsells.map((upsell) => (
                      <div key={upsell.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-semibold text-slate-800">{upsell.title || "Neuer Upsell"}</span>
                          <span className="font-black text-[#0E1F53]">+ {formatCurrency(Number(upsell.price_numeric) || 0)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-2xl px-5 text-sm font-bold text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: normalizeColor(editing.cta_color) }}
                  >
                    {editing.cta_text || "Jetzt sichern"}
                  </button>

                  <div className="mt-4 text-xs text-slate-500">
                    Detailseite: <a href={detailHref} target="_blank" rel="noreferrer" className="font-semibold text-[#FF4B2C] hover:underline">{detailHref}</a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-6">
            <div className="flex items-center gap-3">
              <Switch checked={editing.is_visible} onCheckedChange={(checked) => setEditing({ ...editing, is_visible: checked })} />
              <div>
                <p className="font-semibold text-slate-900">Sichtbar im Frontend</p>
                <p className="text-sm text-slate-500">Nur sichtbare Produkte erscheinen in ShopSection und auf direkten Detailseiten.</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button type="button" variant="outline" onClick={closeForm} className="rounded-xl border-slate-200 px-5 text-slate-700">
                Abbrechen
              </Button>
              <Button
                type="button"
                onClick={() => editing && saveMutation.mutate(editing)}
                disabled={saveMutation.isPending}
                className="rounded-xl bg-[#FF4B2C] px-5 text-white shadow-md shadow-[#FF4B2C]/20 hover:bg-[#E03A1E]"
              >
                {saveMutation.isPending ? "Speichert..." : "Produkt speichern"}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => {
            const previewUrl = product.image_url
              ? buildRawImageUrl(product.image_url)
              : "";
            const featurePreview = normalizeFeatures(product.features).slice(0, 3);
            const upsellCount = normalizeUpsells(product.upsells).length;

            return (
              <article key={product.id} className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                  {previewUrl ? (
                    <img src={previewUrl} alt={product.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-300">
                      <ImageIcon size={44} strokeWidth={1.5} />
                    </div>
                  )}
                  <div className="absolute left-4 top-4 inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[#0E1F53] shadow-sm backdrop-blur-md">
                    {product.is_visible ? "Live" : "Entwurf"}
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-black tracking-tight text-slate-900">{product.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">{product.description || "Kein Beschreibungstext hinterlegt."}</p>
                    </div>
                    <div className="rounded-2xl bg-[#FF4B2C]/10 px-3 py-2 text-right">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#FF4B2C]">Preis</div>
                      <div className="mt-1 text-xl font-black tracking-tight text-[#0E1F53]">{product.price}</div>
                    </div>
                  </div>

                  <ul className="mt-5 space-y-2">
                    {featurePreview.length ? featurePreview.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm leading-relaxed text-slate-700">
                        <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                          <CheckCircle2 size={14} />
                        </span>
                        <span>{feature}</span>
                      </li>
                    )) : <li className="text-sm text-slate-500">Keine Features hinterlegt.</li>}
                  </ul>

                  <div className="mt-5 grid gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    <div className="flex items-center justify-between gap-4">
                      <span>Slug</span>
                      <span className="font-semibold text-slate-900">/{product.slug}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span>Upsells</span>
                      <span className="font-semibold text-slate-900">{upsellCount}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span>Stripe</span>
                      <span className="font-semibold text-slate-900">{product.stripe_price_id ? "Verbunden" : "Offen"}</span>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button type="button" onClick={() => openEditForm(product)} className="rounded-xl bg-[#0E1F53] px-4 text-white hover:bg-[#132B73]">
                      Bearbeiten
                    </Button>
                    <Button asChild type="button" variant="outline" className="rounded-xl border-slate-200 px-4 text-slate-700">
                      <a href={`/produkt/${product.slug}`} target="_blank" rel="noreferrer">
                        Ansehen
                        <ExternalLink size={15} className="ml-2" />
                      </a>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => deleteMutation.mutate(product.id)}
                      disabled={deleteMutation.isPending}
                      className="rounded-xl px-4 text-slate-500 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={15} className="mr-2" /> Löschen
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
