import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

export type TenantSiteRole = "owner" | "admin" | "editor" | "viewer";

export type SiteRoleAssignment = {
  siteId: string;
  role: TenantSiteRole;
};

export type AuthCapabilities = {
  canAccessAdmin: boolean;
  canAccessPlatformAdmin: boolean;
  canManageTemplates: boolean;
  canManageGlobalBilling: boolean;
  canManageSites: boolean;
  canManageTenantContent: boolean;
  canManageTenantUsers: boolean;
};

type AuthCtx = {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isGlobalAdmin: boolean;
  loading: boolean;
  siteRoles: SiteRoleAssignment[];
  highestTenantRole: TenantSiteRole | null;
  capabilities: AuthCapabilities;
  refreshAccessContext: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthCtx | undefined>(undefined);

const roleWeight: Record<TenantSiteRole, number> = {
  owner: 4,
  admin: 3,
  editor: 2,
  viewer: 1,
};

const normalizeSiteRoles = (rows: Array<{ site_id: string; role: TenantSiteRole }>): SiteRoleAssignment[] => {
  const roleBySite = new Map<string, TenantSiteRole>();

  for (const row of rows) {
    const current = roleBySite.get(row.site_id);
    if (!current || roleWeight[row.role] > roleWeight[current]) {
      roleBySite.set(row.site_id, row.role);
    }
  }

  return Array.from(roleBySite.entries()).map(([siteId, role]) => ({ siteId, role }));
};

const buildCapabilities = (isGlobalAdmin: boolean, siteRoles: SiteRoleAssignment[]): AuthCapabilities => {
  const hasTenantManagementRole = siteRoles.some(({ role }) => ["owner", "admin", "editor"].includes(role));
  const hasTenantUserManagementRole = siteRoles.some(({ role }) => ["owner", "admin"].includes(role));

  return {
    canAccessAdmin: isGlobalAdmin || hasTenantManagementRole,
    canAccessPlatformAdmin: isGlobalAdmin,
    canManageTemplates: isGlobalAdmin,
    canManageGlobalBilling: isGlobalAdmin,
    canManageSites: isGlobalAdmin,
    canManageTenantContent: isGlobalAdmin || hasTenantManagementRole,
    canManageTenantUsers: isGlobalAdmin || hasTenantUserManagementRole,
  };
};

const resolveHighestTenantRole = (siteRoles: SiteRoleAssignment[]): TenantSiteRole | null => {
  if (!siteRoles.length) return null;

  return siteRoles.reduce<TenantSiteRole>((highest, current) => {
    return roleWeight[current.role] > roleWeight[highest] ? current.role : highest;
  }, siteRoles[0].role);
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isGlobalAdmin, setIsGlobalAdmin] = useState(false);
  const [siteRoles, setSiteRoles] = useState<SiteRoleAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshAccessContext = useCallback(async () => {
    const currentUserId = user?.id;

    if (!currentUserId) {
      setIsAdmin(false);
      setIsGlobalAdmin(false);
      setSiteRoles([]);
      return;
    }

    const [globalAdminResult, siteRoleResult] = await Promise.all([
      supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", currentUserId)
        .eq("role", "admin")
        .maybeSingle(),
      supabase
        .from("user_site_roles" as never)
        .select("site_id, role")
        .eq("user_id", currentUserId),
    ]);

    const hasGlobalAdmin = Boolean(globalAdminResult.data);
    const normalizedRoles = normalizeSiteRoles(((siteRoleResult.data as Array<{ site_id: string; role: TenantSiteRole }> | null) ?? []));
    const hasTenantManagementRole = normalizedRoles.some(({ role }) => ["owner", "admin", "editor"].includes(role));

    setIsGlobalAdmin(hasGlobalAdmin);
    setSiteRoles(normalizedRoles);
    setIsAdmin(hasGlobalAdmin || hasTenantManagementRole);
  }, [user?.id]);

  useEffect(() => {
    const applySession = (nextSession: Session | null) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(Boolean(nextSession));
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      applySession(nextSession);
    });

    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      applySession(initialSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (!user) {
      setIsAdmin(false);
      setIsGlobalAdmin(false);
      setSiteRoles([]);
      setLoading(false);
      return () => {
        isMounted = false;
      };
    }

    setLoading(true);

    void refreshAccessContext().finally(() => {
      if (!isMounted) return;
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [user, refreshAccessContext]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const highestTenantRole = useMemo(() => resolveHighestTenantRole(siteRoles), [siteRoles]);
  const capabilities = useMemo(() => buildCapabilities(isGlobalAdmin, siteRoles), [isGlobalAdmin, siteRoles]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAdmin,
        isGlobalAdmin,
        loading,
        siteRoles,
        highestTenantRole,
        capabilities,
        refreshAccessContext,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
