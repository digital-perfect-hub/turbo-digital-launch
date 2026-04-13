const DEFAULT_PUBLIC_ORIGIN = "https://digital-perfect.com";
const RAW_PUBLIC_ORIGIN = (import.meta.env.VITE_PUBLIC_SITE_URL || DEFAULT_PUBLIC_ORIGIN).trim();
const RAW_INTERNAL_RENDER_HOSTS = (import.meta.env.VITE_INTERNAL_RENDER_HOSTS || "prerender.digital-perfect.com,localhost,127.0.0.1").trim();

const normalizeOrigin = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return DEFAULT_PUBLIC_ORIGIN;

  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") return DEFAULT_PUBLIC_ORIGIN;
    return url.origin;
  } catch {
    return DEFAULT_PUBLIC_ORIGIN;
  }
};

const PUBLIC_FALLBACK_ORIGIN = normalizeOrigin(RAW_PUBLIC_ORIGIN);
const PUBLIC_FALLBACK_URL = new URL(PUBLIC_FALLBACK_ORIGIN);
const PUBLIC_FALLBACK_HOSTNAME = PUBLIC_FALLBACK_URL.hostname.toLowerCase();
const PUBLIC_FALLBACK_WWW_HOSTNAME = PUBLIC_FALLBACK_HOSTNAME.startsWith("www.")
  ? PUBLIC_FALLBACK_HOSTNAME
  : `www.${PUBLIC_FALLBACK_HOSTNAME}`;

const INTERNAL_RENDER_HOSTS = RAW_INTERNAL_RENDER_HOSTS
  .split(",")
  .map((entry) => entry.trim().toLowerCase())
  .filter(Boolean);

const toUrl = (value: string, base?: string) => {
  try {
    return new URL(value, base);
  } catch {
    return null;
  }
};

const isHttpUrl = (value: URL) => value.protocol === "http:" || value.protocol === "https:";

const matchInternalHostRule = (hostname: string, rule: string) => {
  if (!rule) return false;
  if (rule.startsWith(".")) return hostname.endsWith(rule);
  return hostname === rule;
};

export const isInternalRenderHost = (hostname?: string | null) => {
  const normalized = (hostname || "").trim().toLowerCase();
  if (!normalized) return false;
  return INTERNAL_RENDER_HOSTS.some((rule) => matchInternalHostRule(normalized, rule));
};

const extractEmbeddedTargetUrl = (value?: string | null) => {
  const raw = (value || "").trim();
  if (!raw) return null;

  const decoded = decodeURIComponent(raw);
  const match = decoded.match(/https?:\/\/.+/i);
  return match?.[0] ?? null;
};

const getHeadOriginalUrl = () => {
  if (typeof document === "undefined") return null;

  const metaContent = document
    .querySelector('meta[name="prerender-original-url"]')
    ?.getAttribute("content")
    ?.trim();

  if (metaContent) return metaContent;

  const dataAttribute = document.documentElement.dataset.prerenderOriginalUrl?.trim();
  return dataAttribute || null;
};

declare global {
  interface Window {
    __PRERENDER_ORIGINAL_URL__?: string;
  }
}

export const getPrerenderOriginalUrl = () => {
  if (typeof window === "undefined") return null;

  const runtimeValue = window.__PRERENDER_ORIGINAL_URL__?.trim();
  if (runtimeValue) return runtimeValue;

  const headValue = getHeadOriginalUrl();
  if (headValue) return headValue;

  if (isInternalRenderHost(window.location.hostname)) {
    return extractEmbeddedTargetUrl(`${window.location.pathname}${window.location.search}`);
  }

  return null;
};

const getResolvedRuntimeUrl = () => {
  if (typeof window === "undefined") return toUrl(PUBLIC_FALLBACK_ORIGIN);

  const originalUrl = getPrerenderOriginalUrl();
  if (originalUrl) {
    const original = toUrl(originalUrl);
    if (original && isHttpUrl(original) && !isInternalRenderHost(original.hostname)) {
      return original;
    }
  }

  const current = toUrl(window.location.href);
  if (current && isHttpUrl(current) && !isInternalRenderHost(current.hostname)) {
    return current;
  }

  return toUrl(PUBLIC_FALLBACK_ORIGIN);
};

const normalizePublicUrl = (url: URL, options?: { stripSearch?: boolean }) => {
  const cloned = new URL(url.toString());
  cloned.hash = "";
  if (options?.stripSearch) cloned.search = "";
  return cloned.toString();
};

const isPrimaryDomainVariant = (hostname?: string | null) => {
  const normalized = (hostname || "").trim().toLowerCase();
  if (!normalized) return false;
  return normalized === PUBLIC_FALLBACK_HOSTNAME || normalized === PUBLIC_FALLBACK_WWW_HOSTNAME;
};

const copyRuntimePathToOrigin = (origin: string, runtimeUrl?: URL | null) => {
  const next = new URL(origin);
  if (runtimeUrl) {
    next.pathname = runtimeUrl.pathname;
    next.search = runtimeUrl.search;
  }
  return next;
};

const getPreferredPublicOrigin = (runtimeUrl?: URL | null) => {
  if (!runtimeUrl || !isHttpUrl(runtimeUrl) || isInternalRenderHost(runtimeUrl.hostname)) {
    return PUBLIC_FALLBACK_ORIGIN;
  }

  if (isPrimaryDomainVariant(runtimeUrl.hostname)) {
    return PUBLIC_FALLBACK_ORIGIN;
  }

  return runtimeUrl.origin;
};

const coercePrimaryDomainVariant = (url: URL, runtimeUrl?: URL | null) => {
  if (!isPrimaryDomainVariant(url.hostname)) return url;

  const preferredOrigin = getPreferredPublicOrigin(runtimeUrl);
  const preferred = new URL(preferredOrigin);
  const coerced = new URL(url.toString());
  coerced.protocol = preferred.protocol;
  coerced.host = preferred.host;
  return coerced;
};

export const getPublicOrigin = () => getPreferredPublicOrigin(getResolvedRuntimeUrl());

export const buildAbsolutePublicUrl = (pathOrUrl?: string | null, options?: { stripSearch?: boolean }) => {
  const candidate = (pathOrUrl || "").trim();
  const runtimeUrl = getResolvedRuntimeUrl();
  const baseOrigin = getPreferredPublicOrigin(runtimeUrl);

  if (!candidate) {
    const baseUrl = copyRuntimePathToOrigin(baseOrigin, runtimeUrl);
    return normalizePublicUrl(baseUrl, options);
  }

  const absolute = toUrl(candidate, baseOrigin);
  if (!absolute || !isHttpUrl(absolute) || isInternalRenderHost(absolute.hostname)) {
    const fallback = toUrl(candidate.startsWith("/") ? candidate : `/${candidate}`, baseOrigin) || new URL(baseOrigin);
    return normalizePublicUrl(fallback, options);
  }

  return normalizePublicUrl(coercePrimaryDomainVariant(absolute, runtimeUrl), options);
};

export const resolveCanonicalUrl = (canonical?: string | null) => buildAbsolutePublicUrl(canonical || undefined, { stripSearch: true });
