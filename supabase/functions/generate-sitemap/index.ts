import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-sitemap-secret, x-sitemap-host",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
};

const DEFAULT_SITE_ID = "00000000-0000-0000-0000-000000000001";
const RESERVED_ROOT_SLUGS = new Set([
  "",
  "admin",
  "login",
  "set-password",
  "forum",
  "produkt",
  "impressum",
  "datenschutz",
  "agb",
  "sitemap.xml",
  "robots.txt",
]);
const SCHEDULE_PATTERN = /\[\[scheduled_at=([^\]]+)\]\]/i;

type SiteRecord = {
  id: string;
  primary_domain: string | null;
};

type TimestampedSlugRow = {
  slug: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type ForumThreadRow = TimestampedSlugRow & {
  status?: string | null;
  admin_notes?: string | null;
};

const normalizeHostname = (value?: string | null) => {
  const raw = (value || "").trim().toLowerCase();
  if (!raw) return "";

  return raw
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "")
    .replace(/:+\d+$/, "")
    .trim();
};

const normalizeSlug = (value?: string | null) =>
  (value || "")
    .trim()
    .toLowerCase()
    .replace(/^\/+|\/+$/g, "")
    .replace(/\/+$/g, "")
    .replace(/\/+/g, "/");

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");

const xmlResponse = (xml: string, status = 200, extraHeaders?: Record<string, string>) =>
  new Response(xml, {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=900, stale-while-revalidate=86400",
      ...extraHeaders,
    },
  });

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8",
    },
  });

const toIso = (value?: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
};

const resolveLastmod = (row?: { updated_at?: string | null; created_at?: string | null } | null) =>
  toIso(row?.updated_at) || toIso(row?.created_at) || null;

const extractForumScheduledAt = (notes?: string | null) => {
  if (!notes) return null;
  const match = notes.match(SCHEDULE_PATTERN);
  const iso = match?.[1]?.trim();
  if (!iso) return null;
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
};

const isForumThreadPubliclyVisible = (status?: string | null, notes?: string | null, now = new Date()) => {
  if (status === "published") return true;
  if (status !== "scheduled") return false;

  const scheduledAt = extractForumScheduledAt(notes);
  if (!scheduledAt) return false;

  return new Date(scheduledAt).getTime() <= now.getTime();
};

const resolveSiteForHostname = async (
  admin: ReturnType<typeof createClient>,
  hostname: string,
): Promise<{ site: SiteRecord; canonicalHost: string } | null> => {
  const normalizedHost = normalizeHostname(hostname);
  if (!normalizedHost) return null;

  const { data: domainMatch, error: domainError } = await admin
    .from("site_domains" as never)
    .select("site_id, hostname, is_primary")
    .eq("hostname", normalizedHost)
    .limit(1)
    .maybeSingle();

  if (domainError) throw domainError;

  let site: SiteRecord | null = null;

  if (domainMatch && typeof (domainMatch as { site_id?: unknown }).site_id === "string") {
    const { data: siteRecord, error: siteError } = await admin
      .from("sites" as never)
      .select("id, primary_domain")
      .eq("id", (domainMatch as { site_id: string }).site_id)
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();

    if (siteError) throw siteError;
    if (siteRecord) {
      site = siteRecord as unknown as SiteRecord;
    }
  }

  if (!site) {
    const { data: primaryMatch, error: primaryError } = await admin
      .from("sites" as never)
      .select("id, primary_domain")
      .eq("primary_domain", normalizedHost)
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();

    if (primaryError) throw primaryError;
    if (primaryMatch) {
      site = primaryMatch as unknown as SiteRecord;
    }
  }

  if (!site && normalizedHost === "localhost") {
    site = { id: DEFAULT_SITE_ID, primary_domain: "localhost" };
  }

  if (!site?.id) return null;

  const { data: primaryDomainRow, error: primaryDomainError } = await admin
    .from("site_domains" as never)
    .select("hostname")
    .eq("site_id", site.id)
    .eq("is_primary", true)
    .limit(1)
    .maybeSingle();

  if (primaryDomainError) throw primaryDomainError;

  const canonicalHost =
    normalizeHostname((primaryDomainRow as { hostname?: string | null } | null)?.hostname) ||
    normalizeHostname(site.primary_domain) ||
    normalizedHost;

  return { site, canonicalHost };
};

const addUrl = (entries: Map<string, string | null>, path: string, lastmod?: string | null) => {
  const normalizedPath = path === "/" ? "/" : `/${path.replace(/^\/+/, "").replace(/\/+$/g, "")}`;
  const current = entries.get(normalizedPath) ?? null;

  if (!current || (lastmod && lastmod > current)) {
    entries.set(normalizedPath, lastmod || current || null);
  }
};

const toPublicUrl = (host: string, path: string) => {
  const safeHost = normalizeHostname(host) || "digital-perfect.com";
  const origin = safeHost === "localhost" ? `http://${safeHost}:5173` : `https://${safeHost}`;
  const url = new URL(origin);
  url.pathname = path;
  url.search = "";
  url.hash = "";
  return url.toString();
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const sharedSecret = (Deno.env.get("SITEMAP_SHARED_SECRET") || "").trim();
    const incomingSecret = (request.headers.get("x-sitemap-secret") || "").trim();
    const supabaseUrl = (Deno.env.get("SUPABASE_URL") || "").trim();
    const serviceRoleKey = (Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "").trim();

    if (!sharedSecret) return jsonResponse({ error: "Missing SITEMAP_SHARED_SECRET." }, 500);
    if (!supabaseUrl || !serviceRoleKey) return jsonResponse({ error: "Missing Supabase function secrets." }, 500);
    if (!incomingSecret || incomingSecret !== sharedSecret) return jsonResponse({ error: "Unauthorized" }, 401);

    const requestUrl = new URL(request.url);
    const requestedHost = normalizeHostname(
      request.headers.get("x-sitemap-host") || requestUrl.searchParams.get("host") || "",
    );

    if (!requestedHost) {
      return jsonResponse({ error: "Missing sitemap hostname." }, 400);
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const resolved = await resolveSiteForHostname(admin, requestedHost);
    if (!resolved) {
      return xmlResponse('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>\n', 404);
    }

    const { site, canonicalHost } = resolved;

    // --- HIER IST DER FIX ---
    // Ein robuster Fetcher, der Tabellen-Fehler abfängt, ohne die gesamte Sitemap abstürzen zu lassen
    const fetchSafe = async (query: any) => {
      try {
        const { data, error } = await query;
        if (error) {
          console.error("DB Error (Skipped):", error.message);
          return [];
        }
        return data || [];
      } catch (err) {
        console.error("Unexpected Fetch Error:", err);
        return [];
      }
    };

    const pages = await fetchSafe(admin.from("pages").select("slug, created_at, updated_at").eq("site_id", site.id).eq("is_published", true));
    const landingPages = await fetchSafe(admin.from("landing_pages").select("slug, created_at, updated_at").eq("site_id", site.id).eq("is_published", true));
    const products = await fetchSafe(admin.from("products").select("slug, created_at, updated_at").eq("site_id", site.id).eq("is_visible", true));
    const legalPages = await fetchSafe(admin.from("legal_pages").select("slug, created_at, updated_at").eq("site_id", site.id).eq("is_published", true));
    const forumCategories = await fetchSafe(admin.from("forum_categories").select("slug, created_at, updated_at").eq("site_id", site.id).eq("is_active", true));
    const forumThreads = await fetchSafe(admin.from("forum_threads").select("slug, status, admin_notes, created_at, updated_at").eq("site_id", site.id).eq("is_active", true).in("status", ["published", "scheduled"]));

    const entries = new Map<string, string | null>();
    const now = new Date();

    addUrl(entries, "/", null);

    for (const row of ((legalPages as TimestampedSlugRow[] | null) ?? [])) {
      const slug = normalizeSlug(row.slug);
      if (!slug) continue;
      addUrl(entries, slug, resolveLastmod(row));
    }

    for (const row of ((pages as TimestampedSlugRow[] | null) ?? [])) {
      const slug = normalizeSlug(row.slug);
      if (!slug || RESERVED_ROOT_SLUGS.has(slug)) continue;
      addUrl(entries, slug, resolveLastmod(row));
    }

    for (const row of ((landingPages as TimestampedSlugRow[] | null) ?? [])) {
      const slug = normalizeSlug(row.slug);
      if (!slug || RESERVED_ROOT_SLUGS.has(slug)) continue;
      addUrl(entries, slug, resolveLastmod(row));
    }

    for (const row of ((products as TimestampedSlugRow[] | null) ?? [])) {
      const slug = normalizeSlug(row.slug);
      if (!slug) continue;
      addUrl(entries, `produkt/${slug}`, resolveLastmod(row));
    }

    const visibleForumThreads = ((forumThreads as ForumThreadRow[] | null) ?? []).filter((row) =>
      isForumThreadPubliclyVisible(row.status, row.admin_notes, now),
    );

    if ((((forumCategories as TimestampedSlugRow[] | null) ?? []).length > 0) || visibleForumThreads.length > 0) {
      const forumLastmodCandidates = [
        ...(((forumCategories as TimestampedSlugRow[] | null) ?? []).map(resolveLastmod).filter(Boolean) as string[]),
        ...visibleForumThreads.map(resolveLastmod).filter(Boolean) as string[],
      ].sort();

      addUrl(entries, "/forum", forumLastmodCandidates.at(-1) ?? null);
    }

    for (const row of ((forumCategories as TimestampedSlugRow[] | null) ?? [])) {
      const slug = normalizeSlug(row.slug);
      if (!slug) continue;
      addUrl(entries, `forum/kategorie/${slug}`, resolveLastmod(row));
    }

    for (const row of visibleForumThreads) {
      const slug = normalizeSlug(row.slug);
      if (!slug) continue;
      addUrl(entries, `forum/${slug}`, resolveLastmod(row));
    }

    const xmlLines = Array.from(entries.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([path, lastmod]) => {
        const location = escapeXml(toPublicUrl(canonicalHost, path));
        const lastmodXml = lastmod ? `\n    <lastmod>${escapeXml(lastmod)}</lastmod>` : "";
        return `  <url>\n    <loc>${location}</loc>${lastmodXml}\n  </url>`;
      });

    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...xmlLines,
      '</urlset>',
      '',
    ].join("\n");

    if (request.method === "HEAD") {
      return xmlResponse("", 200, { "Content-Length": String(new TextEncoder().encode(xml).length) });
    }

    return xmlResponse(xml);
  } catch (error: any) {
    console.error("FATAL SITEMAP CRASH:", error);
    // Erweitertes Error-Logging für den Browser, falls doch noch etwas Unerwartetes passiert
    return jsonResponse({ 
      error: "System Error", 
      detail: error?.message || error 
    }, 500);
  }
});