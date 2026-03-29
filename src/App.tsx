import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import CookieBanner from "@/components/CookieBanner";
import ConsentScriptGate from "@/components/ConsentScriptGate";
import PageViewTracker from "@/components/PageViewTracker";
import { AuthProvider } from "./hooks/useAuth";
import { SiteProvider } from "./context/SiteContext";
import { useGlobalTheme } from "./hooks/useGlobalTheme";

import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Impressum from "./pages/Impressum";
import Datenschutz from "./pages/Datenschutz";
import AGB from "./pages/AGB";
import ProductDetail from "./pages/ProductDetail";
import Forum from "./pages/Forum";
import ForumThread from "./pages/ForumThread";
import DynamicPage from "./pages/DynamicPage";

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

const queryClient = new QueryClient();

const ThemeBootstrap = ({ children }: { children: ReactNode }) => {
  useGlobalTheme();

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
                <Route path="/impressum" element={<Impressum />} />
                <Route path="/datenschutz" element={<Datenschutz />} />
                <Route path="/agb" element={<AGB />} />
                <Route path="/produkt/:slug" element={<ProductDetail />} />
                <Route path="/forum" element={<Forum />} />
                <Route path="/forum/kategorie/:categorySlug" element={<Forum />} />
                <Route path="/forum/:slug" element={<ForumThread />} />

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
