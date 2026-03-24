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
import SEO from "@/components/SEO";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import ForumTeaser from "@/components/forum/ForumTeaser";
import { useSiteContext } from "@/context/SiteContext";
import { useGlobalTheme } from "@/hooks/useGlobalTheme";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import {
  DEFAULT_HOMEPAGE_SECTION_ORDER,
  normalizeHomepageSectionOrder,
} from "@/lib/homepage-section-order";
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
  const { theme, isLoading: isThemeLoading } = useGlobalTheme();
  const { settings } = useSiteSettings();

  const sectionOrder = normalizeHomepageSectionOrder(settings.home_section_order || DEFAULT_HOMEPAGE_SECTION_ORDER);

  // GATEKEEPER-GESETZ: Solange der Tenant (Site) ODER das Theme im Hintergrund aufgelöst wird,
  // blockieren wir das Rendering der unfertigen Seite und zeigen exklusiv den Loader mit Kunden-Branding.
  if (isLoading || isThemeLoading) {
    return (
      <LoadingScreen
        heading={theme?.loader_heading}
        subtext={theme?.loader_subtext}
        bgHex={theme?.loader_loader_bg_hex ?? theme?.loader_bg_hex}
        textHex={theme?.loader_loader_text_hex ?? theme?.loader_text_hex}
      />
    );
  }

  return (
    <>
      <SEO />
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <HeroSection />
          {sectionOrder.map((sectionId) => {
            const SectionComponent = sectionRegistry[sectionId];
            return <SectionComponent key={sectionId} />;
          })}
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
