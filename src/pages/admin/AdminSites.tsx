import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Building2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSiteContext } from "@/context/SiteContext";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import DataTable from "@/components/admin/table/DataTable";
import DataTableColumnHeader from "@/components/admin/table/DataTableColumnHeader";

type SiteForm = {
  id?: string;
  name: string;
  slug: string;
  primary_domain: string;
  description: string;
  is_default: boolean;
  is_active: boolean;
};

type SiteRow = {
  id: string;
  name: string;
  slug: string;
  primary_domain: string | null;
  description: string | null;
  is_default: boolean;
  is_active: boolean;
  site_domains?: Array<{ hostname: string; is_primary: boolean }>;
};

const emptyForm: SiteForm = {
  name: "",
  slug: "",
  primary_domain: "",
  description: "",
  is_default: false,
  is_active: true,
};

const AdminSites = () => {
  const qc = useQueryClient();
  const { isGlobalAdmin } = useAuth();
  const { activeSiteId, setActiveSiteId, refetchSites, availableSites } = useSiteContext();
  const [form, setForm] = useState<SiteForm>(emptyForm);

  const { data: sites = [], isLoading } = useQuery({
    queryKey: ["sites-admin"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sites" as never).select("*, site_domains(hostname, is_primary)").order("created_at", { ascending: true });
      if (error) throw error;
      return (data as SiteRow[]) ?? [];
    },
  });

  const { data: siteModulesRows = [], isLoading: siteModulesLoading } = useQuery({
    queryKey: ["site-modules-admin", isGlobalAdmin],
    enabled: isGlobalAdmin,
    queryFn: async () => {
      const { data, error } = await supabase.from("site_modules" as never).select("site_id, has_forum, has_shop, has_seo_pro, updated_at");
      if (error) {
        const code = typeof (error as any)?.code === "string" ? (error as any).code : "";
        const message = typeof (error as any)?.message === "string" ? (error as any).message : "";
        if (code === "42P01" || code === "PGRST205" || (/site_modules/i.test(message) && /(schema cache|does not exist|relation)/i.test(message))) return [];
        throw error;
      }
      return (data as any[]) ?? [];
    },
  });

  const moduleRowsBySiteId = useMemo(() => new Map(siteModulesRows.map((row: any) => [row.site_id, row])), [siteModulesRows]);

  const saveSiteModules = useMutation({
    mutationFn: async ({ siteId, patch }: { siteId: string; patch: Record<string, boolean> }) => {
      const current = moduleRowsBySiteId.get(siteId) || {};
      const payload = {
        site_id: siteId,
        has_forum: Boolean(typeof patch.has_forum === "boolean" ? patch.has_forum : current.has_forum),
        has_shop: Boolean(typeof patch.has_shop === "boolean" ? patch.has_shop : current.has_shop),
        has_seo_pro: Boolean(typeof patch.has_seo_pro === "boolean" ? patch.has_seo_pro : current.has_seo_pro),
      };
      const { error } = await supabase.from("site_modules" as never).upsert(payload, { onConflict: "site_id" });
      if (error) throw error;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["site-modules-admin"] });
      await qc.invalidateQueries({ queryKey: ["site-modules"] });
      toast.success("Module aktualisiert.");
    },
    onError: (error: any) => toast.error(error?.message || "Module konnten nicht gespeichert werden."),
  });

  const siteOptions = useMemo(() => (isGlobalAdmin && sites.length ? sites : availableSites), [availableSites, isGlobalAdmin, sites]);

  const saveSite = useMutation({
    mutationFn: async (values: SiteForm) => {
      const payload = {
        id: values.id,
        name: values.name,
        slug: values.slug,
        description: values.description || null,
        primary_domain: values.primary_domain || null,
        is_default: values.is_default,
        is_active: values.is_active,
      };
      const { data, error } = await supabase.from("sites" as never).upsert(payload, { onConflict: "slug" }).select("id, primary_domain").single();
      if (error) throw error;
      if (values.primary_domain) {
        const { error: domainError } = await supabase.from("site_domains" as never).upsert({ site_id: (data as any).id, hostname: values.primary_domain, is_primary: true }, { onConflict: "hostname" });
        if (domainError) throw domainError;
      }
    },
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["sites-admin"] }),
        qc.invalidateQueries({ queryKey: ["available-sites"] }),
      ]);
      refetchSites();
      setForm(emptyForm);
      toast.success("Site gespeichert.");
    },
    onError: (error: any) => toast.error(error?.message || "Site konnte nicht gespeichert werden."),
  });

  useEffect(() => {
    if (!form.slug && form.name) {
      setForm((prev) => ({
        ...prev,
        slug: prev.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60),
      }));
    }
  }, [form.name, form.slug]);

  const columns = useMemo<ColumnDef<SiteRow>[]>(() => [
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Site" />,
      cell: ({ row }) => (
        <div>
          <div className="font-semibold text-slate-900">{row.original.name}</div>
          <div className="text-xs uppercase tracking-[0.18em] text-slate-400">{row.original.slug}</div>
        </div>
      ),
    },
    {
      accessorKey: "primary_domain",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Domain" />,
      cell: ({ row }) => <span>{row.original.primary_domain || row.original.site_domains?.find((entry) => entry.is_primary)?.hostname || "—"}</span>,
    },
    {
      accessorKey: "is_active",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => (
        <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${row.original.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
          {row.original.is_active ? "Aktiv" : "Inaktiv"}
        </span>
      ),
    },
    {
      accessorKey: "id",
      header: () => <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Aktion</span>,
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="rounded-xl border-slate-200" onClick={() => setActiveSiteId(row.original.id)}>Aktiv setzen</Button>
          {isGlobalAdmin ? <Button variant="ghost" size="sm" className="rounded-xl" onClick={() => setForm({ id: row.original.id, name: row.original.name || "", slug: row.original.slug || "", primary_domain: row.original.primary_domain || row.original.site_domains?.find((entry) => entry.is_primary)?.hostname || "", description: row.original.description || "", is_default: !!row.original.is_default, is_active: !!row.original.is_active })}>Bearbeiten</Button> : null}
        </div>
      ),
    },
  ], [isGlobalAdmin, setActiveSiteId]);

  return (
    <div className="max-w-7xl p-6 md:p-8 lg:p-10">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Sites & White-Label</h1>
          <p className="mt-2 text-sm text-slate-500">Mandanten, Domains und Module mit skalierbarer Tabellenkontrolle.</p>
        </div>
        <Button type="button" variant="outline" className="rounded-xl border-slate-200" onClick={() => refetchSites()}>
          <RefreshCw size={16} className="mr-2" /> Kontext neu laden
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3 text-lg font-bold text-slate-900">
            <Building2 size={20} className="text-[#FF4B2C]" /> Aktive Site & Zugriff
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Aktive Site im Admin</Label>
              <select className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none" value={activeSiteId} onChange={(event) => setActiveSiteId(event.target.value)}>
                {siteOptions.map((site: any) => <option key={site.id} value={site.id}>{site.name} {site.primary_domain ? `(${site.primary_domain})` : ""}</option>)}
              </select>
              <p className="text-xs text-slate-500">Alle Admin-Queries laufen ab jetzt gegen diese Site-ID.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <p><strong>Global Admin:</strong> {isGlobalAdmin ? "Ja" : "Nein"}</p>
              <p className="mt-2"><strong>Verfügbare Sites:</strong> {siteOptions.length}</p>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 text-lg font-bold text-slate-900">Site anlegen / bearbeiten</div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} /></div>
            <div className="space-y-2"><Label>Slug</Label><Input value={form.slug} onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))} /></div>
            <div className="space-y-2 md:col-span-2"><Label>Primäre Domain / Hostname</Label><Input value={form.primary_domain} onChange={(event) => setForm((prev) => ({ ...prev, primary_domain: event.target.value }))} placeholder="kunde-a.de" /></div>
            <div className="space-y-2 md:col-span-2"><Label>Beschreibung</Label><Textarea rows={4} value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} /></div>
          </div>
          <div className="mt-6 flex flex-wrap gap-6">
            <label className="flex items-center gap-3 text-sm font-medium text-slate-700"><Switch checked={form.is_default} onCheckedChange={(checked) => setForm((prev) => ({ ...prev, is_default: checked }))} />Als Default-Site markieren</label>
            <label className="flex items-center gap-3 text-sm font-medium text-slate-700"><Switch checked={form.is_active} onCheckedChange={(checked) => setForm((prev) => ({ ...prev, is_active: checked }))} />Site aktiv</label>
          </div>
          <div className="mt-6 flex gap-3">
            <Button className="rounded-xl bg-[#FF4B2C] text-white hover:bg-[#E03A1E]" onClick={() => saveSite.mutate(form)} disabled={saveSite.isPending || !form.name || !form.slug}>Site speichern</Button>
            <Button type="button" variant="outline" className="rounded-xl border-slate-200" onClick={() => setForm(emptyForm)}>Formular leeren</Button>
          </div>
        </section>
      </div>

      <div className="mt-8">
        {isLoading ? <div className="rounded-[2rem] border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">Sites werden geladen…</div> : <DataTable columns={columns} data={isGlobalAdmin ? sites : (availableSites as unknown as SiteRow[])} searchPlaceholder="Nach Site, Slug oder Domain suchen…" />}
      </div>

      {isGlobalAdmin ? (
        <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 text-lg font-bold text-slate-900">SaaS-Module & Entitlements</div>
          {siteModulesLoading ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-8 text-sm text-slate-500">Module werden geladen…</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {sites.map((site: any) => {
                const modules = moduleRowsBySiteId.get(site.id) || { has_forum: false, has_shop: false, has_seo_pro: false };
                return (
                  <article key={`module-${site.id}`} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{site.name}</h3>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">{site.slug}</p>
                      </div>
                      {site.id === activeSiteId ? <span className="rounded-full bg-[#0E1F53] px-3 py-1 text-xs font-bold text-white">Aktive Site</span> : null}
                    </div>
                    <div className="mt-5 space-y-4">
                      {[
                        { key: "has_shop", label: "Shop" },
                        { key: "has_forum", label: "Forum" },
                        { key: "has_seo_pro", label: "SEO Pro" },
                      ].map((module) => (
                        <label key={module.key} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700">
                          <span>{module.label}</span>
                          <Switch checked={Boolean(modules[module.key as keyof typeof modules])} onCheckedChange={(checked) => saveSiteModules.mutate({ siteId: site.id, patch: { [module.key]: checked } })} />
                        </label>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
};

export default AdminSites;
