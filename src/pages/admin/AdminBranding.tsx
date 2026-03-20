import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Palette, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useGlobalTheme } from "@/hooks/useGlobalTheme";
import { toast } from "sonner";
import { buildRenderImageUrl } from "@/lib/image";

const GLOBAL_SETTINGS_EDITABLE_COLUMNS = [
  "primary_color_hex",
  "secondary_color_hex",
  "accent_color_hex",
  "font_family",
  "company_name",
  "logo_path",
  "imprint_company",
  "imprint_address",
  "imprint_contact",
  "imprint_legal",
] as const;

const LEGACY_GLOBAL_SETTINGS_COLUMNS = GLOBAL_SETTINGS_EDITABLE_COLUMNS.filter((key) => key !== "accent_color_hex");

const AdminBranding = () => {
  const queryClient = useQueryClient();
  const { settings, rawSettings, isLoading } = useGlobalTheme();
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  const supportsAccentColor = useMemo(
    () => Boolean(rawSettings && Object.prototype.hasOwnProperty.call(rawSettings, "accent_color_hex")),
    [rawSettings],
  );

  const supportedColumns = useMemo(() => {
    if (!rawSettings) return [...LEGACY_GLOBAL_SETTINGS_COLUMNS];

    const liveColumns = GLOBAL_SETTINGS_EDITABLE_COLUMNS.filter((key) => Object.prototype.hasOwnProperty.call(rawSettings, key));
    return liveColumns.length ? liveColumns : [...LEGACY_GLOBAL_SETTINGS_COLUMNS];
  }, [rawSettings]);

  const mutation = useMutation({
    mutationFn: async (values: any) => {
      const rowId = typeof values?.id === "string" && values.id.trim() ? values.id : "default";
      const { id, created_at, updated_at, ...rawData } = values || {};
      void id;
      void created_at;
      void updated_at;

      const payload = supportedColumns.reduce<Record<string, string | null>>((acc, key) => {
        if (key === "font_family") {
          acc[key] = rawData[key] || "default";
        } else {
          acc[key] = rawData[key] ?? null;
        }
        return acc;
      }, {});

      const { data: updatedRows, error: updateError } = await supabase
        .from("global_settings")
        .update(payload)
        .eq("id", rowId)
        .select("id");

      if (updateError) throw updateError;

      if (!updatedRows?.length) {
        const { error: upsertError } = await supabase
          .from("global_settings")
          .upsert({ id: rowId, ...payload }, { onConflict: "id" });

        if (upsertError) throw upsertError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["global_settings"] });
      toast.success(
        supportsAccentColor
          ? "Branding aktualisiert"
          : "Branding aktualisiert. Accent-Farbe wird erst nach DB-Migration gespeichert.",
      );
    },
    onError: (error: any) => {
      const message = String(error?.message || "Speichern fehlgeschlagen");
      toast.error(message.includes("accent_color_hex") ? "Die Live-DB kennt accent_color_hex noch nicht. Migration fehlt." : message);
    },
  });

  const logoPreview = useMemo(() => {
    if (!form.logo_path) return "";
    return String(form.logo_path).startsWith("http") ? form.logo_path : buildRenderImageUrl(form.logo_path, { width: 480, quality: 82 });
  }, [form.logo_path]);

  if (isLoading) return <div className="p-6">Laden...</div>;

  return (
    <div className="p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Branding & Theme</h1>
        <p className="mt-2 text-sm text-slate-500">Brandfarben, Typografie und Impressum zentral steuern. Standardfarben sind Orange #FF4B2C und Blau #0E1F53.</p>
      </div>

      {!supportsAccentColor ? (
        <div className="mb-6 flex items-start gap-3 rounded-[1.3rem] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <div>
            Die Live-DB hat aktuell noch keine <code>accent_color_hex</code>-Spalte in <code>global_settings</code>. Die Akzentfarbe wird lokal gezeigt, aber erst nach der Migration sauber gespeichert.
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
        <section className="glass-card p-6 space-y-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><Palette size={16} className="text-gold-dark" /> Live-Richtung</div>
          <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_26px_60px_-42px_rgba(15,23,42,0.18)]">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl border border-slate-200" style={{ backgroundColor: form.primary_color_hex || '#FF4B2C' }} />
              <div className="h-12 w-12 rounded-2xl border border-slate-200" style={{ backgroundColor: form.secondary_color_hex || '#0E1F53' }} />
              <div className="h-12 w-12 rounded-2xl border border-slate-200" style={{ backgroundColor: form.accent_color_hex || '#0E1F53' }} />
            </div>
            <div className="mt-5 rounded-[1.5rem] p-5 text-white" style={{ backgroundColor: form.secondary_color_hex || "#0E1F53" }}>
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">Preview</div>
              <div className="mt-3 text-2xl font-extrabold tracking-[-0.04em]">{form.company_name || 'Digital-Perfect'}</div>
              <p className="mt-2 text-sm text-slate-300">So wirken die Markenfarben: Orange für CTA und Fokus, Mitternachtsblau für Autorität, Ruhe und Premium-Struktur.</p>
              <div className="mt-4 flex gap-3">
                <span className="inline-flex rounded-full px-4 py-2 text-sm font-semibold" style={{ backgroundColor: form.primary_color_hex || '#FF4B2C', color: '#FFFFFF' }}>CTA Orange</span>
                <span className="inline-flex rounded-full px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: form.accent_color_hex || '#0E1F53' }}>Blau Accent</span>
              </div>
            </div>
            {logoPreview ? (
              <div className="mt-5 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                <img src={logoPreview} alt="Logo Vorschau" className="h-16 w-auto object-contain" />
              </div>
            ) : null}
          </div>
        </section>

        <div className="space-y-6">
          <section className="glass-card p-6 space-y-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><Palette size={16} className="text-gold-dark" /> Farben & Schriften</div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="primary_color_hex">Brand Orange</Label>
                <Input id="primary_color_hex" value={form.primary_color_hex || "#FF4B2C"} placeholder="#FF4B2C" onChange={(event) => setForm({ ...form, primary_color_hex: event.target.value.toUpperCase() })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondary_color_hex">Mitternachtsblau</Label>
                <Input id="secondary_color_hex" value={form.secondary_color_hex || "#0E1F53"} placeholder="#0E1F53" onChange={(event) => setForm({ ...form, secondary_color_hex: event.target.value.toUpperCase() })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accent_color_hex">Accent / Zusatzblau</Label>
                <Input id="accent_color_hex" value={form.accent_color_hex || "#0E1F53"} placeholder="#0E1F53" onChange={(event) => setForm({ ...form, accent_color_hex: event.target.value.toUpperCase() })} />
                {!supportsAccentColor ? <p className="text-xs text-amber-700">Wird lokal gezeigt, aber ohne DB-Migration noch nicht dauerhaft gespeichert.</p> : null}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="font_family">Schriftwahl</Label>
              <select id="font_family" className="border border-input bg-background rounded-md px-3 py-2 text-sm" value={form.font_family || "default"} onChange={(event) => setForm({ ...form, font_family: event.target.value })}>
                <option value="default">Default (Jakarta + Inter)</option>
                <option value="jakarta">Plus Jakarta Sans betont</option>
                <option value="serif">Serif (klassisch)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company_name">Firmenname</Label>
              <Input id="company_name" value={form.company_name || ""} placeholder="Digital-Perfect Premium" onChange={(event) => setForm({ ...form, company_name: event.target.value })} />
            </div>
          </section>

          <section className="glass-card p-6 space-y-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><Type size={16} className="text-gold-dark" /> Logo & Impressum</div>

            <div className="space-y-2">
              <Label htmlFor="logo_path">Logo-Speicherpfad</Label>
              <Input id="logo_path" value={form.logo_path || ""} placeholder="branding/logo.webp" onChange={(event) => setForm({ ...form, logo_path: event.target.value })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imprint_company">Impressum – Firmenzeile</Label>
              <Input id="imprint_company" value={form.imprint_company || ""} onChange={(event) => setForm({ ...form, imprint_company: event.target.value })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imprint_address">Impressum – Adresse</Label>
              <Textarea id="imprint_address" rows={3} value={form.imprint_address || ""} onChange={(event) => setForm({ ...form, imprint_address: event.target.value })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imprint_contact">Impressum – Kontakt</Label>
              <Textarea id="imprint_contact" rows={3} value={form.imprint_contact || ""} onChange={(event) => setForm({ ...form, imprint_contact: event.target.value })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imprint_legal">Impressum – Rechtstext</Label>
              <Textarea id="imprint_legal" rows={4} value={form.imprint_legal || ""} onChange={(event) => setForm({ ...form, imprint_legal: event.target.value })} />
            </div>
          </section>
        </div>
      </div>

      <div className="mt-8">
        <Button onClick={() => mutation.mutate(form)} disabled={mutation.isPending}>
          {mutation.isPending ? "Speichere..." : "Branding & Theme speichern"}
        </Button>
      </div>
    </div>
  );
};

export default AdminBranding;
