import { useParams } from "react-router-dom";
import DynamicPage from "./DynamicPage";
import PremiumPage, { ContactPage, ProjectsPage } from "@/components/premium-home/PremiumPage";
import { PREMIUM_PAGES } from "@/components/premium-home/pages";
import { useSiteContext } from "@/context/SiteContext";
import { DEFAULT_SITE_ID } from "@/lib/site";

// Route "/:slug": Für die Digital-Perfect-Site gibt es feste Premium-Unterseiten (Creator Studio, Leistungen,
// Webdesign, technische SEO, KI-Sichtbarkeit, Projekte, Kontakt). Alle anderen Slugs und alle anderen Sites laufen
// unverändert über DynamicPage.
const PremiumOrDynamicPage = () => {
  const { slug } = useParams();
  const { activeSiteId } = useSiteContext();
  if (activeSiteId === DEFAULT_SITE_ID && slug) {
    if (slug === "projekte") return <ProjectsPage />;
    if (slug === "kontakt") return <ContactPage />;
    const page = PREMIUM_PAGES[slug];
    if (page) return <PremiumPage page={page} />;
  }
  return <DynamicPage />;
};

export default PremiumOrDynamicPage;
