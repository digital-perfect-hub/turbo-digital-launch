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

type PortfolioRecord = Database["public"]["Tables"]["portfolio_items"]["Row"];
type PortfolioPayload = Database["public"]["Tables"]["portfolio_items"]["Insert"];

const PORTFOLIO_SELECT = "id, title, description, image_url, url, tags, sort_order, is_visible, created_at, updated_at";

const emptyPortfolioItem = (sortOrder: number): PortfolioPayload => ({
  title: "",
  description: "",
  image_url: "",
  url: "",
  tags: [],
  sort_order: sortOrder,
  is_visible: true,
});

const AdminPortfolio = () => {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<(Partial<PortfolioRecord> & { id?: string }) | null>(null);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin-portfolio"],
    queryFn: async (): Promise<PortfolioRecord[]> => {
      const { data, error } = await supabase.from("portfolio_items").select(PORTFOLIO_SELECT).order("sort_order", { ascending: true });
      if (error) throw error;
      return (data as PortfolioRecord[]) ?? [];
    },
  });

  const previewImage = useMemo(() => {
    if (!editing?.image_url) return "";
    return buildRenderImageUrl(editing.image_url, { width: 640, quality: 82 });
  }, [editing?.image_url]);

  const saveMutation = useMutation({
    mutationFn: async (item: Partial<PortfolioRecord> & { id?: string }) => {
      const payload: PortfolioPayload = {
        title: item.title?.trim() || "",
        description: item.description?.trim() || null,
        image_url: item.image_url?.trim() || null,
        url: item.url?.trim() || null,
        tags: (item.tags || []).map((tag) => String(tag).trim()).filter(Boolean),
        sort_order: Number.isFinite(Number(item.sort_order)) ? Number(item.sort_order) : 0,
        is_visible: item.is_visible ?? true,
      };

      if (item.id) {
        const { error } = await supabase.from("portfolio_items").update(payload).eq("id", item.id);
        if (error) throw error;
        return;
      }

      const { error } = await supabase.from("portfolio_items").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-portfolio"] });
      setEditing(null);
      toast.success("Portfolio gespeichert");
    },
    onError: (error: Error) => toast.error(error.message || "Fehler beim Speichern"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("portfolio_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-portfolio"] });
      toast.success("Portfolio-Eintrag gelöscht");
    },
    onError: (error: Error) => toast.error(error.message || "Fehler beim Löschen"),
  });

  if (isLoading) return <div className="p-6">Laden...</div>;

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Portfolio</h1>
          <p className="mt-1 text-sm text-muted-foreground">Frontend lädt nur sichtbare Referenzen. Bilder werden überall über die Render-API ausgeliefert.</p>
        </div>
        <Button size="sm" onClick={() => setEditing(emptyPortfolioItem(items.length))}>
          <Plus size={16} /> Neu
        </Button>
      </div>

      {editing && (
        <div className="mb-6 rounded-xl border border-border bg-card p-4">
          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="portfolio-title">Titel</Label>
                <Input id="portfolio-title" placeholder="Titel" value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="portfolio-description">Beschreibung</Label>
                <Textarea id="portfolio-description" placeholder="Beschreibung" value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="portfolio-image">Bild-Pfad</Label>
                <Input id="portfolio-image" placeholder="portfolio/datei.webp" value={editing.image_url || ""} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="portfolio-url">Projekt-URL</Label>
                <Input id="portfolio-url" placeholder="https://example.com" value={editing.url || ""} onChange={(e) => setEditing({ ...editing, url: e.target.value })} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="portfolio-tags">Tags (kommagetrennt)</Label>
                <Input
                  id="portfolio-tags"
                  placeholder="SEO, Webdesign, Conversion"
                  value={(editing.tags || []).join(", ")}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      tags: e.target.value
                        .split(",")
                        .map((tag) => tag.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="portfolio-sort">Reihenfolge</Label>
                  <Input id="portfolio-sort" type="number" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} />
                </div>
                <div className="flex items-center justify-between rounded-xl border border-border bg-background/70 px-4 py-3 md:mt-7">
                  <div>
                    <div className="text-sm font-semibold">Sichtbar</div>
                    <div className="text-xs text-muted-foreground">Unsichtbare Einträge werden nicht ins DOM geladen.</div>
                  </div>
                  <Switch checked={editing.is_visible ?? true} onCheckedChange={(checked) => setEditing({ ...editing, is_visible: checked })} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-background/70 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Live-Vorschau</div>
              {previewImage ? (
                <img src={previewImage} alt="Portfolio Vorschau" className="mt-4 h-44 w-full rounded-xl object-cover" />
              ) : (
                <div className="mt-4 flex h-44 items-center justify-center rounded-xl border border-dashed border-border bg-background text-sm text-muted-foreground">
                  Kein Bildpfad gesetzt
                </div>
              )}
              <div className="mt-4 rounded-xl border border-border bg-card p-4">
                <div className="text-lg font-bold text-[var(--surface-card-text)]">{editing.title || "Projektname"}</div>
                <p className="mt-2 text-sm text-[var(--surface-card-muted)]">{editing.description || "Hier erscheint der Portfoliotext aus der Datenbank."}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(editing.tags && editing.tags.length > 0 ? editing.tags : ["Tag 1", "Tag 2"]).map((tag) => (
                    <span key={tag} className="premium-pill">{tag}</span>
                  ))}
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
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
            <div className="flex min-w-0 items-center gap-3">
              {item.image_url ? (
                <img src={buildRenderImageUrl(item.image_url, { width: 160, quality: 78 })} alt="" className="h-10 w-14 rounded object-cover" />
              ) : null}
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{item.title}</div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>{item.is_visible ? "Sichtbar" : "Versteckt"}</span>
                  {item.tags && item.tags.length > 0 ? <><span>•</span><span>{item.tags.join(", ")}</span></> : null}
                </div>
              </div>
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={() => setEditing(item)}>Bearbeiten</Button>
              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteMutation.mutate(item.id)}>
                <Trash2 size={14} />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPortfolio;
