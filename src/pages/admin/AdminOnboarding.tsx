import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CheckCircle2, ChevronRight, Loader2, Palette, Rocket, Sparkles, Wand2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSiteContext } from "@/context/SiteContext";
import { DEFAULT_SITE_ID } from "@/lib/site";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";

type SiteTemplateRow = {
  id: string;
  name: string;
  slug: string;
  industry: string | null;
  description: string | null;
  preview_image: string | null;
  source_site_id: string | null;
  template_payload: Record<string, unknown> | null;
};

type BootstrapResponse = {
  site?: {
    id?: string;
    slug?: string;
    name?: string;
  };
  error?: string;
};

type WizardStep = 1 | 2 | 3;

const normalizeSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);

const normalizeHostname = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "")
    .replace(/:+\d+$/, "");

const steps = [
  { id: 1, label: "Template" },
  { id: 2, label: "Firmendaten" },
  { id: 3, label: "Bestätigung" },
] as const;

const defaultTemplatePayload = {
  seed_kind: "default",
  wizard_theme: "clean",
  faq_seed_count: 5,
  recommended_plan: "starter",
};

const getTemplateSourceLabel = (template: SiteTemplateRow, siteNameMap: Map<string, string>) => {
  if (!template.source_site_id) return "Ohne feste Source Site";
  if (template.source_site_id === DEFAULT_SITE_ID) return "Platform Default (Hub)";
  return siteNameMap.get(template.source_site_id) ?? template.source_site_id;
};

const renderTemplatePills = (template: SiteTemplateRow) => {
  const payload = template.template_payload ?? {};
  const recommendedPlan = typeof payload.recommended_plan === "string" ? payload.recommended_plan : "starter";
  const faqCount = typeof payload.faq_seed_count === "number" ? payload.faq_seed_count : 5;
  return [
    template.industry || "general",
    `${faqCount} FAQ`,
    `Plan ${recommendedPlan}`,
  ];
};

const TemplatePreview = ({ template }: { template: SiteTemplateRow }) => {
  const pills = renderTemplatePills(template);
  const initials = template.name
    .split(" ")
    .map((part) => part.slice(0, 1).toUpperCase())
    .slice(0, 2)
    .join("");

  return (
    <div className="relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-800 to-slate-700 p-5 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,75,44,0.30),transparent_34%)]" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/12 text-sm font-black tracking-[0.2em]">{initials || "DP"}</div>
          <p className="mt-4 text-lg font-black tracking-tight">{template.name}</p>
          <p className="mt-1 text-sm text-white/75">{template.description || "Neutrales White-Label-Startertemplate."}</p>
        </div>
        <Badge className="border-white/15 bg-white/10 text-white hover:bg-white/10">Template</Badge>
      </div>
      <div className="relative mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white/10 p-3">
          <div className="text-[11px] uppercase tracking-[0.2em] text-white/55">Hero</div>
          <div className="mt-2 h-16 rounded-xl bg-white/10" />
        </div>
        <div className="rounded-2xl bg-white/10 p-3">
          <div className="text-[11px] uppercase tracking-[0.2em] text-white/55">Pages</div>
          <div className="mt-2 space-y-2">
            <div className="h-3 rounded-full bg-white/20" />
            <div className="h-3 w-3/4 rounded-full bg-white/15" />
            <div className="h-3 w-2/3 rounded-full bg-white/15" />
          </div>
        </div>
      </div>
      <div className="relative mt-5 flex flex-wrap gap-2">
        {pills.map((pill) => (
          <span key={`${template.id}-${pill}`} className="rounded-full border border-white/12 bg-white/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/80">
            {pill}
          </span>
        ))}
      </div>
    </div>
  );
};

const AdminOnboarding = () => {
  const { isGlobalAdmin, loading } = useAuth();
  const { activeSite, availableSites, refetchSites, setActiveSiteId } = useSiteContext();
  const navigate = useNavigate();

  const [step, setStep] = useState<WizardStep>(1);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [companyName, setCompanyName] = useState("");
  const [slug, setSlug] = useState("");
  const [primaryDomain, setPrimaryDomain] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const templatesQuery = useQuery({
    queryKey: ["admin-onboarding-templates"],
    enabled: isGlobalAdmin,
    queryFn: async (): Promise<SiteTemplateRow[]> => {
      const { data, error } = await supabase
        .from("site_templates" as never)
        .select("id, name, slug, industry, description, preview_image, source_site_id, template_payload")
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (error) throw error;
      return ((data as SiteTemplateRow[] | null) ?? []);
    },
  });

  const selectedTemplate = useMemo(
    () => templatesQuery.data?.find((template) => template.id === selectedTemplateId) ?? null,
    [selectedTemplateId, templatesQuery.data],
  );

  const siteNameMap = useMemo(() => new Map(availableSites.map((site) => [site.id, site.name])), [availableSites]);
  const activeWorkspaceLabel = activeSite?.name ?? "Keine aktive Site";

  const seedTemplateMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from("site_templates" as never)
        .insert({
          name: "Digital Perfect SaaS Default",
          slug: `digital-perfect-default-${Date.now()}`,
          industry: "general",
          description: "Standard-Startertemplate für neue SaaS-Tenants.",
          is_active: true,
          source_site_id: DEFAULT_SITE_ID,
          preview_image: null,
          template_payload: defaultTemplatePayload,
        })
        .select("id")
        .single();

      if (error) throw error;
      return data as { id: string };
    },
    onSuccess: async (data) => {
      await templatesQuery.refetch();
      if (data?.id) setSelectedTemplateId(data.id);
      toast.success("Standard-Template wurde generiert.");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Template konnte nicht erstellt werden.");
    },
  });

  const bootstrapMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        templateId: selectedTemplateId,
        companyName: companyName.trim(),
        slug: normalizeSlug(slug || companyName),
        primaryDomain: normalizeHostname(primaryDomain) || null,
        description: description.trim() || null,
      };

      const { data, error } = await supabase.functions.invoke("bootstrap-tenant", {
        body: payload,
      });

      if (error) throw new Error(error.message || "Tenant-Bootstrap fehlgeschlagen.");
      const response = (data ?? {}) as BootstrapResponse;
      if (response.error) throw new Error(response.error);
      if (!response.site?.id) throw new Error("Die Edge Function hat keine neue Site-ID zurückgegeben.");
      return response.site;
    },
    onSuccess: async (site) => {
      await refetchSites();
      if (site.id) setActiveSiteId(site.id);
      toast.success(`${site.name ?? companyName} wurde erfolgreich angelegt.`);
      navigate("/admin", { replace: true });
    },
    onError: (error) => {
      setFormError(error instanceof Error ? error.message : "Tenant-Bootstrap fehlgeschlagen.");
    },
  });

  if (!loading && !isGlobalAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-10 md:px-10">
        <Card className="mx-auto max-w-2xl rounded-[2rem] border-slate-200">
          <CardHeader>
            <CardTitle>Kein Zugriff</CardTitle>
            <CardDescription>Der Tenant-Onboarding-Wizard ist nur für Global Admins freigeschaltet.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const normalizedSlug = normalizeSlug(slug || companyName);
  const progressValue = step === 1 ? 33 : step === 2 ? 66 : 100;
  const canContinueFromTemplate = Boolean(selectedTemplateId);
  const canContinueFromCompany = Boolean(selectedTemplateId && companyName.trim() && normalizedSlug);

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8 md:px-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge className="rounded-full bg-[#FF4B2C]/10 px-3 py-1 text-[#FF4B2C] hover:bg-[#FF4B2C]/10">
              Platform · Tenant Setup
            </Badge>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">Tenant-Onboarding Wizard</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-500">
              Wähle ein Template, definiere Firmendaten und stoße den sicheren Bootstrap exakt einmal über die Edge Function an.
            </p>
          </div>
          <div className="w-full max-w-sm rounded-[1.5rem] border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              <span>Wizard-Fortschritt</span>
              <span>{progressValue}%</span>
            </div>
            <Progress className="mt-3 h-2" value={progressValue} />
            <div className="mt-4 flex items-center gap-3">
              {steps.map((wizardStep) => {
                const isActive = wizardStep.id === step;
                const isComplete = wizardStep.id < step;
                return (
                  <div key={wizardStep.id} className="flex items-center gap-2">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm font-bold ${isComplete ? "border-emerald-200 bg-emerald-50 text-emerald-600" : isActive ? "border-[#FF4B2C]/30 bg-[#FF4B2C] text-white" : "border-slate-200 bg-white text-slate-400"}`}>
                      {isComplete ? <CheckCircle2 size={16} /> : wizardStep.id}
                    </div>
                    <span className={`hidden text-sm font-semibold sm:block ${isActive ? "text-slate-900" : "text-slate-400"}`}>{wizardStep.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {formError ? (
          <Card className="rounded-[1.75rem] border border-red-200 bg-red-50">
            <CardContent className="p-5 text-sm text-red-700">{formError}</CardContent>
          </Card>
        ) : null}

        <Card className="rounded-[1.75rem] border border-[#FF4B2C]/15 bg-[#FFF5F3]">
          <CardContent className="flex flex-col gap-4 p-5 text-sm text-slate-700 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#FF4B2C]">Platform-Kontext</p>
              <p className="mt-2 font-semibold text-slate-900">Aktuell geöffneter Workspace: {activeWorkspaceLabel}</p>
              <p className="mt-1 max-w-3xl leading-6 text-slate-600">
                Tenant Setup arbeitet bewusst plattformweit. Die aktive Site im Admin dient hier nur als aktueller Workspace und wird nicht als Bootstrap-Quelle verwendet. Entscheidend ist ausschließlich das ausgewählte Template.
              </p>
            </div>
            {selectedTemplate ? (
              <div className="rounded-[1.25rem] border border-[#FF4B2C]/20 bg-white px-4 py-3 text-sm">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Aktuelle Template-Quelle</p>
                <p className="mt-2 font-semibold text-slate-900">{getTemplateSourceLabel(selectedTemplate, siteNameMap)}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {step === 1 ? (
          <Card className="rounded-[2rem] border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Sparkles size={18} /> Template-Auswahl</CardTitle>
              <CardDescription>
                Wähle die Ausgangsbasis für den neuen Tenant. Leere Zustände lassen sich direkt aus dem Default-Hub seedbar machen.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {templatesQuery.isLoading ? (
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                  <Loader2 className="animate-spin" size={18} /> Templates werden geladen...
                </div>
              ) : templatesQuery.data?.length ? (
                <div className="grid gap-5 xl:grid-cols-2">
                  {templatesQuery.data.map((template) => {
                    const isSelected = template.id === selectedTemplateId;
                    return (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => {
                          setSelectedTemplateId(template.id);
                          setFormError(null);
                        }}
                        className={`overflow-hidden rounded-[1.75rem] border text-left transition-all ${isSelected ? "border-[#FF4B2C] bg-[#FFF5F3] shadow-lg shadow-[#FF4B2C]/10" : "border-slate-200 bg-white hover:border-[#FF4B2C]/30 hover:shadow-md"}`}
                      >
                        <div className="grid gap-4 p-4 lg:grid-cols-[1.15fr_0.85fr]">
                          <TemplatePreview template={template} />
                          <div className="space-y-4 p-1">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-xl font-black tracking-tight text-slate-900">{template.name}</h3>
                                {isSelected ? <Badge className="bg-[#FF4B2C] text-white hover:bg-[#FF4B2C]">Ausgewählt</Badge> : null}
                              </div>
                              <p className="mt-2 text-sm leading-6 text-slate-500">{template.description || "Neutrales White-Label-Startertemplate."}</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {renderTemplatePills(template).map((pill) => (
                                <Badge key={`${template.id}-${pill}`} variant="secondary" className="rounded-full bg-slate-100 text-slate-700 hover:bg-slate-100">{pill}</Badge>
                              ))}
                            </div>
                            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 text-xs leading-6 text-slate-600">
                              <p><strong>Source Site:</strong> {getTemplateSourceLabel(template, siteNameMap)}</p>
                              <p><strong>Slug:</strong> {template.slug}</p>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50 p-6">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-base font-bold text-slate-900">Es sind aktuell keine aktiven Templates verfügbar.</p>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                        Du kannst jetzt direkt ein Standard-Template aus der Default-Site erzeugen. Danach ist der Wizard sofort nutzbar.
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={() => seedTemplateMutation.mutate()}
                      disabled={seedTemplateMutation.isPending}
                      className="rounded-xl bg-[#FF4B2C] text-white hover:bg-[#E03A1E]"
                    >
                      {seedTemplateMutation.isPending ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Wand2 size={16} className="mr-2" />}
                      Standard-Template generieren
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap justify-end gap-3">
                <Button type="button" disabled={!canContinueFromTemplate} onClick={() => setStep(2)} className="rounded-xl bg-[#FF4B2C] text-white hover:bg-[#E03A1E]">
                  Weiter zu Firmendaten <ChevronRight size={16} className="ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {step === 2 ? (
          <Card className="rounded-[2rem] border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Palette size={18} /> Firmendaten & Launch-Setup</CardTitle>
              <CardDescription>Definiere die zentralen Tenant-Infos. Der eigentliche Bootstrap läuft erst im letzten Schritt.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Firmenname</Label>
                  <Input id="company-name" value={companyName} onChange={(event) => { setCompanyName(event.target.value); if (!slug.trim()) setSlug(normalizeSlug(event.target.value)); }} placeholder="Media-Bro GmbH" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="site-slug">Gewünschter Slug</Label>
                  <Input id="site-slug" value={slug} onChange={(event) => setSlug(normalizeSlug(event.target.value))} placeholder="media-bro" />
                  <p className="text-xs text-slate-500">Normalisiert zu: <span className="font-semibold text-slate-700">{normalizedSlug || "—"}</span></p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primary-domain">Optionale Hauptdomain</Label>
                  <Input id="primary-domain" value={primaryDomain} onChange={(event) => setPrimaryDomain(event.target.value)} placeholder="media-bro.com" />
                  <p className="text-xs text-slate-500">Ohne http/https. DNS kann später in der Domain-Verwaltung geprüft werden.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tenant-description">Kurzbeschreibung</Label>
                  <Textarea id="tenant-description" value={description} onChange={(event) => setDescription(event.target.value)} rows={5} placeholder="Kurze interne Beschreibung für den Tenant, Branche, Zielgruppe, Besonderheiten ..." />
                </div>
              </div>
              <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Launch-Vorschau</p>
                <div className="mt-4 space-y-4">
                  <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Template</p>
                    <p className="mt-2 text-lg font-bold text-slate-900">{selectedTemplate?.name ?? "—"}</p>
                    <p className="mt-1 text-xs text-slate-500">Quelle: {selectedTemplate ? getTemplateSourceLabel(selectedTemplate, siteNameMap) : "—"}</p>
                  </div>
                  <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Tenant-URL intern</p>
                    <p className="mt-2 text-lg font-bold text-slate-900">/{normalizedSlug || "tenant-slug"}</p>
                  </div>
                  <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600">
                    <p>Nach dem Bootstrap solltest du direkt prüfen:</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                      <li>Branding & Hero</li>
                      <li>Domain-Zuordnung</li>
                      <li>Billing & Limits</li>
                      <li>Team-Zugänge / Invites</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap justify-between gap-3 lg:col-span-2">
                <Button type="button" variant="outline" className="rounded-xl" onClick={() => setStep(1)}>Zurück zur Template-Auswahl</Button>
                <Button type="button" disabled={!canContinueFromCompany} onClick={() => setStep(3)} className="rounded-xl bg-[#FF4B2C] text-white hover:bg-[#E03A1E]">
                  Weiter zur Bestätigung <ChevronRight size={16} className="ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {step === 3 ? (
          <Card className="rounded-[2rem] border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Rocket size={18} /> Bestätigung & Bootstrap</CardTitle>
              <CardDescription>Im letzten Schritt wird die Edge Function exakt einmal ausgeführt und der neue Tenant atomar angelegt.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="space-y-4 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Firma</p>
                  <p className="mt-2 text-lg font-bold text-slate-900">{companyName}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Slug</p>
                  <p className="mt-2 text-lg font-bold text-slate-900">{normalizedSlug}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Primärdomain</p>
                  <p className="mt-2 text-lg font-bold text-slate-900">{normalizeHostname(primaryDomain) || "Noch nicht gesetzt"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Template</p>
                  <p className="mt-2 text-lg font-bold text-slate-900">{selectedTemplate?.name ?? "—"}</p>
                  <p className="mt-1 text-xs text-slate-500">Quelle: {selectedTemplate ? getTemplateSourceLabel(selectedTemplate, siteNameMap) : "—"}</p>
                </div>
              </div>
              <div className="rounded-[1.75rem] border border-[#FF4B2C]/15 bg-[#FFF5F3] p-5 text-sm leading-6 text-slate-700">
                <p className="font-bold text-slate-900">Was automatisch passiert</p>
                <ul className="mt-3 list-disc space-y-1 pl-5">
                  <li>Neue Site wird erstellt</li>
                  <li>Owner-Rolle wird gesetzt</li>
                  <li>Template-Inhalte werden atomar kopiert</li>
                  <li>Aktive Site wird nach Erfolg umgeschaltet</li>
                </ul>
                <p className="mt-4 text-xs text-slate-500">Falls Slug oder Domain bereits vergeben sind, fängt die UI den Fehler sauber ab.</p>
              </div>
              <div className="flex flex-wrap justify-between gap-3 lg:col-span-2">
                <Button type="button" variant="outline" className="rounded-xl" onClick={() => setStep(2)}>Zurück zu Firmendaten</Button>
                <Button type="button" onClick={() => bootstrapMutation.mutate()} disabled={bootstrapMutation.isPending || !selectedTemplateId || !companyName.trim() || !normalizedSlug} className="rounded-xl bg-[#FF4B2C] text-white hover:bg-[#E03A1E]">
                  {bootstrapMutation.isPending ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Rocket size={16} className="mr-2" />}
                  Tenant jetzt bootstrapen
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
};

export default AdminOnboarding;
