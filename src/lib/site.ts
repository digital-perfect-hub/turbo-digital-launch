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

// Die eigenen Adressen von Digital-Perfect. Hier ist die Standard-Site bekannt, bevor die Datenbank geantwortet hat: Design und
// Einstellungen werden sofort mit abgerufen statt erst nach der Auflösung der Adresse. Die Auflösung läuft trotzdem und gilt.
const HOME_HOSTNAMES = new Set(["digital-perfect.com", "preview.digital-perfect.com", "localhost", "127.0.0.1"]);
export const isHomeHostname = (value?: string | null) => HOME_HOSTNAMES.has(normalizeHostname(value));

// Die Seiten der eigenen Site, deren Inhalt im Code steht (Premium-Startseite und ihre Unterseiten, siehe pages.ts und
// PremiumOrDynamicPage). Sie dürfen schon aufgebaut werden, während Design und Einstellungen noch geladen werden. Fehlt hier
// eine Adresse, wartet sie nur wie bisher.
const HOME_FAST_PATHS = new Set(["/", "/creator-studio", "/leistungen", "/webdesign", "/technische-seo", "/ki-sichtbarkeit", "/projekte", "/kontakt"]);
export const isHomeFastPath = (pathname: string, search = "") => HOME_FAST_PATHS.has(pathname.replace(/[/]+$/, "") || "/") && !/[?&]design=classic(?:&|$)/.test(search);

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
