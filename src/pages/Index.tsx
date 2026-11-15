import { Suspense, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { DEFAULT_SITE_ID } from "@/lib/site";
import { buildAbsolutePublicUrl } from "@/lib/url";
import { lazyPage } from "@/lib/lazyPage";
import SEO from "@/components/SEO";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { useSiteContext } from "@/context/SiteContext";
import { useGlobalTheme } from "@/hooks/useGlobalTheme";
import PremiumHome from "@/components/premium-home/PremiumHome";
import { SHARE_IMAGE } from "@/components/premium-home/content";

const ClassicHome = lazyPage(() => import("./ClassicHome"));

const Index = () => {
  const { activeSiteId } = useSiteContext();
  const { settings: themeSettings, logoUrl } = useGlobalTheme();
  const location = useLocation();

  const siteId = activeSiteId || DEFAULT_SITE_ID;
  // Premium-Startseite: nur für die Digital-Perfect-Site. Mit ?design=classic bleibt die bisherige Startseite
  // (Kontaktvariante bzw. Abschnittsrenderer aus dem CMS) erreichbar, Mandanten sind nicht betroffen.
  const usePremiumHome = siteId === DEFAULT_SITE_ID && new URLSearchParams(location.search).get("design") !== "classic";

  const structuredData = useMemo(() => {
    const sameAs = [themeSettings.social_linkedin_url, themeSettings.social_instagram_url].filter(
      (url): url is string => Boolean(url && url.trim()),
    );
    return {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      name: themeSettings.company_name || "Digital-Perfect",
      url: buildAbsolutePublicUrl("/"),
      description: themeSettings.meta_description || undefined,
      ...(logoUrl ? { logo: logoUrl, image: logoUrl } : {}),
      ...(sameAs.length > 0 ? { sameAs } : {}),
    };
  }, [themeSettings.company_name, themeSettings.meta_description, themeSettings.social_linkedin_url, themeSettings.social_instagram_url, logoUrl]);

  if (!usePremiumHome) {
    return (
      <Suspense fallback={<LoadingScreen heading="Bitte kurz warten" subtext="Inhalt wird geladen." />}>
        <ClassicHome />
      </Suspense>
    );
  }

  // Site, Design und Einstellungen stehen hier schon (ThemeBootstrap wartet darauf). Die Premium-Startseite wartet auf nichts
  // Weiteres: Ihr Kopf zeigt kein Logo aus der Verwaltung, also hält auch kein Bildabruf den ersten Inhalt auf.
  return (
    <>
      <SEO
        title="Creator Studio, Webdesign & SEO aus Linz | Digital-Perfect"
        image={SHARE_IMAGE}
        description="Digital-Perfect entwickelt Creator Studio für KI-Creator, Bilder und Videos und baut Websites, die für Google und KI-Assistenten gut lesbar sind."
        structuredData={structuredData}
      />
      <PremiumHome />
    </>
  );
};

export default Index;
