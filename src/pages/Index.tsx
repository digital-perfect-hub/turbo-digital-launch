import type { ComponentType } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import IntroSection from "@/components/IntroSection";
import TrustSection from "@/components/TrustSection";
import WhyChooseSection from "@/components/WhyChooseSection";
import AudienceSection from "@/components/AudienceSection";
import ServicesSection from "@/components/ServicesSection";
import PortfolioSection from "@/components/PortfolioSection";
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
  forum: ForumTeaser,
  shop: ShopSection,
  portfolio: PortfolioSection,
  team: TeamSection,
  process: ProcessSection,
  testimonials: TestimonialsSection,
  contact: ContactSection,
  faq: FAQSection,
};

const Index = () => {
  const { isLoading } = useSiteContext();
  const { settings: themeSettings, logoUrl, isLoading: isThemeLoading } = useGlobalTheme();
  const { settings, isLoading: isSiteSettingsLoading } = useSiteSettings();
  const { hero, isLoading: isHeroLoading } = useHeroContent();

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
      <SEO />
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <HeroSection hero={hero} />
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
