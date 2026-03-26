import Stripe from "https://esm.sh/stripe@14?target=denonext";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2?target=denonext";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const PLAN_ENV_MAP = {
  starter: Deno.env.get("STRIPE_PRICE_STARTER") || "",
  pro: Deno.env.get("STRIPE_PRICE_PRO") || "",
  agency: Deno.env.get("STRIPE_PRICE_AGENCY") || "",
};

const inferPlanKey = (priceId?: string | null) => {
  const entry = Object.entries(PLAN_ENV_MAP).find(([, value]) => value && value === priceId);
  return entry?.[0] ?? "starter";
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!stripeSecretKey || !webhookSecret || !supabaseUrl || !serviceRoleKey) return json({ error: "Missing webhook secrets." }, 500);

    const signature = request.headers.get("stripe-signature");
    if (!signature) return json({ error: "Missing stripe-signature header." }, 400);

    const rawBody = await request.text();
    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });
    const event = await stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret);
    const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

    const upsertProfile = async (payload: {
      siteId: string;
      customerId?: string | null;
      subscriptionId?: string | null;
      priceId?: string | null;
      status?: string | null;
      currentPeriodEnd?: number | null;
      cancelAtPeriodEnd?: boolean;
      planKey?: string | null;
    }) => {
      await admin.from("site_billing_profiles" as never).upsert({
        site_id: payload.siteId,
        stripe_customer_id: payload.customerId || null,
        stripe_subscription_id: payload.subscriptionId || null,
        stripe_price_id: payload.priceId || null,
        plan_key: payload.planKey || inferPlanKey(payload.priceId),
        status: payload.status || null,
        current_period_end: payload.currentPeriodEnd ? new Date(payload.currentPeriodEnd * 1000).toISOString() : null,
        cancel_at_period_end: Boolean(payload.cancelAtPeriodEnd),
      }, { onConflict: "site_id" });
    };

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const siteId = (session.metadata?.site_id || session.subscription_details?.metadata?.site_id || "").trim();
        if (siteId && typeof session.subscription === "string") {
          const subscription = await stripe.subscriptions.retrieve(session.subscription);
          const firstItem = subscription.items.data[0];
          await upsertProfile({
            siteId,
            customerId: typeof session.customer === "string" ? session.customer : null,
            subscriptionId: subscription.id,
            priceId: firstItem?.price?.id || null,
            status: subscription.status,
            currentPeriodEnd: subscription.current_period_end,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            planKey: session.metadata?.plan_key || inferPlanKey(firstItem?.price?.id || null),
          });
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const siteId = (subscription.metadata?.site_id || "").trim();
        const firstItem = subscription.items.data[0];
        if (siteId) {
          await upsertProfile({
            siteId,
            customerId: typeof subscription.customer === "string" ? subscription.customer : null,
            subscriptionId: subscription.id,
            priceId: firstItem?.price?.id || null,
            status: subscription.status,
            currentPeriodEnd: subscription.current_period_end,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            planKey: subscription.metadata?.plan_key || inferPlanKey(firstItem?.price?.id || null),
          });
        }
        break;
      }
      default:
        break;
    }

    return json({ received: true });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unknown webhook error" }, 400);
  }
});
