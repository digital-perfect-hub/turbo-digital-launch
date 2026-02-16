import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const AdminSEO = () => {
  const qc = useQueryClient();
  const { data: settings = [], isLoading } = useQuery({
    queryKey: ["admin-site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*");
      if (error) throw error;
      return data;
    },
  });

  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    const obj: Record<string, string> = {};
    settings.forEach((s) => { obj[s.key] = s.value || ""; });
    setForm(obj);
  }, [settings]);

  const mutation = useMutation({
    mutationFn: async (values: Record<string, string>) => {
      for (const [key, value] of Object.entries(values)) {
        const { error } = await supabase.from("site_settings").update({ value }).eq("key", key);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-site-settings"] }); toast.success("SEO-Einstellungen gespeichert"); },
    onError: () => toast.error("Fehler"),
  });

  if (isLoading) return <div className="p-6">Laden...</div>;

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">SEO-Einstellungen</h1>
      <div className="space-y-4">
        <div>
          <Label>Meta-Titel</Label>
          <Input value={form.meta_title || ""} onChange={(e) => setForm({ ...form, meta_title: e.target.value })} />
          <p className="text-xs text-muted-foreground mt-1">{(form.meta_title || "").length}/60 Zeichen</p>
        </div>
        <div>
          <Label>Meta-Beschreibung</Label>
          <Textarea value={form.meta_description || ""} onChange={(e) => setForm({ ...form, meta_description: e.target.value })} rows={3} />
          <p className="text-xs text-muted-foreground mt-1">{(form.meta_description || "").length}/160 Zeichen</p>
        </div>
        <div>
          <Label>OG-Image URL</Label>
          <Input value={form.og_image || ""} onChange={(e) => setForm({ ...form, og_image: e.target.value })} />
        </div>
        <Button onClick={() => mutation.mutate(form)} disabled={mutation.isPending}>
          {mutation.isPending ? "Speichere..." : "Speichern"}
        </Button>
      </div>
    </div>
  );
};

export default AdminSEO;
