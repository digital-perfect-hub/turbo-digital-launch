import Stripe from "https://esm.sh/stripe@14?target=denonext";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2?target=denonext";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const PLAN_TO_PRICE_ENV: Record<string, string> = {
  starter: "STRIPE_PRICE_STARTER",
  pro: "STRIPE_PRICE_PRO",
  agency: "STRIPE_PRICE_AGENCY",
};

const getBearerToken = (request: Request) => request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "") ?? "";

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!stripeSecretKey || !supabaseUrl || !serviceRoleKey) return json({ error: "Missing server secrets." }, 500);

    const token = getBearerToken(request);
    if (!token) return json({ error: "Missing authorization token." }, 401);

    const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
    const { data: userData, error: userError } = await admin.auth.getUser(token);
    if (userError || !userData.user) return json({ error: "Unauthorized" }, 401);

    const { planKey, siteId, returnUrl } = await request.json();
    if (typeof planKey !== "string" || !(planKey in PLAN_TO_PRICE_ENV)) return json({ error: "Invalid plan key." }, 400);
    if (typeof siteId !== "string" || !siteId.trim()) return json({ error: "Missing siteId." }, 400);
    if (typeof returnUrl !== "string" || !/^https?:\/\//.test(returnUrl)) return json({ error: "Invalid returnUrl." }, 400);

    const [{ data: adminRole }, { data: siteRole }] = await Promise.all([
      admin.from("user_roles").select("role").eq("user_id", userData.user.id).eq("role", "admin").maybeSingle(),
      admin.from("user_site_roles" as never).select("role").eq("user_id", userData.user.id).eq("site_id", siteId).in("role", ["owner", "admin"]).limit(1),
    ]);

    if (!adminRole && !(Array.isArray(siteRole) && siteRole.length)) return json({ error: "No permission for this site." }, 403);

    const { data: existingProfile } = await admin.from("site_billing_profiles" as never).select("stripe_customer_id").eq("site_id", siteId).maybeSingle();
    const priceId = Deno.env.get(PLAN_TO_PRICE_ENV[planKey]);
    if (!priceId) return json({ error: `Missing ${PLAN_TO_PRICE_ENV[planKey]} secret.` }, 500);

    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      success_url: `${returnUrl}?billing=success`,
      cancel_url: `${returnUrl}?billing=cancel`,
      line_items: [{ price: priceId, quantity: 1 }],
      customer: typeof (existingProfile as any)?.stripe_customer_id === "string" && (existingProfile as any).stripe_customer_id.trim() ? (existingProfile as any).stripe_customer_id : undefined,
      customer_email: userData.user.email || undefined,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      automatic_tax: { enabled: true },
      subscription_data: {
        metadata: {
          site_id: siteId,
          user_id: userData.user.id,
          plan_key: planKey,
        },
      },
      metadata: {
        site_id: siteId,
        user_id: userData.user.id,
        plan_key: planKey,
      },
    });

    if (!session.url) return json({ error: "Stripe did not return a checkout URL." }, 500);
    return json({ url: session.url }, 200);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unknown billing session error" }, 500);
  }
});
