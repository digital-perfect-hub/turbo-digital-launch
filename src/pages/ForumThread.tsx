import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Clock3, Eye, Heart, Lock, MessageSquare } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import ForumSidebar from "@/components/forum/ForumSidebar";
import { FadeIn } from "@/components/ui/FadeIn";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import {
  useAddForumReply,
  useForumCategories,
  useForumRedirect,
  useForumReplies,
  useForumThread,
  useToggleForumReplyLike,
} from "@/hooks/useForum";
import { getForumRenderImageUrl, sanitizeForumHtml } from "@/lib/forumHtml";

const formatDate = (value?: string | null) =>
  value
    ? new Intl.DateTimeFormat("de-DE", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(new Date(value))
    : "";

const formatAuthorInitials = (value?: string | null) =>
  (value || "DP")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk.charAt(0).toUpperCase())
    .join("");

const buildAbsoluteUrl = (path: string) =>
  typeof window !== "undefined" ? `${window.location.origin}${path}` : path;

const stripHtml = (value?: string | null) =>
  (value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const ForumThreadPage = () => {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [replyValue, setReplyValue] = useState("");

  const { data: thread, isLoading: threadLoading, notFound } = useForumThread(slug);
  const { data: categories = [] } = useForumCategories();
  const { data: replies = [], isLoading: repliesLoading } = useForumReplies(thread?.id);
  const redirectQuery = useForumRedirect(slug ? `/forum/${slug}` : undefined, notFound);
  const addReply = useAddForumReply(thread?.id);
  const toggleLike = useToggleForumReplyLike(thread?.id);

  useEffect(() => {
    if (!redirectQuery.data?.target_path) return;
    navigate(redirectQuery.data.target_path, { replace: true });
  }, [navigate, redirectQuery.data?.target_path]);

  const sanitizedHtml = useMemo(
    () => sanitizeForumHtml(thread?.raw_html_content || thread?.content || ""),
    [thread?.raw_html_content, thread?.content],
  );

  const plainTextBody = useMemo(
    () => stripHtml(thread?.raw_html_content || thread?.content || "").slice(0, 5000),
    [thread?.raw_html_content, thread?.content],
  );

  const seoTitle = notFound
    ? "Beitrag nicht gefunden | Digital-Perfect Forum"
    : thread?.seo_title || `${thread?.title || "Forum"} | Digital-Perfect`;

  const seoDescription = notFound
    ? "Der angeforderte Forum-Beitrag ist nicht aktiv oder nicht mehr verfügbar."
    : thread?.seo_description || plainTextBody.slice(0, 155) || "Forum-Beitrag bei Digital-Perfect";

  const heroImageUrl = getForumRenderImageUrl(thread?.featured_image_url, 1536, 82);
  const canonicalPath = notFound ? "/forum" : location.pathname;

  const structuredData = useMemo(() => {
    if (!thread) {
      return {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: seoTitle,
        description: seoDescription,
        url: buildAbsoluteUrl(canonicalPath),
      };
    }

    const breadcrumbs = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Startseite",
          item: buildAbsoluteUrl("/"),
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Forum",
          item: buildAbsoluteUrl("/forum"),
        },
        ...(thread.category
          ? [
              {
                "@type": "ListItem",
                position: 3,
                name: thread.category.name,
                item: buildAbsoluteUrl(`/forum/kategorie/${thread.category.slug}`),
              },
              {
                "@type": "ListItem",
                position: 4,
                name: thread.title,
                item: buildAbsoluteUrl(`/forum/${thread.slug}`),
              },
            ]
          : [
              {
                "@type": "ListItem",
                position: 3,
                name: thread.title,
                item: buildAbsoluteUrl(`/forum/${thread.slug}`),
              },
            ]),
      ],
    };

    const discussion = {
      "@context": "https://schema.org",
      "@type": "DiscussionForumPosting",
      headline: thread.title,
      articleBody: plainTextBody,
      datePublished: thread.created_at,
      dateModified: thread.updated_at || thread.created_at,
      author: {
        "@type": "Person",
        name: thread.author_name || "Digital-Perfect",
      },
      interactionStatistic: [
        {
          "@type": "InteractionCounter",
          interactionType: "https://schema.org/CommentAction",
          userInteractionCount: replies.length,
        },
        {
          "@type": "InteractionCounter",
          interactionType: "https://schema.org/ViewAction",
          userInteractionCount: thread.views || 0,
        },
      ],
      mainEntityOfPage: buildAbsoluteUrl(`/forum/${thread.slug}`),
      ...(heroImageUrl ? { image: buildAbsoluteUrl(heroImageUrl) } : {}),
    };

    return [breadcrumbs, discussion];
  }, [canonicalPath, heroImageUrl, plainTextBody, replies.length, seoDescription, seoTitle, thread]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = replyValue.trim();
    if (!value) return;
    await addReply.mutateAsync(value);
    setReplyValue("");
  };

  return (
    <>
      <SEO
        title={seoTitle}
        description={seoDescription}
        image={thread?.featured_image_url || undefined}
        canonical={buildAbsoluteUrl(canonicalPath)}
        noIndex={notFound}
        structuredData={structuredData}
      />
      <div className="min-h-screen bg-background">
        <Header forceSolid />
        <main className="pb-20 pt-32">
          <section className="section-container">
            <div className="mb-8">
              <Button asChild variant="ghost" className="rounded-full px-0 text-slate-600 hover:bg-transparent hover:text-[#0E1F53]">
                <Link to={thread?.category?.slug ? `/forum/kategorie/${thread.category.slug}` : "/forum"} className="inline-flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4 text-[#FF4B2C]" />
                  Zurück zum Forum
                </Link>
              </Button>
            </div>

            <div className="mb-8">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to="/">Startseite</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to="/forum">Forum</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  {thread?.category ? (
                    <>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                          <Link to={`/forum/kategorie/${thread.category.slug}`}>{thread.category.name}</Link>
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                    </>
                  ) : null}
                  {!threadLoading ? (
                    <>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbPage>{thread?.title || "Beitrag nicht gefunden"}</BreadcrumbPage>
                      </BreadcrumbItem>
                    </>
                  ) : null}
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
              <div className="space-y-8">
                {threadLoading ? (
                  <Card className="overflow-hidden rounded-[32px] border-slate-200/80 bg-white shadow-sm">
                    <Skeleton className="aspect-[16/8] w-full" />
                    <CardContent className="space-y-4 p-8">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-12 w-5/6" />
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-5 w-4/5" />
                    </CardContent>
                  </Card>
                ) : thread ? (
                  <>
                    <FadeIn>
                      <article className="overflow-hidden rounded-[34px] border border-slate-200/80 bg-white shadow-[0_32px_90px_-54px_rgba(14,31,83,0.32)]">
                        {heroImageUrl ? (
                          <div className="relative aspect-[16/7] overflow-hidden bg-slate-100">
                            <img
                              src={heroImageUrl}
                              alt={thread.featured_image_alt || thread.title}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-slate-950/10 to-transparent" />
                          </div>
                        ) : null}

                        <div className="p-6 md:p-10">
                          <div className="mb-6 flex flex-wrap items-center gap-3">
                            {thread.category ? (
                              <Badge variant="outline" className="rounded-full border-[#FF4B2C]/20 bg-[#FF4B2C]/5 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-[#FF4B2C]">
                                {thread.category.name}
                              </Badge>
                            ) : null}
                            {thread.is_locked ? (
                              <Badge className="rounded-full border-none bg-slate-950 px-3 py-1 text-white">
                                <Lock className="mr-1 h-3.5 w-3.5" />
                                Geschlossen
                              </Badge>
                            ) : null}
                          </div>

                          <h1 className="max-w-4xl text-3xl font-black tracking-tight text-slate-950 md:text-5xl">
                            {thread.title}
                          </h1>

                          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2">
                              <Clock3 className="h-4 w-4 text-[#FF4B2C]" />
                              {formatDate(thread.created_at)}
                            </span>
                            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2">
                              <Eye className="h-4 w-4 text-[#FF4B2C]" />
                              {thread.views || 0} Ansichten
                            </span>
                            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2">
                              <MessageSquare className="h-4 w-4 text-[#FF4B2C]" />
                              {replies.length} Antworten
                            </span>
                          </div>

                          <div className="mt-8 flex items-center gap-4 rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
                            <Avatar className="h-12 w-12 border border-slate-200 bg-white">
                              <AvatarFallback className="bg-[#0E1F53] font-semibold text-white">
                                {formatAuthorInitials(thread.author_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-semibold text-slate-950">{thread.author_name || "Digital-Perfect"}</p>
                              <p className="text-sm text-slate-500">Redaktioneller Community-Beitrag</p>
                            </div>
                          </div>

                          <div
                            className="forum-html prose prose-slate mt-10 max-w-none prose-headings:font-black prose-a:text-[#FF4B2C] prose-a:no-underline hover:prose-a:text-[#0E1F53] prose-img:rounded-[24px] prose-img:shadow-md"
                            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
                          />
                        </div>
                      </article>
                    </FadeIn>

                    <FadeIn delay={0.04}>
                      <section className="rounded-[32px] border border-slate-200/80 bg-white p-6 shadow-sm md:p-8">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <h2 className="text-2xl font-black tracking-tight text-slate-950">Diskussion & Antworten</h2>
                            <p className="mt-2 text-sm leading-7 text-slate-600">
                              Teile deine Einschätzung oder ergänze konkrete Praxiserfahrungen für andere Leser.
                            </p>
                          </div>
                          <Badge variant="outline" className="rounded-full border-slate-200 px-3 py-1 text-slate-600">
                            {replies.length} Antworten
                          </Badge>
                        </div>

                        <div className="mt-8 space-y-4">
                          {repliesLoading ? (
                            Array.from({ length: 3 }).map((_, index) => (
                              <Card key={index} className="rounded-[24px] border-slate-200/80 bg-slate-50/60 shadow-none">
                                <CardContent className="space-y-4 p-6">
                                  <Skeleton className="h-10 w-40" />
                                  <Skeleton className="h-5 w-full" />
                                  <Skeleton className="h-5 w-4/5" />
                                </CardContent>
                              </Card>
                            ))
                          ) : replies.length ? (
                            replies.map((reply) => (
                              <Card key={reply.id} className="rounded-[24px] border-slate-200/80 bg-slate-50/60 shadow-none">
                                <CardContent className="p-6">
                                  <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                      <Avatar className="h-11 w-11 border border-slate-200 bg-white">
                                        <AvatarFallback className="bg-[#FF4B2C] font-semibold text-white">
                                          {formatAuthorInitials(reply.author_name)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <p className="text-sm font-semibold text-slate-950">{reply.author_name || "Mitglied"}</p>
                                        <p className="text-sm text-slate-500">{formatDate(reply.created_at)}</p>
                                      </div>
                                    </div>

                                    <Button
                                      variant="outline"
                                      className="rounded-full border-slate-200 bg-white px-4 text-slate-600 hover:border-[#FF4B2C]/30 hover:text-[#FF4B2C]"
                                      onClick={() => toggleLike.mutate(reply)}
                                      disabled={toggleLike.isPending}
                                    >
                                      <Heart
                                        className={`mr-2 h-4 w-4 ${reply.user_has_liked ? "fill-[#FF4B2C] text-[#FF4B2C]" : ""}`}
                                      />
                                      {reply.like_count}
                                    </Button>
                                  </div>

                                  <div className="mt-5 whitespace-pre-wrap text-base leading-8 text-slate-700">{reply.content}</div>
                                </CardContent>
                              </Card>
                            ))
                          ) : (
                            <Card className="rounded-[24px] border-dashed border-slate-200 bg-slate-50/60 shadow-none">
                              <CardContent className="px-6 py-12 text-center">
                                <h3 className="text-lg font-semibold text-slate-950">Noch keine Antworten vorhanden</h3>
                                <p className="mt-3 text-sm leading-7 text-slate-600">
                                  Sei der Erste, der eine konkrete Einschätzung oder Ergänzung zu diesem Thema teilt.
                                </p>
                              </CardContent>
                            </Card>
                          )}
                        </div>

                        <div className="mt-8 rounded-[28px] border border-slate-200 bg-slate-50/80 p-5 md:p-6">
                          {user ? (
                            <form className="space-y-4" onSubmit={handleSubmit}>
                              <div>
                                <h3 className="text-xl font-black tracking-tight text-slate-950">Antwort schreiben</h3>
                                <p className="mt-2 text-sm leading-7 text-slate-600">
                                  Halte deine Antwort konkret, hilfreich und lesbar. Mehrwert schlägt Fülltext.
                                </p>
                              </div>
                              <Textarea
                                value={replyValue}
                                onChange={(event) => setReplyValue(event.target.value)}
                                placeholder="Teile deine Einschätzung, Erfahrung oder Ergänzung..."
                                className="min-h-[180px] rounded-[24px] border-slate-200 bg-white px-5 py-4 text-base shadow-none focus-visible:ring-[#FF4B2C]/20"
                              />
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                                  Qualität vor Masse · klare, sachliche Antworten
                                </p>
                                <Button
                                  type="submit"
                                  className="rounded-full bg-[#FF4B2C] px-6 text-white hover:bg-[#ff5f44]"
                                  disabled={addReply.isPending || thread.is_locked}
                                >
                                  {thread.is_locked ? "Thread geschlossen" : addReply.isPending ? "Wird gesendet..." : "Antwort veröffentlichen"}
                                </Button>
                              </div>
                            </form>
                          ) : (
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                              <div>
                                <h3 className="text-xl font-black tracking-tight text-slate-950">Du willst antworten?</h3>
                                <p className="mt-2 text-sm leading-7 text-slate-600">
                                  Melde dich an, um dich an der Diskussion zu beteiligen und Likes zu setzen.
                                </p>
                              </div>
                              <Button asChild className="rounded-full bg-[#0E1F53] px-6 text-white hover:bg-[#162a69]">
                                <Link to="/login">Zum Login</Link>
                              </Button>
                            </div>
                          )}
                        </div>
                      </section>
                    </FadeIn>
                  </>
                ) : (
                  <Card className="overflow-hidden rounded-[28px] border-slate-200/80 bg-white shadow-sm">
                    <CardContent className="flex flex-col items-center justify-center px-6 py-16 text-center">
                      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#FF4B2C]/8">
                        <MessageSquare className="h-8 w-8 text-[#FF4B2C]" />
                      </div>
                      <h2 className="text-2xl font-black tracking-tight text-slate-950">Beitrag nicht gefunden</h2>
                      <p className="mt-3 max-w-xl text-base leading-8 text-slate-600">
                        Dieser Forenbeitrag ist nicht aktiv, wurde verschoben oder existiert nicht mehr.
                      </p>
                      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                        <Button asChild className="rounded-full bg-[#FF4B2C] px-6 text-white hover:bg-[#ff5f44]">
                          <Link to="/forum">Zur Forum-Übersicht</Link>
                        </Button>
                        <Button asChild variant="outline" className="rounded-full border-slate-200 px-6">
                          <Link to="/">Zur Startseite</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div>
                <ForumSidebar categories={categories} activeCategorySlug={thread?.category?.slug} />
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default ForumThreadPage;
