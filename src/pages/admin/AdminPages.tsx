import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, FilePlus2, Pencil, RefreshCw, Save, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { normalizeLandingPageBlocks, normalizeLandingPageSlug, type LandingPageBlock } from "@/lib/landing-page-builder";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

type LandingPageRow = {
  id: string;
  slug: string;
  meta_title: string | null;
  meta_description: string | null;
  is_published: boolean;
  page_blocks: LandingPageBlock[];
  created_at: string | null;
  updated_at: string | null;
};

type LandingPageForm = {
  id: string | null;
  slug: string;
  meta_title: string;
  meta_description: string;
  is_published: boolean;
  page_blocks: string;
};

const EMPTY_FORM: LandingPageForm = {
  id: null,
  slug: "",
  meta_title: "",
  meta_description: "",
  is_published: false,
  page_blocks: "[]",
};

const createFormFromRow = (row: LandingPageRow): LandingPageForm => ({
  id: row.id,
  slug: row.slug,
  meta_title: row.meta_title || "",
  meta_description: row.meta_description || "",
  is_published: row.is_published,
  page_blocks: JSON.stringify(row.page_blocks ?? [], null, 2),
});

const mapLandingPageRow = (row: Record<string, unknown>): LandingPageRow => ({
  id: String(row.id || ""),
  slug: String(row.slug || ""),
  meta_title: typeof row.meta_title === "string" ? row.meta_title : null,
  meta_description: typeof row.meta_description === "string" ? row.meta_description : null,
  is_published: Boolean(row.is_published),
  page_blocks: normalizeLandingPageBlocks(row.page_blocks),
  created_at: typeof row.created_at === "string" ? row.created_at : null,
  updated_at: typeof row.updated_at === "string" ? row.updated_at : null,
});

const parsePageBlocks = (value: string) => {
  try {
    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      return {
        ok: false as const,
        message: "page_blocks muss ein valides JSON-Array sein.",
      };
    }

    return {
      ok: true as const,
      value: parsed as LandingPageBlock[],
    };
  } catch (error: any) {
    return {
      ok: false as const,
      message: error?.message || "Ungültiges JSON in page_blocks.",
    };
  }
};

const PublishedBadge = ({ published }: { published: boolean }) => (
  <Badge variant={published ? "default" : "secondary"} className="rounded-full px-3 py-1">
    {published ? "Veröffentlicht" : "Entwurf"}
  </Badge>
);

const AdminPages = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { canEditContent } = useAdminAccess();

  const [mode, setMode] = useState<"list" | "editor">("list");
  const [form, setForm] = useState<LandingPageForm>(EMPTY_FORM);

  const pagesQuery = useQuery({
    queryKey: ["admin-landing-pages"],
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 30_000,
    queryFn: async (): Promise<LandingPageRow[]> => {
      const { data, error } = await supabase
        .from("landing_pages" as never)
        .select("*")
        .order("updated_at", { ascending: false })
        .order("slug", { ascending: true });

      if (error) throw error;

      return (((data as unknown as Record<string, unknown>[]) || []).map(mapLandingPageRow));
    },
  });

  const pageBlocksState = useMemo(() => parsePageBlocks(form.page_blocks), [form.page_blocks]);

  const saveMutation = useMutation({
    mutationFn: async (payload: LandingPageForm) => {
      const slug = normalizeLandingPageSlug(payload.slug);
      if (!slug) {
        throw new Error("Bitte einen gültigen Slug eintragen.");
      }

      const parsedPageBlocks = parsePageBlocks(payload.page_blocks);
      if (!parsedPageBlocks.ok) {
        throw new Error(parsedPageBlocks.message);
      }

      const dbPayload = {
        slug,
        meta_title: payload.meta_title.trim() || null,
        meta_description: payload.meta_description.trim() || null,
        is_published: payload.is_published,
        page_blocks: parsedPageBlocks.value,
      };

      if (payload.id) {
        const { data, error } = await supabase
          .from("landing_pages" as never)
          .update(dbPayload as never)
          .eq("id", payload.id)
          .select("*")
          .single();

        if (error) throw error;
        return mapLandingPageRow((data as unknown as Record<string, unknown>) || {});
      }

      const { data, error } = await supabase
        .from("landing_pages" as never)
        .insert(dbPayload as never)
        .select("*")
        .single();

      if (error) throw error;
      return mapLandingPageRow((data as unknown as Record<string, unknown>) || {});
    },
    onSuccess: (savedPage) => {
      queryClient.invalidateQueries({ queryKey: ["admin-landing-pages"] });
      setForm(createFormFromRow(savedPage));
      setMode("editor");
      toast({
        title: "Gespeichert",
        description: `Landingpage „${savedPage.slug}“ wurde erfolgreich gespeichert.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Speichern fehlgeschlagen",
        description: error?.message || "Die Landingpage konnte nicht gespeichert werden.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("landing_pages" as never).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-landing-pages"] });
      setMode("list");
      setForm(EMPTY_FORM);
      toast({
        title: "Gelöscht",
        description: "Die Landingpage wurde entfernt.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Löschen fehlgeschlagen",
        description: error?.message || "Die Landingpage konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    },
  });

  const pages = pagesQuery.data ?? [];

  const startCreate = () => {
    setForm(EMPTY_FORM);
    setMode("editor");
  };

  const startEdit = (page: LandingPageRow) => {
    setForm(createFormFromRow(page));
    setMode("editor");
  };

  const handleDelete = (page: LandingPageRow) => {
    if (!canEditContent || deleteMutation.isPending) return;

    const confirmed = window.confirm(`Willst du die Landingpage „${page.slug}“ wirklich löschen?`);
    if (!confirmed) return;

    deleteMutation.mutate(page.id);
  };

  const handleSave = () => {
    if (!canEditContent || saveMutation.isPending) return;
    saveMutation.mutate(form);
  };

  const isBusy = saveMutation.isPending || deleteMutation.isPending;

  if (mode === "editor") {
    const normalizedSlugPreview = normalizeLandingPageSlug(form.slug);

    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6 md:p-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              {form.id ? "Landingpage bearbeiten" : "Neue Landingpage erstellen"}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Pflege Meta-Daten, Veröffentlichungsstatus und page_blocks direkt für das SEO-Headless-CMS.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" onClick={() => setMode("list")}>
              <ArrowLeft className="mr-2" />
              Zur Übersicht
            </Button>
            <Button onClick={handleSave} disabled={!canEditContent || isBusy || !pageBlocksState.ok}>
              <Save className="mr-2" />
              {saveMutation.isPending ? "Speichere..." : "Speichern"}
            </Button>
          </div>
        </div>

        {!canEditContent ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Diese Rolle hat nur Lesezugriff. Speichern und Löschen sind aktuell deaktiviert.
          </div>
        ) : null}

        <Card className="rounded-[2rem] border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Seitendaten</CardTitle>
            <CardDescription>
              Slug ohne führenden Slash eintragen. Beispiel: <code>seo/seo-linz</code>
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={form.slug}
                onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))}
                placeholder="seo/seo-linz"
                disabled={!canEditContent || isBusy}
              />
              <p className="text-xs text-slate-500">
                Route-Vorschau: <span className="font-medium text-slate-700">/{normalizedSlugPreview || "dein-slug"}</span>
              </p>
            </div>

            <div className="flex items-end justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="space-y-1">
                <Label htmlFor="is_published">Veröffentlicht</Label>
                <p className="text-xs text-slate-500">
                  Nur veröffentlichte Seiten sind öffentlich über die Dynamic Route erreichbar.
                </p>
              </div>
              <Switch
                id="is_published"
                checked={form.is_published}
                onCheckedChange={(checked) => setForm((prev) => ({ ...prev, is_published: checked }))}
                disabled={!canEditContent || isBusy}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="meta_title">Meta Title</Label>
              <Input
                id="meta_title"
                value={form.meta_title}
                onChange={(event) => setForm((prev) => ({ ...prev, meta_title: event.target.value }))}
                placeholder="SEO Linz | Digital Perfect"
                disabled={!canEditContent || isBusy}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="meta_description">Meta Description</Label>
              <Textarea
                id="meta_description"
                rows={4}
                value={form.meta_description}
                onChange={(event) => setForm((prev) => ({ ...prev, meta_description: event.target.value }))}
                placeholder="Kurze, klickstarke Beschreibung für Google."
                disabled={!canEditContent || isBusy}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>page_blocks JSON</CardTitle>
            <CardDescription>
              Hier kannst du valides JSON für die Landingpage-Blöcke einfügen. Gespeichert wird nur bei gültigem JSON-Array.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={form.page_blocks}
              onChange={(event) => setForm((prev) => ({ ...prev, page_blocks: event.target.value }))}
              rows={24}
              className="font-mono text-sm"
              placeholder='[{ "type": "hero", "data": { "headline": "SEO Linz" } }]'
              disabled={!canEditContent || isBusy}
            />

            <div className="flex flex-wrap items-center gap-3">
              {pageBlocksState.ok ? (
                <Badge variant="default" className="rounded-full px-3 py-1">
                  JSON gültig
                </Badge>
              ) : (
                <Badge variant="destructive" className="rounded-full px-3 py-1">
                  JSON ungültig
                </Badge>
              )}

              <p className={`text-sm ${pageBlocksState.ok ? "text-slate-500" : "text-red-600"}`}>
                {pageBlocksState.ok
                  ? `Es wurden ${pageBlocksState.value.length} Block${pageBlocksState.value.length === 1 ? "" : "e"} erkannt.`
                  : pageBlocksState.message}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6 md:p-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Landingpages</h1>
          <p className="mt-2 text-sm text-slate-500">
            Verwalte hier alle dynamischen SEO-Landingpages aus der Tabelle <code>landing_pages</code>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" onClick={() => pagesQuery.refetch()} disabled={pagesQuery.isFetching}>
            <RefreshCw className={`mr-2 ${pagesQuery.isFetching ? "animate-spin" : ""}`} />
            Aktualisieren
          </Button>
          <Button onClick={startCreate} disabled={!canEditContent}>
            <FilePlus2 className="mr-2" />
            Neue Seite erstellen
          </Button>
        </div>
      </div>

      {!canEditContent ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Diese Rolle hat nur Lesezugriff. Bearbeiten, Anlegen und Löschen sind deaktiviert.
        </div>
      ) : null}

      <Card className="rounded-[2rem] border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Übersicht</CardTitle>
          <CardDescription>
            Geladen werden Slug, Meta Title, Veröffentlichungsstatus und die wichtigsten Aktionen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pagesQuery.isLoading ? (
            <div className="py-10 text-center text-sm text-slate-500">Landingpages werden geladen...</div>
          ) : pagesQuery.isError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {(pagesQuery.error as Error)?.message || "Die Landingpages konnten nicht geladen werden."}
            </div>
          ) : pages.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-200 px-6 py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                <FilePlus2 size={26} />
              </div>
              <div>
                <p className="text-base font-semibold text-slate-900">Noch keine Landingpages vorhanden</p>
                <p className="mt-1 text-sm text-slate-500">
                  Lege jetzt die erste dynamische Seite für euer SEO-Headless-CMS an.
                </p>
              </div>
              <Button onClick={startCreate} disabled={!canEditContent}>
                <FilePlus2 className="mr-2" />
                Erste Seite erstellen
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Slug</TableHead>
                  <TableHead>Meta Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pages.map((page) => (
                  <TableRow key={page.id}>
                    <TableCell className="font-medium text-slate-900">/{page.slug}</TableCell>
                    <TableCell className="max-w-[420px] text-slate-600">
                      {page.meta_title?.trim() || <span className="italic text-slate-400">Kein Meta Title gesetzt</span>}
                    </TableCell>
                    <TableCell>
                      <PublishedBadge published={page.is_published} />
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => startEdit(page)}>
                          <Pencil className="mr-2" />
                          Bearbeiten
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(page)}
                          disabled={!canEditContent || deleteMutation.isPending}
                        >
                          <Trash2 className="mr-2" />
                          Löschen
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPages;
