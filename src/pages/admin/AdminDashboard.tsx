import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ImageIcon, Package, MessageSquare, Settings } from "lucide-react";

const AdminDashboard = () => {
  const { data: portfolioCount = 0 } = useQuery({
    queryKey: ["admin-portfolio-count"],
    queryFn: async () => {
      const { count } = await supabase.from("portfolio_items").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const { data: productCount = 0 } = useQuery({
    queryKey: ["admin-product-count"],
    queryFn: async () => {
      const { count } = await supabase.from("products").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const { data: leadCount = 0 } = useQuery({
    queryKey: ["admin-lead-count"],
    queryFn: async () => {
      const { count } = await supabase.from("leads").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const stats = [
    { label: "Portfolio-Items", value: portfolioCount, icon: ImageIcon },
    { label: "Produkte", value: productCount, icon: Package },
    { label: "Anfragen", value: leadCount, icon: MessageSquare },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="p-5 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-3 mb-2">
              <s.icon size={20} className="text-primary" />
              <span className="text-sm text-muted-foreground">{s.label}</span>
            </div>
            <div className="text-3xl font-bold">{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
