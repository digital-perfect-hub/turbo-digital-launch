import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Upload, Image as ImageIcon } from "lucide-react";
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
  const [isUploading, setIsUploading] = useState(false);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin_portfolio_items"],
    queryFn: async () => {
      const { data, error } = await supabase.from("portfolio_items").select(PORTFOLIO_SELECT).order("sort_order");
      if (error) throw error;
      return data as PortfolioRecord[];
    },
  });

  const nextSortOrder = useMemo(() => {
    if (!items.length) return 0;
    return Math.max(...items.map((i) => i.sort_order || 0)) + 1;
  }, [items]);

  const saveMutation = useMutation({
    mutationFn: async (payload: Partial<PortfolioRecord> & { id?: string }) => {
      if (payload.id) {
        const { id, ...rest } = payload;
        const { error } = await supabase.from("portfolio_items").update(rest).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("portfolio_items").insert(payload as PortfolioPayload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_portfolio_items"] });
      setEditing(null);
      toast.success("Portfolio-Eintrag erfolgreich gespeichert.");
    },
    onError: (err: any) => toast.error(err.message || "Fehler beim Speichern"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("portfolio_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_portfolio_items"] });
      toast.success("Eintrag gelöscht.");
    },
    onError: (err: any) => toast.error(err.message || "Fehler beim Löschen"),
  });

  // NEU: Echter Datei-Upload
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `portfolio/${crypto.randomUUID()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('branding').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('branding').getPublicUrl(filePath);
      
      setEditing({ ...editing, image_url: publicUrl });
      toast.success("Bild erfolgreich hochgeladen!");
    } catch (error: any) {
      toast.error("Upload fehlgeschlagen: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) return <div className="p-6 text-slate-500 font-medium">Laden...</div>;

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Portfolio</h1>
          <p className="text-sm text-slate-500 mt-1">Verwalte deine Referenz-Projekte.</p>
        </div>
        {!editing && (
          <Button onClick={() => setEditing(emptyPortfolioItem(nextSortOrder))} className="bg-[#FF4B2C] text-white hover:bg-[#E03A1E] rounded-xl shadow-md shadow-[#FF4B2C]/20">
            <Plus size={16} className="mr-2" /> Neues Projekt
          </Button>
        )}
      </div>

      {editing ? (
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 md:p-8 shadow-sm mb-8 space-y-6">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-slate-700">Projekttitel</Label>
                <Input 
                  value={editing.title || ""} 
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })} 
                  placeholder="z.B. Relaunch Muster GmbH" 
                  className="rounded-xl bg-slate-50 border-slate-200 focus:border-[#FF4B2C]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700">Live-URL (Link zum Projekt)</Label>
                <Input 
                  value={editing.url || ""} 
                  onChange={(e) => setEditing({ ...editing, url: e.target.value })} 
                  placeholder="https://mein-projekt.de" 
                  className="rounded-xl bg-slate-50 border-slate-200 focus:border-[#FF4B2C]"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-slate-700">Tags (Komma-getrennt)</Label>
                <Input 
                  value={editing.tags?.join(", ") || ""} 
                  onChange={(e) => {
                    const tagsArray = e.target.value.split(",").map(t => t.trim()).filter(Boolean);
                    setEditing({ ...editing, tags: tagsArray });
                  }} 
                  placeholder="Webdesign, SEO, E-Commerce" 
                  className="rounded-xl bg-slate-50 border-slate-200 focus:border-[#FF4B2C]"
                />
              </div>
            </div>

            <div className="space-y-6">
              {/* NEU: Echter Bild-Upload */}
              <div className="space-y-3">
                <Label className="text-slate-700 font-bold">Projektbild</Label>
                <div className="flex items-center gap-5 p-4 rounded-2xl border border-slate-100 bg-slate-50">
                  <div className="h-16 w-24 shrink-0 rounded-xl border border-slate-200 bg-white flex items-center justify-center shadow-sm overflow-hidden p-1">
                    {editing.image_url ? (
                      <img src={editing.image_url.startsWith("http") ? editing.image_url : buildRenderImageUrl(editing.image_url, { width: 160 })} alt="Preview" className="max-h-full object-cover" />
                    ) : <ImageIcon className="text-slate-300" />}
                  </div>
                  <div>
                    <Label htmlFor="portfolio-image-upload" className="cursor-pointer inline-flex items-center justify-center rounded-xl bg-white border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 shadow-sm hover:border-[#FF4B2C] hover:text-[#FF4B2C] transition-all">
                      {isUploading ? "Lädt..." : <><Upload size={14} className="mr-2" /> Bild hochladen</>}
                    </Label>
                    <input id="portfolio-image-upload" type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={isUploading} />
                    <p className="mt-2 text-xs text-slate-500">Wird sicher in Supabase gespeichert.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700">Beschreibung</Label>
                <Textarea 
                  rows={4} 
                  value={editing.description || ""} 
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })} 
                  className="rounded-xl bg-slate-50 border-slate-200 resize-none focus:border-[#FF4B2C]"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-6">
            <div className="flex items-center gap-3">
              <Switch 
                checked={editing.is_visible ?? true} 
                onCheckedChange={(checked) => setEditing({ ...editing, is_visible: checked })} 
                className="data-[state=checked]:bg-[#FF4B2C]"
              />
              <Label className="cursor-pointer font-medium text-slate-700">Im Frontend anzeigen</Label>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setEditing(null)} className="rounded-xl text-slate-500">Abbrechen</Button>
              <Button 
                onClick={() => saveMutation.mutate(editing)} 
                disabled={saveMutation.isPending}
                className="rounded-xl bg-[#FF4B2C] text-white hover:bg-[#E03A1E] shadow-md shadow-[#FF4B2C]/20"
              >
                Projekt speichern
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="group flex items-center justify-between gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-[#FF4B2C]/30 hover:shadow-md">
              <div className="flex min-w-0 items-center gap-5">
                {item.image_url ? (
                  <img src={item.image_url.startsWith("http") ? item.image_url : buildRenderImageUrl(item.image_url, { width: 160, quality: 78 })} alt="" className="h-16 w-24 rounded-xl object-cover shadow-sm" />
                ) : (
                  <div className="h-16 w-24 rounded-xl bg-slate-100 flex items-center justify-center text-[0.65rem] uppercase font-bold tracking-wider text-slate-400">Kein Bild</div>
                )}
                <div className="min-w-0">
                  <div className="truncate font-bold text-slate-900 text-lg">{item.title}</div>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-medium">
                    <span className={item.is_visible ? "text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200" : "text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200"}>
                      {item.is_visible ? "Sichtbar" : "Versteckt"}
                    </span>
                    {item.url && (
                      <a href={item.url} target="_blank" rel="noreferrer" className="text-[#FF4B2C] hover:underline flex items-center gap-1">
                        Live ansehen
                      </a>
                    )}
                    {item.tags && item.tags.length > 0 && (
                      <span className="text-slate-400 font-normal">{item.tags.join(" • ")}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                <Button size="sm" variant="outline" onClick={() => setEditing(item)} className="rounded-lg border-slate-200 text-slate-600 hover:text-[#FF4B2C]">Bearbeiten</Button>
                <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg" onClick={() => { if(window.confirm("Projekt löschen?")) deleteMutation.mutate(item.id) }}>
                  <Trash2 size={18} />
                </Button>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="text-center py-16 rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-slate-400 mb-3">
                <Plus size={24} />
              </div>
              <p className="text-slate-500 font-medium">Noch keine Projekte angelegt.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPortfolio;