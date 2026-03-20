import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { buildRenderImageUrl } from "@/lib/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

type ProductRecord = Database["public"]["Tables"]["products"]["Row"];
type ProductPayload = Database["public"]["Tables"]["products"]["Insert"];

const PRODUCTS_SELECT = "id, title, description, image_url, price, is_visible, sort_order, created_at, updated_at";

const emptyProduct = (sortOrder: number): ProductPayload => ({
  title: "",
  description: "",
  image_url: "",
  price: 0,
  is_visible: true,
  sort_order: sortOrder,
});

const AdminProducts = () => {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<(Partial<ProductRecord> & { id?: string }) | null>(null);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async (): Promise<ProductRecord[]> => {
      const { data, error } = await supabase.from("products").select(PRODUCTS_SELECT).order("sort_order", { ascending: true });
      if (error) throw error;
      return (data as ProductRecord[]) ?? [];
    },
  });

  const previewImage = useMemo(() => {
    if (!editing?.image_url) return "";
    return buildRenderImageUrl(editing.image_url, { width: 480, quality: 82 });
  }, [editing?.image_url]);

  const saveMutation = useMutation({
    mutationFn: async (item: Partial<ProductRecord> & { id?: string }) => {
      const payload: ProductPayload = {
        title: item.title?.trim() || "",
        description: item.description?.trim() || null,
        image_url: item.image_url?.trim() || null,
        price: Number(item.price ?? 0),
        sort_order: Number.isFinite(Number(item.sort_order)) ? Number(item.sort_order) : 0,
        is_visible: item.is_visible ?? true,
      };

      if (item.id) {
        const { error } = await supabase.from("products").update(payload).eq("id", item.id);
        if (error) throw error;
        return;
      }

      const { error } = await supabase.from("products").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      setEditing(null);
      toast.success("Produkt gespeichert");
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
      toast.success("Produkt gelöscht");
    },
    onError: (error: Error) => toast.error(error.message || "Fehler beim Löschen"),
  });

  if (isLoading) return <div className="p-6">Laden...</div>;

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Produkte</h1>
          <p className="mt-1 text-sm text-muted-foreground">Frontend lädt nur sichtbare Produkte. Bucket-Bilder laufen in der Vorschau über die Render-API.</p>
        </div>
        <Button size="sm" onClick={() => setEditing(emptyProduct(products.length))}>
          <Plus size={16} /> Neu
        </Button>
      </div>

      {editing && (
        <div className="mb-6 rounded-xl border border-border bg-card p-4">
          <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="product-title">Titel</Label>
                <Input id="product-title" placeholder="Titel" value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-description">Beschreibung</Label>
                <Textarea id="product-description" placeholder="Beschreibung" value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-image">Bild-Pfad</Label>
                <Input id="product-image" placeholder="products/datei.webp" value={editing.image_url || ""} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="product-price">Preis (€)</Label>
                  <Input id="product-price" type="number" step="0.01" value={editing.price ?? 0} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-sort">Reihenfolge</Label>
                  <Input id="product-sort" type="number" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-border bg-background/70 px-4 py-3">
                <div>
                  <div className="text-sm font-semibold">Sichtbar auf der Website</div>
                  <div className="text-xs text-muted-foreground">Nur sichtbare Einträge werden im DOM geladen.</div>
                </div>
                <Switch checked={editing.is_visible ?? true} onCheckedChange={(checked) => setEditing({ ...editing, is_visible: checked })} />
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-background/70 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Live-Vorschau</div>
              {previewImage ? (
                <img src={previewImage} alt="Produkt Vorschau" className="mt-4 h-40 w-full rounded-xl object-cover" />
              ) : (
                <div className="mt-4 flex h-40 items-center justify-center rounded-xl border border-dashed border-border bg-background text-sm text-muted-foreground">
                  Kein Bildpfad gesetzt
                </div>
              )}
              <div className="mt-4 rounded-xl border border-border bg-card p-4">
                <div className="text-lg font-bold text-[var(--surface-card-text)]">{editing.title || "Produkttitel"}</div>
                <p className="mt-2 text-sm text-[var(--surface-card-muted)]">{editing.description || "Hier erscheint die Beschreibung aus der Datenbank."}</p>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="text-xl font-extrabold text-[var(--surface-card-text)]">€{Number(editing.price ?? 0).toFixed(2).replace(".", ",")}</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${editing.is_visible ?? true ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                    {(editing.is_visible ?? true) ? "Sichtbar" : "Versteckt"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Button size="sm" onClick={() => saveMutation.mutate(editing)} disabled={saveMutation.isPending || !editing.title?.trim()}>
              {saveMutation.isPending ? "Speichern..." : "Speichern"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>Abbrechen</Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {products.map((product) => (
          <div key={product.id} className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
            <div className="flex min-w-0 items-center gap-3">
              {product.image_url ? (
                <img src={buildRenderImageUrl(product.image_url, { width: 160, quality: 78 })} alt="" className="h-10 w-14 rounded object-cover" />
              ) : null}
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{product.title}</div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-bold text-primary">€{Number(product.price).toFixed(2).replace(".", ",")}</span>
                  <span>•</span>
                  <span>{product.is_visible ? "Sichtbar" : "Versteckt"}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={() => setEditing(product)}>Bearbeiten</Button>
              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteMutation.mutate(product.id)}>
                <Trash2 size={14} />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminProducts;
