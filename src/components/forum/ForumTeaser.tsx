import { Link } from "react-router-dom";
import { ArrowRight, Clock3, Eye, MessageSquare, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useForumFeaturedThreads } from "@/hooks/useForum";
import { getForumRenderImageUrl } from "@/lib/forumHtml";
import { defaultForumTeaserContent, useSiteSettings } from "@/hooks/useSiteSettings";
import { stripHtmlToText } from "@/lib/content";

const formatDate = (value?: string | null) =>
  value
    ? new Intl.DateTimeFormat("de-DE", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(value))
    : "";

const getSnippet = (value?: string | null, fallback?: string | null, emptyText = defaultForumTeaserContent.empty_text) => {
  const source = stripHtmlToText(value) || stripHtmlToText(fallback);
  if (!source) return emptyText;
  return source.length > 140 ? `${source.slice(0, 137).trimEnd()}...` : source;
};

const ForumTeaser = () => {
  const { data: threads = [], isLoading } = useForumFeaturedThreads(3);
  const { getJsonSetting } = useSiteSettings();
  const content = getJsonSetting("forum_teaser_content", defaultForumTeaserContent);

  return (
    <section className="relative overflow-hidden py-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,75,44,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(14,31,83,0.10),transparent_38%)]" />
      <div className="section-container relative">
        <div className="overflow-hidden rounded-[40px] border border-slate-200/80 bg-white shadow-[0_40px_120px_-70px_rgba(14,31,83,0.36)]">
          <div className="border-b border-slate-200/80 bg-[linear-gradient(135deg,#ffffff_0%,#f8fafc_55%,rgba(255,75,44,0.05)_100%)] px-6 py-8 md:px-10 md:py-10">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <Badge className="rounded-full border-none bg-[#0E1F53] px-4 py-1.5 text-[11px] uppercase tracking-[0.24em] text-white">
                  <Sparkles className="mr-2 h-3.5 w-3.5" />
                  {content.badge}
                </Badge>
                <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">{content.title}</h2>
                <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600 md:text-lg">{content.description}</p>
              </div>

              <Button asChild className="btn-primary rounded-full px-7">
                <Link to={content.cta_link || "/forum"} className="inline-flex items-center gap-2">
                  {content.cta_text}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-6 p-6 md:p-10 lg:grid-cols-3">
            {isLoading
              ? Array.from({ length: 3 }).map((_, index) => (
                  <Card key={index} className="overflow-hidden rounded-[28px] border-slate-200/80 bg-white shadow-sm">
                    <Skeleton className="aspect-[16/9] w-full" />
                    <CardContent className="space-y-4 p-6">
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-7 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                    </CardContent>
                  </Card>
                ))
              : threads.map((thread) => {
                  const imageUrl = getForumRenderImageUrl(thread.featured_image_url, 960, 80);
                  const snippet = getSnippet(thread.seo_description || thread.raw_html_content, thread.content, content.empty_text);

                  return (
                    <Link key={thread.id} to={`/forum/${thread.slug}`} className="group block h-full">
                      <Card className="flex h-full flex-col overflow-hidden rounded-[28px] border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_30px_70px_-45px_rgba(14,31,83,0.34)]">
                        {imageUrl ? (
                          <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
                            <img
                              src={imageUrl}
                              alt={thread.featured_image_alt || thread.title}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-slate-950/10 to-transparent" />
                          </div>
                        ) : (
                          <div className="flex aspect-[16/9] items-end bg-[radial-gradient(circle_at_top_left,rgba(255,75,44,0.16),transparent_30%),linear-gradient(135deg,#0E1F53_0%,#182f70_100%)] p-6 text-white">
                            <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-white/85">
                              {content.fallback_chip}
                            </span>
                          </div>
                        )}

                        <CardContent className="flex flex-1 flex-col p-6">
                          <div className="mb-4 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                            <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-[#0E1F53]">
                              {thread.author_name || content.fallback_author}
                            </span>
                            {thread.category?.name ? (
                              <span className="rounded-full bg-[#FF4B2C]/8 px-3 py-1 font-semibold text-[#FF4B2C]">
                                {thread.category.name}
                              </span>
                            ) : null}
                          </div>

                          <h3 className="text-xl font-black tracking-tight text-slate-950 transition-colors duration-300 group-hover:text-[#0E1F53]">
                            {thread.title}
                          </h3>
                          <p className="mt-4 line-clamp-3 text-sm leading-7 text-slate-600">{snippet}</p>

                          <div className="mt-auto flex flex-wrap items-center gap-3 pt-6 text-sm text-slate-500">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-2">
                              <Eye className="h-4 w-4 text-[#FF4B2C]" />
                              {thread.views || 0}
                            </span>
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-2">
                              <Clock3 className="h-4 w-4 text-[#FF4B2C]" />
                              {formatDate(thread.last_activity_at || thread.created_at)}
                            </span>
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-2">
                              <MessageSquare className="h-4 w-4 text-[#FF4B2C]" />
                              {thread.reply_count}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForumTeaser;
