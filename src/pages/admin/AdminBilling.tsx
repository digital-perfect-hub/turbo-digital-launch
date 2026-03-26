import { CreditCard, Loader2, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useBilling } from "@/hooks/useBilling";
import { BILLING_PLANS } from "@/lib/billing";

const AdminBilling = () => {
  const { profile, plan, statusLabel, isLoading, checkoutMutation, portalMutation, refetch } = useBilling();

  const renewalLabel = profile.current_period_end
    ? `Nächste Verlängerung: ${format(new Date(profile.current_period_end), "dd. MMMM yyyy", { locale: de })}`
    : "Noch keine aktive Subscription gefunden.";

  return (
    <div className="max-w-7xl p-6 md:p-8 lg:p-10">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#FF4B2C]/15 bg-[#FF4B2C]/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#FF4B2C] shadow-sm">
            <Sparkles size={14} /> SaaS Billing
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-[-0.04em] text-slate-900">Abos & Customer Portal</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-500">Subscription Checkout, Status-Sync und Stripe Customer Portal für deine aktive Site.</p>
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
