import { useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSiteContext } from "@/context/SiteContext";
import { DEFAULT_SITE_ID } from "@/lib/site";
import { BILLING_STATUS_LABELS, getBillingPlan, type BillingPlanKey } from "@/lib/billing";

export type BillingProfile = {
  id: string;
  site_id: string;
  plan_key: string | null;
  status: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
};

const EMPTY_PROFILE: BillingProfile = {
  id: "",
  site_id: DEFAULT_SITE_ID,
  plan_key: "starter",
  status: "inactive",
  current_period_end: null,
  cancel_at_period_end: false,
  stripe_customer_id: null,
  stripe_subscription_id: null,
  stripe_price_id: null,
};

export const useBilling = () => {
  const { activeSiteId } = useSiteContext();
  const siteId = activeSiteId || DEFAULT_SITE_ID;

  const billingQuery = useQuery({
    queryKey: ["site-billing-profile", siteId],
    enabled: Boolean(siteId),
    queryFn: async (): Promise<BillingProfile> => {
      const { data, error } = await supabase
        .from("site_billing_profiles" as never)
        .select("*")
        .eq("site_id", siteId)
        .maybeSingle();

      if (error) {
        const code = typeof (error as any)?.code === "string" ? (error as any).code : "";
        if (code === "42P01" || code === "PGRST205") {
          return { ...EMPTY_PROFILE, site_id: siteId };
        }
        throw error;
      }

      if (!data) return { ...EMPTY_PROFILE, site_id: siteId };
      return data as BillingProfile;
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: async (planKey: BillingPlanKey) => {
      const returnUrl = `${window.location.origin}/admin/billing`;
      const { data, error } = await supabase.functions.invoke("create-stripe-billing-session", {
        body: { planKey, siteId, returnUrl },
      });
      if (error) throw error;
      if (!data?.url) throw new Error("Stripe Checkout URL fehlt.");
      window.location.href = data.url;
    },
  });

  const portalMutation = useMutation({
    mutationFn: async () => {
      const returnUrl = `${window.location.origin}/admin/billing`;
      const { data, error } = await supabase.functions.invoke("create-stripe-customer-portal", {
        body: { siteId, returnUrl },
      });
      if (error) throw error;
      if (!data?.url) throw new Error("Customer Portal URL fehlt.");
      window.location.href = data.url;
    },
  });

  const profile = billingQuery.data ?? { ...EMPTY_PROFILE, site_id: siteId };
  const plan = useMemo(() => getBillingPlan(profile.plan_key), [profile.plan_key]);
  const statusLabel = BILLING_STATUS_LABELS[profile.status || ""] || (profile.status || "Inaktiv");

  return {
    ...billingQuery,
    siteId,
    profile,
    plan,
    statusLabel,
    checkoutMutation,
    portalMutation,
  };
};
