import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type HardDeleteRequest = {
  target_user_id?: unknown;
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });

const getBearerToken = (request: Request) => request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "")?.trim() ?? "";

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

    const body = (await request.json()) as HardDeleteRequest;
    const targetUserId = typeof body.target_user_id === "string" ? body.target_user_id.trim() : "";
    if (!targetUserId) return json({ error: "target_user_id ist erforderlich." }, 400);

    const { data: callerGlobalRole } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!callerGlobalRole) {
      return json({ error: "Nur Global Admins dürfen Auth-User vollständig löschen." }, 403);
    }

    if (caller.id === targetUserId) {
      return json({ error: "Self-Lockout blockiert: Du kannst deinen eigenen Auth-User nicht vollständig löschen." }, 403);
    }

    const { data: targetGlobalRole } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", targetUserId)
      .eq("role", "admin")
      .maybeSingle();

    if (targetGlobalRole) {
      return json({ error: "Global-Admin-Accounts dürfen über diesen Debug-Flow nicht vollständig gelöscht werden." }, 403);
    }

    const { data: authUserResult, error: authUserError } = await admin.auth.admin.getUserById(targetUserId);
    if (authUserError || !authUserResult?.user) {
      return json({ error: authUserError?.message || "Der Auth-User wurde nicht gefunden." }, 404);
    }

    const email = authUserResult.user.email ?? null;

    const { error: deleteError } = await admin.auth.admin.deleteUser(targetUserId);
    if (deleteError) {
      return json({ error: deleteError.message }, 400);
    }

    return json({
      message: email
        ? `Auth-User ${email} wurde vollständig gelöscht und kann jetzt frisch neu eingeladen werden.`
        : "Auth-User wurde vollständig gelöscht und kann jetzt frisch neu eingeladen werden.",
      user_id: targetUserId,
      email,
    });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unknown hard delete error" }, 500);
  }
});
