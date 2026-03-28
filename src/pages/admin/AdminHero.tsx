import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ImagePlus, Layers3, Sparkles, LayoutTemplate, Type, ImageIcon, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { buildRawImageUrl } from "@/lib/image";
import heroFallback from "@/assets/hero-bg.jpg";
import { useSiteContext } from "@/context/SiteContext";
import { DEFAULT_SITE_ID } from "@/lib/site";

type HeroForm = Record<string, any>;

const HERO_EDITABLE_COLUMNS = [
  "badge_text",
  "headline",
  "subheadline",
  "cta_text",
  "stat1_value",
  "stat1_label",
  "stat2_value",
  "stat2_label",
  "stat3_value",
  "stat3_label",
  "image_path",
  "background_image_path",
  "background_mobile_image_path",
  "overlay_opacity",
  "visual_kicker",
  "visual_title",
  "visual_badge",
  "layer_kicker",
  "layer_title",
  "show_bottom_box1",
  "bottom_box1_kicker",
  "bottom_box1_title",
  "show_bottom_box2",
  "bottom_box2_kicker",
  "bottom_box2_title",
] as const;

const LEGACY_HERO_COLUMNS = HERO_EDITABLE_COLUMNS.filter(
  (key) => ![
    "background_image_path", "background_mobile_image_path", "overlay_opacity",
    "visual_kicker", "visual_title", "visual_badge", "layer_kicker", "layer_title",
    "show_bottom_box1", "bottom_box1_kicker", "bottom_box1_title",
    "show_bottom_box2", "bottom_box2_kicker", "bottom_box2_title"
  ].includes(key),
);

const AdminHero = () => {
  const qc = useQueryClient();
  const { activeSiteId } = useSiteContext();
  const siteId = activeSiteId || DEFAULT_SITE_ID;
  const { data: hero, isLoading } = useQuery({
    queryKey: ["hero_content", siteId],
    queryFn: async () => {
      const { data, error } = await supabase.from("hero_content").select("*").eq("site_id", siteId).limit(1).maybeSingle();
      if (error) throw error;
      return data ?? null;
    },
  });

  const [form, setForm] = useState<HeroForm>({});

  useEffect(() => {
    setForm(hero || {});
  }, [hero]);

  const supportsExtendedHero = useMemo(
    () => Boolean(hero && Object.prototype.hasOwnProperty.call(hero, "background_image_path")),
    [hero],
  );

  const supportedColumns = useMemo(() => {
    if (!hero) return [...HERO_EDITABLE_COLUMNS];

    const liveColumns = HERO_EDITABLE_COLUMNS.filter((key) => Object.prototype.hasOwnProperty.call(hero, key));
    return liveColumns.length ? liveColumns : [...LEGACY_HERO_COLUMNS];
  }, [hero]);

  const mutation = useMutation({
    mutationFn: async (values: HeroForm) => {
      const { id, created_at, updated_at, ...rawData } = values || {};
      void id;
      void created_at;
      void updated_at;

      const payload = supportedColumns.reduce<Record<string, any>>((acc, key) => {
        if (key === "overlay_opacity") {
          const numeric = Number(rawData[key]);
          acc[key] = Number.isFinite(numeric) ? Math.max(0, Math.min(100, numeric)) : 58;
        } else {
          acc[key] = rawData[key] ?? null;
        }
        return acc;
      }, {});

      if (hero?.id) {
        const { error } = await supabase
          .from("hero_content")
          .update(payload)
          .eq("site_id", siteId)
          .eq("id", hero.id);

        if (error) throw error;
        return;
      }

      const { error: insertError } = await supabase
        .from("hero_content")
        .insert({ site_id: siteId, ...payload })
        .select("id")
        .limit(1);

      if (!insertError) return;

      const fallbackPayload = LEGACY_HERO_COLUMNS.reduce<Record<string, any>>((acc, key) => {
        acc[key] = payload[key] ?? null;
        return acc;
      }, {});

      const { error: legacyInsertError } = await supabase
        .from("hero_content")
        .insert({ site_id: siteId, ...fallbackPayload })
        .select("id")
        .limit(1);

      if (legacyInsertError) throw legacyInsertError;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hero_content"] });
      toast.success(supportsExtendedHero ? "Hero aktualisiert" : "Hero aktualisiert. Erweiterte Felder werden erst nach DB-Migration gespeichert.");
    },
    onError: (error: any) => {
      const message = String(error?.message || "Fehler beim Speichern");
      toast.error(message);
    },
  });

  const resolveStorageImage = (value?: string | null) => {
    const trimmed = String(value || "").trim();
    if (!trimmed) return heroFallback;
    // Architektur-Fix: Kompromissloser Wechsel auf die Raw-URL für 100% Funktionalität ohne Render-API
    return buildRawImageUrl(trimmed);
  };

  const heroVisualPreview = resolveStorageImage(form.image_path);
  const heroBackgroundPreview = resolveStorageImage(form.background_image_path);
  const overlayOpacity = Number.isFinite(Number(form.overlay_opacity)) ? Math.max(0, Math.min(100, Number(form.overlay_opacity))) : 58;

  if (isLoading) return <div className="p-6">Laden...</div>;

  return (
    <div className="max-w-7xl p-6 md:p-8 lg:p-10">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Hero-Bereich bearbeiten</h1>
          <p className="mt-2 text-sm text-slate-500">Großer Hero-Hintergrund, Visual-Card, Overlay und Kennzahlen zentral pflegen.</p>
        </div>
        <Button onClick={() => mutation.mutate(form)} disabled={mutation.isPending} className="rounded-xl bg-[#FF4B2C] hover:bg-[#E03A1E] text-white px-6 py-5 shadow-md shadow-[#FF4B2C]/20 transition-transform hover:scale-105">
          {mutation.isPending ? "Speichere..." : "Hero speichern"}
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        
        {/* LINKE SPALTE: DEINE LIVE-VORSCHAU (KOMPLETT UNANGETASTET) */}
        <section className="admin-surface-card overflow-hidden p-4 md:p-5 self-start sticky top-6">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <ImagePlus size={16} className="text-gold-dark" /> Live-Vorschau
          </div>
          <div className="relative overflow-hidden rounded-[1.7rem] border border-slate-200 bg-slate-950">
            <img src={heroBackgroundPreview} alt="Hero Hintergrund Vorschau" className="h-[430px] w-full object-cover" />
            <div className="absolute inset-0" style={{ background: `rgba(6,13,36,${overlayOpacity / 100})` }} />

            <div className="absolute inset-x-0 bottom-0 p-5 text-white">
              <div className="mb-4 inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200">
                {form.badge_text || "Premium Hero"}
              </div>
              <h2 className="max-w-[22rem] text-3xl font-extrabold leading-[0.95] tracking-[-0.04em] text-white">
                {form.headline || "Webdesign, SEO & Vertriebsseiten mit Wirkung"}
              </h2>
              <p className="mt-3 max-w-[25rem] text-sm leading-relaxed text-slate-200">{form.subheadline || "Hier siehst du live, wie Hintergrundbild, Overlay und Inhalte zusammenspielen."}</p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="overflow-hidden rounded-[1.35rem] border border-white/12 bg-slate-950/55 backdrop-blur-xl">
                  <img src={heroVisualPreview} alt="Visual Vorschau" className="h-32 w-full object-cover" />
                </div>
                <div className="grid gap-3">
                  {[1, 2, 3].map((nr) => (
                    <div key={nr} className="rounded-[1.1rem] border border-white/12 bg-white/8 px-4 py-3 backdrop-blur-xl">
                      <div className="text-lg font-bold">{form[`stat${nr}_value`] || `0${nr}`}</div>
                      <div className="text-xs text-slate-300">{form[`stat${nr}_label`] || `Stat ${nr}`}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {!supportsExtendedHero ? (
            <div className="mt-4 flex items-start gap-3 rounded-[1.3rem] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <AlertTriangle size={18} className="mt-0.5 shrink-0" />
              <div>
                Die Live-DB kennt die neuen Hero-Felder noch nicht. Spiele zuerst die Migration ein, damit <code>background_image_path</code>, <code>background_mobile_image_path</code> und <code>overlay_opacity</code> gespeichert werden.
              </div>
            </div>
          ) : null}
        </section>

        {/* RECHTE SPALTE: DAS NEUE TAB-SYSTEM */}
        <section className="admin-surface-card p-6">
          <Tabs defaultValue="texte" className="w-full">
            <TabsList className="admin-tabs-shell grid w-full grid-cols-4 gap-1 rounded-xl p-1 mb-6">
              <TabsTrigger value="texte" className="rounded-lg py-2.5 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-[#FF4B2C] data-[state=active]:shadow-sm transition-all"><Type size={14} className="mr-1.5 hidden sm:inline-block"/> Texte</TabsTrigger>
              <TabsTrigger value="medien" className="rounded-lg py-2.5 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-[#FF4B2C] data-[state=active]:shadow-sm transition-all"><ImageIcon size={14} className="mr-1.5 hidden sm:inline-block"/> Medien</TabsTrigger>
              <TabsTrigger value="stats" className="rounded-lg py-2.5 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-[#FF4B2C] data-[state=active]:shadow-sm transition-all"><Layers3 size={14} className="mr-1.5 hidden sm:inline-block"/> KPIs</TabsTrigger>
              <TabsTrigger value="layer" className="rounded-lg py-2.5 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-[#FF4B2C] data-[state=active]:shadow-sm transition-all"><LayoutTemplate size={14} className="mr-1.5 hidden sm:inline-block"/> Layer</TabsTrigger>
            </TabsList>
            
            {/* TAB 1: TEXTE */}
            <TabsContent value="texte" className="space-y-5 mt-0 outline-none">
              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold">Badge-Text</Label>
                <Input className="rounded-xl border-slate-200 bg-white focus:border-[#FF4B2C]" value={form.badge_text || ""} onChange={(e) => setForm({ ...form, badge_text: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold">Hauptüberschrift</Label>
                <Textarea rows={4} className="rounded-xl border-slate-200 bg-white focus:border-[#FF4B2C] resize-none" value={form.headline || ""} onChange={(e) => setForm({ ...form, headline: e.target.value })} />
                <p className="text-xs text-slate-500">Zeilenumbrüche sind erlaubt und werden im Hero sauber übernommen.</p>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold">Unterüberschrift</Label>
                <Textarea rows={4} className="rounded-xl border-slate-200 bg-white focus:border-[#FF4B2C] resize-none" value={form.subheadline || ""} onChange={(e) => setForm({ ...form, subheadline: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold">CTA-Button Text</Label>
                <Input className="rounded-xl border-slate-200 bg-white focus:border-[#FF4B2C]" value={form.cta_text || ""} onChange={(e) => setForm({ ...form, cta_text: e.target.value })} />
              </div>
            </TabsContent>

            {/* TAB 2: MEDIEN */}
            <TabsContent value="medien" className="space-y-5 mt-0 outline-none">
              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold">Hero-Hintergrund Desktop (URL/Pfad)</Label>
                <Input className="rounded-xl border-slate-200 bg-white focus:border-[#FF4B2C]" value={form.background_image_path || ""} onChange={(e) => setForm({ ...form, background_image_path: e.target.value })} placeholder="hero/background-desktop.webp" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold">Hero-Hintergrund Mobile (URL/Pfad)</Label>
                <Input className="rounded-xl border-slate-200 bg-white focus:border-[#FF4B2C]" value={form.background_mobile_image_path || ""} onChange={(e) => setForm({ ...form, background_mobile_image_path: e.target.value })} placeholder="hero/background-mobile.webp" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold">Rechtes Hero-Visual (URL/Pfad)</Label>
                <Input className="rounded-xl border-slate-200 bg-white focus:border-[#FF4B2C]" value={form.image_path || ""} onChange={(e) => setForm({ ...form, image_path: e.target.value })} placeholder="hero/digital-perfect-visual.webp" />
              </div>
              <div className="space-y-2 border-t border-slate-200 pt-4">
                <Label className="text-slate-700 font-semibold">Overlay-Stärke ({overlayOpacity}%)</Label>
                <input
                  type="range" min={0} max={100} step={1} value={overlayOpacity}
                  onChange={(e) => setForm({ ...form, overlay_opacity: Number(e.target.value) })}
                  className="w-full accent-[#FF4B2C] cursor-pointer"
                />
              </div>
            </TabsContent>

            {/* TAB 3: KPIs */}
            <TabsContent value="stats" className="space-y-4 mt-0 outline-none">
              {[1, 2, 3].map((nr) => (
                <div key={nr} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                    Statistik {nr}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label className="text-xs text-slate-500 mb-1 block">Wert (z.B. 98%)</Label>
                      <Input className="rounded-xl border-slate-200 bg-white" value={form[`stat${nr}_value`] || ""} onChange={(e) => setForm({ ...form, [`stat${nr}_value`]: e.target.value })} />
                    </div>
                    <div>
                      <Label className="text-xs text-slate-500 mb-1 block">Label (z.B. Fokus)</Label>
                      <Input className="rounded-xl border-slate-200 bg-white" value={form[`stat${nr}_label`] || ""} onChange={(e) => setForm({ ...form, [`stat${nr}_label`]: e.target.value })} />
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>

            {/* TAB 4: LAYER & BOXEN */}
            <TabsContent value="layer" className="space-y-6 mt-0 outline-none">
              
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                <Label className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-2 block">Oberer Bereich (Visual Kicker)</Label>
                <div className="space-y-2">
                  <Label className="text-xs text-slate-500">Kicker</Label>
                  <Input className="rounded-xl bg-white border-slate-200 h-9" value={form.visual_kicker || ""} onChange={(e) => setForm({...form, visual_kicker: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-slate-500">Beschreibungstext</Label>
                  <Textarea rows={2} className="rounded-xl bg-white border-slate-200 resize-none text-sm" value={form.visual_title || ""} onChange={(e) => setForm({...form, visual_title: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-slate-500">Badge rechts</Label>
                  <Input className="rounded-xl bg-white border-slate-200 h-9" value={form.visual_badge || ""} onChange={(e) => setForm({...form, visual_badge: e.target.value})} />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                <Label className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-2 block">Innerer Layer (Auf Bild oben links)</Label>
                <div className="space-y-2">
                  <Label className="text-xs text-slate-500">Kicker</Label>
                  <Input className="rounded-xl bg-white border-slate-200 h-9" value={form.layer_kicker || ""} onChange={(e) => setForm({...form, layer_kicker: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-slate-500">Titel</Label>
                  <Input className="rounded-xl bg-white border-slate-200 h-9" value={form.layer_title || ""} onChange={(e) => setForm({...form, layer_title: e.target.value})} />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-6">
                <Label className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-2 block">Untere Info-Boxen (Optional)</Label>
                
                <div className="space-y-4 pb-4 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-700 font-bold">Box 1 (Links) anzeigen?</Label>
                    <Switch checked={form.show_bottom_box1 !== false} onCheckedChange={(c) => setForm({...form, show_bottom_box1: c})} className="data-[state=checked]:bg-[#FF4B2C]" />
                  </div>
                  {form.show_bottom_box1 !== false && (
                    <div className="space-y-3 pl-3 border-l-2 border-[#FF4B2C]/20">
                      <div>
                        <Label className="text-xs text-slate-500">Kicker</Label>
                        <Input className="rounded-xl bg-white border-slate-200 h-9" value={form.bottom_box1_kicker || ""} onChange={(e) => setForm({...form, bottom_box1_kicker: e.target.value})} />
                      </div>
                      <div>
                        <Label className="text-xs text-slate-500">Text</Label>
                        <Textarea rows={2} className="rounded-xl bg-white border-slate-200 resize-none text-sm" value={form.bottom_box1_title || ""} onChange={(e) => setForm({...form, bottom_box1_title: e.target.value})} />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-700 font-bold">Box 2 (Rechts) anzeigen?</Label>
                    <Switch checked={form.show_bottom_box2 !== false} onCheckedChange={(c) => setForm({...form, show_bottom_box2: c})} className="data-[state=checked]:bg-[#FF4B2C]" />
                  </div>
                  {form.show_bottom_box2 !== false && (
                    <div className="space-y-3 pl-3 border-l-2 border-[#FF4B2C]/20">
                      <div>
                        <Label className="text-xs text-slate-500">Kicker</Label>
                        <Input className="rounded-xl bg-white border-slate-200 h-9" value={form.bottom_box2_kicker || ""} onChange={(e) => setForm({...form, bottom_box2_kicker: e.target.value})} />
                      </div>
                      <div>
                        <Label className="text-xs text-slate-500">Text</Label>
                        <Textarea rows={2} className="rounded-xl bg-white border-slate-200 resize-none text-sm" value={form.bottom_box2_title || ""} onChange={(e) => setForm({...form, bottom_box2_title: e.target.value})} />
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </TabsContent>
          </Tabs>
        </section>
      </div>
    </div>
  );
};

export default AdminHero;