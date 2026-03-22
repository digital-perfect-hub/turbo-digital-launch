import Stripe from "https://esm.sh/stripe@14?target=denonext";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type CheckoutRequest = {
  priceIds?: unknown;
  successUrl?: unknown;
  cancelUrl?: unknown;
};

const json = (body: unknown, status = 200) => {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
};

const isValidHttpUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      return json({ error: "Missing STRIPE_SECRET_KEY" }, 500);
    }

    const { priceIds, successUrl, cancelUrl } = (await request.json()) as CheckoutRequest;
    const normalizedPriceIds = Array.isArray(priceIds)
      ? Array.from(new Set(priceIds.filter((item): item is string => typeof item === "string" && item.trim().length > 0).map((item) => item.trim())))
      : [];

    if (!normalizedPriceIds.length) {
      return json({ error: "At least one Stripe price ID is required." }, 400);
    }

    if (typeof successUrl !== "string" || !isValidHttpUrl(successUrl)) {
      return json({ error: "A valid successUrl is required." }, 400);
    }

    if (typeof cancelUrl !== "string" || !isValidHttpUrl(cancelUrl)) {
      return json({ error: "A valid cancelUrl is required." }, 400);
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      line_items: normalizedPriceIds.map((priceId) => ({
        price: priceId,
        quantity: 1,
      })),
      automatic_tax: { enabled: true },
      billing_address_collection: "auto",
      customer_creation: "always",
      allow_promotion_codes: true,
    });

    if (!session.url) {
      return json({ error: "Stripe did not return a checkout URL." }, 500);
    }

    return json({ url: session.url }, 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown checkout error";
    return json({ error: message }, 500);
  }
});
