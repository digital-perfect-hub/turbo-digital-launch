import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type GlobalSettingsRow = {
  id: string;
  primary_color_hex: string | null;
  secondary_color_hex: string | null;
  font_family: string | null;
  company_name: string | null;
  logo_path: string | null;
  imprint_company: string | null;
  imprint_address: string | null;
  imprint_contact: string | null;
  imprint_legal: string | null;
};

const AdminBranding = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["global_settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("global_settings" as any).select("*").limit(1).single();
      if (error) throw error;
      return data as GlobalSettingsRow;
    },
  });

  const [form, setForm] = useState<GlobalSettingsRow | null>(null);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const mutation = useMutation({
    mutationFn: async (values: GlobalSettingsRow) => {
      const payload = {
        id: values.id || "default",
        primary_color_hex: values.primary_color_hex,
        secondary_color_hex: values.secondary_color_hex,
        font_family: values.font_family,
        company_name: values.company_name,
        logo_path: values.logo_path,
        imprint_company: values.imprint_company,
        imprint_address: values.imprint_address,
        imprint_contact: values.imprint_contact,
        imprint_legal: values.imprint_legal,
      };

      const { error } = await supabase.from("global_settings" as any).upsert(payload, { onConflict: "id" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["global_settings"] });
      toast.success("Branding & Theme gespeichert");
    },
    onError: () => toast.error("Speichern fehlgeschlagen"),
  });

  if (isLoading || !form) {
    return <div className="p-6">Laden...</div>;
  }

  return (
    <div className="p-6 max-w-5xl">
      <h1 className="text-2xl font-bold mb-2">Branding & Theme</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Hier steuerst du Farben, Logo, Schrift und Impressumsdaten für alle White-Label-Instanzen.
      </p>

      <div className="grid gap-8 md:grid-cols-[1.4fr_1.1fr]">
        <section className="glass-card p-6 space-y-5">
          <h2 className="text-lg font-semibold mb-2">Farben & Schriften</h2>

          <div className="space-y-2">
            <Label htmlFor="primary_color_hex">Primärfarbe (Hex)</Label>
            <div className="flex items-center gap-3">
              <Input
                id="primary_color_hex"
                value={form.primary_color_hex || ""}
                placeholder="#fbbf24"
                onChange={(event) => setForm({ ...form, primary_color_hex: event.target.value })}
              />
              <div
                className="w-10 h-10 rounded-full border border-border"
                style={{ backgroundColor: form.primary_color_hex || "#fbbf24" }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="secondary_color_hex">Sekundärfarbe (Hex)</Label>
            <div className="flex items-center gap-3">
              <Input
                id="secondary_color_hex"
                value={form.secondary_color_hex || ""}
                placeholder="#22c55e"
                onChange={(event) => setForm({ ...form, secondary_color_hex: event.target.value })}
              />
              <div
                className="w-10 h-10 rounded-full border border-border"
                style={{ backgroundColor: form.secondary_color_hex || "#22c55e" }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="font_family">Schriftwahl</Label>
            <select
              id="font_family"
              className="border border-input bg-background rounded-md px-3 py-2 text-sm"
              value={form.font_family || "default"}
              onChange={(event) => setForm({ ...form, font_family: event.target.value })}
            >
              <option value="default">Default (Jakarta + Inter)</option>
              <option value="jakarta">Plus Jakarta Sans betont</option>
              <option value="serif">Serif (klassisch)</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_name">Firmenname</Label>
            <Input
              id="company_name"
              value={form.company_name || ""}
              placeholder="Agenturname GmbH"
              onChange={(event) => setForm({ ...form, company_name: event.target.value })}
            />
          </div>
        </section>

        <section className="glass-card p-6 space-y-5">
          <h2 className="text-lg font-semibold mb-2">Logo & Impressum</h2>

          <div className="space-y-2">
            <Label htmlFor="logo_path">Logo-Speicherpfad</Label>
            <Input
              id="logo_path"
              value={form.logo_path || ""}
              placeholder="assets/logo.png (bucket/object)"
              onChange={(event) => setForm({ ...form, logo_path: event.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Erwartet wird der Storage-Pfad in Supabase: <code>bucket/datei.png</code>. Das Frontend lädt automatisch
              über <code>/render/image/public/&lt;bucket&gt;/&lt;datei&gt;?width=600&amp;quality=80</code>.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imprint_company">Impressum – Firmenzeile</Label>
            <Input
              id="imprint_company"
              value={form.imprint_company || ""}
              onChange={(event) => setForm({ ...form, imprint_company: event.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imprint_address">Impressum – Adresse</Label>
            <Textarea
              id="imprint_address"
              rows={3}
              value={form.imprint_address || ""}
              onChange={(event) => setForm({ ...form, imprint_address: event.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imprint_contact">Impressum – Kontakt</Label>
            <Textarea
              id="imprint_contact"
              rows={3}
              value={form.imprint_contact || ""}
              onChange={(event) => setForm({ ...form, imprint_contact: event.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imprint_legal">Impressum – Rechtstext</Label>
            <Textarea
              id="imprint_legal"
              rows={4}
              value={form.imprint_legal || ""}
              onChange={(event) => setForm({ ...form, imprint_legal: event.target.value })}
            />
          </div>
        </section>
      </div>

      <div className="mt-8">
        <Button
          onClick={() => mutation.mutate(form)}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Speichere..." : "Branding & Theme speichern"}
        </Button>
      </div>
    </div>
  );
};

export default AdminBranding;

