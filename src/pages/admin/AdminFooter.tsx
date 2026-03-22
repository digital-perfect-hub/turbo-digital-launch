import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LayoutTemplate, Plus, Trash2, Save, Share2, Link2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useSiteContext } from "@/context/SiteContext";
import { DEFAULT_SITE_ID } from "@/lib/site";

const AdminFooter = () => {
  const qc = useQueryClient();
  const { activeSiteId } = useSiteContext();
  const siteId = activeSiteId || DEFAULT_SITE_ID;
  const [form, setForm] = useState<any>({
    footer_description: "",
    social_instagram_url: "",
    social_linkedin_url: "",
    show_socials: true,
    footer_nav_links: [],
    footer_legal_links: []
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ["global_settings_footer", siteId],
    queryFn: async () => {
      const { data, error } = await supabase.from("global_settings")
        .select("id, footer_description, social_instagram_url, social_linkedin_url, show_socials, footer_nav_links, footer_legal_links")
        .eq("site_id", siteId)
        .limit(1).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (settings) {
      setForm({
        ...settings,
        footer_nav_links: Array.isArray(settings.footer_nav_links) ? settings.footer_nav_links : [],
        footer_legal_links: Array.isArray(settings.footer_legal_links) ? settings.footer_legal_links : []
      });
    }
  }, [settings]);

  const mutation = useMutation({
    mutationFn: async (values: typeof form) => {
      const rowId = settings?.id || "default";
      const { error } = await supabase.from("global_settings").upsert({ id: rowId, site_id: siteId, ...values }, { onConflict: "site_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["global_settings"] });
      toast.success("Footer erfolgreich gespeichert!");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const addLink = (listType: "footer_nav_links" | "footer_legal_links") => {
    setForm({ ...form, [listType]: [...form[listType], { label: "", url: "" }] });
  };

  const updateLink = (listType: "footer_nav_links" | "footer_legal_links", index: number, field: string, value: string) => {
    const updated = [...form[listType]];
    updated[index][field] = value;
    setForm({ ...form, [listType]: updated });
  };

  const removeLink = (listType: "footer_nav_links" | "footer_legal_links", index: number) => {
    const updated = form[listType].filter((_: any, i: number) => i !== index);
    setForm({ ...form, [listType]: updated });
  };

  if (isLoading) return <div className="p-6 text-slate-500 font-medium">Laden...</div>;

  return (
    <div className="p-6 md:p-10 max-w-6xl">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Footer-Bereich</h1>
          <p className="mt-2 text-sm text-slate-500">Steuere Beschreibungen, Social Media Icons und Footer-Listen.</p>
        </div>
        <Button onClick={() => mutation.mutate(form)} disabled={mutation.isPending} className="rounded-xl bg-[#FF4B2C] hover:bg-[#E03A1E] text-white px-6 py-5 shadow-md shadow-[#FF4B2C]/20 transition-transform hover:scale-105">
          <Save size={18} className="mr-2" />
          {mutation.isPending ? "Speichere..." : "Footer speichern"}
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* LINKE SPALTE: Texte & Social Media */}
        <div className="space-y-8">
          <section className="glass-card rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3 text-lg font-bold text-slate-900 mb-6">
              <LayoutTemplate size={24} className="text-[#FF4B2C]" /> Allgemeine Inhalte
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-700">Footer Beschreibungstext</Label>
                <Textarea 
                  rows={4} 
                  className="rounded-xl border-slate-200 bg-slate-50 focus:border-[#FF4B2C] resize-none" 
                  value={form.footer_description || ""} 
                  onChange={(e) => setForm({ ...form, footer_description: e.target.value })} 
                />
              </div>
            </div>
          </section>

          <section className="glass-card rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3 text-lg font-bold text-slate-900">
                <Share2 size={24} className="text-[#FF4B2C]" /> Social Media
              </div>
              <Switch checked={form.show_socials !== false} onCheckedChange={(c) => setForm({ ...form, show_socials: c })} className="data-[state=checked]:bg-[#FF4B2C]" />
            </div>

            {form.show_socials !== false && (
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="space-y-2">
                  <Label className="text-slate-700">Instagram URL</Label>
                  <Input 
                    className="rounded-xl border-slate-200 bg-slate-50 focus:border-[#FF4B2C]" 
                    placeholder="https://instagram.com/..." 
                    value={form.social_instagram_url || ""} 
                    onChange={(e) => setForm({ ...form, social_instagram_url: e.target.value })} 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700">LinkedIn URL</Label>
                  <Input 
                    className="rounded-xl border-slate-200 bg-slate-50 focus:border-[#FF4B2C]" 
                    placeholder="https://linkedin.com/in/..." 
                    value={form.social_linkedin_url || ""} 
                    onChange={(e) => setForm({ ...form, social_linkedin_url: e.target.value })} 
                  />
                </div>
              </div>
            )}
          </section>
        </div>

        {/* RECHTE SPALTE: Dynamische Link-Listen */}
        <div className="space-y-8">
          
          {/* Liste 1: Navigation */}
          <section className="glass-card rounded-[2rem] border border-slate-200 bg-slate-950 p-8 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3 text-lg font-bold text-white">
                <Link2 size={20} className="text-[#FF4B2C]" /> Navigation Links
              </div>
              <Button variant="outline" size="sm" onClick={() => addLink("footer_nav_links")} className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white rounded-lg">
                <Plus size={16} className="mr-1" /> Neu
              </Button>
            </div>
            
            <div className="space-y-3">
              {form.footer_nav_links.length === 0 ? (
                <p className="text-slate-500 text-sm italic">Keine Links angelegt.</p>
              ) : (
                form.footer_nav_links.map((link: any, i: number) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input placeholder="Label" className="rounded-lg border-white/10 bg-slate-900 text-white focus:border-[#FF4B2C]" value={link.label} onChange={(e) => updateLink("footer_nav_links", i, "label", e.target.value)} />
                    <Input placeholder="URL" className="rounded-lg border-white/10 bg-slate-900 text-white focus:border-[#FF4B2C]" value={link.url} onChange={(e) => updateLink("footer_nav_links", i, "url", e.target.value)} />
                    <button onClick={() => removeLink("footer_nav_links", i)} className="p-2 text-slate-500 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Liste 2: Rechtliches */}
          <section className="glass-card rounded-[2rem] border border-slate-200 bg-slate-950 p-8 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3 text-lg font-bold text-white">
                <Link2 size={20} className="text-[#FF4B2C]" /> Rechtliches
              </div>
              <Button variant="outline" size="sm" onClick={() => addLink("footer_legal_links")} className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white rounded-lg">
                <Plus size={16} className="mr-1" /> Neu
              </Button>
            </div>
            
            <div className="space-y-3">
              {form.footer_legal_links.length === 0 ? (
                <p className="text-slate-500 text-sm italic">Keine Links angelegt.</p>
              ) : (
                form.footer_legal_links.map((link: any, i: number) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input placeholder="Label" className="rounded-lg border-white/10 bg-slate-900 text-white focus:border-[#FF4B2C]" value={link.label} onChange={(e) => updateLink("footer_legal_links", i, "label", e.target.value)} />
                    <Input placeholder="URL" className="rounded-lg border-white/10 bg-slate-900 text-white focus:border-[#FF4B2C]" value={link.url} onChange={(e) => updateLink("footer_legal_links", i, "url", e.target.value)} />
                    <button onClick={() => removeLink("footer_legal_links", i)} className="p-2 text-slate-500 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                  </div>
                ))
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default AdminFooter;