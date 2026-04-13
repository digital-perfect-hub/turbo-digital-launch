import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSiteContext } from "@/context/SiteContext";
import { DEFAULT_SITE_ID } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import IconPicker from "@/components/admin/IconPicker";
import { getLucideIcon } from "@/lib/lucide-icon-registry";

import ConfirmDeleteDialog from "@/components/admin/ConfirmDeleteDialog";
type ServiceRow = {
  id?: string;
  title: string;
  description: string;
  icon_name: string;
  sort_order: number;
  is_visible: boolean;
};

const emptyRow = (sortOrder = 0): ServiceRow => ({
  title: "",
  description: "",
  icon_name: "Monitor",
  sort_order: sortOrder,
  is_visible: true,
});

const AdminServices = () => {
  const { activeSiteId } = useSiteContext();
  const siteId = activeSiteId || DEFAULT_SITE_ID;
  const qc = useQueryClient();
  const [editing, setEditing] = useState<ServiceRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ServiceRow | null>(null);

  const { data: services = [], isLoading } = useQuery({
    queryKey: ["admin-services", siteId],
    queryFn: async () => {
      const { data, error } = await supabase.from("services").select("*").eq("site_id", siteId).order("sort_order");
      if (error) throw error;
      return data as ServiceRow[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (item: ServiceRow) => {
      if (item.id) {
        const { error } = await supabase
          .from("services")
          .update({
            title: item.title,
            description: item.description,
            icon_name: item.icon_name,
            sort_order: item.sort_order,
            is_visible: item.is_visible,
          })
          .eq("id", item.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("services").insert({
          site_id: siteId,
          title: item.title,
          description: item.description,
          icon_name: item.icon_name,
          sort_order: item.sort_order,
          is_visible: item.is_visible,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-services", siteId] });
      setEditing(null);
      toast.success("Leistung gespeichert.");
    },
    onError: (error: any) => toast.error(error?.message || "Speichern fehlgeschlagen."),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("services").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-services", siteId] });
      toast.success("Leistung gelöscht.");
    },
    onError: (error: any) => toast.error(error?.message || "Löschen fehlgeschlagen."),
  });

  const nextSortOrder = useMemo(() => services.length, [services.length]);

  return (
    <div className="max-w-6xl p-6 md:p-8 lg:p-10">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Leistungen</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-500">Services mit Premium-Icon-Picker statt starrer Standard-Icons.</p>
        </div>
        <Button className="rounded-xl bg-[#FF4B2C] text-white hover:bg-[#E03A1E]" onClick={() => setEditing(emptyRow(nextSortOrder))}>
          <Plus size={16} className="mr-2" /> Leistung anlegen
        </Button>
      </div>

      {editing ? (
        <section className="mb-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">{editing.id ? "Leistung bearbeiten" : "Neue Leistung"}</h2>
              <p className="mt-1 text-sm text-slate-500">Titel, Beschreibung, Sichtbarkeit und Premium-Icon zentral pflegen.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="rounded-xl border-slate-200" onClick={() => setEditing(null)}>Abbrechen</Button>
              <Button className="rounded-xl bg-[#FF4B2C] text-white hover:bg-[#E03A1E]" onClick={() => saveMutation.mutate(editing)} disabled={saveMutation.isPending || !editing.title.trim()}>
                Speichern
              </Button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
            <div className="space-y-3">
              <Label>Icon</Label>
              <IconPicker value={editing.icon_name} onChange={(iconKey) => setEditing({ ...editing, icon_name: iconKey })} triggerClassName="w-full h-auto py-3" />
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                <div className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Live Preview</div>
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FF4B2C]/10 text-[#FF4B2C]">
                  {(() => {
                    const Icon = getLucideIcon(editing.icon_name);
                    return <Icon size={28} />;
                  })()}
                </div>
                <div className="mt-4 text-lg font-bold text-slate-900">{editing.title || "Titel deiner Leistung"}</div>
                <p className="mt-2 text-sm leading-6 text-slate-500">{editing.description || "Hier sieht der Kunde sofort, wie Karte und Icon zusammen wirken."}</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label>Titel</Label>
                <Input value={editing.title} onChange={(event) => setEditing({ ...editing, title: event.target.value })} className="rounded-xl border-slate-200" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Beschreibung</Label>
                <Textarea value={editing.description} rows={6} onChange={(event) => setEditing({ ...editing, description: event.target.value })} className="rounded-xl border-slate-200" />
              </div>
              <div className="space-y-2">
                <Label>Sortierung</Label>
                <Input type="number" value={editing.sort_order} onChange={(event) => setEditing({ ...editing, sort_order: Number(event.target.value || 0) })} className="rounded-xl border-slate-200" />
              </div>
              <div className="flex items-end rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="flex w-full items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">Sichtbar</div>
                    <div className="text-xs text-slate-500">Nur sichtbare Services landen im Frontend.</div>
                  </div>
                  <Switch checked={editing.is_visible} onCheckedChange={(checked) => setEditing({ ...editing, is_visible: checked })} />
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {isLoading ? (
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">Leistungen werden geladen…</div>
        ) : services.length ? (
          services.map((service, index) => {
            const Icon = getLucideIcon(service.icon_name);
            return (
              <article key={service.id || index} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FF4B2C]/10 text-[#FF4B2C]">
                    <Icon size={22} />
                  </div>
                  <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${service.is_visible ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                    {service.is_visible ? "Live" : "Aus"}
                  </span>
                </div>
                <h3 className="mt-5 text-xl font-bold text-slate-900">{service.title}</h3>
                <p className="mt-3 min-h-[96px] text-sm leading-6 text-slate-500">{service.description}</p>
                <div className="mt-5 flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Sort {service.sort_order}</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="rounded-xl border-slate-200" onClick={() => setEditing({ ...service })}>Bearbeiten</Button>
                    {service.id ? (
                      <Button size="sm" variant="ghost" className="rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => deleteMutation.mutate(service.id!)}>
                        <Trash2 size={14} />
                      </Button>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-slate-50 p-8 text-sm text-slate-500">Noch keine Leistungen angelegt.</div>
        )}
      </section>
      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Leistung löschen?"
        description={deleteTarget ? `Die Leistung „${deleteTarget.title}“ wird in Supabase gelöscht.` : ""}
        onConfirm={() => deleteTarget?.id && deleteMutation.mutate(deleteTarget.id)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default AdminServices;