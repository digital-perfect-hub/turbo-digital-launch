import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CheckCircle2, Loader2, MailPlus, MoreHorizontal, Shield, Skull, Trash2, UserCog, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { useSiteContext } from "@/context/SiteContext";
import { useBilling } from "@/hooks/useBilling";
import { formatUsageLabel } from "@/lib/billing";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ModuleLockedState from "@/components/admin/ModuleLockedState";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ConfirmDeleteDialog from "@/components/admin/ConfirmDeleteDialog";

type TenantSiteRole = "owner" | "admin" | "editor" | "viewer";

type UserSiteRoleRow = {
  id: string;
  user_id: string;
  site_id: string;
  role: TenantSiteRole;
  created_at: string | null;
  updated_at: string | null;
};

type InviteResponse = {
  email?: string;
  message?: string;
  login_url?: string | null;
  seat_limit?: number;
  seats_used?: number;
};

const roleWeight: Record<TenantSiteRole, number> = {
  owner: 4,
  admin: 3,
  editor: 2,
  viewer: 1,
};

const readableRole: Record<TenantSiteRole, string> = {
  owner: "Owner",
  admin: "Admin",
  editor: "Editor",
  viewer: "Viewer",
};

const roleActionLabel: Record<TenantSiteRole, string> = {
  owner: "Zu Owner hochstufen",
  admin: "Zu Admin hochstufen",
  editor: "Zu Editor setzen",
  viewer: "Zu User / Viewer herabstufen",
};

const roleBadgeVariant: Record<TenantSiteRole, string> = {
  owner: "bg-purple-50 text-purple-700 hover:bg-purple-50",
  admin: "bg-[#FFF2EE] text-[#FF4B2C] hover:bg-[#FFF2EE]",
  editor: "bg-blue-50 text-blue-700 hover:bg-blue-50",
  viewer: "bg-slate-100 text-slate-700 hover:bg-slate-100",
};

const sortRoles = (rows: UserSiteRoleRow[]) =>
  [...rows].sort((left, right) => roleWeight[right.role] - roleWeight[left.role] || left.user_id.localeCompare(right.user_id));

const AdminUsers = () => {
  const { isGlobalAdmin, loading, user } = useAuth();
  const { activeSiteId, activeSite } = useSiteContext();
  const { canManageUsers, hasSaasAccess } = useAdminAccess();
  const { plan, entitlements, usage } = useBilling();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<TenantSiteRole>("viewer");
  const [formError, setFormError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<InviteResponse | null>(null);
  const [pendingHardDeleteUserId, setPendingHardDeleteUserId] = useState<string | null>(null);
  const [removeTargetUserId, setRemoveTargetUserId] = useState<string | null>(null);
  const [hardDeleteTargetUserId, setHardDeleteTargetUserId] = useState<string | null>(null);

  const canManageUsersForSite = canManageUsers;
  const allowedInviteRoles = isGlobalAdmin
    ? (["owner", "admin", "editor", "viewer"] as TenantSiteRole[])
    : (["admin", "editor", "viewer"] as TenantSiteRole[]);

  const rolesQuery = useQuery({
    queryKey: ["tenant-user-roles", activeSiteId],
    enabled: Boolean(activeSiteId && canManageUsersForSite),
    queryFn: async (): Promise<UserSiteRoleRow[]> => {
      const { data, error } = await supabase
        .from("user_site_roles" as never)
        .select("id, user_id, site_id, role, created_at, updated_at")
        .eq("site_id", activeSiteId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return sortRoles((data as UserSiteRoleRow[] | null) ?? []);
    },
  });

  const inviteMutation = useMutation({
    mutationFn: async () => {
      const email = inviteEmail.trim().toLowerCase();
      if (!email) throw new Error("Bitte gib eine E-Mail-Adresse ein.");
      if (!allowedInviteRoles.includes(inviteRole)) throw new Error("Diese Rolle darfst du nicht vergeben.");

      const { data, error } = await supabase.functions.invoke("invite-tenant-user", {
        body: {
          email,
          role: inviteRole,
          site_id: activeSiteId,
        },
      });

      if (error) throw new Error(error.message || "Einladung fehlgeschlagen.");
      const response = (data ?? {}) as InviteResponse & { error?: string };
      if (response.error) throw new Error(response.error);
      return response;
    },
    onSuccess: (data) => {
      setInviteEmail("");
      setInviteRole("viewer");
      setFormError(null);
      setInviteSuccess(data);
      void rolesQuery.refetch();
      toast.success(data.message || `${data.email ?? "Der Benutzer"} wurde dem Tenant zugeordnet.`);
    },
    onError: (error) => {
      setInviteSuccess(null);
      setFormError(error instanceof Error ? error.message : "Einladung fehlgeschlagen.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: { target_user_id: string; action: "update_role" | "remove"; new_role?: TenantSiteRole }) => {
      const { data, error } = await supabase.functions.invoke("update-tenant-user", {
        body: {
          target_user_id: payload.target_user_id,
          site_id: activeSiteId,
          action: payload.action,
          new_role: payload.new_role,
        },
      });
      if (error) throw new Error(error.message || "Benutzer-Aktion fehlgeschlagen.");
      const response = (data ?? {}) as { error?: string; message?: string };
      if (response.error) throw new Error(response.error);
      return response;
    },
    onSuccess: (response) => {
      setRemoveTargetUserId(null);
      void rolesQuery.refetch();
      toast.success(response.message || "Benutzer aktualisiert.");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Benutzer-Aktion fehlgeschlagen.");
    },
  });

  const hardDeleteMutation = useMutation({
    mutationFn: async (targetUserId: string) => {
      const { data, error } = await supabase.functions.invoke("hard-delete-auth-user", {
        body: { target_user_id: targetUserId },
      });
      if (error) throw new Error(error.message || "Hard Delete fehlgeschlagen.");
      const response = (data ?? {}) as { error?: string; message?: string };
      if (response.error) throw new Error(response.error);
      return response;
    },
    onSuccess: (response) => {
      setPendingHardDeleteUserId(null);
      setHardDeleteTargetUserId(null);
      void rolesQuery.refetch();
      toast.success(response.message || "Auth-User wurde vollständig gelöscht.");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Hard Delete fehlgeschlagen.");
    },
  });

  const rows = useMemo(() => rolesQuery.data ?? [], [rolesQuery.data]);
  const seatsAtLimit = usage.teamMembers >= entitlements.maxTeamMembers;

  if (!loading && !hasSaasAccess) {
    return (
      <ModuleLockedState
        title="SaaS-Benutzerverwaltung ist gesperrt"
        description="Benutzer, Rollen und Tenant-Selbstverwaltung sind für diesen Tenant aktuell nicht freigeschaltet."
      />
    );
  }

  if (!loading && !canManageUsersForSite) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-10 md:px-10">
        <Card className="mx-auto max-w-2xl rounded-[2rem] border-slate-200">
          <CardHeader>
            <CardTitle>Kein Zugriff</CardTitle>
            <CardDescription>Benutzerverwaltung ist nur für Owner, Admins und Global Admins freigeschaltet.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8 md:px-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge className="rounded-full bg-[#FF4B2C]/10 px-3 py-1 text-[#FF4B2C] hover:bg-[#FF4B2C]/10">
              Self-Service · Team & Rechte
            </Badge>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">Benutzerverwaltung</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-500">
              Verwalte die Rollen für die aktuell aktive Site <span className="font-semibold text-slate-700">{activeSite?.name ?? activeSiteId}</span>. Einladungen und Mutationen laufen ausschließlich über sichere Edge Functions.
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600 shadow-sm">
            <p className="font-semibold text-slate-900">Plan & Team-Limit</p>
            <div className="mt-2 flex items-center gap-2">
              <Shield size={16} className="text-[#FF4B2C]" />
              <span>{plan.name} · {formatUsageLabel(usage.teamMembers, entitlements.maxTeamMembers, "Mitglied", "Mitglieder")}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <Card className="rounded-[2rem] border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Users size={18} /> Benutzer auf dieser Site</CardTitle>
              <CardDescription>
                Rollen werden tenant-spezifisch aus <code>user_site_roles</code> geladen. Kritische Mutationen laufen niemals direkt aus dem Frontend auf diese Tabelle.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rolesQuery.isLoading ? (
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                  <Loader2 className="animate-spin" size={18} /> Benutzer werden geladen...
                </div>
              ) : rows.length ? (
                <div className="space-y-4">
                  {rows.map((assignment) => {
                    const isCurrentUser = assignment.user_id === user?.id;
                    const canTouchOwner = isGlobalAdmin || activeTenantRole === "owner";
                    const canManageAssignment = isGlobalAdmin || assignment.role !== "owner" || canTouchOwner;
                    const roleTargets = isGlobalAdmin
                      ? (["owner", "admin", "editor", "viewer"] as TenantSiteRole[])
                      : activeTenantRole === "owner"
                        ? (["owner", "admin", "editor", "viewer"] as TenantSiteRole[])
                        : (["admin", "editor", "viewer"] as TenantSiteRole[]);

                    return (
                      <div key={assignment.id} className="flex flex-col gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-4 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-slate-900">{isCurrentUser ? "Du" : `User ${assignment.user_id.slice(0, 8)}…`}</p>
                            {isCurrentUser ? <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">Aktuelle Session</Badge> : null}
                          </div>
                          <p className="text-xs text-slate-500">User-ID: {assignment.user_id}</p>
                          <p className="text-xs text-slate-500">Hinzugefügt: {assignment.created_at ? new Date(assignment.created_at).toLocaleString("de-DE") : "—"}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={`${roleBadgeVariant[assignment.role]} rounded-full px-3 py-1`}>{readableRole[assignment.role]}</Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="icon" className="rounded-xl" disabled={updateMutation.isPending || !canManageAssignment}>
                                <MoreHorizontal size={16} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-64 rounded-xl">
                              <DropdownMenuLabel>Aktionen</DropdownMenuLabel>
                              {roleTargets.filter((targetRole) => targetRole !== assignment.role).length ? (
                                <>
                                  <DropdownMenuSeparator />
                                  {roleTargets
                                    .filter((targetRole) => targetRole !== assignment.role)
                                    .map((targetRole) => (
                                      <DropdownMenuItem
                                        key={targetRole}
                                        disabled={updateMutation.isPending}
                                        onClick={() => updateMutation.mutate({
                                          target_user_id: assignment.user_id,
                                          action: "update_role",
                                          new_role: targetRole,
                                        })}
                                      >
                                        <UserCog size={14} className="mr-2" /> {roleActionLabel[targetRole]}
                                      </DropdownMenuItem>
                                    ))}
                                </>
                              ) : null}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-600"
                                disabled={updateMutation.isPending}
                                onClick={() => setRemoveTargetUserId(assignment.user_id)}
                              >
                                <Trash2 size={14} className="mr-2" /> Benutzer aus Tenant entfernen
                              </DropdownMenuItem>
                              {isGlobalAdmin && !isCurrentUser ? (
                                <DropdownMenuItem
                                  className="text-red-700 focus:text-red-700"
                                  disabled={hardDeleteMutation.isPending}
                                  onClick={() => setHardDeleteTargetUserId(assignment.user_id)}
                                >
                                  <Skull size={14} className="mr-2" /> Komplett löschen (Debug)
                                </DropdownMenuItem>
                              ) : null}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-sm text-slate-500">
                  Für diese Site wurden noch keine zusätzlichen Benutzerrollen gefunden.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><MailPlus size={18} /> Benutzer einladen</CardTitle>
              <CardDescription>
                Tenant-Admins dürfen keine Owner einladen. Das Team-Limit wird serverseitig anhand des aktiven Plans geprüft.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {formError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</div>
              ) : null}

              {hardDeleteMutation.isPending && pendingHardDeleteUserId ? (
                <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  <div className="flex items-start gap-2">
                    <Loader2 size={16} className="mt-0.5 shrink-0 animate-spin" />
                    <div className="space-y-1">
                      <p className="font-semibold">Auth-User wird vollständig gelöscht</p>
                      <p>Der Benutzer wird gerade komplett aus Supabase Auth entfernt, damit dieselbe E-Mail wieder frisch eingeladen werden kann.</p>
                    </div>
                  </div>
                </div>
              ) : null}

              {inviteSuccess ? (
                <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                    <div className="space-y-1">
                      <p className="font-semibold">Einladung erfolgreich verarbeitet</p>
                      <p>{inviteSuccess.message || "Der Benutzer wurde dem Tenant zugeordnet."}</p>
                      <p>Nach dem Passwort-Setzen wird der Benutzer automatisch in sein eigenes Tenant-Adminpanel weitergeleitet.</p>
                      {inviteSuccess.login_url ? <p>Set-Passwort-Link: <span className="font-medium">{inviteSuccess.login_url}</span></p> : null}
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 text-xs leading-6 text-slate-600">
                <p><strong>Aktiver Plan:</strong> {plan.name}</p>
                <p><strong>Team-Limit:</strong> {formatUsageLabel(usage.teamMembers, entitlements.maxTeamMembers, "Mitglied", "Mitglieder")}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="invite-email">E-Mail-Adresse</Label>
                <Input
                  id="invite-email"
                  type="email"
                  value={inviteEmail}
                  onChange={(event) => {
                    setInviteEmail(event.target.value);
                    setFormError(null);
                  }}
                  placeholder="team@kunde.at"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="invite-role">Rolle</Label>
                <Select value={inviteRole} onValueChange={(value) => setInviteRole(value as TenantSiteRole)}>
                  <SelectTrigger id="invite-role" className="rounded-xl">
                    <SelectValue placeholder="Rolle wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {allowedInviteRoles.map((role) => (
                      <SelectItem key={role} value={role}>{readableRole[role]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 text-xs leading-6 text-slate-600">
                Eingeladene Benutzer erhalten ihre Site-Rolle serverseitig. Das Frontend schreibt niemals direkt in sicherheitskritische Auth-Tabellen und niemals direkt für Rollen-Entzug/-Änderung in <code>user_site_roles</code>. Global Admins können für Testzwecke zusätzlich einen Auth-User komplett löschen, damit dieselbe E-Mail frisch neu eingeladen werden kann. Ein Global Admin kann für Testzwecke zusätzlich einen Benutzer komplett aus Supabase Auth löschen, damit dieselbe E-Mail frisch neu eingeladen werden kann.
              </div>

              <Button
                onClick={() => inviteMutation.mutate()}
                disabled={inviteMutation.isPending || !inviteEmail.trim() || seatsAtLimit}
                className="w-full rounded-xl bg-[#FF4B2C] text-white hover:bg-[#E03A1E] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {inviteMutation.isPending ? <Loader2 size={16} className="mr-2 animate-spin" /> : <MailPlus size={16} className="mr-2" />}
                {seatsAtLimit ? "Seat-Limit erreicht" : "Einladung versenden"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <ConfirmDeleteDialog
          open={Boolean(removeTargetUserId)}
          onOpenChange={(open) => !open && setRemoveTargetUserId(null)}
          title="Benutzer aus Tenant entfernen?"
          description={removeTargetUserId ? `Der Benutzer ${removeTargetUserId.slice(0, 8)}… wird aus diesem Tenant entfernt.` : ""}
          onConfirm={() => removeTargetUserId && updateMutation.mutate({ target_user_id: removeTargetUserId, action: "remove" })}
          isLoading={updateMutation.isPending}
        />

        <ConfirmDeleteDialog
          open={Boolean(hardDeleteTargetUserId)}
          onOpenChange={(open) => !open && setHardDeleteTargetUserId(null)}
          title="Auth-User vollständig löschen?"
          description={hardDeleteTargetUserId ? `Der Auth-User ${hardDeleteTargetUserId.slice(0, 8)}… wird komplett aus Supabase Auth gelöscht und kann danach neu eingeladen werden.` : ""}
          onConfirm={() => {
            if (!hardDeleteTargetUserId) return;
            setPendingHardDeleteUserId(hardDeleteTargetUserId);
            hardDeleteMutation.mutate(hardDeleteTargetUserId);
          }}
          isLoading={hardDeleteMutation.isPending}
        />
      </div>
    </div>
  );
};

export default AdminUsers;
