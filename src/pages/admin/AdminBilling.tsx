import { CreditCard, Loader2, ShieldCheck, Sparkles, Users, Globe2, Files } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useBilling } from "@/hooks/useBilling";
import { BILLING_PLANS, formatUsageLabel } from "@/lib/billing";

const AdminBilling = () => {
  const { profile, plan, entitlements, usage, statusLabel, isLoading, checkoutMutation, portalMutation, refetch } = useBilling();

  const renewalLabel = profile.current_period_end
    ? `Nächste Verlängerung: ${format(new Date(profile.current_period_end), "dd. MMMM yyyy", { locale: de })}`
    : "Noch keine aktive Subscription gefunden.";

  const usageCards = [
    { icon: Users, label: "Team", value: formatUsageLabel(usage.teamMembers, entitlements.maxTeamMembers, "Mitglied", "Mitglieder"), progress: Math.min(100, Math.round((usage.teamMembers / entitlements.maxTeamMembers) * 100)) },
    { icon: Globe2, label: "Domains", value: formatUsageLabel(usage.customDomains, entitlements.maxCustomDomains, "Domain"), progress: Math.min(100, Math.round((usage.customDomains / entitlements.maxCustomDomains) * 100)) },
    { icon: Files, label: "Pages", value: formatUsageLabel(usage.pages, entitlements.maxPages, "Page", "Pages"), progress: Math.min(100, Math.round((usage.pages / entitlements.maxPages) * 100)) },
  ];

  return (
    <div className="max-w-7xl p-6 md:p-8 lg:p-10">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#FF4B2C]/15 bg-[#FF4B2C]/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#FF4B2C] shadow-sm">
            <Sparkles size={14} /> SaaS Billing
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-[-0.04em] text-slate-900">Abos, Limits & Customer Portal</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-500">Subscription Checkout, Status-Sync und echte Nutzungsgrenzen für Team, Domains und Pages pro aktiver Site.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="rounded-xl border-slate-200" onClick={() => refetch()}>
            Status neu laden
          </Button>
          <Button
            variant="outline"
            className="rounded-xl border-slate-200"
            onClick={() => portalMutation.mutate(undefined, { onError: (error: any) => toast.error(error?.message || "Customer Portal konnte nicht geöffnet werden.") })}
            disabled={portalMutation.isPending || !profile.stripe_customer_id}
          >
            {portalMutation.isPending ? <Loader2 size={16} className="mr-2 animate-spin" /> : <CreditCard size={16} className="mr-2" />}
            Customer Portal
          </Button>
        </div>
      </div>

      <section className="mb-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Aktiver Plan</div>
            <div className="mt-3 text-2xl font-extrabold text-slate-900">{plan.name}</div>
          </div>
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Status</div>
            <div className="mt-3 text-2xl font-extrabold text-slate-900">{statusLabel}</div>
          </div>
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Laufzeit</div>
            <div className="mt-3 text-sm font-semibold leading-6 text-slate-700">{renewalLabel}</div>
          </div>
        </div>
      </section>

      <section className="mb-8 grid gap-4 lg:grid-cols-3">
        {usageCards.map((card) => (
          <Card key={card.label} className="rounded-[2rem] border-slate-200">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFF2EE] text-[#FF4B2C]"><card.icon size={18} /></div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">{card.label}</p>
                  <p className="text-sm font-semibold text-slate-900">{card.value}</p>
                </div>
              </div>
              <Progress className="mt-4 h-2" value={card.progress} />
            </CardContent>
          </Card>
        ))}
      </section>

      <Card className="mb-8 rounded-[2rem] border-emerald-200 bg-emerald-50/70">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-900"><ShieldCheck size={18} /> Entitlements sind jetzt gekoppelt</CardTitle>
          <CardDescription className="text-emerald-900/80">
            Team-Invites und Domain-Anlage prüfen Limits nicht mehr nur optisch, sondern greifen auf den aktiven Billing-Plan zurück.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {BILLING_PLANS.map((entry) => {
          const isActive = entry.key === plan.key;
          return (
            <article key={entry.key} className={`rounded-[2rem] border p-6 shadow-sm ${isActive ? "border-[#FF4B2C] bg-[#FFF4F1]" : "border-slate-200 bg-white"}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-extrabold tracking-[-0.03em] text-slate-900">{entry.name}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{entry.description}</p>
                </div>
                {isActive ? <span className="rounded-full border border-[#FF4B2C]/20 bg-[#FF4B2C]/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[#FF4B2C]">Aktiv</span> : null}
              </div>
              <div className="mt-6 text-3xl font-extrabold text-slate-900">{entry.priceLabel}</div>
              <ul className="mt-6 space-y-3 text-sm text-slate-600">
                {entry.features.map((feature) => (
                  <li key={feature} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">{feature}</li>
                ))}
                <li className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">{formatUsageLabel(entry.entitlements.maxTeamMembers, entry.entitlements.maxTeamMembers, "Mitglied", "Mitglieder")} möglich</li>
                <li className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">{formatUsageLabel(entry.entitlements.maxCustomDomains, entry.entitlements.maxCustomDomains, "Domain")}</li>
              </ul>
              <Button
                className="mt-6 w-full rounded-xl bg-[#FF4B2C] text-white hover:bg-[#E03A1E]"
                disabled={checkoutMutation.isPending || isLoading}
                onClick={() => checkoutMutation.mutate(entry.key, { onError: (error: any) => toast.error(error?.message || "Checkout konnte nicht gestartet werden.") })}
              >
                {checkoutMutation.isPending ? <Loader2 size={16} className="mr-2 animate-spin" /> : <CreditCard size={16} className="mr-2" />}
                {isActive ? "Plan wechseln / neu buchen" : `${entry.name} buchen`}
              </Button>
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default AdminBilling;
