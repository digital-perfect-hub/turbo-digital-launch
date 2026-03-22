import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSiteContext } from "@/context/SiteContext";
import { DEFAULT_SITE_ID } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";

const AdminServices = () => {
  const { activeSiteId } = useSiteContext();
  const siteId = activeSiteId || DEFAULT_SITE_ID;
  const qc = useQueryClient();
  const { data: services = [], isLoading } = useQuery({
    queryKey: ["admin-services"],
    queryFn: async () => {
      const { data, error } = await supabase.from("services").select("*").eq("site_id", siteId).order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const [editing, setEditing] = useState<any>(null);

  const saveMutation = useMutation({
    mutationFn: async (item: any) => {
      if (item.id) {
        const { error } = await supabase.from("services").update({ title: item.title, description: item.description, icon_name: item.icon_name, sort_order: item.sort_order, is_visible: item.is_visible }).eq("id", item.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("services").insert({ site_id: siteId, title: item.title, description: item.description, icon_name: item.icon_name, sort_order: item.sort_order });
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-services"] }); setEditing(null); toast.success("Gespeichert"); },
    onError: () => toast.error("Fehler"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("services").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-services"] }); toast.success("Gelöscht"); },
  });

  if (isLoading) return <div className="p-6">Laden...</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Leistungen</h1>
        <Button size="sm" onClick={() => setEditing({ title: "", description: "", icon_name: "Globe", sort_order: services.length })}><Plus size={16} /> Neu</Button>
      </div>

      {editing && (
        <div className="mb-6 p-4 border border-border rounded-xl bg-card space-y-3">
          <Input placeholder="Titel" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
          <Textarea placeholder="Beschreibung" value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
          <Input placeholder="Icon (z.B. Globe, Search, Star)" value={editing.icon_name} onChange={(e) => setEditing({ ...editing, icon_name: e.target.value })} />
          <Input type="number" placeholder="Reihenfolge" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) })} />
          <div className="flex gap-2">
            <Button size="sm" onClick={() => saveMutation.mutate(editing)} disabled={saveMutation.isPending}>Speichern</Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>Abbrechen</Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {services.map((s) => (
          <div key={s.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
            <div>
              <span className="font-medium text-sm">{s.title}</span>
              <span className="text-xs text-muted-foreground ml-2">({s.icon_name})</span>
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={() => setEditing(s)}>Bearbeiten</Button>
              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteMutation.mutate(s.id)}><Trash2 size={14} /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminServices;
