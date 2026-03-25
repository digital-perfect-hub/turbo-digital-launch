import { useQuery } from "@tanstack/react-query";
import { ImageIcon, MessageSquare, Package, Sparkles, Type } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSiteContext } from "@/context/SiteContext";
import { DEFAULT_SITE_ID } from "@/lib/site";

const AdminDashboard = () => {
  const { activeSiteId } = useSiteContext();
  const siteId = activeSiteId || DEFAULT_SITE_ID;
  const { data: portfolioCount = 0 } = useQuery({
    queryKey: ["admin-portfolio-count", siteId],
    queryFn: async () => {
      const { count } = await supabase.from("portfolio_items").select("*", { count: "exact", head: true }).eq("site_id", siteId);
      return count ?? 0;
    },
  });

  const { data: productCount = 0 } = useQuery({
    queryKey: ["admin-product-count", siteId],
    queryFn: async () => {
      const { count } = await supabase.from("products").select("*", { count: "exact", head: true }).eq("site_id", siteId);
      return count ?? 0;
    },
  });

  const { data: leadCount = 0 } = useQuery({
    queryKey: ["admin-lead-count", siteId],
    queryFn: async () => {
      const { count } = await supabase.from("leads").select("*", { count: "exact", head: true }).eq("site_id", siteId);
      return count ?? 0;
    },
  });

  const stats = [
    { label: "Portfolio-Items", value: portfolioCount, icon: ImageIcon },
    { label: "Produkte", value: productCount, icon: Package },
    { label: "Anfragen", value: leadCount, icon: MessageSquare },
  ];

  return (
    <div className="max-w-7xl p-6 md:p-8 lg:p-10">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#FF4B2C]/15 bg-[#FF4B2C]/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#FF4B2C] shadow-sm">
          <Sparkles size={14} /> Admin Übersicht
        </div>
        <h1 className="mt-4 text-3xl font-extrabold tracking-[-0.04em] text-slate-900">Digital-Perfect Control Center</h1>
        <p className="mt-2 text-sm text-slate-500">Farben, Hero-Bild, Inhalte und Leads zentral steuern.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="admin-surface-card p-6">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0E1F53] text-white shadow-[0_20px_40px_-24px_rgba(14,31,83,0.48)]">
                <s.icon size={20} />
              </div>
              <span className="rounded-full border border-[#FF4B2C]/15 bg-[#FF4B2C]/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#FF4B2C]">
                Live
              </span>
            </div>
            <div className="text-sm font-semibold text-slate-500">{s.label}</div>
            <div className="mt-2 text-3xl font-extrabold tracking-[-0.03em] text-slate-900">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <div className="admin-surface-card p-6">
          <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FF4B2C]/10 text-[#FF4B2C]">
            <Type size={18} />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Hero jetzt mit großem Bild pflegbar</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Im Hero-Admin kannst du ab jetzt ein großes Topbild per Storage-Pfad pflegen und direkt in der Vorschau prüfen.
          </p>
        </div>
        <div className="admin-surface-card p-6">
          <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0E1F53]/10 text-[#0E1F53]">
            <Sparkles size={18} />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Brandfarben sauber vereinheitlicht</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Orange #FF4B2C und Mitternachtsblau #0E1F53 bleiben die feste Markenbasis für Admin und Frontend.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
