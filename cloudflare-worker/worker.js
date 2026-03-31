const BOT_USER_AGENT_PATTERN = /(googlebot|adsbot-google|google-inspectiontool|googleother|google-extended|bingbot|bingpreview|slurp|duckduckbot|baiduspider|yandexbot|semrushbot|ahrefsbot|mj12bot|petalbot|sogou|facebookexternalhit|twitterbot|linkedinbot|embedly|quora link preview|pinterestbot|rogerbot|applebot|discordbot|slackbot|telegrambot|whatsapp|ia_archiver)/i;
const ASSET_EXTENSION_PATTERN = /\.(?:js|mjs|css|map|png|jpe?g|gif|svg|webp|ico|woff2?|ttf|eot|otf|xml|txt|pdf|zip|rar|7z|mp4|webm|mp3|wav)$/i;
const CACHE_TTL_SECONDS = 60 * 60 * 24 * 7;

const normalizeSecret = (value) => (value || "").trim();

const getEnv = (env, key, fallback = "") => {
  const value = env?.[key];
  return typeof value === "string" ? value.trim() : fallback;
};

const shouldBypassRouting = (request, env) => {
  const bypassHeader = request.headers.get("x-prerender-bypass");
  const token = request.headers.get("x-prerender-token");
  const secret = normalizeSecret(getEnv(env, "PRERENDER_SECRET_TOKEN"));

  if (!bypassHeader) return false;
  if (!secret) return bypassHeader === "1";
  return bypassHeader === "1" && token === secret;
};

const isHtmlNavigation = (request) => {
  const accept = request.headers.get("accept") || "";
  return accept.includes("text/html");
};

const isBotRequest = (request) => {
  const userAgent = request.headers.get("user-agent") || "";
  return BOT_USER_AGENT_PATTERN.test(userAgent);
};

const shouldPrerender = (request) => {
  if (request.method !== "GET" && request.method !== "HEAD") return false;
  if (!isHtmlNavigation(request)) return false;

  const url = new URL(request.url);
  if (url.pathname.startsWith("/admin") || url.pathname.startsWith("/api") || url.pathname.startsWith("/auth")) return false;
  if (ASSET_EXTENSION_PATTERN.test(url.pathname)) return false;
  if (url.searchParams.has("cf_prerender_bypass")) return false;

  return isBotRequest(request);
};

const buildCacheKey = (request) => {
  const requestUrl = new URL(request.url);
  const cacheUrl = new URL(requestUrl.toString());
  cacheUrl.hash = "";
  cacheUrl.searchParams.delete("cf_prerender_bypass");
  cacheUrl.searchParams.set("__cf_prerender", "1");
  return new Request(cacheUrl.toString(), { method: "GET" });
};

const buildPrerenderUrl = (requestUrl, env) => {
  const base = getEnv(env, "PRERENDER_SERVICE_URL", "https://prerender.digital-perfect.com").replace(/\/$/, "");
  const prerenderUrl = new URL(`${base}/render`);
  prerenderUrl.searchParams.set("url", requestUrl.toString());
  return prerenderUrl;
};

const cloneHtmlResponse = async (response) => {
  const body = await response.text();
  return new Response(body, response);
};

const withCachingHeaders = (response) => {
  const cloned = new Response(response.body, response);
  cloned.headers.set("Cache-Control", `public, max-age=0, s-maxage=${CACHE_TTL_SECONDS}, stale-while-revalidate=86400`);
  cloned.headers.set("X-Prerender-Cache", "MISS");
  return cloned;
};

const fetchPrerenderedResponse = async (request, env) => {
  const requestUrl = new URL(request.url);
  const prerenderUrl = buildPrerenderUrl(requestUrl, env);
  const secret = normalizeSecret(getEnv(env, "PRERENDER_SECRET_TOKEN"));

  const headers = new Headers({
    "x-prerender-original-url": requestUrl.toString(),
    "x-forwarded-host": requestUrl.host,
    "x-forwarded-proto": requestUrl.protocol.replace(":", ""),
    "user-agent": request.headers.get("user-agent") || "", 
    "accept-language": request.headers.get("accept-language") || "en-US,en;q=0.9",
  });

  if (secret) {
    headers.set("x-prerender-token", secret);
  }

  return fetch(prerenderUrl.toString(), {
    method: request.method,
    headers,
    redirect: "follow",
  });
};

export default {
  async fetch(request, env) {
    if (shouldBypassRouting(request, env)) {
      return fetch(request);
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
    const cacheableResponse = withCachingHeaders(htmlResponse);

    await cache.put(cacheKey, cacheableResponse.clone());

    return cacheableResponse;
  },
};
