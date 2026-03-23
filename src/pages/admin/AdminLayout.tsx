import { useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
// Achte darauf, dass 'Settings' als Icon von lucide-react importiert ist (hast du schon).
import { FileText, HelpCircle, ImageIcon, LayoutDashboard, LogOut, MessageSquare, Palette, Package, Settings, Type, Menu, PanelBottom, MessagesSquare, Users, Quote, ShieldCheck, Building2, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSiteContext } from "@/context/SiteContext";
import { useSiteModules } from "@/hooks/useSiteModules";

const navItems = [
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
  { to: "/admin/team", icon: Users, label: "Team" },
  { to: "/admin/testimonials", icon: Quote, label: "Testimonials" },
  { to: "/admin/legal", icon: ShieldCheck, label: "Recht & SEO" },
  { to: "/admin/sites", icon: Building2, label: "Sites & White-Label" },
  { to: "/admin/faq", icon: HelpCircle, label: "FAQ" },
  { to: "/admin/leads", icon: MessageSquare, label: "Anfragen" },
  { to: "/admin/settings", icon: Settings, label: "Einstellungen" }, // <--- ERSETZT DAS ALTE SEO
];

const AdminLayout = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const { activeSiteId, availableSites, setActiveSiteId } = useSiteContext();
  const { hasForum, hasShop, isLoading: modulesLoading } = useSiteModules();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/login");
    }
  }, [user, isAdmin, loading, navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500 font-medium">Laden...</div>;
  if (!user || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-72 shrink-0 border-r border-slate-800 bg-slate-950 text-white flex flex-col">
        <div className="border-b border-slate-800 p-6">
          <h2 className="text-2xl font-black tracking-tight text-[#FF4B2C]">Admin Panel</h2>
          <p className="mt-1 text-xs text-slate-400 truncate font-medium">{user.email}</p>
          {availableSites.length ? (
            <div className="mt-4">
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Aktive Site</label>
              <select
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white outline-none"
                value={activeSiteId}
                onChange={(event) => setActiveSiteId(event.target.value)}
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
        
        <nav className="flex-1 p-4 space-y-1.5 overflow-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? "bg-[#FF4B2C] text-white shadow-lg shadow-[#FF4B2C]/20"
                    : "text-slate-400 hover:bg-[#FF4B2C]/10 hover:text-[#FF4B2C]"
                }`
              }
            >
              {({ isActive }) => {
                const isLocked = !modulesLoading && item.moduleKey ? !({ hasForum, hasShop }[item.moduleKey]) : false;

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
        
        <div className="border-t border-slate-800 p-4">
          <button 
            onClick={() => { signOut(); navigate("/"); }} 
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-400 transition-colors hover:bg-[#FF4B2C]/10 hover:text-[#FF4B2C]"
          >
            <LogOut size={18} /> Abmelden
          </button>
        </div>
      </aside>
      
      <main className="flex-1 overflow-auto bg-[#F8FAFC]">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;