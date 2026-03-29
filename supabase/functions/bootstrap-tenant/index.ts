import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type BootstrapTenantRequest = {
  templateId?: unknown;
  companyName?: unknown;
  slug?: unknown;
  primaryDomain?: unknown;
  description?: unknown;
  ownerUserId?: unknown;
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });

const normalizeText = (value: unknown, maxLength: number, fallback = "") => {
  if (typeof value !== "string") return fallback;
  return value.trim().slice(0, maxLength);
};

const normalizeNullableText = (value: unknown, maxLength: number) => {
  const normalized = normalizeText(value, maxLength, "");
  return normalized.length ? normalized : null;
};

const normalizeSlug = (value: unknown, companyName: string) => {
  const raw = normalizeText(value, 120, companyName);
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const authHeader = request.headers.get("Authorization") || "";
    const jwt = authHeader.replace(/^Bearer\s+/i, "").trim();

    if (!supabaseUrl || !serviceRoleKey) {
      return json({ error: "Missing function secrets." }, 500);
    }

    if (!jwt) {
      return json({ error: "Missing bearer token." }, 401);
    }

    const serviceSupabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const {
      data: { user },
      error: authError,
    } = await serviceSupabase.auth.getUser(jwt);

    if (authError || !user) {
      return json({ error: authError?.message || "Unauthorized" }, 401);
    }

    const { data: globalRole, error: roleError } = await serviceSupabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError) {
      return json({ error: roleError.message }, 500);
    }

    if (!globalRole) {
      return json({ error: "Only global admins can bootstrap tenants." }, 403);
    }

    const body = (await request.json()) as BootstrapTenantRequest;
    const templateId = normalizeText(body.templateId, 80);
    const companyName = normalizeText(body.companyName, 160);
    const slug = normalizeSlug(body.slug, companyName);
    const primaryDomain = normalizeNullableText(body.primaryDomain, 255);
    const description = normalizeNullableText(body.description, 500);
    const ownerUserId = normalizeText(body.ownerUserId, 80, user.id);

    if (!templateId) {
      return json({ error: "templateId is required." }, 400);
    }

    if (!companyName) {
      return json({ error: "companyName is required." }, 400);
    }

    if (!slug) {
      return json({ error: "slug is required." }, 400);
    }

    const { data, error } = await serviceSupabase.rpc("bootstrap_tenant_from_template", {
      p_template_id: templateId,
      p_company_name: companyName,
      p_site_slug: slug,
      p_primary_domain: primaryDomain,
      p_description: description,
      p_owner_user_id: ownerUserId,
    });

    if (error) {
      return json({ error: error.message }, 400);
    }

    const payload = Array.isArray(data) ? data[0] : data;
    const normalizedSite = {
      id: (payload as { site_id?: string } | null)?.site_id ?? null,
      slug: (payload as { site_slug?: string } | null)?.site_slug ?? null,
      name: companyName,
      template_id: (payload as { template_id?: string } | null)?.template_id ?? null,
    };

    return json({ site: normalizedSite }, 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown bootstrap error";
    return json({ error: message }, 500);
  }
});
