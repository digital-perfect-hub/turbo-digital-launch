import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";

const AdminProducts = () => {
  const qc = useQueryClient();
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const [editing, setEditing] = useState<any>(null);

  const saveMutation = useMutation({
    mutationFn: async (item: any) => {
      const payload = { title: item.title, description: item.description, image_url: item.image_url, price: parseFloat(item.price), sort_order: item.sort_order, is_active: item.is_active ?? true };
      if (item.id) {
        const { error } = await supabase.from("products").update(payload).eq("id", item.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-products"] }); setEditing(null); toast.success("Gespeichert"); },
    onError: () => toast.error("Fehler"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-products"] }); toast.success("Gelöscht"); },
  });

  if (isLoading) return <div className="p-6">Laden...</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Produkte</h1>
        <Button size="sm" onClick={() => setEditing({ title: "", description: "", image_url: "", price: 0, sort_order: products.length })}><Plus size={16} /> Neu</Button>
      </div>

      {editing && (
        <div className="mb-6 p-4 border border-border rounded-xl bg-card space-y-3">
          <Input placeholder="Titel" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
          <Textarea placeholder="Beschreibung" value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
          <Input placeholder="Bild-URL" value={editing.image_url || ""} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} />
          <Input type="number" step="0.01" placeholder="Preis (€)" value={editing.price ?? 0} onChange={(e) => setEditing({ ...editing, price: e.target.value })} />
          <Input type="number" placeholder="Reihenfolge" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) })} />
          <div className="flex gap-2">
            <Button size="sm" onClick={() => saveMutation.mutate(editing)} disabled={saveMutation.isPending}>Speichern</Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>Abbrechen</Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {products.map((p) => (
          <div key={p.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
            <div className="flex items-center gap-3">
              {p.image_url && <img src={p.image_url} alt="" className="w-12 h-8 object-cover rounded" />}
              <span className="font-medium text-sm">{p.title}</span>
              <span className="text-xs text-primary font-bold">€{Number(p.price).toFixed(2)}</span>
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={() => setEditing(p)}>Bearbeiten</Button>
              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteMutation.mutate(p.id)}><Trash2 size={14} /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminProducts;
