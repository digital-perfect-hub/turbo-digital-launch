import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Palette, Type, Upload, Image as ImageIcon, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useGlobalTheme } from "@/hooks/useGlobalTheme";
import { toast } from "sonner";
import { buildRawImageUrl } from "@/lib/image";
import { useSiteContext } from "@/context/SiteContext";
import { DEFAULT_SITE_ID } from "@/lib/site";
import { uploadBrandingAsset } from "@/lib/storage";

const GLOBAL_SETTINGS_EDITABLE_COLUMNS = [
  "primary_color_hex", "secondary_color_hex", "accent_color_hex",
  "bg_main_hex", "bg_card_hex", "text_main_hex", "text_muted_hex", 
  "border_color_hex", "border_radius",
  "font_family", "company_name", "logo_path", "use_text_logo", 
  "text_logo_color_hex", "show_logo_dot", "logo_dot_color_hex", "logo_font_family", "cta_hover_hex", "footer_bg_hex",
  "imprint_company", "imprint_address", "imprint_contact", "imprint_legal",
  "loader_heading", "loader_subtext", "loader_bg_hex", "loader_text_hex"
] as const;

const AdminBranding = () => {
  const queryClient = useQueryClient();
  const { activeSiteId } = useSiteContext();
  const siteId = activeSiteId || DEFAULT_SITE_ID;
  const { settings, isLoading } = useGlobalTheme();
  const [form, setForm] = useState<any>({});
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  const mutation = useMutation({
    mutationFn: async (values: any) => {
      const rowId = values?.id?.trim() ? values.id : "default";
      const payload = GLOBAL_SETTINGS_EDITABLE_COLUMNS.reduce<Record<string, any>>((acc, key) => {
        acc[key] = values[key] ?? null;
        return acc;
      }, {});

      const { data: updatedRows, error: updateError } = await supabase
        .from("global_settings")
        .update(payload)
        .eq("site_id", siteId)
        .select("id");

      if (updateError) throw updateError;
      if (!updatedRows?.length) {
        const { error: upsertError } = await supabase
          .from("global_settings")
          .upsert({ id: rowId, site_id: siteId, ...payload }, { onConflict: "site_id" });
        if (upsertError) throw upsertError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["global_settings"] });
      toast.success("Endlevel Branding erfolgreich aktualisiert.");
    },
    onError: (error: any) => toast.error(error?.message || "Speichern fehlgeschlagen."),
  });

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const filePath = await uploadBrandingAsset(file, "logos", siteId);
      setForm({ ...form, logo_path: filePath, use_text_logo: false });
      toast.success("Logo erfolgreich hochgeladen!");
    } catch (error: any) {
      toast.error("Upload fehlgeschlagen: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const logoPreview = form.logo_path ? buildRawImageUrl(form.logo_path, { width: 480, quality: 82 }) : "";

  if (isLoading) return <div className="p-6 text-slate-500 font-medium">Laden...</div>;

  return (
    <div className="p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Branding & Theme</h1>
        <p className="mt-2 text-sm text-slate-500">Volle Kontrolle über Agentur-Identität, Logo und Farben.</p>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1fr_1.1fr]">
        <div className="space-y-8">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3 text-lg font-bold text-slate-900 mb-6">
              <Palette size={24} className="text-[#FF4B2C]" /> Farben & Schriften
            </div>

            <div className="grid gap-5 md:grid-cols-2 mb-6">
              <div className="space-y-2">
                <Label className="text-slate-700">Brand Primary</Label>
                <Input type="color" className="h-12 rounded-xl bg-slate-50 border-slate-200 px-3 cursor-pointer w-full" value={form.primary_color_hex || ""} onChange={(e) => setForm({ ...form, primary_color_hex: e.target.value.toUpperCase() })} />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700">Brand Secondary</Label>
                <Input type="color" className="h-12 rounded-xl bg-slate-50 border-slate-200 px-3 cursor-pointer w-full" value={form.secondary_color_hex || ""} onChange={(e) => setForm({ ...form, secondary_color_hex: e.target.value.toUpperCase() })} />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6 mb-6">
              <Label className="text-base font-bold text-slate-900 mb-4 block">Footer & Buttons</Label>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-slate-700">Footer Background</Label>
                  <Input type="color" className="h-12 rounded-xl bg-slate-50 border-slate-200 px-3 cursor-pointer w-full" value={form.footer_bg_hex || "#020617"} onChange={(e) => setForm({ ...form, footer_bg_hex: e.target.value.toUpperCase() })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700">CTA Hover Farbe</Label>
                  <Input type="color" className="h-12 rounded-xl bg-slate-50 border-slate-200 px-3 cursor-pointer w-full" value={form.cta_hover_hex || "#E03A1E"} onChange={(e) => setForm({ ...form, cta_hover_hex: e.target.value.toUpperCase() })} />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6">
              <Label className="text-base font-bold text-slate-900 mb-4 block">Erweiterte Theme-Steuerung</Label>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-slate-700">Seiten-Hintergrund</Label>
                  <Input className="rounded-xl bg-slate-50 border-slate-200" value={form.bg_main_hex || ""} onChange={(e) => setForm({ ...form, bg_main_hex: e.target.value.toUpperCase() })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700">Boxen/Karten BG</Label>
                  <Input className="rounded-xl bg-slate-50 border-slate-200" value={form.bg_card_hex || ""} onChange={(e) => setForm({ ...form, bg_card_hex: e.target.value.toUpperCase() })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700">Haupt-Textfarbe</Label>
                  <Input className="rounded-xl bg-slate-50 border-slate-200" value={form.text_main_hex || ""} onChange={(e) => setForm({ ...form, text_main_hex: e.target.value.toUpperCase() })} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-slate-700">Rundungen (Radius)</Label>
                  <select className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none" value={form.border_radius || "1rem"} onChange={(e) => setForm({ ...form, border_radius: e.target.value })}>
                    <option value="0.5rem">Leicht rund (0.5rem)</option>
                    <option value="1rem">Modern rund (1rem)</option>
                    <option value="1.5rem">Stark rund (1.5rem)</option>
                    <option value="2rem">Premium rund (2rem)</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* LADEBILDSCHIRM SEKTION */}
          <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3 text-lg font-bold text-slate-900 mb-6">
              <Type size={24} className="text-[#FF4B2C]" /> Ladebildschirm
            </div>
            <p className="text-sm text-slate-500 mb-6">
              Personalisiere den Gatekeeper-Ladebildschirm, den deine Besucher beim Aufrufen sehen.
            </p>
            <div className="grid gap-5 md:grid-cols-2 mb-6">
              <div className="space-y-2">
                <Label className="text-slate-700 font-bold">Lade-Titel</Label>
                <Input
                  value={form.loader_heading || ""}
                  onChange={(e) => setForm({ ...form, loader_heading: e.target.value })}
                  placeholder="DIGITAL-PERFECT"
                  className="rounded-xl border-slate-200 bg-slate-50 focus:bg-white h-12"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-bold">Subtext</Label>
                <Input
                  value={form.loader_subtext || ""}
                  onChange={(e) => setForm({ ...form, loader_subtext: e.target.value })}
                  placeholder="System wird geladen..."
                  className="rounded-xl border-slate-200 bg-slate-50 focus:bg-white h-12"
                />
              </div>
            </div>
            <div className="grid gap-5 md:grid-cols-2 pt-6 border-t border-slate-100">
              <div className="space-y-2">
                <Label className="text-slate-700 font-bold">Hintergrundfarbe</Label>
                <Input type="color" className="h-12 rounded-xl bg-slate-50 border-slate-200 px-3 cursor-pointer w-full" value={form.loader_bg_hex || "#0F172A"} onChange={(e) => setForm({ ...form, loader_bg_hex: e.target.value.toUpperCase() })} />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-bold">Textfarbe (Animation)</Label>
                <Input type="color" className="h-12 rounded-xl bg-slate-50 border-slate-200 px-3 cursor-pointer w-full" value={form.loader_text_hex || "#FFFFFF"} onChange={(e) => setForm({ ...form, loader_text_hex: e.target.value.toUpperCase() })} />
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3 text-lg font-bold text-slate-900 mb-6">
              <Type size={24} className="text-[#FF4B2C]" /> Identität & Logo
            </div>

            <div className="space-y-4 mb-8">
              <Label className="text-slate-700">Firmenname</Label>
              <Input className="rounded-xl bg-slate-50 border-slate-200 text-lg font-bold h-12" value={form.company_name || ""} onChange={(e) => setForm({ ...form, company_name: e.target.value })} />
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <Label className="text-base font-bold text-slate-900">Logo-Darstellung</Label>
                  <p className="text-sm text-slate-500 mt-1">Was soll gerendert werden?</p>
                </div>
                <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                  <span className={`text-sm font-bold ${!form.use_text_logo ? 'text-[#FF4B2C]' : 'text-slate-400'}`}>Bild</span>
                  <Switch checked={form.use_text_logo || false} onCheckedChange={(c) => setForm({ ...form, use_text_logo: c })} className="data-[state=checked]:bg-[#FF4B2C]" />
                  <span className={`text-sm font-bold ${form.use_text_logo ? 'text-[#FF4B2C]' : 'text-slate-400'}`}>Text</span>
                </div>
              </div>

              {!form.use_text_logo ? (
                <div className="pt-5 border-t border-slate-200">
                  <Label className="text-slate-700 mb-3 block">Logo hochladen</Label>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                    {logoPreview ? (
                      <div className="relative h-20 w-40 shrink-0 rounded-xl border border-slate-200 bg-white p-3 shadow-sm flex items-center justify-center">
                        <img src={logoPreview} alt="Logo" className="max-h-full max-w-full object-contain" />
                      </div>
                    ) : (
                      <div className="flex h-20 w-40 shrink-0 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-100 text-slate-400"><ImageIcon size={24} /></div>
                    )}
                    <div>
                      <Label htmlFor="logo-upload" className="cursor-pointer inline-flex items-center justify-center rounded-xl bg-white border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:border-[#FF4B2C] hover:text-[#FF4B2C] transition-all">
                        {isUploading ? "Lädt..." : <><Upload size={16} className="mr-2" /> Bild wählen</>}
                      </Label>
                      <input id="logo-upload" type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={isUploading} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="pt-5 border-t border-slate-200">
                  <Label className="text-slate-700 mb-4 block text-base font-bold">Text-Logo Einstellungen</Label>
                  
                  <div className="grid gap-4 md:grid-cols-2 mb-4">
                    <div className="space-y-2">
                      <Label className="text-slate-600 text-xs uppercase tracking-wider">Logo Typografie</Label>
                      <select className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none" value={form.logo_font_family || "default"} onChange={(e) => setForm({ ...form, logo_font_family: e.target.value })}>
                        <option value="default">Standard (Sans-Serif)</option>
                        <option value="serif">Edel (Serif)</option>
                        <option value="mono">Tech (Monospace)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-600 text-xs uppercase tracking-wider">Schriftfarbe</Label>
                      <Input type="color" className="h-[46px] rounded-xl bg-white border-slate-200 px-3 cursor-pointer w-full" value={form.text_logo_color_hex || "#0F172A"} onChange={(e) => setForm({ ...form, text_logo_color_hex: e.target.value.toUpperCase() })} />
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between mb-4">
                      <Label className="text-slate-700 font-bold">Punkt am Ende anzeigen?</Label>
                      <Switch checked={form.show_logo_dot !== false} onCheckedChange={(c) => setForm({ ...form, show_logo_dot: c })} className="data-[state=checked]:bg-[#FF4B2C]" />
                    </div>
                    
                    {form.show_logo_dot !== false && (
                      <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                        <Label className="text-slate-600 text-xs uppercase tracking-wider w-24">Farbe für Punkt</Label>
                        <Input type="color" className="h-10 w-full rounded-xl bg-white border-slate-200 px-3 cursor-pointer" value={form.logo_dot_color_hex || form.primary_color_hex || "#FF4B2C"} onChange={(e) => setForm({ ...form, logo_dot_color_hex: e.target.value.toUpperCase() })} />
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>
          </section>

          {/* HAUPT THEME LIVE-VORSCHAU */}
          <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
             <div className="flex items-center gap-3 text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">
              Live-Vorschau (Main)
            </div>
            <div className="rounded-[1.5rem] p-8 text-white shadow-xl relative overflow-hidden" style={{ backgroundColor: form.footer_bg_hex || form.secondary_color_hex || "#0E1F53" }}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_50%)] pointer-events-none" />
              <div className="relative z-10">
                <div className="mb-6">
                  {form.use_text_logo ? (
                    <div className={`text-4xl font-black tracking-tighter ${form.logo_font_family === 'serif' ? 'font-serif' : form.logo_font_family === 'mono' ? 'font-mono' : ''}`} style={{ color: form.text_logo_color_hex || '#FFFFFF' }}>
                      {form.company_name || 'Digital-Perfect'}
                      {form.show_logo_dot !== false && (
                        <span style={{ color: form.logo_dot_color_hex || form.primary_color_hex || '#FF4B2C' }}>.</span>
                      )}
                    </div>
                  ) : (
                    logoPreview ? <img src={logoPreview} alt="Logo" className="h-8 w-auto object-contain brightness-0 invert" /> : <div className="text-xl font-bold">LOGO</div>
                  )}
                </div>
                <div className="flex gap-3 mt-8">
                  <span className="inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-bold shadow-md transition-colors" style={{ backgroundColor: form.primary_color_hex || '#FF4B2C', color: '#FFFFFF' }}>
                    <CheckCircle2 size={16} /> Beispiel CTA
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* LOADER LIVE-VORSCHAU */}
          <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
             <div className="flex items-center gap-3 text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">
              Ladebildschirm Vorschau
            </div>
            <div 
              className="rounded-[1.5rem] p-12 shadow-xl relative overflow-hidden flex flex-col items-center justify-center min-h-[300px]" 
              style={{ backgroundColor: form.loader_bg_hex || "#0f172a", color: form.loader_text_hex || "#ffffff" }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-white/5 rounded-full blur-[60px] pointer-events-none" />
              <div className="relative z-10 flex flex-col items-center gap-6">
                <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 bg-white/10 rounded-full blur-xl animate-pulse" />
                    <Loader2 className="w-12 h-12 animate-spin relative z-10 opacity-70" />
                    <div className="absolute inset-0 flex items-center justify-center z-20 font-bold text-xs tracking-tighter">
                      87%
                    </div>
                </div>
                <div className="flex flex-col items-center gap-2 text-center">
                    <h2 className="text-lg font-display font-black tracking-widest uppercase">
                      {form.loader_heading || "DIGITAL-PERFECT"}
                    </h2>
                    <p className="text-[10px] uppercase tracking-[0.2em] opacity-60 animate-pulse">
                      {form.loader_subtext || "System wird geladen..."}
                    </p>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>

      <div className="mt-8 border-t border-slate-200 pt-8 flex items-center justify-end">
        <Button onClick={() => mutation.mutate(form)} disabled={mutation.isPending} className="rounded-xl bg-[#FF4B2C] hover:bg-[#E03A1E] text-white px-8 py-6 text-lg font-bold shadow-[0_10px_30px_-10px_rgba(255,75,44,0.5)] transition-all hover:scale-105">
          {mutation.isPending ? "Speichere..." : "Branding & Theme speichern"}
        </Button>
      </div>
    </div>
  );
};

export default AdminBranding;