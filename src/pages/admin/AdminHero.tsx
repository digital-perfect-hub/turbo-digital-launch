import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ImagePlus, Layers3, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { buildRenderImageUrl } from "@/lib/image";
import heroFallback from "@/assets/hero-bg.jpg";

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
] as const;

const LEGACY_HERO_COLUMNS = HERO_EDITABLE_COLUMNS.filter(
  (key) => !["background_image_path", "background_mobile_image_path", "overlay_opacity"].includes(key),
);

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

  const [form, setForm] = useState<HeroForm>({});

  useEffect(() => {
    if (hero) setForm(hero);
  }, [hero]);

  const supportsExtendedHero = useMemo(
    () => Boolean(hero && Object.prototype.hasOwnProperty.call(hero, "background_image_path")),
    [hero],
  );

  const supportedColumns = useMemo(() => {
    if (!hero) return [...LEGACY_HERO_COLUMNS];

    const liveColumns = HERO_EDITABLE_COLUMNS.filter((key) => Object.prototype.hasOwnProperty.call(hero, key));
    return liveColumns.length ? liveColumns : [...LEGACY_HERO_COLUMNS];
  }, [hero]);

  const mutation = useMutation({
    mutationFn: async (values: HeroForm) => {
      if (!hero?.id) throw new Error("Hero content not loaded");

      const { id, created_at, updated_at, ...rawData } = values || {};
      void id;
      void created_at;
      void updated_at;

      const payload = supportedColumns.reduce<Record<string, string | number | null>>((acc, key) => {
        if (key === "overlay_opacity") {
          const numeric = Number(rawData[key]);
          acc[key] = Number.isFinite(numeric) ? Math.max(0, Math.min(100, numeric)) : 58;
        } else {
          acc[key] = rawData[key] ?? null;
        }
        return acc;
      }, {});

      const { error } = await supabase.from("hero_content").update(payload).eq("id", hero.id);
      if (error) throw error;
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
    return trimmed.startsWith("http") ? trimmed : buildRenderImageUrl(trimmed, { width: 1800, quality: 86 });
  };

  const heroVisualPreview = resolveStorageImage(form.image_path);
  const heroBackgroundPreview = resolveStorageImage(form.background_image_path);
  const overlayOpacity = Number.isFinite(Number(form.overlay_opacity)) ? Math.max(0, Math.min(100, Number(form.overlay_opacity))) : 58;

  if (isLoading) return <div className="p-6">Laden...</div>;

  return (
    <div className="max-w-6xl p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Hero-Bereich bearbeiten</h1>
        <p className="mt-2 text-sm text-slate-500">Großer Hero-Hintergrund, Visual-Card, Overlay und Kennzahlen zentral pflegen.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="glass-card overflow-hidden p-4 md:p-5">
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

        <section className="glass-card p-6 space-y-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Sparkles size={16} className="text-gold-dark" /> Inhalte
          </div>

          <div className="space-y-2">
            <Label>Badge-Text</Label>
            <Input value={form.badge_text || ""} onChange={(e) => setForm({ ...form, badge_text: e.target.value })} />
          </div>

          <div className="space-y-2">
            <Label>Hauptüberschrift</Label>
            <Textarea rows={4} value={form.headline || ""} onChange={(e) => setForm({ ...form, headline: e.target.value })} />
            <p className="text-xs text-slate-500">Zeilenumbrüche sind erlaubt und werden im Hero sauber übernommen.</p>
          </div>

          <div className="space-y-2">
            <Label>Unterüberschrift</Label>
            <Textarea rows={5} value={form.subheadline || ""} onChange={(e) => setForm({ ...form, subheadline: e.target.value })} />
          </div>

          <div className="space-y-2">
            <Label>CTA-Button Text</Label>
            <Input value={form.cta_text || ""} onChange={(e) => setForm({ ...form, cta_text: e.target.value })} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Hero-Hintergrund Desktop</Label>
              <Input value={form.background_image_path || ""} onChange={(e) => setForm({ ...form, background_image_path: e.target.value })} placeholder="hero/background-desktop.webp" />
            </div>
            <div className="space-y-2">
              <Label>Hero-Hintergrund Mobile</Label>
              <Input value={form.background_mobile_image_path || ""} onChange={(e) => setForm({ ...form, background_mobile_image_path: e.target.value })} placeholder="hero/background-mobile.webp" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Rechtes Hero-Visual</Label>
            <Input value={form.image_path || ""} onChange={(e) => setForm({ ...form, image_path: e.target.value })} placeholder="hero/digital-perfect-visual.webp" />
          </div>

          <div className="space-y-2">
            <Label>Overlay-Stärke ({overlayOpacity}%)</Label>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={overlayOpacity}
              onChange={(e) => setForm({ ...form, overlay_opacity: Number(e.target.value) })}
              className="w-full"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((nr) => (
              <div key={nr} className="space-y-3 rounded-[1.2rem] border border-slate-200 bg-white/70 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  <Layers3 size={13} /> Stat {nr}
                </div>
                <Input value={form[`stat${nr}_value`] || ""} onChange={(e) => setForm({ ...form, [`stat${nr}_value`]: e.target.value })} placeholder="Wert" />
                <Input value={form[`stat${nr}_label`] || ""} onChange={(e) => setForm({ ...form, [`stat${nr}_label`]: e.target.value })} placeholder="Label" />
              </div>
            ))}
          </div>

          <Button onClick={() => mutation.mutate(form)} disabled={mutation.isPending}>
            {mutation.isPending ? "Speichere..." : "Hero speichern"}
          </Button>
        </section>
      </div>
    </div>
  );
};

export default AdminHero;
