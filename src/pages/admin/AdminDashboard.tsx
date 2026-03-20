import { useQuery } from "@tanstack/react-query";
import { ImageIcon, MessageSquare, Package, Sparkles, Type } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-600 shadow-sm">
          <Sparkles size={14} className="text-gold-dark" /> Admin Übersicht
        </div>
        <h1 className="mt-4 text-3xl font-extrabold tracking-[-0.04em] text-slate-900">Digital-Perfect Control Center</h1>
        <p className="mt-2 text-sm text-slate-500">Farben, Hero-Bild, Inhalte und Leads zentral steuern.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="glass-card p-6">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
              <s.icon size={20} />
            </div>
            <div className="text-sm text-slate-500">{s.label}</div>
            <div className="mt-2 text-3xl font-extrabold tracking-[-0.03em] text-slate-900">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <div className="glass-card p-6">
          <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gold/10 text-gold-dark">
            <Type size={18} />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Hero jetzt mit großem Bild pflegbar</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">Im Hero-Admin kannst du ab jetzt ein großes Topbild per Storage-Pfad pflegen und direkt in der Vorschau prüfen.</p>
        </div>
        <div className="glass-card p-6">
          <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald/10 text-emerald">
            <Sparkles size={18} />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Brandfarben sauber vereinheitlicht</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">Orange #FF4B2C und Mitternachtsblau #0E1F53 sind jetzt die feste Markenbasis für Admin und Frontend.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
