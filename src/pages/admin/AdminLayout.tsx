import { useEffect } from "react";
import { Outlet, useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  ImageIcon,
  Package,
  MessageSquare,
  Settings,
  Type,
  HelpCircle,
  LogOut,
  FileText,
} from "lucide-react";

const navItems = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
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
    <div className="min-h-screen flex bg-background">
      <aside className="w-64 border-r border-border bg-card flex flex-col">
        <div className="p-5 border-b border-border">
          <h2 className="font-bold text-lg">Admin Panel</h2>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                  isActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`
              }
            >
              <item.icon size={16} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-border">
          <button onClick={() => { signOut(); navigate("/"); }} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-destructive w-full transition-colors">
            <LogOut size={16} /> Abmelden
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
