const BOT_USER_AGENT_PATTERN = /(googlebot|adsbot-google|google-inspectiontool|googleother|google-extended|bingbot|bingpreview|slurp|duckduckbot|baiduspider|yandexbot|semrushbot|ahrefsbot|mj12bot|petalbot|sogou|facebookexternalhit|twitterbot|linkedinbot|embedly|quora link preview|pinterestbot|rogerbot|applebot|discordbot|slackbot|telegrambot|whatsapp|ia_archiver)/i;
const ASSET_EXTENSION_PATTERN = /\.(?:js|mjs|css|map|png|jpe?g|gif|svg|webp|ico|woff2?|ttf|eot|otf|xml|txt|pdf|zip|rar|7z|mp4|webm|mp3|wav)$/i;
const CACHE_TTL_SECONDS = 60 * 60 * 24 * 7;
const DEFAULT_SITEMAP_CACHE_TTL_SECONDS = 60 * 15;
const PRIMARY_HOST = "digital-perfect.com";
const WWW_HOST = `www.${PRIMARY_HOST}`;

const LEGACY_REDIRECTS = new Map([
  ["/pages/webagentur-linz", "/webagentur-linz"],
  ["/pages/webdesign-graz-dein-webdesigner-aus-linz", "/webdesign-graz-dein-webdesigner-aus-linz"],
  ["/pages/webagentur-wien-webdesign-wien", "/webagentur-wien-webdesign-wien"],
  ["/products/google-bewertungsstander-nfc-qr-code", "/produkt/google-bewertungsstander-nfc-qr-code"],
  ["/pages/webagentur-linz-ads", "/webagentur-linz"],
  ["/pages/webdesign-salzburg-seo-webagentur-aus-linz", "/webagentur-linz"],
  ["/pages/webdesign-munchen-deine-webagentur-aus-linz", "/webagentur-linz"],
  ["/pages/webdesign-innsbruck-deine-webagentur-aus-linz", "/webagentur-linz"],
]);

const buildCanonicalRedirectUrl = (requestUrl) => {
  const host = requestUrl.host;
  const pathname = requestUrl.pathname;
  let needsRedirect = false;

  const redirectUrl = new URL(requestUrl.toString());

  if (host === WWW_HOST) {
    redirectUrl.host = PRIMARY_HOST;
    needsRedirect = true;
  }

  if (LEGACY_REDIRECTS.has(pathname)) {
    redirectUrl.pathname = LEGACY_REDIRECTS.get(pathname);
    needsRedirect = true;
  }

  return needsRedirect ? redirectUrl : null;
};

const shouldBypassRouting = (request, env) => {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const isSitemapIndex = pathname.startsWith("/sitemaps/");

  if (isSitemapIndex) {
    return false;
  }

  if (pathname.includes("/api/") || pathname.includes("/supa/")) {
    return true;
  }

  if (ASSET_EXTENSION_PATTERN.test(pathname)) {
    return true;
  }

  return false;
};

const isSitemapRequest = (request) => {
  const url = new URL(request.url);
  const pathname = url.pathname;
  return pathname === "/sitemap.xml" || pathname.startsWith("/sitemaps/");
};

const getEnv = (env, key, fallback = "") => {
  return (env && typeof env === "object" && env[key]) || fallback;
};

const handleSitemapRequest = async (request, env) => {
  const functionUrl = getEnv(env, "SITEMAP_FUNCTION_URL");
  const secret = getEnv(env, "SITEMAP_SHARED_SECRET");

  if (!functionUrl || !secret) {
    return new Response("Sitemap configuration missing", { status: 500 });
  }

  const requestUrl = new URL(request.url);
  const targetUrl = new URL(functionUrl);
  targetUrl.search = requestUrl.search;

  try {
    const sitemapResponse = await fetch(targetUrl.toString(), {
      method: request.method,
      headers: {
        "x-sitemap-secret": secret,
        "x-sitemap-host": requestUrl.host,
        "x-sitemap-path": requestUrl.pathname,
        "accept": request.headers.get("accept") || "application/xml",
      },
    });

    const response = new Response(sitemapResponse.body, sitemapResponse);
    
    if (sitemapResponse.ok) {
      response.headers.set("Content-Type", "application/xml; charset=utf-8");
      response.headers.set("X-Robots-Tag", "noindex");
    }

    return response;
  } catch (error) {
    return new Response("Failed to generate sitemap", { status: 500 });
  }
};

const shouldPrerender = (request) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return false;
  }
  const userAgent = request.headers.get("user-agent") || "";
  return BOT_USER_AGENT_PATTERN.test(userAgent);
};

const buildCacheKey = (request) => {
  const url = new URL(request.url);
  url.searchParams.delete("fbclid");
  url.searchParams.delete("gclid");
  url.searchParams.delete("utm_source");
  url.searchParams.delete("utm_medium");
  url.searchParams.delete("utm_campaign");
  url.searchParams.delete("utm_term");
  url.searchParams.delete("utm_content");
  return new Request(url.toString(), request);
};

const cloneHtmlResponse = async (response) => {
  const cloned = new Response(response.body, response);
  cloned.headers.set("Cache-Control", `public, max-age=${CACHE_TTL_SECONDS}`);
  cloned.headers.set("Content-Type", "text/html; charset=utf-8");
  return cloned;
};

const withSitemapCachingHeaders = (response, ttlSeconds) => {
  const cloned = new Response(response.body, response);
  if (response.ok) {
    cloned.headers.set("Cache-Control", `public, s-maxage=${ttlSeconds}, stale-while-revalidate=60`);
  } else {
    cloned.headers.set("Cache-Control", "no-store");
  }
  return cloned;
};

const fetchPrerenderedResponse = async (request, env) => {
  const serviceUrl = getEnv(env, "PRERENDER_SERVICE_URL", "https://prerender.digital-perfect.com");
  const secret = getEnv(env, "PRERENDER_SECRET_TOKEN");

  const requestUrl = new URL(request.url);
  const prerenderUrl = new URL(serviceUrl);
  prerenderUrl.pathname = "/render";
  prerenderUrl.searchParams.set("url", requestUrl.toString());

  const headers = new Headers({
    "x-forwarded-for": request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || "",
    "x-original-url": requestUrl.toString(),
    "x-forwarded-host": requestUrl.host,
    "x-forwarded-proto": requestUrl.protocol.replace(":", ""),
    "user-agent": request.headers.get("user-agent") || "",
    "accept-language": request.headers.get("accept-language") || "en-US,en;q=0.9",
    "x-prerender-token": secret,
  });

  return fetch(prerenderUrl.toString(), {
    method: request.method,
    headers,
    redirect: "follow",
  });
};

export default {
  async fetch(request, env) {
    // 1. SITEMAP ZUERST ABFANGEN
    if (isSitemapRequest(request)) {
      return handleSitemapRequest(request, env);
    }

    // 2. NORMALE DATEIEN (wie .xml, .css, .js) DURCHWINKEN
    if (shouldBypassRouting(request, env)) {
      return fetch(request);
    }

    const requestUrl = new URL(request.url);
    const redirectUrl = buildCanonicalRedirectUrl(requestUrl);
    if (redirectUrl) {
      return Response.redirect(redirectUrl.toString(), 301);
    }

    if (!shouldPrerender(request)) {
      return fetch(request);
    }

    const cache = caches.default;
    const cacheKey = buildCacheKey(request);
    const cachedResponse = await cache.match(cacheKey);

    if (cachedResponse) {
      const hit = new Response(cachedResponse.body, cachedResponse);
      hit.headers.set("X-Prerender-Cache", "HIT");
      return hit;
    }

    const prerenderResponse = await fetchPrerenderedResponse(request, env);
    if (!prerenderResponse.ok) {
      return prerenderResponse;
    }

    const htmlResponse = await cloneHtmlResponse(prerenderResponse);
    await cache.put(cacheKey, htmlResponse.clone());

    return htmlResponse;
  },
};