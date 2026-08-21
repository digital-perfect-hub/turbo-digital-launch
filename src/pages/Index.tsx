import { useMemo, type ComponentType } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_SITE_ID } from "@/lib/site";
import { buildAbsolutePublicUrl } from "@/lib/url";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import IntroSection from "@/components/IntroSection";
import TrustSection from "@/components/TrustSection";
import WhyChooseSection from "@/components/WhyChooseSection";
import AudienceSection from "@/components/AudienceSection";
import ServicesSection from "@/components/ServicesSection";
import SeoPackagesSection from "@/components/SeoPackagesSection";
import WebdesignPackagesSection from "@/components/WebdesignPackagesSection";
import PortfolioSection from "@/components/PortfolioSection";
import AboutFounderSection from "@/components/AboutFounderSection";
import TeamSection from "@/components/TeamSection";
import ProcessSection from "@/components/ProcessSection";
import ShopSection from "@/components/ShopSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import ContactSection from "@/components/ContactSection";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";
import SupportWidget from "@/components/support/SupportWidget";
import SEO from "@/components/SEO";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import ForumTeaser from "@/components/forum/ForumTeaser";
import { useSiteContext } from "@/context/SiteContext";
import { useGlobalTheme } from "@/hooks/useGlobalTheme";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { getCriticalHeroImageUrls, useHeroContent } from "@/hooks/useHeroContent";
import { useCriticalAssetPreload } from "@/hooks/useCriticalAssetPreload";
import {
  DEFAULT_HOMEPAGE_SECTION_ORDER,
  normalizeHomepageSectionOrder,
} from "@/lib/homepage-section-order";
import { createDefaultLoadingScreenConfig, parseHomepageSectionVisibility, parseLoadingScreenConfig } from "@/lib/site-ui-config";
import type { HomepageSectionId } from "@/lib/homepage-section-styles";

const sectionRegistry: Record<HomepageSectionId, ComponentType> = {
  intro: IntroSection,
  trust: TrustSection,
  "why-choose": WhyChooseSection,
  audience: AudienceSection,
  services: ServicesSection,
  "seo-packages": SeoPackagesSection,
  "webdesign-packages": WebdesignPackagesSection,
  forum: ForumTeaser,
  shop: ShopSection,
  portfolio: PortfolioSection,
  founder: AboutFounderSection,
  team: TeamSection,
  process: ProcessSection,
  testimonials: TestimonialsSection,
  contact: ContactSection,
  faq: FAQSection,
};

const Index = () => {
  const { activeSiteId, isLoading } = useSiteContext();
  const { settings: themeSettings, logoUrl, isLoading: isThemeLoading } = useGlobalTheme();
  const { settings, isLoading: isSiteSettingsLoading } = useSiteSettings();
  const { hero, isLoading: isHeroLoading } = useHeroContent();

  const siteId = activeSiteId || DEFAULT_SITE_ID;
  const { data: faqItemsForSchema = [] } = useQuery({
    queryKey: ["faq_items", siteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("faq_items")
        .select("*")
        .eq("site_id", siteId)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const structuredData = useMemo(() => {
    const canonicalUrl = buildAbsolutePublicUrl("/");
    const sameAs = [themeSettings.social_linkedin_url, themeSettings.social_instagram_url].filter(
      (url): url is string => Boolean(url && url.trim()),
    );

    const organization: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      name: themeSettings.company_name || "Digital-Perfect",
      url: canonicalUrl,
      description: themeSettings.meta_description || undefined,
      ...(logoUrl ? { logo: logoUrl, image: logoUrl } : {}),
      ...(sameAs.length > 0 ? { sameAs } : {}),
    };

    const faqEntries = (faqItemsForSchema || []).filter(
      (faq): faq is { question: string; answer: string } => Boolean(faq?.question?.trim() && faq?.answer?.trim()),
    );

    if (faqEntries.length === 0) return organization;

    const faqPage = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqEntries.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    };

    return [organization, faqPage];
  }, [themeSettings.company_name, themeSettings.meta_description, themeSettings.social_linkedin_url, themeSettings.social_instagram_url, logoUrl, faqItemsForSchema]);

  const sectionOrder = normalizeHomepageSectionOrder(settings.home_section_order || DEFAULT_HOMEPAGE_SECTION_ORDER);
  const sectionVisibility = parseHomepageSectionVisibility(settings.home_section_visibility);
  const loadingScreenConfig = parseLoadingScreenConfig(settings.loading_screen_config || createDefaultLoadingScreenConfig());
  const { isReady: areCriticalAssetsReady } = useCriticalAssetPreload([logoUrl, ...getCriticalHeroImageUrls(hero)]);

  const isBootstrapLoading = isLoading || isThemeLoading || isSiteSettingsLoading || isHeroLoading || !areCriticalAssetsReady;

  if (isBootstrapLoading) {
    return (
      <LoadingScreen
        heading={themeSettings.loader_heading || loadingScreenConfig.heading}
        subtext={themeSettings.loader_subtext || loadingScreenConfig.subtext}
        bgHex={themeSettings.loader_loader_bg_hex ?? themeSettings.loader_bg_hex ?? loadingScreenConfig.background_color}
        textHex={themeSettings.loader_loader_text_hex ?? themeSettings.loader_text_hex ?? loadingScreenConfig.text_color}
        config={{
          ...loadingScreenConfig,
          heading: themeSettings.loader_heading || loadingScreenConfig.heading,
          subtext: themeSettings.loader_subtext || loadingScreenConfig.subtext,
          background_color: themeSettings.loader_loader_bg_hex ?? themeSettings.loader_bg_hex ?? loadingScreenConfig.background_color,
          text_color: themeSettings.loader_loader_text_hex ?? themeSettings.loader_text_hex ?? loadingScreenConfig.text_color,
        }}
      />
    );
  }

  return (
    <>
      <SEO structuredData={structuredData} />
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <div id="start" className="homepage-scroll-anchor">
            <HeroSection hero={hero} />
          </div>
          {sectionOrder
            .filter((sectionId) => sectionVisibility[sectionId] !== false)
            .map((sectionId) => {
              const SectionComponent = sectionRegistry[sectionId];
              return <SectionComponent key={sectionId} />;
            })}
        </main>
        <Footer />
        <SupportWidget />
      </div>
    </>
  );
};

export default Index;
