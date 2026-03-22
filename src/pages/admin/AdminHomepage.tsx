import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Save } from "lucide-react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useSiteContext } from "@/context/SiteContext";
import { DEFAULT_SITE_ID } from "@/lib/site";
import { upsertSiteSetting } from "@/lib/site-settings";

import {
  defaultAudienceItems,
  defaultProcessSteps,
  defaultSiteText,
  defaultTrustPoints,
  defaultWhyChoosePoints,
  useSiteSettings,
} from "@/hooks/useSiteSettings";

const jsonDefaults: Record<string, unknown> = {
  home_why_choose_points: defaultWhyChoosePoints,
  home_audience_items: defaultAudienceItems,
  home_process_steps: defaultProcessSteps,
  home_trust_points: defaultTrustPoints,
};

const textGroups = {
  intro: [
    { key: "home_intro_title", label: "Intro Titel" },
    { key: "home_intro_body", label: "Intro Text", multiline: true },
  ],
  whyTrust: [
    { key: "home_why_choose_kicker", label: "Warum-Section Kicker" },
    { key: "home_why_choose_title", label: "Warum-Section Titel" },
    { key: "home_why_choose_body", label: "Warum-Section Body", multiline: true },
    { key: "home_trust_kicker", label: "Trust-Section Kicker" },
    { key: "home_trust_title", label: "Trust-Section Titel" },
  ],
  servicesShop: [
    { key: "home_services_kicker", label: "Services-Section Kicker" },
    { key: "home_services_title", label: "Services-Section Titel" },
    { key: "home_shop_kicker", label: "Shop-Section Kicker" },
    { key: "home_shop_title", label: "Shop-Section Titel" },
  ],
  audienceProcess: [
    { key: "home_audience_kicker", label: "Audience-Section Kicker" },
    { key: "home_audience_title", label: "Audience-Section Titel" },
    { key: "home_audience_description", label: "Audience-Section Beschreibung", multiline: true },
    { key: "home_process_kicker", label: "Process-Section Kicker" },
    { key: "home_process_title", label: "Process-Section Titel" },
  ],
  contactFaq: [
    { key: "home_testimonials_kicker", label: "Testimonials Kicker" },
    { key: "home_testimonials_title", label: "Testimonials Titel" },
    { key: "home_testimonials_description", label: "Testimonials Beschreibung", multiline: true },
    { key: "home_team_kicker", label: "Team Kicker" },
    { key: "home_team_title", label: "Team Titel" },
    { key: "home_team_description", label: "Team Beschreibung", multiline: true },
    { key: "home_faq_kicker", label: "FAQ Kicker" },
    { key: "home_faq_title", label: "FAQ Titel" },
    { key: "home_contact_kicker", label: "Kontakt Kicker" },
    { key: "home_contact_title", label: "Kontakt Titel" },
  ]
};

const jsonFields = [
  { key: "home_why_choose_points", label: "Warum-Wir Punkte (JSON)" },
  { key: "home_trust_points", label: "Trust Punkte (JSON)" },
  { key: "home_audience_items", label: "Zielgruppen Items (JSON)" },
  { key: "home_process_steps", label: "Ablauf Schritte (JSON)" },
];

const quillModules = {
  toolbar: [
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    ['link'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['clean']
  ]
};

const AdminHomepage = () => {
  const queryClient = useQueryClient();
  const { activeSiteId } = useSiteContext();
  const siteId = activeSiteId || DEFAULT_SITE_ID;
  const { settings, isLoading } = useSiteSettings();
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      const strings: Record<string, string> = {};
      Object.entries(settings).forEach(([k, v]) => {
        if (typeof v === "string") {
          strings[k] = v;
        } else {
          strings[k] = JSON.stringify(v, null, 2);
        }
      });
      setForm(strings);
    } else {
      const init: Record<string, string> = { ...defaultSiteText };
      jsonFields.forEach((f) => {
        init[f.key] = JSON.stringify(jsonDefaults[f.key], null, 2);
      });
      setForm(init);
    }
  }, [settings]);

  const mutation = useMutation({
    mutationFn: async (values: Record<string, string>) => {
      const promises = Object.entries(values).map(async ([key, value]) => {
        let valToSave = value;
        if (jsonFields.some((f) => f.key === key)) {
          try {
            JSON.parse(value);
            valToSave = value;
          } catch (e) {
            console.warn(`Could not parse JSON for ${key}`);
          }
        }
        
        await upsertSiteSetting(siteId, key, valToSave);
      });
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site_settings", siteId] });
      toast.success("Homepage-Inhalte erfolgreich gespeichert.");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Fehler beim Speichern");
    },
  });

  const renderFields = (fields: {key: string, label: string, multiline?: boolean}[]) => (
    <div className="grid gap-6 md:grid-cols-2 mt-6">
      {fields.map((field) => (
        <div key={field.key} className={`space-y-2 ${field.multiline ? 'md:col-span-2' : ''}`}>
          <Label htmlFor={field.key} className="text-slate-700 font-semibold">{field.label}</Label>
          {field.multiline ? (
            <div className="bg-white rounded-xl overflow-hidden border border-slate-200 focus-within:border-[#FF4B2C] transition-colors [&_.ql-editor]:min-h-[180px] [&_.ql-toolbar]:border-none [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-slate-200 [&_.ql-container]:border-none">
              <ReactQuill
                theme="snow"
                modules={quillModules}
                value={form[field.key] || ""}
                onChange={(val) => setForm((prev) => ({ ...prev, [field.key]: val }))}
              />
            </div>
          ) : (
            <Input
              id={field.key}
              className="rounded-xl border-slate-200 bg-slate-50 focus:border-[#FF4B2C]"
              value={form[field.key] || ""}
              onChange={(event) => setForm((prev) => ({ ...prev, [field.key]: event.target.value }))}
            />
          )}
        </div>
      ))}
    </div>
  );

  if (isLoading) return <div className="p-6 text-slate-500 font-medium">Laden...</div>;

  return (
    <div className="p-6 md:p-10 max-w-6xl">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Homepage Inhalte</h1>
          <p className="mt-2 text-sm text-slate-500">Passe alle Texte, Überschriften und JSON-Listen der Startseite an.</p>
        </div>
        <Button 
          onClick={() => mutation.mutate(form)} 
          disabled={mutation.isPending}
          className="rounded-xl bg-[#FF4B2C] hover:bg-[#E03A1E] text-white px-6 py-5 shadow-md shadow-[#FF4B2C]/20 transition-transform hover:scale-105"
        >
          <Save size={18} className="mr-2" />
          {mutation.isPending ? "Speichere..." : "Alle Inhalte speichern"}
        </Button>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <Tabs defaultValue="intro" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 mb-8 h-auto bg-slate-100 rounded-2xl p-1 gap-1">
            <TabsTrigger value="intro" className="rounded-xl py-3 data-[state=active]:bg-white data-[state=active]:text-[#FF4B2C] data-[state=active]:shadow-sm transition-all">Intro</TabsTrigger>
            <TabsTrigger value="whyTrust" className="rounded-xl py-3 data-[state=active]:bg-white data-[state=active]:text-[#FF4B2C] data-[state=active]:shadow-sm transition-all">Vertrauen</TabsTrigger>
            <TabsTrigger value="servicesShop" className="rounded-xl py-3 data-[state=active]:bg-white data-[state=active]:text-[#FF4B2C] data-[state=active]:shadow-sm transition-all">Leistungen</TabsTrigger>
            <TabsTrigger value="audienceProcess" className="rounded-xl py-3 data-[state=active]:bg-white data-[state=active]:text-[#FF4B2C] data-[state=active]:shadow-sm transition-all">Ablauf</TabsTrigger>
            <TabsTrigger value="contactFaq" className="rounded-xl py-3 data-[state=active]:bg-white data-[state=active]:text-[#FF4B2C] data-[state=active]:shadow-sm transition-all">Kontakt</TabsTrigger>
            <TabsTrigger value="json" className="rounded-xl py-3 data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all">Daten (JSON)</TabsTrigger>
          </TabsList>
          
          <TabsContent value="intro" className="mt-0 outline-none">{renderFields(textGroups.intro)}</TabsContent>
          <TabsContent value="whyTrust" className="mt-0 outline-none">{renderFields(textGroups.whyTrust)}</TabsContent>
          <TabsContent value="servicesShop" className="mt-0 outline-none">{renderFields(textGroups.servicesShop)}</TabsContent>
          <TabsContent value="audienceProcess" className="mt-0 outline-none">{renderFields(textGroups.audienceProcess)}</TabsContent>
          <TabsContent value="contactFaq" className="mt-0 outline-none">{renderFields(textGroups.contactFaq)}</TabsContent>

          <TabsContent value="json" className="mt-0 outline-none">
            <div className="grid gap-6 md:grid-cols-2 mt-6">
              {jsonFields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label htmlFor={field.key} className="text-slate-700 font-semibold">{field.label}</Label>
                  <Textarea
                    id={field.key}
                    rows={12}
                    className="font-mono text-xs rounded-xl border-slate-200 bg-slate-950 text-emerald-400 p-4 focus:border-[#FF4B2C] leading-relaxed"
                    value={form[field.key] || ""}
                    onChange={(event) => setForm((prev) => ({ ...prev, [field.key]: event.target.value }))}
                  />
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminHomepage;