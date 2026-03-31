import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type InviteTenantUserRequest = {
  email?: unknown;
  role?: unknown;
  site_id?: unknown;
  redirectTo?: unknown;
};

type TenantRole = "owner" | "admin" | "editor" | "viewer";

type Entitlements = {
  maxTeamMembers: number;
};

const PLAN_ENTITLEMENTS: Record<string, Entitlements> = {
  starter: { maxTeamMembers: 3 },
  pro: { maxTeamMembers: 8 },
  agency: { maxTeamMembers: 25 },
};

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

const normalizeTenantRole = (value: unknown): TenantRole | null => {
  if (value === "owner" || value === "admin" || value === "editor" || value === "viewer") return value;
  return null;
};

const buildSetPasswordRedirect = (appBaseUrl: string | undefined) => {
  const fallbackBase = normalizeBaseUrl(appBaseUrl) ?? "https://digital-perfect.com";
  return `${fallbackBase}/set-password`;
};

const normalizeBaseUrl = (value: string | undefined) => {
  if (!value) return undefined;
  const trimmed = value.trim().replace(/\/$/, "");
  return trimmed.startsWith("http://") || trimmed.startsWith("https://") ? trimmed : undefined;
};

const getBearerToken = (request: Request) => request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "")?.trim() ?? "";
const getEntitlements = (planKey: string | null | undefined): Entitlements => PLAN_ENTITLEMENTS[planKey || ""] ?? PLAN_ENTITLEMENTS.starter;

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
    const appBaseUrl = normalizeBaseUrl(Deno.env.get("APP_BASE_URL")) ?? undefined;

    if (!supabaseUrl || !serviceRoleKey) {
      return json({ error: "Missing function secrets." }, 500);
    }

    if (!token) {
      return json({ error: "Missing bearer token." }, 401);
    }

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

    const body = (await request.json()) as InviteTenantUserRequest;
    const email = normalizeEmail(body.email);
    const role = normalizeTenantRole(body.role);
    const siteId = typeof body.site_id === "string" ? body.site_id.trim() : "";
    const redirectTo = buildSetPasswordRedirect(appBaseUrl);

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return json({ error: "A valid email is required." }, 400);
    }

    if (!role) {
      return json({ error: "A valid tenant role is required." }, 400);
    }

    if (!siteId) {
      return json({ error: "site_id is required." }, 400);
    }

    const [{ data: globalRole }, { data: siteRoleRows }, { data: siteRecord, error: siteError }, { data: billingProfile }] = await Promise.all([
      admin.from("user_roles").select("role").eq("user_id", caller.id).eq("role", "admin").maybeSingle(),
      admin.from("user_site_roles" as never).select("role").eq("user_id", caller.id).eq("site_id", siteId).in("role", ["owner", "admin"]),
      admin.from("sites" as never).select("id, name").eq("id", siteId).maybeSingle(),
      admin.from("site_billing_profiles" as never).select("plan_key").eq("site_id", siteId).maybeSingle(),
    ]);

    if (siteError || !siteRecord) {
      return json({ error: siteError?.message || "Target site not found." }, 404);
    }

    const isGlobalAdmin = Boolean(globalRole);
    const callerRole = Array.isArray(siteRoleRows) && siteRoleRows[0] ? (siteRoleRows[0] as { role: TenantRole }).role : null;
    const callerCanManageSite = isGlobalAdmin || (Array.isArray(siteRoleRows) && siteRoleRows.length > 0);

    if (!callerCanManageSite) {
      return json({ error: "You are not allowed to invite users for this site." }, 403);
    }

    if (!isGlobalAdmin && role === "owner") {
      return json({ error: "Tenant admins cannot invite an Owner role." }, 403);
    }

    const userListResult = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (userListResult.error) {
      return json({ error: userListResult.error.message }, 500);
    }

    const existingUser = userListResult.data.users.find((candidate) => candidate.email?.toLowerCase() === email) ?? null;

    if (existingUser && !isGlobalAdmin) {
      const { data: targetGlobalRole } = await admin.from("user_roles").select("role").eq("user_id", existingUser.id).eq("role", "admin").maybeSingle();
      if (targetGlobalRole) {
        return json({ error: "Tenant admins cannot manage or reassign a Global Admin." }, 403);
      }
    }

    const targetUserId = existingUser?.id ?? null;
    const { data: existingAssignment } = targetUserId
      ? await admin.from("user_site_roles" as never).select("id, role").eq("site_id", siteId).eq("user_id", targetUserId).maybeSingle()
      : { data: null };

    const { count: assignmentCount, error: countError } = await admin
      .from("user_site_roles" as never)
      .select("id", { count: "exact", head: true })
      .eq("site_id", siteId);

    if (countError) {
      return json({ error: countError.message }, 500);
    }

    const entitlements = getEntitlements(((billingProfile as { plan_key?: string | null } | null)?.plan_key ?? null) as string | null);
    const wouldIncreaseSeatCount = !existingAssignment;
    if (wouldIncreaseSeatCount && (assignmentCount ?? 0) >= entitlements.maxTeamMembers) {
      return json({ error: `Seat-Limit erreicht. Dein aktueller Plan erlaubt ${entitlements.maxTeamMembers} Team-Mitglieder.` }, 403);
    }

    if (!isGlobalAdmin && callerRole === "admin" && existingAssignment && (existingAssignment as { role?: TenantRole }).role === "owner") {
      return json({ error: "Tenant-Admins dürfen keine Owner verwalten." }, 403);
    }

    let createdUserId = targetUserId;
    let message = "Einladung erfolgreich verschickt.";

    if (!createdUserId) {
      const { data: inviteData, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
        redirectTo,
        data: {
          site_id: siteId,
          site_name: (siteRecord as { name?: string } | null)?.name ?? null,
          invited_role: role,
          invited_by: caller.id,
        },
      });

      if (inviteError) {
        return json({ error: inviteError.message }, 400);
      }

      createdUserId = inviteData.user?.id ?? null;
      if (!createdUserId) {
        return json({ error: "Supabase invite did not return a user id." }, 500);
      }
    } else {
      const { error: resetError } = await admin.auth.resetPasswordForEmail(email, redirectTo ? { redirectTo } : undefined);
      if (resetError) {
        message = "Benutzer existiert bereits und wurde dem Tenant zugeordnet. Für eine neue E-Mail bitte den Passwort-Reset oder den Hard-Delete-Testflow nutzen.";
      } else {
        message = "Benutzer existiert bereits, wurde dem Tenant erneut zugeordnet und hat zusätzlich eine neue Passwort-/Zugangs-Mail erhalten.";
      }
    }

    await admin.from("user_site_roles" as never).delete().eq("user_id", createdUserId).eq("site_id", siteId);

    const { error: insertError } = await admin.from("user_site_roles" as never).insert({
      user_id: createdUserId,
      site_id: siteId,
      role,
    });

    if (insertError) {
      return json({ error: insertError.message }, 400);
    }

    return json(
      {
        email,
        role,
        site_id: siteId,
        user_id: createdUserId,
        invitedExistingUser: Boolean(existingUser),
        site_name: (siteRecord as { name?: string } | null)?.name ?? null,
        login_url: redirectTo ?? null,
        seat_limit: entitlements.maxTeamMembers,
        seats_used: (assignmentCount ?? 0) + (wouldIncreaseSeatCount ? 1 : 0),
        message,
      },
      200,
    );
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unknown invite error" }, 500);
  }
});
