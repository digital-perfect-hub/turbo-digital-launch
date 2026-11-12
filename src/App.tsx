import { lazy, Suspense, useLayoutEffect, useMemo, type ComponentType, type ReactNode } from "react";
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
// Eine Unterseite wird als eigene Datei nachgeladen. Nach einem neuen Deployment heißt diese Datei anders: Ein Tab mit dem alten
// Stand findet sie nicht mehr, und die Seite bliebe leer. Dann wird einmal neu geladen (der neue Stand kennt die neuen Namen);
// schlägt es danach wieder fehl, wird der Fehler nicht verschluckt.
const RELOAD_FLAG = "dp:chunk-reload";
const flag = (set?: boolean): boolean => {
  try {
    if (set === true) window.sessionStorage.setItem(RELOAD_FLAG, "1");
    else if (set === false) window.sessionStorage.removeItem(RELOAD_FLAG);
    return window.sessionStorage.getItem(RELOAD_FLAG) === "1";
  } catch {
    return true;
  }
};
export const lazyPage = <T extends ComponentType<never>>(load: () => Promise<{ default: T }>) =>
  lazy(() =>
    load().then(
      (module) => {
        flag(false);
        return module;
      },
      (error: unknown) => {
        if (flag()) throw error;
        flag(true);
        window.location.reload();
        return new Promise<{ default: T }>(() => undefined);
      },
    ),
  );

const Login = lazyPage(() => import("./pages/Login"));
const SetPassword = lazyPage(() => import("./pages/SetPassword"));
const Impressum = lazyPage(() => import("./pages/Impressum"));
const Datenschutz = lazyPage(() => import("./pages/Datenschutz"));
const AGB = lazyPage(() => import("./pages/AGB"));
const ProductDetail = lazyPage(() => import("./pages/ProductDetail"));
const Forum = lazyPage(() => import("./pages/Forum"));
const ForumThread = lazyPage(() => import("./pages/ForumThread"));
const DynamicPage = lazyPage(() => import("./pages/DynamicPage"));
const PremiumOrDynamicPage = lazyPage(() => import("./pages/PremiumOrDynamicPage"));

const AdminLayout = lazyPage(() => import("./pages/admin/AdminLayout"));
const AdminDashboard = lazyPage(() => import("./pages/admin/AdminDashboard"));
const AdminFooter = lazyPage(() => import("./pages/admin/AdminFooter"));
const AdminBranding = lazyPage(() => import("./pages/admin/AdminBranding"));
const AdminNavigation = lazyPage(() => import("./pages/admin/AdminNavigation"));
const AdminHomepage = lazyPage(() => import("./pages/admin/AdminHomepage"));
const AdminHero = lazyPage(() => import("./pages/admin/AdminHero"));
const AdminServices = lazyPage(() => import("./pages/admin/AdminServices"));
const AdminPortfolio = lazyPage(() => import("./pages/admin/AdminPortfolio"));
const AdminProducts = lazyPage(() => import("./pages/admin/AdminProducts"));
const AdminFAQ = lazyPage(() => import("./pages/admin/AdminFAQ"));
const AdminLeads = lazyPage(() => import("./pages/admin/AdminLeads"));
const AdminSettings = lazyPage(() => import("./pages/admin/AdminSettings"));
const AdminDomains = lazyPage(() => import("./pages/admin/AdminDomains"));
const AdminForum = lazyPage(() => import("./pages/admin/AdminForum"));
const AdminContent = lazyPage(() => import("./pages/admin/AdminContent"));
const AdminTeam = lazyPage(() => import("./pages/admin/AdminTeam"));
const AdminUsers = lazyPage(() => import("./pages/admin/AdminUsers"));
const AdminTestimonials = lazyPage(() => import("./pages/admin/AdminTestimonials"));
const AdminLegal = lazyPage(() => import("./pages/admin/AdminLegal"));
const AdminSites = lazyPage(() => import("./pages/admin/AdminSites"));
const AdminPages = lazyPage(() => import("./pages/admin/AdminPages"));
const AdminBilling = lazyPage(() => import("./pages/admin/AdminBilling"));
const AdminTickets = lazyPage(() => import("./pages/admin/AdminTickets"));
const AdminOnboarding = lazyPage(() => import("./pages/admin/AdminOnboarding"));
const AdminMedia = lazyPage(() => import("./pages/admin/AdminMedia"));
const AdminBanners = lazyPage(() => import("./pages/admin/AdminBanners"));

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
                <Route path="/:slug" element={<PremiumOrDynamicPage />} />
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
