import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type ResetTenantUserPasswordRequest = {
  email?: unknown;
  site_id?: unknown;
  redirectTo?: unknown;
};

type TenantRole = "owner" | "admin" | "editor" | "viewer";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });

const normalizeEmail = (value: unknown) => {
  if (typeof value !== "string") return "";
  return value.trim().toLowerCase();
};

const getBearerToken = (request: Request) => request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "")?.trim() ?? "";

const sanitizeRedirectTo = (appBaseUrl: string) => {
  const fallbackBase = appBaseUrl.replace(/\/$/, "");
  return `${fallbackBase}/set-password`;
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
    const token = getBearerToken(request);

    if (!supabaseUrl || !serviceRoleKey) {
      return json({ error: "Missing function secrets." }, 500);
    }

    if (!token) {
      return json({ error: "Missing bearer token." }, 401);
    }

    const appBaseUrl = Deno.env.get("APP_BASE_URL") || "https://dev.digital-perfect.com";

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const {
      data: { user: caller },
      error: callerError,
    } = await admin.auth.getUser(token);

    if (callerError || !caller) {
      return json({ error: callerError?.message || "Unauthorized" }, 401);
    }

    const body = (await request.json()) as ResetTenantUserPasswordRequest;
    const email = normalizeEmail(body.email);
    const siteId = typeof body.site_id === "string" ? body.site_id.trim() : "";
    const redirectTo = sanitizeRedirectTo(appBaseUrl);

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return json({ error: "A valid email is required." }, 400);
    }

    if (!siteId) {
      return json({ error: "site_id is required." }, 400);
    }

    const [{ data: globalRole }, { data: siteRoleRows }] = await Promise.all([
      admin.from("user_roles").select("role").eq("user_id", caller.id).eq("role", "admin").maybeSingle(),
      admin.from("user_site_roles" as never).select("role").eq("user_id", caller.id).eq("site_id", siteId).in("role", ["owner", "admin"]),
    ]);

    const isGlobalAdmin = Boolean(globalRole);
    const callerCanManageSite = isGlobalAdmin || (Array.isArray(siteRoleRows) && siteRoleRows.length > 0);

    if (!callerCanManageSite) {
      return json({ error: "You are not allowed to manage users for this site." }, 403);
    }

    // Optional: prevent tenant-admins from triggering reset for global admins.
    const userListResult = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (userListResult.error) {
      return json({ error: userListResult.error.message }, 500);
    }

    const targetUser = userListResult.data.users.find((candidate) => candidate.email?.toLowerCase() === email) ?? null;
    if (targetUser && !isGlobalAdmin) {
      const { data: targetGlobalRole } = await admin.from("user_roles").select("role").eq("user_id", targetUser.id).eq("role", "admin").maybeSingle();
      if (targetGlobalRole) {
        return json({ error: "Tenant admins cannot manage Global Admin accounts." }, 403);
      }
    }

    // Send reset email via Supabase Auth
    const { error: resetError } = await admin.auth.resetPasswordForEmail(email, { redirectTo });
    if (resetError) {
      return json({ error: resetError.message }, 400);
    }

    return json({ email, message: "Passwort-Reset wurde per E-Mail gesendet." }, 200);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unknown reset error" }, 500);
  }
});
