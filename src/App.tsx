import { lazy, Suspense, useLayoutEffect, useMemo, type ReactNode } from "react";
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
import NotFound from "./pages/NotFound";
import MaintenanceScreen from "./pages/MaintenanceScreen";
import { LoadingScreen } from "./components/ui/LoadingScreen";

// Nur die Startseite (Index), NotFound und MaintenanceScreen sind eager geladen,
// da MaintenanceScreen/NotFound außerhalb des Suspense-Baums direkt in ThemeBootstrap
// gerendert werden. Alle übrigen Routen (inkl. des gesamten Admin-Panels) werden
// per Code-Splitting nachgeladen, damit Erstbesucher der Startseite nicht das
// komplette Admin-Bundle (Rich-Text-Editor, Charts, Drag&Drop, Stripe) mitladen.
const Login = lazy(() => import("./pages/Login"));
const SetPassword = lazy(() => import("./pages/SetPassword"));
const Impressum = lazy(() => import("./pages/Impressum"));
const Datenschutz = lazy(() => import("./pages/Datenschutz"));
const AGB = lazy(() => import("./pages/AGB"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Forum = lazy(() => import("./pages/Forum"));
const ForumThread = lazy(() => import("./pages/ForumThread"));
const DynamicPage = lazy(() => import("./pages/DynamicPage"));

const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminFooter = lazy(() => import("./pages/admin/AdminFooter"));
const AdminBranding = lazy(() => import("./pages/admin/AdminBranding"));
const AdminNavigation = lazy(() => import("./pages/admin/AdminNavigation"));
const AdminHomepage = lazy(() => import("./pages/admin/AdminHomepage"));
const AdminHero = lazy(() => import("./pages/admin/AdminHero"));
const AdminServices = lazy(() => import("./pages/admin/AdminServices"));
const AdminPortfolio = lazy(() => import("./pages/admin/AdminPortfolio"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminFAQ = lazy(() => import("./pages/admin/AdminFAQ"));
const AdminLeads = lazy(() => import("./pages/admin/AdminLeads"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminDomains = lazy(() => import("./pages/admin/AdminDomains"));
const AdminForum = lazy(() => import("./pages/admin/AdminForum"));
const AdminContent = lazy(() => import("./pages/admin/AdminContent"));
const AdminTeam = lazy(() => import("./pages/admin/AdminTeam"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminTestimonials = lazy(() => import("./pages/admin/AdminTestimonials"));
const AdminLegal = lazy(() => import("./pages/admin/AdminLegal"));
const AdminSites = lazy(() => import("./pages/admin/AdminSites"));
const AdminPages = lazy(() => import("./pages/admin/AdminPages"));
const AdminBilling = lazy(() => import("./pages/admin/AdminBilling"));
const AdminTickets = lazy(() => import("./pages/admin/AdminTickets"));
const AdminOnboarding = lazy(() => import("./pages/admin/AdminOnboarding"));
const AdminMedia = lazy(() => import("./pages/admin/AdminMedia"));
const AdminBanners = lazy(() => import("./pages/admin/AdminBanners"));

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

const HashScrollHandler = () => {
  const location = useLocation();

  useLayoutEffect(() => {
    if (!location.hash || location.pathname !== "/") return;

    const targetId = decodeURIComponent(location.hash.replace(/^#/, ""));
    if (!targetId) return;

    let timeoutId: number | undefined;
    const frameId = window.requestAnimationFrame(() => {
      timeoutId = window.setTimeout(() => {
        document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [location.hash, location.pathname]);

  return null;
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
      <HashScrollHandler />
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
              <Suspense fallback={<LoadingScreen heading="Bitte kurz warten" subtext="Inhalt wird geladen." />}>
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
                  <Route path="media" element={<AdminMedia />} />
                  <Route path="banners" element={<AdminBanners />} />
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
              </Suspense>
            </ThemeBootstrap>
          </BrowserRouter>
        </TooltipProvider>
      </SiteProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
