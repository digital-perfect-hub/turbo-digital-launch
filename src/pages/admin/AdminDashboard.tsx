import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, CreditCard, Eye, FileText, MessageSquare, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSiteContext } from "@/context/SiteContext";
import { DEFAULT_SITE_ID } from "@/lib/site";
import { useSiteModules } from "@/hooks/useSiteModules";
import KpiCard from "@/components/admin/dashboard/KpiCard";
import LeadsTrendChart from "@/components/admin/dashboard/LeadsTrendChart";
import ContentHealthCard from "@/components/admin/dashboard/ContentHealthCard";
import PlanStatusCard from "@/components/admin/dashboard/PlanStatusCard";
import SiteModuleCard from "@/components/admin/dashboard/SiteModuleCard";
import { useBilling } from "@/hooks/useBilling";

const formatDayLabel = (value: Date) => value.toLocaleDateString("de-AT", { day: "2-digit", month: "2-digit" });

const getCountryLabel = (countryCode: string) => {
  try {
    const displayNames = new Intl.DisplayNames(["de-AT"], { type: "region" });
    return displayNames.of(countryCode) || countryCode;
  } catch {
    return countryCode;
  }
};

const AdminDashboard = () => {
  const { activeSiteId } = useSiteContext();
  const siteId = activeSiteId || DEFAULT_SITE_ID;
  const { hasForum, hasSeoPro, hasShop, hasSupportDesk } = useSiteModules();
  const { plan, statusLabel, profile } = useBilling();

  const dashboardQuery = useQuery({
    queryKey: ["admin-dashboard-premium", siteId],
    queryFn: async () => {
      const now = new Date();
      const from = new Date(now);
      from.setDate(from.getDate() - 13);
      const fromIso = from.toISOString();

      const [leadsCountRes, pagesRes, pageViewsRes, leadsTrendRes, productsRes] = await Promise.all([
        supabase.from("leads").select("*", { count: "exact", head: true }).eq("site_id", siteId),
        supabase.from("pages" as never).select("id, is_published").eq("site_id", siteId),
        supabase.from("page_views" as never).select("id, created_at, session_id, visitor_hash, country").eq("site_id", siteId).gte("created_at", fromIso),
        supabase.from("leads").select("id, created_at").eq("site_id", siteId).gte("created_at", fromIso),
        supabase.from("products").select("*", { count: "exact", head: true }).eq("site_id", siteId),
      ]);

      const pages = (pagesRes.data as Array<{ id: string; is_published: boolean }> | null) ?? [];
      const pageViews = ((pageViewsRes.data as Array<{ id: string; created_at: string; session_id: string; visitor_hash?: string | null; country?: string | null }> | null) ?? []);
      const trendLeads = (leadsTrendRes.data as Array<{ id: string; created_at: string }> | null) ?? [];

      const days = Array.from({ length: 14 }, (_, index) => {
        const date = new Date(from);
        date.setDate(from.getDate() + index);
        const isoKey = date.toISOString().slice(0, 10);
        return {
          isoKey,
          date: formatDayLabel(date),
          Leads: 0,
          Views: 0,
        };
      });

      const trendByDate = new Map(days.map((entry) => [entry.isoKey, entry]));
      trendLeads.forEach((entry) => {
        const key = entry.created_at.slice(0, 10);
        const row = trendByDate.get(key);
        if (row) row.Leads += 1;
      });
      pageViews.forEach((entry) => {
        const key = entry.created_at.slice(0, 10);
        const row = trendByDate.get(key);
        if (row) row.Views += 1;
      });

      const uniqueVisitors = new Set(
        pageViews
          .map((entry) => entry.visitor_hash || (entry.session_id ? `session:${entry.session_id}` : null))
          .filter(Boolean),
      );
      const conversionRate = uniqueVisitors.size ? ((trendLeads.length / uniqueVisitors.size) * 100).toFixed(1) : "0.0";

      const countryMap = new Map<string, number>();
      pageViews.forEach((entry) => {
        if (!entry.country) return;
        countryMap.set(entry.country, (countryMap.get(entry.country) ?? 0) + 1);
      });

      const topCountries = Array.from(countryMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([code, count]) => ({ code, count, label: getCountryLabel(code) }));

      return {
        leadsCount: leadsCountRes.count ?? 0,
        pagesLive: pages.filter((page) => page.is_published).length,
        pagesDraft: pages.filter((page) => !page.is_published).length,
        pageViewCount: pageViews.length,
        uniqueVisitors: uniqueVisitors.size,
        productsCount: productsRes.count ?? 0,
        conversionRate,
        topCountries,
        trend: days.map(({ isoKey: _iso, ...rest }) => rest),
      };
    },
  });

  const stats = dashboardQuery.data;
  const activeModules = useMemo(
    () => [hasShop ? "Shop" : null, hasForum ? "Forum" : null, hasSeoPro ? "SEO Pro" : null, hasSupportDesk ? "Support Desk" : null].filter(Boolean) as string[],
    [hasForum, hasSeoPro, hasShop, hasSupportDesk],
  );

  return (
    <div className="max-w-7xl p-6 md:p-8 lg:p-10">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#FF4B2C]/15 bg-[#FF4B2C]/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#FF4B2C] shadow-sm">
          <Sparkles size={14} /> Admin Übersicht
        </div>
        <h1 className="mt-4 text-3xl font-extrabold tracking-[-0.04em] text-slate-900">Digital-Perfect Control Center</h1>
        <p className="mt-2 text-sm text-slate-500">Leads, Views, aktive Seiten und SaaS-Billing in einem Premium-Dashboard.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Leads" value={stats?.leadsCount ?? "—"} description="Alle Anfragen der aktiven Site." icon={MessageSquare} />
        <KpiCard title="Views (14 Tage)" value={stats?.pageViewCount ?? "—"} description="Dedupte Page Views via Edge Tracking." icon={Eye} />
        <KpiCard title="Aktive Seiten" value={stats?.pagesLive ?? "—"} description="Veröffentlichte Landingpages." icon={FileText} />
        <KpiCard title="Conversion" value={stats ? `${stats.conversionRate}%` : "—"} description={`Leads pro ${stats?.uniqueVisitors ?? 0} unique Besucher.`} icon={BarChart3} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
        <LeadsTrendChart data={stats?.trend ?? []} />
        <div className="space-y-6">
          <PlanStatusCard
            planName={plan.name}
            status={statusLabel}
            renewalLabel={profile.current_period_end ? `Nächste Verlängerung: ${new Date(profile.current_period_end).toLocaleDateString("de-AT")}` : "Noch keine aktive Subscription gefunden."}
          />
          <SiteModuleCard activeModules={activeModules} />
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <ContentHealthCard pagesLive={stats?.pagesLive ?? 0} pagesDraft={stats?.pagesDraft ?? 0} products={stats?.productsCount ?? 0} />
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Billing Snapshot</div>
          <h3 className="mt-2 text-xl font-bold text-slate-900">SaaS Status</h3>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-4">
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Plan</div>
              <div className="mt-2 text-2xl font-extrabold text-slate-900">{plan.name}</div>
            </div>
            <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-4">
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Portal</div>
              <div className="mt-2 inline-flex items-center gap-2 text-lg font-extrabold text-slate-900"><CreditCard size={18} /> Aktiv</div>
            </div>
          </div>

          <div className="mt-5 rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-4">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Top Länder</div>
            {stats?.topCountries?.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {stats.topCountries.map((country) => (
                  <span key={country.code} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700">
                    <span>{country.label}</span>
                    <span className="text-xs uppercase tracking-[0.18em] text-slate-400">{country.code}</span>
                    <span className="text-xs text-slate-500">{country.count}</span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500">Noch keine Länder-Daten erfasst.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
