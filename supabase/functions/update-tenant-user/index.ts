import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type TenantRole = "owner" | "admin" | "editor" | "viewer";
type UpdateTenantUserRequest = {
  target_user_id?: unknown;
  site_id?: unknown;
  action?: unknown;
  new_role?: unknown;
};

type ActionType = "update_role" | "remove";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });

const getBearerToken = (request: Request) => request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "")?.trim() ?? "";

const normalizeRole = (value: unknown): TenantRole | null => {
  if (value === "owner" || value === "admin" || value === "editor" || value === "viewer") return value;
  return null;
};

const normalizeAction = (value: unknown): ActionType | null => {
  if (value === "update_role" || value === "remove") return value;
  return null;
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const token = getBearerToken(request);

    if (!supabaseUrl || !serviceRoleKey) return json({ error: "Missing function secrets." }, 500);
    if (!token) return json({ error: "Missing bearer token." }, 401);

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const {
      data: { user: caller },
      error: callerError,
    } = await admin.auth.getUser(token);

    if (callerError || !caller) return json({ error: callerError?.message || "Unauthorized" }, 401);

    const body = (await request.json()) as UpdateTenantUserRequest;
    const siteId = typeof body.site_id === "string" ? body.site_id.trim() : "";
    const targetUserId = typeof body.target_user_id === "string" ? body.target_user_id.trim() : "";
    const action = normalizeAction(body.action);
    const newRole = normalizeRole(body.new_role);

    if (!siteId || !targetUserId || !action) return json({ error: "site_id, target_user_id und action sind erforderlich." }, 400);
    if (action === "update_role" && !newRole) return json({ error: "new_role ist für update_role erforderlich." }, 400);

    const [{ data: globalRole }, { data: callerAssignment }, { data: targetAssignments }, { data: siteRecord, error: siteError }] = await Promise.all([
      admin.from("user_roles").select("role").eq("user_id", caller.id).eq("role", "admin").maybeSingle(),
      admin.from("user_site_roles" as never).select("role").eq("user_id", caller.id).eq("site_id", siteId).maybeSingle(),
      admin.from("user_site_roles" as never).select("id, role").eq("user_id", targetUserId).eq("site_id", siteId),
      admin.from("sites" as never).select("id, name").eq("id", siteId).maybeSingle(),
    ]);

    if (siteError || !siteRecord) return json({ error: siteError?.message || "Target site not found." }, 404);

    const isGlobalAdmin = Boolean(globalRole);
    const callerRole = ((callerAssignment as { role?: TenantRole } | null)?.role ?? null) as TenantRole | null;

    if (!isGlobalAdmin && callerRole !== "owner" && callerRole !== "admin") {
      return json({ error: "Du darfst keine Benutzer für diese Site verwalten." }, 403);
    }

    const targetAssignment = Array.isArray(targetAssignments) ? targetAssignments[0] as { id: string; role: TenantRole } | undefined : undefined;
    if (!targetAssignment) return json({ error: "Der Zielbenutzer hat auf dieser Site keine Rolle." }, 404);

    const targetRole = targetAssignment.role;

    if (!isGlobalAdmin && callerRole === "admin" && (targetRole === "owner" || newRole === "owner")) {
      return json({ error: "Tenant-Admins dürfen keine Owner entfernen, degradieren oder ernennen." }, 403);
    }

    const { count: ownerCount, error: ownerCountError } = await admin
      .from("user_site_roles" as never)
      .select("id", { count: "exact", head: true })
      .eq("site_id", siteId)
      .eq("role", "owner");

    if (ownerCountError) return json({ error: ownerCountError.message }, 500);
    const owners = ownerCount ?? 0;
    const ownerMutation = targetRole === "owner" && (action === "remove" || (action === "update_role" && newRole !== "owner"));

    if (ownerMutation && owners <= 1) {
      return json({ error: "Mindestens ein Owner muss auf dem Tenant verbleiben." }, 403);
    }

    const selfMutation = caller.id === targetUserId;
    if (selfMutation && ownerMutation && owners <= 1) {
      return json({ error: "Self-Lockout blockiert: Du kannst den letzten Owner nicht selbst entfernen oder degradieren." }, 403);
    }

    if (action === "remove") {
      const { error } = await admin.from("user_site_roles" as never).delete().eq("id", targetAssignment.id);
      if (error) return json({ error: error.message }, 400);
      return json({ message: "Benutzer wurde aus dem Tenant entfernt." }, 200);
    }

    const { error: updateError } = await admin.from("user_site_roles" as never).update({ role: newRole }).eq("id", targetAssignment.id);
    if (updateError) return json({ error: updateError.message }, 400);

    return json({ message: `Rolle wurde auf ${newRole} aktualisiert.` }, 200);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unknown update error" }, 500);
  }
});
