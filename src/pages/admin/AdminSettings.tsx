import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Globe, Image as ImageIcon, Upload, Search, Code, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { buildRawImageUrl } from "@/lib/image";
import { useSiteContext } from "@/context/SiteContext";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { DEFAULT_SITE_ID } from "@/lib/site";
import { buildSiteAssetPath } from "@/lib/storage";

const AdminSettings = () => {
  const qc = useQueryClient();
  const { activeSiteId } = useSiteContext();
  const { canManageSettings } = useAdminAccess();
  const siteId = activeSiteId || DEFAULT_SITE_ID;
  const [form, setForm] = useState<any>({});
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingFavicon, setIsUploadingFavicon] = useState(false);

  const { data: settings, isLoading } = useQuery({
    queryKey: ["global_settings_all", siteId],
    queryFn: async () => {
      const { data, error } = await supabase.from("global_settings").select("*").eq("site_id", siteId).limit(1).maybeSingle();
      if (error) throw error;
      return data || {};
    },
  });

  useEffect(() => {
    if (settings) {
      setForm({
        ...settings,
        tab_retention_texts: Array.isArray(settings.tab_retention_texts) 
          ? settings.tab_retention_texts 
          : ["Komm doch zurück! 👋", "Wir vermissen dich 🥺"]
      });
    }
  }, [settings]);

  const mutation = useMutation({
    mutationFn: async (values: any) => {
      const payload = {
        website_title: values.website_title,
        company_name: values.company_name,
        meta_title: values.meta_title,
        meta_description: values.meta_description,
        logo_path: values.logo_path,
        favicon_path: values.favicon_path,
        og_image_path: values.og_image_path,
        tracking_head_code: values.tracking_head_code,
        tracking_body_code: values.tracking_body_code,
        enable_tab_retention: values.enable_tab_retention,
        tab_retention_texts: values.tab_retention_texts,
      };

      const { data: updatedRows, error: updateError } = await supabase
        .from("global_settings")
        .update(payload)
        .eq("site_id", siteId)
        .select("site_id");

      if (updateError) throw updateError;

      if (!updatedRows?.length) {
        const { error: insertError } = await supabase
          .from("global_settings")
          .insert({ site_id: siteId, ...payload });

        if (insertError) throw insertError;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["global_settings"] });
      qc.invalidateQueries({ queryKey: ["global_settings_all"] });
      toast.success("Einstellungen erfolgreich gespeichert!");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "logo_path" | "favicon_path", setLoader: (val: boolean) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoader(true);
    try {
      const filePath = buildSiteAssetPath(siteId, field === "favicon_path" ? "favicons" : "logos", file);
      const { error: uploadError } = await supabase.storage.from('branding').upload(filePath, file);
      if (uploadError) throw uploadError;
      setForm({ ...form, [field]: filePath });
      toast.success("Erfolgreich hochgeladen!");
    } catch (error: any) {
      toast.error("Upload fehlgeschlagen: " + error.message);
    } finally {
      setLoader(false);
    }
  };

  if (isLoading) return <div className="p-6 text-slate-500 font-medium">Laden...</div>;

  return (
    <div className="p-6 md:p-10 max-w-5xl">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Einstellungen</h1>
          <p className="mt-2 text-sm text-slate-500">Website-Titel, Favicon, SEO-Daten und Tracking-Scripts.</p>
        </div>
        <Button onClick={() => mutation.mutate(form)} disabled={!canManageSettings || mutation.isPending} className="rounded-xl bg-[#FF4B2C] hover:bg-[#E03A1E] text-white px-6 py-5 shadow-md shadow-[#FF4B2C]/20 transition-transform hover:scale-105">
          {mutation.isPending ? "Speichere..." : "Einstellungen speichern"}
        </Button>
      </div>

      {!canManageSettings ? (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Diese Rolle darf Einstellungen nur lesen. Kritische Settings, Tracking, Domains und globale Metadaten bleiben ab Admin/Owner freigeschaltet.
        </div>
      ) : null}

      <div className="glass-card rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-slate-100 rounded-xl p-1 gap-1">
            <TabsTrigger value="general" className="rounded-lg py-3 data-[state=active]:bg-white data-[state=active]:text-[#FF4B2C] data-[state=active]:shadow-sm transition-all"><Globe size={16} className="mr-2" /> Allgemein</TabsTrigger>
            <TabsTrigger value="seo" className="rounded-lg py-3 data-[state=active]:bg-white data-[state=active]:text-[#FF4B2C] data-[state=active]:shadow-sm transition-all"><Search size={16} className="mr-2" /> SEO & Meta</TabsTrigger>
            <TabsTrigger value="tracking" className="rounded-lg py-3 data-[state=active]:bg-white data-[state=active]:text-[#FF4B2C] data-[state=active]:shadow-sm transition-all"><Code size={16} className="mr-2" /> Tracking</TabsTrigger>
          </TabsList>
          <fieldset disabled={!canManageSettings}>

          {/* TAB 1: ALLGEMEIN */}
          <TabsContent value="general" className="space-y-8 mt-0 outline-none">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-slate-700">Website-Titel (Fallback)</Label>
                <Input className="rounded-xl border-slate-200 bg-slate-50 focus:border-[#FF4B2C]" value={form.website_title || ""} onChange={(e) => setForm({ ...form, website_title: e.target.value })} placeholder="Mein Premium SaaS" />
                <p className="text-xs text-slate-500">Wird genutzt, falls kein SEO-Titel vergeben wurde.</p>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700">Firmenname</Label>
                <Input className="rounded-xl border-slate-200 bg-slate-50 focus:border-[#FF4B2C]" value={form.company_name || ""} onChange={(e) => setForm({ ...form, company_name: e.target.value })} placeholder="Digital-Perfect" />
              </div>
            </div>

            <div className="grid gap-8 md:grid-cols-2 pt-6 border-t border-slate-100">
              <div className="space-y-3">
                <Label className="text-slate-700 text-base font-bold">Favicon (Browser-Icon)</Label>
                <div className="flex items-center gap-5 p-4 rounded-2xl border border-slate-100 bg-slate-50">
                  <div className="h-16 w-16 shrink-0 rounded-xl border border-slate-200 bg-white flex items-center justify-center shadow-sm overflow-hidden p-2">
                    {form.favicon_path ? (
                      <img src={buildRawImageUrl(form.favicon_path, { width: 64 })} alt="Favicon" className="max-h-full object-contain" />
                    ) : <ImageIcon className="text-slate-300" />}
                  </div>
                  <div>
                    <Label htmlFor="favicon-upload" className="cursor-pointer inline-flex items-center justify-center rounded-xl bg-white border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 shadow-sm hover:border-[#FF4B2C] hover:text-[#FF4B2C] transition-all">
                      {isUploadingFavicon ? "Lädt..." : <><Upload size={14} className="mr-2" /> Hochladen</>}
                    </Label>
                    <input id="favicon-upload" type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, "favicon_path", setIsUploadingFavicon)} disabled={isUploadingFavicon} />
                    <p className="mt-2 text-xs text-slate-500">Ideal: 1:1 Format (z.B. 512x512px PNG).</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-slate-700 text-base font-bold">Haupt-Logo</Label>
                <div className="flex items-center gap-5 p-4 rounded-2xl border border-slate-100 bg-slate-50">
                  <div className="h-16 w-32 shrink-0 rounded-xl border border-slate-200 bg-white flex items-center justify-center shadow-sm overflow-hidden p-2">
                    {form.logo_path ? (
                      <img src={buildRawImageUrl(form.logo_path, { width: 128 })} alt="Logo" className="max-h-full object-contain" />
                    ) : <ImageIcon className="text-slate-300" />}
                  </div>
                  <div>
                    <Label htmlFor="logo-upload" className="cursor-pointer inline-flex items-center justify-center rounded-xl bg-white border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 shadow-sm hover:border-[#FF4B2C] hover:text-[#FF4B2C] transition-all">
                      {isUploadingLogo ? "Lädt..." : <><Upload size={14} className="mr-2" /> Hochladen</>}
                    </Label>
                    <input id="logo-upload" type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, "logo_path", setIsUploadingLogo)} disabled={isUploadingLogo} />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: SEO & META */}
          <TabsContent value="seo" className="space-y-6 mt-0 outline-none">
             <div className="space-y-2">
                <Label className="text-slate-700 font-bold">Meta Title (SEO Titel)</Label>
                <Input className="rounded-xl border-slate-200 bg-slate-50 focus:border-[#FF4B2C] text-lg font-medium h-12" value={form.meta_title || ""} onChange={(e) => setForm({ ...form, meta_title: e.target.value })} placeholder="Digital-Perfect | Premium Agentur für Webdesign" />
                <p className="text-xs text-slate-500">Der wichtigste SEO-Titel für Google und den Browser-Tab (ideal 50-60 Zeichen).</p>
             </div>
             <div className="space-y-2 pt-4">
                <Label className="text-slate-700">Globale Meta-Description</Label>
                <Textarea rows={3} className="rounded-xl border-slate-200 bg-slate-50 focus:border-[#FF4B2C] resize-none" value={form.meta_description || ""} onChange={(e) => setForm({ ...form, meta_description: e.target.value })} />
                <p className="text-xs text-slate-500">Wird für Google Suchergebnisse genutzt (max. 155 Zeichen ideal).</p>
             </div>
             <div className="space-y-2 pt-4">
                <Label className="text-slate-700">Social Sharing Image (OG:Image Pfad/URL)</Label>
                <Input className="rounded-xl border-slate-200 bg-slate-50 focus:border-[#FF4B2C]" value={form.og_image_path || ""} onChange={(e) => setForm({ ...form, og_image_path: e.target.value })} placeholder="https://.../og-image.jpg" />
                <p className="text-xs text-slate-500">Wird angezeigt, wenn die Website auf LinkedIn, Facebook oder WhatsApp geteilt wird.</p>
             </div>

             {/* NEU: TAB RETENTION (KOMM ZURÜCK) FEATURE */}
             <div className="pt-8 mt-8 border-t border-slate-100 space-y-6">
               <div className="flex items-center justify-between">
                 <div>
                   <Label className="text-slate-800 font-bold text-lg">Tab-Retention (Komm-Zurück Feature)</Label>
                   <p className="text-xs text-slate-500 mt-1">Ändert den Titel im Browser-Tab, sobald der Nutzer den Tab verlässt.</p>
                 </div>
                 <Switch checked={form.enable_tab_retention !== false} onCheckedChange={(c) => setForm({ ...form, enable_tab_retention: c })} disabled={!canManageSettings} className="data-[state=checked]:bg-[#FF4B2C]" />
               </div>

               {form.enable_tab_retention !== false && (
                 <div className="space-y-4 pl-4 border-l-2 border-[#FF4B2C]/20">
                   {form.tab_retention_texts?.map((text: string, i: number) => (
                     <div key={i} className="flex items-center gap-3">
                       <span className="text-sm font-bold text-slate-300 w-4">{i + 1}.</span>
                       <Input 
                         className="rounded-xl border-slate-200 bg-slate-50 focus:border-[#FF4B2C]" 
                         value={text} 
                         onChange={(e) => {
                           const updated = [...form.tab_retention_texts];
                           updated[i] = e.target.value;
                           setForm({ ...form, tab_retention_texts: updated });
                         }} 
                       />
                       <button onClick={() => {
                         const updated = form.tab_retention_texts.filter((_: any, idx: number) => idx !== i);
                         setForm({ ...form, tab_retention_texts: updated });
                       }} disabled={!canManageSettings} className="p-2 text-slate-400 hover:text-red-500 transition-colors disabled:cursor-not-allowed disabled:opacity-40"><Trash2 size={18} /></button>
                     </div>
                   ))}
                   <Button variant="outline" size="sm" onClick={() => setForm({ ...form, tab_retention_texts: [...(form.tab_retention_texts || []), ""] })} disabled={!canManageSettings} className="mt-2 text-slate-600 border-slate-200 hover:text-[#FF4B2C] hover:border-[#FF4B2C] rounded-xl">
                     <Plus size={16} className="mr-1" /> Weiteren Text hinzufügen
                   </Button>
                   <p className="text-xs text-slate-500 mt-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                     💡 Die Texte wechseln alle 3 Sekunden durch. Sobald der Nutzer zurückkehrt, erscheint sofort wieder der saubere Meta-Title.
                   </p>
                 </div>
               )}
             </div>
          </TabsContent>

          {/* TAB 3: TRACKING */}
          <TabsContent value="tracking" className="space-y-6 mt-0 outline-none">
             <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Tracking-Code wird jetzt global über das Cookie-Consent-System geladen. Ohne Zustimmung werden diese Scripts nicht injiziert.
             </div>
             <div className="space-y-2">
                <Label className="text-slate-700 font-bold flex items-center gap-2">Head Code <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded text-[10px] uppercase">GTM, Pixel</span></Label>
                <Textarea rows={6} className="font-mono text-xs rounded-xl border-slate-200 bg-slate-900 text-emerald-400 p-4 focus:border-[#FF4B2C]" value={form.tracking_head_code || ""} onChange={(e) => setForm({ ...form, tracking_head_code: e.target.value })} placeholder="\n<script>...</script>" />
             </div>
             <div className="space-y-2">
                <Label className="text-slate-700 font-bold flex items-center gap-2">Body Code <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded text-[10px] uppercase">NoScript</span></Label>
                <Textarea rows={6} className="font-mono text-xs rounded-xl border-slate-200 bg-slate-900 text-emerald-400 p-4 focus:border-[#FF4B2C]" value={form.tracking_body_code || ""} onChange={(e) => setForm({ ...form, tracking_body_code: e.target.value })} placeholder="\n<noscript>...</noscript>" />
             </div>
          </TabsContent>

          </fieldset>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminSettings;