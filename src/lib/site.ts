export const DEFAULT_SITE_ID = "00000000-0000-0000-0000-000000000001";
export const DEFAULT_SITE_SLUG = "default";
export const ADMIN_SITE_STORAGE_KEY = "dp.admin.siteId";

export type SiteRole = "owner" | "admin" | "editor" | "viewer";

export type SiteRecord = {
  id: string;
  name: string;
  slug: string;
  primary_domain: string | null;
  is_default: boolean | null;
  is_active: boolean | null;
  logo_path?: string | null;
  user_role?: SiteRole | null;
};

export const normalizeHostname = (value?: string | null) => {
  const hostname = (value || "").trim().toLowerCase();
  if (!hostname) return "localhost";
  return hostname.replace(/^www\./, "").split(":")[0] || "localhost";
};

export const getBrowserHostname = () => {
  if (typeof window === "undefined") return "localhost";
  return normalizeHostname(window.location.hostname);
};

export const getStoredAdminSiteId = () => {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(ADMIN_SITE_STORAGE_KEY);
  } catch {
    return null;
  }
};

export const setStoredAdminSiteId = (siteId: string | null) => {
  if (typeof window === "undefined") return;
  try {
    if (siteId) {
      window.localStorage.setItem(ADMIN_SITE_STORAGE_KEY, siteId);
    } else {
      window.localStorage.removeItem(ADMIN_SITE_STORAGE_KEY);
    }
  } catch {
    // noop
  }
};
