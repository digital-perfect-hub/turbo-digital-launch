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

export const SiteProvider = ({ children }: { children: ReactNode }) => {
  const { user, isGlobalAdmin } = useAuth();
  const [hostname] = useState(() => getBrowserHostname());
  const [selectedSiteId, setSelectedSiteIdState] = useState<string | null>(() => getStoredAdminSiteId());

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

  const activeSite = useMemo(() => {
    if (!availableSites.length) {
      return resolvedSite;
    }

    if (selectedSiteId) {
      const selected = availableSites.find((site) => site.id === selectedSiteId);
      if (selected) return selected;
    }

    if (resolvedSite) {
      const matchingResolved = availableSites.find((site) => site.id === resolvedSite.id);
      if (matchingResolved) return matchingResolved;
    }

    return availableSites.find((site) => site.is_default) || availableSites[0] || resolvedSite;
  }, [availableSites, resolvedSite, selectedSiteId]);

  useEffect(() => {
    if (!user) return;
    if (!activeSite?.id) return;
    setStoredAdminSiteId(activeSite.id);
  }, [activeSite?.id, user]);

  const setActiveSiteId = useCallback((siteId: string) => {
    setSelectedSiteIdState(siteId);
    setStoredAdminSiteId(siteId);
  }, []);

  const isLoading = resolveSiteQuery.isLoading || (Boolean(user) && availableSitesQuery.isLoading);
  const activeSiteId = activeSite?.id || resolvedSite?.id || DEFAULT_SITE_ID;

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
