import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Action = "add" | "set_primary" | "remove";
type Payload = {
  action?: unknown;
  site_id?: unknown;
  hostname?: unknown;
  domain_id?: unknown;
};

type TenantRole = "owner" | "admin" | "editor" | "viewer";

type Entitlements = {
  maxCustomDomains: number;
};

const PLAN_ENTITLEMENTS: Record<string, Entitlements> = {
  starter: { maxCustomDomains: 1 },
  pro: { maxCustomDomains: 3 },
  agency: { maxCustomDomains: 10 },
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const getBearerToken = (request: Request) => request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "")?.trim() ?? "";

const normalizeAction = (value: unknown): Action | null => {
  if (value === "add" || value === "set_primary" || value === "remove") return value;
  return null;
};

const normalizeHostname = (value: unknown) => {
  if (typeof value !== "string") return "";
  return value.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "").replace(/:+\d+$/, "");
};

const isValidHostname = (value: string) => /^(?=.{1,253}$)(?!-)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i.test(value);

const getEntitlements = (planKey: string | null | undefined): Entitlements => PLAN_ENTITLEMENTS[planKey || ""] ?? PLAN_ENTITLEMENTS.starter;

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

    const body = (await request.json()) as Payload;
    const action = normalizeAction(body.action);
    const siteId = typeof body.site_id === "string" ? body.site_id.trim() : "";
    const hostname = normalizeHostname(body.hostname);
    const domainId = typeof body.domain_id === "string" ? body.domain_id.trim() : "";

    if (!action) return json({ error: "A valid action is required." }, 400);
    if (!siteId) return json({ error: "site_id is required." }, 400);

    const [{ data: globalRole }, { data: siteRoles }, { data: siteRecord, error: siteError }, { data: billingProfile }] = await Promise.all([
      admin.from("user_roles").select("role").eq("user_id", caller.id).eq("role", "admin").maybeSingle(),
      admin.from("user_site_roles" as never).select("role").eq("user_id", caller.id).eq("site_id", siteId).in("role", ["owner", "admin"]),
      admin.from("sites" as never).select("id, primary_domain").eq("id", siteId).maybeSingle(),
      admin.from("site_billing_profiles" as never).select("plan_key").eq("site_id", siteId).maybeSingle(),
    ]);

    if (siteError || !siteRecord) return json({ error: siteError?.message || "Target site not found." }, 404);

    const isGlobalAdmin = Boolean(globalRole);
    const callerCanManageSite = isGlobalAdmin || (Array.isArray(siteRoles) && siteRoles.length > 0);
    if (!callerCanManageSite) return json({ error: "You are not allowed to manage domains for this site." }, 403);

    const entitlements = getEntitlements(((billingProfile as { plan_key?: string | null } | null)?.plan_key ?? null) as string | null);

    if (action === "add") {
      if (!hostname) return json({ error: "Bitte gib eine Domain ein." }, 400);
      if (/\s/.test(hostname)) return json({ error: "Domains dürfen keine Leerzeichen enthalten." }, 400);
      if (!isValidHostname(hostname)) return json({ error: "Bitte gib einen gültigen Hostnamen ein." }, 400);

      const [{ count }, { data: existingSiteDomain }] = await Promise.all([
        admin.from("site_domains" as never).select("id", { count: "exact", head: true }).eq("site_id", siteId),
        admin.from("site_domains" as never).select("id, hostname").eq("site_id", siteId).eq("hostname", hostname).maybeSingle(),
      ]);

      if (existingSiteDomain) return json({ error: "Diese Domain ist für die Site bereits gespeichert." }, 409);
      if ((count ?? 0) >= entitlements.maxCustomDomains) {
        return json({ error: `Domain-Limit erreicht. Dein aktueller Plan erlaubt ${entitlements.maxCustomDomains} Domain(s).` }, 403);
      }

      const isPrimary = (count ?? 0) === 0;
      const { data: inserted, error: insertError } = await admin
        .from("site_domains" as never)
        .insert({
          site_id: siteId,
          hostname,
          is_primary: isPrimary,
          verification_status: "pending",
          verification_message: "Domain wurde angelegt. DNS-Prüfung steht noch aus.",
          ssl_status: "pending",
        })
        .select("id, hostname, is_primary")
        .single();

      if (insertError) return json({ error: insertError.message }, 400);

      if (isPrimary) {
        const { error: siteUpdateError } = await admin.from("sites" as never).update({ primary_domain: hostname }).eq("id", siteId);
        if (siteUpdateError) return json({ error: siteUpdateError.message }, 400);
      }

      return json({ message: "Domain wurde gespeichert.", domain: inserted }, 200);
    }

    if (!domainId) return json({ error: "domain_id is required for this action." }, 400);

    const { data: targetDomain, error: targetError } = await admin
      .from("site_domains" as never)
      .select("id, site_id, hostname, is_primary")
      .eq("id", domainId)
      .eq("site_id", siteId)
      .maybeSingle();

    if (targetError || !targetDomain) return json({ error: targetError?.message || "Domain not found." }, 404);

    if (action === "set_primary") {
      const { data: domains, error: domainsError } = await admin
        .from("site_domains" as never)
        .select("id")
        .eq("site_id", siteId);
      if (domainsError) return json({ error: domainsError.message }, 400);

      for (const row of ((domains as Array<{ id: string }> | null) ?? [])) {
        const { error: rowUpdateError } = await admin
          .from("site_domains" as never)
          .update({ is_primary: row.id === domainId })
          .eq("id", row.id)
          .eq("site_id", siteId);
        if (rowUpdateError) return json({ error: rowUpdateError.message }, 400);
      }

      const { error: siteUpdateError } = await admin.from("sites" as never).update({ primary_domain: (targetDomain as any).hostname }).eq("id", siteId);
      if (siteUpdateError) return json({ error: siteUpdateError.message }, 400);

      return json({ message: "Primärdomain wurde aktualisiert." }, 200);
    }

    const { count: domainCount } = await admin.from("site_domains" as never).select("id", { count: "exact", head: true }).eq("site_id", siteId);

    if ((targetDomain as any).is_primary && (domainCount ?? 0) > 1) {
      return json({ error: "Die Primärdomain kann nicht gelöscht werden, solange weitere Domains existieren. Setze zuerst eine andere Primärdomain." }, 403);
    }

    const { error: deleteError } = await admin.from("site_domains" as never).delete().eq("id", domainId).eq("site_id", siteId);
    if (deleteError) return json({ error: deleteError.message }, 400);

    if ((domainCount ?? 0) <= 1) {
      const { error: clearPrimaryError } = await admin.from("sites" as never).update({ primary_domain: null }).eq("id", siteId);
      if (clearPrimaryError) return json({ error: clearPrimaryError.message }, 400);
    }

    return json({ message: "Domain wurde entfernt." }, 200);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unknown domain error" }, 500);
  }
});
