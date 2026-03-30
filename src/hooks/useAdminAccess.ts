import { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSiteContext } from "@/context/SiteContext";
import { useSiteModules } from "@/hooks/useSiteModules";
import type { SiteRole } from "@/lib/site";

const canEditForRole = (role: SiteRole | null) => role === "owner" || role === "admin" || role === "editor";
const canManageForRole = (role: SiteRole | null) => role === "owner" || role === "admin";

export const useAdminAccess = () => {
  const { isGlobalAdmin, loading: authLoading } = useAuth();
  const { activeSiteRole } = useSiteContext();
  const { hasSaas, isLoading: modulesLoading } = useSiteModules();

  return useMemo(() => {
    const tenantRole = (isGlobalAdmin ? "owner" : activeSiteRole) as SiteRole | null;
    const canEditContent = isGlobalAdmin || canEditForRole(tenantRole);
    const canManageUsers = isGlobalAdmin || canManageForRole(tenantRole);
    const canManageSettings = isGlobalAdmin || canManageForRole(tenantRole);
    const hasSaasAccess = isGlobalAdmin || hasSaas;

    return {
      tenantRole,
      isGlobalAdmin,
      loading: authLoading || modulesLoading,
      canAccessAdmin: isGlobalAdmin || Boolean(tenantRole),
      canEditContent,
      canManageUsers,
      canManageSettings,
      canManageDomains: canManageUsers && hasSaasAccess,
      hasSaasAccess,
      isViewer: tenantRole === "viewer",
      isEditor: tenantRole === "editor",
    };
  }, [activeSiteRole, authLoading, hasSaas, isGlobalAdmin, modulesLoading]);
};
