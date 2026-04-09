import { useLayoutEffect, useMemo, type ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import CookieBanner from "@/components/CookieBanner";
import ConsentScriptGate from "@/components/ConsentScriptGate";
import PageViewTracker from "@/components/PageViewTracker";
import { AuthProvider } from "./hooks/useAuth";
import { SiteProvider, useSiteContext } from "./context/SiteContext";
import { useGlobalTheme } from "./hooks/useGlobalTheme";
import { useSiteSettings } from "./hooks/useSiteSettings";

import Index from "./pages/Index";
import Login from "./pages/Login";
import SetPassword from "./pages/SetPassword";
import NotFound from "./pages/NotFound";
import Impressum from "./pages/Impressum";
import Datenschutz from "./pages/Datenschutz";
import AGB from "./pages/AGB";
import ProductDetail from "./pages/ProductDetail";
import Forum from "./pages/Forum";
import ForumThread from "./pages/ForumThread";
import DynamicPage from "./pages/DynamicPage";
import MaintenanceScreen from "./pages/MaintenanceScreen";

import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminFooter from "./pages/admin/AdminFooter";
import AdminBranding from "./pages/admin/AdminBranding";
import AdminNavigation from "./pages/admin/AdminNavigation";
import AdminHomepage from "./pages/admin/AdminHomepage";
import AdminHero from "./pages/admin/AdminHero";
import AdminServices from "./pages/admin/AdminServices";
import AdminPortfolio from "./pages/admin/AdminPortfolio";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminFAQ from "./pages/admin/AdminFAQ";
import AdminLeads from "./pages/admin/AdminLeads";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminDomains from "./pages/admin/AdminDomains";
import AdminForum from "./pages/admin/AdminForum";
import AdminContent from "./pages/admin/AdminContent";
import AdminTeam from "./pages/admin/AdminTeam";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminTestimonials from "./pages/admin/AdminTestimonials";
import AdminLegal from "./pages/admin/AdminLegal";
import AdminSites from "./pages/admin/AdminSites";
import AdminPages from "./pages/admin/AdminPages";
import AdminBilling from "./pages/admin/AdminBilling";
import AdminTickets from "./pages/admin/AdminTickets";
import AdminOnboarding from "./pages/admin/AdminOnboarding";
import { LoadingScreen } from "./components/ui/LoadingScreen";

const queryClient = new QueryClient();


const LegacyShopifyNewsRedirect = () => <Navigate to="/magazin" replace />;

const APP_BOOT_ID = "dp-app-boot";
const ADMIN_ROUTE_REGEX = /^\/admin(?:\/|$)/;
const MAINTENANCE_BYPASS_ROUTE_REGEX = /^(?:\/admin(?:\/|$)|\/login(?:\/|$)|\/set-password(?:\/|$))/;

const parseBooleanSetting = (value: unknown) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "1" || normalized === "yes" || normalized === "on";
  }
  return false;
};

const ThemeBootstrap = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const { activeSiteId, hostname, isLoading: isSiteLoading, resolvedSite } = useSiteContext();
  const { theme, isLoading: isThemeLoading } = useGlobalTheme();
  const { settings, isLoading: isSettingsLoading } = useSiteSettings();

  const isAdminRoute = ADMIN_ROUTE_REGEX.test(location.pathname);
  const isLocalDevelopmentHost = hostname === "localhost" || hostname === "127.0.0.1";
  const loadingScreenConfig = settings.loading_screen_config;
  const isMaintenanceBypassRoute = MAINTENANCE_BYPASS_ROUTE_REGEX.test(location.pathname);
  const isMaintenanceMode = useMemo(() => parseBooleanSetting(settings.is_maintenance_mode), [settings.is_maintenance_mode]);
  const isPublicBootstrapLoading = !isAdminRoute && (isSiteLoading || !activeSiteId);
  const shouldShowBootLoader = isAdminRoute
    ? isSiteLoading || isThemeLoading || isSettingsLoading
    : isPublicBootstrapLoading || (Boolean(activeSiteId) && (isThemeLoading || isSettingsLoading));
  const shouldShowDomainNotFound = !isAdminRoute && !isSiteLoading && !activeSiteId && !isLocalDevelopmentHost && !resolvedSite;

  useLayoutEffect(() => {
    const bootNode = document.getElementById(APP_BOOT_ID);

    if (shouldShowBootLoader) {
      document.body.classList.remove("dp-app-ready");
      return;
    }

    document.body.classList.add("dp-app-ready");
    if (bootNode) {
      bootNode.setAttribute("aria-hidden", "true");
      window.setTimeout(() => bootNode.remove(), 220);
    }
  }, [shouldShowBootLoader]);

  if (shouldShowDomainNotFound) {
    return <NotFound />;
  }

  if (shouldShowBootLoader) {
    return (
      <LoadingScreen
        heading={activeSiteId ? theme?.loader_heading || loadingScreenConfig?.heading : "Bitte kurz warten"}
        subtext={activeSiteId ? theme?.loader_subtext || loadingScreenConfig?.subtext : "Mandant und Design werden aufgebaut."}
        bgHex={activeSiteId ? theme?.loader_loader_bg_hex ?? theme?.loader_bg_hex ?? loadingScreenConfig?.background_color : "#0B1020"}
        textHex={activeSiteId ? theme?.loader_loader_text_hex ?? theme?.loader_text_hex ?? loadingScreenConfig?.text_color : "#F8FAFC"}
        config={activeSiteId ? loadingScreenConfig : undefined}
      />
    );
  }

  if (isMaintenanceMode && !isMaintenanceBypassRoute) {
    return (
      <>
        <ConsentScriptGate />
        <PageViewTracker />
        <MaintenanceScreen />
        <CookieBanner />
      </>
    );
  }

  return (
    <>
      <ConsentScriptGate />
      <PageViewTracker />
      {children}
      <CookieBanner />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SiteProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ThemeBootstrap>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/set-password" element={<SetPassword />} />
                <Route path="/impressum" element={<Impressum />} />
                <Route path="/datenschutz" element={<Datenschutz />} />
                <Route path="/agb" element={<AGB />} />
                <Route path="/produkt/:slug" element={<ProductDetail />} />
                <Route path="/forum" element={<Forum />} />
                <Route path="/forum/kategorie/:categorySlug" element={<Forum />} />
                <Route path="/forum/:slug" element={<ForumThread />} />
                <Route path="/blogs/news" element={<LegacyShopifyNewsRedirect />} />
                <Route path="/blogs/news/" element={<LegacyShopifyNewsRedirect />} />

                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="branding" element={<AdminBranding />} />
                  <Route path="navigation" element={<AdminNavigation />} />
                  <Route path="homepage" element={<AdminHomepage />} />
                  <Route path="hero" element={<AdminHero />} />
                  <Route path="services" element={<AdminServices />} />
                  <Route path="footer" element={<AdminFooter />} />
                  <Route path="portfolio" element={<AdminPortfolio />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="forum/*" element={<AdminForum />} />
                  <Route path="content" element={<AdminContent />} />
                  <Route path="pages" element={<AdminPages />} />
                  <Route path="billing" element={<AdminBilling />} />
                  <Route path="tickets" element={<AdminTickets />} />
                  <Route path="onboarding" element={<AdminOnboarding />} />
                  <Route path="team" element={<AdminTeam />} />
                  <Route path="team/users" element={<AdminUsers />} />
                  <Route path="testimonials" element={<AdminTestimonials />} />
                  <Route path="legal" element={<AdminLegal />} />
                  <Route path="sites" element={<AdminSites />} />
                  <Route path="faq" element={<AdminFAQ />} />
                  <Route path="leads" element={<AdminLeads />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="settings/domains" element={<AdminDomains />} />
                </Route>

                <Route path="/seo/:slug" element={<DynamicPage />} />
                <Route path="/webdesign/:slug" element={<DynamicPage />} />
                <Route path="/:slug" element={<DynamicPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ThemeBootstrap>
          </BrowserRouter>
        </TooltipProvider>
      </SiteProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
