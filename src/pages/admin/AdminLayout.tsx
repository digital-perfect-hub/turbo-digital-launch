import { useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { FileText, HelpCircle, ImageIcon, LayoutDashboard, LogOut, MessageSquare, Palette, Package, Settings, Type } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/admin/branding", icon: Palette, label: "Branding & Theme" },
  { to: "/admin/homepage", icon: FileText, label: "Homepage Inhalte" },
  { to: "/admin/hero", icon: Type, label: "Hero-Bereich" },
  { to: "/admin/services", icon: Settings, label: "Leistungen" },
  { to: "/admin/portfolio", icon: ImageIcon, label: "Portfolio" },
  { to: "/admin/products", icon: Package, label: "Produkte" },
  { to: "/admin/faq", icon: HelpCircle, label: "FAQ" },
  { to: "/admin/leads", icon: MessageSquare, label: "Anfragen" },
  { to: "/admin/seo", icon: Settings, label: "SEO" },
];

const AdminLayout = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/login");
    }
  }, [user, isAdmin, loading, navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Laden...</div>;
  if (!user || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <aside className="w-72 shrink-0 border-r border-slate-800 bg-slate-950 text-white flex flex-col">
        <div className="border-b border-slate-800 p-6">
          <h2 className="text-lg font-bold tracking-[-0.03em]">Admin Panel</h2>
          <p className="mt-1 text-xs text-slate-400 truncate">{user.email}</p>
        </div>
        <nav className="flex-1 p-3 space-y-1.5 overflow-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-all ${
                  isActive
                    ? "bg-white text-slate-950 font-semibold shadow-[0_18px_40px_-24px_rgba(255,255,255,0.2)]"
                    : "text-slate-300 hover:bg-slate-900 hover:text-white"
                }`
              }
            >
              <item.icon size={17} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-800 p-3">
          <button onClick={() => { signOut(); navigate("/"); }} className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm text-slate-300 transition-colors hover:bg-slate-900 hover:text-white">
            <LogOut size={17} /> Abmelden
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-[linear-gradient(180deg,#f8fafc,#eef2f7)]">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
