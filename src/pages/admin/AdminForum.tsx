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
  status: "published",
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
  ad_enabled: category.ad_enabled || false,
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
  status: thread.status || "published",
  admin_notes: thread.admin_notes || "",
  show_ad: thread.show_ad || false,
  ad_type: thread.ad_type || "image",
  ad_image_url: thread.ad_image_url || "",
  ad_image_alt: thread.ad_image_alt || "",
  ad_link_url: thread.ad_link_url || "",
  ad_cta_text: thread.ad_cta_text || "",
  ad_html_code: thread.ad_html_code || "",
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
  const [threadSearch, setThreadSearch] = useState("");
  const [threadStatusFilter, setThreadStatusFilter] = useState<"all" | "published" | "draft" | "archived">("all");
  const [threadCategoryFilter, setThreadCategoryFilter] = useState<string>("all");
  const [contentMode, setContentMode] = useState<"visual" | "html" | "split">("split");
  const [categorySearch, setCategorySearch] = useState("");

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

  const filteredThreads = useMemo(() => {
    const search = threadSearch.trim().toLowerCase();

    return threads.filter((thread) => {
      if (threadStatusFilter !== "all" && thread.status !== threadStatusFilter) return false;
      if (threadCategoryFilter !== "all" && thread.category_id !== threadCategoryFilter) return false;

      if (!search) return true;

      const category = thread.category_id ? categoryMap.get(thread.category_id) : null;
      const haystack = [
        thread.title,
        thread.slug,
        thread.author_name || "",
        thread.raw_html_content || thread.content,
        category?.name || "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(search);
    });
  }, [categoryMap, threadCategoryFilter, threadSearch, threadStatusFilter, threads]);

  const filteredCategories = useMemo(() => {
    const search = categorySearch.trim().toLowerCase();
    if (!search) return categories;

    return categories.filter((category) =>
      [category.name, category.slug, category.description || "", category.seo_title || "", category.seo_description || ""]
        .join(" ")
        .toLowerCase()
        .includes(search),
    );
  }, [categories, categorySearch]);

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
        show_ad: values.show_ad,
        ad_type: values.ad_type.trim() || null,
        ad_image_url: values.ad_image_url.trim() || null,
        ad_image_alt: values.ad_image_alt.trim() || null,
        ad_link_url: values.ad_link_url.trim() || null,
        ad_cta_text: values.ad_cta_text.trim() || null,
        ad_html_code: values.ad_html_code.trim() || null,
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
            <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
              <Card className="rounded-[32px] border-slate-200 bg-white shadow-sm xl:sticky xl:top-6 xl:h-[calc(100vh-140px)] xl:overflow-hidden">
                <CardHeader className="space-y-4 border-b border-slate-200">
                  <div className="flex flex-row items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-2xl font-black tracking-tight text-slate-950">Thread-Übersicht</CardTitle>
                      <CardDescription className="mt-2 text-sm leading-7 text-slate-500">
                        Kompakter WP-Stil: suchen, filtern, Thread öffnen und dann rechts sauber redaktionell pflegen.
                      </CardDescription>
                    </div>
                    <Button variant="outline" className="rounded-xl" onClick={openNewThreadForm}>
                      <RefreshCw className="h-4 w-4" />
                      Neu
                    </Button>
                  </div>

                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label>Suche</Label>
                      <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          value={threadSearch}
                          onChange={(event) => setThreadSearch(event.target.value)}
                          placeholder="Titel, Slug, Autor oder Inhalt suchen"
                          className="rounded-2xl pl-10"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <Select
                          value={threadStatusFilter}
                          onValueChange={(value: "all" | "published" | "draft" | "archived") => setThreadStatusFilter(value)}
                        >
                          <SelectTrigger className="rounded-2xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Alle Status</SelectItem>
                            <SelectItem value="published">published</SelectItem>
                            <SelectItem value="draft">draft</SelectItem>
                            <SelectItem value="archived">archived</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Kategorie</Label>
                        <Select value={threadCategoryFilter} onValueChange={setThreadCategoryFilter}>
                          <SelectTrigger className="rounded-2xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Alle Kategorien</SelectItem>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-3">
                      <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Gefiltert</p>
                        <p className="mt-2 text-2xl font-black tracking-tight text-slate-950">{filteredThreads.length}</p>
                      </div>
                      <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Publish</p>
                        <p className="mt-2 text-2xl font-black tracking-tight text-slate-950">{threads.filter((thread) => thread.status === "published").length}</p>
                      </div>
                      <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Drafts</p>
                        <p className="mt-2 text-2xl font-black tracking-tight text-slate-950">{threads.filter((thread) => thread.status === "draft").length}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="max-h-[calc(100vh-430px)] space-y-3 overflow-y-auto p-6">
                  {threadsLoading ? (
                    <p className="text-sm text-slate-500">Threads werden geladen…</p>
                  ) : filteredThreads.length ? (
                    filteredThreads.map((thread) => {
                      const category = thread.category_id ? categoryMap.get(thread.category_id) : null;
                      const isSelected = threadForm?.id === thread.id;

                      return (
                        <button
                          key={thread.id}
                          type="button"
                          onClick={() => openThreadEditor(thread)}
                          className={`w-full rounded-[24px] border p-4 text-left transition-all ${
                            isSelected
                              ? "border-[#0E1F53] bg-[#0E1F53]/5 shadow-sm"
                              : "border-slate-200 bg-white hover:border-[#FF4B2C]/30 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                              {thread.status}
                            </span>
                            {thread.is_pinned ? (
                              <span className="rounded-full bg-[#FF4B2C]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#FF4B2C]">
                                Angepinnt
                              </span>
                            ) : null}
                            {thread.is_locked ? (
                              <span className="rounded-full bg-slate-950/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-950">
                                Gesperrt
                              </span>
                            ) : null}
                            {!thread.is_active ? (
                              <span className="rounded-full bg-slate-200 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700">
                                Inaktiv
                              </span>
                            ) : null}
                          </div>

                          <h3 className="mt-3 line-clamp-2 text-lg font-black tracking-tight text-slate-950">{thread.title}</h3>
                          <p className="mt-1 text-sm text-slate-500">/{thread.slug}</p>
                          <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600">
                            {stripHtml(thread.raw_html_content || thread.content).slice(0, 150) || "Noch kein Inhalt."}
                          </p>

                          <div className="mt-4 grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
                            <span>Kategorie: {category?.name || "Ohne Kategorie"}</span>
                            <span>Autor: {thread.author_name || "–"}</span>
                            <span>Views: {thread.views}</span>
                            <span>Aktivität: {formatDateTime(thread.last_activity_at)}</span>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            <Button type="button" variant="outline" size="sm" className="rounded-xl" asChild>
                              <Link to={`/forum/${thread.slug}`} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()}>
                                <Eye className="h-4 w-4" />
                                Live
                              </Link>
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                              onClick={(event) => {
                                event.stopPropagation();
                                deleteThread.mutate(thread.id);
                              }}
                              disabled={deleteThread.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                              Löschen
                            </Button>
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 p-6 text-sm leading-7 text-slate-500">
                      Keine Threads für die aktuelle Suche bzw. den Filter gefunden.
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-[32px] border-slate-200 bg-white shadow-sm">
                <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-slate-200">
                  <div>
                    <CardTitle className="text-2xl font-black tracking-tight text-slate-950">
                      {threadForm?.id ? "Thread bearbeiten" : "Neuen Thread anlegen"}
                    </CardTitle>
                    <CardDescription className="mt-2 text-sm leading-7 text-slate-500">
                      WordPress-Stil: Titel und Inhalt groß im Fokus, rechts die Meta-Boxen. Zusätzlich kannst du den Inhalt direkt als HTML-Quelle pflegen.
                    </CardDescription>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {threadForm?.id ? (
                      <Button variant="outline" className="rounded-xl" asChild>
                        <Link to={`/forum/${threadForm.slug}`} target="_blank" rel="noreferrer">
                          <Eye className="h-4 w-4" />
                          Live öffnen
                        </Link>
                      </Button>
                    ) : null}
                    {threadForm?.id ? (
                      <Button
                        variant="outline"
                        className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => threadForm.id && deleteThread.mutate(threadForm.id)}
                        disabled={deleteThread.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                        Löschen
                      </Button>
                    ) : null}
                    <Button variant="outline" className="rounded-xl" onClick={resetThreadForm}>
                      <RefreshCw className="h-4 w-4" />
                      Reset
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-8 p-6">
                  {!threadForm ? (
                    <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 p-6 text-sm leading-7 text-slate-500">
                      Wähle links einen Thread oder starte einen neuen Entwurf.
                    </div>
                  ) : (
                    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_340px] xl:items-start">
                      <div className="space-y-6">
                        <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                          <div className="space-y-4">
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
                                className="rounded-2xl bg-white"
                                placeholder="z. B. Webdesign Relaunch: Was bringt wirklich Anfragen?"
                              />
                            </div>

                            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto]">
                              <div className="space-y-2">
                                <Label htmlFor="thread-slug">Slug</Label>
                                <Input
                                  id="thread-slug"
                                  value={threadForm.slug}
                                  onChange={(event) => {
                                    setIsThreadSlugManual(true);
                                    setThreadForm((prev) => (prev ? { ...prev, slug: slugify(event.target.value) } : prev));
                                  }}
                                  className="rounded-2xl bg-white"
                                  placeholder="thread-slug"
                                />
                              </div>
                              <div className="flex items-end">
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="rounded-2xl"
                                  onClick={() => {
                                    setIsThreadSlugManual(false);
                                    setThreadForm((prev) => (prev ? { ...prev, slug: slugify(prev.title) } : prev));
                                  }}
                                >
                                  Slug neu
                                </Button>
                              </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                              <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-3">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">URL</p>
                                <p className="mt-2 truncate text-sm font-semibold text-slate-900">/forum/{threadForm.slug || "thread-slug"}</p>
                              </div>
                              <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-3">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Plaintext</p>
                                <p className="mt-2 text-sm font-semibold text-slate-900">{stripHtml(threadForm.raw_html_content || "").length} Zeichen</p>
                              </div>
                              <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-3">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Editor</p>
                                <p className="mt-2 text-sm font-semibold text-slate-900">{contentMode === "visual" ? "Visuell" : contentMode === "html" ? "HTML" : "Split"}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
                          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">Inhalt</p>
                              <p className="mt-1 text-sm text-slate-500">Visueller Editor und HTML-Quelltext greifen auf dasselbe Feld <code>raw_html_content</code> zu.</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                className={`rounded-xl ${contentMode === "visual" ? "border-[#0E1F53] bg-[#0E1F53] text-white hover:bg-[#16306d] hover:text-white" : ""}`}
                                onClick={() => setContentMode("visual")}
                              >
                                Visual
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                className={`rounded-xl ${contentMode === "html" ? "border-[#0E1F53] bg-[#0E1F53] text-white hover:bg-[#16306d] hover:text-white" : ""}`}
                                onClick={() => setContentMode("html")}
                              >
                                HTML
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                className={`rounded-xl ${contentMode === "split" ? "border-[#0E1F53] bg-[#0E1F53] text-white hover:bg-[#16306d] hover:text-white" : ""}`}
                                onClick={() => setContentMode("split")}
                              >
                                Split
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-4 p-5">
                            {contentMode === "visual" ? (
                              <RichTextEditor
                                value={threadForm.raw_html_content}
                                onChange={(html) => setThreadForm((prev) => (prev ? { ...prev, raw_html_content: html } : prev))}
                                onImageUpload={(file) => uploadForumAsset(file, "editor")}
                              />
                            ) : null}

                            {contentMode === "html" ? (
                              <div className="space-y-2">
                                <Label htmlFor="thread-html-source">HTML-Quelle</Label>
                                <Textarea
                                  id="thread-html-source"
                                  value={threadForm.raw_html_content}
                                  onChange={(event) =>
                                    setThreadForm((prev) => (prev ? { ...prev, raw_html_content: event.target.value } : prev))
                                  }
                                  className="min-h-[520px] rounded-[24px] font-mono text-sm leading-7"
                                  placeholder="<h2>Headline</h2>
<p>Dein HTML-Inhalt …</p>"
                                />
                              </div>
                            ) : null}

                            {contentMode === "split" ? (
                              <div className="grid gap-5 xl:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)]">
                                <RichTextEditor
                                  value={threadForm.raw_html_content}
                                  onChange={(html) => setThreadForm((prev) => (prev ? { ...prev, raw_html_content: html } : prev))}
                                  onImageUpload={(file) => uploadForumAsset(file, "editor")}
                                />
                                <div className="space-y-2">
                                  <Label htmlFor="thread-html-split">HTML-Quelle</Label>
                                  <Textarea
                                    id="thread-html-split"
                                    value={threadForm.raw_html_content}
                                    onChange={(event) =>
                                      setThreadForm((prev) => (prev ? { ...prev, raw_html_content: event.target.value } : prev))
                                    }
                                    className="min-h-[470px] rounded-[24px] font-mono text-sm leading-7"
                                    placeholder="<h2>Headline</h2>
<p>Dein HTML-Inhalt …</p>"
                                  />
                                </div>
                              </div>
                            ) : null}

                            <div className="rounded-[20px] border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-600">
                              Der Frontend-Render läuft weiter über die Sanitizer-Logik. Du kannst also HTML direkt pflegen, ohne die Public-Ausgabe unsauber zu machen.
                            </div>
                          </div>
                        </div>

                        <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">Content-Quickcheck</p>
                              <p className="mt-1 text-sm text-slate-500">Vorschau des Klartexts für <code>content</code> und interne Redaktionsnotizen.</p>
                            </div>
                            <Badge variant="outline" className="rounded-full border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
                              {excerptPreview.length} Zeichen Excerpt
                            </Badge>
                          </div>

                          <div className="mt-4 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
                            <div className="rounded-[24px] border border-slate-200 bg-white p-4 text-sm leading-7 text-slate-700">
                              {excerptPreview}
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="thread-admin-notes">Admin Notes</Label>
                              <Textarea
                                id="thread-admin-notes"
                                value={threadForm.admin_notes}
                                onChange={(event) => setThreadForm((prev) => (prev ? { ...prev, admin_notes: event.target.value } : prev))}
                                className="min-h-[180px] rounded-[24px] bg-white"
                                placeholder="Interne Hinweise, Redaktionsstatus, Abstimmungen …"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-5 xl:sticky xl:top-6">
                        <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                          <p className="text-sm font-semibold text-slate-900">Veröffentlichen & Meta</p>
                          <div className="mt-4 space-y-4">
                            <div className="space-y-2">
                              <Label>Status</Label>
                              <Select value={threadForm.status} onValueChange={(value) => setThreadForm((prev) => (prev ? { ...prev, status: value } : prev))}>
                                <SelectTrigger className="rounded-2xl bg-white">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="published">published</SelectItem>
                                  <SelectItem value="draft">draft</SelectItem>
                                  <SelectItem value="archived">archived</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label>Kategorie</Label>
                              <Select value={threadForm.category_id} onValueChange={(value) => setThreadForm((prev) => (prev ? { ...prev, category_id: value } : prev))}>
                                <SelectTrigger className="rounded-2xl bg-white">
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
                              <Label htmlFor="thread-author">Autorenname</Label>
                              <Input
                                id="thread-author"
                                value={threadForm.author_name}
                                onChange={(event) => setThreadForm((prev) => (prev ? { ...prev, author_name: event.target.value } : prev))}
                                className="rounded-2xl bg-white"
                                placeholder="Digital-Perfect Redaktion"
                              />
                            </div>

                            <div className="grid gap-3">
                              {([
                                { key: "is_active", label: "Öffentlich aktiv" },
                                { key: "is_pinned", label: "Angepinnt" },
                                { key: "is_locked", label: "Gesperrt" },
                                { key: "is_answered", label: "Beantwortet" },
                              ] as Array<{ key: ThreadBooleanKey; label: string }>).map((item) => (
                                <div key={item.key} className="flex items-center justify-between rounded-[22px] border border-slate-200 bg-white px-4 py-3">
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

                            <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-4 text-sm leading-7 text-slate-600">
                              <p><strong>Erstellt:</strong> {threadForm.id ? formatDateTime(threads.find((thread) => thread.id === threadForm.id)?.created_at) : "Neu"}</p>
                              <p><strong>Zuletzt aktiv:</strong> {threadForm.id ? formatDateTime(threads.find((thread) => thread.id === threadForm.id)?.last_activity_at) : "–"}</p>
                              <p><strong>Views:</strong> {threadForm.id ? threads.find((thread) => thread.id === threadForm.id)?.views ?? 0 : 0}</p>
                            </div>

                            <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-4">
                              <Button variant="outline" className="rounded-2xl" onClick={resetThreadForm}>
                                Reset
                              </Button>
                              <Button
                                onClick={() => threadForm && saveThread.mutate(threadForm)}
                                disabled={saveThread.isPending}
                                className="flex-1 rounded-2xl bg-[#0E1F53] px-6 text-white hover:bg-[#16306d]"
                              >
                                <Save className="h-4 w-4" />
                                {saveThread.isPending ? "Speichert…" : "Thread speichern"}
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                          <Label htmlFor="featured-upload" className="text-sm font-semibold text-slate-900">
                            Beitragsbild / Hero
                          </Label>
                          <div className="mt-3 flex flex-wrap gap-3">
                            <label htmlFor="featured-upload">
                              <Button type="button" asChild className="rounded-2xl bg-[#FF4B2C] text-white hover:bg-[#e64124]">
                                <span>
                                  <Upload className="h-4 w-4" />
                                  {isUploadingFeatured ? "Upload läuft…" : "Bild hochladen"}
                                </span>
                              </Button>
                            </label>
                            {threadForm.featured_image_url ? (
                              <Button
                                type="button"
                                variant="outline"
                                className="rounded-2xl"
                                onClick={() => setThreadForm((prev) => (prev ? { ...prev, featured_image_url: "", featured_image_alt: "" } : prev))}
                              >
                                <Trash2 className="h-4 w-4" />
                                Entfernen
                              </Button>
                            ) : null}
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
                                onChange={(event) => setThreadForm((prev) => (prev ? { ...prev, featured_image_url: event.target.value } : prev))}
                                className="rounded-2xl bg-white"
                                placeholder="/render/image/public/..."
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="featured-alt">Alt-Text</Label>
                              <Input
                                id="featured-alt"
                                value={threadForm.featured_image_alt}
                                onChange={(event) => setThreadForm((prev) => (prev ? { ...prev, featured_image_alt: event.target.value } : prev))}
                                className="rounded-2xl bg-white"
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

                        <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                          <p className="text-sm font-semibold text-slate-900">SEO</p>
                          <div className="mt-4 space-y-4">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between gap-3">
                                <Label htmlFor="thread-seo-title">SEO Title</Label>
                                <span className="text-xs text-slate-500">{threadForm.seo_title.length}/60</span>
                              </div>
                              <Input
                                id="thread-seo-title"
                                value={threadForm.seo_title}
                                onChange={(event) => setThreadForm((prev) => (prev ? { ...prev, seo_title: event.target.value } : prev))}
                                className="rounded-2xl bg-white"
                                placeholder="Max. ~60 Zeichen"
                              />
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between gap-3">
                                <Label htmlFor="thread-seo-description">SEO Description</Label>
                                <span className="text-xs text-slate-500">{threadForm.seo_description.length}/155</span>
                              </div>
                              <Textarea
                                id="thread-seo-description"
                                value={threadForm.seo_description}
                                onChange={(event) => setThreadForm((prev) => (prev ? { ...prev, seo_description: event.target.value } : prev))}
                                className="min-h-[140px] rounded-2xl bg-white"
                                placeholder="Max. ~155 Zeichen"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-slate-900">Thread-CTA / Werbung</p>
                            <Switch
                              id="thread-show-ad"
                              checked={threadForm.show_ad}
                              onCheckedChange={(checked) => setThreadForm((prev) => (prev ? { ...prev, show_ad: checked } : prev))}
                            />
                          </div>
                          <div className="mt-4 space-y-4">
                            <div className="space-y-2">
                              <Label>CTA-Typ</Label>
                              <Select value={threadForm.ad_type} onValueChange={(value) => setThreadForm((prev) => (prev ? { ...prev, ad_type: value } : prev))}>
                                <SelectTrigger className="rounded-2xl bg-white">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="image">image</SelectItem>
                                  <SelectItem value="html">html</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="thread-ad-link">CTA-Link</Label>
                              <Input
                                id="thread-ad-link"
                                value={threadForm.ad_link_url}
                                onChange={(event) => setThreadForm((prev) => (prev ? { ...prev, ad_link_url: event.target.value } : prev))}
                                className="rounded-2xl bg-white"
                                placeholder="/kontakt oder https://..."
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="thread-ad-cta">CTA-Text</Label>
                              <Input
                                id="thread-ad-cta"
                                value={threadForm.ad_cta_text}
                                onChange={(event) => setThreadForm((prev) => (prev ? { ...prev, ad_cta_text: event.target.value } : prev))}
                                className="rounded-2xl bg-white"
                                placeholder="Jetzt anfragen"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="thread-ad-image">CTA-Bild</Label>
                              <Input
                                id="thread-ad-image"
                                value={threadForm.ad_image_url}
                                onChange={(event) => setThreadForm((prev) => (prev ? { ...prev, ad_image_url: event.target.value } : prev))}
                                className="rounded-2xl bg-white"
                                placeholder="/render/image/public/..."
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="thread-ad-image-alt">CTA Alt-Text</Label>
                              <Input
                                id="thread-ad-image-alt"
                                value={threadForm.ad_image_alt}
                                onChange={(event) => setThreadForm((prev) => (prev ? { ...prev, ad_image_alt: event.target.value } : prev))}
                                className="rounded-2xl bg-white"
                                placeholder="Alt-Text für CTA-Bild"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="thread-ad-html">Custom HTML</Label>
                              <Textarea
                                id="thread-ad-html"
                                value={threadForm.ad_html_code}
                                onChange={(event) => setThreadForm((prev) => (prev ? { ...prev, ad_html_code: event.target.value } : prev))}
                                className="min-h-[140px] rounded-2xl bg-white font-mono text-sm"
                                placeholder="<div>Custom CTA-HTML …</div>"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="categories" className="mt-0">
            <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
              <Card className="rounded-[32px] border-slate-200 bg-white shadow-sm xl:sticky xl:top-6 xl:h-[calc(100vh-140px)] xl:overflow-hidden">
                <CardHeader className="space-y-4 border-b border-slate-200">
                  <div className="flex flex-row items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-2xl font-black tracking-tight text-slate-950">Kategorien</CardTitle>
                      <CardDescription className="mt-2 text-sm leading-7 text-slate-500">
                        Forum-Struktur im kompakten Listenstil mit schneller Suche, Sortierung und CTA-/Promo-Feldern.
                      </CardDescription>
                    </div>
                    <Button variant="outline" className="rounded-xl" onClick={openNewCategoryForm}>
                      <RefreshCw className="h-4 w-4" />
                      Neu
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>Suche</Label>
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        value={categorySearch}
                        onChange={(event) => setCategorySearch(event.target.value)}
                        placeholder="Kategorie, Slug oder Beschreibung suchen"
                        className="rounded-2xl pl-10"
                      />
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="max-h-[calc(100vh-300px)] space-y-3 overflow-y-auto p-6">
                  {categoriesLoading ? (
                    <p className="text-sm text-slate-500">Kategorien werden geladen…</p>
                  ) : filteredCategories.length ? (
                    filteredCategories.map((category) => {
                      const isSelected = categoryForm?.id === category.id;
                      return (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => openCategoryEditor(category)}
                          className={`w-full rounded-[24px] border p-4 text-left transition-all ${
                            isSelected
                              ? "border-[#FF4B2C] bg-[#FF4B2C]/5 shadow-sm"
                              : "border-slate-200 bg-white hover:border-[#FF4B2C]/30 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                              Sort {category.sort_order}
                            </span>
                            {category.is_active ? (
                              <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                                Aktiv
                              </span>
                            ) : (
                              <span className="rounded-full bg-slate-200 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700">
                                Inaktiv
                              </span>
                            )}
                            {category.ad_enabled ? (
                              <span className="rounded-full bg-[#0E1F53]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0E1F53]">
                                Promo aktiv
                              </span>
                            ) : null}
                          </div>
                          <h3 className="mt-3 text-lg font-black tracking-tight text-slate-950">{category.name}</h3>
                          <p className="mt-1 text-sm text-slate-500">/{category.slug}</p>
                          <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600">
                            {category.description || "Keine Beschreibung hinterlegt."}
                          </p>
                          <p className="mt-4 text-xs uppercase tracking-[0.18em] text-slate-400">
                            Threads: {categoryThreadCounts.get(category.id) || 0}
                          </p>
                        </button>
                      );
                    })
                  ) : (
                    <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 p-6 text-sm leading-7 text-slate-500">
                      Keine Kategorien für die aktuelle Suche gefunden.
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-[32px] border-slate-200 bg-white shadow-sm">
                <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-slate-200">
                  <div>
                    <CardTitle className="text-2xl font-black tracking-tight text-slate-950">
                      {categoryForm?.id ? "Kategorie bearbeiten" : "Neue Kategorie"}
                    </CardTitle>
                    <CardDescription className="mt-2 text-sm leading-7 text-slate-500">
                      Struktur, SEO und optionales Promo-/Werbeelement pro Kategorie in einer sauberen Redaktionsmaske.
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {categoryForm?.id ? (
                      <Button
                        variant="outline"
                        className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => categoryForm.id && deleteCategory.mutate(categoryForm.id)}
                        disabled={deleteCategory.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                        Löschen
                      </Button>
                    ) : null}
                    <Button variant="outline" className="rounded-xl" onClick={resetCategoryForm}>
                      <RefreshCw className="h-4 w-4" />
                      Reset
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6 p-6">
                  {!categoryForm ? (
                    <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 p-6 text-sm leading-7 text-slate-500">
                      Wähle links eine Kategorie oder starte einen neuen Eintrag.
                    </div>
                  ) : (
                    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_360px]">
                      <div className="space-y-6">
                        <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
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
                                className="rounded-2xl bg-white"
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
                                    setCategoryForm((prev) => (prev ? { ...prev, slug: slugify(event.target.value) } : prev));
                                  }}
                                  className="rounded-2xl bg-white"
                                  placeholder="seo-strategie"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="rounded-2xl"
                                  onClick={() => {
                                    setIsCategorySlugManual(false);
                                    setCategoryForm((prev) => (prev ? { ...prev, slug: slugify(prev.name) } : prev));
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
                                onChange={(event) => setCategoryForm((prev) => (prev ? { ...prev, description: event.target.value } : prev))}
                                className="min-h-[160px] rounded-[24px] bg-white"
                                placeholder="Kurzer Kategorietext für Übersicht und Sidebar."
                              />
                            </div>
                          </div>
                        </div>

                        <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                          <p className="text-sm font-semibold text-slate-900">Kategorie-Promo / Sidebar-Element</p>
                          <div className="mt-4 space-y-4">
                            <div className="flex items-center justify-between rounded-[22px] border border-slate-200 bg-white px-4 py-3">
                              <Label htmlFor="category-ad-enabled" className="text-sm font-semibold text-slate-800">
                                Promo aktivieren
                              </Label>
                              <Switch
                                id="category-ad-enabled"
                                checked={categoryForm.ad_enabled}
                                onCheckedChange={(checked) => setCategoryForm((prev) => (prev ? { ...prev, ad_enabled: checked } : prev))}
                              />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor="category-ad-headline">Headline</Label>
                                <Input
                                  id="category-ad-headline"
                                  value={categoryForm.ad_headline}
                                  onChange={(event) => setCategoryForm((prev) => (prev ? { ...prev, ad_headline: event.target.value } : prev))}
                                  className="rounded-2xl bg-white"
                                  placeholder="Kostenlose Beratung"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="category-ad-subheadline">Subheadline</Label>
                                <Input
                                  id="category-ad-subheadline"
                                  value={categoryForm.ad_subheadline}
                                  onChange={(event) => setCategoryForm((prev) => (prev ? { ...prev, ad_subheadline: event.target.value } : prev))}
                                  className="rounded-2xl bg-white"
                                  placeholder="Kurzer Nutzen / Hook"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="category-ad-cta">CTA-Text</Label>
                                <Input
                                  id="category-ad-cta"
                                  value={categoryForm.ad_cta_text}
                                  onChange={(event) => setCategoryForm((prev) => (prev ? { ...prev, ad_cta_text: event.target.value } : prev))}
                                  className="rounded-2xl bg-white"
                                  placeholder="Mehr erfahren"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="category-ad-link">CTA-Link</Label>
                                <Input
                                  id="category-ad-link"
                                  value={categoryForm.ad_link_url}
                                  onChange={(event) => setCategoryForm((prev) => (prev ? { ...prev, ad_link_url: event.target.value } : prev))}
                                  className="rounded-2xl bg-white"
                                  placeholder="/kontakt oder https://..."
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="category-ad-image">Bild-URL</Label>
                              <Input
                                id="category-ad-image"
                                value={categoryForm.ad_image_url}
                                onChange={(event) => setCategoryForm((prev) => (prev ? { ...prev, ad_image_url: event.target.value } : prev))}
                                className="rounded-2xl bg-white"
                                placeholder="/render/image/public/..."
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="category-ad-html">Custom HTML</Label>
                              <Textarea
                                id="category-ad-html"
                                value={categoryForm.ad_html_code}
                                onChange={(event) => setCategoryForm((prev) => (prev ? { ...prev, ad_html_code: event.target.value } : prev))}
                                className="min-h-[160px] rounded-[24px] bg-white font-mono text-sm"
                                placeholder="<div>Optionales HTML für Kategorie-CTA …</div>"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-5 xl:sticky xl:top-6">
                        <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                          <p className="text-sm font-semibold text-slate-900">Status & Struktur</p>
                          <div className="mt-4 space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="category-sort-order">Sortierung</Label>
                              <Input
                                id="category-sort-order"
                                type="number"
                                value={categoryForm.sort_order}
                                onChange={(event) => setCategoryForm((prev) => (prev ? { ...prev, sort_order: Number(event.target.value || 0) } : prev))}
                                className="rounded-2xl bg-white"
                              />
                            </div>

                            <div className="flex items-center justify-between rounded-[22px] border border-slate-200 bg-white px-4 py-3">
                              <Label htmlFor="category-active" className="text-sm font-semibold text-slate-800">
                                Öffentlich aktiv
                              </Label>
                              <Switch
                                id="category-active"
                                checked={categoryForm.is_active}
                                onCheckedChange={(checked) => setCategoryForm((prev) => (prev ? { ...prev, is_active: checked } : prev))}
                              />
                            </div>

                            <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-4 text-sm leading-7 text-slate-600">
                              <p><strong>URL:</strong> /forum/kategorie/{categoryForm.slug || "slug"}</p>
                              <p><strong>Threads:</strong> {categoryForm.id ? categoryThreadCounts.get(categoryForm.id) || 0 : 0}</p>
                            </div>

                            <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-4">
                              <Button variant="outline" className="rounded-2xl" onClick={resetCategoryForm}>
                                Reset
                              </Button>
                              <Button
                                onClick={() => categoryForm && saveCategory.mutate(categoryForm)}
                                disabled={saveCategory.isPending}
                                className="flex-1 rounded-2xl bg-[#FF4B2C] px-6 text-white hover:bg-[#e64124]"
                              >
                                <Save className="h-4 w-4" />
                                {saveCategory.isPending ? "Speichert…" : "Kategorie speichern"}
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                          <p className="text-sm font-semibold text-slate-900">SEO</p>
                          <div className="mt-4 space-y-4">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between gap-3">
                                <Label htmlFor="category-seo-title">SEO Title</Label>
                                <span className="text-xs text-slate-500">{categoryForm.seo_title.length}/60</span>
                              </div>
                              <Input
                                id="category-seo-title"
                                value={categoryForm.seo_title}
                                onChange={(event) => setCategoryForm((prev) => (prev ? { ...prev, seo_title: event.target.value } : prev))}
                                className="rounded-2xl bg-white"
                                placeholder="Max. ~60 Zeichen"
                              />
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between gap-3">
                                <Label htmlFor="category-seo-description">SEO Description</Label>
                                <span className="text-xs text-slate-500">{categoryForm.seo_description.length}/155</span>
                              </div>
                              <Textarea
                                id="category-seo-description"
                                value={categoryForm.seo_description}
                                onChange={(event) => setCategoryForm((prev) => (prev ? { ...prev, seo_description: event.target.value } : prev))}
                                className="min-h-[140px] rounded-[24px] bg-white"
                                placeholder="Max. ~155 Zeichen"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
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
