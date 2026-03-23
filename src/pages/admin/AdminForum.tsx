import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BadgeCheck,
  Eye,
  FolderPlus,
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
  Trash2,
  Upload,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/useAuth";
import { useSiteModules } from "@/hooks/useSiteModules";
import { useSiteContext } from "@/context/SiteContext";
import { DEFAULT_SITE_ID } from "@/lib/site";
import { buildSiteAssetPath } from "@/lib/storage";
import { buildRawImageUrl } from "@/lib/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

type ForumCategoryRow = Database["public"]["Tables"]["forum_categories"]["Row"];
type ForumCategoryInsert = Database["public"]["Tables"]["forum_categories"]["Insert"];
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
  admin_notes: string;
};

type ThreadBooleanKey = "is_active" | "is_pinned" | "is_locked" | "is_answered";

type EnrichedReply = ForumReplyRow & {
  thread?: ForumThreadRow | null;
};

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
    : "";

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

const createEmptyCategory = (nextSortOrder: number): CategoryFormState => ({
  name: "",
  slug: "",
  description: "",
  sort_order: nextSortOrder,
  is_active: true,
  seo_title: "",
  seo_description: "",
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
  status: "published",
  admin_notes: "",
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
  status: thread.status || "published",
  admin_notes: thread.admin_notes || "",
});

const getSafeImageUrl = (value: string, width = 1200, quality = 84) => {
  if (!value.trim()) return "";
  return buildRawImageUrl(value);
};

const AdminForum = () => {
  const qc = useQueryClient();
  const { user, isGlobalAdmin } = useAuth();
  const { activeSiteId } = useSiteContext();
  const siteId = activeSiteId || DEFAULT_SITE_ID;
  const { hasForum, isLoading: modulesLoading } = useSiteModules();

  const [activeTab, setActiveTab] = useState("threads");
  const [categoryForm, setCategoryForm] = useState<CategoryFormState | null>(null);
  const [threadForm, setThreadForm] = useState<ThreadFormState | null>(null);
  const [isCategorySlugManual, setIsCategorySlugManual] = useState(false);
  const [isThreadSlugManual, setIsThreadSlugManual] = useState(false);
  const [isUploadingFeatured, setIsUploadingFeatured] = useState(false);

  const [replyStatusFilter, setReplyStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [replySpamFilter, setReplySpamFilter] = useState<"all" | "clean" | "spam">("all");
  const [replyThreadFilter, setReplyThreadFilter] = useState<string>("all");
  const [replySearch, setReplySearch] = useState("");
  const [selectedReplyId, setSelectedReplyId] = useState<string | null>(null);

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

  const threadMap = useMemo(
    () => new Map(threads.map((thread) => [thread.id, thread])),
    [threads],
  );

  const categoryThreadCounts = useMemo(() => {
    const counts = new Map<string, number>();
    threads.forEach((thread) => {
      if (!thread.category_id) return;
      counts.set(thread.category_id, (counts.get(thread.category_id) || 0) + 1);
    });
    return counts;
  }, [threads]);

  const moderationStats = useMemo(() => {
    const spamReplies = replies.filter((reply) => reply.is_spam).length;
    const inactiveReplies = replies.filter((reply) => !reply.is_active).length;
    const lockedThreads = threads.filter((thread) => thread.is_locked).length;

    return {
      replies: replies.length,
      spamReplies,
      inactiveReplies,
      lockedThreads,
    };
  }, [replies, threads]);

  const nextCategorySortOrder = useMemo(() => {
    if (!categories.length) return 0;
    return Math.max(...categories.map((category) => category.sort_order || 0)) + 1;
  }, [categories]);

  const featuredPreview = useMemo(
    () => (threadForm?.featured_image_url ? getSafeImageUrl(threadForm.featured_image_url, 1280, 84) : ""),
    [threadForm?.featured_image_url],
  );

  const excerptPreview = useMemo(() => {
    const plainText = stripHtml(threadForm?.raw_html_content || "");
    if (!plainText) return "Noch kein Inhalt hinterlegt.";
    return plainText.slice(0, 220);
  }, [threadForm?.raw_html_content]);

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

      const haystack = [
        reply.author_name || "",
        reply.content || "",
        reply.thread?.title || "",
        reply.thread?.slug || "",
      ]
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
    if (!categoryForm && !categoriesLoading) {
      setCategoryForm(createEmptyCategory(nextCategorySortOrder));
    }
  }, [categoryForm, categoriesLoading, nextCategorySortOrder]);

  useEffect(() => {
    if (!threadForm && !threadsLoading) {
      setThreadForm(createEmptyThread(user, categories[0]?.id));
    }
  }, [threadForm, threadsLoading, user, categories]);

  useEffect(() => {
    if (!filteredReplies.length) {
      setSelectedReplyId(null);
      return;
    }

    if (!selectedReplyId || !filteredReplies.some((reply) => reply.id === selectedReplyId)) {
      setSelectedReplyId(filteredReplies[0].id);
    }
  }, [filteredReplies, selectedReplyId]);

  const openNewCategoryForm = () => {
    setCategoryForm(createEmptyCategory(nextCategorySortOrder));
    setIsCategorySlugManual(false);
    setActiveTab("categories");
  };

  const openCategoryEditor = (category: ForumCategoryRow) => {
    setCategoryForm(toCategoryFormState(category));
    setIsCategorySlugManual(true);
    setActiveTab("categories");
  };

  const openNewThreadForm = () => {
    setThreadForm(createEmptyThread(user, categories[0]?.id));
    setIsThreadSlugManual(false);
    setActiveTab("threads");
  };

  const openThreadEditor = (thread: ForumThreadRow) => {
    setThreadForm(toThreadFormState(thread, user));
    setIsThreadSlugManual(true);
    setActiveTab("threads");
  };

  const resetCategoryForm = () => {
    setCategoryForm(createEmptyCategory(nextCategorySortOrder));
    setIsCategorySlugManual(false);
  };

  const resetThreadForm = () => {
    setThreadForm(createEmptyThread(user, categories[0]?.id));
    setIsThreadSlugManual(false);
  };

  const setThreadBooleanField = (key: ThreadBooleanKey, checked: boolean) => {
    setThreadForm((prev) => (prev ? { ...prev, [key]: checked } : prev));
  };

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
      const payload: ForumCategoryInsert = {
        site_id: siteId,
        name: values.name.trim(),
        slug: slugify(values.slug || values.name),
        description: values.description.trim() || null,
        sort_order: Number.isFinite(Number(values.sort_order)) ? Number(values.sort_order) : 0,
        is_active: values.is_active,
        seo_title: values.seo_title.trim() || null,
        seo_description: values.seo_description.trim() || null,
      };

      if (!payload.name) throw new Error("Bitte einen Kategorienamen angeben.");
      if (!payload.slug) throw new Error("Bitte einen gültigen Slug angeben.");

      if (values.id) {
        const { error } = await supabase.from("forum_categories").update(payload).eq("id", values.id);
        if (error) throw error;
        return;
      }

      const { error } = await supabase.from("forum_categories").insert(payload);
      if (error) throw error;
    },
    onSuccess: async () => {
      await invalidateForumQueries();
      toast.success("Kategorie gespeichert.");
      resetCategoryForm();
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
      toast.success("Kategorie gelöscht.");
      resetCategoryForm();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Kategorie konnte nicht gelöscht werden.");
    },
  });

  const saveThread = useMutation({
    mutationFn: async (values: ThreadFormState) => {
      const rawHtml = values.raw_html_content.trim() || "<p></p>";
      const payload: ForumThreadInsert = {
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
        admin_notes: values.admin_notes.trim() || null,
      };

      if (!payload.title) throw new Error("Bitte einen Thread-Titel angeben.");
      if (!payload.slug) throw new Error("Bitte einen gültigen Slug angeben.");
      if (!payload.content) throw new Error("Bitte echten Beitragsinhalt im Editor hinterlegen.");

      if (values.id) {
        const { error } = await supabase.from("forum_threads").update(payload).eq("id", values.id);
        if (error) throw error;
        return;
      }

      const { error } = await supabase.from("forum_threads").insert(payload);
      if (error) throw error;
    },
    onSuccess: async () => {
      await invalidateForumQueries();
      toast.success("Thread gespeichert.");
      resetThreadForm();
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
    onSuccess: async () => {
      await invalidateForumQueries();
      toast.success("Thread gelöscht.");
      resetThreadForm();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Thread konnte nicht gelöscht werden.");
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

  const stats = useMemo(() => {
    const activeCategories = categories.filter((category) => category.is_active).length;
    const publishedThreads = threads.filter((thread) => thread.is_active && thread.status === "published").length;
    const lockedThreads = threads.filter((thread) => thread.is_locked).length;

    return [
      { label: "Aktive Kategorien", value: activeCategories },
      { label: "Publizierte Threads", value: publishedThreads },
      { label: "Gesperrte Threads", value: lockedThreads },
      { label: "Replies gesamt", value: moderationStats.replies },
      { label: "Spam-Replies", value: moderationStats.spamReplies },
      { label: "Inaktive Replies", value: moderationStats.inactiveReplies },
    ];
  }, [categories, moderationStats, threads]);

  const selectedThreadForReply = selectedReply?.thread || null;

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

  return (
    <div className="p-6 md:p-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#FF4B2C]">Forum Control Center</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">Redaktion, Struktur & Moderation</h1>
            <p className="mt-3 max-w-3xl text-base leading-8 text-slate-600">
              Kategorien, Threads und Community-Moderation laufen hier zentral zusammen — inklusive Spam-Flags, Aktiv-Status und Thread-Schnellaktionen.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={openNewThreadForm}
              className="rounded-2xl bg-[#0E1F53] px-5 py-6 text-white hover:bg-[#16306d]"
            >
              <MessageSquarePlus className="h-4 w-4" />
              Neuer Thread
            </Button>
            <Button
              onClick={openNewCategoryForm}
              className="rounded-2xl bg-[#FF4B2C] px-5 py-6 text-white hover:bg-[#e64124]"
            >
              <FolderPlus className="h-4 w-4" />
              Neue Kategorie
            </Button>
          </div>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          {stats.map((item) => (
            <Card key={item.label} className="rounded-[28px] border-slate-200 bg-white shadow-sm">
              <CardContent className="p-6">
                <p className="text-sm font-medium text-slate-500">{item.label}</p>
                <p className="mt-3 text-4xl font-black tracking-tight text-slate-950">{item.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="h-auto rounded-[24px] bg-white p-2 shadow-sm">
            <TabsTrigger
              value="threads"
              className="rounded-[18px] px-5 py-3 data-[state=active]:bg-[#0E1F53] data-[state=active]:text-white"
            >
              Threads
            </TabsTrigger>
            <TabsTrigger
              value="categories"
              className="rounded-[18px] px-5 py-3 data-[state=active]:bg-[#FF4B2C] data-[state=active]:text-white"
            >
              Kategorien
            </TabsTrigger>
            <TabsTrigger
              value="moderation"
              className="rounded-[18px] px-5 py-3 data-[state=active]:bg-slate-950 data-[state=active]:text-white"
            >
              Moderation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="threads" className="mt-0">
            <div className="grid gap-6 xl:grid-cols-[1.05fr_1.4fr]">
              <Card className="rounded-[32px] border-slate-200 bg-white shadow-sm">
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl font-black tracking-tight text-slate-950">Thread-Übersicht</CardTitle>
                    <CardDescription className="mt-2 text-sm leading-7 text-slate-500">
                      Redaktionelle Beiträge, Status, Live-Zugriff und Direkt-Aktionen für Sperren, Pinning und Veröffentlichungsstatus.
                    </CardDescription>
                  </div>
                  <Button variant="outline" className="rounded-xl" onClick={openNewThreadForm}>
                    <RefreshCw className="h-4 w-4" />
                    Neu
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {threadsLoading ? (
                    <p className="text-sm text-slate-500">Threads werden geladen…</p>
                  ) : threads.length ? (
                    threads.map((thread) => {
                      const category = thread.category_id ? categoryMap.get(thread.category_id) : null;
                      const quickPublishAction = thread.status === "published"
                        ? {
                            label: "Entpublishen",
                            patch: { status: "draft" },
                            successMessage: "Thread auf draft gesetzt.",
                          }
                        : {
                            label: "Publishen",
                            patch: { status: "published" },
                            successMessage: "Thread veröffentlicht.",
                          };

                      return (
                        <div key={thread.id} className="rounded-[24px] border border-slate-200 p-5 transition-colors hover:border-[#FF4B2C]/25">
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-600">
                                  {thread.status}
                                </span>
                                {thread.is_pinned && (
                                  <span className="rounded-full bg-[#FF4B2C]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#FF4B2C]">
                                    Angepinnt
                                  </span>
                                )}
                                {thread.is_locked && (
                                  <span className="rounded-full bg-slate-950/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-950">
                                    Gesperrt
                                  </span>
                                )}
                                {!thread.is_active && (
                                  <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-700">
                                    Inaktiv
                                  </span>
                                )}
                              </div>
                              <h3 className="mt-3 truncate text-xl font-black tracking-tight text-slate-950">
                                {thread.title}
                              </h3>
                              <p className="mt-2 text-sm text-slate-500">/{thread.slug}</p>
                              <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600">
                                {stripHtml(thread.raw_html_content || thread.content).slice(0, 160) || "Noch kein Inhalt."}
                              </p>
                              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                                <span>Kategorie: {category?.name || "Ohne Kategorie"}</span>
                                <span>Views: {thread.views}</span>
                                <span>Aktivität: {formatDateTime(thread.last_activity_at)}</span>
                              </div>

                              <div className="mt-4 flex flex-wrap gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="rounded-xl"
                                  onClick={() =>
                                    updateThreadQuickAction.mutate({
                                      threadId: thread.id,
                                      patch: { is_locked: !thread.is_locked },
                                      successMessage: thread.is_locked ? "Thread entsperrt." : "Thread gesperrt.",
                                    })
                                  }
                                >
                                  {thread.is_locked ? <LockOpen className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                                  {thread.is_locked ? "Entsperren" : "Sperren"}
                                </Button>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="rounded-xl"
                                  onClick={() =>
                                    updateThreadQuickAction.mutate({
                                      threadId: thread.id,
                                      patch: { is_pinned: !thread.is_pinned },
                                      successMessage: thread.is_pinned ? "Thread entpinnt." : "Thread angepinnt.",
                                    })
                                  }
                                >
                                  {thread.is_pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                                  {thread.is_pinned ? "Entpinnen" : "Pinnen"}
                                </Button>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="rounded-xl"
                                  onClick={() =>
                                    updateThreadQuickAction.mutate({
                                      threadId: thread.id,
                                      patch: { is_answered: !thread.is_answered },
                                      successMessage: thread.is_answered ? "Answer-Flag entfernt." : "Thread als beantwortet markiert.",
                                    })
                                  }
                                >
                                  {thread.is_answered ? <BadgeCheck className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                                  {thread.is_answered ? "Unanswered" : "Answered"}
                                </Button>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="rounded-xl"
                                  onClick={() =>
                                    updateThreadQuickAction.mutate({
                                      threadId: thread.id,
                                      patch: quickPublishAction.patch,
                                      successMessage: quickPublishAction.successMessage,
                                    })
                                  }
                                >
                                  <Eye className="h-4 w-4" />
                                  {quickPublishAction.label}
                                </Button>
                              </div>
                            </div>

                            <div className="flex shrink-0 flex-wrap gap-2">
                              <Button variant="outline" size="sm" className="rounded-xl" onClick={() => openThreadEditor(thread)}>
                                <PencilLine className="h-4 w-4" />
                                Bearbeiten
                              </Button>
                              <Button variant="outline" size="sm" className="rounded-xl" asChild>
                                <Link to={`/forum/${thread.slug}`} target="_blank" rel="noreferrer">
                                  <Eye className="h-4 w-4" />
                                  Live
                                </Link>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                onClick={() => deleteThread.mutate(thread.id)}
                                disabled={deleteThread.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                                Löschen
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 p-6 text-sm leading-7 text-slate-500">
                      Noch keine Threads vorhanden. Lege rechts deinen ersten redaktionellen Beitrag an.
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-[32px] border-slate-200 bg-white shadow-sm">
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl font-black tracking-tight text-slate-950">
                      {threadForm?.id ? "Thread bearbeiten" : "Neuen Thread anlegen"}
                    </CardTitle>
                    <CardDescription className="mt-2 text-sm leading-7 text-slate-500">
                      Das Feld <strong>raw_html_content</strong> wird über Tiptap redaktionell gepflegt. Bilder landen im forum-assets Bucket und laufen über die Render-API.
                    </CardDescription>
                  </div>
                  <Button variant="outline" className="rounded-xl" onClick={resetThreadForm}>
                    <RefreshCw className="h-4 w-4" />
                    Reset
                  </Button>
                </CardHeader>

                <CardContent className="space-y-8">
                  {!threadForm ? (
                    <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 p-6 text-sm leading-7 text-slate-500">
                      Wähle links einen Thread oder starte einen neuen Entwurf.
                    </div>
                  ) : (
                    <>
                      <div className="grid gap-5 md:grid-cols-2">
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
                            className="rounded-2xl"
                            placeholder="z. B. Webdesign Relaunch: Was bringt wirklich Anfragen?"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="thread-slug">Slug</Label>
                          <div className="flex gap-2">
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
                            <Button
                              type="button"
                              variant="outline"
                              className="rounded-2xl"
                              onClick={() => {
                                setIsThreadSlugManual(false);
                                setThreadForm((prev) => (prev ? { ...prev, slug: slugify(prev.title) } : prev));
                              }}
                            >
                              Neu
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Kategorie</Label>
                          <Select
                            value={threadForm.category_id}
                            onValueChange={(value) =>
                              setThreadForm((prev) => (prev ? { ...prev, category_id: value } : prev))
                            }
                          >
                            <SelectTrigger className="rounded-2xl">
                              <SelectValue placeholder="Kategorie wählen" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Ohne Kategorie</SelectItem>
                              {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Status</Label>
                          <Select
                            value={threadForm.status}
                            onValueChange={(value) =>
                              setThreadForm((prev) => (prev ? { ...prev, status: value } : prev))
                            }
                          >
                            <SelectTrigger className="rounded-2xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="published">published</SelectItem>
                              <SelectItem value="draft">draft</SelectItem>
                              <SelectItem value="archived">archived</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="thread-author">Autorenname</Label>
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
                      </div>

                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {([
                          { key: "is_active", label: "Aktiv" },
                          { key: "is_pinned", label: "Angepinnt" },
                          { key: "is_locked", label: "Gesperrt" },
                          { key: "is_answered", label: "Beantwortet" },
                        ] as Array<{ key: ThreadBooleanKey; label: string }>).map((item) => (
                          <div key={item.key} className="flex items-center justify-between rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4">
                            <Label htmlFor={item.key} className="text-sm font-semibold text-slate-800">
                              {item.label}
                            </Label>
                            <Switch
                              id={item.key}
                              checked={Boolean(threadForm[item.key as keyof ThreadFormState])}
                              onCheckedChange={(checked) => setThreadBooleanField(item.key, checked)}
                            />
                          </div>
                        ))}
                      </div>

                      <div className="grid gap-5 lg:grid-cols-[1.25fr_0.95fr]">
                        <div className="space-y-3">
                          <Label>Redaktioneller Inhalt</Label>
                          <RichTextEditor
                            value={threadForm.raw_html_content}
                            onChange={(html) =>
                              setThreadForm((prev) => (prev ? { ...prev, raw_html_content: html } : prev))
                            }
                            onImageUpload={(file) => uploadForumAsset(file, "editor")}
                          />
                        </div>

                        <div className="space-y-5">
                          <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-4">
                            <Label htmlFor="featured-upload" className="text-sm font-semibold text-slate-800">
                              Beitragsbild / Hero
                            </Label>
                            <div className="mt-3 flex flex-wrap gap-3">
                              <label htmlFor="featured-upload">
                                <Button
                                  type="button"
                                  asChild
                                  className="rounded-2xl bg-[#FF4B2C] text-white hover:bg-[#e64124]"
                                >
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
                                  onClick={() =>
                                    setThreadForm((prev) =>
                                      prev ? { ...prev, featured_image_url: "", featured_image_alt: "" } : prev,
                                    )
                                  }
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
                            <div className="mt-4 space-y-3">
                              <div className="space-y-2">
                                <Label htmlFor="featured-url">Gespeicherte Bild-URL</Label>
                                <Input
                                  id="featured-url"
                                  value={threadForm.featured_image_url}
                                  onChange={(event) =>
                                    setThreadForm((prev) =>
                                      prev ? { ...prev, featured_image_url: event.target.value } : prev,
                                    )
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
                                    setThreadForm((prev) =>
                                      prev ? { ...prev, featured_image_alt: event.target.value } : prev,
                                    )
                                  }
                                  className="rounded-2xl"
                                  placeholder="Beschreibender Alt-Text"
                                />
                              </div>
                            </div>

                            {featuredPreview ? (
                              <div className="mt-4 overflow-hidden rounded-[24px] border border-slate-200 bg-white">
                                <img
                                  src={featuredPreview}
                                  alt={threadForm.featured_image_alt || threadForm.title || "Forum Preview"}
                                  className="h-52 w-full object-cover"
                                  loading="lazy"
                                  decoding="async"
                                />
                              </div>
                            ) : (
                              <div className="mt-4 rounded-[24px] border border-dashed border-slate-200 bg-white p-5 text-sm leading-7 text-slate-500">
                                Noch kein Beitragsbild hinterlegt.
                              </div>
                            )}
                          </div>

                          <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-4">
                            <p className="text-sm font-semibold text-slate-800">Content-Quickcheck</p>
                            <p className="mt-3 text-sm leading-7 text-slate-600">
                              Plaintext-Excerpt für <code>content</code>:
                            </p>
                            <p className="mt-3 rounded-[20px] bg-white p-4 text-sm leading-7 text-slate-700">
                              {excerptPreview}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-5 md:grid-cols-2">
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
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="thread-seo-description">SEO Description</Label>
                          <Textarea
                            id="thread-seo-description"
                            value={threadForm.seo_description}
                            onChange={(event) =>
                              setThreadForm((prev) =>
                                prev ? { ...prev, seo_description: event.target.value } : prev,
                              )
                            }
                            className="min-h-[110px] rounded-2xl"
                            placeholder="Max. ~155 Zeichen"
                          />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="thread-admin-notes">Admin Notes</Label>
                          <Textarea
                            id="thread-admin-notes"
                            value={threadForm.admin_notes}
                            onChange={(event) =>
                              setThreadForm((prev) => (prev ? { ...prev, admin_notes: event.target.value } : prev))
                            }
                            className="min-h-[120px] rounded-2xl"
                            placeholder="Interne Hinweise, Redaktionsstatus, Abstimmungen …"
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-6">
                        <Button variant="outline" className="rounded-2xl" onClick={resetThreadForm}>
                          Reset
                        </Button>
                        <Button
                          onClick={() => threadForm && saveThread.mutate(threadForm)}
                          disabled={saveThread.isPending}
                          className="rounded-2xl bg-[#0E1F53] px-6 text-white hover:bg-[#16306d]"
                        >
                          <Save className="h-4 w-4" />
                          {saveThread.isPending ? "Speichert…" : "Thread speichern"}
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="categories" className="mt-0">
            <div className="grid gap-6 xl:grid-cols-[1.05fr_1.05fr]">
              <Card className="rounded-[32px] border-slate-200 bg-white shadow-sm">
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl font-black tracking-tight text-slate-950">Kategorien</CardTitle>
                    <CardDescription className="mt-2 text-sm leading-7 text-slate-500">
                      Basis-Struktur für das Public-Forum inklusive Sortierung, Aktivstatus und SEO-Felder.
                    </CardDescription>
                  </div>
                  <Button variant="outline" className="rounded-xl" onClick={openNewCategoryForm}>
                    <RefreshCw className="h-4 w-4" />
                    Neu
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {categoriesLoading ? (
                    <p className="text-sm text-slate-500">Kategorien werden geladen…</p>
                  ) : categories.length ? (
                    categories.map((category) => (
                      <div key={category.id} className="rounded-[24px] border border-slate-200 p-5">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-600">
                                Sort {category.sort_order}
                              </span>
                              {category.is_active ? (
                                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">
                                  Aktiv
                                </span>
                              ) : (
                                <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-700">
                                  Inaktiv
                                </span>
                              )}
                            </div>
                            <h3 className="mt-3 text-xl font-black tracking-tight text-slate-950">{category.name}</h3>
                            <p className="mt-2 text-sm text-slate-500">/{category.slug}</p>
                            <p className="mt-3 text-sm leading-7 text-slate-600">
                              {category.description || "Keine Beschreibung hinterlegt."}
                            </p>
                            <p className="mt-3 text-xs uppercase tracking-wider text-slate-400">
                              Threads: {categoryThreadCounts.get(category.id) || 0}
                            </p>
                          </div>

                          <div className="flex shrink-0 flex-wrap gap-2">
                            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => openCategoryEditor(category)}>
                              <PencilLine className="h-4 w-4" />
                              Bearbeiten
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                              onClick={() => deleteCategory.mutate(category.id)}
                              disabled={deleteCategory.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                              Löschen
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 p-6 text-sm leading-7 text-slate-500">
                      Noch keine Kategorien vorhanden. Lege rechts die erste Struktur für dein Forum an.
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-[32px] border-slate-200 bg-white shadow-sm">
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl font-black tracking-tight text-slate-950">
                      {categoryForm?.id ? "Kategorie bearbeiten" : "Neue Kategorie"}
                    </CardTitle>
                    <CardDescription className="mt-2 text-sm leading-7 text-slate-500">
                      Nur aktive Kategorien erscheinen später öffentlich im Forum.
                    </CardDescription>
                  </div>
                  <Button variant="outline" className="rounded-xl" onClick={resetCategoryForm}>
                    <RefreshCw className="h-4 w-4" />
                    Reset
                  </Button>
                </CardHeader>

                <CardContent className="space-y-6">
                  {!categoryForm ? (
                    <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 p-6 text-sm leading-7 text-slate-500">
                      Wähle links eine Kategorie oder starte einen neuen Eintrag.
                    </div>
                  ) : (
                    <>
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
                          <div className="flex gap-2">
                            <Input
                              id="category-slug"
                              value={categoryForm.slug}
                              onChange={(event) => {
                                setIsCategorySlugManual(true);
                                setCategoryForm((prev) =>
                                  prev ? { ...prev, slug: slugify(event.target.value) } : prev,
                                );
                              }}
                              className="rounded-2xl"
                              placeholder="seo-strategie"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              className="rounded-2xl"
                              onClick={() => {
                                setIsCategorySlugManual(false);
                                setCategoryForm((prev) =>
                                  prev ? { ...prev, slug: slugify(prev.name) } : prev,
                                );
                              }}
                            >
                              Neu
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="category-description">Beschreibung</Label>
                          <Textarea
                            id="category-description"
                            value={categoryForm.description}
                            onChange={(event) =>
                              setCategoryForm((prev) =>
                                prev ? { ...prev, description: event.target.value } : prev,
                              )
                            }
                            className="min-h-[120px] rounded-2xl"
                            placeholder="Kurzer Kategorietext für Übersicht und Sidebar."
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="category-sort-order">Sortierung</Label>
                          <Input
                            id="category-sort-order"
                            type="number"
                            value={categoryForm.sort_order}
                            onChange={(event) =>
                              setCategoryForm((prev) =>
                                prev
                                  ? { ...prev, sort_order: Number(event.target.value || 0) }
                                  : prev,
                              )
                            }
                            className="rounded-2xl"
                          />
                        </div>

                        <div className="flex items-center justify-between rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4">
                          <Label htmlFor="category-active" className="text-sm font-semibold text-slate-800">
                            Öffentlich aktiv
                          </Label>
                          <Switch
                            id="category-active"
                            checked={categoryForm.is_active}
                            onCheckedChange={(checked) =>
                              setCategoryForm((prev) => (prev ? { ...prev, is_active: checked } : prev))
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="category-seo-title">SEO Title</Label>
                          <Input
                            id="category-seo-title"
                            value={categoryForm.seo_title}
                            onChange={(event) =>
                              setCategoryForm((prev) =>
                                prev ? { ...prev, seo_title: event.target.value } : prev,
                              )
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
                              setCategoryForm((prev) =>
                                prev ? { ...prev, seo_description: event.target.value } : prev,
                              )
                            }
                            className="min-h-[110px] rounded-2xl"
                            placeholder="Max. ~155 Zeichen"
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-6">
                        <Button variant="outline" className="rounded-2xl" onClick={resetCategoryForm}>
                          Reset
                        </Button>
                        <Button
                          onClick={() => categoryForm && saveCategory.mutate(categoryForm)}
                          disabled={saveCategory.isPending}
                          className="rounded-2xl bg-[#FF4B2C] px-6 text-white hover:bg-[#e64124]"
                        >
                          <Save className="h-4 w-4" />
                          {saveCategory.isPending ? "Speichert…" : "Kategorie speichern"}
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="moderation" className="mt-0">
            <div className="grid gap-6 xl:grid-cols-[0.95fr_1.25fr]">
              <Card className="rounded-[32px] border-slate-200 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-2xl font-black tracking-tight text-slate-950">Reply-Moderation</CardTitle>
                  <CardDescription className="mt-2 text-sm leading-7 text-slate-500">
                    Filtere Antworten nach Aktivstatus, Spam-Flag, Thread oder Suche und greife direkt in die Moderation ein.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label>Suche</Label>
                      <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          value={replySearch}
                          onChange={(event) => setReplySearch(event.target.value)}
                          placeholder="Autor, Reply-Text oder Thread suchen"
                          className="rounded-2xl pl-10"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <Select value={replyStatusFilter} onValueChange={(value: "all" | "active" | "inactive") => setReplyStatusFilter(value)}>
                          <SelectTrigger className="rounded-2xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Alle</SelectItem>
                            <SelectItem value="active">Nur aktiv</SelectItem>
                            <SelectItem value="inactive">Nur inaktiv</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Spam</Label>
                        <Select value={replySpamFilter} onValueChange={(value: "all" | "clean" | "spam") => setReplySpamFilter(value)}>
                          <SelectTrigger className="rounded-2xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Alle</SelectItem>
                            <SelectItem value="clean">Nur clean</SelectItem>
                            <SelectItem value="spam">Nur Spam</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Thread</Label>
                        <Select value={replyThreadFilter} onValueChange={setReplyThreadFilter}>
                          <SelectTrigger className="rounded-2xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Alle Threads</SelectItem>
                            {threads.map((thread) => (
                              <SelectItem key={thread.id} value={thread.id}>
                                {thread.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    {repliesLoading
                      ? "Replies werden geladen…"
                      : `${filteredReplies.length} Replies im aktuellen Filter`}
                  </div>

                  <div className="space-y-3">
                    {repliesLoading ? (
                      <p className="text-sm text-slate-500">Replies werden geladen…</p>
                    ) : filteredReplies.length ? (
                      filteredReplies.map((reply) => (
                        <button
                          key={reply.id}
                          type="button"
                          onClick={() => setSelectedReplyId(reply.id)}
                          className={`w-full rounded-[24px] border p-4 text-left transition-all ${
                            selectedReply?.id === reply.id
                              ? "border-[#FF4B2C]/30 bg-[#FF4B2C]/5"
                              : "border-slate-200 hover:border-[#FF4B2C]/20 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                              {reply.author_name || "Mitglied"}
                            </span>
                            {reply.is_spam ? (
                              <span className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-red-700">
                                Spam
                              </span>
                            ) : null}
                            {!reply.is_active ? (
                              <span className="rounded-full bg-slate-200 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-700">
                                Inaktiv
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-3 line-clamp-2 text-sm leading-7 text-slate-700">
                            {reply.content}
                          </p>
                          <div className="mt-3 text-xs text-slate-500">
                            <span>{reply.thread?.title || "Thread unbekannt"}</span>
                            <span className="mx-2">·</span>
                            <span>{formatDateTime(reply.created_at)}</span>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 p-6 text-sm leading-7 text-slate-500">
                        Kein Reply passt aktuell auf deinen Filter.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[32px] border-slate-200 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-2xl font-black tracking-tight text-slate-950">Moderations-Inspector</CardTitle>
                  <CardDescription className="mt-2 text-sm leading-7 text-slate-500">
                    Spam markieren, Antworten deaktivieren und den zugehörigen Thread direkt verwalten.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {!selectedReply ? (
                    <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 p-6 text-sm leading-7 text-slate-500">
                      Wähle links eine Reply aus, um Moderationsaktionen und Thread-Steuerung zu sehen.
                    </div>
                  ) : (
                    <>
                      <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className="rounded-full border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
                            {selectedReply.author_name || "Mitglied"}
                          </Badge>
                          {selectedReply.is_spam ? (
                            <Badge className="rounded-full border-none bg-red-600 px-3 py-1 text-white">
                              <ShieldAlert className="mr-1 h-3.5 w-3.5" />
                              Spam
                            </Badge>
                          ) : (
                            <Badge className="rounded-full border-none bg-emerald-600 px-3 py-1 text-white">
                              <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                              Clean
                            </Badge>
                          )}
                          {selectedReply.is_active ? (
                            <Badge variant="outline" className="rounded-full border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-700">
                              Aktiv
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="rounded-full border-slate-200 bg-slate-200 px-3 py-1 text-xs text-slate-700">
                              Inaktiv
                            </Badge>
                          )}
                        </div>

                        <p className="mt-4 whitespace-pre-wrap text-base leading-8 text-slate-800">
                          {selectedReply.content}
                        </p>

                        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                          <span>Reply-ID: {selectedReply.id.slice(0, 8)}…</span>
                          <span>Erstellt: {formatDateTime(selectedReply.created_at)}</span>
                          <span>Aktualisiert: {formatDateTime(selectedReply.updated_at)}</span>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <Button
                          variant="outline"
                          className="rounded-2xl"
                          onClick={() =>
                            updateReplyModeration.mutate({
                              replyId: selectedReply.id,
                              patch: { is_spam: !selectedReply.is_spam },
                              successMessage: selectedReply.is_spam ? "Spam-Flag entfernt." : "Reply als Spam markiert.",
                            })
                          }
                        >
                          <MessageSquareWarning className="h-4 w-4" />
                          {selectedReply.is_spam ? "Spam lösen" : "Als Spam markieren"}
                        </Button>

                        <Button
                          variant="outline"
                          className="rounded-2xl"
                          onClick={() =>
                            updateReplyModeration.mutate({
                              replyId: selectedReply.id,
                              patch: { is_active: !selectedReply.is_active },
                              successMessage: selectedReply.is_active ? "Reply deaktiviert." : "Reply wieder aktiviert.",
                            })
                          }
                        >
                          {selectedReply.is_active ? <Trash2 className="h-4 w-4" /> : <BadgeCheck className="h-4 w-4" />}
                          {selectedReply.is_active ? "Deaktivieren" : "Aktivieren"}
                        </Button>
                      </div>

                      <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Zugehöriger Thread</p>
                            <h3 className="mt-2 text-xl font-black tracking-tight text-slate-950">
                              {selectedThreadForReply?.title || "Thread nicht gefunden"}
                            </h3>
                            {selectedThreadForReply ? (
                              <p className="mt-2 text-sm leading-7 text-slate-600">
                                /{selectedThreadForReply.slug} · {categoryMap.get(selectedThreadForReply.category_id || "")?.name || "Ohne Kategorie"}
                              </p>
                            ) : null}
                          </div>

                          {selectedThreadForReply ? (
                            <Button asChild variant="outline" className="rounded-xl">
                              <Link to={`/forum/${selectedThreadForReply.slug}`} target="_blank" rel="noreferrer">
                                <Eye className="h-4 w-4" />
                                Live öffnen
                              </Link>
                            </Button>
                          ) : null}
                        </div>

                        {selectedThreadForReply ? (
                          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                            <Button
                              variant="outline"
                              className="rounded-2xl"
                              onClick={() =>
                                updateThreadQuickAction.mutate({
                                  threadId: selectedThreadForReply.id,
                                  patch: { is_locked: !selectedThreadForReply.is_locked },
                                  successMessage: selectedThreadForReply.is_locked ? "Thread entsperrt." : "Thread gesperrt.",
                                })
                              }
                            >
                              {selectedThreadForReply.is_locked ? <LockOpen className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                              {selectedThreadForReply.is_locked ? "Entsperren" : "Sperren"}
                            </Button>

                            <Button
                              variant="outline"
                              className="rounded-2xl"
                              onClick={() =>
                                updateThreadQuickAction.mutate({
                                  threadId: selectedThreadForReply.id,
                                  patch: { is_pinned: !selectedThreadForReply.is_pinned },
                                  successMessage: selectedThreadForReply.is_pinned ? "Thread entpinnt." : "Thread angepinnt.",
                                })
                              }
                            >
                              {selectedThreadForReply.is_pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                              {selectedThreadForReply.is_pinned ? "Entpinnen" : "Pinnen"}
                            </Button>

                            <Button
                              variant="outline"
                              className="rounded-2xl"
                              onClick={() =>
                                updateThreadQuickAction.mutate({
                                  threadId: selectedThreadForReply.id,
                                  patch: { is_answered: !selectedThreadForReply.is_answered },
                                  successMessage: selectedThreadForReply.is_answered ? "Answer-Flag entfernt." : "Thread als beantwortet markiert.",
                                })
                              }
                            >
                              {selectedThreadForReply.is_answered ? <BadgeCheck className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                              {selectedThreadForReply.is_answered ? "Unanswered" : "Answered"}
                            </Button>

                            <Button
                              variant="outline"
                              className="rounded-2xl"
                              onClick={() =>
                                updateThreadQuickAction.mutate({
                                  threadId: selectedThreadForReply.id,
                                  patch: { status: selectedThreadForReply.status === "published" ? "draft" : "published" },
                                  successMessage: selectedThreadForReply.status === "published" ? "Thread auf draft gesetzt." : "Thread veröffentlicht.",
                                })
                              }
                            >
                              <Eye className="h-4 w-4" />
                              {selectedThreadForReply.status === "published" ? "Entpublishen" : "Publishen"}
                            </Button>
                          </div>
                        ) : (
                          <div className="mt-5 rounded-[20px] border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-500">
                            Kein zugehöriger Thread gefunden.
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminForum;
