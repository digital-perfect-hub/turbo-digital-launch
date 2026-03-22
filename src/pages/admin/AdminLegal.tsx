import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, Save, ShieldCheck, ScrollText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import RichTextEditor from "@/components/ui/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { uploadBrandingAsset } from "@/lib/storage";
import { buildRenderImageUrl } from "@/lib/image";
import { legalPageDefaults, type LegalPageRecord, type LegalPageSlug } from "@/hooks/useLegalPages";
import { toast } from "sonner";
import { useSiteContext } from "@/context/SiteContext";
import { DEFAULT_SITE_ID } from "@/lib/site";

const slugMeta: Record<LegalPageSlug, { label: string; icon: typeof FileText }> = {
  impressum: { label: "Impressum", icon: FileText },
  datenschutz: { label: "Datenschutz", icon: ShieldCheck },
  agb: { label: "AGB", icon: ScrollText },
};

const AdminLegal = () => {
  const qc = useQueryClient();
  const { activeSiteId } = useSiteContext();
  const siteId = activeSiteId || DEFAULT_SITE_ID;
  const [activeSlug, setActiveSlug] = useState<LegalPageSlug>("impressum");
  const [forms, setForms] = useState<Record<LegalPageSlug, LegalPageRecord>>(legalPageDefaults);

  const { data: pages = [], isLoading } = useQuery({
    queryKey: ["admin-legal-pages", siteId],
    queryFn: async () => {
      const { data, error } = await supabase.from("legal_pages" as never).select("*").eq("site_id", siteId).order("slug", { ascending: true });
      if (error) throw error;
      return (data as unknown as LegalPageRecord[]) || [];
    },
  });

  useEffect(() => {
    if (!pages.length) {
      setForms(legalPageDefaults);
      return;
    }

    const next = { ...legalPageDefaults };
    pages.forEach((page) => {
      const slug = page.slug as LegalPageSlug;
      if (slug in next) {
        next[slug] = {
          ...next[slug],
          ...page,
          body: page.body || next[slug].body,
        };
      }
    });
    setForms(next);
  }, [pages]);

  const current = useMemo(() => forms[activeSlug], [forms, activeSlug]);

  const saveMutation = useMutation({
    mutationFn: async (page: LegalPageRecord) => {
      const payload = {
        slug: page.slug,
        title: page.title,
        seo_title: page.seo_title || null,
        seo_description: page.seo_description || null,
        body: page.body || null,
        is_published: page.is_published,
      };

      const { error } = await supabase.from("legal_pages" as never).upsert({ ...payload, site_id: siteId }, { onConflict: "site_id,slug" });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-legal-pages"] });
      qc.invalidateQueries({ queryKey: ["legal-pages", siteId] });
      qc.invalidateQueries({ queryKey: ["legal-page"] });
      toast.success("Rechtsseite gespeichert.");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Rechtsseite konnte nicht gespeichert werden.");
    },
  });

  const updateCurrent = (patch: Partial<LegalPageRecord>) => {
    setForms((prev) => ({
      ...prev,
      [activeSlug]: {
        ...prev[activeSlug],
        ...patch,
      },
    }));
  };

  const handleImageUpload = async (file: File) => {
    const filePath = await uploadBrandingAsset(file, "legal", siteId);
    return buildRenderImageUrl(filePath, { width: 1400, quality: 86 });
  };

  if (isLoading) return <div className="p-6 text-slate-500 font-medium">Laden...</div>;

  return (
    <div className="p-6 md:p-10 max-w-7xl">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Rechtsseiten</h1>
          <p className="mt-2 text-sm text-slate-500">Impressum, Datenschutz und AGB werden jetzt direkt aus Supabase gepflegt.</p>
        </div>
        <Button onClick={() => saveMutation.mutate(current)} disabled={saveMutation.isPending} className="rounded-xl bg-[#FF4B2C] px-6 py-5 text-white shadow-md shadow-[#FF4B2C]/20 hover:bg-[#E03A1E]">
          <Save size={18} className="mr-2" /> {saveMutation.isPending ? "Speichere..." : "Seite speichern"}
        </Button>
      </div>

      <Tabs value={activeSlug} onValueChange={(value) => setActiveSlug(value as LegalPageSlug)} className="w-full">
        <TabsList className="grid w-full grid-cols-3 rounded-2xl bg-slate-100 p-1">
          {(Object.keys(slugMeta) as LegalPageSlug[]).map((slug) => {
            const Icon = slugMeta[slug].icon;
            return (
              <TabsTrigger key={slug} value={slug} className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-[#FF4B2C]">
                <Icon size={15} className="mr-2" /> {slugMeta[slug].label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {(Object.keys(slugMeta) as LegalPageSlug[]).map((slug) => (
          <TabsContent key={slug} value={slug} className="mt-6 space-y-6">
            <Card className="rounded-[2rem] border-slate-200">
              <CardHeader>
                <CardTitle>{slugMeta[slug].label} · Metadaten</CardTitle>
                <CardDescription>Seitentitel, SEO-Defaults und Veröffentlichungsstatus für diese Rechtsseite.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label>Seitentitel</Label>
                  <Input value={forms[slug].title} onChange={(e) => setForms((prev) => ({ ...prev, [slug]: { ...prev[slug], title: e.target.value } }))} />
                </div>
                <div className="space-y-2">
                  <Label>SEO Title</Label>
                  <Input value={forms[slug].seo_title || ""} onChange={(e) => setForms((prev) => ({ ...prev, [slug]: { ...prev[slug], seo_title: e.target.value } }))} />
                </div>
                <div className="space-y-2">
                  <Label>SEO Description</Label>
                  <Input value={forms[slug].seo_description || ""} onChange={(e) => setForms((prev) => ({ ...prev, [slug]: { ...prev[slug], seo_description: e.target.value } }))} />
                </div>
                <div className="md:col-span-2 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Seite veröffentlicht</p>
                    <p className="text-xs text-slate-500">Nur veröffentlichte Legal-Pages sollen public ausgespielt werden.</p>
                  </div>
                  <Switch checked={forms[slug].is_published} onCheckedChange={(checked) => setForms((prev) => ({ ...prev, [slug]: { ...prev[slug], is_published: checked } }))} />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[2rem] border-slate-200">
              <CardHeader>
                <CardTitle>{slugMeta[slug].label} · Inhalt</CardTitle>
                <CardDescription>Der Inhalt wird als HTML gespeichert und auf der öffentlichen Seite sanitisiert gerendert.</CardDescription>
              </CardHeader>
              <CardContent>
                <RichTextEditor
                  value={forms[slug].body || ""}
                  onChange={(html) => setForms((prev) => ({ ...prev, [slug]: { ...prev[slug], body: html } }))}
                  onImageUpload={handleImageUpload}
                  placeholder={`Hier pflegst du den Inhalt für ${slugMeta[slug].label} ...`}
                />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default AdminLegal;
