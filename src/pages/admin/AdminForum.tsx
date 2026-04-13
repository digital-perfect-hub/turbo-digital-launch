import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BadgeCheck,
  CalendarClock,
  CheckSquare2,
  Copy,
  ExternalLink,
  Eye,
  FilePlus2,
  FolderPlus,
  History,
  Link2,
  Lock,
  LockOpen,
  MessageSquarePlus,
  MessageSquareWarning,
  PencilLine,
  Pin,
  PinOff,
  RefreshCw,
  Save,
  Search,
  ShieldAlert,
  ShieldCheck,
  Square,
  Trash2,
  Upload,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/useAuth";
import { useSiteModules } from "@/hooks/useSiteModules";
import { useSiteContext } from "@/context/SiteContext";
import { DEFAULT_SITE_ID } from "@/lib/site";
import { buildRawImageUrl } from "@/lib/image";
import {
  extractForumScheduledAt,
  isForumThreadPubliclyVisible,
  stripForumScheduleMeta,
  upsertForumScheduleMeta,
} from "@/lib/forumSchedule";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import RichTextEditor from "@/components/ui/rich-text-editor";
import { Badge } from "@/components/ui/badge";
import { ModuleLockedState } from "@/components/admin/ModuleLockedState";
import ConfirmDeleteDialog from "@/components/admin/ConfirmDeleteDialog";

type ForumCategoryRow = Database["public"]["Tables"]["forum_categories"]["Row"];
type ForumCategoryInsert = Database["public"]["Tables"]["forum_categories"]["Insert"];
type ForumCategoryUpdate = Database["public"]["Tables"]["forum_categories"]["Update"];
type ForumThreadRow = Database["public"]["Tables"]["forum_threads"]["Row"];
type ForumThreadInsert = Database["public"]["Tables"]["forum_threads"]["Insert"];
type ForumThreadUpdate = Database["public"]["Tables"]["forum_threads"]["Update"];
type ForumReplyRow = Database["public"]["Tables"]["forum_replies"]["Row"];
type ForumReplyUpdate = Database["public"]["Tables"]["forum_replies"]["Update"];

type CategoryFormState = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  sort_order: number;
  is_active: boolean;
  seo_title: string;
  seo_description: string;
  ad_enabled: boolean;
  ad_headline: string;
  ad_subheadline: string;
  ad_cta_text: string;
  ad_link_url: string;
  ad_image_url: string;
  ad_html_code: string;
};

type ThreadFormState = {
  id?: string;
  title: string;
  slug: string;
  category_id: string;
  author_name: string;
  featured_image_url: string;
  featured_image_alt: string;
  seo_title: string;
  seo_description: string;
  raw_html_content: string;
  is_pinned: boolean;
  is_locked: boolean;
  is_answered: boolean;
  is_active: boolean;
  status: string;
  scheduled_publish_at: string;
  admin_notes: string;
  show_ad: boolean;
  ad_type: string;
  ad_image_url: string;
  ad_image_alt: string;
  ad_link_url: string;
  ad_cta_text: string;
  ad_html_code: string;
};

type ThreadBooleanKey = "is_active" | "is_pinned" | "is_locked" | "is_answered";
type ThreadEditorMode = "visual" | "html" | "split";
type BulkThreadActionValue =
  | "publish"
  | "draft"
  | "archive"
  | "activate"
  | "deactivate"
  | "pin"
  | "unpin"
  | "lock"
  | "unlock"
  | "delete";

type EnrichedReply = ForumReplyRow & {
  thread?: ForumThreadRow | null;
};

type AdminForumView =
  | { section: "threads"; mode: "list" | "new" | "edit"; entityId?: string }
  | { section: "categories"; mode: "list" | "new" | "edit"; entityId?: string }
  | { section: "moderation"; mode: "list" };

const THREAD_AUTOSAVE_PREFIX = "dp-forum-thread-autodraft";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

const stripHtml = (html: string) => {
  if (!html) return "";
  if (typeof DOMParser === "undefined") {
    return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }

  const doc = new DOMParser().parseFromString(html, "text/html");
  return (doc.body.textContent || "").replace(/\s+/g, " ").trim();
};

const formatDateTime = (value?: string | null) =>
  value
    ? new Intl.DateTimeFormat("de-AT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(value))
    : "—";

const deriveAuthorName = (
  user: ReturnType<typeof useAuth>["user"],
  current?: string | null,
) => {
  const existing = current?.trim();
  if (existing) return existing;

  const fullName =
    (typeof user?.user_metadata?.full_name === "string" && user.user_metadata.full_name) ||
    (typeof user?.user_metadata?.name === "string" && user.user_metadata.name);

  if (fullName && fullName.trim()) return fullName.trim();
  if (user?.email) return user.email.split("@")[0];
  return "Digital-Perfect Redaktion";
};

const toDateTimeLocalValue = (iso?: string | null) => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const shifted = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return shifted.toISOString().slice(0, 16);
};

const fromDateTimeLocalValue = (value?: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
};

const resolveForumView = (pathname: string): AdminForumView => {
  const segments = pathname
    .replace(/^\/admin\/forum\/?/, "")
    .split("/")
    .filter(Boolean);

  const [section, detail] = segments;

  if (section === "categories") {
    if (!detail) return { section: "categories", mode: "list" };
    if (detail === "new") return { section: "categories", mode: "new" };
    return { section: "categories", mode: "edit", entityId: detail };
  }

  if (section === "moderation") {
    return { section: "moderation", mode: "list" };
  }

  if (!section || section === "threads") {
    if (!detail) return { section: "threads", mode: "list" };
    if (detail === "new") return { section: "threads", mode: "new" };
    return { section: "threads", mode: "edit", entityId: detail };
  }

  return { section: "threads", mode: "list" };
};

const createEmptyCategory = (nextSortOrder: number): CategoryFormState => ({
  name: "",
  slug: "",
  description: "",
  sort_order: nextSortOrder,
  is_active: true,
  seo_title: "",
  seo_description: "",
  ad_enabled: false,
  ad_headline: "",
  ad_subheadline: "",
  ad_cta_text: "",
  ad_link_url: "",
  ad_image_url: "",
  ad_html_code: "",
});

const createEmptyThread = (
  user: ReturnType<typeof useAuth>["user"],
  firstCategoryId?: string,
): ThreadFormState => ({
  title: "",
  slug: "",
  category_id: firstCategoryId || "none",
  author_name: deriveAuthorName(user),
  featured_image_url: "",
  featured_image_alt: "",
  seo_title: "",
  seo_description: "",
  raw_html_content: "<p></p>",
  is_pinned: false,
  is_locked: false,
  is_answered: false,
  is_active: true,
  status: "draft",
  scheduled_publish_at: "",
  admin_notes: "",
  show_ad: false,
  ad_type: "image",
  ad_image_url: "",
  ad_image_alt: "",
  ad_link_url: "",
  ad_cta_text: "",
  ad_html_code: "",
});

const toCategoryFormState = (category: ForumCategoryRow): CategoryFormState => ({
  id: category.id,
  name: category.name,
  slug: category.slug,
  description: category.description || "",
  sort_order: category.sort_order || 0,
  is_active: category.is_active,
  seo_title: category.seo_title || "",
  seo_description: category.seo_description || "",
  ad_enabled: category.ad_enabled,
  ad_headline: category.ad_headline || "",
  ad_subheadline: category.ad_subheadline || "",
  ad_cta_text: category.ad_cta_text || "",
  ad_link_url: category.ad_link_url || "",
  ad_image_url: category.ad_image_url || "",
  ad_html_code: category.ad_html_code || "",
});

const toThreadFormState = (
  thread: ForumThreadRow,
  user: ReturnType<typeof useAuth>["user"],
): ThreadFormState => ({
  id: thread.id,
  title: thread.title,
  slug: thread.slug,
  category_id: thread.category_id || "none",
  author_name: deriveAuthorName(user, thread.author_name),
  featured_image_url: thread.featured_image_url || "",
  featured_image_alt: thread.featured_image_alt || "",
  seo_title: thread.seo_title || "",
  seo_description: thread.seo_description || "",
  raw_html_content: thread.raw_html_content || thread.content || "<p></p>",
  is_pinned: thread.is_pinned,
  is_locked: thread.is_locked,
  is_answered: thread.is_answered,
  is_active: thread.is_active,
  status: thread.status || "draft",
  scheduled_publish_at: toDateTimeLocalValue(extractForumScheduledAt(thread.admin_notes)),
  admin_notes: stripForumScheduleMeta(thread.admin_notes),
  show_ad: thread.show_ad,
  ad_type: thread.ad_type || "image",
  ad_image_url: thread.ad_image_url || "",
  ad_image_alt: thread.ad_image_alt || "",
  ad_link_url: thread.ad_link_url || "",
  ad_cta_text: thread.ad_cta_text || "",
  ad_html_code: thread.ad_html_code || "",
});

const getSafeImageUrl = (value: string) => (value.trim() ? buildRawImageUrl(value) : "");

const getThreadAutosaveKey = (siteId: string, threadKey: string) =>
  `${THREAD_AUTOSAVE_PREFIX}:${siteId}:${threadKey}`;

const statusClassMap: Record<string, string> = {
  published: "bg-emerald-50 text-emerald-700 border-emerald-200",
  draft: "bg-amber-50 text-amber-700 border-amber-200",
  archived: "bg-slate-100 text-slate-700 border-slate-200",
  scheduled: "bg-blue-50 text-blue-700 border-blue-200",
};

const StatusBadgeChip = ({ status }: { status: string }) => (
  <span
    className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${statusClassMap[status] || "bg-slate-100 text-slate-700 border-slate-200"}`}
  >
    {status}
  </span>
);

const AdminForum = () => {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isGlobalAdmin } = useAuth();
  const { activeSiteId } = useSiteContext();
  const siteId = activeSiteId || DEFAULT_SITE_ID;
  const { hasForum, isLoading: modulesLoading } = useSiteModules();

  const forumView = useMemo(() => resolveForumView(location.pathname), [location.pathname]);
  const threadRouteKey = forumView.section === "threads" && forumView.mode !== "list" ? forumView.entityId || "new" : null;
  const categoryRouteKey = forumView.section === "categories" && forumView.mode !== "list" ? forumView.entityId || "new" : null;

  const [categoryForm, setCategoryForm] = useState<CategoryFormState | null>(null);
  const [threadForm, setThreadForm] = useState<ThreadFormState | null>(null);
  const [isCategorySlugManual, setIsCategorySlugManual] = useState(false);
  const [isThreadSlugManual, setIsThreadSlugManual] = useState(false);
  const [isUploadingFeatured, setIsUploadingFeatured] = useState(false);
  const [threadEditorMode, setThreadEditorMode] = useState<ThreadEditorMode>("visual");
  const [threadSearch, setThreadSearch] = useState("");
  const [threadStatusFilter, setThreadStatusFilter] = useState<string>("all");
  const [threadCategoryFilter, setThreadCategoryFilter] = useState<string>("all");
  const [threadVisibilityFilter, setThreadVisibilityFilter] = useState<"all" | "active" | "inactive">("all");
  const [selectedThreadIds, setSelectedThreadIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<BulkThreadActionValue | "none">("none");
  const [categorySearch, setCategorySearch] = useState("");
  const [replyStatusFilter, setReplyStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [replySpamFilter, setReplySpamFilter] = useState<"all" | "clean" | "spam">("all");
  const [replyThreadFilter, setReplyThreadFilter] = useState<string>("all");
  const [replySearch, setReplySearch] = useState("");
  const [selectedReplyId, setSelectedReplyId] = useState<string | null>(null);
  const [threadAutosaveAt, setThreadAutosaveAt] = useState<string | null>(null);
  const [deleteThreadTargetId, setDeleteThreadTargetId] = useState<string | null>(null);
  const [deleteCategoryTargetId, setDeleteCategoryTargetId] = useState<string | null>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  const hydratedThreadRef = useRef<string | null>(null);
  const hydratedCategoryRef = useRef<string | null>(null);

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["admin-forum-categories", siteId],
    queryFn: async (): Promise<ForumCategoryRow[]> => {
      const { data, error } = await supabase
        .from("forum_categories")
        .select("*")
        .eq("site_id", siteId)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });

      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: threads = [], isLoading: threadsLoading } = useQuery({
    queryKey: ["admin-forum-threads", siteId],
    queryFn: async (): Promise<ForumThreadRow[]> => {
      const { data, error } = await supabase
        .from("forum_threads")
        .select("*")
        .eq("site_id", siteId)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: replies = [], isLoading: repliesLoading } = useQuery({
    queryKey: ["admin-forum-replies", siteId],
    queryFn: async (): Promise<ForumReplyRow[]> => {
      const { data, error } = await supabase
        .from("forum_replies")
        .select("*")
        .eq("site_id", siteId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
  });

  const categoryMap = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  );

  const threadMap = useMemo(() => new Map(threads.map((thread) => [thread.id, thread])), [threads]);

  const nextCategorySortOrder = useMemo(() => {
    if (!categories.length) return 0;
    return Math.max(...categories.map((category) => category.sort_order || 0)) + 1;
  }, [categories]);

  const threadRows = useMemo(
    () =>
      threads.map((thread) => ({
        ...thread,
        category: thread.category_id ? categoryMap.get(thread.category_id) || null : null,
        scheduledAt: extractForumScheduledAt(thread.admin_notes),
        isPubliclyVisible: isForumThreadPubliclyVisible(thread.status, thread.admin_notes),
      })),
    [categoryMap, threads],
  );

  const filteredThreads = useMemo(() => {
    const search = threadSearch.trim().toLowerCase();

    return threadRows.filter((thread) => {
      if (threadStatusFilter !== "all" && thread.status !== threadStatusFilter) return false;
      if (threadCategoryFilter !== "all" && thread.category_id !== threadCategoryFilter) return false;
      if (threadVisibilityFilter === "active" && !thread.is_active) return false;
      if (threadVisibilityFilter === "inactive" && thread.is_active) return false;

      if (!search) return true;
      const haystack = [
        thread.title,
        thread.slug,
        thread.author_name || "",
        thread.category?.name || "",
        stripHtml(thread.raw_html_content || thread.content),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(search);
    });
  }, [threadCategoryFilter, threadRows, threadSearch, threadStatusFilter, threadVisibilityFilter]);

  const categoryThreadCounts = useMemo(() => {
    const counts = new Map<string, number>();
    threadRows.forEach((thread) => {
      if (!thread.category_id) return;
      counts.set(thread.category_id, (counts.get(thread.category_id) || 0) + 1);
    });
    return counts;
  }, [threadRows]);

  const filteredCategories = useMemo(() => {
    const search = categorySearch.trim().toLowerCase();
    if (!search) return categories;

    return categories.filter((category) => {
      const haystack = [category.name, category.slug, category.description || "", category.seo_title || ""]
        .join(" ")
        .toLowerCase();
      return haystack.includes(search);
    });
  }, [categories, categorySearch]);

  const enrichedReplies = useMemo<EnrichedReply[]>(
    () =>
      replies.map((reply) => ({
        ...reply,
        thread: threadMap.get(reply.thread_id) || null,
      })),
    [replies, threadMap],
  );

  const filteredReplies = useMemo(() => {
    const search = replySearch.trim().toLowerCase();

    return enrichedReplies.filter((reply) => {
      if (replyStatusFilter === "active" && !reply.is_active) return false;
      if (replyStatusFilter === "inactive" && reply.is_active) return false;
      if (replySpamFilter === "clean" && reply.is_spam) return false;
      if (replySpamFilter === "spam" && !reply.is_spam) return false;
      if (replyThreadFilter !== "all" && reply.thread_id !== replyThreadFilter) return false;

      if (!search) return true;
      const haystack = [reply.author_name || "", reply.content || "", reply.thread?.title || "", reply.thread?.slug || ""]
        .join(" ")
        .toLowerCase();
      return haystack.includes(search);
    });
  }, [enrichedReplies, replySearch, replySpamFilter, replyStatusFilter, replyThreadFilter]);

  const selectedReply = useMemo(
    () => filteredReplies.find((reply) => reply.id === selectedReplyId) || filteredReplies[0] || null,
    [filteredReplies, selectedReplyId],
  );

  useEffect(() => {
    if (!filteredReplies.length) {
      setSelectedReplyId(null);
      return;
    }

    if (!selectedReplyId || !filteredReplies.some((reply) => reply.id === selectedReplyId)) {
      setSelectedReplyId(filteredReplies[0].id);
    }
  }, [filteredReplies, selectedReplyId]);

  useEffect(() => {
    if (forumView.section !== "threads" || forumView.mode === "list") return;
    if (categoriesLoading || threadsLoading) return;
    if (hydratedThreadRef.current === threadRouteKey) return;

    const threadKey = threadRouteKey || "new";
    const initialForm =
      forumView.mode === "edit" && forumView.entityId
        ? (() => {
            const record = threads.find((thread) => thread.id === forumView.entityId);
            if (!record) return null;
            return toThreadFormState(record, user);
          })()
        : createEmptyThread(user, categories[0]?.id);

    if (!initialForm) {
      navigate("/admin/forum/threads", { replace: true });
      return;
    }

    let nextForm = initialForm;
    if (typeof window !== "undefined") {
      const rawDraft = window.localStorage.getItem(getThreadAutosaveKey(siteId, threadKey));
      if (rawDraft) {
        try {
          const parsed = JSON.parse(rawDraft) as { form?: ThreadFormState; savedAt?: string };
          if (parsed.form) {
            nextForm = {
              ...initialForm,
              ...parsed.form,
              id: initialForm.id,
            };
            if (parsed.savedAt) setThreadAutosaveAt(parsed.savedAt);
          }
        } catch {
          // noop
        }
      }
    }

    setThreadForm(nextForm);
    setIsThreadSlugManual(Boolean(nextForm.slug));
    hydratedThreadRef.current = threadKey;
  }, [
    categories,
    categoriesLoading,
    forumView.entityId,
    forumView.mode,
    forumView.section,
    navigate,
    siteId,
    threadRouteKey,
    threads,
    threadsLoading,
    user,
  ]);

  useEffect(() => {
    if (forumView.section !== "categories" || forumView.mode === "list") return;
    if (categoriesLoading) return;
    if (hydratedCategoryRef.current === categoryRouteKey) return;

    const initialForm =
      forumView.mode === "edit" && forumView.entityId
        ? (() => {
            const record = categories.find((category) => category.id === forumView.entityId);
            if (!record) return null;
            return toCategoryFormState(record);
          })()
        : createEmptyCategory(nextCategorySortOrder);

    if (!initialForm) {
      navigate("/admin/forum/categories", { replace: true });
      return;
    }

    setCategoryForm(initialForm);
    setIsCategorySlugManual(Boolean(initialForm.slug));
    hydratedCategoryRef.current = categoryRouteKey || "new";
  }, [
    categories,
    categoriesLoading,
    categoryRouteKey,
    forumView.entityId,
    forumView.mode,
    forumView.section,
    navigate,
    nextCategorySortOrder,
  ]);

  useEffect(() => {
    if (forumView.section === "threads" && forumView.mode !== "list") return;
    hydratedThreadRef.current = null;
    setThreadForm(null);
    setIsThreadSlugManual(false);
    setThreadAutosaveAt(null);
  }, [forumView.mode, forumView.section]);

  useEffect(() => {
    if (forumView.section === "categories" && forumView.mode !== "list") return;
    hydratedCategoryRef.current = null;
    setCategoryForm(null);
    setIsCategorySlugManual(false);
  }, [forumView.mode, forumView.section]);

  useEffect(() => {
    if (forumView.section !== "threads" || forumView.mode === "list" || !threadForm || !threadRouteKey) return;
    if (typeof window === "undefined") return;

    const saveKey = getThreadAutosaveKey(siteId, threadRouteKey);
    const saveAt = new Date().toISOString();
    const timeout = window.setTimeout(() => {
      window.localStorage.setItem(saveKey, JSON.stringify({ form: threadForm, savedAt: saveAt }));
      setThreadAutosaveAt(saveAt);
    }, 900);

    return () => window.clearTimeout(timeout);
  }, [forumView.mode, forumView.section, siteId, threadForm, threadRouteKey]);

  const featuredPreview = useMemo(
    () => (threadForm?.featured_image_url ? getSafeImageUrl(threadForm.featured_image_url) : ""),
    [threadForm?.featured_image_url],
  );

  const excerptPreview = useMemo(() => {
    const plainText = stripHtml(threadForm?.raw_html_content || "");
    if (!plainText) return "Noch kein Inhalt hinterlegt.";
    return plainText.slice(0, 260);
  }, [threadForm?.raw_html_content]);

  const stats = useMemo(() => {
    const activeCategories = categories.filter((category) => category.is_active).length;
    const publishedThreads = threadRows.filter((thread) => thread.status === "published" && thread.is_active).length;
    const draftThreads = threadRows.filter((thread) => thread.status === "draft").length;
    const scheduledThreads = threadRows.filter((thread) => thread.status === "scheduled").length;
    const spamReplies = replies.filter((reply) => reply.is_spam).length;
    const inactiveReplies = replies.filter((reply) => !reply.is_active).length;

    return [
      { label: "Aktive Kategorien", value: activeCategories },
      { label: "Live Threads", value: publishedThreads },
      { label: "Entwürfe", value: draftThreads },
      { label: "Geplant", value: scheduledThreads },
      { label: "Spam-Replies", value: spamReplies },
      { label: "Moderation offen", value: inactiveReplies },
    ];
  }, [categories, replies, threadRows]);

  const invalidateForumQueries = async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: ["admin-forum-categories", siteId] }),
      qc.invalidateQueries({ queryKey: ["admin-forum-threads", siteId] }),
      qc.invalidateQueries({ queryKey: ["admin-forum-replies", siteId] }),
      qc.invalidateQueries({ queryKey: ["forum-categories"] }),
      qc.invalidateQueries({ queryKey: ["forum-threads"] }),
      qc.invalidateQueries({ queryKey: ["forum-thread"] }),
      qc.invalidateQueries({ queryKey: ["forum-replies"] }),
      qc.invalidateQueries({ queryKey: ["forum-featured-threads"] }),
    ]);
  };

  const saveCategory = useMutation({
    mutationFn: async (values: CategoryFormState) => {
      const payload: ForumCategoryInsert | ForumCategoryUpdate = {
        site_id: siteId,
        name: values.name.trim(),
        slug: slugify(values.slug || values.name),
        description: values.description.trim() || null,
        sort_order: Number.isFinite(Number(values.sort_order)) ? Number(values.sort_order) : 0,
        is_active: values.is_active,
        seo_title: values.seo_title.trim() || null,
        seo_description: values.seo_description.trim() || null,
        ad_enabled: values.ad_enabled,
        ad_headline: values.ad_headline.trim() || null,
        ad_subheadline: values.ad_subheadline.trim() || null,
        ad_cta_text: values.ad_cta_text.trim() || null,
        ad_link_url: values.ad_link_url.trim() || null,
        ad_image_url: values.ad_image_url.trim() || null,
        ad_html_code: values.ad_html_code.trim() || null,
      };

      if (!payload.name) throw new Error("Bitte einen Kategorienamen angeben.");
      if (!payload.slug) throw new Error("Bitte einen gültigen Slug angeben.");

      if (values.id) {
        const { data, error } = await supabase
          .from("forum_categories")
          .update(payload)
          .eq("id", values.id)
          .select("id")
          .single();
        if (error) throw error;
        return data.id;
      }

      const { data, error } = await supabase
        .from("forum_categories")
        .insert(payload as ForumCategoryInsert)
        .select("id")
        .single();
      if (error) throw error;
      return data.id;
    },
    onSuccess: async (savedId) => {
      await invalidateForumQueries();
      toast.success("Kategorie gespeichert.");
      navigate(`/admin/forum/categories/${savedId}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Kategorie konnte nicht gespeichert werden.");
    },
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("forum_categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await invalidateForumQueries();
      setDeleteCategoryTargetId(null);
      toast.success("Kategorie gelöscht.");
      navigate("/admin/forum/categories");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Kategorie konnte nicht gelöscht werden.");
    },
  });

  const saveThread = useMutation({
    mutationFn: async (values: ThreadFormState) => {
      const rawHtml = values.raw_html_content.trim() || "<p></p>";
      const scheduledIso = values.status === "scheduled" ? fromDateTimeLocalValue(values.scheduled_publish_at) : null;

      if (values.status === "scheduled" && !scheduledIso) {
        throw new Error("Für geplante Veröffentlichung brauchst du Datum und Uhrzeit.");
      }

      const payload: ForumThreadInsert | ForumThreadUpdate = {
        site_id: siteId,
        title: values.title.trim(),
        slug: slugify(values.slug || values.title),
        content: stripHtml(rawHtml),
        raw_html_content: rawHtml,
        author_id: user?.id || null,
        author_name: deriveAuthorName(user, values.author_name),
        category_id: values.category_id === "none" ? null : values.category_id,
        featured_image_url: values.featured_image_url.trim() || null,
        featured_image_alt: values.featured_image_alt.trim() || null,
        seo_title: values.seo_title.trim() || null,
        seo_description: values.seo_description.trim() || null,
        is_pinned: values.is_pinned,
        is_locked: values.is_locked,
        is_answered: values.is_answered,
        is_active: values.is_active,
        status: values.status,
        last_activity_at: new Date().toISOString(),
        admin_notes: upsertForumScheduleMeta(values.admin_notes, scheduledIso),
        show_ad: values.show_ad,
        ad_type: values.show_ad ? values.ad_type : null,
        ad_image_url: values.show_ad ? values.ad_image_url.trim() || null : null,
        ad_image_alt: values.show_ad ? values.ad_image_alt.trim() || null : null,
        ad_link_url: values.show_ad ? values.ad_link_url.trim() || null : null,
        ad_cta_text: values.show_ad ? values.ad_cta_text.trim() || null : null,
        ad_html_code: values.show_ad ? values.ad_html_code.trim() || null : null,
      };

      if (!payload.title) throw new Error("Bitte einen Thread-Titel angeben.");
      if (!payload.slug) throw new Error("Bitte einen gültigen Slug angeben.");
      if (!payload.content) throw new Error("Bitte echten Beitragsinhalt im Editor hinterlegen.");

      if (values.id) {
        const { data, error } = await supabase
          .from("forum_threads")
          .update(payload)
          .eq("id", values.id)
          .select("id")
          .single();
        if (error) throw error;
        return { id: data.id, routeKey: values.id };
      }

      const { data, error } = await supabase
        .from("forum_threads")
        .insert(payload as ForumThreadInsert)
        .select("id")
        .single();
      if (error) throw error;
      return { id: data.id, routeKey: "new" };
    },
    onSuccess: async ({ id, routeKey }) => {
      await invalidateForumQueries();
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(getThreadAutosaveKey(siteId, routeKey));
        window.localStorage.removeItem(getThreadAutosaveKey(siteId, id));
      }
      setThreadAutosaveAt(null);
      hydratedThreadRef.current = null;
      toast.success("Thread gespeichert.");
      navigate(`/admin/forum/threads/${id}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Thread konnte nicht gespeichert werden.");
    },
  });

  const deleteThread = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("forum_threads").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: async (_, id) => {
      await invalidateForumQueries();
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(getThreadAutosaveKey(siteId, id));
      }
      setDeleteThreadTargetId(null);
      toast.success("Thread gelöscht.");
      navigate("/admin/forum/threads");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Thread konnte nicht gelöscht werden.");
    },
  });

  const duplicateThread = useMutation({
    mutationFn: async (values: ThreadFormState) => {
      const rawHtml = values.raw_html_content.trim() || "<p></p>";
      const duplicateSlug = slugify(`${values.slug || values.title}-copy-${Date.now().toString().slice(-6)}`);
      const payload: ForumThreadInsert = {
        site_id: siteId,
        title: `${values.title.trim()} (Kopie)`,
        slug: duplicateSlug,
        content: stripHtml(rawHtml),
        raw_html_content: rawHtml,
        author_id: user?.id || null,
        author_name: deriveAuthorName(user, values.author_name),
        category_id: values.category_id === "none" ? null : values.category_id,
        featured_image_url: values.featured_image_url.trim() || null,
        featured_image_alt: values.featured_image_alt.trim() || null,
        seo_title: values.seo_title.trim() || null,
        seo_description: values.seo_description.trim() || null,
        is_pinned: false,
        is_locked: false,
        is_answered: false,
        is_active: true,
        status: "draft",
        last_activity_at: new Date().toISOString(),
        admin_notes: upsertForumScheduleMeta(values.admin_notes, null),
        show_ad: values.show_ad,
        ad_type: values.show_ad ? values.ad_type : null,
        ad_image_url: values.show_ad ? values.ad_image_url.trim() || null : null,
        ad_image_alt: values.show_ad ? values.ad_image_alt.trim() || null : null,
        ad_link_url: values.show_ad ? values.ad_link_url.trim() || null : null,
        ad_cta_text: values.show_ad ? values.ad_cta_text.trim() || null : null,
        ad_html_code: values.show_ad ? values.ad_html_code.trim() || null : null,
      };

      const { data, error } = await supabase
        .from("forum_threads")
        .insert(payload)
        .select("id")
        .single();
      if (error) throw error;
      return data.id;
    },
    onSuccess: async (id) => {
      await invalidateForumQueries();
      toast.success("Kopie als Entwurf angelegt.");
      hydratedThreadRef.current = null;
      navigate(`/admin/forum/threads/${id}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Thread konnte nicht dupliziert werden.");
    },
  });

  const bulkThreadActionMutation = useMutation({
    mutationFn: async ({ action, ids }: { action: BulkThreadActionValue; ids: string[] }) => {
      if (!ids.length) throw new Error("Bitte zuerst Threads auswählen.");

      if (action === "delete") {
        const { error } = await supabase.from("forum_threads").delete().in("id", ids);
        if (error) throw error;
        return;
      }

      const patchMap: Record<Exclude<BulkThreadActionValue, "delete">, ForumThreadUpdate> = {
        publish: { status: "published" },
        draft: { status: "draft" },
        archive: { status: "archived" },
        activate: { is_active: true },
        deactivate: { is_active: false },
        pin: { is_pinned: true },
        unpin: { is_pinned: false },
        lock: { is_locked: true },
        unlock: { is_locked: false },
      };

      const { error } = await supabase.from("forum_threads").update(patchMap[action]).in("id", ids);
      if (error) throw error;
    },
    onSuccess: async () => {
      await invalidateForumQueries();
      setConfirmBulkDelete(false);
      setSelectedThreadIds([]);
      setBulkAction("none");
      toast.success("Bulk-Aktion ausgeführt.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Bulk-Aktion fehlgeschlagen.");
    },
  });

  const updateThreadQuickAction = useMutation({
    mutationFn: async ({
      threadId,
      patch,
      successMessage,
    }: {
      threadId: string;
      patch: ForumThreadUpdate;
      successMessage: string;
    }) => {
      const { error } = await supabase.from("forum_threads").update(patch).eq("id", threadId);
      if (error) throw error;
      return successMessage;
    },
    onSuccess: async (message) => {
      await invalidateForumQueries();
      toast.success(message);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Thread-Aktion fehlgeschlagen.");
    },
  });

  const updateReplyModeration = useMutation({
    mutationFn: async ({
      replyId,
      patch,
      successMessage,
    }: {
      replyId: string;
      patch: ForumReplyUpdate;
      successMessage: string;
    }) => {
      const { error } = await supabase.from("forum_replies").update(patch).eq("id", replyId);
      if (error) throw error;
      return successMessage;
    },
    onSuccess: async (message) => {
      await invalidateForumQueries();
      toast.success(message);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Reply-Moderation fehlgeschlagen.");
    },
  });

  const uploadForumAsset = async (file: File, folder: "threads" | "editor" = "threads") => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      throw new Error("Nur JPG, PNG oder WEBP sind erlaubt.");
    }

    if (file.size > 2 * 1024 * 1024) {
      throw new Error("Maximal 2 MB pro Bild erlaubt.");
    }

    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const filePath = `${folder}/${Date.now()}-${crypto.randomUUID()}.${extension}`;

    const { error } = await supabase.storage.from("forum-assets").upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (error) throw error;

    return buildRawImageUrl(`forum-assets/${filePath}`);
  };

  const handleFeaturedUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !threadForm) return;

    setIsUploadingFeatured(true);
    try {
      const imageUrl = await uploadForumAsset(file, "threads");
      setThreadForm((prev) =>
        prev
          ? {
              ...prev,
              featured_image_url: imageUrl,
              featured_image_alt: prev.featured_image_alt || file.name.replace(/\.[^.]+$/, ""),
            }
          : prev,
      );
      toast.success("Beitragsbild hochgeladen.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload fehlgeschlagen.";
      toast.error(message);
    } finally {
      setIsUploadingFeatured(false);
    }
  };

  const toggleSelectAllVisibleThreads = () => {
    const visibleIds = filteredThreads.map((thread) => thread.id);
    const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedThreadIds.includes(id));
    setSelectedThreadIds(allSelected ? [] : visibleIds);
  };

  const toggleSelectedThread = (threadId: string) => {
    setSelectedThreadIds((prev) =>
      prev.includes(threadId) ? prev.filter((id) => id !== threadId) : [...prev, threadId],
    );
  };

  const activeThread = useMemo(
    () => (threadForm?.id ? threadRows.find((thread) => thread.id === threadForm.id) || null : null),
    [threadForm?.id, threadRows],
  );

  const threadPublicUrl = threadForm?.slug ? `/forum/${threadForm.slug}` : "/forum";
  const categoryPublicUrl = categoryForm?.slug ? `/forum/kategorie/${categoryForm.slug}` : "/forum";

  if (modulesLoading) return <div className="p-6 font-medium text-slate-500">Laden...</div>;

  if (!hasForum) {
    return (
      <ModuleLockedState
        moduleName="Forum"
        title="Forum-Modul ist aktuell gesperrt"
        description="Community, Kategorien, Threads und Moderation werden erst geladen, wenn das Forum-Entitlement für diese Site aktiv ist."
        canSelfActivate={isGlobalAdmin}
      />
    );
  }

  const renderThreadsList = () => {
    const allVisibleSelected =
      filteredThreads.length > 0 && filteredThreads.every((thread) => selectedThreadIds.includes(thread.id));

    return (
      <div className="space-y-6">
        <Card className="rounded-[28px] border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <CardTitle className="text-2xl font-black tracking-tight text-slate-950">Threads</CardTitle>
              <CardDescription className="mt-2 text-sm leading-7 text-slate-500">
                WordPress-Stil: Liste zuerst, Bearbeitung separat im Beitrag. Dazu Bulk-Actions, Schnellfilter und Direktlinks in den Editor.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="rounded-2xl" onClick={() => navigate("/admin/forum/categories")}>Kategorien</Button>
              <Button className="rounded-2xl bg-[#0E1F53] text-white hover:bg-[#16306d]" onClick={() => navigate("/admin/forum/threads/new")}> 
                <MessageSquarePlus className="h-4 w-4" />
                Neuer Thread
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 lg:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={threadSearch}
                  onChange={(event) => setThreadSearch(event.target.value)}
                  className="rounded-2xl pl-10"
                  placeholder="Titel, Slug, Autor oder Inhalt durchsuchen"
                />
              </div>
              <Select value={threadStatusFilter} onValueChange={setThreadStatusFilter}>
                <SelectTrigger className="rounded-2xl"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Status</SelectItem>
                  <SelectItem value="published">published</SelectItem>
                  <SelectItem value="draft">draft</SelectItem>
                  <SelectItem value="scheduled">scheduled</SelectItem>
                  <SelectItem value="archived">archived</SelectItem>
                </SelectContent>
              </Select>
              <Select value={threadCategoryFilter} onValueChange={setThreadCategoryFilter}>
                <SelectTrigger className="rounded-2xl"><SelectValue placeholder="Kategorie" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Kategorien</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={threadVisibilityFilter} onValueChange={(value) => setThreadVisibilityFilter(value as "all" | "active" | "inactive")}> 
                <SelectTrigger className="rounded-2xl"><SelectValue placeholder="Sichtbarkeit" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Sichtbarkeiten</SelectItem>
                  <SelectItem value="active">Nur aktiv</SelectItem>
                  <SelectItem value="inactive">Nur inaktiv</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-3 rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                <span className="font-semibold text-slate-900">{filteredThreads.length}</span>
                <span>Threads in der aktuellen Ansicht</span>
                {selectedThreadIds.length > 0 && <Badge className="rounded-full bg-[#0E1F53] text-white">{selectedThreadIds.length} ausgewählt</Badge>}
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Select value={bulkAction} onValueChange={(value) => setBulkAction(value as BulkThreadActionValue | "none")}> 
                  <SelectTrigger className="w-full rounded-2xl sm:w-[220px]"><SelectValue placeholder="Bulk-Aktion" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Bulk-Aktion wählen</SelectItem>
                    <SelectItem value="publish">Publishen</SelectItem>
                    <SelectItem value="draft">Als Draft setzen</SelectItem>
                    <SelectItem value="archive">Archivieren</SelectItem>
                    <SelectItem value="activate">Aktiv setzen</SelectItem>
                    <SelectItem value="deactivate">Inaktiv setzen</SelectItem>
                    <SelectItem value="pin">Anpinnen</SelectItem>
                    <SelectItem value="unpin">Pin entfernen</SelectItem>
                    <SelectItem value="lock">Sperren</SelectItem>
                    <SelectItem value="unlock">Entsperren</SelectItem>
                    <SelectItem value="delete">Löschen</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  className="rounded-2xl"
                  disabled={bulkAction === "none" || !selectedThreadIds.length || bulkThreadActionMutation.isPending}
                  onClick={() => {
                    if (bulkAction === "none") return;
                    if (bulkAction === "delete") {
                      setConfirmBulkDelete(true);
                      return;
                    }
                    bulkThreadActionMutation.mutate({ action: bulkAction, ids: selectedThreadIds });
                  }}
                >
                  <CheckSquare2 className="h-4 w-4" />
                  Aktion ausführen
                </Button>
              </div>
            </div>

            <div className="overflow-hidden rounded-[24px] border border-slate-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.14em] text-slate-500">
                    <tr>
                      <th className="px-4 py-3">
                        <button type="button" className="inline-flex items-center" onClick={toggleSelectAllVisibleThreads}>
                          {allVisibleSelected ? <CheckSquare2 className="h-4 w-4 text-[#0E1F53]" /> : <Square className="h-4 w-4" />}
                        </button>
                      </th>
                      <th className="px-4 py-3">Beitrag</th>
                      <th className="px-4 py-3">Kategorie</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Autor</th>
                      <th className="px-4 py-3">Aktivität</th>
                      <th className="px-4 py-3 text-right">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {threadsLoading ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-10 text-center text-slate-500">Threads werden geladen…</td>
                      </tr>
                    ) : filteredThreads.length ? (
                      filteredThreads.map((thread) => (
                        <tr key={thread.id} className="align-top hover:bg-slate-50/70">
                          <td className="px-4 py-4">
                            <button type="button" className="inline-flex items-center" onClick={() => toggleSelectedThread(thread.id)}>
                              {selectedThreadIds.includes(thread.id) ? (
                                <CheckSquare2 className="h-4 w-4 text-[#0E1F53]" />
                              ) : (
                                <Square className="h-4 w-4 text-slate-400" />
                              )}
                            </button>
                          </td>
                          <td className="px-4 py-4">
                            <div className="min-w-[280px] max-w-[520px] space-y-2">
                              <button
                                type="button"
                                className="text-left text-base font-bold text-slate-950 transition-colors hover:text-[#0E1F53]"
                                onClick={() => navigate(`/admin/forum/threads/${thread.id}`)}
                              >
                                {thread.title}
                              </button>
                              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                <span>/{thread.slug}</span>
                                {thread.is_pinned && <Badge variant="outline" className="rounded-full border-[#FF4B2C]/30 text-[#FF4B2C]">Angepinnt</Badge>}
                                {thread.is_locked && <Badge variant="outline" className="rounded-full border-slate-300 text-slate-700">Gesperrt</Badge>}
                                {!thread.is_active && <Badge variant="outline" className="rounded-full border-slate-300 text-slate-500">Inaktiv</Badge>}
                              </div>
                              <p className="line-clamp-2 text-sm leading-6 text-slate-600">
                                {stripHtml(thread.raw_html_content || thread.content).slice(0, 170) || "Noch kein Inhalt."}
                              </p>
                              {thread.status === "scheduled" && thread.scheduledAt && (
                                <p className="text-xs font-medium text-blue-700">Geplant für: {formatDateTime(thread.scheduledAt)}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-slate-600">{thread.category?.name || "Ohne Kategorie"}</td>
                          <td className="px-4 py-4">
                            <div className="space-y-2">
                              <StatusBadgeChip status={thread.status} />
                              <p className="text-xs text-slate-500">{thread.isPubliclyVisible ? "Öffentlich sichtbar" : "Nicht live"}</p>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-slate-600">{thread.author_name || "—"}</td>
                          <td className="px-4 py-4 text-slate-600">
                            <div className="space-y-1">
                              <p>{formatDateTime(thread.updated_at)}</p>
                              <p className="text-xs text-slate-500">Views: {thread.views}</p>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-wrap justify-end gap-2">
                              <Button variant="outline" size="sm" className="rounded-xl" onClick={() => navigate(`/admin/forum/threads/${thread.id}`)}>
                                <PencilLine className="h-4 w-4" />
                                Bearbeiten
                              </Button>
                              <Button variant="outline" size="sm" className="rounded-xl" asChild>
                                <Link to={`/forum/${thread.slug}`} target="_blank" rel="noreferrer">
                                  <Eye className="h-4 w-4" />
                                  Live
                                </Link>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-4 py-10 text-center text-slate-500">Keine Threads in dieser Ansicht gefunden.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderThreadEditor = () => {
    if (!threadForm) {
      return (
        <Card className="rounded-[28px] border-slate-200 bg-white shadow-sm">
          <CardContent className="p-8 text-slate-500">Thread wird vorbereitet…</CardContent>
        </Card>
      );
    }

    const seoTitlePreview = threadForm.seo_title.trim() || threadForm.title.trim() || "Thread-Titel";
    const seoDescriptionPreview =
      threadForm.seo_description.trim() || excerptPreview.slice(0, 155) || "Meta-Description für den Forum-Thread";

    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <button type="button" className="hover:text-[#0E1F53]" onClick={() => navigate("/admin/forum/threads")}>Threads</button>
              <span>/</span>
              <span>{threadForm.id ? "Beitrag bearbeiten" : "Neuer Beitrag"}</span>
            </div>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
              {threadForm.id ? "Beitrag bearbeiten" : "Neuen Beitrag anlegen"}
            </h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Jetzt sauber getrennt wie WordPress: Beitrag öffnen, darin arbeiten, Meta-Boxen rechts, Liste separat.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="rounded-2xl" onClick={() => navigate("/admin/forum/threads")}>Zurück zur Liste</Button>
            <Button variant="outline" className="rounded-2xl" asChild>
              <Link to={threadPublicUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4" />
                Öffentliche Ansicht
              </Link>
            </Button>
            <Button
              variant="outline"
              className="rounded-2xl"
              disabled={!threadForm.id || duplicateThread.isPending}
              onClick={() => duplicateThread.mutate(threadForm)}
            >
              <Copy className="h-4 w-4" />
              Duplicate Thread
            </Button>
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-semibold text-slate-900">Auto-Entwurf</span>
            <span>{threadAutosaveAt ? `Zuletzt lokal gespeichert: ${formatDateTime(threadAutosaveAt)}` : "Noch kein lokaler Entwurf gespeichert."}</span>
            <span className="inline-flex items-center gap-2"><Link2 className="h-4 w-4" />{threadPublicUrl}</span>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.45fr_0.9fr]">
          <div className="space-y-6">
            <Card className="rounded-[28px] border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-black tracking-tight text-slate-950">Beitragsinhalt</CardTitle>
                <CardDescription>
                  Visual, HTML oder Split. Du kannst den Inhalt jetzt direkt als HTML hinterlegen, ohne alles in eine einzige Seite zu quetschen.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="thread-title">Titel</Label>
                  <Input
                    id="thread-title"
                    value={threadForm.title}
                    onChange={(event) =>
                      setThreadForm((prev) =>
                        prev
                          ? {
                              ...prev,
                              title: event.target.value,
                              slug: !isThreadSlugManual ? slugify(event.target.value) : prev.slug,
                            }
                          : prev,
                      )
                    }
                    className="rounded-2xl text-lg font-semibold"
                    placeholder="z. B. Webdesign Relaunch: Was bringt wirklich Anfragen?"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                  <div className="space-y-2">
                    <Label htmlFor="thread-slug">Slug / Permalink</Label>
                    <Input
                      id="thread-slug"
                      value={threadForm.slug}
                      onChange={(event) => {
                        setIsThreadSlugManual(true);
                        setThreadForm((prev) => (prev ? { ...prev, slug: slugify(event.target.value) } : prev));
                      }}
                      className="rounded-2xl"
                      placeholder="thread-slug"
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-2xl"
                      onClick={() => {
                        setIsThreadSlugManual(false);
                        setThreadForm((prev) => (prev ? { ...prev, slug: slugify(prev.title) } : prev));
                      }}
                    >
                      Neu generieren
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 rounded-[24px] border border-slate-200 bg-slate-50 p-2">
                  {([
                    { key: "visual", label: "Visual" },
                    { key: "html", label: "HTML" },
                    { key: "split", label: "Split" },
                  ] as Array<{ key: ThreadEditorMode; label: string }>).map((mode) => (
                    <button
                      key={mode.key}
                      type="button"
                      onClick={() => setThreadEditorMode(mode.key)}
                      className={`rounded-2xl px-4 py-2 text-sm font-semibold transition-colors ${threadEditorMode === mode.key ? "bg-[#0E1F53] text-white" : "text-slate-600 hover:bg-white"}`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>

                {threadEditorMode === "visual" && (
                  <RichTextEditor
                    value={threadForm.raw_html_content}
                    onChange={(html) => setThreadForm((prev) => (prev ? { ...prev, raw_html_content: html } : prev))}
                    onImageUpload={(file) => uploadForumAsset(file, "editor")}
                  />
                )}

                {threadEditorMode === "html" && (
                  <Textarea
                    value={threadForm.raw_html_content}
                    onChange={(event) =>
                      setThreadForm((prev) => (prev ? { ...prev, raw_html_content: event.target.value } : prev))
                    }
                    className="min-h-[520px] rounded-[28px] font-mono text-sm"
                    placeholder="<h2>HTML-Inhalt</h2>"
                  />
                )}

                {threadEditorMode === "split" && (
                  <div className="grid gap-5 xl:grid-cols-2">
                    <RichTextEditor
                      value={threadForm.raw_html_content}
                      onChange={(html) => setThreadForm((prev) => (prev ? { ...prev, raw_html_content: html } : prev))}
                      onImageUpload={(file) => uploadForumAsset(file, "editor")}
                    />
                    <Textarea
                      value={threadForm.raw_html_content}
                      onChange={(event) =>
                        setThreadForm((prev) => (prev ? { ...prev, raw_html_content: event.target.value } : prev))
                      }
                      className="min-h-[520px] rounded-[28px] font-mono text-sm"
                      placeholder="<h2>HTML-Inhalt</h2>"
                    />
                  </div>
                )}

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="thread-admin-notes">Interne Redaktionsnotizen</Label>
                    <Textarea
                      id="thread-admin-notes"
                      value={threadForm.admin_notes}
                      onChange={(event) =>
                        setThreadForm((prev) => (prev ? { ...prev, admin_notes: event.target.value } : prev))
                      }
                      className="min-h-[160px] rounded-2xl"
                      placeholder="Interne Hinweise, Freigaben, Redaktionsstand …"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Live-Vorschau</Label>
                    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50">
                      {featuredPreview ? (
                        <img
                          src={featuredPreview}
                          alt={threadForm.featured_image_alt || threadForm.title || "Forum Preview"}
                          className="h-48 w-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : null}
                      <div className="space-y-3 p-5">
                        <div className="flex flex-wrap items-center gap-2">
                          <StatusBadgeChip status={threadForm.status} />
                          {threadForm.is_pinned && <Badge variant="outline" className="rounded-full border-[#FF4B2C]/30 text-[#FF4B2C]">Angepinnt</Badge>}
                          {threadForm.is_locked && <Badge variant="outline" className="rounded-full">Gesperrt</Badge>}
                        </div>
                        <h3 className="text-xl font-black tracking-tight text-slate-950">{threadForm.title || "Thread-Titel"}</h3>
                        <p className="text-sm text-slate-500">/{threadForm.slug || "thread-slug"}</p>
                        <p className="text-sm leading-7 text-slate-600">{excerptPreview}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="rounded-[28px] border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-black tracking-tight text-slate-950">Veröffentlichen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={threadForm.status}
                    onValueChange={(value) => setThreadForm((prev) => (prev ? { ...prev, status: value } : prev))}
                  >
                    <SelectTrigger className="rounded-2xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">draft</SelectItem>
                      <SelectItem value="published">published</SelectItem>
                      <SelectItem value="scheduled">scheduled</SelectItem>
                      <SelectItem value="archived">archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="thread-scheduled">Geplante Veröffentlichung</Label>
                  <div className="relative">
                    <CalendarClock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="thread-scheduled"
                      type="datetime-local"
                      value={threadForm.scheduled_publish_at}
                      onChange={(event) =>
                        setThreadForm((prev) => (prev ? { ...prev, scheduled_publish_at: event.target.value } : prev))
                      }
                      className="rounded-2xl pl-10"
                    />
                  </div>
                  <p className="text-xs leading-6 text-slate-500">
                    Bei Status <strong>scheduled</strong> wird der Beitrag zum gewählten Zeitpunkt öffentlich sichtbar.
                  </p>
                </div>

                <div className="grid gap-3">
                  {([
                    { key: "is_active", label: "Öffentlich aktiv" },
                    { key: "is_pinned", label: "Angepinnt" },
                    { key: "is_locked", label: "Gesperrt" },
                    { key: "is_answered", label: "Beantwortet" },
                  ] as Array<{ key: ThreadBooleanKey; label: string }>).map((item) => (
                    <div key={item.key} className="flex items-center justify-between rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3">
                      <Label htmlFor={item.key} className="text-sm font-semibold text-slate-800">{item.label}</Label>
                      <Switch
                        id={item.key}
                        checked={Boolean(threadForm[item.key])}
                        onCheckedChange={(checked) =>
                          setThreadForm((prev) => (prev ? { ...prev, [item.key]: checked } : prev))
                        }
                      />
                    </div>
                  ))}
                </div>

                <div className="grid gap-3">
                  <Button
                    className="rounded-2xl bg-[#0E1F53] text-white hover:bg-[#16306d]"
                    disabled={saveThread.isPending}
                    onClick={() => saveThread.mutate(threadForm)}
                  >
                    <Save className="h-4 w-4" />
                    {saveThread.isPending ? "Speichert…" : threadForm.id ? "Beitrag aktualisieren" : "Beitrag speichern"}
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-2xl"
                    disabled={!threadForm.id || duplicateThread.isPending}
                    onClick={() => duplicateThread.mutate(threadForm)}
                  >
                    <Copy className="h-4 w-4" />
                    Duplicate Thread
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-2xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    disabled={!threadForm.id || deleteThread.isPending}
                    onClick={() => threadForm.id && setDeleteThreadTargetId(threadForm.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Thread löschen
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[28px] border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-black tracking-tight text-slate-950">Meta-Boxen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Kategorie</Label>
                  <Select
                    value={threadForm.category_id}
                    onValueChange={(value) => setThreadForm((prev) => (prev ? { ...prev, category_id: value } : prev))}
                  >
                    <SelectTrigger className="rounded-2xl"><SelectValue placeholder="Kategorie wählen" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Ohne Kategorie</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="thread-author">Autor</Label>
                  <Input
                    id="thread-author"
                    value={threadForm.author_name}
                    onChange={(event) =>
                      setThreadForm((prev) => (prev ? { ...prev, author_name: event.target.value } : prev))
                    }
                    className="rounded-2xl"
                    placeholder="Digital-Perfect Redaktion"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="featured-upload">Beitragsbild</Label>
                  <div className="flex flex-wrap gap-3">
                    <label htmlFor="featured-upload">
                      <Button type="button" asChild className="rounded-2xl bg-[#FF4B2C] text-white hover:bg-[#e64124]">
                        <span>
                          <Upload className="h-4 w-4" />
                          {isUploadingFeatured ? "Upload läuft…" : "Bild hochladen"}
                        </span>
                      </Button>
                    </label>
                    {threadForm.featured_image_url && (
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-2xl"
                        onClick={() => setThreadForm((prev) => (prev ? { ...prev, featured_image_url: "", featured_image_alt: "" } : prev))}
                      >
                        <Trash2 className="h-4 w-4" />
                        Entfernen
                      </Button>
                    )}
                  </div>
                  <input
                    id="featured-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleFeaturedUpload}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="featured-url">Bild-URL</Label>
                  <Input
                    id="featured-url"
                    value={threadForm.featured_image_url}
                    onChange={(event) =>
                      setThreadForm((prev) => (prev ? { ...prev, featured_image_url: event.target.value } : prev))
                    }
                    className="rounded-2xl"
                    placeholder="/render/image/public/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="featured-alt">Alt-Text</Label>
                  <Input
                    id="featured-alt"
                    value={threadForm.featured_image_alt}
                    onChange={(event) =>
                      setThreadForm((prev) => (prev ? { ...prev, featured_image_alt: event.target.value } : prev))
                    }
                    className="rounded-2xl"
                    placeholder="Beschreibender Alt-Text"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[28px] border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-black tracking-tight text-slate-950">SEO-Snippet Live-Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="thread-seo-title">SEO Title</Label>
                  <Input
                    id="thread-seo-title"
                    value={threadForm.seo_title}
                    onChange={(event) =>
                      setThreadForm((prev) => (prev ? { ...prev, seo_title: event.target.value } : prev))
                    }
                    className="rounded-2xl"
                    placeholder="Max. ~60 Zeichen"
                  />
                  <p className="text-xs text-slate-500">{threadForm.seo_title.length}/60 Zeichen</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="thread-seo-description">SEO Description</Label>
                  <Textarea
                    id="thread-seo-description"
                    value={threadForm.seo_description}
                    onChange={(event) =>
                      setThreadForm((prev) => (prev ? { ...prev, seo_description: event.target.value } : prev))
                    }
                    className="min-h-[120px] rounded-2xl"
                    placeholder="Max. ~155 Zeichen"
                  />
                  <p className="text-xs text-slate-500">{threadForm.seo_description.length}/155 Zeichen</p>
                </div>
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                  <p className="truncate text-sm text-emerald-700">digital-perfect.com{threadPublicUrl}</p>
                  <p className="mt-2 text-lg font-semibold leading-7 text-blue-700">{seoTitlePreview}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{seoDescriptionPreview}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[28px] border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-black tracking-tight text-slate-950">CTA / Werbe-Box</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3">
                  <Label htmlFor="thread-show-ad" className="text-sm font-semibold text-slate-800">CTA aktiv</Label>
                  <Switch
                    id="thread-show-ad"
                    checked={threadForm.show_ad}
                    onCheckedChange={(checked) => setThreadForm((prev) => (prev ? { ...prev, show_ad: checked } : prev))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>CTA Typ</Label>
                  <Select
                    value={threadForm.ad_type}
                    onValueChange={(value) => setThreadForm((prev) => (prev ? { ...prev, ad_type: value } : prev))}
                  >
                    <SelectTrigger className="rounded-2xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="image">Image CTA</SelectItem>
                      <SelectItem value="html">Custom HTML</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="thread-cta-image">CTA Bild</Label>
                  <Input
                    id="thread-cta-image"
                    value={threadForm.ad_image_url}
                    onChange={(event) =>
                      setThreadForm((prev) => (prev ? { ...prev, ad_image_url: event.target.value } : prev))
                    }
                    className="rounded-2xl"
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="thread-cta-link">CTA Link</Label>
                  <Input
                    id="thread-cta-link"
                    value={threadForm.ad_link_url}
                    onChange={(event) =>
                      setThreadForm((prev) => (prev ? { ...prev, ad_link_url: event.target.value } : prev))
                    }
                    className="rounded-2xl"
                    placeholder="/kontakt oder https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="thread-cta-text">CTA Text</Label>
                  <Input
                    id="thread-cta-text"
                    value={threadForm.ad_cta_text}
                    onChange={(event) =>
                      setThreadForm((prev) => (prev ? { ...prev, ad_cta_text: event.target.value } : prev))
                    }
                    className="rounded-2xl"
                    placeholder="Jetzt anfragen"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="thread-cta-html">Custom HTML</Label>
                  <Textarea
                    id="thread-cta-html"
                    value={threadForm.ad_html_code}
                    onChange={(event) =>
                      setThreadForm((prev) => (prev ? { ...prev, ad_html_code: event.target.value } : prev))
                    }
                    className="min-h-[120px] rounded-2xl font-mono text-xs"
                    placeholder="<div class='cta-box'>...</div>"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  const renderCategoriesList = () => (
    <Card className="rounded-[28px] border-slate-200 bg-white shadow-sm">
      <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <CardTitle className="text-2xl font-black tracking-tight text-slate-950">Kategorien</CardTitle>
          <CardDescription className="mt-2 text-sm leading-7 text-slate-500">
            Struktur separat verwalten, dann gezielt in die Kategorie springen — wie im WP-Backend.
          </CardDescription>
        </div>
        <Button className="rounded-2xl bg-[#FF4B2C] text-white hover:bg-[#e64124]" onClick={() => navigate("/admin/forum/categories/new")}>
          <FolderPlus className="h-4 w-4" />
          Neue Kategorie
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative max-w-lg">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={categorySearch}
            onChange={(event) => setCategorySearch(event.target.value)}
            className="rounded-2xl pl-10"
            placeholder="Kategorie durchsuchen"
          />
        </div>
        <div className="overflow-hidden rounded-[24px] border border-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.14em] text-slate-500">
                <tr>
                  <th className="px-4 py-3">Kategorie</th>
                  <th className="px-4 py-3">Slug</th>
                  <th className="px-4 py-3">Threads</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Sortierung</th>
                  <th className="px-4 py-3 text-right">Aktionen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {categoriesLoading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-slate-500">Kategorien werden geladen…</td>
                  </tr>
                ) : filteredCategories.length ? (
                  filteredCategories.map((category) => (
                    <tr key={category.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          className="text-left font-bold text-slate-950 transition-colors hover:text-[#0E1F53]"
                          onClick={() => navigate(`/admin/forum/categories/${category.id}`)}
                        >
                          {category.name}
                        </button>
                        <p className="mt-1 text-sm text-slate-500">{category.description || "Keine Beschreibung hinterlegt."}</p>
                      </td>
                      <td className="px-4 py-4 text-slate-600">/{category.slug}</td>
                      <td className="px-4 py-4 text-slate-600">{categoryThreadCounts.get(category.id) || 0}</td>
                      <td className="px-4 py-4">
                        {category.is_active ? <Badge className="rounded-full bg-emerald-100 text-emerald-700">Aktiv</Badge> : <Badge variant="outline" className="rounded-full">Inaktiv</Badge>}
                      </td>
                      <td className="px-4 py-4 text-slate-600">{category.sort_order}</td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button variant="outline" size="sm" className="rounded-xl" onClick={() => navigate(`/admin/forum/categories/${category.id}`)}>
                            <PencilLine className="h-4 w-4" />
                            Bearbeiten
                          </Button>
                          <Button variant="outline" size="sm" className="rounded-xl" asChild>
                            <Link to={`/forum/kategorie/${category.slug}`} target="_blank" rel="noreferrer">
                              <Eye className="h-4 w-4" />
                              Live
                            </Link>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-slate-500">Keine Kategorien gefunden.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderCategoryEditor = () => {
    if (!categoryForm) {
      return (
        <Card className="rounded-[28px] border-slate-200 bg-white shadow-sm">
          <CardContent className="p-8 text-slate-500">Kategorie wird vorbereitet…</CardContent>
        </Card>
      );
    }

    const currentCategoryThreadCount = categoryForm.id ? categoryThreadCounts.get(categoryForm.id) || 0 : 0;

    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <button type="button" className="hover:text-[#0E1F53]" onClick={() => navigate("/admin/forum/categories")}>Kategorien</button>
              <span>/</span>
              <span>{categoryForm.id ? "Kategorie bearbeiten" : "Neue Kategorie"}</span>
            </div>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
              {categoryForm.id ? "Kategorie bearbeiten" : "Neue Kategorie anlegen"}
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="rounded-2xl" onClick={() => navigate("/admin/forum/categories")}>Zurück zur Liste</Button>
            <Button variant="outline" className="rounded-2xl" asChild>
              <Link to={categoryPublicUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4" />
                Kategorie live
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
          <Card className="rounded-[28px] border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-black tracking-tight text-slate-950">Kategoriedaten</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category-name">Name</Label>
                  <Input
                    id="category-name"
                    value={categoryForm.name}
                    onChange={(event) =>
                      setCategoryForm((prev) =>
                        prev
                          ? {
                              ...prev,
                              name: event.target.value,
                              slug: !isCategorySlugManual ? slugify(event.target.value) : prev.slug,
                            }
                          : prev,
                      )
                    }
                    className="rounded-2xl"
                    placeholder="z. B. SEO Strategie"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category-slug">Slug</Label>
                  <Input
                    id="category-slug"
                    value={categoryForm.slug}
                    onChange={(event) => {
                      setIsCategorySlugManual(true);
                      setCategoryForm((prev) => (prev ? { ...prev, slug: slugify(event.target.value) } : prev));
                    }}
                    className="rounded-2xl"
                    placeholder="seo-strategie"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="category-description">Beschreibung</Label>
                  <Textarea
                    id="category-description"
                    value={categoryForm.description}
                    onChange={(event) =>
                      setCategoryForm((prev) => (prev ? { ...prev, description: event.target.value } : prev))
                    }
                    className="min-h-[150px] rounded-2xl"
                    placeholder="Kurzer Kategorietext für Übersicht und Sidebar."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category-seo-title">SEO Title</Label>
                  <Input
                    id="category-seo-title"
                    value={categoryForm.seo_title}
                    onChange={(event) =>
                      setCategoryForm((prev) => (prev ? { ...prev, seo_title: event.target.value } : prev))
                    }
                    className="rounded-2xl"
                    placeholder="Max. ~60 Zeichen"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category-seo-description">SEO Description</Label>
                  <Textarea
                    id="category-seo-description"
                    value={categoryForm.seo_description}
                    onChange={(event) =>
                      setCategoryForm((prev) => (prev ? { ...prev, seo_description: event.target.value } : prev))
                    }
                    className="min-h-[120px] rounded-2xl"
                    placeholder="Max. ~155 Zeichen"
                  />
                </div>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Promo / Sidebar-Box</p>
                    <p className="mt-1 text-xs leading-6 text-slate-500">Mehr Felder wie in WordPress, damit Kategorien nicht leer wirken.</p>
                  </div>
                  <Switch
                    checked={categoryForm.ad_enabled}
                    onCheckedChange={(checked) => setCategoryForm((prev) => (prev ? { ...prev, ad_enabled: checked } : prev))}
                  />
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <Input
                    value={categoryForm.ad_headline}
                    onChange={(event) => setCategoryForm((prev) => (prev ? { ...prev, ad_headline: event.target.value } : prev))}
                    className="rounded-2xl"
                    placeholder="Promo Headline"
                  />
                  <Input
                    value={categoryForm.ad_subheadline}
                    onChange={(event) => setCategoryForm((prev) => (prev ? { ...prev, ad_subheadline: event.target.value } : prev))}
                    className="rounded-2xl"
                    placeholder="Promo Subheadline"
                  />
                  <Input
                    value={categoryForm.ad_cta_text}
                    onChange={(event) => setCategoryForm((prev) => (prev ? { ...prev, ad_cta_text: event.target.value } : prev))}
                    className="rounded-2xl"
                    placeholder="CTA Text"
                  />
                  <Input
                    value={categoryForm.ad_link_url}
                    onChange={(event) => setCategoryForm((prev) => (prev ? { ...prev, ad_link_url: event.target.value } : prev))}
                    className="rounded-2xl"
                    placeholder="CTA Link"
                  />
                  <Input
                    value={categoryForm.ad_image_url}
                    onChange={(event) => setCategoryForm((prev) => (prev ? { ...prev, ad_image_url: event.target.value } : prev))}
                    className="rounded-2xl md:col-span-2"
                    placeholder="Promo Bild URL"
                  />
                  <Textarea
                    value={categoryForm.ad_html_code}
                    onChange={(event) => setCategoryForm((prev) => (prev ? { ...prev, ad_html_code: event.target.value } : prev))}
                    className="min-h-[140px] rounded-2xl font-mono text-xs md:col-span-2"
                    placeholder="Custom HTML"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="rounded-[28px] border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-black tracking-tight text-slate-950">Veröffentlichen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category-sort-order">Sortierung</Label>
                  <Input
                    id="category-sort-order"
                    type="number"
                    value={categoryForm.sort_order}
                    onChange={(event) =>
                      setCategoryForm((prev) => (prev ? { ...prev, sort_order: Number(event.target.value || 0) } : prev))
                    }
                    className="rounded-2xl"
                  />
                </div>
                <div className="flex items-center justify-between rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3">
                  <Label htmlFor="category-active" className="text-sm font-semibold text-slate-800">Öffentlich aktiv</Label>
                  <Switch
                    id="category-active"
                    checked={categoryForm.is_active}
                    onCheckedChange={(checked) => setCategoryForm((prev) => (prev ? { ...prev, is_active: checked } : prev))}
                  />
                </div>
                <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  Threads in dieser Kategorie: <span className="font-bold text-slate-900">{currentCategoryThreadCount}</span>
                </div>
                <div className="grid gap-3">
                  <Button
                    className="rounded-2xl bg-[#0E1F53] text-white hover:bg-[#16306d]"
                    disabled={saveCategory.isPending}
                    onClick={() => saveCategory.mutate(categoryForm)}
                  >
                    <Save className="h-4 w-4" />
                    {saveCategory.isPending ? "Speichert…" : categoryForm.id ? "Kategorie aktualisieren" : "Kategorie speichern"}
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-2xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    disabled={!categoryForm.id || deleteCategory.isPending}
                    onClick={() => categoryForm.id && setDeleteCategoryTargetId(categoryForm.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Kategorie löschen
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  const renderModeration = () => (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.95fr]">
      <Card className="rounded-[28px] border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-black tracking-tight text-slate-950">Moderation</CardTitle>
          <CardDescription className="mt-2 text-sm leading-7 text-slate-500">
            Antworten filtern, prüfen und direkt freischalten, deaktivieren oder als Spam markieren.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 lg:grid-cols-[1.3fr_0.75fr_0.75fr_0.9fr]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input value={replySearch} onChange={(event) => setReplySearch(event.target.value)} className="rounded-2xl pl-10" placeholder="Antworten durchsuchen" />
            </div>
            <Select value={replyStatusFilter} onValueChange={(value) => setReplyStatusFilter(value as "all" | "active" | "inactive")}> 
              <SelectTrigger className="rounded-2xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Stati</SelectItem>
                <SelectItem value="active">Aktiv</SelectItem>
                <SelectItem value="inactive">Inaktiv</SelectItem>
              </SelectContent>
            </Select>
            <Select value={replySpamFilter} onValueChange={(value) => setReplySpamFilter(value as "all" | "clean" | "spam")}> 
              <SelectTrigger className="rounded-2xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Spam-Flags</SelectItem>
                <SelectItem value="clean">Nur Clean</SelectItem>
                <SelectItem value="spam">Nur Spam</SelectItem>
              </SelectContent>
            </Select>
            <Select value={replyThreadFilter} onValueChange={setReplyThreadFilter}>
              <SelectTrigger className="rounded-2xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Threads</SelectItem>
                {threads.map((thread) => (
                  <SelectItem key={thread.id} value={thread.id}>{thread.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            {repliesLoading ? (
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6 text-slate-500">Replies werden geladen…</div>
            ) : filteredReplies.length ? (
              filteredReplies.map((reply) => (
                <button
                  key={reply.id}
                  type="button"
                  onClick={() => setSelectedReplyId(reply.id)}
                  className={`w-full rounded-[24px] border p-4 text-left transition-colors ${selectedReply?.id === reply.id ? "border-[#0E1F53] bg-[#0E1F53]/5" : "border-slate-200 bg-white hover:border-slate-300"}`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    {reply.is_spam ? <Badge variant="outline" className="rounded-full border-red-300 text-red-600">Spam</Badge> : <Badge variant="outline" className="rounded-full">Clean</Badge>}
                    {!reply.is_active && <Badge variant="outline" className="rounded-full border-slate-300 text-slate-500">Inaktiv</Badge>}
                  </div>
                  <p className="mt-3 font-semibold text-slate-900">{reply.author_name || "Unbekannt"}</p>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{reply.content}</p>
                  <p className="mt-2 text-xs text-slate-500">{reply.thread?.title || "Thread nicht gefunden"} · {formatDateTime(reply.created_at)}</p>
                </button>
              ))
            ) : (
              <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 p-6 text-sm leading-7 text-slate-500">Keine Replies für diese Filter gefunden.</div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[28px] border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-black tracking-tight text-slate-950">Moderations-Detail</CardTitle>
          <CardDescription className="mt-2 text-sm leading-7 text-slate-500">Prüfen, freigeben, sperren oder den Ursprungsthread direkt öffnen.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {!selectedReply ? (
            <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 p-6 text-sm leading-7 text-slate-500">Wähle links eine Antwort aus.</div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2">
                {selectedReply.is_spam ? (
                  <Badge variant="outline" className="rounded-full border-red-300 text-red-600">Spam</Badge>
                ) : (
                  <Badge variant="outline" className="rounded-full border-emerald-200 text-emerald-700">Clean</Badge>
                )}
                {selectedReply.is_active ? (
                  <Badge variant="outline" className="rounded-full border-emerald-200 text-emerald-700">Aktiv</Badge>
                ) : (
                  <Badge variant="outline" className="rounded-full">Inaktiv</Badge>
                )}
              </div>
              <div>
                <p className="text-sm text-slate-500">Autor</p>
                <p className="mt-1 text-lg font-bold text-slate-950">{selectedReply.author_name || "Unbekannt"}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Thread</p>
                <p className="mt-1 text-base font-semibold text-slate-900">{selectedReply.thread?.title || "Thread nicht gefunden"}</p>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700">
                {selectedReply.content}
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  className="rounded-2xl"
                  onClick={() =>
                    updateReplyModeration.mutate({
                      replyId: selectedReply.id,
                      patch: { is_active: !selectedReply.is_active },
                      successMessage: selectedReply.is_active ? "Reply deaktiviert." : "Reply aktiviert.",
                    })
                  }
                >
                  {selectedReply.is_active ? <ShieldAlert className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                  {selectedReply.is_active ? "Deaktivieren" : "Aktivieren"}
                </Button>
                <Button
                  variant="outline"
                  className="rounded-2xl"
                  onClick={() =>
                    updateReplyModeration.mutate({
                      replyId: selectedReply.id,
                      patch: { is_spam: !selectedReply.is_spam },
                      successMessage: selectedReply.is_spam ? "Spam-Flag entfernt." : "Als Spam markiert.",
                    })
                  }
                >
                  <MessageSquareWarning className="h-4 w-4" />
                  {selectedReply.is_spam ? "Spam entfernen" : "Als Spam markieren"}
                </Button>
                {selectedReply.thread?.id && (
                  <Button variant="outline" className="rounded-2xl" onClick={() => navigate(`/admin/forum/threads/${selectedReply.thread?.id}`)}>
                    <PencilLine className="h-4 w-4" />
                    Thread öffnen
                  </Button>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="p-6 md:p-10">
      <div className="mx-auto max-w-[1600px] space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#FF4B2C]">Forum Control Center</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">Redaktion, Struktur & Moderation</h1>
            <p className="mt-3 max-w-4xl text-base leading-8 text-slate-600">
              Jetzt im WordPress-Stil aufgebaut: Listenansicht separat, Bearbeitung im eigenen Beitrag, dazu HTML-Modus,
              Auto-Entwurf, geplante Veröffentlichung, Duplicate-Thread, Bulk-Actions und SEO-Snippet-Live-Preview.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="rounded-2xl" onClick={() => navigate("/admin/forum/moderation")}>
              <ShieldAlert className="h-4 w-4" />
              Moderation
            </Button>
            <Button className="rounded-2xl bg-[#0E1F53] text-white hover:bg-[#16306d]" onClick={() => navigate("/admin/forum/threads/new")}>
              <FilePlus2 className="h-4 w-4" />
              Neuer Thread
            </Button>
            <Button className="rounded-2xl bg-[#FF4B2C] text-white hover:bg-[#e64124]" onClick={() => navigate("/admin/forum/categories/new")}>
              <FolderPlus className="h-4 w-4" />
              Neue Kategorie
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          {stats.map((item) => (
            <Card key={item.label} className="rounded-[28px] border-slate-200 bg-white shadow-sm">
              <CardContent className="p-6">
                <p className="text-sm font-medium text-slate-500">{item.label}</p>
                <p className="mt-3 text-4xl font-black tracking-tight text-slate-950">{item.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 rounded-[24px] border border-slate-200 bg-white p-2 shadow-sm">
          {[
            { key: "threads", label: "Threads", to: "/admin/forum/threads" },
            { key: "categories", label: "Kategorien", to: "/admin/forum/categories" },
            { key: "moderation", label: "Moderation", to: "/admin/forum/moderation" },
          ].map((item) => {
            const isActive = forumView.section === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => navigate(item.to)}
                className={`rounded-[18px] px-5 py-3 text-sm font-semibold transition-colors ${isActive ? "bg-[#0E1F53] text-white" : "text-slate-600 hover:bg-slate-50"}`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {forumView.section === "threads" && forumView.mode === "list" && renderThreadsList()}
        {forumView.section === "threads" && forumView.mode !== "list" && renderThreadEditor()}
        {forumView.section === "categories" && forumView.mode === "list" && renderCategoriesList()}
        {forumView.section === "categories" && forumView.mode !== "list" && renderCategoryEditor()}
        {forumView.section === "moderation" && renderModeration()}
      </div>

      <ConfirmDeleteDialog
        open={Boolean(deleteThreadTargetId)}
        onOpenChange={(open) => !open && setDeleteThreadTargetId(null)}
        title="Thread löschen?"
        description={deleteThreadTargetId ? `Der Thread ${deleteThreadTargetId.slice(0, 8)}… wird aus Supabase entfernt.` : ""}
        onConfirm={() => deleteThreadTargetId && deleteThread.mutate(deleteThreadTargetId)}
        isLoading={deleteThread.isPending}
      />

      <ConfirmDeleteDialog
        open={Boolean(deleteCategoryTargetId)}
        onOpenChange={(open) => !open && setDeleteCategoryTargetId(null)}
        title="Kategorie löschen?"
        description={deleteCategoryTargetId ? `Die Kategorie ${deleteCategoryTargetId.slice(0, 8)}… wird aus Supabase entfernt.` : ""}
        onConfirm={() => deleteCategoryTargetId && deleteCategory.mutate(deleteCategoryTargetId)}
        isLoading={deleteCategory.isPending}
      />

      <ConfirmDeleteDialog
        open={confirmBulkDelete}
        onOpenChange={setConfirmBulkDelete}
        title="Ausgewählte Threads löschen?"
        description={`Es werden ${selectedThreadIds.length} Threads dauerhaft gelöscht.`}
        onConfirm={() => bulkThreadActionMutation.mutate({ action: "delete", ids: selectedThreadIds })}
        isLoading={bulkThreadActionMutation.isPending}
      />
    </div>
  );
};

export default AdminForum;
