import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const AdminHero = () => {
  const qc = useQueryClient();
  const { data: hero, isLoading } = useQuery({
    queryKey: ["hero_content"],
    queryFn: async () => {
      const { data, error } = await supabase.from("hero_content").select("*").limit(1).single();
      if (error) throw error;
      return data;
    },
  });

  const [form, setForm] = useState<any>({});

  useEffect(() => {
    if (hero) setForm(hero);
  }, [hero]);

  const mutation = useMutation({
    mutationFn: async (values: any) => {
      if (!hero?.id) throw new Error("Hero content not loaded");

      const payload = {
        badge_text: values.badge_text ?? null,
        headline: values.headline ?? null,
        subheadline: values.subheadline ?? null,
        cta_text: values.cta_text ?? null,
        stat1_value: values.stat1_value ?? null,
        stat1_label: values.stat1_label ?? null,
        stat2_value: values.stat2_value ?? null,
        stat2_label: values.stat2_label ?? null,
        stat3_value: values.stat3_value ?? null,
        stat3_label: values.stat3_label ?? null,
        ...(hero && typeof hero === "object" && "image_url" in hero
          ? { image_url: values.image_url ?? null }
          : {}),
        ...(hero && typeof hero === "object" && "image_path" in hero
          ? { image_path: values.image_path ?? null }
          : {}),
      };

      const { error } = await supabase.from("hero_content").update(payload).eq("id", hero.id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["hero_content"] }); toast.success("Hero aktualisiert"); },
    onError: () => toast.error("Fehler beim Speichern"),
  });

  if (isLoading) return <div className="p-6">Laden...</div>;

  const fields = [
    { key: "badge_text", label: "Badge-Text" },
    { key: "headline", label: "Hauptüberschrift" },
    { key: "subheadline", label: "Unterüberschrift" },
    { key: "cta_text", label: "CTA-Button Text" },
    { key: "stat1_value", label: "Statistik 1 - Wert" },
    { key: "stat1_label", label: "Statistik 1 - Label" },
    { key: "stat2_value", label: "Statistik 2 - Wert" },
    { key: "stat2_label", label: "Statistik 2 - Label" },
    { key: "stat3_value", label: "Statistik 3 - Wert" },
    { key: "stat3_label", label: "Statistik 3 - Label" },
    ...(hero && typeof hero === "object" && "image_url" in hero
      ? [{ key: "image_url", label: "Hero Bild-Pfad (bucket/datei.jpg)" }]
      : []),
    ...(hero && typeof hero === "object" && "image_path" in hero
      ? [{ key: "image_path", label: "Hero Bild-Pfad (bucket/datei.jpg)" }]
      : []),
  ];

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Hero-Bereich bearbeiten</h1>
      <div className="space-y-4">
        {fields.map((f) => (
          <div key={f.key}>
            <Label>{f.label}</Label>
            <Input value={form[f.key] || ""} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
          </div>
        ))}
        <Button onClick={() => mutation.mutate(form)} disabled={mutation.isPending}>
          {mutation.isPending ? "Speichere..." : "Speichern"}
        </Button>
      </div>
    </div>
  );
};

export default AdminHero;
