import { useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowRight, Clock3, Eye, FolderOpen, MessageSquare, Pin, ShieldCheck } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import ForumSidebar from "@/components/forum/ForumSidebar";
import { FadeIn } from "@/components/ui/FadeIn";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useForumCategories, useForumOverviewStats, useForumRedirect, useForumThreads } from "@/hooks/useForum";
import { getForumRenderImageUrl } from "@/lib/forumHtml";

const formatDate = (value?: string | null) =>
  value
    ? new Intl.DateTimeFormat("de-DE", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(new Date(value))
    : "";

const getInitials = (value?: string | null) =>
  (value || "DP")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk.charAt(0).toUpperCase())
    .join("");

const buildAbsoluteUrl = (path: string) =>
  typeof window !== "undefined" ? `${window.location.origin}${path}` : path;

const ForumPage = () => {
  const { categorySlug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { data: categories = [], isLoading: categoriesLoading } = useForumCategories();
  const { data: threads = [], isLoading: threadsLoading } = useForumThreads(categorySlug);

  const activeCategory = categories.find((category) => category.slug === categorySlug);
  const invalidCategory = Boolean(categorySlug) && !categoriesLoading && !activeCategory;
  const redirectQuery = useForumRedirect(
    categorySlug ? `/forum/kategorie/${categorySlug}` : undefined,
    invalidCategory,
  );

  useEffect(() => {
    if (!redirectQuery.data?.target_path) return;
    navigate(redirectQuery.data.target_path, { replace: true });
  }, [navigate, redirectQuery.data?.target_path]);

  const stats = useForumOverviewStats(threads, categories);

  const pageTitle = invalidCategory
    ? "Kategorie nicht gefunden | Digital-Perfect Forum"
    : activeCategory
      ? `${activeCategory.name} Forum | Digital-Perfect`
      : "Forum für Webdesign, SEO & digitale Strategie | Digital-Perfect";

  const pageDescription = invalidCategory
    ? "Die angeforderte Forum-Kategorie wurde nicht gefunden oder wurde verschoben."
    : activeCategory?.seo_description ||
      activeCategory?.description ||
      "Aktuelle Beiträge, Strategien und Praxiswissen zu Webdesign, SEO, Conversion und digitaler Skalierung im Digital-Perfect Forum.";

  const canonicalPath = invalidCategory ? "/forum" : location.pathname;
  const shouldNoIndex = invalidCategory || (Boolean(categorySlug) && Boolean(activeCategory) && threads.length === 0);

  const structuredData = useMemo(() => {
    if (invalidCategory) {
      return {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: pageTitle,
        description: pageDescription,
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
        ...(activeCategory
          ? [
              {
                "@type": "ListItem",
                position: 3,
                name: activeCategory.name,
                item: buildAbsoluteUrl(`/forum/kategorie/${activeCategory.slug}`),
              },
            ]
          : []),
      ],
    };

    const collection = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: pageTitle,
      description: pageDescription,
      url: buildAbsoluteUrl(canonicalPath),
      mainEntity: {
        "@type": "ItemList",
        itemListElement: threads.slice(0, 10).map((thread, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: buildAbsoluteUrl(`/forum/${thread.slug}`),
          name: thread.title,
        })),
      },
    };

    return [breadcrumbs, collection];
  }, [activeCategory, canonicalPath, invalidCategory, pageDescription, pageTitle, threads]);

  return (
    <>
      <SEO
        title={pageTitle}
        description={pageDescription}
        canonical={buildAbsoluteUrl(canonicalPath)}
        noIndex={shouldNoIndex}
        structuredData={structuredData}
      />
      <div className="min-h-screen bg-background">
        <Header forceSolid />
        <main className="pb-20 pt-32">
          <section className="section-container">
            <FadeIn>
              <div className="premium-card overflow-hidden rounded-[34px] border border-slate-200/80 px-6 py-8 md:px-10 md:py-12">
                <Breadcrumb className="mb-6">
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <Link to="/">Startseite</Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      {activeCategory ? (
                        <BreadcrumbLink asChild>
                          <Link to="/forum">Forum</Link>
                        </BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage>Forum</BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                    {activeCategory ? (
                      <>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                          <BreadcrumbPage>{activeCategory.name}</BreadcrumbPage>
                        </BreadcrumbItem>
                      </>
                    ) : null}
                  </BreadcrumbList>
                </Breadcrumb>

                <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
                  <div>
                    <Badge variant="outline" className="mb-5 rounded-full border-[#FF4B2C]/20 bg-[#FF4B2C]/5 px-3 py-1 text-[11px] uppercase tracking-[0.26em] text-[#FF4B2C]">
                      Digital-Perfect Forum
                    </Badge>
                    <h1 className="max-w-4xl text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
                      {invalidCategory
                        ? "Kategorie nicht gefunden"
                        : activeCategory
                          ? activeCategory.name
                          : "Praxiswissen für Webdesign, SEO & digitale Skalierung"}
                    </h1>
                    <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
                      {invalidCategory
                        ? "Dieser Themenbereich ist nicht aktiv, wurde verschoben oder existiert nicht mehr."
                        : activeCategory?.description ||
                          "Redaktionelle Threads, reale Erfahrungswerte und klare Architekturmuster für Performance, Sichtbarkeit und Conversion."}
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                    <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Kategorien</p>
                      <p className="mt-2 text-2xl font-black text-slate-950">{stats.categories}</p>
                    </div>
                    <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Threads</p>
                      <p className="mt-2 text-2xl font-black text-slate-950">{stats.threads}</p>
                    </div>
                    <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Antworten</p>
                      <p className="mt-2 text-2xl font-black text-slate-950">{stats.replies}</p>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>

            <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
              <div className="space-y-5">
                {threadsLoading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <Card key={index} className="overflow-hidden rounded-[28px] border-slate-200/80 bg-white/90 shadow-sm">
                      <Skeleton className="aspect-[3/1] w-full" />
                      <CardContent className="p-6">
                        <Skeleton className="mb-3 h-6 w-3/4" />
                        <Skeleton className="mb-2 h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                      </CardContent>
                    </Card>
                  ))
                ) : invalidCategory ? (
                  <Card className="overflow-hidden rounded-[28px] border-slate-200/80 bg-white shadow-sm">
                    <CardContent className="flex flex-col items-center justify-center px-6 py-16 text-center">
                      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#FF4B2C]/8">
                        <FolderOpen className="h-8 w-8 text-[#FF4B2C]" />
                      </div>
                      <h2 className="text-2xl font-black tracking-tight text-slate-950">Kategorie nicht gefunden</h2>
                      <p className="mt-3 max-w-xl text-base leading-8 text-slate-600">
                        Prüfe den Link oder spring direkt zurück in die Forum-Übersicht.
                      </p>
                      <Button asChild className="mt-6 rounded-full bg-[#FF4B2C] px-6 text-white hover:bg-[#ff5f44]">
                        <Link to="/forum">Zur Forum-Übersicht</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ) : threads.length ? (
                  threads.map((thread, index) => {
                    const imageUrl = getForumRenderImageUrl(thread.featured_image_url, 1280, 82);
                    return (
                      <FadeIn key={thread.id} delay={index * 0.03}>
                        <Card className="group overflow-hidden rounded-[28px] border-slate-200/80 bg-white/90 shadow-[0_28px_70px_-48px_rgba(14,31,83,0.28)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_34px_80px_-44px_rgba(255,75,44,0.28)]">
                          <Link to={`/forum/${thread.slug}`} className="block focus:outline-none">
                            <div className="grid gap-0 md:grid-cols-[280px_minmax(0,1fr)]">
                              <div className="relative min-h-[220px] overflow-hidden bg-[linear-gradient(135deg,#f8fafc_0%,#eef2ff_100%)]">
                                {imageUrl ? (
                                  <img
                                    src={imageUrl}
                                    alt={thread.featured_image_alt || thread.title}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                    loading="lazy"
                                  />
                                ) : (
                                  <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,#FF4B2C14,transparent_45%),linear-gradient(135deg,#f8fafc_0%,#eef2ff_100%)] p-8">
                                    <div className="flex h-20 w-20 items-center justify-center rounded-[28px] bg-[#0E1F53] text-2xl font-black text-white shadow-lg">
                                      {getInitials(thread.author_name || thread.title)}
                                    </div>
                                  </div>
                                )}
                                <div className="absolute left-5 top-5 flex flex-wrap gap-2">
                                  {thread.is_pinned ? (
                                    <Badge className="rounded-full border-none bg-[#0E1F53] px-3 py-1 text-white">
                                      <Pin className="mr-1 h-3.5 w-3.5" />
                                      Wichtig
                                    </Badge>
                                  ) : null}
                                  {thread.is_answered ? (
                                    <Badge className="rounded-full border-none bg-emerald-600 px-3 py-1 text-white">
                                      <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                                      Beantwortet
                                    </Badge>
                                  ) : null}
                                </div>
                              </div>

                              <CardContent className="flex flex-col justify-between p-6 md:p-8">
                                <div>
                                  {thread.category ? (
                                    <Badge variant="outline" className="mb-4 rounded-full border-[#FF4B2C]/20 bg-[#FF4B2C]/5 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-[#FF4B2C]">
                                      <FolderOpen className="mr-1 h-3.5 w-3.5" />
                                      {thread.category.name}
                                    </Badge>
                                  ) : null}

                                  <h2 className="text-2xl font-black tracking-tight text-slate-950">{thread.title}</h2>
                                  <p className="mt-4 line-clamp-3 text-base leading-8 text-slate-600">
                                    {thread.seo_description || thread.content}
                                  </p>
                                </div>

                                <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2">
                                    <Clock3 className="h-4 w-4 text-[#FF4B2C]" />
                                    {formatDate(thread.last_activity_at || thread.created_at)}
                                  </span>
                                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2">
                                    <Eye className="h-4 w-4 text-[#FF4B2C]" />
                                    {thread.views || 0} Ansichten
                                  </span>
                                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2">
                                    <MessageSquare className="h-4 w-4 text-[#FF4B2C]" />
                                    {thread.reply_count} Antworten
                                  </span>
                                  <span className="ml-auto inline-flex items-center gap-2 font-semibold text-[#0E1F53]">
                                    Beitrag öffnen
                                    <ArrowRight className="h-4 w-4 text-[#FF4B2C]" />
                                  </span>
                                </div>
                              </CardContent>
                            </div>
                          </Link>
                        </Card>
                      </FadeIn>
                    );
                  })
                ) : (
                  <Card className="overflow-hidden rounded-[28px] border-slate-200/80 bg-white shadow-sm">
                    <CardContent className="flex flex-col items-center justify-center px-6 py-16 text-center">
                      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#FF4B2C]/8">
                        <MessageSquare className="h-8 w-8 text-[#FF4B2C]" />
                      </div>
                      <h2 className="text-2xl font-black tracking-tight text-slate-950">Noch keine Beiträge vorhanden</h2>
                      <p className="mt-3 max-w-xl text-base leading-8 text-slate-600">
                        Diese Kategorie ist angelegt, aber aktuell noch leer. Schau dir in der Zwischenzeit die anderen Themenbereiche an.
                      </p>
                      <Button asChild className="mt-6 rounded-full bg-[#FF4B2C] px-6 text-white hover:bg-[#ff5f44]">
                        <Link to="/forum">Zur Forum-Übersicht</Link>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div>
                {categoriesLoading ? (
                  <Card className="rounded-[28px] border-slate-200/80 bg-white/90 shadow-sm">
                    <CardContent className="space-y-4 p-6">
                      <Skeleton className="h-6 w-36" />
                      <Skeleton className="h-14 w-full" />
                      <Skeleton className="h-14 w-full" />
                      <Skeleton className="h-14 w-full" />
                    </CardContent>
                  </Card>
                ) : (
                  <ForumSidebar categories={categories} activeCategorySlug={categorySlug} />
                )}
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default ForumPage;
