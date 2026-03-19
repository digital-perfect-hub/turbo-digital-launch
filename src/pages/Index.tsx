import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import IntroSection from "@/components/IntroSection";
import TrustSection from "@/components/TrustSection";
import WhyChooseSection from "@/components/WhyChooseSection";
import AudienceSection from "@/components/AudienceSection";
import ServicesSection from "@/components/ServicesSection";
import PortfolioSection from "@/components/PortfolioSection";
import ProcessSection from "@/components/ProcessSection";
import ShopSection from "@/components/ShopSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import ContactSection from "@/components/ContactSection";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const Index = () => {
  return (
    <>
      <SEO />
      <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <IntroSection />
        <TrustSection />
        <WhyChooseSection />
        <AudienceSection />
        <ServicesSection />
        <PortfolioSection />
        <ProcessSection />
        <ShopSection />
        <TestimonialsSection />
        <ContactSection />
        <FAQSection />
      </main>
      <Footer />
      </div>
    </>
  );
};

export default Index;
