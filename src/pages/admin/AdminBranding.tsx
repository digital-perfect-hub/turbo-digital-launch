import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Palette, Type } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useGlobalTheme } from "@/hooks/useGlobalTheme";
import { applyThemeToRoot } from "@/lib/theme-settings";
import { buildRenderImageUrl } from "@/lib/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ColorFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
};

const GLOBAL_SETTINGS_EDITABLE_COLUMNS = [
  "primary_color_hex",
  "secondary_color_hex",
  "accent_color_hex",
  "font_family",
  "heading_font_family",
  "body_font_family",
  "company_name",
  "logo_path",
  "imprint_company",
  "imprint_address",
  "imprint_contact",
  "imprint_legal",
  "bg_main_hex",
  "bg_card_hex",
  "text_main_hex",
  "text_muted_hex",
  "border_color_hex",
  "border_radius",
] as const;

const fontOptions = [
  { value: "default", label: "Default (Jakarta + Inter)" },
  { value: "jakarta", label: "Plus Jakarta Sans" },
  { value: "inter", label: "Inter" },
  { value: "serif", label: "Serif" },
] as const;

const normalizeHexInput = (value: string) => value.toUpperCase();

const ColorField = ({ id, label, value, onChange, hint }: ColorFieldProps) => {
  const safeValue = value?.trim() || "#FFFFFF";

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-3">
        <Input
          id={id}
          type="color"
          value={safeValue}
          onChange={(event) => onChange(normalizeHexInput(event.target.value))}
          className="h-11 w-16 cursor-pointer rounded-xl p-1"
        />
        <Input
          value={value}
          placeholder="#FFFFFF"
          onChange={(event) => onChange(normalizeHexInput(event.target.value))}
          className="font-mono"
        />
      </div>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
};

const AdminBranding = () => {
  const queryClient = useQueryClient();
  const { settings, rawSettings, isLoading } = useGlobalTheme();
  const [form, setForm] = useState<Record<string, any>>({});

  useEffect(() => {
    if (settings) setForm(settings as unknown as Record<string, any>);
  }, [settings]);

  useEffect(() => {
    if (!Object.keys(form).length) return;
    applyThemeToRoot(form);
  }, [form]);

  useEffect(() => () => applyThemeToRoot(settings), [settings]);

  const supportedColumns = useMemo(() => {
    if (!rawSettings) return [...GLOBAL_SETTINGS_EDITABLE_COLUMNS];
    return GLOBAL_SETTINGS_EDITABLE_COLUMNS.filter((key) => Object.prototype.hasOwnProperty.call(rawSettings, key));
  }, [rawSettings]);

  const mutation = useMutation({
    mutationFn: async (values: Record<string, any>) => {
      const rowId = typeof values?.id === "string" && values.id.trim() ? values.id : "default";
      const payload = supportedColumns.reduce<Record<string, string | null>>((acc, key) => {
        const value = values[key];
        acc[key] = value === "" ? null : value ?? null;
        return acc;
      }, {});

      const { data: updatedRows, error: updateError } = await supabase
        .from("global_settings")
        .update(payload)
        .eq("id", rowId)
        .select("id");

      if (updateError) throw updateError;

      if (!updatedRows?.length) {
        const { error: upsertError } = await supabase.from("global_settings").upsert({ id: rowId, ...payload }, { onConflict: "id" });
        if (upsertError) throw upsertError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["global_settings"] });
      toast.success("Branding & Theme gespeichert");
    },
    onError: (error: Error) => toast.error(error.message || "Speichern fehlgeschlagen"),
  });

  const logoPreview = useMemo(() => {
    if (!form.logo_path) return "";
    return buildRenderImageUrl(form.logo_path, { width: 480, quality: 82 });
  }, [form.logo_path]);

  const previewHeadingFont = useMemo(() => {
    const choice = form.heading_font_family || form.font_family || "jakarta";
    if (choice === "inter") return 'Inter, system-ui, sans-serif';
    if (choice === "serif") return 'Georgia, "Times New Roman", serif';
    return '"Plus Jakarta Sans", Inter, system-ui, sans-serif';
  }, [form.font_family, form.heading_font_family]);

  const previewBodyFont = useMemo(() => {
    const choice = form.body_font_family || (form.font_family === "serif" ? "serif" : "inter");
    if (choice === "serif") return 'Georgia, "Times New Roman", serif';
    if (choice === "jakarta") return '"Plus Jakarta Sans", Inter, system-ui, sans-serif';
    return 'Inter, system-ui, sans-serif';
  }, [form.body_font_family, form.font_family]);

  if (isLoading) return <div className="p-6">Laden...</div>;

  return (
    <div className="max-w-7xl p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Branding & Theme</h1>
        <p className="mt-2 text-sm text-slate-500">
          Granulare Basisfarben, Border-Radius und Typografie werden jetzt direkt aus <code>global_settings</code> gelesen und live als CSS-Variablen auf Root-Ebene gespiegelt.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <section className="glass-card space-y-5 p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><Palette size={16} className="text-gold-dark" /> Live-Vorschau</div>

          <div className="rounded-[1.8rem] border p-5 shadow-[0_26px_60px_-42px_rgba(15,23,42,0.18)]" style={{ background: form.bg_main_hex || "#FFFFFF", borderColor: form.border_color_hex || "#E2E8F0", borderRadius: form.border_radius || "0.5rem" }}>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl border" style={{ backgroundColor: form.primary_color_hex || "#FF4B2C", borderColor: form.border_color_hex || "#E2E8F0" }} />
              <div className="h-12 w-12 rounded-2xl border" style={{ backgroundColor: form.secondary_color_hex || "#0E1F53", borderColor: form.border_color_hex || "#E2E8F0" }} />
              <div className="h-12 w-12 rounded-2xl border" style={{ backgroundColor: form.accent_color_hex || "#0E1F53", borderColor: form.border_color_hex || "#E2E8F0" }} />
            </div>

            <div className="mt-5 rounded-[1.5rem] border p-5" style={{ background: form.bg_card_hex || "#F8FAFC", borderColor: form.border_color_hex || "#E2E8F0", borderRadius: form.border_radius || "0.5rem" }}>
              <div className="text-xs font-semibold uppercase tracking-[0.24em]" style={{ color: form.text_muted_hex || "#64748B", fontFamily: previewBodyFont }}>Preview</div>
              <div className="mt-3 text-2xl font-extrabold tracking-[-0.04em]" style={{ color: form.text_main_hex || "#0F172A", fontFamily: previewHeadingFont }}>
                {form.company_name || "Digital-Perfect Premium"}
              </div>
              <p className="mt-2 text-sm" style={{ color: form.text_muted_hex || "#64748B", fontFamily: previewBodyFont }}>
                Änderungen an Farben, Radius und Fonts greifen sofort als Live-Preview. Genau diese Werte landen danach in den Root-CSS-Variablen der App.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <span className="inline-flex rounded-full px-4 py-2 text-sm font-semibold" style={{ backgroundColor: form.primary_color_hex || "#FF4B2C", color: "#FFFFFF", borderRadius: form.border_radius || "0.5rem", fontFamily: previewBodyFont }}>CTA</span>
                <span className="inline-flex rounded-full px-4 py-2 text-sm font-semibold" style={{ backgroundColor: form.bg_main_hex || "#FFFFFF", color: form.text_main_hex || "#0F172A", border: `1px solid ${form.border_color_hex || "#E2E8F0"}`, borderRadius: form.border_radius || "0.5rem", fontFamily: previewBodyFont }}>Surface</span>
              </div>
            </div>

            {logoPreview ? (
              <div className="mt-5 rounded-[1.5rem] border p-4" style={{ background: form.bg_card_hex || "#F8FAFC", borderColor: form.border_color_hex || "#E2E8F0", borderRadius: form.border_radius || "0.5rem" }}>
                <img src={logoPreview} alt="Logo Vorschau" className="h-16 w-auto object-contain" />
              </div>
            ) : null}
          </div>
        </section>

        <div className="space-y-6">
          <section className="glass-card space-y-5 p-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><Palette size={16} className="text-gold-dark" /> Brand & Basisflächen</div>

            <div className="grid gap-4 md:grid-cols-2">
              <ColorField id="primary_color_hex" label="Brand Orange" value={form.primary_color_hex || "#FF4B2C"} onChange={(value) => setForm({ ...form, primary_color_hex: value })} />
              <ColorField id="secondary_color_hex" label="Mitternachtsblau" value={form.secondary_color_hex || "#0E1F53"} onChange={(value) => setForm({ ...form, secondary_color_hex: value })} />
              <ColorField id="accent_color_hex" label="Accent Farbe" value={form.accent_color_hex || "#0E1F53"} onChange={(value) => setForm({ ...form, accent_color_hex: value })} />
              <ColorField id="bg_main_hex" label="Haupt-Hintergrund" value={form.bg_main_hex || "#FFFFFF"} onChange={(value) => setForm({ ...form, bg_main_hex: value })} />
              <ColorField id="bg_card_hex" label="Card-Hintergrund" value={form.bg_card_hex || "#F8FAFC"} onChange={(value) => setForm({ ...form, bg_card_hex: value })} />
              <ColorField id="border_color_hex" label="Border-Farbe" value={form.border_color_hex || "#E2E8F0"} onChange={(value) => setForm({ ...form, border_color_hex: value })} />
              <ColorField id="text_main_hex" label="Haupttext" value={form.text_main_hex || "#0F172A"} onChange={(value) => setForm({ ...form, text_main_hex: value })} />
              <ColorField id="text_muted_hex" label="Muted Text" value={form.text_muted_hex || "#64748B"} onChange={(value) => setForm({ ...form, text_muted_hex: value })} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="border_radius">Border Radius</Label>
                <Input id="border_radius" value={form.border_radius || "0.5rem"} placeholder="0.5rem" onChange={(event) => setForm({ ...form, border_radius: event.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company_name">Firmenname</Label>
                <Input id="company_name" value={form.company_name || ""} placeholder="Digital-Perfect Premium" onChange={(event) => setForm({ ...form, company_name: event.target.value })} />
              </div>
            </div>
          </section>

          <section className="glass-card space-y-5 p-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><Type size={16} className="text-gold-dark" /> Typografie, Logo & Impressum</div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="font_family">Font-Preset</Label>
                <select id="font_family" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.font_family || "default"} onChange={(event) => setForm({ ...form, font_family: event.target.value })}>
                  {fontOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="heading_font_family">Heading Font</Label>
                <select id="heading_font_family" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.heading_font_family || "jakarta"} onChange={(event) => setForm({ ...form, heading_font_family: event.target.value })}>
                  {fontOptions.filter((option) => option.value !== "default").map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="body_font_family">Body Font</Label>
                <select id="body_font_family" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.body_font_family || "inter"} onChange={(event) => setForm({ ...form, body_font_family: event.target.value })}>
                  {fontOptions.filter((option) => option.value !== "default").map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </div>
            </div>

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

      <div className="mt-8 flex gap-3">
        <Button onClick={() => mutation.mutate(form)} disabled={mutation.isPending}>
          {mutation.isPending ? "Speichere..." : "Branding & Theme speichern"}
        </Button>
        <Button variant="ghost" onClick={() => setForm(settings as unknown as Record<string, any>)}>
          Auf DB-Werte zurücksetzen
        </Button>
      </div>
    </div>
  );
};

export default AdminBranding;
