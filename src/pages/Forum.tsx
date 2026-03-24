import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { Clock3, Eye, MessageSquare, Pin, Lock, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import ForumSidebar from "@/components/forum/ForumSidebar";
import { FadeIn } from "@/components/ui/FadeIn";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useForumCategories, useForumThreads } from "@/hooks/useForum";

const formatDate = (value?: string | null) =>
  value
    ? new Intl.DateTimeFormat("de-DE", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(value))
    : "";

const ForumPage = () => {
  const { categorySlug } = useParams();
  
  // Wir nutzen die pagination-fähigen Hooks (aktuell fix auf Seite 1, Limit 50)
  const { data: threads = [], isLoading: threadsLoading } = useForumThreads(categorySlug, 1, 50);
  const { data: categories = [] } = useForumCategories();

  const activeCategory = useMemo(
    () => categories.find((c) => c.slug === categorySlug),
    [categories, categorySlug]
  );

  const seoTitle = activeCategory 
    ? `${activeCategory.seo_title || activeCategory.name} | Digital-Perfect Forum`
    : "Digital-Perfect Community | High-Ticket Strategien & Austausch";
    
  const seoDescription = activeCategory
    ? activeCategory.seo_description || activeCategory.description
    : "Exklusiver Austausch zu High-Ticket-Funnels, Webdesign und Skalierung. Werde Teil der Digital-Perfect Community.";

  return (
    <>
      <SEO title={seoTitle} description={seoDescription} canonical={categorySlug ? `/forum/kategorie/${categorySlug}` : `/forum`} />
      <div className="surface-page-shell min-h-screen">
        <Header forceSolid />
        
        {/* Premium Hero Section */}
        <section className="dark-section relative overflow-hidden pb-20 pt-40 lg:pb-28 lg:pt-48">
          <div className="absolute inset-0 bg-[url('/hero-bg.jpg')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--hero-bg-color) 78%, black 22%) 100%)" }}></div>
          
          <div className="section-container relative z-10 text-center">
            <FadeIn>
              <Badge variant="outline" className="hero-badge mb-6 rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] backdrop-blur-md">
                {activeCategory ? `Kategorie: ${activeCategory.name}` : "Digital-Perfect Community"}
              </Badge>
              <h1 className="hero-headline mx-auto max-w-4xl text-4xl font-black tracking-tight md:text-6xl lg:text-7xl">
                {activeCategory ? activeCategory.name : "Wissen teilt man nicht, man skaliert es."}
              </h1>
              <p className="hero-subheadline mx-auto mt-6 max-w-2xl text-lg leading-relaxed md:text-xl">
                {activeCategory 
                  ? activeCategory.description || "Finde alle relevanten Diskussionen und Deep-Dives zu diesem Thema."
                  : "Der exklusive Space für Strategien, klare Antworten und handfeste Best Practices. Keine Floskeln, nur Ergebnisse."}
              </p>
            </FadeIn>
          </div>
        </section>

        <main className="relative z-20 -mt-8 pb-24">
          <div className="section-container">
            <div className="grid gap-10 lg:grid-cols-[1fr_340px] xl:gap-16">
              
              {/* Threads Feed */}
              <div className="flex flex-col gap-6">
                {threadsLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="surface-card-shell rounded-[32px] border p-6 shadow-sm">
                      <Skeleton className="mb-4 h-6 w-24 rounded-full" />
                      <Skeleton className="mb-3 h-8 w-3/4" />
                      <Skeleton className="mb-6 h-5 w-full" />
                      <div className="flex gap-4"><Skeleton className="h-4 w-20" /><Skeleton className="h-4 w-20" /></div>
                    </div>
                  ))
                ) : threads.length > 0 ? (
                  threads.map((thread, index) => (
                    <FadeIn key={thread.id} delay={index * 0.05}>
                      <Link to={`/forum/${thread.slug}`} className="group block">
                        <article className="surface-card-shell relative overflow-hidden rounded-[32px] border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(15,23,42,0.12)] sm:p-8">
                          
                          {/* Top Meta */}
                          <div className="mb-5 flex flex-wrap items-center gap-3">
                            {thread.is_pinned && (
                              <Badge className="surface-accent-badge rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider shadow-none">
                                <Pin className="mr-1.5 h-3 w-3" /> Angepinnt
                              </Badge>
                            )}
                            {thread.is_locked && (
                              <Badge className="surface-quiet-badge rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider shadow-none">
                                <Lock className="mr-1.5 h-3 w-3" /> Geschlossen
                              </Badge>
                            )}
                            {thread.category && (
                              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                {thread.category.name}
                              </span>
                            )}
                          </div>

                          {/* Content */}
                          <h2 className="text-2xl font-black tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-3xl">
                            {thread.title}
                          </h2>
                          <div className="mt-4 line-clamp-2 text-base leading-relaxed text-muted-foreground">
                            {/* Wir strippen HTML für das Snippet */}
                            {thread.content.replace(/<[^>]+>/g, " ")}
                          </div>

                          {/* Bottom Meta & Action */}
                          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t pt-6" style={{ borderColor: "var(--surface-card-border)" }}>
                            <div className="flex items-center gap-5 text-sm font-medium text-muted-foreground">
                              <span className="flex items-center gap-2">
                                <Clock3 className="theme-accent-icon h-4 w-4" />
                                {formatDate(thread.created_at)}
                              </span>
                              <span className="flex items-center gap-2">
                                <Eye className="theme-accent-icon h-4 w-4" />
                                {thread.views || 0}
                              </span>
                              <span className="flex items-center gap-2">
                                <MessageSquare className="theme-accent-icon h-4 w-4" />
                                {thread.reply_count}
                              </span>
                            </div>
                            
                            <div className="theme-link-accent flex -translate-x-4 items-center gap-2 text-sm font-bold opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                              Lesen <ArrowRight className="h-4 w-4" />
                            </div>
                          </div>

                        </article>
                      </Link>
                    </FadeIn>
                  ))
                ) : (
                  <FadeIn>
                    <div className="surface-card-shell flex flex-col items-center justify-center rounded-[32px] border border-dashed px-6 py-24 text-center">
                      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full" style={{ background: "color-mix(in srgb, var(--surface-card-text) 8%, transparent)" }}>
                        <MessageSquare className="theme-accent-icon h-8 w-8" />
                      </div>
                      <h3 className="text-2xl font-black text-foreground">Noch keine Themen hier</h3>
                      <p className="mt-3 max-w-md text-muted-foreground">
                        In dieser Kategorie gibt es noch keine aktiven Diskussionen. Schau später wieder vorbei.
                      </p>
                      <Link to="/forum" className="theme-link-accent mt-8 font-bold transition-colors">
                        Zurück zur Übersicht &rarr;
                      </Link>
                    </div>
                  </FadeIn>
                )}
              </div>

              {/* Sticky Sidebar */}
              <div className="relative hidden lg:block">
                <div className="sticky top-32">
                  <ForumSidebar categories={categories} activeCategorySlug={categorySlug} />
                </div>
              </div>

            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default ForumPage;