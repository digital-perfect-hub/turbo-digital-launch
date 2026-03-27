import { useEffect, useMemo, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Database, TablesInsert } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { useSiteContext } from "@/context/SiteContext";
import { DEFAULT_SITE_ID } from "@/lib/site";
import { isForumThreadPubliclyVisible } from "@/lib/forumSchedule";

type ForumCategoryRow = Database["public"]["Tables"]["forum_categories"]["Row"];
type ForumThreadRow = Database["public"]["Tables"]["forum_threads"]["Row"];
type ForumReplyRow = Database["public"]["Tables"]["forum_replies"]["Row"];
type ForumRedirectRow = Database["public"]["Tables"]["forum_redirects"]["Row"];

export type ForumCategory = ForumCategoryRow & {
  thread_count: number;
};

export type ForumThreadListItem = ForumThreadRow & {
  category?: Pick<ForumCategoryRow, "id" | "name" | "slug"> | null;
  reply_count: number;
};

export type ForumThreadDetail = ForumThreadRow & {
  category?: Pick<ForumCategoryRow, "id" | "name" | "slug" | "description"> | null;
};

export type ForumFeaturedThread = ForumThreadListItem;

export type ForumReply = ForumReplyRow & {
  like_count: number;
  user_has_liked: boolean;
};

export type ForumRedirect = Pick<ForumRedirectRow, "target_path" | "entity_type">;

const isThreadPublished = (thread: Pick<ForumThreadRow, "is_active" | "status" | "admin_notes">) =>
  thread.is_active === true && isForumThreadPubliclyVisible(thread.status, thread.admin_notes);

const formatAuthorName = (user: { email?: string | null; user_metadata?: Record<string, unknown> } | null) => {
  if (!user) return "Mitglied";
  const fullName =
    (typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name) ||
    (typeof user.user_metadata?.name === "string" && user.user_metadata.name);
  if (fullName && fullName.trim()) return fullName.trim();

  const email = user.email || "";
  if (email.includes("@")) return email.split("@")[0];

  return "Mitglied";
};

const normalizeForumErrorMessage = (error: unknown, fallback: string) => {
  const message =
    typeof error === "object" && error && "message" in error && typeof (error as { message?: unknown }).message === "string"
      ? (error as { message: string }).message
      : "";

  if (!message) return fallback;

  if (message.includes("forum_rate_limit_reply")) return "Bitte warte kurz, bevor du die nächste Antwort sendest.";
  if (message.includes("forum_rate_limit_like")) return "Du bist gerade zu schnell unterwegs. Warte bitte einen Moment vor dem nächsten Like.";
  if (message.includes("forum_reply_locked")) return "Dieser Thread ist geschlossen. Neue Antworten sind hier aktuell nicht möglich.";
  if (message.includes("forum_reply_min_length")) return "Deine Antwort ist noch zu kurz. Schreib bitte etwas Substanzielleres.";
  if (message.includes("forum_reply_max_length")) return "Deine Antwort ist zu lang. Kürze sie bitte etwas.";
  if (message.includes("forum_reply_url_limit")) return "Zu viele Links in einer Antwort. Bitte reduziere die Anzahl der URLs.";
  if (message.includes("forum_reply_duplicate")) return "Diese Antwort wurde so oder sehr ähnlich schon gepostet.";
  if (message.includes("forum_reply_burst_limit")) return "Zu viele Antworten in kurzer Zeit. Warte bitte kurz, bevor du weiterschreibst.";
  if (message.includes("forum_like_own_reply")) return "Eigene Antworten kannst du nicht liken.";
  if (message.includes("forum_like_reply_unavailable")) return "Dieser Beitrag kann aktuell nicht geliked werden.";

  return message || fallback;
};

export const useForumCategories = () => {
  const { activeSiteId } = useSiteContext();
  const siteId = activeSiteId || DEFAULT_SITE_ID;

  return useQuery({
    queryKey: ["forum-categories", siteId],
    queryFn: async (): Promise<ForumCategory[]> => {
      const [{ data: categories, error: categoriesError }, { data: threadRows, error: threadRowsError }] =
        await Promise.all([
          supabase
             .from("forum_categories")
            .select("*")
            .eq("site_id", siteId)
            .eq("is_active", true)
            .order("sort_order", { ascending: true })
            .order("name", { ascending: true }),
          supabase.from("forum_threads").select("category_id, is_active, status, admin_notes").eq("site_id", siteId),
        ]);

      if (categoriesError) throw categoriesError;
      if (threadRowsError) throw threadRowsError;

      const counts = new Map<string, number>();
      (threadRows || []).forEach((thread) => {
        if (thread.category_id && isThreadPublished(thread)) {
          counts.set(thread.category_id, (counts.get(thread.category_id) || 0) + 1);
        }
      });

      return (categories || []).map((category) => ({
        ...category,
        thread_count: counts.get(category.id) || 0,
      }));
    },
  });
};

export const useForumFeaturedThreads = (limit = 3) => {
  const { activeSiteId } = useSiteContext();
  const siteId = activeSiteId || DEFAULT_SITE_ID;

  return useQuery({
    queryKey: ["forum-featured-threads", siteId, limit],
    queryFn: async (): Promise<ForumFeaturedThread[]> => {
      const { data: threads, error: threadsError } = await supabase
         .from("forum_threads")
        .select("*")
        .eq("site_id", siteId)
        .eq("is_active", true)
        .in("status", ["published", "scheduled"])
        .order("views", { ascending: false })
        .order("last_activity_at", { ascending: false })
        .limit(limit);

      if (threadsError) throw threadsError;

      const visibleThreads = (threads || []).filter((thread) => isThreadPublished(thread));

      const threadIds = visibleThreads.map((thread) => thread.id);
      const categoryIds = Array.from(new Set(visibleThreads.map((thread) => thread.category_id).filter(Boolean))) as string[];

      const [{ data: replies, error: repliesError }, { data: categories, error: categoriesError }] = await Promise.all([
        threadIds.length
          ? supabase.from("forum_replies").select("thread_id, is_active, is_spam").eq("site_id", siteId).in("thread_id", threadIds)
          : Promise.resolve({ data: [], error: null }),
        categoryIds.length
          ? supabase.from("forum_categories").select("id, name, slug").eq("site_id", siteId).in("id", categoryIds)
          : Promise.resolve({ data: [], error: null }),
      ]);

      if (repliesError) throw repliesError;
      if (categoriesError) throw categoriesError;

      const replyCounts = new Map<string, number>();
      (replies || []).forEach((reply) => {
        if (reply.thread_id && reply.is_active === true && reply.is_spam === false) {
          replyCounts.set(reply.thread_id, (replyCounts.get(reply.thread_id) || 0) + 1);
        }
      });

      const categoryMap = new Map((categories || []).map((category) => [category.id, category]));

      return visibleThreads.map((thread) => ({
        ...thread,
        category: thread.category_id ? categoryMap.get(thread.category_id) || null : null,
        reply_count: replyCounts.get(thread.id) || 0,
      }));
    },
  });
};

// THE FIX: Added page and limit parameters to prevent data hemorrhage
export const useForumThreads = (categorySlug?: string, page = 1, limit = 50) => {
  const { activeSiteId } = useSiteContext();
  const siteId = activeSiteId || DEFAULT_SITE_ID;

  return useQuery({
    queryKey: ["forum-threads", siteId, categorySlug ?? null, page, limit],
    queryFn: async (): Promise<ForumThreadListItem[]> => {
      let categoryId: string | null = null;

      if (categorySlug) {
        const { data: category, error: categoryError } = await supabase
          .from("forum_categories")
          .select("id")
          .eq("site_id", siteId)
          .eq("slug", categorySlug)
          .eq("is_active", true)
          .maybeSingle();

        if (categoryError) throw categoryError;
        if (!category) return [];
        categoryId = category.id;
      }

      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let threadQuery = supabase
         .from("forum_threads")
        .select("*")
        .eq("site_id", siteId)
        .eq("is_active", true)
        .in("status", ["published", "scheduled"])
        .order("is_pinned", { ascending: false })
        .order("last_activity_at", { ascending: false })
        .range(from, to);

      if (categoryId) {
        threadQuery = threadQuery.eq("category_id", categoryId);
      }

      const { data: threads, error: threadsError } = await threadQuery;
      if (threadsError) throw threadsError;

      const visibleThreads = (threads || []).filter((thread) => isThreadPublished(thread));

      const threadIds = visibleThreads.map((thread) => thread.id);
      const categoryIds = Array.from(new Set(visibleThreads.map((thread) => thread.category_id).filter(Boolean))) as string[];

      const [{ data: replies, error: repliesError }, { data: categories, error: categoriesError }] = await Promise.all([
        threadIds.length
          ? supabase.from("forum_replies").select("thread_id, is_active, is_spam").eq("site_id", siteId).in("thread_id", threadIds)
          : Promise.resolve({ data: [], error: null }),
        categoryIds.length
          ? supabase.from("forum_categories").select("id, name, slug").eq("site_id", siteId).in("id", categoryIds)
          : Promise.resolve({ data: [], error: null }),
      ]);

      if (repliesError) throw repliesError;
      if (categoriesError) throw categoriesError;

      const replyCounts = new Map<string, number>();
      (replies || []).forEach((reply) => {
        if (reply.thread_id && reply.is_active === true && reply.is_spam === false) {
          replyCounts.set(reply.thread_id, (replyCounts.get(reply.thread_id) || 0) + 1);
        }
      });

      const categoryMap = new Map((categories || []).map((category) => [category.id, category]));

      return visibleThreads.map((thread) => ({
        ...thread,
        category: thread.category_id ? categoryMap.get(thread.category_id) || null : null,
        reply_count: replyCounts.get(thread.id) || 0,
      }));
    },
  });
};

export const useForumThread = (slug?: string) => {
  const { activeSiteId } = useSiteContext();
  const siteId = activeSiteId || DEFAULT_SITE_ID;
  const trackedIdRef = useRef<string | null>(null);

  const query = useQuery({
    queryKey: ["forum-thread", siteId, slug ?? null],
    enabled: Boolean(slug),
    retry: false,
    queryFn: async (): Promise<ForumThreadDetail | null> => {
      const { data: thread, error: threadError } = await supabase
        .from("forum_threads")
        .select("*")
        .eq("site_id", siteId)
        .eq("slug", slug as string)
        .eq("is_active", true)
        .in("status", ["published", "scheduled"])
        .maybeSingle();

      if (threadError) throw threadError;
      if (!thread || !isThreadPublished(thread)) return null;

      const category = thread.category_id
        ? await supabase
            .from("forum_categories")
            .select("id, name, slug, description")
            .eq("site_id", siteId)
            .eq("id", thread.category_id)
            .maybeSingle()
        : { data: null, error: null };

      if (category.error) throw category.error;

      return {
        ...thread,
        category: category.data || null,
      };
    },
  });

  useEffect(() => {
    const threadId = query.data?.id;
    if (!threadId || trackedIdRef.current === threadId) return;

    trackedIdRef.current = threadId;
    void supabase.rpc("increment_thread_view", { t_id: threadId });
  }, [query.data?.id]);

  return {
    ...query,
    notFound: query.isSuccess && !query.data,
  };
};

// THE FIX: Added page and limit parameters to prevent data hemorrhage on replies
export const useForumReplies = (threadId?: string, page = 1, limit = 100) => {
  const { user } = useAuth();
  const { activeSiteId } = useSiteContext();
  const siteId = activeSiteId || DEFAULT_SITE_ID;

  return useQuery({
    queryKey: ["forum-replies", siteId, threadId ?? null, user?.id ?? null, page, limit],
    enabled: Boolean(threadId),
    queryFn: async (): Promise<ForumReply[]> => {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data: replies, error: repliesError } = await supabase
        .from("forum_replies")
        .select("*")
        .eq("site_id", siteId)
        .eq("thread_id", threadId as string)
        .eq("is_active", true)
        .eq("is_spam", false)
        .order("created_at", { ascending: true })
        .range(from, to);

      if (repliesError) throw repliesError;

      const replyIds = (replies || []).map((reply) => reply.id);
      if (!replyIds.length) return [];

      const [likesResult, userLikesResult] = await Promise.all([
        supabase.from("forum_reply_likes").select("reply_id").eq("site_id", siteId).in("reply_id", replyIds),
        user?.id
          ? supabase.from("forum_reply_likes").select("reply_id").eq("site_id", siteId).eq("user_id", user.id).in("reply_id", replyIds)
          : Promise.resolve({ data: [], error: null }),
      ]);

      if (likesResult.error) throw likesResult.error;
      if (userLikesResult.error) throw userLikesResult.error;

      const likeCounts = new Map<string, number>();
      (likesResult.data || []).forEach((like) => {
        likeCounts.set(like.reply_id, (likeCounts.get(like.reply_id) || 0) + 1);
      });

      const likedByUser = new Set((userLikesResult.data || []).map((like) => like.reply_id));

      return (replies || []).map((reply) => ({
        ...reply,
        like_count: likeCounts.get(reply.id) || 0,
        user_has_liked: likedByUser.has(reply.id),
      }));
    },
  });
};

export const useForumRedirect = (sourcePath?: string, enabled = true) => {
  return useQuery({
    queryKey: ["forum-redirect", sourcePath ?? null],
    enabled: Boolean(sourcePath) && enabled,
    retry: false,
    queryFn: async (): Promise<ForumRedirect | null> => {
      const { data, error } = await supabase.rpc("resolve_forum_redirect", {
        p_source_path: sourcePath as string,
      });

      if (error) throw error;
      if (!data) return null;

      return {
        target_path: data,
        entity_type: sourcePath?.includes("/kategorie/") ? "category" : "thread",
      };
    },
  });
};

export const useAddForumReply = (threadId?: string) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { activeSiteId } = useSiteContext();
  const siteId = activeSiteId || DEFAULT_SITE_ID;

  return useMutation({
    mutationFn: async (content: string) => {
      const trimmed = content.trim();
      if (!user?.id) throw new Error("Du musst eingeloggt sein, um zu antworten.");
      if (!threadId) throw new Error("Thread-ID fehlt.");
      if (!trimmed) throw new Error("Bitte schreibe zuerst eine Antwort.");

      const payload: TablesInsert<"forum_replies"> = {
        site_id: siteId,
        thread_id: threadId,
        author_id: user.id,
        author_name: formatAuthorName(user),
        content: trimmed,
      };

      const { error } = await supabase.from("forum_replies").insert(payload);
      if (error) throw new Error(normalizeForumErrorMessage(error, "Antwort konnte nicht gespeichert werden."));
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["forum-replies", siteId, threadId ?? null] }),
        queryClient.invalidateQueries({ queryKey: ["forum-threads"] }),
        queryClient.invalidateQueries({ queryKey: ["forum-thread"] }),
        queryClient.invalidateQueries({ queryKey: ["forum-categories"] }),
        queryClient.invalidateQueries({ queryKey: ["forum-featured-threads"] }),
      ]);
      toast.success("Antwort veröffentlicht.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Antwort konnte nicht gespeichert werden.");
    },
  });
};

export const useToggleForumReplyLike = (threadId?: string) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { activeSiteId } = useSiteContext();
  const siteId = activeSiteId || DEFAULT_SITE_ID;

  return useMutation({
    mutationFn: async (reply: Pick<ForumReply, "id" | "user_has_liked">) => {
      if (!user?.id) throw new Error("Du musst eingeloggt sein, um Likes zu setzen.");

      if (reply.user_has_liked) {
        const { error } = await supabase
           .from("forum_reply_likes")
          .delete()
          .eq("site_id", siteId)
          .eq("reply_id", reply.id)
          .eq("user_id", user.id);

        if (error) throw new Error(normalizeForumErrorMessage(error, "Like konnte nicht entfernt werden."));
        return;
      }

      const payload: TablesInsert<"forum_reply_likes"> = {
        site_id: siteId,
        reply_id: reply.id,
        user_id: user.id,
      };

      const { error } = await supabase.from("forum_reply_likes").insert(payload);
      if (error) throw new Error(normalizeForumErrorMessage(error, "Like konnte nicht gespeichert werden."));
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["forum-replies", siteId, threadId ?? null, user?.id ?? null] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Like konnte nicht gespeichert werden.");
    },
  });
};

export const useForumOverviewStats = (threads: ForumThreadListItem[], categories: ForumCategory[]) =>
  useMemo(() => {
    const totalReplies = threads.reduce((sum, thread) => sum + thread.reply_count, 0);
    const totalViews = threads.reduce((sum, thread) => sum + (thread.views || 0), 0);
    return {
      categories: categories.length,
      threads: threads.length,
      replies: totalReplies,
      views: totalViews,
    };
  }, [categories, threads]);