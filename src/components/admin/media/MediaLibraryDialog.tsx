import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Loader2, Search, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import ConfirmDeleteDialog from "@/components/admin/ConfirmDeleteDialog";
import { supabase } from "@/integrations/supabase/client";
import { buildRawImageUrl } from "@/lib/image";
import { uploadManagedMediaAsset } from "@/lib/storage";
import { useToast } from "@/components/ui/use-toast";

type MediaAssetRow = {
  id: string;
  site_id: string;
  storage_path: string;
  public_url: string | null;
  title: string | null;
  alt_text: string | null;
  folder: string | null;
  mime_type: string | null;
  created_at: string | null;
};

type MediaLibraryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  siteId: string;
  onSelect: (asset: MediaAssetRow) => void;
};

const mapMediaAsset = (row: Record<string, unknown>): MediaAssetRow => ({
  id: String(row.id || ""),
  site_id: String(row.site_id || ""),
  storage_path: String(row.storage_path || ""),
  public_url: typeof row.public_url === "string" ? row.public_url : null,
  title: typeof row.title === "string" ? row.title : null,
  alt_text: typeof row.alt_text === "string" ? row.alt_text : null,
  folder: typeof row.folder === "string" ? row.folder : null,
  mime_type: typeof row.mime_type === "string" ? row.mime_type : null,
  created_at: typeof row.created_at === "string" ? row.created_at : null,
});

const MediaLibraryDialog = ({ open, onOpenChange, siteId, onSelect }: MediaLibraryDialogProps) => {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<MediaAssetRow | null>(null);

  const mediaQuery = useQuery({
    queryKey: ["media-assets", siteId],
    enabled: open && Boolean(siteId),
    queryFn: async (): Promise<MediaAssetRow[]> => {
      const { data, error } = await supabase
        .from("media_assets" as never)
        .select("id, site_id, storage_path, public_url, title, alt_text, folder, mime_type, created_at")
        .eq("site_id", siteId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (((data as unknown) as Record<string, unknown>[]) || []).map(mapMediaAsset);
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      return uploadManagedMediaAsset(file, siteId, { folder: "landing-pages", title: file.name });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["media-assets", siteId] });
      toast({ title: "Mediathek aktualisiert", description: "Das Bild wurde hochgeladen und zentral gespeichert." });
    },
    onError: (error: any) => {
      toast({ title: "Upload fehlgeschlagen", description: error?.message || "Bild konnte nicht hochgeladen werden.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (assetId: string) => {
      const { error } = await supabase.from("media_assets" as never).delete().eq("id", assetId);
      if (error) throw error;
    },
    onSuccess: async () => {
      setDeleteTarget(null);
      await qc.invalidateQueries({ queryKey: ["media-assets", siteId] });
      toast({ title: "Eintrag gelöscht", description: "Der Mediathek-Eintrag wurde entfernt. Die Storage-Datei bleibt bewusst erhalten." });
    },
    onError: (error: any) => {
      toast({ title: "Löschen fehlgeschlagen", description: error?.message || "Medien-Eintrag konnte nicht gelöscht werden.", variant: "destructive" });
    },
  });

  const assets = mediaQuery.data ?? [];
  const filteredAssets = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return assets;
    return assets.filter((asset) =>
      [asset.title, asset.alt_text, asset.folder, asset.storage_path].some((value) => (value || "").toLowerCase().includes(query)),
    );
  }, [assets, search]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent data-admin-dialog-theme="dark" className="admin-dialog-scope max-h-[88vh] max-w-6xl gap-0 overflow-hidden rounded-[2rem] border border-[rgba(148,163,184,0.18)] bg-[hsl(224_46%_10%)] p-0 text-white shadow-[0_40px_120px_-60px_rgba(2,6,23,0.85)]">
          <DialogHeader className="border-b border-white/10 px-6 py-5">
            <DialogTitle className="text-2xl font-black text-white">Medienbibliothek</DialogTitle>
            <DialogDescription className="text-sm text-slate-300">
              Zentrale Assets wiederverwenden oder direkt neue Bilder hochladen – ohne Storage-Chaos.
            </DialogDescription>
          </DialogHeader>

          <div className="grid min-h-0 gap-0 lg:grid-cols-[300px_minmax(0,1fr)]">
            <div className="border-b border-white/10 bg-white/5 p-5 lg:border-b-0 lg:border-r">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Nach Titel, Ordner oder Pfad suchen"
                    className="border-white/10 bg-slate-950/50 pl-10 text-white placeholder:text-slate-500"
                  />
                </div>

                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 bg-slate-950/50 px-4 py-4 text-sm font-semibold text-white transition hover:border-[#FF4B2C]/50 hover:bg-[#FF4B2C]/8">
                  {uploadMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
                  Neues Bild hochladen
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={async (event) => {
                      const file = event.target.files?.[0];
                      event.target.value = "";
                      if (!file) return;
                      uploadMutation.mutate(file);
                    }}
                  />
                </label>

                <div className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-4 text-sm text-slate-300">
                  <p className="font-semibold text-white">Warum zentral?</p>
                  <p className="mt-2 leading-6">Bilder lassen sich mehrfach referenzieren. Beim Löschen aus der Mediathek bleibt die Storage-Datei im ersten Schritt bewusst erhalten.</p>
                </div>
              </div>
            </div>

            <div className="min-h-0">
              <ScrollArea className="h-[70vh]">
                <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
                  {mediaQuery.isLoading ? (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300">Mediathek wird geladen…</div>
                  ) : filteredAssets.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-8 text-sm text-slate-300 md:col-span-2 xl:col-span-3">Noch keine Assets gefunden.</div>
                  ) : (
                    filteredAssets.map((asset) => {
                      const preview = buildRawImageUrl(asset.storage_path || asset.public_url || "");
                      return (
                        <article key={asset.id} className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-slate-950/55 shadow-[0_24px_80px_-64px_rgba(2,6,23,0.85)]">
                          <div className="aspect-[4/3] overflow-hidden bg-slate-900">
                            {preview ? <img src={preview} alt={asset.alt_text || asset.title || "Asset"} className="h-full w-full object-cover" /> : null}
                          </div>
                          <div className="space-y-4 p-4">
                            <div>
                              <div className="flex items-center justify-between gap-2">
                                <p className="line-clamp-1 font-semibold text-white">{asset.title || "Ohne Titel"}</p>
                                {asset.folder ? <Badge className="rounded-full bg-white/10 text-slate-200 hover:bg-white/10">{asset.folder}</Badge> : null}
                              </div>
                              <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-400">{asset.alt_text || asset.storage_path}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" className="flex-1" onClick={() => onSelect(asset)}>
                                Auswählen
                              </Button>
                              <Button size="sm" variant="outline" className="border-white/10 bg-transparent text-white hover:bg-white/10" onClick={() => setDeleteTarget(asset)}>
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </div>
                        </article>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(nextOpen) => !nextOpen && setDeleteTarget(null)}
        title="Medien-Eintrag löschen?"
        description={deleteTarget ? `Der Eintrag „${deleteTarget.title || deleteTarget.storage_path}“ wird aus Supabase gelöscht. Die Datei im Storage bleibt bewusst erhalten.` : ""}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
};

export default MediaLibraryDialog;
