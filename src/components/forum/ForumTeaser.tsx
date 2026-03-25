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
import { resolveHomepageSectionStyleVarsFromSettings } from "@/lib/homepage-section-styles";

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
  const { getJsonSetting, settings } = useSiteSettings();
  const sectionStyleVars = resolveHomepageSectionStyleVarsFromSettings(settings, "forum");
  const content = getJsonSetting("forum_teaser_content", defaultForumTeaserContent);

  return (
    <section className="homepage-style-scope surface-section-shell relative overflow-hidden py-20" style={sectionStyleVars}>
      <div className="section-container relative">
        <div className="surface-card-shell overflow-hidden rounded-[40px] border shadow-[0_40px_120px_-70px_rgba(14,31,83,0.36)]">
          <div className="border-b border-border px-6 py-8 md:px-10 md:py-10" style={{ background: "var(--surface-card)" }}>
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <Badge className="rounded-full border-none px-4 py-1.5 text-[11px] uppercase tracking-[0.24em]" style={{ background: 'var(--theme-secondary-hex)', color: 'hsl(var(--secondary-foreground))' }}>
                  <Sparkles className="mr-2 h-3.5 w-3.5" />
                  {content.badge}
                </Badge>
                <h2 className="homepage-section-title mt-5 text-3xl font-black tracking-tight md:text-4xl">{content.title}</h2>
                <p className="homepage-section-muted mt-4 max-w-2xl text-base leading-8 md:text-lg">{content.description}</p>
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
                  <Card key={index} className="surface-card-shell overflow-hidden rounded-[28px] border shadow-sm">
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
                      <Card className="surface-card-shell flex h-full flex-col overflow-hidden rounded-[28px] border shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_30px_70px_-45px_rgba(14,31,83,0.34)]">
                        {imageUrl ? (
                          <div className="relative aspect-[16/9] overflow-hidden" style={{ background: 'color-mix(in srgb, var(--surface-section) 78%, transparent)' }}>
                            <img
                              src={imageUrl}
                              alt={thread.featured_image_alt || thread.title}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                              loading="lazy"
                            />
                          </div>
                        ) : (
                          <div className="support-dark-card flex aspect-[16/9] items-end p-6">
                            <span className="inline-flex rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.22em]" style={{ border: '1px solid color-mix(in srgb, hsl(var(--secondary-foreground)) 18%, transparent)', background: 'color-mix(in srgb, hsl(var(--secondary-foreground)) 10%, transparent)', color: 'color-mix(in srgb, hsl(var(--secondary-foreground)) 86%, transparent)' }}>
                              {content.fallback_chip}
                            </span>
                          </div>
                        )}

                        <CardContent className="flex flex-1 flex-col p-6">
                          <div className="mb-4 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                            <span className="surface-author-badge rounded-full px-3 py-1 font-semibold">
                              {thread.author_name || content.fallback_author}
                            </span>
                            {thread.category?.name ? (
                              <span className="surface-accent-badge rounded-full px-3 py-1 font-semibold">
                                {thread.category.name}
                              </span>
                            ) : null}
                          </div>

                          <h3 className="text-xl font-black tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary">
                            {thread.title}
                          </h3>
                          <p className="mt-4 line-clamp-3 text-sm leading-7 text-muted-foreground">{snippet}</p>

                          <div className="mt-auto flex flex-wrap items-center gap-3 pt-6 text-sm text-muted-foreground">
                            <span className="surface-meta-pill inline-flex items-center gap-1.5 rounded-full px-3 py-2">
                              <Eye className="theme-accent-icon h-4 w-4" />
                              {thread.views || 0}
                            </span>
                            <span className="surface-meta-pill inline-flex items-center gap-1.5 rounded-full px-3 py-2">
                              <Clock3 className="theme-accent-icon h-4 w-4" />
                              {formatDate(thread.last_activity_at || thread.created_at)}
                            </span>
                            <span className="surface-meta-pill inline-flex items-center gap-1.5 rounded-full px-3 py-2">
                              <MessageSquare className="theme-accent-icon h-4 w-4" />
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
