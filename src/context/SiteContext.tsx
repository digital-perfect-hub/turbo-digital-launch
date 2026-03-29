import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  DEFAULT_SITE_ID,
  getBrowserHostname,
  getStoredAdminSiteId,
  normalizeHostname,
  setStoredAdminSiteId,
  type SiteRecord,
} from "@/lib/site";

type SiteContextValue = {
  hostname: string;
  resolvedSite: SiteRecord | null;
  activeSiteId: string;
  activeSite: SiteRecord | null;
  availableSites: SiteRecord[];
  isLoading: boolean;
  isReady: boolean;
  canManageMultipleSites: boolean;
  setActiveSiteId: (siteId: string) => void;
  refetchSites: () => void;
};

const SiteContext = createContext<SiteContextValue | undefined>(undefined);

const mapSiteRecord = (value: any): SiteRecord => ({
  id: value.id,
  name: value.name,
  slug: value.slug,
  primary_domain: value.primary_domain ?? null,
  is_default: value.is_default ?? false,
  is_active: value.is_active ?? true,
  logo_path: value.logo_path ?? null,
  user_role: value.user_role ?? null,
});

const getBrowserPathname = () => {
  if (typeof window === "undefined") return "/";
  return window.location.pathname || "/";
};

const isAdminPath = (pathname: string) => /^\/admin(?:\/|$)/.test(pathname);

export const SiteProvider = ({ children }: { children: ReactNode }) => {
  const { user, isGlobalAdmin } = useAuth();
  const [hostname] = useState(() => getBrowserHostname());
  const [pathname, setPathname] = useState(() => getBrowserPathname());
  const [selectedSiteId, setSelectedSiteIdState] = useState<string | null>(() => getStoredAdminSiteId());

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updatePathname = () => setPathname(getBrowserPathname());
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    const dispatchLocationChange = () => {
      window.dispatchEvent(new Event("dp:locationchange"));
    };

    window.history.pushState = function (...args: Parameters<History["pushState"]>) {
      const result = originalPushState.apply(window.history, args);
      dispatchLocationChange();
      return result;
    };

    window.history.replaceState = function (...args: Parameters<History["replaceState"]>) {
      const result = originalReplaceState.apply(window.history, args);
      dispatchLocationChange();
      return result;
    };

    window.addEventListener("popstate", updatePathname);
    window.addEventListener("hashchange", updatePathname);
    window.addEventListener("dp:locationchange", updatePathname);

    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      window.removeEventListener("popstate", updatePathname);
      window.removeEventListener("hashchange", updatePathname);
      window.removeEventListener("dp:locationchange", updatePathname);
    };
  }, []);

  const resolveSiteQuery = useQuery({
    queryKey: ["site-resolve", hostname],
    queryFn: async (): Promise<SiteRecord | null> => {
      const { data, error } = await supabase.rpc("resolve_site_by_hostname", {
        p_hostname: hostname,
      });

      if (error) {
        return {
          id: DEFAULT_SITE_ID,
          name: "Default Site",
          slug: "default",
          primary_domain: hostname,
          is_default: true,
          is_active: true,
        };
      }

      const record = Array.isArray(data) ? data[0] : data;
      return record ? mapSiteRecord(record) : null;
    },
  });

  const availableSitesQuery = useQuery({
    queryKey: ["available-sites", user?.id ?? null, isGlobalAdmin],
    enabled: Boolean(user),
    queryFn: async (): Promise<SiteRecord[]> => {
      const { data, error } = await supabase.rpc("list_accessible_sites");
      if (error) throw error;
      return ((data as any[] | null) ?? []).map(mapSiteRecord);
    },
  });

  const resolvedSite = resolveSiteQuery.data ?? null;
  const availableSites = availableSitesQuery.data ?? [];
  const adminRoute = isAdminPath(pathname);

  const publicSite = useMemo(() => {
    if (resolvedSite) {
      const matchingResolved = availableSites.find((site) => site.id === resolvedSite.id);
      return matchingResolved ?? resolvedSite;
    }

    return availableSites.find((site) => site.is_default) || availableSites[0] || null;
  }, [availableSites, resolvedSite]);

  const adminSite = useMemo(() => {
    if (selectedSiteId) {
      const selected = availableSites.find((site) => site.id === selectedSiteId);
      if (selected) return selected;
    }

    if (publicSite) {
      const matchingPublic = availableSites.find((site) => site.id === publicSite.id);
      return matchingPublic ?? publicSite;
    }

    return availableSites.find((site) => site.is_default) || availableSites[0] || null;
  }, [availableSites, publicSite, selectedSiteId]);

  const activeSite = adminRoute ? adminSite : publicSite;

  useEffect(() => {
    if (!user) return;
    if (!adminRoute) return;
    if (!adminSite?.id) return;
    setStoredAdminSiteId(adminSite.id);
  }, [adminRoute, adminSite?.id, user]);

  const setActiveSiteId = useCallback((siteId: string) => {
    setSelectedSiteIdState(siteId);
    setStoredAdminSiteId(siteId);
  }, []);

  const isLoading = resolveSiteQuery.isLoading || (Boolean(user) && availableSitesQuery.isLoading);
  const activeSiteId = activeSite?.id || publicSite?.id || DEFAULT_SITE_ID;

  const value = useMemo<SiteContextValue>(
    () => ({
      hostname: normalizeHostname(hostname),
      resolvedSite,
      activeSiteId,
      activeSite,
      availableSites,
      isLoading,
      isReady: Boolean(activeSiteId),
      canManageMultipleSites: isGlobalAdmin || availableSites.length > 1,
      setActiveSiteId,
      refetchSites: () => {
        void resolveSiteQuery.refetch();
        void availableSitesQuery.refetch();
      },
    }),
    [hostname, resolvedSite, activeSiteId, activeSite, availableSites, isLoading, isGlobalAdmin, setActiveSiteId, resolveSiteQuery, availableSitesQuery],
  );

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
};

export const useSiteContext = () => {
  const context = useContext(SiteContext);
  if (!context) throw new Error("useSiteContext must be used within SiteProvider");
  return context;
};
