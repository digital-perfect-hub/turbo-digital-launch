import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type TrackViewRequest = {
  siteId?: unknown;
  path?: unknown;
  pageType?: unknown;
  pageSlug?: unknown;
  sessionId?: unknown;
  referrerHost?: unknown;
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

const sha256 = async (value: string) => {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

const getClientIp = (request: Request) => {
  const cfIp = request.headers.get("cf-connecting-ip")?.trim();
  if (cfIp) return cfIp;

  const forwardedFor = request.headers.get("x-forwarded-for");
  if (!forwardedFor) return null;

  const firstIp = forwardedFor.split(",")[0]?.trim();
  return firstIp || null;
};

const getCountry = (request: Request) => {
  const country = request.headers.get("cf-ipcountry")?.trim().toUpperCase();
  if (!country || !/^[A-Z]{2}$/.test(country) || country === "XX") return null;
  return country;
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
    const hashSalt = Deno.env.get("TRACKING_HASH_SALT");

    if (!supabaseUrl || !serviceRoleKey || !hashSalt) {
      return json({ error: "Missing tracking function secrets." }, 500);
    }

    const body = (await request.json()) as TrackViewRequest;
    const siteId = normalizeText(body.siteId, 64);
    const path = normalizeText(body.path, 512, "/") || "/";
    const pageType = normalizeText(body.pageType, 64, "page") || "page";
    const pageSlug = normalizeNullableText(body.pageSlug, 255);
    const sessionId = normalizeText(body.sessionId, 128);
    const referrerHost = normalizeNullableText(body.referrerHost, 255);

    if (!siteId || !sessionId) {
      return json({ error: "siteId and sessionId are required." }, 400);
    }

    const serviceSupabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: site, error: siteError } = await serviceSupabase
      .from("sites")
      .select("id")
      .eq("id", siteId)
      .eq("is_active", true)
      .maybeSingle();

    if (siteError) {
      return json({ error: siteError.message }, 500);
    }

    if (!site) {
      return json({ tracked: false, reason: "inactive_site" }, 200);
    }

    const clientIp = getClientIp(request);
    const visitorSource = clientIp ? `ip:${clientIp}` : `session:${sessionId}`;
    const visitorHash = await sha256(`${hashSalt}:${visitorSource}`);
    const country = getCountry(request);
    const trackedOn = new Date().toISOString().slice(0, 10);

    const { error: upsertError } = await serviceSupabase
      .from("page_views")
      .upsert(
        {
          site_id: siteId,
          path,
          page_type: pageType,
          page_slug: pageSlug,
          session_id: sessionId,
          referrer_host: referrerHost,
          visitor_hash: visitorHash,
          country,
          tracked_on: trackedOn,
        },
        {
          onConflict: "site_id,path,tracked_on,visitor_hash,session_id",
          ignoreDuplicates: true,
        },
      );

    if (upsertError) {
      return json({ error: upsertError.message }, 500);
    }

    return json({ tracked: true }, 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown tracking error";
    return json({ error: message }, 500);
  }
});
