import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Building2,
  CreditCard,
  FileText,
  Files,
  HelpCircle,
  ImageIcon,
  LayoutDashboard,
  LifeBuoy,
  Lock,
  LogOut,
  Menu,
  MessageSquare,
  MessagesSquare,
  Package,
  Palette,
  PanelBottom,
  Quote,
  Settings,
  ShieldCheck,
  Type,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSiteContext } from "@/context/SiteContext";
import { useSiteModules } from "@/hooks/useSiteModules";
import "@/assets/styles/admin.css";

type AdminNavItem = {
  to: string;
  icon: any;
  label: string;
  end?: boolean;
  moduleKey?: "hasForum" | "hasShop" | "hasSupportDesk";
};

const navItems: AdminNavItem[] = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/admin/branding", icon: Palette, label: "Branding & Theme" },
  { to: "/admin/navigation", icon: Menu, label: "Navigation" },
  { to: "/admin/footer", icon: PanelBottom, label: "Footer" },
  { to: "/admin/homepage", icon: FileText, label: "Homepage Inhalte" },
  { to: "/admin/hero", icon: Type, label: "Hero-Bereich" },
  { to: "/admin/services", icon: Settings, label: "Leistungen" },
  { to: "/admin/portfolio", icon: ImageIcon, label: "Portfolio" },
  { to: "/admin/products", icon: Package, label: "Shop", moduleKey: "hasShop" },
  { to: "/admin/forum", icon: MessagesSquare, label: "Forum", moduleKey: "hasForum" },
  { to: "/admin/content", icon: FileText, label: "Content-Blöcke" },
  { to: "/admin/pages", icon: Files, label: "Page Builder" },
  { to: "/admin/billing", icon: CreditCard, label: "Billing & Abos" },
  { to: "/admin/tickets", icon: LifeBuoy, label: "Tickets", moduleKey: "hasSupportDesk" },
  { to: "/admin/team", icon: Users, label: "Team" },
  { to: "/admin/testimonials", icon: Quote, label: "Testimonials" },
  { to: "/admin/legal", icon: ShieldCheck, label: "Recht & SEO" },
  { to: "/admin/sites", icon: Building2, label: "Sites & White-Label" },
  { to: "/admin/faq", icon: HelpCircle, label: "FAQ" },
  { to: "/admin/leads", icon: MessageSquare, label: "Anfragen" },
  { to: "/admin/settings", icon: Settings, label: "Einstellungen" },
] as const;

const AdminLayout = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const { activeSiteId, availableSites, setActiveSiteId } = useSiteContext();
  const { hasForum, hasShop, hasSupportDesk, isLoading: modulesLoading } = useSiteModules();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    document.body.classList.add("admin-ui-portal-scope");
    return () => {
      document.body.classList.remove("admin-ui-portal-scope");
      document.body.style.removeProperty("overflow");
    };
  }, []);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/login");
    }
  }, [user, isAdmin, loading, navigate]);

  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMobileSidebarOpen) {
      document.body.style.removeProperty("overflow");
      return;
    }

    if (!window.matchMedia("(max-width: 1023px)").matches) {
      document.body.style.removeProperty("overflow");
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.removeProperty("overflow");
    };
  }, [isMobileSidebarOpen]);

  const closeMobileSidebar = () => {
    if (window.matchMedia("(max-width: 1023px)").matches) {
      setIsMobileSidebarOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-ui-scope flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        <span className="text-sm font-medium">Laden...</span>
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  return (
    <div className="admin-ui-scope flex min-h-screen bg-background text-foreground">
      <button
        type="button"
        onClick={() => setIsMobileSidebarOpen((prev) => !prev)}
        className="fixed left-4 top-4 z-50 inline-flex items-center justify-center rounded-2xl border border-[hsl(var(--admin-sidebar-border))] bg-[hsl(var(--admin-sidebar-bg))]/95 p-3 text-[hsl(var(--admin-sidebar-fg))] shadow-xl backdrop-blur lg:hidden"
        aria-label={isMobileSidebarOpen ? "Admin-Menü schließen" : "Admin-Menü öffnen"}
        aria-expanded={isMobileSidebarOpen}
        aria-controls="admin-mobile-sidebar"
      >
        {isMobileSidebarOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {isMobileSidebarOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-950/55 backdrop-blur-[2px] lg:hidden"
          aria-label="Admin-Menü schließen"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      ) : null}

      <aside
        id="admin-mobile-sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex w-80 max-w-[88vw] shrink-0 flex-col border-r border-[hsl(var(--admin-sidebar-border))] bg-[hsl(var(--admin-sidebar-bg))] text-[hsl(var(--admin-sidebar-fg))] transition-transform duration-300 ease-out lg:static lg:z-auto lg:w-80 lg:max-w-none lg:translate-x-0 ${
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b border-[hsl(var(--admin-sidebar-border))] p-6 pr-20 lg:pr-6">
          <h2 className="text-2xl font-black tracking-tight text-[#FF4B2C]">Admin Panel</h2>
          <p className="mt-1 truncate text-xs font-medium text-[hsl(var(--admin-sidebar-muted))]">{user.email}</p>
          {availableSites.length ? (
            <div className="mt-4">
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[hsl(var(--admin-sidebar-muted))]">
                Aktive Site
              </label>
              <select
                className="admin-native-select--inverse px-3 py-2 text-sm"
                value={activeSiteId}
                onChange={(event) => {
                  setActiveSiteId(event.target.value);
                  closeMobileSidebar();
                }}
              >
                {availableSites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </div>

        <nav className="flex-1 space-y-1.5 overflow-auto p-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={closeMobileSidebar}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? "bg-[#FF4B2C] text-white shadow-lg shadow-[#FF4B2C]/20"
                    : "text-slate-400 hover:bg-[#FF4B2C]/10 hover:text-[#FF4B2C]"
                }`
              }
            >
              {({ isActive }) => {
                const isLocked = !modulesLoading && item.moduleKey ? !({ hasForum, hasShop, hasSupportDesk }[item.moduleKey]) : false;

                return (
                  <>
                    <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                    <span className="flex items-center gap-2">
                      {item.label}
                      {isLocked ? <Lock size={13} className="text-current opacity-80" /> : null}
                    </span>
                  </>
                );
              }}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-[hsl(var(--admin-sidebar-border))] p-4">
          <button
            onClick={() => {
              closeMobileSidebar();
              signOut();
              navigate("/");
            }}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-400 transition-colors hover:bg-[#FF4B2C]/10 hover:text-[#FF4B2C]"
          >
            <LogOut size={18} /> Abmelden
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-auto bg-background pt-16 text-foreground lg:pt-0">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
