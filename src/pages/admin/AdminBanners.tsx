import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, ExternalLink, Plus, Save, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSiteContext } from "@/context/SiteContext";
import { uploadManagedMediaAsset } from "@/lib/storage";
import { buildRawImageUrl } from "@/lib/image";
import { useToast } from "@/components/ui/use-toast";
import ConfirmDeleteDialog from "@/components/admin/ConfirmDeleteDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

type BannerCampaignRow = {
  id: string;
  slug: string;
  name: string;
  label: string | null;
  headline: string | null;
  description: string | null;
  button_label: string | null;
  button_href: string | null;
  image_path: string | null;
  image_alt: string | null;
  tone: "accent" | "light" | "dark";
  placement: "inline" | "top" | "sidebar" | "sticky_mobile";
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
};

type BannerFormState = Omit<BannerCampaignRow, "id"> & { id: string | null };

const EMPTY_FORM: BannerFormState = {
  id: null,
  slug: "",
  name: "",
  label: "",
  headline: "",
  description: "",
  button_label: "",
  button_href: "",
  image_path: "",
  image_alt: "",
  tone: "accent",
  placement: "inline",
  starts_at: "",
  ends_at: "",
  is_active: true,
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9äöüß\s-]/gi, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const mapBanner = (row: Record<string, unknown>): BannerCampaignRow => ({
  id: String(row.id || ""),
  slug: String(row.slug || ""),
  name: String(row.name || ""),
  label: typeof row.label === "string" ? row.label : null,
  headline: typeof row.headline === "string" ? row.headline : null,
  description: typeof row.description === "string" ? row.description : null,
  button_label: typeof row.button_label === "string" ? row.button_label : null,
  button_href: typeof row.button_href === "string" ? row.button_href : null,
  image_path: typeof row.image_path === "string" ? row.image_path : null,
  image_alt: typeof row.image_alt === "string" ? row.image_alt : null,
  tone: row.tone === "dark" || row.tone === "light" ? row.tone : "accent",
  placement: row.placement === "top" || row.placement === "sidebar" || row.placement === "sticky_mobile" ? row.placement : "inline",
  starts_at: typeof row.starts_at === "string" ? row.starts_at : null,
  ends_at: typeof row.ends_at === "string" ? row.ends_at : null,
  is_active: Boolean(row.is_active),
});

const toForm = (row: BannerCampaignRow): BannerFormState => ({
  ...row,
  label: row.label || "",
  headline: row.headline || "",
  description: row.description || "",
  button_label: row.button_label || "",
  button_href: row.button_href || "",
  image_path: row.image_path || "",
  image_alt: row.image_alt || "",
  starts_at: row.starts_at ? row.starts_at.slice(0, 16) : "",
  ends_at: row.ends_at ? row.ends_at.slice(0, 16) : "",
});

const AdminBanners = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { activeSiteId } = useSiteContext();
  const [editing, setEditing] = useState<BannerFormState>(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<BannerCampaignRow | null>(null);

  const bannersQuery = useQuery({
    queryKey: ["banner-campaigns", activeSiteId],
    enabled: Boolean(activeSiteId),
    queryFn: async (): Promise<BannerCampaignRow[]> => {
      const { data, error } = await supabase
        .from("banner_campaigns" as never)
        .select("id, slug, name, label, headline, description, button_label, button_href, image_path, image_alt, tone, placement, starts_at, ends_at, is_active")
        .eq("site_id", activeSiteId)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (((data as unknown) as Record<string, unknown>[]) || []).map(mapBanner);
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (item: BannerFormState) => {
      const payload = {
        site_id: activeSiteId,
        slug: slugify(item.slug || item.name),
        name: item.name.trim(),
        label: item.label.trim() || null,
        headline: item.headline.trim() || null,
        description: item.description.trim() || null,
        button_label: item.button_label.trim() || null,
        button_href: item.button_href.trim() || null,
        image_path: item.image_path.trim() || null,
        image_alt: item.image_alt.trim() || null,
        tone: item.tone,
        placement: item.placement,
        starts_at: item.starts_at || null,
        ends_at: item.ends_at || null,
        is_active: item.is_active,
      };

      if (!payload.name) throw new Error("Bitte einen Kampagnennamen angeben.");
      if (!payload.slug) throw new Error("Bitte einen gültigen Slug angeben.");

      if (item.id) {
        const { error } = await supabase.from("banner_campaigns" as never).update(payload as never).eq("id", item.id);
        if (error) throw error;
        return;
      }

      const { error } = await supabase.from("banner_campaigns" as never).insert(payload as never);
      if (error) throw error;
    },
    onSuccess: async () => {
      setEditing(EMPTY_FORM);
      await qc.invalidateQueries({ queryKey: ["banner-campaigns", activeSiteId] });
      toast({ title: "Banner gespeichert", description: "Die Kampagne ist jetzt zentral für Landingpages auswählbar." });
    },
    onError: (error: any) => toast({ title: "Speichern fehlgeschlagen", description: error?.message || "Banner konnte nicht gespeichert werden.", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("banner_campaigns" as never).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: async () => {
      setDeleteTarget(null);
      await qc.invalidateQueries({ queryKey: ["banner-campaigns", activeSiteId] });
      toast({ title: "Kampagne gelöscht", description: "Der Banner wurde zentral entfernt." });
    },
    onError: (error: any) => toast({ title: "Löschen fehlgeschlagen", description: error?.message || "Banner konnte nicht gelöscht werden.", variant: "destructive" }),
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => uploadManagedMediaAsset(file, activeSiteId || undefined, { folder: "banner-campaigns", title: file.name }),
    onSuccess: ({ storage_path }) => {
      setEditing((prev) => ({ ...prev, image_path: storage_path }));
      toast({ title: "Bannerbild hochgeladen", description: "Das Bild wurde in die zentrale Mediathek übernommen." });
    },
    onError: (error: any) => toast({ title: "Upload fehlgeschlagen", description: error?.message || "Bild konnte nicht hochgeladen werden.", variant: "destructive" }),
  });

  const rows = bannersQuery.data ?? [];
  const activeRows = useMemo(() => rows.filter((row) => row.is_active), [rows]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6 md:p-10">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Banner-Kampagnen</h1>
        <p className="mt-2 text-sm text-slate-500">Zentrale Banner für Landingpages, Promo-Blöcke und spätere globale Placements mit Zeitfenster.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <Card className="rounded-[2rem] border-slate-200 shadow-sm xl:sticky xl:top-6 xl:self-start">
          <CardHeader>
            <CardTitle>{editing.id ? "Kampagne bearbeiten" : "Neue Kampagne"}</CardTitle>
            <CardDescription>Einmal sauber pflegen, danach im Builder wiederverwenden.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={editing.name} onChange={(event) => setEditing((prev) => ({ ...prev, name: event.target.value, slug: prev.slug ? prev.slug : slugify(event.target.value) }))} />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input value={editing.slug} onChange={(event) => setEditing((prev) => ({ ...prev, slug: event.target.value }))} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Label</Label>
                <Input value={editing.label} onChange={(event) => setEditing((prev) => ({ ...prev, label: event.target.value }))} placeholder="Aktion" />
              </div>
              <div className="space-y-2">
                <Label>Ton</Label>
                <select className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm" value={editing.tone} onChange={(event) => setEditing((prev) => ({ ...prev, tone: event.target.value as BannerFormState['tone'] }))}>
                  <option value="accent">Accent</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Headline</Label>
              <Input value={editing.headline} onChange={(event) => setEditing((prev) => ({ ...prev, headline: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Beschreibung</Label>
              <Textarea rows={4} value={editing.description} onChange={(event) => setEditing((prev) => ({ ...prev, description: event.target.value }))} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label>CTA Text</Label><Input value={editing.button_label} onChange={(event) => setEditing((prev) => ({ ...prev, button_label: event.target.value }))} /></div>
              <div className="space-y-2"><Label>CTA Link</Label><Input value={editing.button_href} onChange={(event) => setEditing((prev) => ({ ...prev, button_href: event.target.value }))} /></div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label>Start</Label><Input type="datetime-local" value={editing.starts_at} onChange={(event) => setEditing((prev) => ({ ...prev, starts_at: event.target.value }))} /></div>
              <div className="space-y-2"><Label>Ende</Label><Input type="datetime-local" value={editing.ends_at} onChange={(event) => setEditing((prev) => ({ ...prev, ends_at: event.target.value }))} /></div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Placement</Label>
                <select className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm" value={editing.placement} onChange={(event) => setEditing((prev) => ({ ...prev, placement: event.target.value as BannerFormState['placement'] }))}>
                  <option value="inline">Inline</option>
                  <option value="top">Top Bar</option>
                  <option value="sidebar">Sidebar</option>
                  <option value="sticky_mobile">Sticky Mobile</option>
                </select>
              </div>
              <div className="flex items-end justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div>
                  <div className="text-sm font-semibold text-slate-900">Aktiv</div>
                  <div className="text-xs text-slate-500">Nur aktive Kampagnen sind im Builder auswählbar.</div>
                </div>
                <Switch checked={editing.is_active} onCheckedChange={(checked) => setEditing((prev) => ({ ...prev, is_active: checked }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Bild</Label>
              <Input value={editing.image_path} onChange={(event) => setEditing((prev) => ({ ...prev, image_path: event.target.value }))} placeholder="branding/sites/.../banner.webp" />
              <div className="flex gap-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-[#FF4B2C]/35 hover:bg-[#FF4B2C]/5">
                  <Plus size={14} /> Bild hochladen
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";
                    if (!file) return;
                    uploadMutation.mutate(file);
                  }} />
                </label>
                {editing.image_path ? <Button variant="outline" size="sm" asChild><a href={buildRawImageUrl(editing.image_path)} target="_blank" rel="noreferrer"><ExternalLink size={14} className="mr-2" /> Bild</a></Button> : null}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Alt-Text</Label>
              <Input value={editing.image_alt} onChange={(event) => setEditing((prev) => ({ ...prev, image_alt: event.target.value }))} />
            </div>
            <div className="flex gap-3 pt-2">
              <Button className="flex-1" onClick={() => saveMutation.mutate(editing)} disabled={saveMutation.isPending}><Save size={16} className="mr-2" />Speichern</Button>
              <Button variant="outline" onClick={() => setEditing(EMPTY_FORM)}>Zurücksetzen</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Kampagnenübersicht</CardTitle>
            <CardDescription>{activeRows.length} aktiv · {rows.length} gesamt</CardDescription>
          </CardHeader>
          <CardContent>
            {bannersQuery.isLoading ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">Kampagnen werden geladen…</div>
            ) : rows.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500">Noch keine Banner-Kampagnen vorhanden.</div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {rows.map((row) => (
                  <article key={row.id} className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
                    {row.image_path ? <img src={buildRawImageUrl(row.image_path)} alt={row.image_alt || row.name} className="h-44 w-full object-cover" /> : <div className="h-44 bg-slate-100" />}
                    <div className="space-y-3 p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">{row.name}</p>
                          <p className="mt-1 text-xs text-slate-500">/{row.slug}</p>
                        </div>
                        <Badge className={`rounded-full ${row.is_active ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-50' : 'bg-slate-100 text-slate-500 hover:bg-slate-100'}`}>{row.is_active ? 'Aktiv' : 'Entwurf'}</Badge>
                      </div>
                      <p className="line-clamp-2 text-sm leading-6 text-slate-600">{row.headline || row.description || 'Keine Beschreibung hinterlegt.'}</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => setEditing(toForm(row))}><Edit size={14} className="mr-2" />Bearbeiten</Button>
                        <Button size="sm" variant="destructive" onClick={() => setDeleteTarget(row)}><Trash2 size={14} className="mr-2" />Löschen</Button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Banner-Kampagne löschen?"
        description={deleteTarget ? `Die Kampagne „${deleteTarget.name}“ wird aus Supabase gelöscht.` : ""}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default AdminBanners;
