import { useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
// Achte darauf, dass 'Settings' als Icon von lucide-react importiert ist (hast du schon).
import { FileText, HelpCircle, ImageIcon, LayoutDashboard, LogOut, MessageSquare, Palette, Package, Settings, Type, Menu, PanelBottom } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/admin/branding", icon: Palette, label: "Branding & Theme" },
  { to: "/admin/navigation", icon: Menu, label: "Navigation" },
  { to: "/admin/footer", icon: PanelBottom, label: "Footer" },
  { to: "/admin/homepage", icon: FileText, label: "Homepage Inhalte" },
  { to: "/admin/hero", icon: Type, label: "Hero-Bereich" },
  { to: "/admin/services", icon: Settings, label: "Leistungen" },
  { to: "/admin/portfolio", icon: ImageIcon, label: "Portfolio" },
  { to: "/admin/products", icon: Package, label: "Produkte" },
  { to: "/admin/faq", icon: HelpCircle, label: "FAQ" },
  { to: "/admin/leads", icon: MessageSquare, label: "Anfragen" },
  { to: "/admin/settings", icon: Settings, label: "Einstellungen" }, // <--- ERSETZT DAS ALTE SEO
];

const AdminLayout = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
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
              {({ isActive }) => (
                <>
                  <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  {item.label}
                </>
              )}
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