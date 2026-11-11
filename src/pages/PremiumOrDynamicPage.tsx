import { useParams } from "react-router-dom";
import DynamicPage from "./DynamicPage";
import PremiumPage from "@/components/premium-home/PremiumPage";
import { PREMIUM_PAGES } from "@/components/premium-home/pages";
import { useSiteContext } from "@/context/SiteContext";
import { DEFAULT_SITE_ID } from "@/lib/site";

// Route "/:slug": Für die Digital-Perfect-Site gibt es feste Premium-Unterseiten (Creator Studio, Webdesign,
// technische SEO, KI-Sichtbarkeit). Alle anderen Slugs und alle anderen Sites laufen unverändert über DynamicPage.
const PremiumOrDynamicPage = () => {
  const { slug } = useParams();
  const { activeSiteId } = useSiteContext();
  const page = slug ? PREMIUM_PAGES[slug] : undefined;
  if (page && activeSiteId === DEFAULT_SITE_ID) return <PremiumPage page={page} />;
  return <DynamicPage />;
};

export default PremiumOrDynamicPage;
