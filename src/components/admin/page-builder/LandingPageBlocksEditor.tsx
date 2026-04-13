import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Copy, Eye, EyeOff, GripVertical, ImagePlus, Plus, Trash2 } from "lucide-react";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import ConfirmDeleteDialog from "@/components/admin/ConfirmDeleteDialog";
import MediaLibraryDialog from "@/components/admin/media/MediaLibraryDialog";
import { buildRawImageUrl } from "@/lib/image";
import {
  createDefaultLandingPageBlock,
  getLandingPageBlockLabel,
  LANDING_PAGE_BLOCK_OPTIONS,
  summarizeLandingPageBlock,
  type LandingFeatureGridItem,
  type LandingFaqItem,
  type LandingPageBlock,
  type LandingPageBlockType,
  type LandingTrustItem,
} from "@/lib/landing-page-builder";
import { supabase } from "@/integrations/supabase/client";
import { useSiteContext } from "@/context/SiteContext";

type DeviceMode = "desktop" | "tablet" | "mobile";

type LandingPageBlocksEditorProps = {
  blocks: LandingPageBlock[];
  onChange: (blocks: LandingPageBlock[]) => void;
  onImageUpload: (file: File) => Promise<string>;
  disabled?: boolean;
  previewDevice?: DeviceMode;
  activeBlockId?: string | null;
  onActiveBlockChange?: (blockId: string | null) => void;
};

type MediaPickerState =
  | { blockId: string; field: string; altField?: string }
  | null;

type BannerCampaignOption = {
  id: string;
  name: string;
  headline: string | null;
  description: string | null;
  label: string | null;
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

const FEATURE_ICON_OPTIONS = ["Zap", "BarChart3", "Rocket", "Shield", "Users", "Gauge", "Sparkles", "MonitorSmartphone"];
const TRUST_ICON_OPTIONS = ["users", "gauge", "chart", "shield"];
const PROOF_ICON_OPTIONS = ["badge", "chart", "shield", "globe"];

const createFeatureItem = (): LandingFeatureGridItem => ({ title: "", text: "", iconKey: "Zap" });
const createTrustItem = (): LandingTrustItem => ({ title: "", desc: "", icon: "users" });
const createFaqItem = (): LandingFaqItem => ({ question: "", answer: "" });

const DraggableBlockRow = ({
  block,
  index,
  isActive,
  onSelect,
  onDuplicate,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
}: {
  block: LandingPageBlock;
  index: number;
  isActive: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onDragStart: () => void;
  onDragOver: (event: React.DragEvent<HTMLButtonElement>) => void;
  onDrop: () => void;
}) => (
  <button
    type="button"
    draggable
    onDragStart={onDragStart}
    onDragOver={onDragOver}
    onDrop={onDrop}
    onClick={onSelect}
    className={`group flex w-full items-start gap-3 rounded-[1.4rem] border px-4 py-4 text-left transition ${
      isActive ? "border-[#FF4B2C]/40 bg-[#FF4B2C]/8 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
    }`}
  >
    <div className="mt-1 text-slate-400"><GripVertical size={16} /></div>
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-2">
        <Badge className={`rounded-full ${isActive ? "bg-[#FF4B2C] text-white hover:bg-[#FF4B2C]" : "bg-slate-100 text-slate-600 hover:bg-slate-100"}`}>{String(index + 1).padStart(2, "0")}</Badge>
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{getLandingPageBlockLabel(block.type)}</span>
      </div>
      <p className="mt-2 line-clamp-2 text-sm font-semibold text-slate-900">{summarizeLandingPageBlock(block)}</p>
    </div>
    <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
      <Button type="button" size="icon" variant="ghost" className="h-8 w-8 rounded-xl" onClick={(event) => { event.stopPropagation(); onDuplicate(); }}>
        <Copy size={14} />
      </Button>
      <Button type="button" size="icon" variant="ghost" className="h-8 w-8 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700" onClick={(event) => { event.stopPropagation(); onDelete(); }}>
        <Trash2 size={14} />
      </Button>
    </div>
  </button>
);

const SectionCard = ({ title, description, children }: { title: string; description?: string; children: ReactNode }) => (
  <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-4">
    <div className="mb-4">
      <p className="text-sm font-bold text-slate-900">{title}</p>
      {description ? <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p> : null}
    </div>
    <div className="space-y-4">{children}</div>
  </div>
);

const ArrayShell = ({ title, addLabel, children, onAdd, disabled = false }: { title: string; addLabel: string; children: ReactNode; onAdd: () => void; disabled?: boolean }) => (
  <SectionCard title={title}>
    <div className="space-y-3">{children}</div>
    <Button type="button" variant="outline" size="sm" onClick={onAdd} disabled={disabled}>
      <Plus size={14} className="mr-2" />
      {addLabel}
    </Button>
  </SectionCard>
);

const AssetField = ({
  label,
  value,
  altValue,
  onPathChange,
  onAltChange,
  onUpload,
  onOpenLibrary,
  disabled = false,
}: {
  label: string;
  value?: string;
  altValue?: string;
  onPathChange: (value: string) => void;
  onAltChange?: (value: string) => void;
  onUpload: (file: File) => Promise<void>;
  onOpenLibrary: () => void;
  disabled?: boolean;
}) => {
  const preview = useMemo(() => buildRawImageUrl(value), [value]);

  return (
    <SectionCard title={label} description="Upload, vorhandenes Asset aus der Mediathek oder manueller Pfad.">
      <div className="grid gap-4 xl:grid-cols-[1fr_240px]">
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Storage-Pfad</Label>
            <Input value={value || ""} onChange={(event) => onPathChange(event.target.value)} placeholder="branding/sites/.../bild.webp" disabled={disabled} />
          </div>
          {onAltChange ? (
            <div className="space-y-2">
              <Label>Alt-Text</Label>
              <Input value={altValue || ""} onChange={(event) => onAltChange(event.target.value)} placeholder="Beschreibender Alt-Text" disabled={disabled} />
            </div>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-[#FF4B2C]/35 hover:bg-[#FF4B2C]/5">
              <ImagePlus size={15} /> Bild hochladen
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                disabled={disabled}
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (!file) return;
                  await onUpload(file);
                }}
              />
            </label>
            <Button type="button" variant="outline" size="sm" onClick={onOpenLibrary} disabled={disabled}>
              Mediathek öffnen
            </Button>
          </div>
        </div>
        <div className="overflow-hidden rounded-[1.25rem] border border-dashed border-slate-200 bg-white">
          {preview ? (
            <img src={preview} alt={altValue || "Preview"} className="h-full min-h-[180px] w-full object-cover" />
          ) : (
            <div className="flex min-h-[180px] items-center justify-center px-6 text-center text-xs font-medium uppercase tracking-[0.16em] text-slate-400">Kein Bild</div>
          )}
        </div>
      </div>
    </SectionCard>
  );
};

const LandingPageBlocksEditor = ({
  blocks,
  onChange,
  onImageUpload,
  disabled = false,
  previewDevice = "desktop",
  activeBlockId,
  onActiveBlockChange,
}: LandingPageBlocksEditorProps) => {
  const { activeSiteId } = useSiteContext();
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [internalSelectedBlockId, setInternalSelectedBlockId] = useState<string | null>(blocks[0]?.id ?? null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [mediaPicker, setMediaPicker] = useState<MediaPickerState>(null);
  const [inspectorValue, setInspectorValue] = useState<string[]>(["content", "layout", "media"]);

  const selectedBlockId = activeBlockId ?? internalSelectedBlockId;

  const setSelectedBlockId = (nextBlockId: string | null) => {
    if (activeBlockId === undefined) {
      setInternalSelectedBlockId(nextBlockId);
    }
    onActiveBlockChange?.(nextBlockId);
  };

  useEffect(() => {
    if (!blocks.length) {
      setSelectedBlockId(null);
      return;
    }
    if (!selectedBlockId || !blocks.some((block) => block.id === selectedBlockId)) {
      setSelectedBlockId(blocks[0].id);
    }
  }, [blocks, selectedBlockId]);

  const campaignQuery = useQuery({
    queryKey: ["banner-campaigns-editor", activeSiteId],
    enabled: Boolean(activeSiteId),
    queryFn: async (): Promise<BannerCampaignOption[]> => {
      const { data, error } = await supabase
        .from("banner_campaigns" as never)
        .select("id, name, headline, description, label, button_label, button_href, image_path, image_alt, tone, placement, starts_at, ends_at, is_active")
        .eq("site_id", activeSiteId)
        .eq("is_active", true)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (((data as unknown) as Record<string, unknown>[]) || []).map((row) => ({
        id: String(row.id || ""),
        name: String(row.name || ""),
        headline: typeof row.headline === "string" ? row.headline : null,
        description: typeof row.description === "string" ? row.description : null,
        label: typeof row.label === "string" ? row.label : null,
        button_label: typeof row.button_label === "string" ? row.button_label : null,
        button_href: typeof row.button_href === "string" ? row.button_href : null,
        image_path: typeof row.image_path === "string" ? row.image_path : null,
        image_alt: typeof row.image_alt === "string" ? row.image_alt : null,
        tone: row.tone === "dark" || row.tone === "light" ? row.tone : "accent",
        placement: row.placement === "top" || row.placement === "sidebar" || row.placement === "sticky_mobile" ? row.placement : "inline",
        starts_at: typeof row.starts_at === "string" ? row.starts_at : null,
        ends_at: typeof row.ends_at === "string" ? row.ends_at : null,
        is_active: Boolean(row.is_active),
      }));
    },
  });

  const selectedIndex = blocks.findIndex((block) => block.id === selectedBlockId);
  const selectedBlock = selectedIndex >= 0 ? blocks[selectedIndex] : null;

  const setBlock = (index: number, block: LandingPageBlock) => {
    const next = [...blocks];
    next[index] = block;
    onChange(next);
  };

  const updateBlockData = <T extends LandingPageBlock>(index: number, patch: Partial<T["data"]>) => {
    const current = blocks[index] as T | undefined;
    if (!current) return;
    setBlock(index, { ...current, data: { ...current.data, ...patch } } as LandingPageBlock);
  };

  const updateArrayItem = <T,>(items: T[], itemIndex: number, patch: Partial<T>) =>
    items.map((entry, currentIndex) => (currentIndex === itemIndex ? { ...entry, ...patch } : entry));

  const addBlock = (type: LandingPageBlockType) => {
    const nextBlock = createDefaultLandingPageBlock(type);
    const next = [...blocks, nextBlock];
    onChange(next);
    setSelectedBlockId(nextBlock.id);
  };

  const duplicateBlock = (index: number) => {
    const source = blocks[index];
    if (!source) return;
    const copy = JSON.parse(JSON.stringify(source)) as LandingPageBlock;
    copy.id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${source.id}-copy`;
    const next = [...blocks.slice(0, index + 1), copy, ...blocks.slice(index + 1)];
    onChange(next);
    setSelectedBlockId(copy.id);
  };

  const removeBlock = (index: number) => {
    const next = blocks.filter((_, currentIndex) => currentIndex !== index);
    onChange(next);
    setDeleteIndex(null);
    if (selectedIndex === index) {
      setSelectedBlockId(next[0]?.id ?? null);
    }
  };

  const handleDrop = (targetIndex: number) => {
    if (dragIndex === null || dragIndex === targetIndex) return;
    const reordered = [...blocks];
    const [item] = reordered.splice(dragIndex, 1);
    reordered.splice(targetIndex, 0, item);
    onChange(reordered);
    setDragIndex(null);
  };

  const openMediaPicker = (field: string, altField?: string) => {
    if (!selectedBlock) return;
    setMediaPicker({ blockId: selectedBlock.id, field, altField });
  };

  const previewHint = previewDevice === "mobile"
    ? "Mobile aktiv: 1-spaltige Struktur, kompakte Abstände und volle CTA-Breite prüfen."
    : previewDevice === "tablet"
      ? "Tablet aktiv: Übergänge zwischen stacked und split Layout sauber halten."
      : "Desktop aktiv: klare Hierarchie, ruhige Abstände und starke Hero-/CTA-Lesbarkeit prüfen.";

  return (
    <>
      <Card className="rounded-[2rem] border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Builder Workspace</CardTitle>
          <CardDescription>
            Kein Endlos-Scrollen mehr: links Block-Navigation, mittig nur der aktuell gewählte Inspector, rechts die fokussierte Live-Vorschau des aktiven Blocks.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-4">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {LANDING_PAGE_BLOCK_OPTIONS.map((option) => (
                <Button key={option.type} type="button" variant="outline" size="sm" onClick={() => addBlock(option.type)} disabled={disabled}>
                  <Plus size={14} className="mr-2" />
                  {option.label}
                </Button>
              ))}
            </div>
            <p className="text-xs leading-6 text-slate-500">{previewHint}</p>
          </div>

          <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
            <div className="space-y-4 xl:sticky xl:top-6 xl:self-start">
              <SectionCard title="Block-Navigation" description="Greifen, ziehen, ablegen – oder per Klick fokussiert bearbeiten. Die Preview folgt immer dem aktiv ausgewählten Block.">
                <ScrollArea className="max-h-[70vh] pr-3">
                  <div className="space-y-3">
                    {blocks.length === 0 ? (
                      <div className="rounded-[1.4rem] border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500">Noch keine Blöcke vorhanden.</div>
                    ) : (
                      blocks.map((block, index) => (
                        <DraggableBlockRow
                          key={block.id}
                          block={block}
                          index={index}
                          isActive={selectedBlockId === block.id}
                          onSelect={() => setSelectedBlockId(block.id)}
                          onDuplicate={() => duplicateBlock(index)}
                          onDelete={() => setDeleteIndex(index)}
                          onDragStart={() => setDragIndex(index)}
                          onDragOver={(event) => event.preventDefault()}
                          onDrop={() => handleDrop(index)}
                        />
                      ))
                    )}
                  </div>
                </ScrollArea>
              </SectionCard>
            </div>

            <div className="space-y-4">
              {!selectedBlock ? (
                <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">Füge zuerst einen Block hinzu oder wähle links einen bestehenden Block aus.</div>
              ) : (
                <Card className="rounded-[1.75rem] border-slate-200 shadow-sm">
                  <CardHeader className="border-b border-slate-100">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge className="rounded-full bg-[#FF4B2C]/10 text-[#FF4B2C] hover:bg-[#FF4B2C]/10">{getLandingPageBlockLabel(selectedBlock.type)}</Badge>
                          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Block #{selectedIndex + 1}</span>
                        </div>
                        <CardTitle className="mt-3 text-xl">{summarizeLandingPageBlock(selectedBlock)}</CardTitle>
                        <CardDescription className="mt-2">Nur dieser Block ist offen. So bleibt der Builder sauber und fokussiert.</CardDescription>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => duplicateBlock(selectedIndex)} disabled={disabled}><Copy size={14} className="mr-2" />Duplizieren</Button>
                        <Button variant="destructive" size="sm" onClick={() => setDeleteIndex(selectedIndex)} disabled={disabled}><Trash2 size={14} className="mr-2" />Löschen</Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-5">
                    <Accordion type="multiple" value={inspectorValue} onValueChange={setInspectorValue} className="space-y-4">
                      <AccordionItem value="content" className="rounded-[1.5rem] border border-slate-200 bg-white px-4">
                        <AccordionTrigger className="py-4 text-left text-base font-bold text-slate-900">Content</AccordionTrigger>
                        <AccordionContent className="pb-5">
                          {selectedBlock.type === "hero" ? (
                            <div className="space-y-4">
                              <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2"><Label>Badge</Label><Input value={selectedBlock.data.badge_text || ""} onChange={(event) => updateBlockData(selectedIndex, { badge_text: event.target.value })} disabled={disabled} /></div>
                                <div className="space-y-2"><Label>Visual Badge</Label><Input value={selectedBlock.data.visual_badge || ""} onChange={(event) => updateBlockData(selectedIndex, { visual_badge: event.target.value })} disabled={disabled} /></div>
                              </div>
                              <div className="space-y-2"><Label>Headline (H1)</Label><Input value={selectedBlock.data.headline || ""} onChange={(event) => updateBlockData(selectedIndex, { headline: event.target.value })} disabled={disabled} /></div>
                              <div className="space-y-2"><Label>Subheadline</Label><Textarea rows={4} value={selectedBlock.data.subheadline || ""} onChange={(event) => updateBlockData(selectedIndex, { subheadline: event.target.value })} disabled={disabled} /></div>
                              <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2"><Label>Primärer CTA Text</Label><Input value={selectedBlock.data.primary_cta_text || ""} onChange={(event) => updateBlockData(selectedIndex, { primary_cta_text: event.target.value })} disabled={disabled} /></div>
                                <div className="space-y-2"><Label>Primärer CTA Link</Label><Input value={selectedBlock.data.primary_cta_href || ""} onChange={(event) => updateBlockData(selectedIndex, { primary_cta_href: event.target.value })} disabled={disabled} /></div>
                              </div>
                              <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2"><Label>Sekundärer CTA Text</Label><Input value={selectedBlock.data.secondary_cta_text || ""} onChange={(event) => updateBlockData(selectedIndex, { secondary_cta_text: event.target.value })} disabled={disabled} /></div>
                                <div className="space-y-2"><Label>Sekundärer CTA Link</Label><Input value={selectedBlock.data.secondary_cta_href || ""} onChange={(event) => updateBlockData(selectedIndex, { secondary_cta_href: event.target.value })} disabled={disabled} /></div>
                              </div>
                              <ArrayShell title="Stats" addLabel="Stat hinzufügen" onAdd={() => updateBlockData(selectedIndex, { stats: [...(selectedBlock.data.stats || []), { label: "", value: "" }] })} disabled={disabled}>
                                {(selectedBlock.data.stats || []).map((item, itemIndex) => (
                                  <div key={`hero-stat-${itemIndex}`} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                                    <Input value={item.label || ""} onChange={(event) => updateBlockData(selectedIndex, { stats: updateArrayItem(selectedBlock.data.stats || [], itemIndex, { label: event.target.value }) })} placeholder="Label" disabled={disabled} />
                                    <Input value={item.value || ""} onChange={(event) => updateBlockData(selectedIndex, { stats: updateArrayItem(selectedBlock.data.stats || [], itemIndex, { value: event.target.value }) })} placeholder="Wert" disabled={disabled} />
                                    <Button type="button" variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => updateBlockData(selectedIndex, { stats: (selectedBlock.data.stats || []).filter((_, currentIndex) => currentIndex !== itemIndex) })} disabled={disabled}><Trash2 size={15} /></Button>
                                  </div>
                                ))}
                              </ArrayShell>
                              <ArrayShell title="Proof Items" addLabel="Proof hinzufügen" onAdd={() => updateBlockData(selectedIndex, { proof_items: [...(selectedBlock.data.proof_items || []), { icon: "badge", text: "" }] })} disabled={disabled}>
                                {(selectedBlock.data.proof_items || []).map((item, itemIndex) => (
                                  <div key={`hero-proof-${itemIndex}`} className="grid gap-3 md:grid-cols-[160px_1fr_auto]">
                                    <select className="h-10 rounded-xl border border-slate-200 px-3 text-sm" value={item.icon || "badge"} onChange={(event) => updateBlockData(selectedIndex, { proof_items: updateArrayItem(selectedBlock.data.proof_items || [], itemIndex, { icon: event.target.value as typeof item.icon }) })}>
                                      {PROOF_ICON_OPTIONS.map((icon) => <option key={icon} value={icon}>{icon}</option>)}
                                    </select>
                                    <Input value={item.text || ""} onChange={(event) => updateBlockData(selectedIndex, { proof_items: updateArrayItem(selectedBlock.data.proof_items || [], itemIndex, { text: event.target.value }) })} placeholder="Proof Text" disabled={disabled} />
                                    <Button type="button" variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => updateBlockData(selectedIndex, { proof_items: (selectedBlock.data.proof_items || []).filter((_, currentIndex) => currentIndex !== itemIndex) })} disabled={disabled}><Trash2 size={15} /></Button>
                                  </div>
                                ))}
                              </ArrayShell>
                            </div>
                          ) : null}

                          {selectedBlock.type === "rich_text" ? (
                            <div className="space-y-4">
                              <div className="space-y-2"><Label>Kicker</Label><Input value={selectedBlock.data.kicker || ""} onChange={(event) => updateBlockData(selectedIndex, { kicker: event.target.value })} disabled={disabled} /></div>
                              <div className="space-y-2"><Label>Headline</Label><Input value={selectedBlock.data.headline || ""} onChange={(event) => updateBlockData(selectedIndex, { headline: event.target.value })} disabled={disabled} /></div>
                              <div className="space-y-2"><Label>Content</Label><RichTextEditor value={selectedBlock.data.body_html || ""} onChange={(html) => updateBlockData(selectedIndex, { body_html: html })} onImageUpload={async (file) => buildRawImageUrl(await onImageUpload(file))} disabled={disabled} placeholder="SEO-Text, Intro oder Details…" /></div>
                            </div>
                          ) : null}

                          {selectedBlock.type === "feature_grid" ? (
                            <div className="space-y-4">
                              <div className="space-y-2"><Label>Kicker</Label><Input value={selectedBlock.data.kicker || ""} onChange={(event) => updateBlockData(selectedIndex, { kicker: event.target.value })} disabled={disabled} /></div>
                              <div className="space-y-2"><Label>Headline</Label><Input value={selectedBlock.data.headline || ""} onChange={(event) => updateBlockData(selectedIndex, { headline: event.target.value })} disabled={disabled} /></div>
                              <div className="space-y-2"><Label>Beschreibung</Label><Textarea rows={3} value={selectedBlock.data.description || ""} onChange={(event) => updateBlockData(selectedIndex, { description: event.target.value })} disabled={disabled} /></div>
                              <ArrayShell title="Feature Cards" addLabel="Feature hinzufügen" onAdd={() => updateBlockData(selectedIndex, { items: [...(selectedBlock.data.items || []), createFeatureItem()] })} disabled={disabled}>
                                {(selectedBlock.data.items || []).map((item, itemIndex) => (
                                  <div key={`feature-item-${itemIndex}`} className="space-y-3 rounded-[1.2rem] border border-slate-200 bg-white p-4">
                                    <div className="grid gap-3 md:grid-cols-[160px_1fr_auto]">
                                      <select className="h-10 rounded-xl border border-slate-200 px-3 text-sm" value={item.iconKey || "Zap"} onChange={(event) => updateBlockData(selectedIndex, { items: updateArrayItem(selectedBlock.data.items || [], itemIndex, { iconKey: event.target.value }) })}>
                                        {FEATURE_ICON_OPTIONS.map((icon) => <option key={icon} value={icon}>{icon}</option>)}
                                      </select>
                                      <Input value={item.title || ""} onChange={(event) => updateBlockData(selectedIndex, { items: updateArrayItem(selectedBlock.data.items || [], itemIndex, { title: event.target.value }) })} placeholder="Titel" disabled={disabled} />
                                      <Button type="button" variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => updateBlockData(selectedIndex, { items: (selectedBlock.data.items || []).filter((_, currentIndex) => currentIndex !== itemIndex) })} disabled={disabled}><Trash2 size={15} /></Button>
                                    </div>
                                    <Textarea rows={3} value={item.text || ""} onChange={(event) => updateBlockData(selectedIndex, { items: updateArrayItem(selectedBlock.data.items || [], itemIndex, { text: event.target.value }) })} placeholder="Beschreibung" disabled={disabled} />
                                  </div>
                                ))}
                              </ArrayShell>
                            </div>
                          ) : null}

                          {selectedBlock.type === "image_text_split" ? (
                            <div className="space-y-4">
                              <div className="space-y-2"><Label>Kicker</Label><Input value={selectedBlock.data.kicker || ""} onChange={(event) => updateBlockData(selectedIndex, { kicker: event.target.value })} disabled={disabled} /></div>
                              <div className="space-y-2"><Label>Headline</Label><Input value={selectedBlock.data.headline || ""} onChange={(event) => updateBlockData(selectedIndex, { headline: event.target.value })} disabled={disabled} /></div>
                              <div className="space-y-2"><Label>Body</Label><RichTextEditor value={selectedBlock.data.body_html || ""} onChange={(html) => updateBlockData(selectedIndex, { body_html: html })} onImageUpload={async (file) => buildRawImageUrl(await onImageUpload(file))} disabled={disabled} placeholder="Erkläre Prozess, Nutzen und visuelle Story." /></div>
                              <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2"><Label>CTA Text</Label><Input value={selectedBlock.data.cta_label || ""} onChange={(event) => updateBlockData(selectedIndex, { cta_label: event.target.value })} disabled={disabled} /></div>
                                <div className="space-y-2"><Label>CTA Link</Label><Input value={selectedBlock.data.cta_href || ""} onChange={(event) => updateBlockData(selectedIndex, { cta_href: event.target.value })} disabled={disabled} /></div>
                              </div>
                              <ArrayShell title="Bulletpoints" addLabel="Bullet hinzufügen" onAdd={() => updateBlockData(selectedIndex, { bullets: [...(selectedBlock.data.bullets || []), ""] })} disabled={disabled}>
                                {(selectedBlock.data.bullets || []).map((bullet, itemIndex) => (
                                  <div key={`bullet-${itemIndex}`} className="grid gap-3 md:grid-cols-[1fr_auto]">
                                    <Input value={bullet || ""} onChange={(event) => updateBlockData(selectedIndex, { bullets: (selectedBlock.data.bullets || []).map((entry, currentIndex) => currentIndex === itemIndex ? event.target.value : entry) })} placeholder="Bullet" disabled={disabled} />
                                    <Button type="button" variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => updateBlockData(selectedIndex, { bullets: (selectedBlock.data.bullets || []).filter((_, currentIndex) => currentIndex !== itemIndex) })} disabled={disabled}><Trash2 size={15} /></Button>
                                  </div>
                                ))}
                              </ArrayShell>
                            </div>
                          ) : null}

                          {selectedBlock.type === "trust" ? (
                            <div className="space-y-4">
                              <div className="space-y-2"><Label>Kicker</Label><Input value={selectedBlock.data.kicker || ""} onChange={(event) => updateBlockData(selectedIndex, { kicker: event.target.value })} disabled={disabled} /></div>
                              <div className="space-y-2"><Label>Titel</Label><Input value={selectedBlock.data.title || ""} onChange={(event) => updateBlockData(selectedIndex, { title: event.target.value })} disabled={disabled} /></div>
                              <div className="space-y-2"><Label>Beschreibung</Label><Textarea rows={3} value={selectedBlock.data.description || ""} onChange={(event) => updateBlockData(selectedIndex, { description: event.target.value })} disabled={disabled} /></div>
                              <ArrayShell title="Trust Punkte" addLabel="Trust Punkt hinzufügen" onAdd={() => updateBlockData(selectedIndex, { items: [...(selectedBlock.data.items || []), createTrustItem()] })} disabled={disabled}>
                                {(selectedBlock.data.items || []).map((item, itemIndex) => (
                                  <div key={`trust-item-${itemIndex}`} className="space-y-3 rounded-[1.2rem] border border-slate-200 bg-white p-4">
                                    <div className="grid gap-3 md:grid-cols-[160px_1fr_auto]">
                                      <select className="h-10 rounded-xl border border-slate-200 px-3 text-sm" value={item.icon || "users"} onChange={(event) => updateBlockData(selectedIndex, { items: updateArrayItem(selectedBlock.data.items || [], itemIndex, { icon: event.target.value as typeof item.icon }) })}>
                                        {TRUST_ICON_OPTIONS.map((icon) => <option key={icon} value={icon}>{icon}</option>)}
                                      </select>
                                      <Input value={item.title || ""} onChange={(event) => updateBlockData(selectedIndex, { items: updateArrayItem(selectedBlock.data.items || [], itemIndex, { title: event.target.value }) })} placeholder="Titel" disabled={disabled} />
                                      <Button type="button" variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => updateBlockData(selectedIndex, { items: (selectedBlock.data.items || []).filter((_, currentIndex) => currentIndex !== itemIndex) })} disabled={disabled}><Trash2 size={15} /></Button>
                                    </div>
                                    <Textarea rows={3} value={item.desc || ""} onChange={(event) => updateBlockData(selectedIndex, { items: updateArrayItem(selectedBlock.data.items || [], itemIndex, { desc: event.target.value }) })} placeholder="Beschreibung" disabled={disabled} />
                                  </div>
                                ))}
                              </ArrayShell>
                            </div>
                          ) : null}

                          {selectedBlock.type === "cta_banner" ? (
                            <div className="space-y-4">
                              <SectionCard title="Kampagnenquelle" description="Direkt manuell pflegen oder eine zentrale Banner-Kampagne übernehmen.">
                                <div className="space-y-3">
                                  <div className="space-y-2">
                                    <Label>Aktive Banner-Kampagne</Label>
                                    <select
                                      className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm"
                                      value={selectedBlock.data.campaign_id || "manual"}
                                      onChange={(event) => {
                                        const campaignId = event.target.value;
                                        if (campaignId === "manual") {
                                          updateBlockData(selectedIndex, { campaign_id: "", campaign_name: "" });
                                          return;
                                        }
                                        const campaign = (campaignQuery.data || []).find((entry) => entry.id === campaignId);
                                        if (!campaign) return;
                                        updateBlockData(selectedIndex, {
                                          campaign_id: campaign.id,
                                          campaign_name: campaign.name,
                                          kicker: campaign.label || selectedBlock.data.kicker,
                                          headline: campaign.headline || selectedBlock.data.headline,
                                          description: campaign.description || selectedBlock.data.description,
                                          button_label: campaign.button_label || selectedBlock.data.button_label,
                                          button_href: campaign.button_href || selectedBlock.data.button_href,
                                          image_path: campaign.image_path || selectedBlock.data.image_path,
                                          image_alt: campaign.image_alt || selectedBlock.data.image_alt,
                                          tone: campaign.tone,
                                          placement: campaign.placement,
                                          starts_at: campaign.starts_at || "",
                                          ends_at: campaign.ends_at || "",
                                          is_campaign_active: campaign.is_active,
                                        });
                                      }}
                                    >
                                      <option value="manual">Manuell im Block pflegen</option>
                                      {(campaignQuery.data || []).map((campaign) => <option key={campaign.id} value={campaign.id}>{campaign.name}</option>)}
                                    </select>
                                  </div>
                                  {selectedBlock.data.campaign_name ? (
                                    <p className="text-xs leading-5 text-slate-500">Aktuell verknüpft: <span className="font-semibold text-slate-700">{selectedBlock.data.campaign_name}</span>. Die Inhalte wurden als Snapshot in den Block übernommen.</p>
                                  ) : null}
                                </div>
                              </SectionCard>
                              <div className="space-y-2"><Label>Kicker / Label</Label><Input value={selectedBlock.data.kicker || ""} onChange={(event) => updateBlockData(selectedIndex, { kicker: event.target.value })} disabled={disabled} /></div>
                              <div className="space-y-2"><Label>Headline</Label><Input value={selectedBlock.data.headline || ""} onChange={(event) => updateBlockData(selectedIndex, { headline: event.target.value })} disabled={disabled} /></div>
                              <div className="space-y-2"><Label>Beschreibung</Label><Textarea rows={4} value={selectedBlock.data.description || ""} onChange={(event) => updateBlockData(selectedIndex, { description: event.target.value })} disabled={disabled} /></div>
                              <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2"><Label>CTA Text</Label><Input value={selectedBlock.data.button_label || ""} onChange={(event) => updateBlockData(selectedIndex, { button_label: event.target.value })} disabled={disabled} /></div>
                                <div className="space-y-2"><Label>CTA Link</Label><Input value={selectedBlock.data.button_href || ""} onChange={(event) => updateBlockData(selectedIndex, { button_href: event.target.value })} disabled={disabled} /></div>
                              </div>
                              <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                  <Label>Tone</Label>
                                  <select className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" value={selectedBlock.data.tone || "accent"} onChange={(event) => updateBlockData(selectedIndex, { tone: event.target.value as typeof selectedBlock.data.tone })}>
                                    <option value="accent">Accent</option>
                                    <option value="light">Light</option>
                                    <option value="dark">Dark</option>
                                  </select>
                                </div>
                                <div className="space-y-2">
                                  <Label>Placement</Label>
                                  <select className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" value={selectedBlock.data.placement || "inline"} onChange={(event) => updateBlockData(selectedIndex, { placement: event.target.value as typeof selectedBlock.data.placement })}>
                                    <option value="inline">Inline</option>
                                    <option value="top">Top</option>
                                    <option value="sidebar">Sidebar</option>
                                    <option value="sticky_mobile">Sticky Mobile</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          ) : null}

                          {selectedBlock.type === "faq" ? (
                            <div className="space-y-4">
                              <div className="space-y-2"><Label>Kicker</Label><Input value={selectedBlock.data.kicker || ""} onChange={(event) => updateBlockData(selectedIndex, { kicker: event.target.value })} disabled={disabled} /></div>
                              <div className="space-y-2"><Label>Titel</Label><Input value={selectedBlock.data.title || ""} onChange={(event) => updateBlockData(selectedIndex, { title: event.target.value })} disabled={disabled} /></div>
                              <div className="space-y-2"><Label>Beschreibung</Label><Textarea rows={3} value={selectedBlock.data.description || ""} onChange={(event) => updateBlockData(selectedIndex, { description: event.target.value })} disabled={disabled} /></div>
                              <ArrayShell title="FAQ Einträge" addLabel="Frage hinzufügen" onAdd={() => updateBlockData(selectedIndex, { items: [...(selectedBlock.data.items || []), createFaqItem()] })} disabled={disabled}>
                                {(selectedBlock.data.items || []).map((item, itemIndex) => (
                                  <div key={`faq-item-${itemIndex}`} className="space-y-3 rounded-[1.2rem] border border-slate-200 bg-white p-4">
                                    <Input value={item.question || ""} onChange={(event) => updateBlockData(selectedIndex, { items: updateArrayItem(selectedBlock.data.items || [], itemIndex, { question: event.target.value }) })} placeholder="Frage" disabled={disabled} />
                                    <Textarea rows={4} value={item.answer || ""} onChange={(event) => updateBlockData(selectedIndex, { items: updateArrayItem(selectedBlock.data.items || [], itemIndex, { answer: event.target.value }) })} placeholder="Antwort" disabled={disabled} />
                                    <Button type="button" variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => updateBlockData(selectedIndex, { items: (selectedBlock.data.items || []).filter((_, currentIndex) => currentIndex !== itemIndex) })} disabled={disabled}><Trash2 size={15} className="mr-2" />Entfernen</Button>
                                  </div>
                                ))}
                              </ArrayShell>
                            </div>
                          ) : null}
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="layout" className="rounded-[1.5rem] border border-slate-200 bg-white px-4">
                        <AccordionTrigger className="py-4 text-left text-base font-bold text-slate-900">Layout & Mobile Guardrails</AccordionTrigger>
                        <AccordionContent className="pb-5">
                          {selectedBlock.type === "image_text_split" ? (
                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label>Bildseite Desktop</Label>
                                <select className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" value={selectedBlock.data.image_side || "right"} onChange={(event) => updateBlockData(selectedIndex, { image_side: event.target.value as "left" | "right" })}>
                                  <option value="right">Bild rechts</option>
                                  <option value="left">Bild links</option>
                                </select>
                              </div>
                              <div className="flex items-end justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                <div>
                                  <div className="text-sm font-semibold text-slate-900">Bild mobil zuerst</div>
                                  <div className="text-xs text-slate-500">Für starke visuelle Einstiege auf kleinen Screens.</div>
                                </div>
                                <Switch checked={Boolean(selectedBlock.data.mobile_image_first)} onCheckedChange={(checked) => updateBlockData(selectedIndex, { mobile_image_first: checked })} />
                              </div>
                            </div>
                          ) : (
                            <div className="rounded-[1.4rem] border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                              Dieser Block braucht aktuell keine zusätzlichen Layout-Schalter. Prüfe die Darstellung direkt über die Device-Vorschau rechts.
                            </div>
                          )}
                          {selectedBlock.type === "hero" ? (
                            <div className="mt-4 space-y-2">
                              <Label>Overlay-Deckkraft (0–1)</Label>
                              <Input type="number" step="0.05" min="0" max="1" value={selectedBlock.data.overlay_opacity ?? 0.45} onChange={(event) => updateBlockData(selectedIndex, { overlay_opacity: Number(event.target.value) })} />
                            </div>
                          ) : null}
                          {selectedBlock.type === "cta_banner" ? (
                            <div className="mt-4 rounded-[1.4rem] border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
                              Mobile Guardrail: CTA-Banner sollten kurze Headlines und maximal einen primären CTA haben. Auf Mobile rendert der Button automatisch volle Breite.
                            </div>
                          ) : null}
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="media" className="rounded-[1.5rem] border border-slate-200 bg-white px-4">
                        <AccordionTrigger className="py-4 text-left text-base font-bold text-slate-900">Medien</AccordionTrigger>
                        <AccordionContent className="pb-5">
                          {selectedBlock.type === "hero" ? (
                            <div className="space-y-4">
                              <AssetField
                                label="Hero Hintergrund"
                                value={selectedBlock.data.background_image_path}
                                onPathChange={(value) => updateBlockData(selectedIndex, { background_image_path: value })}
                                onUpload={async (file) => updateBlockData(selectedIndex, { background_image_path: await onImageUpload(file) })}
                                onOpenLibrary={() => openMediaPicker("background_image_path")}
                                disabled={disabled}
                              />
                              <AssetField
                                label="Hero Bild Mobile (optional)"
                                value={selectedBlock.data.background_mobile_image_path}
                                onPathChange={(value) => updateBlockData(selectedIndex, { background_mobile_image_path: value })}
                                onUpload={async (file) => updateBlockData(selectedIndex, { background_mobile_image_path: await onImageUpload(file) })}
                                onOpenLibrary={() => openMediaPicker("background_mobile_image_path")}
                                disabled={disabled}
                              />
                            </div>
                          ) : null}

                          {selectedBlock.type === "image_text_split" ? (
                            <AssetField
                              label="Split Bild"
                              value={selectedBlock.data.image_path}
                              altValue={selectedBlock.data.image_alt}
                              onPathChange={(value) => updateBlockData(selectedIndex, { image_path: value })}
                              onAltChange={(value) => updateBlockData(selectedIndex, { image_alt: value })}
                              onUpload={async (file) => updateBlockData(selectedIndex, { image_path: await onImageUpload(file) })}
                              onOpenLibrary={() => openMediaPicker("image_path", "image_alt")}
                              disabled={disabled}
                            />
                          ) : null}

                          {selectedBlock.type === "cta_banner" ? (
                            <AssetField
                              label="Banner Bild"
                              value={selectedBlock.data.image_path}
                              altValue={selectedBlock.data.image_alt}
                              onPathChange={(value) => updateBlockData(selectedIndex, { image_path: value })}
                              onAltChange={(value) => updateBlockData(selectedIndex, { image_alt: value })}
                              onUpload={async (file) => updateBlockData(selectedIndex, { image_path: await onImageUpload(file) })}
                              onOpenLibrary={() => openMediaPicker("image_path", "image_alt")}
                              disabled={disabled}
                            />
                          ) : null}

                          {!(["hero", "image_text_split", "cta_banner"] as string[]).includes(selectedBlock.type) ? (
                            <div className="rounded-[1.4rem] border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">Dieser Block nutzt aktuell keine Bild-Assets.</div>
                          ) : null}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <ConfirmDeleteDialog
        open={deleteIndex !== null}
        onOpenChange={(open) => !open && setDeleteIndex(null)}
        title="Block löschen?"
        description={deleteIndex !== null ? `Der Block „${getLandingPageBlockLabel(blocks[deleteIndex]?.type || "block")}" wird aus dieser Landingpage entfernt.` : ""}
        onConfirm={() => deleteIndex !== null && removeBlock(deleteIndex)}
      />

      <MediaLibraryDialog
        open={Boolean(mediaPicker)}
        onOpenChange={(open) => !open && setMediaPicker(null)}
        siteId={activeSiteId || ""}
        onSelect={(asset) => {
          if (!mediaPicker) return;
          const blockIndex = blocks.findIndex((block) => block.id === mediaPicker.blockId);
          if (blockIndex === -1) return;
          const patch: Record<string, string> = { [mediaPicker.field]: asset.storage_path };
          if (mediaPicker.altField && asset.alt_text) patch[mediaPicker.altField] = asset.alt_text;
          updateBlockData(blockIndex, patch as any);
          setMediaPicker(null);
        }}
      />
    </>
  );
};

export default LandingPageBlocksEditor;
