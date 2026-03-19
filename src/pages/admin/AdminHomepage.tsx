import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import {
  defaultAudienceItems,
  defaultProcessSteps,
  defaultSiteText,
  defaultTestimonials,
  defaultWhyChoosePoints,
  useSiteSettings,
} from "@/hooks/useSiteSettings";
import { toast } from "sonner";

const jsonDefaults: Record<string, unknown> = {
  home_why_choose_points: defaultWhyChoosePoints,
  home_audience_items: defaultAudienceItems,
  home_process_steps: defaultProcessSteps,
  home_testimonials: defaultTestimonials,
};

const textFields = [
  { key: "home_header_topbar", label: "Topbar Text" },
  { key: "home_intro_title", label: "Intro Titel" },
  { key: "home_intro_body", label: "Intro Text", multiline: true },
  { key: "home_why_choose_kicker", label: "Warum-Section Kicker" },
  { key: "home_why_choose_title", label: "Warum-Section Titel" },
  { key: "home_why_choose_description", label: "Warum-Section Beschreibung", multiline: true },
  { key: "home_audience_kicker", label: "Zielgruppen Kicker" },
  { key: "home_audience_title", label: "Zielgruppen Titel" },
  { key: "home_audience_description", label: "Zielgruppen Beschreibung", multiline: true },
  { key: "home_services_kicker", label: "Leistungen Kicker" },
  { key: "home_services_title", label: "Leistungen Titel" },
  { key: "home_services_description", label: "Leistungen Beschreibung", multiline: true },
  { key: "home_portfolio_kicker", label: "Portfolio Kicker" },
  { key: "home_portfolio_title", label: "Portfolio Titel", multiline: true },
  { key: "home_process_kicker", label: "Ablauf Kicker" },
  { key: "home_process_title", label: "Ablauf Titel", multiline: true },
  { key: "home_shop_kicker", label: "Shop Kicker" },
  { key: "home_shop_title", label: "Shop Titel" },
  { key: "home_shop_description", label: "Shop Beschreibung", multiline: true },
  { key: "home_testimonials_kicker", label: "Testimonials Kicker" },
  { key: "home_testimonials_title", label: "Testimonials Titel" },
  { key: "home_contact_kicker", label: "Kontakt Kicker" },
  { key: "home_contact_title", label: "Kontakt Titel" },
  { key: "home_contact_description", label: "Kontakt Beschreibung", multiline: true },
  { key: "home_faq_kicker", label: "FAQ Kicker" },
  { key: "home_faq_title", label: "FAQ Titel" },
];

const jsonFields = [
  { key: "home_why_choose_points", label: "Warum-Section Punkte (JSON)" },
  { key: "home_audience_items", label: "Zielgruppen Cards (JSON)" },
  { key: "home_process_steps", label: "Ablauf Schritte (JSON)" },
  { key: "home_testimonials", label: "Testimonials (JSON)" },
];

const AdminHomepage = () => {
  const queryClient = useQueryClient();
  const { settings, isLoading } = useSiteSettings();
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    const nextForm: Record<string, string> = {};

    textFields.forEach(({ key }) => {
      nextForm[key] = settings[key] || defaultSiteText[key] || "";
    });

    jsonFields.forEach(({ key }) => {
      nextForm[key] = settings[key] || JSON.stringify(jsonDefaults[key], null, 2);
    });

    setForm(nextForm);
  }, [settings]);

  const mutation = useMutation({
    mutationFn: async (values: Record<string, string>) => {
      const payload = Object.entries(values).map(([key, value]) => ({ key, value }));
      const { error } = await supabase.from("site_settings").upsert(payload, { onConflict: "key" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site_settings"] });
      toast.success("Homepage-Inhalte gespeichert");
    },
    onError: () => toast.error("Speichern fehlgeschlagen"),
  });

  if (isLoading) return <div className="p-6">Laden...</div>;

  return (
    <div className="p-6 max-w-5xl">
      <h1 className="text-2xl font-bold mb-2">Homepage Inhalte</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Hier bearbeitest du alle statischen Texte und JSON-Inhalte der Startseite.
      </p>

      <div className="space-y-8">
        <section className="glass-card p-6 space-y-4">
          <h2 className="text-lg font-bold">Texte</h2>
          {textFields.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={field.key}>{field.label}</Label>
              {field.multiline ? (
                <Textarea
                  id={field.key}
                  rows={field.key.includes("title") ? 3 : 6}
                  value={form[field.key] || ""}
                  onChange={(event) => setForm((prev) => ({ ...prev, [field.key]: event.target.value }))}
                />
              ) : (
                <Input
                  id={field.key}
                  value={form[field.key] || ""}
                  onChange={(event) => setForm((prev) => ({ ...prev, [field.key]: event.target.value }))}
                />
              )}
            </div>
          ))}
        </section>

        <section className="glass-card p-6 space-y-4">
          <h2 className="text-lg font-bold">Listen / Cards (JSON)</h2>
          {jsonFields.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={field.key}>{field.label}</Label>
              <Textarea
                id={field.key}
                rows={12}
                value={form[field.key] || ""}
                onChange={(event) => setForm((prev) => ({ ...prev, [field.key]: event.target.value }))}
              />
            </div>
          ))}
        </section>
      </div>

      <div className="mt-8">
        <Button onClick={() => mutation.mutate(form)} disabled={mutation.isPending}>
          {mutation.isPending ? "Speichere..." : "Homepage speichern"}
        </Button>
      </div>
    </div>
  );
};

export default AdminHomepage;
