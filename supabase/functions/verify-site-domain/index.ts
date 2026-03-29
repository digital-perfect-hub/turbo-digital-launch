import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Payload = {
  site_id?: unknown;
  domain_id?: unknown;
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const getBearerToken = (request: Request) => request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "")?.trim() ?? "";

const normalizeHostname = (value: string) =>
  value.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "").replace(/:+\d+$/, "");

const fetchDnsAnswers = async (hostname: string, type: "A" | "CNAME") => {
  const url = `https://dns.google/resolve?name=${encodeURIComponent(hostname)}&type=${type}`;
  const response = await fetch(url, { headers: { accept: "application/dns-json" } });
  if (!response.ok) return [] as string[];
  const data = await response.json() as { Answer?: Array<{ data?: string }> };
  return (data.Answer ?? []).map((entry) => String(entry.data || "").replace(/\.$/, "").toLowerCase()).filter(Boolean);
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

    const body = (await request.json()) as Payload;
    const siteId = typeof body.site_id === "string" ? body.site_id.trim() : "";
    const domainId = typeof body.domain_id === "string" ? body.domain_id.trim() : "";

    if (!siteId || !domainId) return json({ error: "site_id and domain_id are required." }, 400);

    const [{ data: globalRole }, { data: siteRoles }, { data: domain, error: domainError }] = await Promise.all([
      admin.from("user_roles").select("role").eq("user_id", caller.id).eq("role", "admin").maybeSingle(),
      admin.from("user_site_roles" as never).select("role").eq("user_id", caller.id).eq("site_id", siteId).in("role", ["owner", "admin"]),
      admin
        .from("site_domains" as never)
        .select("id, hostname, is_primary")
        .eq("id", domainId)
        .eq("site_id", siteId)
        .maybeSingle(),
    ]);

    const isGlobalAdmin = Boolean(globalRole);
    const callerCanManageSite = isGlobalAdmin || (Array.isArray(siteRoles) && siteRoles.length > 0);
    if (!callerCanManageSite) return json({ error: "You are not allowed to verify domains for this site." }, 403);
    if (domainError || !domain) return json({ error: domainError?.message || "Domain not found." }, 404);

    const hostname = normalizeHostname((domain as any).hostname || "");
    const expectedCname = normalizeHostname(Deno.env.get("PLATFORM_CNAME_TARGET") || Deno.env.get("PLATFORM_PUBLIC_HOST") || "");
    const expectedA = (Deno.env.get("PLATFORM_A_RECORD_TARGET") || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    const [cnameAnswers, aAnswers] = await Promise.all([
      fetchDnsAnswers(hostname, "CNAME"),
      fetchDnsAnswers(hostname, "A"),
    ]);

    const cnameMatch = expectedCname ? cnameAnswers.includes(expectedCname) : false;
    const aMatch = expectedA.length ? aAnswers.some((value) => expectedA.includes(value)) : false;
    const verified = cnameMatch || aMatch;

    const verificationMessage = verified
      ? cnameMatch
        ? `DNS ok: CNAME zeigt auf ${expectedCname}. SSL wird als Nächstes aktiv.`
        : `DNS ok: A-Record zeigt auf ${aAnswers.join(", ")}. SSL wird als Nächstes aktiv.`
      : `Noch kein gültiger DNS-Treffer gefunden. Erwartet wird ${expectedCname ? `CNAME -> ${expectedCname}` : "ein passender CNAME"}${expectedA.length ? ` oder A -> ${expectedA.join(", ")}` : ""}. Aktuell gefunden: CNAME ${cnameAnswers.join(", ") || "—"} / A ${aAnswers.join(", ") || "—"}.`;

    const { error: updateError } = await admin
      .from("site_domains" as never)
      .update({
        verification_status: verified ? "verified" : "failed",
        verification_message: verificationMessage,
        ssl_status: verified ? "pending" : "failed",
        last_checked_at: new Date().toISOString(),
      })
      .eq("id", domainId)
      .eq("site_id", siteId);

    if (updateError) return json({ error: updateError.message }, 400);

    return json({
      hostname,
      verified,
      cnameAnswers,
      aAnswers,
      message: verificationMessage,
    }, 200);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unknown verification error" }, 500);
  }
});
