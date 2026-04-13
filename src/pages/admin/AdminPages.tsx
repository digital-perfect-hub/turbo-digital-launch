import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  Eye,
  FilePlus2,
  Grip,
  ImagePlus,
  Laptop,
  MonitorSmartphone,
  Plus,
  RefreshCw,
  Save,
  Smartphone,
  Tablet,
  Trash2,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  normalizeLandingPageBlocks,
  normalizeLandingPageSlug,
  type LandingFaqBlockData,
  type LandingFaqItem,
  type LandingHeroBlockData,
  type LandingHeroProofItem,
  type LandingHeroStat,
  type LandingPageBlock,
  type LandingRichTextBlockData,
  type LandingTrustBlockData,
  type LandingTrustItem,
} from "@/lib/landing-page-builder";
import { buildRawImageUrl } from "@/lib/image";
import { uploadBrandingAsset } from "@/lib/storage";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { useSiteContext } from "@/context/SiteContext";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import MediaDropzone from "@/components/admin/media/MediaDropzone";
import BlockRenderer from "@/components/page-builder/BlockRenderer";
import { cn } from "@/lib/utils";

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
  page_blocks: LandingPageBlock[];
};

type PreviewDevice = "desktop" | "tablet" | "mobile";

type DraftPayload = {
  form: LandingPageForm;
  activeBlockId: string;
  previewDevice: PreviewDevice;
  updatedAt: number;
};

const QUERY_KEY = ["admin-landing-pages"];
const EDITOR_SESSION_KEY = "dp-admin-pages-session-v2";
const DRAFT_KEY_PREFIX = "dp-admin-pages-draft-v2:";

const EMPTY_FORM: LandingPageForm = {
  id: null,
  slug: "",
  meta_title: "",
  meta_description: "",
  is_published: false,
  page_blocks: [],
};

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `landing-block-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const createHeroBlock = (): LandingPageBlock => ({
  id: createId(),
  type: "hero",
  data: {
    badge_text: "Digitale Performance für Unternehmen",
    headline: "Landingpage mit Struktur und Wirkung",
    subheadline: "Klare Positionierung, starke Inhalte und saubere CTA-Führung direkt aus dem Builder.",
    primary_cta_text: "Kostenloses Erstgespräch sichern",
    primary_cta_href: "#kontakt",
    secondary_cta_text: "Leistungen ansehen",
    secondary_cta_href: "/leistungen",
    stats: [
      { label: "Fokus", value: "Conversion" },
      { label: "Look", value: "Premium" },
      { label: "Ziel", value: "Anfragen" },
    ],
    proof_items: [
      { icon: "badge", text: "Saubere Struktur statt Seiten-Chaos" },
      { icon: "chart", text: "Sichtbarkeit, Inhalte und Technik in einem System" },
      { icon: "shield", text: "Pflegbar, erweiterbar und messbar" },
    ],
    show_bottom_box1: true,
    bottom_box1_kicker: "Standort",
    bottom_box1_title: "Linz",
    show_bottom_box2: true,
    bottom_box2_kicker: "Fokus",
    bottom_box2_title: "Webdesign & SEO",
  },
});

const createRichTextBlock = (): LandingPageBlock => ({
  id: createId(),
  type: "rich_text",
  data: {
    kicker: "Einordnung",
    headline: "Warum diese Landingpage wichtig ist",
    body_html:
      "<p>Nutze diesen Bereich für echte Inhalte mit klarer Einordnung, Nutzenargumenten und internen Links. Genau hier gewinnt die Seite an Substanz.</p>",
  },
});

const createTrustBlock = (): LandingPageBlock => ({
  id: createId(),
  type: "trust",
  data: {
    kicker: "Warum wir",
    title: "Saubere Systeme statt schöner Fassade",
    description: "Trust-Blöcke bringen Struktur, Sicherheit und greifbare Gründe für die Entscheidung.",
    items: [
      { title: "Klare Prozesse", desc: "Keine Bauchentscheidungen, sondern nachvollziehbare Umsetzung.", icon: "gauge" },
      { title: "Messbare Struktur", desc: "SEO, UX und Technik greifen sauber ineinander.", icon: "chart" },
      { title: "Wartbar", desc: "Keine Wegwerf-Seite, sondern ein System, das mitwächst.", icon: "shield" },
    ],
  },
});

const createFaqBlock = (): LandingPageBlock => ({
  id: createId(),
  type: "faq",
  data: {
    kicker: "FAQ",
    title: "Häufige Fragen",
    description: "Kurze, saubere Antworten für Einordnung und Conversion.",
    items: [
      { question: "Wie schnell kann die Seite live gehen?", answer: "Das hängt von Inhalt, Freigaben und Assets ab. Mit sauberem Briefing deutlich schneller." },
      { question: "Können wir Inhalte später selbst ändern?", answer: "Ja. Genau dafür ist der Builder gedacht: sauber, pflegbar und ohne Chaos." },
    ],
  },
});

const DEFAULT_BLOCK_FACTORIES: Array<{ type: LandingPageBlock["type"]; label: string; create: () => LandingPageBlock }> = [
  { type: "hero", label: "Hero", create: createHeroBlock },
  { type: "rich_text", label: "Rich Text", create: createRichTextBlock },
  { type: "trust", label: "Trust", create: createTrustBlock },
  { type: "faq", label: "FAQ", create: createFaqBlock },
];

const createFormFromRow = (row: LandingPageRow): LandingPageForm => ({
  id: row.id,
  slug: row.slug,
  meta_title: row.meta_title || "",
  meta_description: row.meta_description || "",
  is_published: row.is_published,
  page_blocks: normalizeLandingPageBlocks(row.page_blocks),
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

const getDraftKey = (form: LandingPageForm) => `${DRAFT_KEY_PREFIX}${form.id || normalizeLandingPageSlug(form.slug) || "new"}`;

const blockTypeLabel = (type: LandingPageBlock["type"]) => {
  switch (type) {
    case "hero":
      return "Hero";
    case "rich_text":
      return "Rich Text";
    case "trust":
      return "Trust";
    case "faq":
      return "FAQ";
    default:
      return type;
  }
};

const blockHeadline = (block: LandingPageBlock) => {
  switch (block.type) {
    case "hero":
      return block.data.headline || "Hero";
    case "rich_text":
      return block.data.headline || block.data.kicker || "Rich Text";
    case "trust":
      return block.data.title || block.data.kicker || "Trust";
    case "faq":
      return block.data.title || block.data.kicker || "FAQ";
    default:
      return "Block";
  }
};

const deepCloneBlocks = (blocks: LandingPageBlock[]) => normalizeLandingPageBlocks(JSON.parse(JSON.stringify(blocks)));

const generateCopySlug = (slug: string, existingSlugs: string[]) => {
  const base = normalizeLandingPageSlug(slug) || "landingpage";
  const copyBase = `${base}-kopie`;
  if (!existingSlugs.includes(copyBase)) return copyBase;

  let index = 2;
  while (existingSlugs.includes(`${copyBase}-${index}`)) index += 1;
  return `${copyBase}-${index}`;
};

const parseStoredDraft = (raw: string | null): DraftPayload | null => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as DraftPayload;
    return {
      ...parsed,
      form: {
        ...parsed.form,
        page_blocks: normalizeLandingPageBlocks(parsed.form?.page_blocks),
      },
      activeBlockId: parsed.activeBlockId || "all",
      previewDevice:
        parsed.previewDevice === "tablet" || parsed.previewDevice === "mobile" || parsed.previewDevice === "desktop"
          ? parsed.previewDevice
          : "desktop",
      updatedAt: typeof parsed.updatedAt === "number" ? parsed.updatedAt : Date.now(),
    };
  } catch {
    return null;
  }
};

const stableStringify = (value: unknown) => JSON.stringify(value);

const isExternalUrl = (value: string) => /^https?:\/\//i.test(value);

const ensureHref = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "#";
  if (trimmed.startsWith("#") || trimmed.startsWith("/")) return trimmed;
  if (isExternalUrl(trimmed)) return trimmed;
  return `/${trimmed.replace(/^\/+/, "")}`;
};

const PublishedBadge = ({ published }: { published: boolean }) => (
  <Badge variant={published ? "default" : "secondary"} className="rounded-full px-3 py-1">
    {published ? "Veröffentlicht" : "Entwurf"}
  </Badge>
);

const DeviceToggle = ({ value, onChange }: { value: PreviewDevice; onChange: (device: PreviewDevice) => void }) => (
  <div className="inline-flex items-center rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
    {[
      { value: "desktop" as const, label: "Desktop", icon: Laptop },
      { value: "tablet" as const, label: "Tablet", icon: Tablet },
      { value: "mobile" as const, label: "Mobile", icon: Smartphone },
    ].map((device) => {
      const Icon = device.icon;
      const active = value === device.value;
      return (
        <button
          key={device.value}
          type="button"
          onClick={() => onChange(device.value)}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition",
            active ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
          )}
        >
          <Icon size={16} />
          {device.label}
        </button>
      );
    })}
  </div>
);

const ToolbarButton = ({
  active,
  onClick,
  label,
  meta,
  navId,
}: {
  active?: boolean;
  onClick: () => void;
  label: string;
  meta?: string;
  navId?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    data-block-nav-id={navId}
    className={cn(
      "min-w-fit rounded-2xl border px-4 py-3 text-left transition",
      active
        ? "border-[#FF4B2C]/30 bg-[#FFF4F1] text-slate-900 shadow-sm"
        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
    )}
  >
    <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{meta || "Block"}</div>
    <div className="mt-1 text-sm font-semibold">{label}</div>
  </button>
);

const RichTextHtmlHint = () => (
  <p className="text-xs leading-5 text-slate-500">
    Erlaubt sind saubere HTML-Strukturen wie <code>&lt;p&gt;</code>, <code>&lt;ul&gt;</code>, <code>&lt;strong&gt;</code> und Links. H1 wird im Sanitizer automatisch verhindert.
  </p>
);

const AdminPages = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { canEditContent } = useAdminAccess();
  const { activeSiteId } = useSiteContext();
  const [searchParams, setSearchParams] = useSearchParams();

  const [mode, setMode] = useState<"list" | "editor">("list");
  const [form, setForm] = useState<LandingPageForm>(EMPTY_FORM);
  const [activeBlockId, setActiveBlockId] = useState<string>("all");
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>("desktop");
  const blockNavRef = useRef<HTMLDivElement | null>(null);
  const [blockNavCanScrollLeft, setBlockNavCanScrollLeft] = useState(false);
  const [blockNavCanScrollRight, setBlockNavCanScrollRight] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<LandingPageRow | null>(null);
  const [uploadingBlockId, setUploadingBlockId] = useState<string | null>(null);
  const [hasAutoRestoredDraft, setHasAutoRestoredDraft] = useState(false);

  const initializedRef = useRef(false);
  const savedSnapshotRef = useRef(stableStringify(EMPTY_FORM));
  const draftSaveTimeoutRef = useRef<number | null>(null);
  const currentDraftKeyRef = useRef<string | null>(null);

  const pagesQuery = useQuery({
    queryKey: QUERY_KEY,
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

  const pages = pagesQuery.data ?? [];
  const existingSlugs = useMemo(() => pages.map((page) => page.slug), [pages]);
  const formSnapshot = useMemo(() => stableStringify(form), [form]);
  const isDirty = mode === "editor" && formSnapshot !== savedSnapshotRef.current;
  const normalizedSlugPreview = useMemo(() => normalizeLandingPageSlug(form.slug), [form.slug]);
  const selectedBlock = useMemo(
    () => form.page_blocks.find((block) => block.id === activeBlockId) || null,
    [activeBlockId, form.page_blocks],
  );
  const updateBlockNavScrollState = useCallback(() => {
    const element = blockNavRef.current;
    if (!element) {
      setBlockNavCanScrollLeft(false);
      setBlockNavCanScrollRight(false);
      return;
    }

    const maxScrollLeft = Math.max(0, element.scrollWidth - element.clientWidth);
    setBlockNavCanScrollLeft(element.scrollLeft > 8);
    setBlockNavCanScrollRight(element.scrollLeft < maxScrollLeft - 8);
  }, []);

  const scrollBlockRail = useCallback((direction: "left" | "right") => {
    const element = blockNavRef.current;
    if (!element) return;

    const amount = Math.max(260, Math.floor(element.clientWidth * 0.72));
    element.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }, []);

  const previewBlocks = useMemo(
    () => (activeBlockId === "all" ? form.page_blocks : selectedBlock ? [selectedBlock] : []),
    [activeBlockId, form.page_blocks, selectedBlock],
  );
  const previewWidthClass =
    previewDevice === "desktop"
      ? "max-w-[1120px]"
      : previewDevice === "tablet"
        ? "max-w-[860px]"
        : "max-w-[420px]";

  useEffect(() => {
    updateBlockNavScrollState();
  }, [form.page_blocks.length, activeBlockId, updateBlockNavScrollState]);

  useEffect(() => {
    const element = blockNavRef.current;
    if (!element || mode !== "editor") return;

    const handleUpdate = () => updateBlockNavScrollState();
    handleUpdate();
    element.addEventListener("scroll", handleUpdate, { passive: true });
    window.addEventListener("resize", handleUpdate);

    return () => {
      element.removeEventListener("scroll", handleUpdate);
      window.removeEventListener("resize", handleUpdate);
    };
  }, [mode, updateBlockNavScrollState]);

  useEffect(() => {
    const element = blockNavRef.current;
    if (!element || mode !== "editor") return;

    const selector = activeBlockId === "all" ? '[data-block-nav-id="all"]' : `[data-block-nav-id="${activeBlockId}"]`;
    const target = element.querySelector<HTMLElement>(selector);
    target?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeBlockId, mode]);

  const syncSearchState = useCallback(
    (next: { mode?: "list" | "editor"; pageId?: string | null; slug?: string | null; blockId?: string; device?: PreviewDevice }) => {
      const params = new URLSearchParams(searchParams);
      const nextMode = next.mode ?? mode;

      if (nextMode === "editor") {
        params.set("mode", "editor");
        const pageId = next.pageId ?? form.id ?? null;
        const slug = next.slug ?? (form.slug ? normalizeLandingPageSlug(form.slug) : null);
        const blockId = next.blockId ?? activeBlockId;
        const device = next.device ?? previewDevice;

        if (pageId) params.set("page", pageId);
        else params.delete("page");
        if (slug) params.set("slug", slug);
        else params.delete("slug");
        if (blockId && blockId !== "all") params.set("block", blockId);
        else params.delete("block");
        params.set("device", device);
      } else {
        params.delete("mode");
        params.delete("page");
        params.delete("slug");
        params.delete("block");
        params.delete("device");
      }

      const nextString = params.toString();
      if (nextString !== searchParams.toString()) {
        setSearchParams(params, { replace: true });
      }
    },
    [activeBlockId, form.id, form.slug, mode, previewDevice, searchParams, setSearchParams],
  );

  const setFormAndBaseline = useCallback((nextForm: LandingPageForm) => {
    const normalized = {
      ...nextForm,
      slug: normalizeLandingPageSlug(nextForm.slug),
      page_blocks: normalizeLandingPageBlocks(nextForm.page_blocks),
    };
    setForm(normalized);
    savedSnapshotRef.current = stableStringify(normalized);
  }, []);

  const enterEditor = useCallback(
    (nextForm: LandingPageForm, options?: { preferredBlockId?: string; restored?: boolean }) => {
      const normalized = {
        ...nextForm,
        slug: normalizeLandingPageSlug(nextForm.slug),
        page_blocks: normalizeLandingPageBlocks(nextForm.page_blocks),
      };
      setMode("editor");
      setForm(normalized);
      savedSnapshotRef.current = stableStringify(normalized);
      const nextActiveBlockId =
        options?.preferredBlockId && normalized.page_blocks.some((block) => block.id === options.preferredBlockId)
          ? options.preferredBlockId
          : normalized.page_blocks[0]?.id || "all";
      setActiveBlockId(nextActiveBlockId);
      setHasAutoRestoredDraft(Boolean(options?.restored));
      syncSearchState({ mode: "editor", pageId: normalized.id, slug: normalized.slug, blockId: nextActiveBlockId });
    },
    [syncSearchState],
  );

  const askBeforeLosingChanges = useCallback(() => {
    if (!isDirty) return true;
    return window.confirm("Du hast ungespeicherte Änderungen. Wirklich fortfahren und den aktuellen Stand verlassen?");
  }, [isDirty]);

  const saveMutation = useMutation({
    mutationFn: async (payload: LandingPageForm) => {
      const slug = normalizeLandingPageSlug(payload.slug);
      if (!slug) throw new Error("Bitte einen gültigen Slug eintragen.");
      if (!payload.page_blocks.length) throw new Error("Bitte mindestens einen Block anlegen.");

      const dbPayload = {
        slug,
        meta_title: payload.meta_title.trim() || null,
        meta_description: payload.meta_description.trim() || null,
        is_published: payload.is_published,
        page_blocks: payload.page_blocks,
      };

      if (payload.id) {
        const { data, error } = await supabase
          .from("landing_pages" as never)
          .update(dbPayload as never)
          .eq("id", payload.id)
          .select("*")
          .single();
        if (error) throw error;
        return mapLandingPageRow((data as Record<string, unknown>) || {});
      }

      const { data, error } = await supabase
        .from("landing_pages" as never)
        .insert(dbPayload as never)
        .select("*")
        .single();
      if (error) throw error;
      return mapLandingPageRow((data as Record<string, unknown>) || {});
    },
    onSuccess: (savedPage) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      const savedForm = createFormFromRow(savedPage);
      setFormAndBaseline(savedForm);
      setMode("editor");
      syncSearchState({ mode: "editor", pageId: savedPage.id, slug: savedPage.slug, blockId: activeBlockId });
      const draftKey = getDraftKey(savedForm);
      localStorage.removeItem(draftKey);
      currentDraftKeyRef.current = draftKey;
      sessionStorage.setItem(
        EDITOR_SESSION_KEY,
        JSON.stringify({ pageId: savedPage.id, slug: savedPage.slug, activeBlockId, previewDevice, at: Date.now() }),
      );
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
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      if (form.id === id) {
        const draftKey = getDraftKey(form);
        localStorage.removeItem(draftKey);
        setMode("list");
        setForm(EMPTY_FORM);
        savedSnapshotRef.current = stableStringify(EMPTY_FORM);
        syncSearchState({ mode: "list" });
      }
      setDeleteTarget(null);
      toast({ title: "Gelöscht", description: "Die Landingpage wurde entfernt." });
    },
    onError: (error: any) => {
      toast({
        title: "Löschen fehlgeschlagen",
        description: error?.message || "Die Landingpage konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: async (page: LandingPageRow) => {
      const slug = generateCopySlug(page.slug, existingSlugs);
      const payload = {
        slug,
        meta_title: page.meta_title ? `${page.meta_title} | Kopie` : `${page.slug} | Kopie`,
        meta_description: page.meta_description,
        is_published: false,
        page_blocks: deepCloneBlocks(page.page_blocks),
      };
      const { data, error } = await supabase.from("landing_pages" as never).insert(payload as never).select("*").single();
      if (error) throw error;
      return mapLandingPageRow((data as Record<string, unknown>) || {});
    },
    onSuccess: (duplicatedPage) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      enterEditor(createFormFromRow(duplicatedPage));
      toast({ title: "Dupliziert", description: `Die Kopie „${duplicatedPage.slug}“ ist jetzt als Entwurf geöffnet.` });
    },
    onError: (error: any) => {
      toast({
        title: "Duplizieren fehlgeschlagen",
        description: error?.message || "Die Landingpage konnte nicht dupliziert werden.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (initializedRef.current || pagesQuery.isLoading) return;
    initializedRef.current = true;

    const routeMode = searchParams.get("mode");
    const routePageId = searchParams.get("page");
    const routeSlug = searchParams.get("slug");
    const routeBlockId = searchParams.get("block") || "all";
    const routeDevice = searchParams.get("device");

    const resolvedRouteDevice: PreviewDevice =
      routeDevice === "tablet" || routeDevice === "mobile" || routeDevice === "desktop" ? routeDevice : "desktop";

    const targetPage =
      (routePageId ? pages.find((page) => page.id === routePageId) : null) ||
      (routeSlug ? pages.find((page) => page.slug === normalizeLandingPageSlug(routeSlug)) : null) ||
      null;

    if (routeMode === "editor" && targetPage) {
      const baseForm = createFormFromRow(targetPage);
      const draft = parseStoredDraft(localStorage.getItem(getDraftKey(baseForm)));
      if (draft) {
        enterEditor(draft.form, { preferredBlockId: draft.activeBlockId || routeBlockId, restored: true });
        setPreviewDevice(draft.previewDevice || resolvedRouteDevice);
      } else {
        enterEditor(baseForm, { preferredBlockId: routeBlockId });
        setPreviewDevice(resolvedRouteDevice);
      }
      return;
    }

    if (routeMode === "editor" && !targetPage && routeSlug === "neu") {
      const draft = parseStoredDraft(localStorage.getItem(`${DRAFT_KEY_PREFIX}new`));
      if (draft) {
        enterEditor(draft.form, { preferredBlockId: draft.activeBlockId, restored: true });
        setPreviewDevice(draft.previewDevice || resolvedRouteDevice);
      } else {
        enterEditor(EMPTY_FORM, { preferredBlockId: routeBlockId });
        setPreviewDevice(resolvedRouteDevice);
      }
      return;
    }

    const rawSession = sessionStorage.getItem(EDITOR_SESSION_KEY);
    if (rawSession) {
      try {
        const parsed = JSON.parse(rawSession) as { pageId?: string; slug?: string; activeBlockId?: string; previewDevice?: PreviewDevice };
        const sessionPage =
          (parsed.pageId ? pages.find((page) => page.id === parsed.pageId) : null) ||
          (parsed.slug && parsed.slug !== "neu" ? pages.find((page) => page.slug === normalizeLandingPageSlug(parsed.slug)) : null) ||
          null;

        if (sessionPage) {
          const baseForm = createFormFromRow(sessionPage);
          const draft = parseStoredDraft(localStorage.getItem(getDraftKey(baseForm)));
          if (draft) {
            enterEditor(draft.form, { preferredBlockId: parsed.activeBlockId || draft.activeBlockId, restored: true });
            setPreviewDevice(parsed.previewDevice || draft.previewDevice || "desktop");
          } else {
            enterEditor(baseForm, { preferredBlockId: parsed.activeBlockId || "all" });
            setPreviewDevice(parsed.previewDevice || "desktop");
          }
          return;
        }

        if (parsed.slug === "neu") {
          const draft = parseStoredDraft(localStorage.getItem(`${DRAFT_KEY_PREFIX}new`));
          if (draft) {
            enterEditor(draft.form, { preferredBlockId: parsed.activeBlockId || draft.activeBlockId, restored: true });
            setPreviewDevice(parsed.previewDevice || draft.previewDevice || "desktop");
            return;
          }
        }
      } catch {
        // noop
      }
    }
  }, [enterEditor, pages, pagesQuery.isLoading, searchParams]);

  useEffect(() => {
    if (mode !== "editor") return;
    sessionStorage.setItem(
      EDITOR_SESSION_KEY,
      JSON.stringify({ pageId: form.id, slug: normalizedSlugPreview || "neu", activeBlockId, previewDevice, at: Date.now() }),
    );
    syncSearchState({ mode: "editor", pageId: form.id, slug: normalizedSlugPreview || "neu", blockId: activeBlockId, device: previewDevice });
  }, [activeBlockId, form.id, mode, normalizedSlugPreview, previewDevice, syncSearchState]);

  useEffect(() => {
    if (mode !== "editor") return;
    const nextDraftKey = getDraftKey(form);
    if (currentDraftKeyRef.current && currentDraftKeyRef.current !== nextDraftKey && !isDirty) {
      localStorage.removeItem(currentDraftKeyRef.current);
    }
    currentDraftKeyRef.current = nextDraftKey;
  }, [form, isDirty, mode]);

  useEffect(() => {
    if (mode !== "editor") return;
    if (!isDirty) {
      localStorage.removeItem(getDraftKey(form));
      return;
    }

    if (draftSaveTimeoutRef.current) {
      window.clearTimeout(draftSaveTimeoutRef.current);
    }

    draftSaveTimeoutRef.current = window.setTimeout(() => {
      const payload: DraftPayload = {
        form,
        activeBlockId,
        previewDevice,
        updatedAt: Date.now(),
      };
      localStorage.setItem(getDraftKey(form), JSON.stringify(payload));
    }, 650);

    return () => {
      if (draftSaveTimeoutRef.current) {
        window.clearTimeout(draftSaveTimeoutRef.current);
      }
    };
  }, [activeBlockId, form, isDirty, mode, previewDevice]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    if (mode !== "editor") return;
    if (activeBlockId === "all") return;
    if (form.page_blocks.some((block) => block.id === activeBlockId)) return;
    setActiveBlockId(form.page_blocks[0]?.id || "all");
  }, [activeBlockId, form.page_blocks, mode]);

  const updateForm = useCallback((patch: Partial<LandingPageForm>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  }, []);

  const updateBlock = useCallback((blockId: string, updater: (block: LandingPageBlock) => LandingPageBlock) => {
    setForm((prev) => ({
      ...prev,
      page_blocks: prev.page_blocks.map((block) => (block.id === blockId ? updater(block) : block)),
    }));
  }, []);

  const moveBlock = useCallback((blockId: string, direction: -1 | 1) => {
    setForm((prev) => {
      const index = prev.page_blocks.findIndex((block) => block.id === blockId);
      if (index < 0) return prev;
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= prev.page_blocks.length) return prev;
      const nextBlocks = [...prev.page_blocks];
      const [block] = nextBlocks.splice(index, 1);
      nextBlocks.splice(targetIndex, 0, block);
      return { ...prev, page_blocks: nextBlocks };
    });
  }, []);

  const duplicateBlock = useCallback((blockId: string) => {
    setForm((prev) => {
      const index = prev.page_blocks.findIndex((block) => block.id === blockId);
      if (index < 0) return prev;
      const nextBlocks = [...prev.page_blocks];
      const source = JSON.parse(JSON.stringify(nextBlocks[index])) as LandingPageBlock;
      source.id = createId();
      nextBlocks.splice(index + 1, 0, source);
      return { ...prev, page_blocks: normalizeLandingPageBlocks(nextBlocks) };
    });
  }, []);

  const removeBlock = useCallback((blockId: string) => {
    const target = form.page_blocks.find((block) => block.id === blockId);
    if (!target) return;
    const confirmed = window.confirm(`Block „${blockHeadline(target)}“ wirklich löschen?`);
    if (!confirmed) return;

    setForm((prev) => ({
      ...prev,
      page_blocks: prev.page_blocks.filter((block) => block.id !== blockId),
    }));
    if (activeBlockId === blockId) {
      const remaining = form.page_blocks.filter((block) => block.id !== blockId);
      setActiveBlockId(remaining[0]?.id || "all");
    }
  }, [activeBlockId, form.page_blocks]);

  const addBlock = useCallback((type: LandingPageBlock["type"]) => {
    const factory = DEFAULT_BLOCK_FACTORIES.find((entry) => entry.type === type);
    if (!factory) return;
    const block = factory.create();
    setForm((prev) => ({ ...prev, page_blocks: [...prev.page_blocks, block] }));
    setActiveBlockId(block.id);
  }, []);

  const handleUploadImage = useCallback(
    async (blockId: string, field: keyof LandingHeroBlockData, file: File) => {
      try {
        setUploadingBlockId(blockId);
        const path = await uploadBrandingAsset(file, "landing-pages", activeSiteId || undefined);
        updateBlock(blockId, (block) => {
          if (block.type !== "hero") return block;
          return { ...block, data: { ...block.data, [field]: path } };
        });
        toast({ title: "Bild gespeichert", description: "Das Bild wurde in Supabase Storage hochgeladen." });
      } catch (error: any) {
        toast({
          title: "Upload fehlgeschlagen",
          description: error?.message || "Das Bild konnte nicht hochgeladen werden.",
          variant: "destructive",
        });
      } finally {
        setUploadingBlockId(null);
      }
    },
    [activeSiteId, toast, updateBlock],
  );

  const startCreate = useCallback(() => {
    if (!askBeforeLosingChanges()) return;
    setHasAutoRestoredDraft(false);
    enterEditor(EMPTY_FORM, { preferredBlockId: "all" });
    setPreviewDevice("desktop");
  }, [askBeforeLosingChanges, enterEditor]);

  const startEdit = useCallback((page: LandingPageRow) => {
    if (!askBeforeLosingChanges()) return;
    const baseForm = createFormFromRow(page);
    const draft = parseStoredDraft(localStorage.getItem(getDraftKey(baseForm)));
    if (draft) {
      enterEditor(draft.form, { preferredBlockId: draft.activeBlockId, restored: true });
      setPreviewDevice(draft.previewDevice);
      return;
    }
    setHasAutoRestoredDraft(false);
    enterEditor(baseForm);
  }, [askBeforeLosingChanges, enterEditor]);

  const handleDelete = useCallback((page: LandingPageRow) => {
    if (!canEditContent || deleteMutation.isPending) return;
    setDeleteTarget(page);
  }, [canEditContent, deleteMutation.isPending]);

  const handleSave = useCallback(() => {
    if (!canEditContent || saveMutation.isPending) return;
    saveMutation.mutate(form);
  }, [canEditContent, form, saveMutation]);

  const handleBackToList = useCallback(() => {
    if (!askBeforeLosingChanges()) return;
    setMode("list");
    setHasAutoRestoredDraft(false);
    syncSearchState({ mode: "list" });
  }, [askBeforeLosingChanges, syncSearchState]);

  const openLivePage = useCallback((page: Pick<LandingPageForm, "slug">) => {
    const slug = normalizeLandingPageSlug(page.slug);
    if (!slug) return;
    window.open(`/${slug}`, "_blank", "noopener,noreferrer");
  }, []);

  const renderHeroEditor = (block: Extract<LandingPageBlock, { type: "hero" }>) => {
    const stats = block.data.stats ?? [];
    const proofItems = block.data.proof_items ?? [];
    const desktopPreview = block.data.background_image_path ? buildRawImageUrl(block.data.background_image_path) : null;
    const mobilePreview = block.data.background_mobile_image_path ? buildRawImageUrl(block.data.background_mobile_image_path) : null;

    const updateStat = (index: number, patch: Partial<LandingHeroStat>) => {
      const nextStats = [...stats];
      nextStats[index] = { ...(nextStats[index] ?? { label: "", value: "" }), ...patch };
      updateBlock(block.id, (current) =>
        current.type === "hero" ? { ...current, data: { ...current.data, stats: nextStats } } : current,
      );
    };

    const updateProofItem = (index: number, patch: Partial<LandingHeroProofItem>) => {
      const nextItems = [...proofItems];
      nextItems[index] = { ...(nextItems[index] ?? { text: "" }), ...patch };
      updateBlock(block.id, (current) =>
        current.type === "hero" ? { ...current, data: { ...current.data, proof_items: nextItems } } : current,
      );
    };

    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Badge</Label>
            <Input value={block.data.badge_text || ""} onChange={(event) => updateBlock(block.id, (current) => current.type === "hero" ? { ...current, data: { ...current.data, badge_text: event.target.value } } : current)} />
          </div>
          <div className="space-y-2">
            <Label>H1</Label>
            <Input value={block.data.headline || ""} onChange={(event) => updateBlock(block.id, (current) => current.type === "hero" ? { ...current, data: { ...current.data, headline: event.target.value } } : current)} />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Subheadline</Label>
          <Textarea rows={5} value={block.data.subheadline || ""} onChange={(event) => updateBlock(block.id, (current) => current.type === "hero" ? { ...current, data: { ...current.data, subheadline: event.target.value } } : current)} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Primärer CTA Text</Label>
            <Input value={block.data.primary_cta_text || ""} onChange={(event) => updateBlock(block.id, (current) => current.type === "hero" ? { ...current, data: { ...current.data, primary_cta_text: event.target.value } } : current)} />
          </div>
          <div className="space-y-2">
            <Label>Primärer CTA Link</Label>
            <Input value={block.data.primary_cta_href || ""} onChange={(event) => updateBlock(block.id, (current) => current.type === "hero" ? { ...current, data: { ...current.data, primary_cta_href: ensureHref(event.target.value) } } : current)} />
          </div>
          <div className="space-y-2">
            <Label>Sekundärer CTA Text</Label>
            <Input value={block.data.secondary_cta_text || ""} onChange={(event) => updateBlock(block.id, (current) => current.type === "hero" ? { ...current, data: { ...current.data, secondary_cta_text: event.target.value } } : current)} />
          </div>
          <div className="space-y-2">
            <Label>Sekundärer CTA Link</Label>
            <Input value={block.data.secondary_cta_href || ""} onChange={(event) => updateBlock(block.id, (current) => current.type === "hero" ? { ...current, data: { ...current.data, secondary_cta_href: ensureHref(event.target.value) } } : current)} />
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          <Card className="rounded-[1.75rem] border-slate-200 shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Desktop Hintergrund</CardTitle>
              <CardDescription>Optionales Bild für die Desktop-Hero-Fläche.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <MediaDropzone
                value={block.data.background_image_path || ""}
                previewUrl={desktopPreview}
                uploading={uploadingBlockId === block.id}
                onFileSelected={(file) => handleUploadImage(block.id, "background_image_path", file)}
                onRemove={() => updateBlock(block.id, (current) => current.type === "hero" ? { ...current, data: { ...current.data, background_image_path: "" } } : current)}
              />
              <div className="space-y-2">
                <Label>Oder Pfad manuell setzen</Label>
                <Input
                  value={block.data.background_image_path || ""}
                  onChange={(event) =>
                    updateBlock(block.id, (current) =>
                      current.type === "hero" ? { ...current, data: { ...current.data, background_image_path: event.target.value } } : current,
                    )
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[1.75rem] border-slate-200 shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Mobiles Hintergrundbild</CardTitle>
              <CardDescription>Optionales Mobile-spezifisches Bild. Wenn leer, fällt die Seite auf Desktop zurück.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <MediaDropzone
                value={block.data.background_mobile_image_path || ""}
                previewUrl={mobilePreview}
                uploading={uploadingBlockId === block.id}
                onFileSelected={(file) => handleUploadImage(block.id, "background_mobile_image_path", file)}
                onRemove={() => updateBlock(block.id, (current) => current.type === "hero" ? { ...current, data: { ...current.data, background_mobile_image_path: "" } } : current)}
              />
              <div className="space-y-2">
                <Label>Oder Pfad manuell setzen</Label>
                <Input
                  value={block.data.background_mobile_image_path || ""}
                  onChange={(event) =>
                    updateBlock(block.id, (current) =>
                      current.type === "hero" ? { ...current, data: { ...current.data, background_mobile_image_path: event.target.value } } : current,
                    )
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-[1.75rem] border-slate-200 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Signal-Stats</CardTitle>
            <CardDescription>Drei kurze Werte unter dem Hero. Mobil nicht zu lang formulieren.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            {[0, 1, 2].map((index) => (
              <div key={`hero-stat-${index}`} className="space-y-3 rounded-2xl border border-slate-200 p-4">
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Stat {index + 1}</div>
                <Input placeholder="Label" value={stats[index]?.label || ""} onChange={(event) => updateStat(index, { label: event.target.value })} />
                <Input placeholder="Wert" value={stats[index]?.value || ""} onChange={(event) => updateStat(index, { value: event.target.value })} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-[1.75rem] border-slate-200 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Proof Items</CardTitle>
            <CardDescription>Drei kurze Trust-Signale. Die Icons werden über die Hero-Komponente aufgelöst.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[0, 1, 2].map((index) => (
              <div key={`hero-proof-${index}`} className="grid gap-3 rounded-2xl border border-slate-200 p-4 md:grid-cols-[180px_1fr]">
                <Input placeholder="Icon (badge/chart/shield/globe)" value={proofItems[index]?.icon || ""} onChange={(event) => updateProofItem(index, { icon: event.target.value })} />
                <Input placeholder="Text" value={proofItems[index]?.text || ""} onChange={(event) => updateProofItem(index, { text: event.target.value })} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderRichTextEditor = (block: Extract<LandingPageBlock, { type: "rich_text" }>) => (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Kicker</Label>
          <Input value={block.data.kicker || ""} onChange={(event) => updateBlock(block.id, (current) => current.type === "rich_text" ? { ...current, data: { ...current.data, kicker: event.target.value } } : current)} />
        </div>
        <div className="space-y-2">
          <Label>Headline</Label>
          <Input value={block.data.headline || ""} onChange={(event) => updateBlock(block.id, (current) => current.type === "rich_text" ? { ...current, data: { ...current.data, headline: event.target.value } } : current)} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Body HTML</Label>
        <Textarea rows={12} className="font-mono text-sm" value={block.data.body_html || ""} onChange={(event) => updateBlock(block.id, (current) => current.type === "rich_text" ? { ...current, data: { ...current.data, body_html: event.target.value } } : current)} />
        <RichTextHtmlHint />
      </div>
    </div>
  );

  const renderTrustEditor = (block: Extract<LandingPageBlock, { type: "trust" }>) => {
    const items = block.data.items ?? [];
    const updateItem = (index: number, patch: Partial<LandingTrustItem>) => {
      const nextItems = [...items];
      nextItems[index] = { ...(nextItems[index] ?? { title: "", desc: "" }), ...patch };
      updateBlock(block.id, (current) => current.type === "trust" ? { ...current, data: { ...current.data, items: nextItems } } : current);
    };

    return (
      <div className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Kicker</Label>
            <Input value={block.data.kicker || ""} onChange={(event) => updateBlock(block.id, (current) => current.type === "trust" ? { ...current, data: { ...current.data, kicker: event.target.value } } : current)} />
          </div>
          <div className="space-y-2">
            <Label>Titel</Label>
            <Input value={block.data.title || ""} onChange={(event) => updateBlock(block.id, (current) => current.type === "trust" ? { ...current, data: { ...current.data, title: event.target.value } } : current)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Beschreibung</Label>
          <Textarea rows={4} value={block.data.description || ""} onChange={(event) => updateBlock(block.id, (current) => current.type === "trust" ? { ...current, data: { ...current.data, description: event.target.value } } : current)} />
        </div>
        <Card className="rounded-[1.75rem] border-slate-200 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Trust-Punkte</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[0, 1, 2].map((index) => (
              <div key={`trust-item-${index}`} className="grid gap-3 rounded-2xl border border-slate-200 p-4 xl:grid-cols-[160px_1fr_1.6fr]">
                <Input placeholder="Icon (users/gauge/chart/shield)" value={items[index]?.icon || ""} onChange={(event) => updateItem(index, { icon: event.target.value as LandingTrustItem["icon"] })} />
                <Input placeholder="Titel" value={items[index]?.title || ""} onChange={(event) => updateItem(index, { title: event.target.value })} />
                <Input placeholder="Beschreibung" value={items[index]?.desc || ""} onChange={(event) => updateItem(index, { desc: event.target.value })} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderFaqEditor = (block: Extract<LandingPageBlock, { type: "faq" }>) => {
    const items = block.data.items ?? [];
    const updateItem = (index: number, patch: Partial<LandingFaqItem>) => {
      const nextItems = [...items];
      nextItems[index] = { ...(nextItems[index] ?? { question: "", answer: "" }), ...patch };
      updateBlock(block.id, (current) => current.type === "faq" ? { ...current, data: { ...current.data, items: nextItems } } : current);
    };

    return (
      <div className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Kicker</Label>
            <Input value={block.data.kicker || ""} onChange={(event) => updateBlock(block.id, (current) => current.type === "faq" ? { ...current, data: { ...current.data, kicker: event.target.value } } : current)} />
          </div>
          <div className="space-y-2">
            <Label>Titel</Label>
            <Input value={block.data.title || ""} onChange={(event) => updateBlock(block.id, (current) => current.type === "faq" ? { ...current, data: { ...current.data, title: event.target.value } } : current)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Beschreibung</Label>
          <Textarea rows={4} value={block.data.description || ""} onChange={(event) => updateBlock(block.id, (current) => current.type === "faq" ? { ...current, data: { ...current.data, description: event.target.value } } : current)} />
        </div>
        <Card className="rounded-[1.75rem] border-slate-200 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Fragen & Antworten</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[0, 1, 2, 3].map((index) => (
              <div key={`faq-item-${index}`} className="space-y-3 rounded-2xl border border-slate-200 p-4">
                <Input placeholder="Frage" value={items[index]?.question || ""} onChange={(event) => updateItem(index, { question: event.target.value })} />
                <Textarea rows={3} placeholder="Antwort" value={items[index]?.answer || ""} onChange={(event) => updateItem(index, { answer: event.target.value })} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderBlockEditor = (block: LandingPageBlock | null) => {
    if (!block) {
      return (
        <div className="space-y-5">
          <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
            Noch kein Block aktiv. Entweder oben einen Block auswählen oder direkt neue Blöcke hinzufügen.
          </div>
          <Card className="rounded-[1.75rem] border-slate-200 shadow-none">
            <CardHeader>
              <CardTitle>Alle Blöcke im Überblick</CardTitle>
              <CardDescription>Du siehst hier die Seite als Ganzes. Für präzise Bearbeitung oben einfach einen Block anklicken.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {form.page_blocks.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
                  Noch keine Blöcke vorhanden. Oben einfach Hero, Rich Text, Trust oder FAQ anlegen.
                </div>
              ) : (
                form.page_blocks.map((entry, index) => (
                  <div key={entry.id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Block {index + 1}</div>
                    <div className="mt-2 text-base font-semibold text-slate-900">{blockHeadline(entry)}</div>
                    <div className="mt-1 text-sm text-slate-500">{blockTypeLabel(entry.type)}</div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Aktiver Block</div>
            <div className="mt-1 text-lg font-bold text-slate-900">{blockHeadline(block)}</div>
            <div className="mt-1 text-sm text-slate-500">{blockTypeLabel(block.type)}</div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => moveBlock(block.id, -1)} disabled={form.page_blocks[0]?.id === block.id}>
              <Grip className="mr-2 rotate-90" size={16} /> Hoch
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => moveBlock(block.id, 1)} disabled={form.page_blocks[form.page_blocks.length - 1]?.id === block.id}>
              <Grip className="mr-2 -rotate-90" size={16} /> Runter
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => duplicateBlock(block.id)}>
              <Copy className="mr-2" size={16} /> Duplizieren
            </Button>
            <Button type="button" variant="destructive" size="sm" onClick={() => removeBlock(block.id)}>
              <Trash2 className="mr-2" size={16} /> Block löschen
            </Button>
          </div>
        </div>

        {block.type === "hero" && renderHeroEditor(block)}
        {block.type === "rich_text" && renderRichTextEditor(block)}
        {block.type === "trust" && renderTrustEditor(block)}
        {block.type === "faq" && renderFaqEditor(block)}
      </div>
    );
  };

  const isBusy = saveMutation.isPending || deleteMutation.isPending || duplicateMutation.isPending;

  if (mode === "editor") {
    return (
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 p-6 md:p-10">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              {form.id ? "Landingpage bearbeiten" : "Neue Landingpage erstellen"}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500">
              Builder jetzt mit horizontaler Block-Navigation oben, Fokus-Preview rechts und lokalem Draft-Schutz gegen Browser-Refresh oder Tab-Discard.
            </p>
            {hasAutoRestoredDraft ? (
              <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                <MonitorSmartphone size={14} /> Lokaler Entwurf wurde automatisch wiederhergestellt.
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" onClick={handleBackToList}>
              <ArrowLeft className="mr-2" size={16} /> Zur Übersicht
            </Button>
            {normalizedSlugPreview ? (
              <Button type="button" variant="outline" onClick={() => openLivePage({ slug: normalizedSlugPreview })}>
                <ExternalLink className="mr-2" size={16} /> Live öffnen
              </Button>
            ) : null}
            <Button onClick={handleSave} disabled={!canEditContent || isBusy}>
              <Save className="mr-2" size={16} /> {saveMutation.isPending ? "Speichere..." : "Speichern"}
            </Button>
          </div>
        </div>

        {!canEditContent ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Diese Rolle hat nur Lesezugriff. Speichern, Uploads und Löschen sind deaktiviert.
          </div>
        ) : null}

        <Card className="rounded-[2rem] border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Seitendaten</CardTitle>
            <CardDescription>Slug, Meta-Daten und Veröffentlichungsstatus bleiben oben kompakt sichtbar.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)]">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="slug">Slug</Label>
                <Input id="slug" value={form.slug} placeholder="webagentur-linz" onChange={(event) => updateForm({ slug: event.target.value })} disabled={!canEditContent || isBusy} />
                <p className="text-xs text-slate-500">
                  Route-Vorschau: <span className="font-medium text-slate-700">/{normalizedSlugPreview || "dein-slug"}</span>
                </p>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="meta_title">Meta Title</Label>
                <Input id="meta_title" value={form.meta_title} onChange={(event) => updateForm({ meta_title: event.target.value })} disabled={!canEditContent || isBusy} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="meta_description">Meta Description</Label>
                <Textarea id="meta_description" rows={4} value={form.meta_description} onChange={(event) => updateForm({ meta_description: event.target.value })} disabled={!canEditContent || isBusy} />
              </div>
            </div>

            <div className="flex flex-col gap-4 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center justify-between gap-4 rounded-[1.25rem] border border-white bg-white px-4 py-3 shadow-sm">
                <div>
                  <div className="text-sm font-semibold text-slate-900">Status</div>
                  <div className="text-xs text-slate-500">Nur veröffentlichte Seiten laufen auf der Live-Route.</div>
                </div>
                <Switch checked={form.is_published} onCheckedChange={(checked) => updateForm({ is_published: checked })} disabled={!canEditContent || isBusy} />
              </div>
              <div className="rounded-[1.25rem] border border-dashed border-slate-300 bg-white px-4 py-3">
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Lokaler Schutz</div>
                <div className="mt-2 text-sm leading-6 text-slate-600">
                  Wechselst du kurz in einen anderen Browser-Tab, bleiben Slug, Meta-Daten, aktiver Block und Device-Preview lokal gespeichert.
                </div>
              </div>
              <div className="rounded-[1.25rem] border border-dashed border-slate-300 bg-white px-4 py-3">
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Ungespeicherter Status</div>
                <div className={cn("mt-2 text-sm font-semibold", isDirty ? "text-amber-600" : "text-emerald-600")}>
                  {isDirty ? "Es gibt lokale Änderungen, die noch nicht in Supabase liegen." : "Alles gespeichert. Kein offener lokaler Unterschied."}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Block-Auswahl</CardTitle>
            <CardDescription>
              Die Navigation sitzt jetzt oben wie im Forum. Klickst du einen Block an, zeigt die Vorschau rechts genau diesen Block im Fokusmodus.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-3">
              <div className="relative">
                {blockNavCanScrollLeft ? (
                  <div className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-16 bg-gradient-to-r from-white via-white/95 to-transparent lg:block" />
                ) : null}
                {blockNavCanScrollRight ? (
                  <div className="pointer-events-none absolute inset-y-0 right-0 z-10 hidden w-16 bg-gradient-to-l from-white via-white/95 to-transparent lg:block" />
                ) : null}

                {blockNavCanScrollLeft ? (
                  <button
                    type="button"
                    onClick={() => scrollBlockRail("left")}
                    className="absolute left-2 top-1/2 z-20 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 lg:inline-flex"
                    aria-label="Block-Leiste nach links scrollen"
                  >
                    <ChevronLeft size={18} />
                  </button>
                ) : null}

                {blockNavCanScrollRight ? (
                  <button
                    type="button"
                    onClick={() => scrollBlockRail("right")}
                    className="absolute right-2 top-1/2 z-20 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 lg:inline-flex"
                    aria-label="Block-Leiste nach rechts scrollen"
                  >
                    <ChevronRight size={18} />
                  </button>
                ) : null}

                <div
                  ref={blockNavRef}
                  className="overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                  <div className="flex min-w-max items-stretch gap-3 pr-2">
                    <ToolbarButton navId="all" active={activeBlockId === "all"} onClick={() => setActiveBlockId("all")} label="Alle Blöcke" meta="Gesamtansicht" />
                    {form.page_blocks.map((block, index) => (
                      <ToolbarButton
                        key={block.id}
                        navId={block.id}
                        active={activeBlockId === block.id}
                        onClick={() => setActiveBlockId(block.id)}
                        label={blockHeadline(block)}
                        meta={`${String(index + 1).padStart(2, "0")} · ${blockTypeLabel(block.type)}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-xs leading-5 text-slate-500">
                Saubere Tab-Leiste statt Scrollbar-Chaos: Links/Rechts-Buttons führen durch die Blöcke, die Vorschau rechts springt direkt in den Fokusmodus.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {DEFAULT_BLOCK_FACTORIES.map((entry) => (
                <Button key={entry.type} type="button" variant="outline" onClick={() => addBlock(entry.type)} disabled={!canEditContent || isBusy}>
                  <Plus className="mr-2" size={16} /> {entry.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_520px] xl:items-start">
          <div className="space-y-6">{renderBlockEditor(activeBlockId === "all" ? null : selectedBlock)}</div>

          <div className="xl:sticky xl:top-6">
            <Card className="overflow-hidden rounded-[2rem] border-slate-200 shadow-sm">
              <CardHeader className="space-y-4 border-b border-slate-100">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <CardTitle>Live-Vorschau</CardTitle>
                    <CardDescription>
                      {activeBlockId === "all" ? "Gesamte Seite" : "Fokusmodus – nur der ausgewählte Block"}
                    </CardDescription>
                  </div>
                  <DeviceToggle value={previewDevice} onChange={setPreviewDevice} />
                </div>
              </CardHeader>
              <CardContent className="bg-slate-100/80 p-4 md:p-5">
                <div className="mx-auto">
                  <div className={cn("mx-auto overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_20px_60px_-30px_rgba(15,23,42,0.35)]", previewWidthClass)}>
                    {previewBlocks.length > 0 ? (
                      <BlockRenderer blocks={previewBlocks} />
                    ) : (
                      <div className="flex min-h-[320px] items-center justify-center px-6 text-center text-sm text-slate-500">
                        Noch keine Blöcke vorhanden. Füge oben einen Block hinzu und bearbeite ihn dann direkt im Inspector.
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6 md:p-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Landingpages</h1>
            <p className="mt-2 text-sm leading-7 text-slate-500">
              Verwalte hier alle dynamischen Landingpages. Öffnen, duplizieren, live prüfen und direkt in den neuen Fokus-Builder springen.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" onClick={() => pagesQuery.refetch()} disabled={pagesQuery.isFetching}>
              <RefreshCw className={cn("mr-2", pagesQuery.isFetching && "animate-spin")} size={16} /> Aktualisieren
            </Button>
            <Button onClick={startCreate} disabled={!canEditContent}>
              <FilePlus2 className="mr-2" size={16} /> Neue Seite erstellen
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
            <CardDescription>Direktlinks, Kopie-Funktion und kompakter Einstieg in den Builder.</CardDescription>
          </CardHeader>
          <CardContent>
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
                {pages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center text-sm text-slate-500">
                      Noch keine Landingpages vorhanden.
                    </TableCell>
                  </TableRow>
                ) : (
                  pages.map((page) => (
                    <TableRow key={page.id}>
                      <TableCell className="font-medium text-slate-900">/{page.slug}</TableCell>
                      <TableCell className="text-slate-600">{page.meta_title || "—"}</TableCell>
                      <TableCell>
                        <PublishedBadge published={page.is_published} />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => startEdit(page)}>
                            <Eye className="mr-2" size={16} /> Bearbeiten
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => openLivePage({ slug: page.slug })}>
                            <ExternalLink className="mr-2" size={16} /> Live
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => duplicateMutation.mutate(page)} disabled={!canEditContent || duplicateMutation.isPending}>
                            <Copy className="mr-2" size={16} /> Duplizieren
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(page)} disabled={!canEditContent || deleteMutation.isPending}>
                            <Trash2 className="mr-2" size={16} /> Löschen
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="max-w-[460px] gap-5 rounded-[1.35rem] border border-slate-200 bg-white p-6 text-slate-900 shadow-[0_32px_90px_-48px_rgba(15,23,42,0.45)]">
          <AlertDialogHeader className="space-y-2 text-left">
            <AlertDialogTitle className="text-xl font-extrabold tracking-tight text-slate-950">Landingpage wirklich löschen?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm leading-7 text-slate-600">
              Die Seite „/{deleteTarget?.slug}“ wird aus Supabase gelöscht. Verknüpfte Storage-Bilder bleiben bewusst erhalten, damit keine Referenzfehler entstehen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 border-t border-slate-100 pt-4 sm:justify-end sm:space-x-0">
            <AlertDialogCancel className="mt-0 rounded-xl border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900">Abbrechen</AlertDialogCancel>
            <AlertDialogAction className="rounded-xl bg-red-600 text-white hover:bg-red-700 hover:text-white focus:text-white" onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}>
              Löschen bestätigen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AdminPages;
