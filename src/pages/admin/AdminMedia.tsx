import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Search, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSiteContext } from "@/context/SiteContext";
import { uploadManagedMediaAsset } from "@/lib/storage";
import { buildRawImageUrl } from "@/lib/image";
import { useToast } from "@/components/ui/use-toast";
import ConfirmDeleteDialog from "@/components/admin/ConfirmDeleteDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type MediaAssetRow = {
  id: string;
  title: string | null;
  alt_text: string | null;
  folder: string | null;
  storage_path: string;
  public_url: string | null;
  created_at: string | null;
};

const mapMediaAsset = (row: Record<string, unknown>): MediaAssetRow => ({
  id: String(row.id || ""),
  title: typeof row.title === "string" ? row.title : null,
  alt_text: typeof row.alt_text === "string" ? row.alt_text : null,
  folder: typeof row.folder === "string" ? row.folder : null,
  storage_path: String(row.storage_path || ""),
  public_url: typeof row.public_url === "string" ? row.public_url : null,
  created_at: typeof row.created_at === "string" ? row.created_at : null,
});

const AdminMedia = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { activeSiteId } = useSiteContext();
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<MediaAssetRow | null>(null);

  const mediaQuery = useQuery({
    queryKey: ["admin-media-assets", activeSiteId],
    enabled: Boolean(activeSiteId),
    queryFn: async (): Promise<MediaAssetRow[]> => {
      const { data, error } = await supabase
        .from("media_assets" as never)
        .select("id, title, alt_text, folder, storage_path, public_url, created_at")
        .eq("site_id", activeSiteId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (((data as unknown) as Record<string, unknown>[]) || []).map(mapMediaAsset);
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => uploadManagedMediaAsset(file, activeSiteId || undefined, { folder: "landing-pages", title: file.name }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin-media-assets", activeSiteId] });
      toast({ title: "Upload abgeschlossen", description: "Das Asset wurde in der zentralen Mediathek gespeichert." });
    },
    onError: (error: any) => toast({ title: "Upload fehlgeschlagen", description: error?.message || "Asset konnte nicht hochgeladen werden.", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("media_assets" as never).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: async () => {
      setDeleteTarget(null);
      await qc.invalidateQueries({ queryKey: ["admin-media-assets", activeSiteId] });
      toast({ title: "Medien-Eintrag gelöscht", description: "Der Datenbank-Eintrag wurde entfernt. Storage-Dateien bleiben bewusst erhalten." });
    },
    onError: (error: any) => toast({ title: "Löschen fehlgeschlagen", description: error?.message || "Asset konnte nicht gelöscht werden.", variant: "destructive" }),
  });

  const filteredAssets = useMemo(() => {
    const query = search.trim().toLowerCase();
    const rows = mediaQuery.data ?? [];
    if (!query) return rows;
    return rows.filter((row) => [row.title, row.alt_text, row.folder, row.storage_path].some((value) => (value || "").toLowerCase().includes(query)));
  }, [mediaQuery.data, search]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6 md:p-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Medienbibliothek</h1>
          <p className="mt-2 text-sm text-slate-500">Zentrale Uploads, referenzierte Nutzung und saubere Wiederverwendung für Landingpages, Banner und Inhalte.</p>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-[#FF4B2C] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#ef4426]">
          <ImagePlus size={16} />
          Asset hochladen
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (!file) return;
              uploadMutation.mutate(file);
            }}
          />
        </label>
      </div>

      <Card className="rounded-[2rem] border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Assets</CardTitle>
          <CardDescription>Die Mediathek speichert nur referenzierte Einträge. Beim Löschen bleibt die Datei im Storage bewusst erhalten.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="max-w-md">
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nach Titel, Ordner oder Pfad suchen" />
          </div>

          {mediaQuery.isLoading ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">Assets werden geladen…</div>
          ) : filteredAssets.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500">Noch keine Assets vorhanden.</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredAssets.map((asset) => (
                <article key={asset.id} className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
                  <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                    <img src={buildRawImageUrl(asset.storage_path || asset.public_url || "")} alt={asset.alt_text || asset.title || "Asset"} className="h-full w-full object-cover" />
                  </div>
                  <div className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-slate-900">{asset.title || "Ohne Titel"}</p>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{asset.alt_text || asset.storage_path}</p>
                      </div>
                      {asset.folder ? <Badge className="rounded-full bg-slate-100 text-slate-600 hover:bg-slate-100">{asset.folder}</Badge> : null}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => navigator.clipboard.writeText(asset.storage_path)}>
                        Pfad kopieren
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => setDeleteTarget(asset)}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Medien-Eintrag löschen?"
        description={deleteTarget ? `Der Eintrag „${deleteTarget.title || deleteTarget.storage_path}“ wird aus Supabase entfernt. Die Datei im Storage bleibt bewusst bestehen.` : ""}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default AdminMedia;
