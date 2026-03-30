import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, Globe, Loader2, Plus, RefreshCw, ShieldCheck, Star, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { useSiteContext } from "@/context/SiteContext";
import { useBilling } from "@/hooks/useBilling";
import { formatUsageLabel } from "@/lib/billing";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ModuleLockedState from "@/components/admin/ModuleLockedState";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type TenantSiteRole = "owner" | "admin" | "editor" | "viewer";

type SiteDomainRow = {
  id: string;
  site_id: string;
  hostname: string;
  is_primary: boolean;
  verification_status?: "pending" | "verified" | "failed";
  verification_message?: string | null;
  ssl_status?: "pending" | "active" | "failed";
  last_checked_at?: string | null;
  created_at: string | null;
  updated_at: string | null;
};

const normalizeHostname = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "")
    .replace(/:+\d+$/, "");

const statusClasses: Record<string, string> = {
  verified: "bg-emerald-50 text-emerald-700 hover:bg-emerald-50",
  pending: "bg-amber-50 text-amber-700 hover:bg-amber-50",
  failed: "bg-red-50 text-red-700 hover:bg-red-50",
  active: "bg-emerald-50 text-emerald-700 hover:bg-emerald-50",
};

const AdminDomains = () => {
  const { user, isGlobalAdmin, loading } = useAuth();
  const { activeSiteId, activeSite } = useSiteContext();
  const { plan, entitlements, usage } = useBilling();
  const [newDomain, setNewDomain] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const domainsQuery = useQuery({
    queryKey: ["tenant-domains", activeSiteId],
    enabled: Boolean(activeSiteId && canManageDomains),
    queryFn: async (): Promise<SiteDomainRow[]> => {
      const { data, error } = await supabase
        .from("site_domains" as never)
        .select("id, site_id, hostname, is_primary, verification_status, verification_message, ssl_status, last_checked_at, created_at, updated_at")
        .eq("site_id", activeSiteId)
        .order("is_primary", { ascending: false })
        .order("hostname", { ascending: true });
      if (error) throw error;
      return (data as SiteDomainRow[] | null) ?? [];
    },
  });

  const refreshDomains = async () => {
    setFormError(null);
    await domainsQuery.refetch();
  };

  const addDomainMutation = useMutation({
    mutationFn: async () => {
      const hostname = normalizeHostname(newDomain);
      if (!hostname) throw new Error("Bitte gib eine Domain ein.");
      const { data, error } = await supabase.functions.invoke("manage-site-domain", {
        body: {
          action: "add",
          site_id: activeSiteId,
          hostname,
        },
      });
      if (error) throw new Error(error.message || "Domain konnte nicht gespeichert werden.");
      const response = (data ?? {}) as { error?: string; message?: string };
      if (response.error) throw new Error(response.error);
      return response;
    },
    onSuccess: async (data) => {
      setNewDomain("");
      setFormError(null);
      await refreshDomains();
      toast.success(data.message || "Domain wurde hinzugefügt.");
    },
    onError: (error) => {
      setFormError(error instanceof Error ? error.message : "Domain konnte nicht gespeichert werden.");
    },
  });

  const makePrimaryMutation = useMutation({
    mutationFn: async (domainId: string) => {
      const { data, error } = await supabase.functions.invoke("manage-site-domain", {
        body: {
          action: "set_primary",
          site_id: activeSiteId,
          domain_id: domainId,
        },
      });
      if (error) throw new Error(error.message || "Primärdomain konnte nicht gesetzt werden.");
      const response = (data ?? {}) as { error?: string; message?: string };
      if (response.error) throw new Error(response.error);
      return response;
    },
    onSuccess: async (data) => {
      await refreshDomains();
      toast.success(data.message || "Primärdomain wurde aktualisiert.");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Primärdomain konnte nicht gesetzt werden.");
    },
  });

  const removeDomainMutation = useMutation({
    mutationFn: async (domainId: string) => {
      const { data, error } = await supabase.functions.invoke("manage-site-domain", {
        body: {
          action: "remove",
          site_id: activeSiteId,
          domain_id: domainId,
        },
      });
      if (error) throw new Error(error.message || "Domain konnte nicht entfernt werden.");
      const response = (data ?? {}) as { error?: string; message?: string };
      if (response.error) throw new Error(response.error);
      return response;
    },
    onSuccess: async (data) => {
      await refreshDomains();
      toast.success(data.message || "Domain wurde entfernt.");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Domain konnte nicht entfernt werden.");
    },
  });

  const verifyDomainMutation = useMutation({
    mutationFn: async (domainId: string) => {
      const { data, error } = await supabase.functions.invoke("verify-site-domain", {
        body: { site_id: activeSiteId, domain_id: domainId },
      });
      if (error) throw new Error(error.message || "Domain-Prüfung fehlgeschlagen.");
      const response = (data ?? {}) as { error?: string; message?: string; verified?: boolean };
      if (response.error) throw new Error(response.error);
      return response;
    },
    onSuccess: async (data) => {
      await refreshDomains();
      toast.success(data.message || (data.verified ? "Domain verifiziert." : "Domain geprüft."));
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Domain-Prüfung fehlgeschlagen.");
    },
  });

  const rows = useMemo(() => domainsQuery.data ?? [], [domainsQuery.data]);
  const domainsAtLimit = usage.customDomains >= entitlements.maxCustomDomains;

  if (!loading && !hasSaasAccess) {
    return (
      <ModuleLockedState
        title="SaaS-Domain-Management ist gesperrt"
        description="Eigene Domains, DNS-Self-Service und Tenant-White-Label-Domains sind für diesen Tenant aktuell nicht freigeschaltet."
      />
    );
  }

  if (!loading && !canManageDomains) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-10 md:px-10">
        <Card className="mx-auto max-w-2xl rounded-[2rem] border-slate-200">
          <CardHeader>
            <CardTitle>Kein Zugriff</CardTitle>
            <CardDescription>Die Domain-Verwaltung ist nur für Owner, Admins und Global Admins freigeschaltet.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8 md:px-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge className="rounded-full bg-[#FF4B2C]/10 px-3 py-1 text-[#FF4B2C] hover:bg-[#FF4B2C]/10">
              Self-Service · Domains
            </Badge>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">Domain-Management</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-500">
              Verwalte die Custom Domains für <span className="font-semibold text-slate-700">{activeSite?.name ?? activeSiteId}</span>. DNS-Prüfung, Primärdomain und Limits sind direkt im Tenant-Workspace sichtbar.
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-slate-200 bg-white px-5 py-4 text-sm shadow-sm">
            <p className="font-semibold text-slate-900">Aktiver Plan</p>
            <p className="mt-2 text-lg font-black text-slate-900">{plan.name}</p>
            <p className="mt-1 text-slate-500">{formatUsageLabel(usage.customDomains, entitlements.maxCustomDomains, "Domain")}</p>
          </div>
        </div>

        <Card className="rounded-[2rem] border-amber-200 bg-amber-50/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900"><ShieldCheck size={18} /> DNS- & Infrastruktur-Hinweis</CardTitle>
            <CardDescription className="text-amber-800/90">
              Damit unsere Plattform deine Domain ausliefern kann, muss dein Kunde bei seinem Provider einen <strong>CNAME auf eure Plattform-Domain</strong> oder einen <strong>A-Record auf eure feste Server-IP</strong> setzen. Der Stack läuft hinter Cloudflare (Full Strict) und Nginx/Coolify.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-amber-900/90">
            <ul className="list-disc space-y-1 pl-5">
              <li>Domain beim Provider anlegen und DNS setzen.</li>
              <li>Danach hier „DNS prüfen“ klicken.</li>
              <li>Erst bei erfolgreicher Prüfung auf „Primärdomain“ setzen.</li>
            </ul>
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <Card className="rounded-[2rem] border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Globe size={18} /> Zugeordnete Domains</CardTitle>
              <CardDescription>Eine Primärdomain steuert den kanonischen Host, weitere Domains laufen als Aliase oder Migrations-Hosts.</CardDescription>
            </CardHeader>
            <CardContent>
              {domainsQuery.isLoading ? (
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                  <Loader2 className="animate-spin" size={18} /> Domains werden geladen...
                </div>
              ) : rows.length ? (
                <div className="space-y-4">
                  {rows.map((domain) => (
                    <div key={domain.id} className="rounded-[1.5rem] border border-slate-200 bg-white p-4">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-slate-900">{domain.hostname}</p>
                            {domain.is_primary ? <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">Primär</Badge> : null}
                            <Badge className={statusClasses[domain.verification_status || "pending"] || statusClasses.pending}>{domain.verification_status || "pending"}</Badge>
                            <Badge className={statusClasses[domain.ssl_status || "pending"] || statusClasses.pending}>SSL {domain.ssl_status || "pending"}</Badge>
                          </div>
                          <p className="text-xs text-slate-500">Letzte DNS-Prüfung: {domain.last_checked_at ? new Date(domain.last_checked_at).toLocaleString("de-DE") : "Noch nie geprüft"}</p>
                          <p className="text-sm leading-6 text-slate-600">{domain.verification_message || "DNS noch nicht geprüft. Setze beim Provider den passenden CNAME/A-Record und starte danach die Prüfung."}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button type="button" variant="outline" className="rounded-xl" disabled={verifyDomainMutation.isPending} onClick={() => verifyDomainMutation.mutate(domain.id)}>
                            {verifyDomainMutation.isPending ? <Loader2 size={16} className="mr-2 animate-spin" /> : <RefreshCw size={16} className="mr-2" />}
                            DNS prüfen
                          </Button>
                          <Button type="button" variant={domain.is_primary ? "outline" : "default"} className={domain.is_primary ? "rounded-xl" : "rounded-xl bg-[#FF4B2C] text-white hover:bg-[#E03A1E]"} disabled={domain.is_primary || makePrimaryMutation.isPending} onClick={() => makePrimaryMutation.mutate(domain.id)}>
                            {makePrimaryMutation.isPending ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Star size={16} className="mr-2" />}
                            Als Primärdomain setzen
                          </Button>
                          <Button type="button" variant="outline" className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700" disabled={removeDomainMutation.isPending} onClick={() => removeDomainMutation.mutate(domain.id)}>
                            {removeDomainMutation.isPending ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Trash2 size={16} className="mr-2" />}
                            Entfernen
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-sm text-slate-500">
                  Für diese Site ist noch keine eigene Domain hinterlegt.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Plus size={18} /> Neue Domain hinzufügen</CardTitle>
              <CardDescription>Hostname ohne Leerzeichen, Protokoll oder Pfad. Das Plan-Limit wird serverseitig geprüft.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {formError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</div>
              ) : null}

              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 text-xs leading-6 text-slate-600">
                <p><strong>Limit im aktuellen Plan:</strong> {formatUsageLabel(usage.customDomains, entitlements.maxCustomDomains, "Domain")}</p>
                <p>Neue Domains starten immer mit Status <strong>pending</strong>. Nach dem Speichern bitte direkt die DNS-Prüfung auslösen.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-domain">Hostname</Label>
                <Input id="new-domain" value={newDomain} onChange={(event) => { setNewDomain(event.target.value); setFormError(null); }} placeholder="kunde.example.com" />
                <p className="text-xs text-slate-500">Keine Leerzeichen, kein http/https, kein Pfad.</p>
              </div>

              <Button type="button" onClick={() => addDomainMutation.mutate()} disabled={addDomainMutation.isPending || !newDomain.trim() || domainsAtLimit} className="w-full rounded-xl bg-[#FF4B2C] text-white hover:bg-[#E03A1E] disabled:cursor-not-allowed disabled:opacity-60">
                {addDomainMutation.isPending ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Plus size={16} className="mr-2" />}
                {domainsAtLimit ? "Domain-Limit erreicht" : "Domain speichern"}
              </Button>

              {domainsAtLimit ? (
                <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
                  <div className="flex items-start gap-2">
                    <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                    <p>Für zusätzliche Domains musst du den Plan im Billing-Bereich anheben.</p>
                  </div>
                </div>
              ) : null}

              <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-900">
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
                  <p>Nach erfolgreicher DNS-Prüfung siehst du den Status direkt in der Liste. So weiß der Kunde sofort, ob das Routing bei uns angekommen ist.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDomains;
