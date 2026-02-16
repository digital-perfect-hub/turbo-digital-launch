import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";

const AdminPortfolio = () => {
  const qc = useQueryClient();
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin-portfolio"],
    queryFn: async () => {
      const { data, error } = await supabase.from("portfolio_items").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const [editing, setEditing] = useState<any>(null);

  const saveMutation = useMutation({
    mutationFn: async (item: any) => {
      const payload = { title: item.title, description: item.description, image_url: item.image_url, url: item.url, tags: item.tags, sort_order: item.sort_order, is_visible: item.is_visible ?? true };
      if (item.id) {
        const { error } = await supabase.from("portfolio_items").update(payload).eq("id", item.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("portfolio_items").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-portfolio"] }); setEditing(null); toast.success("Gespeichert"); },
    onError: () => toast.error("Fehler"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("portfolio_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-portfolio"] }); toast.success("Gelöscht"); },
  });

  if (isLoading) return <div className="p-6">Laden...</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Portfolio</h1>
        <Button size="sm" onClick={() => setEditing({ title: "", description: "", image_url: "", url: "", tags: [], sort_order: items.length })}><Plus size={16} /> Neu</Button>
      </div>

      {editing && (
        <div className="mb-6 p-4 border border-border rounded-xl bg-card space-y-3">
          <Input placeholder="Titel" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
          <Textarea placeholder="Beschreibung" value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
          <Input placeholder="Bild-URL" value={editing.image_url || ""} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} />
          <Input placeholder="Website-URL" value={editing.url || ""} onChange={(e) => setEditing({ ...editing, url: e.target.value })} />
          <Input placeholder="Tags (kommagetrennt)" value={(editing.tags || []).join(", ")} onChange={(e) => setEditing({ ...editing, tags: e.target.value.split(",").map((t: string) => t.trim()).filter(Boolean) })} />
          <Input type="number" placeholder="Reihenfolge" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) })} />
          <div className="flex gap-2">
            <Button size="sm" onClick={() => saveMutation.mutate(editing)} disabled={saveMutation.isPending}>Speichern</Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>Abbrechen</Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
            <div className="flex items-center gap-3">
              {item.image_url && <img src={item.image_url} alt="" className="w-12 h-8 object-cover rounded" />}
              <span className="font-medium text-sm">{item.title}</span>
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={() => setEditing(item)}>Bearbeiten</Button>
              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteMutation.mutate(item.id)}><Trash2 size={14} /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPortfolio;
