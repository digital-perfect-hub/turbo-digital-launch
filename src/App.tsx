import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { useGlobalTheme } from "./hooks/useGlobalTheme";

// Öffentliche Seiten
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Impressum from "./pages/Impressum";
import Datenschutz from "./pages/Datenschutz";
import AGB from "./pages/AGB";
import ProductDetail from "./pages/ProductDetail";
import Forum from "./pages/Forum";
import ForumThread from "./pages/ForumThread";

// Admin Seiten
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
import AdminForum from "./pages/admin/AdminForum";

const queryClient = new QueryClient();

// Bootstraps unser Theme, damit alle CSS-Variablen greifen
const ThemeBootstrap = ({ children }: { children: React.ReactNode }) => {
  useGlobalTheme();
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ThemeBootstrap>
            <Routes>
              {/* Frontend Routen */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/impressum" element={<Impressum />} />
              <Route path="/datenschutz" element={<Datenschutz />} />
              <Route path="/agb" element={<AGB />} />
              <Route path="/produkt/:slug" element={<ProductDetail />} />
              <Route path="/forum" element={<Forum />} />
              <Route path="/forum/kategorie/:categorySlug" element={<Forum />} />
              <Route path="/forum/:slug" element={<ForumThread />} />

              {/* Admin Backend Routen */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="branding" element={<AdminBranding />} />
                <Route path="navigation" element={<AdminNavigation />} /> {/* NEUE ROUTE */}
                <Route path="homepage" element={<AdminHomepage />} />
                <Route path="hero" element={<AdminHero />} />
                <Route path="services" element={<AdminServices />} />
                <Route path="footer" element={<AdminFooter />} />
                <Route path="portfolio" element={<AdminPortfolio />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="forum" element={<AdminForum />} />
                <Route path="faq" element={<AdminFAQ />} />
                <Route path="leads" element={<AdminLeads />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>

              {/* 404 Fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ThemeBootstrap>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;