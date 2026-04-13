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

import ConfirmDeleteDialog from "@/components/admin/ConfirmDeleteDialog";
const AdminFAQ = () => {
  const { activeSiteId } = useSiteContext();
  const siteId = activeSiteId || DEFAULT_SITE_ID;
  const qc = useQueryClient();
  const { data: faqs = [], isLoading } = useQuery({
    queryKey: ["admin-faq"],
    queryFn: async () => {
      const { data, error } = await supabase.from("faq_items").select("*").eq("site_id", siteId).order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const [editing, setEditing] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  const saveMutation = useMutation({
    mutationFn: async (item: any) => {
      const payload = { question: item.question, answer: item.answer, sort_order: item.sort_order, is_visible: item.is_visible ?? true };
      if (item.id) {
        const { error } = await supabase.from("faq_items").update(payload).eq("id", item.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("faq_items").insert({ ...payload, site_id: siteId });
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-faq"] }); setEditing(null); toast.success("Gespeichert"); },
    onError: () => toast.error("Fehler"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("faq_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-faq"] }); toast.success("Gelöscht"); },
  });

  if (isLoading) return <div className="p-6">Laden...</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">FAQ</h1>
        <Button size="sm" onClick={() => setEditing({ question: "", answer: "", sort_order: faqs.length })}><Plus size={16} /> Neu</Button>
      </div>

      {editing && (
        <div className="mb-6 p-4 border border-border rounded-xl bg-card space-y-3">
          <Input placeholder="Frage" value={editing.question} onChange={(e) => setEditing({ ...editing, question: e.target.value })} />
          <Textarea placeholder="Antwort" value={editing.answer} onChange={(e) => setEditing({ ...editing, answer: e.target.value })} rows={4} />
          <Input type="number" placeholder="Reihenfolge" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) })} />
          <div className="flex gap-2">
            <Button size="sm" onClick={() => saveMutation.mutate(editing)} disabled={saveMutation.isPending}>Speichern</Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>Abbrechen</Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {faqs.map((f) => (
          <div key={f.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
            <span className="font-medium text-sm truncate max-w-md">{f.question}</span>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={() => setEditing(f)}>Bearbeiten</Button>
              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDeleteTarget(f)}><Trash2 size={14} /></Button>
            </div>
          </div>
        ))}
      </div>
      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="FAQ-Eintrag löschen?"
        description={deleteTarget ? `Die Frage „${deleteTarget.question}“ wird in Supabase gelöscht.` : ""}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default AdminFAQ;