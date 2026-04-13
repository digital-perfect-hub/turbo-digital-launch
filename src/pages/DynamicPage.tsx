import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation, useParams } from "react-router-dom";
import { ArrowLeft, FileWarning } from "lucide-react";
import Footer from "@/components/Footer";
import SupportWidget from "@/components/support/SupportWidget";
import Header from "@/components/Header";
import SEO from "@/components/SEO";
import BlockRenderer from "@/components/page-builder/BlockRenderer";
import PageRenderer from "@/components/page-builder/PageRenderer";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { useSiteContext } from "@/context/SiteContext";
import { useGlobalTheme } from "@/hooks/useGlobalTheme";
import {
  normalizeLandingPageBlocks,
  normalizeLandingPageSlug,
  type LandingPageRecord,
} from "@/lib/landing-page-builder";
import { DEFAULT_SITE_ID } from "@/lib/site";
import { resolveCanonicalUrl } from "@/lib/url";
import { normalizePageBlocks, type PageRecord } from "@/lib/page-builder";
import { supabase } from "@/integrations/supabase/client";

const DynamicPage = () => {
  const params = useParams();
  const location = useLocation();
  const { activeSiteId, isLoading: isSiteLoading } = useSiteContext();
  const { isLoading: isThemeLoading } = useGlobalTheme();

  const siteId = activeSiteId || DEFAULT_SITE_ID;
  const legacySlug = String(params.slug || "")
    .trim()
    .toLowerCase();

  const landingSlug = useMemo(() => normalizeLandingPageSlug(location.pathname), [location.pathname]);

  const landingPageQuery = useQuery({
    queryKey: ["landing-page", siteId, landingSlug],
    enabled: Boolean(landingSlug),
    queryFn: async (): Promise<LandingPageRecord | null> => {
      const { data, error } = await supabase
        .from("landing_pages" as never)
        .select("*")
        .eq("site_id", siteId)
        .eq("slug", landingSlug)
        .eq("is_published", true)
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      const row = data as unknown as Record<string, unknown>;

      return {
        id: String(row.id || ""),
        slug: String(row.slug || landingSlug),
        meta_title: typeof row.meta_title === "string" ? row.meta_title : null,
        meta_description: typeof row.meta_description === "string" ? row.meta_description : null,
        is_published: Boolean(row.is_published),
        page_blocks: normalizeLandingPageBlocks(row.page_blocks),
      };
    },
  });

  const shouldLoadLegacyPage = Boolean(siteId && legacySlug && !landingPageQuery.isLoading && !landingPageQuery.data);

  const legacyPageQuery = useQuery({
    queryKey: ["dynamic-page", siteId, legacySlug],
    enabled: shouldLoadLegacyPage,
    queryFn: async (): Promise<PageRecord | null> => {
      const { data, error } = await supabase
        .from("pages" as never)
        .select("*")
        .eq("site_id", siteId)
        .eq("slug", legacySlug)
        .eq("is_published", true)
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      const row = data as unknown as Record<string, unknown>;

      return {
        id: String(row.id || ""),
        site_id: String(row.site_id || siteId),
        slug: String(row.slug || legacySlug),
        seo_title: typeof row.seo_title === "string" ? row.seo_title : null,
        seo_description: typeof row.seo_description === "string" ? row.seo_description : null,
        is_published: Boolean(row.is_published),
        created_at: typeof row.created_at === "string" ? row.created_at : null,
        updated_at: typeof row.updated_at === "string" ? row.updated_at : null,
        content_blocks: normalizePageBlocks(row.content_blocks),
      };
    },
  });

  const isLoading =
    isSiteLoading ||
    isThemeLoading ||
    landingPageQuery.isLoading ||
    (shouldLoadLegacyPage && legacyPageQuery.isLoading);

  const landingPage = landingPageQuery.data;
  const legacyPage = landingPage ? null : legacyPageQuery.data;
  const startsWithHero = landingPage
    ? landingPage.page_blocks?.[0]?.type === "hero"
    : legacyPage?.content_blocks?.[0]?.type === "hero";

  const canonical = useMemo(() => resolveCanonicalUrl(location.pathname), [location.pathname]);

  if (isLoading) {
    return (
      <LoadingScreen
        heading="Seite wird geladen"
        subtext="Mandant, Theme und Inhalte werden aufgebaut."
      />
    );
  }

  if (landingPage) {
    return (
      <>
        <SEO
          title={landingPage.meta_title || undefined}
          description={landingPage.meta_description || undefined}
          canonical={canonical}
        />
        <div className="min-h-screen bg-background">
          <Header />
          <main className={startsWithHero ? "" : "pt-[148px] md:pt-[168px]"}>
            <BlockRenderer blocks={landingPage.page_blocks} />
          </main>
          <Footer />
          <SupportWidget />
        </div>
      </>
    );
  }

  if (legacyPage) {
    return (
      <>
        <SEO
          title={legacyPage.seo_title || undefined}
          description={legacyPage.seo_description || undefined}
          canonical={canonical}
        />
        <div className="min-h-screen bg-background">
          <Header />
          <main className={startsWithHero ? "" : "pt-[148px] md:pt-[168px]"}>
            <PageRenderer blocks={legacyPage.content_blocks} />
          </main>
          <Footer />
          <SupportWidget />
        </div>
      </>
    );
  }

  const missingLandingHint = landingSlug.includes("/")
    ? "Prüfe den Slug in landing_pages.slug oder veröffentliche die Seite."
    : "Prüfe den Slug im Landing- oder Page-Builder oder gehe zurück auf die Startseite.";

  return (
    <>
      <SEO title="Seite nicht gefunden" description="Diese Landingpage konnte nicht gefunden werden." noIndex />
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-[158px] md:pt-[176px]">
          <section className="py-20">
            <div className="section-container">
              <div className="mx-auto max-w-3xl rounded-[2rem] border border-[color:var(--surface-card-border)] bg-[color:var(--surface-card)] px-6 py-10 text-center shadow-[0_30px_70px_-54px_rgba(14,31,83,0.28)] md:px-10 md:py-14">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-[#FF4B2C]/10 text-[#FF4B2C]">
                  <FileWarning size={28} />
                </div>
                <h1 className="text-3xl font-black tracking-tight text-[color:var(--theme-text-main-hex)] md:text-4xl">
                  Diese Seite existiert nicht oder ist noch nicht veröffentlicht.
                </h1>
                <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-[color:var(--theme-text-muted-hex)] md:text-lg">
                  {missingLandingHint}
                </p>
                <div className="mt-8">
                  <Link to="/" className="btn-primary">
                    <ArrowLeft size={18} />
                    Zur Startseite
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
        <SupportWidget />
      </div>
    </>
  );
};

export default DynamicPage;
