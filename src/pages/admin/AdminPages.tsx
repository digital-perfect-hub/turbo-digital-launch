import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  FilePlus2,
  Globe2,
  ImagePlus,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSiteContext } from "@/context/SiteContext";
import { DEFAULT_SITE_ID } from "@/lib/site";
import { uploadBrandingAsset } from "@/lib/storage";
import { buildRawImageUrl } from "@/lib/image";
import {
  PAGE_BLOCK_OPTIONS,
  createDefaultBlock,
  getPageBlockLabel,
  isReservedPageSlug,
  normalizePageBlocks,
  normalizePageSlug,
  toPageImageUrl,
  type PageBlock,
  type PageRecord,
} from "@/lib/page-builder";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

type PageDraft = {
  id: string;
  slug: string;
  seo_title: string;
  seo_description: string;
  is_published: boolean;
  content_blocks: PageBlock[];
};

const createEmptyDraft = (): PageDraft => ({
  id: "",
  slug: "",
  seo_title: "",
  seo_description: "",
  is_published: true,
  content_blocks: [createDefaultBlock("hero")],
});

const AdminPages = () => {
  const qc = useQueryClient();
  const { activeSiteId } = useSiteContext();
  const siteId = activeSiteId || DEFAULT_SITE_ID;
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [draft, setDraft] = useState<PageDraft>(createEmptyDraft);
  const uploadRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const { data: pages = [], isLoading } = useQuery({
    queryKey: ["admin-pages", siteId],
    queryFn: async (): Promise<PageRecord[]> => {
      const { data, error } = await supabase
        .from("pages" as never)
        .select("*")
        .eq("site_id", siteId)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      return ((data as unknown as Record<string, unknown>[]) || []).map((row) => ({
        id: String(row.id || ""),
        site_id: String(row.site_id || siteId),
        slug: String(row.slug || ""),
        seo_title: typeof row.seo_title === "string" ? row.seo_title : null,
        seo_description: typeof row.seo_description === "string" ? row.seo_description : null,
        is_published: Boolean(row.is_published),
        created_at: typeof row.created_at === "string" ? row.created_at : null,
        updated_at: typeof row.updated_at === "string" ? row.updated_at : null,
        content_blocks: normalizePageBlocks(row.content_blocks),
      }));
    },
  });

  useEffect(() => {
    if (!pages.length) {
      setSelectedPageId(null);
      setDraft(createEmptyDraft());
      return;
    }

    const nextSelectedId = selectedPageId && pages.some((page) => page.id === selectedPageId)
      ? selectedPageId
      : pages[0].id;

    const selected = pages.find((page) => page.id === nextSelectedId);
    if (!selected) return;

    setSelectedPageId(nextSelectedId);
    setDraft({
      id: selected.id,
      slug: selected.slug,
      seo_title: selected.seo_title || "",
      seo_description: selected.seo_description || "",
      is_published: selected.is_published,
      content_blocks: selected.content_blocks.length ? selected.content_blocks : [createDefaultBlock("hero")],
    });
  }, [pages, selectedPageId]);

  const previewPath = useMemo(() => {
    const slug = normalizePageSlug(draft.slug);
    return slug ? `/${slug}` : "/dein-slug";
  }, [draft.slug]);

  const saveMutation = useMutation({
    mutationFn: async (value: PageDraft) => {
      const cleanedSlug = normalizePageSlug(value.slug);

      if (!cleanedSlug) {
        throw new Error("Bitte vergib einen gültigen Slug.");
      }

      if (isReservedPageSlug(cleanedSlug)) {
        throw new Error("Dieser Slug ist reserviert und würde bestehende Routen überschreiben.");
      }

      const payload = {
        id: value.id || crypto.randomUUID(),
        site_id: siteId,
        slug: cleanedSlug,
        seo_title: value.seo_title || null,
        seo_description: value.seo_description || null,
        is_published: value.is_published,
        content_blocks: value.content_blocks,
      };

      const { data, error } = await supabase
        .from("pages" as never)
        .upsert(payload as never, { onConflict: "id" })
        .select("id")
        .single();

      if (error) throw error;

      return String((data as Record<string, unknown>)?.id || payload.id);
    },
    onSuccess: (pageId) => {
      setSelectedPageId(pageId);
      qc.invalidateQueries({ queryKey: ["admin-pages", siteId] });
      toast.success("Seite gespeichert.");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Seite konnte nicht gespeichert werden.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (pageId: string) => {
      const { error } = await supabase.from("pages" as never).delete().eq("id", pageId);
      if (error) throw error;
    },
    onSuccess: () => {
      setSelectedPageId(null);
      setDraft(createEmptyDraft());
      qc.invalidateQueries({ queryKey: ["admin-pages", siteId] });
      toast.success("Seite gelöscht.");
    },
    onError: (error: any) => toast.error(error?.message || "Seite konnte nicht gelöscht werden."),
  });

  const setBlockAt = (blockIndex: number, nextBlock: PageBlock) => {
    setDraft((prev) => ({
      ...prev,
      content_blocks: prev.content_blocks.map((block, index) => (index === blockIndex ? nextBlock : block)),
    }));
  };

  const moveBlock = (index: number, direction: "up" | "down") => {
    setDraft((prev) => {
      const nextBlocks = [...prev.content_blocks];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= nextBlocks.length) return prev;
      [nextBlocks[index], nextBlocks[targetIndex]] = [nextBlocks[targetIndex], nextBlocks[index]];
      return { ...prev, content_blocks: nextBlocks };
    });
  };

  const handleImageUpload = async (blockId: string, blockIndex: number, file?: File | null) => {
    if (!file) return;

    try {
      const filePath = await uploadBrandingAsset(file, "page-builder", siteId);
      const block = draft.content_blocks[blockIndex];

      if (block?.type !== "image_text_split") return;

      setBlockAt(blockIndex, {
        ...block,
        data: {
          ...block.data,
          imagePath: filePath,
        },
      });

      toast.success("Builder-Bild hochgeladen.");
    } catch (error: any) {
      toast.error(error?.message || "Bild konnte nicht hochgeladen werden.");
    } finally {
      if (uploadRefs.current[blockId]) {
        uploadRefs.current[blockId]!.value = "";
      }
    }
  };

  if (isLoading) {
    return <div className="p-6 text-sm font-medium text-slate-500">Seiten werden geladen...</div>;
  }

  return (
    <div className="max-w-[1680px] p-6 md:p-8 lg:p-10">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Page Builder</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-500">
            JSON-basierte Landingpages pro Site. Slug, SEO und Block-Reihenfolge laufen komplett tenantgebunden über die neue <code>pages</code>-Tabelle.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            className="rounded-xl border-slate-200"
            onClick={() => {
              setSelectedPageId(null);
              setDraft(createEmptyDraft());
            }}
          >
            <FilePlus2 size={16} className="mr-2" />
            Neue Seite
          </Button>
          {draft.id ? (
            <Button
              variant="outline"
              className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              disabled={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate(draft.id)}
            >
              <Trash2 size={16} className="mr-2" />
              Löschen
            </Button>
          ) : null}
          <Button
            className="rounded-xl bg-[#FF4B2C] text-white hover:bg-[#E03A1E]"
            disabled={saveMutation.isPending}
            onClick={() => saveMutation.mutate(draft)}
          >
            <Save size={16} className="mr-2" />
            {saveMutation.isPending ? "Speichere..." : "Seite speichern"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <Card className="rounded-[2rem] border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-900">Bestehende Seiten</CardTitle>
            <CardDescription className="text-slate-500">
              Jede Seite ist an die aktuell gewählte Site gebunden.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {pages.length ? (
              pages.map((page) => {
                const isActive = page.id === draft.id;
                return (
                  <button
                    key={page.id}
                    type="button"
                    onClick={() => {
                      setSelectedPageId(page.id);
                      setDraft({
                        id: page.id,
                        slug: page.slug,
                        seo_title: page.seo_title || "",
                        seo_description: page.seo_description || "",
                        is_published: page.is_published,
                        content_blocks: page.content_blocks.length ? page.content_blocks : [createDefaultBlock("hero")],
                      });
                    }}
                    className={`w-full rounded-[1.5rem] border px-4 py-4 text-left transition ${
                      isActive
                        ? "border-[#FF4B2C] bg-[#FF4B2C]/5 shadow-[0_24px_60px_-36px_rgba(255,75,44,0.28)]"
                        : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-slate-900">/{page.slug}</p>
                        <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                          {page.seo_title || "Kein SEO-Titel gesetzt"}
                        </p>
                      </div>
                      <Badge variant="outline" className={page.is_published ? "border-emerald-200 text-emerald-700" : "border-amber-200 text-amber-700"}>
                        {page.is_published ? "Live" : "Entwurf"}
                      </Badge>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
                Für diese Site gibt es noch keine dynamischen Seiten. Lege rechts deine erste Landingpage an.
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-[2rem] border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900">Metadaten & Routing</CardTitle>
              <CardDescription className="text-slate-500">
                Catch-All läuft über <code>/:slug</code>. Reservierte Slugs werden blockiert, damit keine Systemroute überschrieben wird.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input
                  value={draft.slug}
                  onChange={(event) => setDraft((prev) => ({ ...prev, slug: normalizePageSlug(event.target.value) }))}
                  placeholder="white-label-webdesign"
                />
                <p className="text-xs text-slate-500">Live-Pfad: <span className="font-semibold text-slate-700">{previewPath}</span></p>
              </div>

              <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-[#FF4B2C]/10 p-2 text-[#FF4B2C]">
                    <Globe2 size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Routing-Schutz aktiv</p>
                    <p className="mt-1 text-xs leading-6 text-slate-500">
                      Blockiert: /admin, /login, /forum, /produkt, /impressum, /datenschutz, /agb
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>SEO Title</Label>
                <Input
                  value={draft.seo_title}
                  onChange={(event) => setDraft((prev) => ({ ...prev, seo_title: event.target.value }))}
                  placeholder="White-Label SaaS für Agenturen | Digital Perfect Hub"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>SEO Description</Label>
                <Textarea
                  rows={3}
                  value={draft.seo_description}
                  onChange={(event) => setDraft((prev) => ({ ...prev, seo_description: event.target.value }))}
                  placeholder="Modularer Hub für Agenturen, Freelancer und Webdesigner – mandantenfähig, performant und white-label-fähig."
                />
              </div>

              <div className="md:col-span-2 flex items-center justify-between rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Seite veröffentlicht</p>
                  <p className="text-xs text-slate-500">Nur veröffentlichte Seiten dürfen öffentlich ausgeliefert werden.</p>
                </div>
                <Switch
                  checked={draft.is_published}
                  onCheckedChange={(checked) => setDraft((prev) => ({ ...prev, is_published: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900">Block-Bibliothek</CardTitle>
              <CardDescription className="text-slate-500">
                Alle Blöcke werden als JSONB in <code>content_blocks</code> gespeichert und im Frontend über die Registry gerendert.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              {PAGE_BLOCK_OPTIONS.map((option) => (
                <Button
                  key={option.type}
                  variant="outline"
                  className="rounded-xl border-slate-200"
                  onClick={() =>
                    setDraft((prev) => ({
                      ...prev,
                      content_blocks: [...prev.content_blocks, createDefaultBlock(option.type)],
                    }))
                  }
                >
                  <Plus size={16} className="mr-2" />
                  {option.label}
                </Button>
              ))}
            </CardContent>
          </Card>

          <div className="space-y-4">
            {draft.content_blocks.map((block, index) => (
              <Card key={block.id} className="rounded-[2rem] border-slate-200 bg-white shadow-sm">
                <CardHeader className="gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <CardTitle className="text-slate-900">
                      Block {index + 1} · {getPageBlockLabel(block.type)}
                    </CardTitle>
                    <CardDescription className="text-slate-500">
                      Typ: <code>{block.type}</code>
                    </CardDescription>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" className="rounded-xl" disabled={index === 0} onClick={() => moveBlock(index, "up")}>
                      <ArrowUp size={14} className="mr-1" />
                      Hoch
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl"
                      disabled={index === draft.content_blocks.length - 1}
                      onClick={() => moveBlock(index, "down")}
                    >
                      <ArrowDown size={14} className="mr-1" />
                      Runter
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() =>
                        setDraft((prev) => ({
                          ...prev,
                          content_blocks: prev.content_blocks.filter((entry) => entry.id !== block.id),
                        }))
                      }
                    >
                      <Trash2 size={14} className="mr-1" />
                      Entfernen
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-5">
                  {block.type === "hero" ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Badge</Label>
                        <Input value={block.data.badge || ""} onChange={(e) => setBlockAt(index, { ...block, data: { ...block.data, badge: e.target.value } })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Headline</Label>
                        <Input value={block.data.headline || ""} onChange={(e) => setBlockAt(index, { ...block, data: { ...block.data, headline: e.target.value } })} />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Subheadline</Label>
                        <Textarea rows={3} value={block.data.subheadline || ""} onChange={(e) => setBlockAt(index, { ...block, data: { ...block.data, subheadline: e.target.value } })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Primary CTA Label</Label>
                        <Input value={block.data.primaryCtaLabel || ""} onChange={(e) => setBlockAt(index, { ...block, data: { ...block.data, primaryCtaLabel: e.target.value } })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Primary CTA Link</Label>
                        <Input value={block.data.primaryCtaHref || ""} onChange={(e) => setBlockAt(index, { ...block, data: { ...block.data, primaryCtaHref: e.target.value } })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Secondary CTA Label</Label>
                        <Input value={block.data.secondaryCtaLabel || ""} onChange={(e) => setBlockAt(index, { ...block, data: { ...block.data, secondaryCtaLabel: e.target.value } })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Secondary CTA Link</Label>
                        <Input value={block.data.secondaryCtaHref || ""} onChange={(e) => setBlockAt(index, { ...block, data: { ...block.data, secondaryCtaHref: e.target.value } })} />
                      </div>
                    </div>
                  ) : null}

                  {block.type === "rich_text" ? (
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label>Kicker</Label>
                        <Input value={block.data.kicker || ""} onChange={(e) => setBlockAt(index, { ...block, data: { ...block.data, kicker: e.target.value } })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Headline</Label>
                        <Input value={block.data.headline || ""} onChange={(e) => setBlockAt(index, { ...block, data: { ...block.data, headline: e.target.value } })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Body HTML</Label>
                        <Textarea rows={8} value={block.data.bodyHtml || ""} onChange={(e) => setBlockAt(index, { ...block, data: { ...block.data, bodyHtml: e.target.value } })} />
                      </div>
                    </div>
                  ) : null}

                  {block.type === "feature_grid" ? (
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Kicker</Label>
                          <Input value={block.data.kicker || ""} onChange={(e) => setBlockAt(index, { ...block, data: { ...block.data, kicker: e.target.value } })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Headline</Label>
                          <Input value={block.data.headline || ""} onChange={(e) => setBlockAt(index, { ...block, data: { ...block.data, headline: e.target.value } })} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Beschreibung</Label>
                        <Textarea rows={3} value={block.data.description || ""} onChange={(e) => setBlockAt(index, { ...block, data: { ...block.data, description: e.target.value } })} />
                      </div>

                      <Separator />

                      <div className="space-y-3">
                        {block.data.items.map((item, itemIndex) => (
                          <div key={`${block.id}-feature-${itemIndex}`} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                            <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
                              <div className="space-y-2">
                                <Label>Titel</Label>
                                <Input
                                  value={item.title || ""}
                                  onChange={(e) => {
                                    const nextItems = [...block.data.items];
                                    nextItems[itemIndex] = { ...nextItems[itemIndex], title: e.target.value };
                                    setBlockAt(index, { ...block, data: { ...block.data, items: nextItems } });
                                  }}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Text</Label>
                                <Textarea
                                  rows={2}
                                  value={item.text || ""}
                                  onChange={(e) => {
                                    const nextItems = [...block.data.items];
                                    nextItems[itemIndex] = { ...nextItems[itemIndex], text: e.target.value };
                                    setBlockAt(index, { ...block, data: { ...block.data, items: nextItems } });
                                  }}
                                />
                              </div>
                              <div className="flex items-end">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                  onClick={() => {
                                    const nextItems = block.data.items.filter((_, idx) => idx !== itemIndex);
                                    setBlockAt(index, { ...block, data: { ...block.data, items: nextItems } });
                                  }}
                                >
                                  <Trash2 size={14} />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}

                        <Button
                          variant="outline"
                          className="rounded-xl"
                          onClick={() =>
                            setBlockAt(index, {
                              ...block,
                              data: {
                                ...block.data,
                                items: [...block.data.items, { title: "", text: "" }],
                              },
                            })
                          }
                        >
                          <Plus size={16} className="mr-2" />
                          Feature hinzufügen
                        </Button>
                      </div>
                    </div>
                  ) : null}

                  {block.type === "image_text_split" ? (
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Kicker</Label>
                          <Input value={block.data.kicker || ""} onChange={(e) => setBlockAt(index, { ...block, data: { ...block.data, kicker: e.target.value } })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Headline</Label>
                          <Input value={block.data.headline || ""} onChange={(e) => setBlockAt(index, { ...block, data: { ...block.data, headline: e.target.value } })} />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Text</Label>
                        <Textarea rows={4} value={block.data.body || ""} onChange={(e) => setBlockAt(index, { ...block, data: { ...block.data, body: e.target.value } })} />
                      </div>

                      <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
                        <div className="space-y-2">
                          <Label>Bildpfad / Storage-Pfad</Label>
                          <Input value={block.data.imagePath || ""} onChange={(e) => setBlockAt(index, { ...block, data: { ...block.data, imagePath: e.target.value } })} placeholder="sites/.../page-builder/..." />
                          <p className="text-xs text-slate-500">Public-Ausgabe läuft fest über die Render-API mit Width/Quality.</p>
                        </div>
                        <div className="space-y-2">
                          <Label>Alt-Text</Label>
                          <Input value={block.data.imageAlt || ""} onChange={(e) => setBlockAt(index, { ...block, data: { ...block.data, imageAlt: e.target.value } })} />
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <input
                          ref={(node) => (uploadRefs.current[block.id] = node)}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(event) => handleImageUpload(block.id, index, event.target.files?.[0])}
                        />
                        <Button variant="outline" className="rounded-xl" onClick={() => uploadRefs.current[block.id]?.click()}>
                          <ImagePlus size={16} className="mr-2" />
                          Bild hochladen
                        </Button>
                        <select
                          className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm"
                          value={block.data.imageSide || "right"}
                          onChange={(event) =>
                            setBlockAt(index, { ...block, data: { ...block.data, imageSide: event.target.value === "left" ? "left" : "right" } })
                          }
                        >
                          <option value="right">Bild rechts</option>
                          <option value="left">Bild links</option>
                        </select>
                      </div>

                      {block.data.imagePath ? (
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-3">
                            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Admin Preview</p>
                            <img
                              src={buildRawImageUrl(block.data.imagePath)}
                              alt={block.data.imageAlt || "Admin Preview"}
                              className="h-48 w-full rounded-[1rem] object-cover"
                            />
                          </div>
                          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-3">
                            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Frontend Render-API</p>
                            <img
                              src={toPageImageUrl(block.data.imagePath, { width: 800, quality: 80 })}
                              alt={block.data.imageAlt || "Render Preview"}
                              className="h-48 w-full rounded-[1rem] object-cover"
                            />
                          </div>
                        </div>
                      ) : null}

                      <div className="space-y-2">
                        <Label>Bullets (eine pro Zeile)</Label>
                        <Textarea
                          rows={5}
                          value={block.data.bullets.join("\n")}
                          onChange={(e) =>
                            setBlockAt(index, {
                              ...block,
                              data: {
                                ...block.data,
                                bullets: e.target.value.split("\n").map((entry) => entry.trim()).filter(Boolean),
                              },
                            })
                          }
                        />
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>CTA Label</Label>
                          <Input value={block.data.ctaLabel || ""} onChange={(e) => setBlockAt(index, { ...block, data: { ...block.data, ctaLabel: e.target.value } })} />
                        </div>
                        <div className="space-y-2">
                          <Label>CTA Link</Label>
                          <Input value={block.data.ctaHref || ""} onChange={(e) => setBlockAt(index, { ...block, data: { ...block.data, ctaHref: e.target.value } })} />
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {block.type === "cta_banner" ? (
                    <div className="grid gap-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Kicker</Label>
                          <Input value={block.data.kicker || ""} onChange={(e) => setBlockAt(index, { ...block, data: { ...block.data, kicker: e.target.value } })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Headline</Label>
                          <Input value={block.data.headline || ""} onChange={(e) => setBlockAt(index, { ...block, data: { ...block.data, headline: e.target.value } })} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Beschreibung</Label>
                        <Textarea rows={3} value={block.data.description || ""} onChange={(e) => setBlockAt(index, { ...block, data: { ...block.data, description: e.target.value } })} />
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Button Label</Label>
                          <Input value={block.data.buttonLabel || ""} onChange={(e) => setBlockAt(index, { ...block, data: { ...block.data, buttonLabel: e.target.value } })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Button Link</Label>
                          <Input value={block.data.buttonHref || ""} onChange={(e) => setBlockAt(index, { ...block, data: { ...block.data, buttonHref: e.target.value } })} />
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {block.type === "faq" ? (
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Kicker</Label>
                          <Input value={block.data.kicker || ""} onChange={(e) => setBlockAt(index, { ...block, data: { ...block.data, kicker: e.target.value } })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Headline</Label>
                          <Input value={block.data.headline || ""} onChange={(e) => setBlockAt(index, { ...block, data: { ...block.data, headline: e.target.value } })} />
                        </div>
                      </div>

                      {block.data.items.map((item, itemIndex) => (
                        <div key={`${block.id}-faq-${itemIndex}`} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                          <div className="grid gap-4">
                            <div className="space-y-2">
                              <Label>Frage</Label>
                              <Input
                                value={item.question || ""}
                                onChange={(e) => {
                                  const nextItems = [...block.data.items];
                                  nextItems[itemIndex] = { ...nextItems[itemIndex], question: e.target.value };
                                  setBlockAt(index, { ...block, data: { ...block.data, items: nextItems } });
                                }}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Antwort</Label>
                              <Textarea
                                rows={3}
                                value={item.answer || ""}
                                onChange={(e) => {
                                  const nextItems = [...block.data.items];
                                  nextItems[itemIndex] = { ...nextItems[itemIndex], answer: e.target.value };
                                  setBlockAt(index, { ...block, data: { ...block.data, items: nextItems } });
                                }}
                              />
                            </div>
                            <div className="flex justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                onClick={() => {
                                  const nextItems = block.data.items.filter((_, idx) => idx !== itemIndex);
                                  setBlockAt(index, { ...block, data: { ...block.data, items: nextItems } });
                                }}
                              >
                                <Trash2 size={14} className="mr-1" />
                                FAQ entfernen
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}

                      <Button
                        variant="outline"
                        className="rounded-xl"
                        onClick={() =>
                          setBlockAt(index, {
                            ...block,
                            data: {
                              ...block.data,
                              items: [...block.data.items, { question: "", answer: "" }],
                            },
                          })
                        }
                      >
                        <Plus size={16} className="mr-2" />
                        FAQ hinzufügen
                      </Button>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>

          {draft.slug ? (
            <div className="flex justify-end">
              <a
                href={previewPath}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#FF4B2C] hover:text-[#FF4B2C]"
              >
                <Eye size={16} />
                Öffentliche Seite öffnen
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default AdminPages;
