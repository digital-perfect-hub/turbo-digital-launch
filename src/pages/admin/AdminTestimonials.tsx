import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Save, Star, Trash2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { uploadBrandingAsset } from "@/lib/storage";
import { buildRenderImageUrl } from "@/lib/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { defaultSiteText, useSiteSettings } from "@/hooks/useSiteSettings";
import { useSiteContext } from "@/context/SiteContext";
import { DEFAULT_SITE_ID } from "@/lib/site";
import { upsertSiteSetting } from "@/lib/site-settings";

type TestimonialRow = {
  id?: string;
  name: string;
  role: string;
  company: string;
  quote: string;
  image_url: string;
  rating: number;
  sort_order: number;
  is_visible: boolean;
};

const defaultRow: TestimonialRow = {
  name: "",
  role: "",
  company: "",
  quote: "",
  image_url: "",
  rating: 5,
  sort_order: 0,
  is_visible: true,
};

const AdminTestimonials = () => {
  const qc = useQueryClient();
  const { activeSiteId } = useSiteContext();
  const siteId = activeSiteId || DEFAULT_SITE_ID;
  const { settings: siteSettings, isLoading: siteSettingsLoading } = useSiteSettings();
  const [section, setSection] = useState({
    kicker: defaultSiteText.home_testimonials_kicker,
    title: defaultSiteText.home_testimonials_title,
    description: defaultSiteText.home_testimonials_description,
  });
  const [editing, setEditing] = useState<TestimonialRow | null>(null);

  const { data: testimonials = [], isLoading } = useQuery({
    queryKey: ["admin-testimonials", siteId],
    queryFn: async () => {
      const { data, error } = await supabase.from("testimonials").select("*").eq("site_id", siteId).order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (siteSettingsLoading) return;
    setSection({
      kicker: typeof siteSettings.home_testimonials_kicker === "string" ? siteSettings.home_testimonials_kicker : defaultSiteText.home_testimonials_kicker,
      title: typeof siteSettings.home_testimonials_title === "string" ? siteSettings.home_testimonials_title : defaultSiteText.home_testimonials_title,
      description: typeof siteSettings.home_testimonials_description === "string" ? siteSettings.home_testimonials_description : defaultSiteText.home_testimonials_description,
    });
  }, [siteSettings, siteSettingsLoading]);

  const nextSortOrder = useMemo(() => {
    if (!testimonials.length) return 0;
    return Math.max(...testimonials.map((item) => item.sort_order ?? 0)) + 1;
  }, [testimonials]);

  const saveSectionMutation = useMutation({
    mutationFn: async () => {
      await Promise.all([
        upsertSiteSetting(siteId, "home_testimonials_kicker", section.kicker),
        upsertSiteSetting(siteId, "home_testimonials_title", section.title),
        upsertSiteSetting(siteId, "home_testimonials_description", section.description),
      ]);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["site_settings", siteId] });
      toast.success("Testimonials-Sektion gespeichert.");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Sektion konnte nicht gespeichert werden.");
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (item: TestimonialRow) => {
      const payload = {
        name: item.name,
        role: item.role || null,
        company: item.company || null,
        quote: item.quote || null,
        image_url: item.image_url || null,
        rating: item.rating || 5,
        sort_order: item.sort_order ?? 0,
        is_visible: item.is_visible,
      };

      if (item.id) {
        const { error } = await supabase.from("testimonials").update(payload).eq("id", item.id);
        if (error) throw error;
        return;
      }

      const { error } = await supabase.from("testimonials").insert({ ...payload, site_id: siteId });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-testimonials"] });
      setEditing(null);
      toast.success("Testimonial gespeichert.");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Testimonial konnte nicht gespeichert werden.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("testimonials").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-testimonials"] });
      toast.success("Testimonial gelöscht.");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Löschen fehlgeschlagen.");
    },
  });

  const handleUpload = async (file: File) => {
    const filePath = await uploadBrandingAsset(file, "testimonials", siteId);
    setEditing((prev) => (prev ? { ...prev, image_url: filePath } : prev));
    toast.success("Testimonial-Bild hochgeladen.");
  };

  if (isLoading || siteSettingsLoading) return <div className="p-6 text-slate-500 font-medium">Laden...</div>;

  return (
    <div className="p-6 md:p-10 max-w-7xl">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Testimonials</h1>
          <p className="mt-2 text-sm text-slate-500">Kundenstimmen und Sektionsinhalte komplett aus dem Admin pflegen.</p>
        </div>
        <Button onClick={() => setEditing({ ...defaultRow, sort_order: nextSortOrder })} className="rounded-xl bg-[#FF4B2C] px-6 py-5 text-white shadow-md shadow-[#FF4B2C]/20 hover:bg-[#E03A1E]">
          <Plus size={18} className="mr-2" /> Neues Testimonial
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="rounded-[2rem] border-slate-200">
          <CardHeader>
            <CardTitle>Testimonials-Sektion</CardTitle>
            <CardDescription>Kicker, Titel und Beschreibung der öffentlichen Kundenstimmen-Sektion.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>Kicker</Label>
              <Input value={section.kicker} onChange={(e) => setSection((prev) => ({ ...prev, kicker: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Titel</Label>
              <Input value={section.title} onChange={(e) => setSection((prev) => ({ ...prev, title: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Beschreibung</Label>
              <Textarea rows={5} value={section.description} onChange={(e) => setSection((prev) => ({ ...prev, description: e.target.value }))} />
            </div>
            <Button onClick={() => saveSectionMutation.mutate()} disabled={saveSectionMutation.isPending} className="rounded-xl bg-slate-950 text-white hover:bg-slate-800">
              <Save size={16} className="mr-2" /> {saveSectionMutation.isPending ? "Speichere..." : "Sektion speichern"}
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-slate-200">
          <CardHeader>
            <CardTitle>{editing?.id ? "Testimonial bearbeiten" : "Neues Testimonial"}</CardTitle>
            <CardDescription>Name, Rolle, Bewertung, Quote und Sichtbarkeit direkt aus dem Admin steuern.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {editing ? (
              <>
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input value={editing.name} onChange={(e) => setEditing((prev) => (prev ? { ...prev, name: e.target.value } : prev))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Rolle</Label>
                    <Input value={editing.role} onChange={(e) => setEditing((prev) => (prev ? { ...prev, role: e.target.value } : prev))} />
                  </div>
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Unternehmen</Label>
                    <Input value={editing.company} onChange={(e) => setEditing((prev) => (prev ? { ...prev, company: e.target.value } : prev))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Sortierung</Label>
                    <Input type="number" value={editing.sort_order} onChange={(e) => setEditing((prev) => (prev ? { ...prev, sort_order: Number(e.target.value) || 0 } : prev))} />
                  </div>
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Bewertung (1-5)</Label>
                    <Input type="number" min={1} max={5} value={editing.rating} onChange={(e) => setEditing((prev) => (prev ? { ...prev, rating: Math.max(1, Math.min(5, Number(e.target.value) || 5)) } : prev))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Bildpfad</Label>
                    <Input value={editing.image_url} onChange={(e) => setEditing((prev) => (prev ? { ...prev, image_url: e.target.value } : prev))} placeholder="branding/testimonials/avatar.webp" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Zitat</Label>
                  <Textarea rows={6} value={editing.quote} onChange={(e) => setEditing((prev) => (prev ? { ...prev, quote: e.target.value } : prev))} />
                </div>

                <div className="flex flex-wrap gap-3">
                  <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 hover:border-[#FF4B2C]/30 hover:bg-[#FF4B2C]/5 hover:text-[#FF4B2C]">
                    <Upload size={16} className="mr-2" /> Bild hochladen
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => {
                      const file = e.target.files?.[0];
                      e.currentTarget.value = "";
                      if (file) void handleUpload(file);
                    }} />
                  </label>
                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <span className="text-sm font-semibold text-slate-700">Sichtbar</span>
                    <Switch checked={editing.is_visible} onCheckedChange={(checked) => setEditing((prev) => (prev ? { ...prev, is_visible: checked } : prev))} />
                  </div>
                </div>

                {editing.image_url ? (
                  <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-50 p-3">
                    <img src={buildRenderImageUrl(editing.image_url, { width: 360, quality: 84 })} alt={editing.name || "Testimonial Preview"} className="h-40 w-40 rounded-full object-cover mx-auto" />
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => editing.name.trim() && saveMutation.mutate(editing)} disabled={saveMutation.isPending || !editing.name.trim()} className="rounded-xl bg-[#FF4B2C] text-white hover:bg-[#E03A1E]">
                    <Save size={16} className="mr-2" /> {saveMutation.isPending ? "Speichere..." : "Testimonial speichern"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setEditing(null)} className="rounded-xl">Abbrechen</Button>
                </div>
              </>
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-8 text-sm text-slate-500">
                Wähle links eine Kundenstimme oder lege ein neues Testimonial an.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {testimonials.map((item) => (
          <Card key={item.id} className="rounded-[1.75rem] border-slate-200">
            <CardContent className="flex gap-4 p-5">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full bg-slate-100">
                {item.image_url ? (
                  <img src={buildRenderImageUrl(item.image_url, { width: 160, quality: 82 })} alt={item.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-slate-400">Kein Bild</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{item.name}</h3>
                    <p className="text-sm text-slate-500">{[item.role, item.company].filter(Boolean).join(" · ") || "Ohne Zusatz"}</p>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: item.rating ?? 5 }).map((_, index) => (
                      <Star key={index} size={14} fill="currentColor" />
                    ))}
                  </div>
                </div>
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-600">{item.quote || "Kein Zitat hinterlegt."}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="outline" className="rounded-xl" onClick={() => setEditing({
                    id: item.id,
                    name: item.name,
                    role: item.role || "",
                    company: item.company || "",
                    quote: item.quote || "",
                    image_url: item.image_url || "",
                    rating: item.rating ?? 5,
                    sort_order: item.sort_order ?? 0,
                    is_visible: item.is_visible ?? true,
                  })}>
                    Bearbeiten
                  </Button>
                  <Button variant="outline" className="rounded-xl text-rose-600 hover:text-rose-700" onClick={() => deleteMutation.mutate(item.id)} disabled={deleteMutation.isPending}>
                    <Trash2 size={15} className="mr-2" /> Löschen
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminTestimonials;
