import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

type TenantSiteRole = "owner" | "admin" | "editor" | "viewer";

type UserSiteRoleRow = {
  site_id: string;
  role: TenantSiteRole;
  created_at: string | null;
  updated_at: string | null;
};

type AccessibleSiteRow = {
  id: string;
  slug: string | null;
  primary_domain: string | null;
  is_default: boolean | null;
  is_active: boolean | null;
  user_role: string | null;
};

type SiteDomainRow = {
  hostname: string | null;
  is_primary: boolean | null;
  verification_status: "pending" | "verified" | "failed" | null;
  created_at: string | null;
};

const roleWeight: Record<TenantSiteRole, number> = {
  owner: 4,
  admin: 3,
  editor: 2,
  viewer: 1,
};

const PLATFORM_APP_BASE_URL =
  import.meta.env.VITE_APP_BASE_URL ||
  import.meta.env.VITE_AUTH_BASE_URL ||
  "https://dev.digital-perfect.com";

const parseHashParams = () => {
  if (typeof window === "undefined") return new URLSearchParams();
  const hash = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : window.location.hash;
  return new URLSearchParams(hash);
};

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

const normalizeHostname = (value: string | null | undefined) =>
  (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "")
    .replace(/:+\d+$/, "");

const normalizeBaseUrl = (value: string | null | undefined) => {
  const trimmed = (value ?? "").trim().replace(/\/$/, "");
  if (!trimmed) return "https://dev.digital-perfect.com";
  return /^https?:\/\//.test(trimmed) ? trimmed : `https://${trimmed}`;
};

const isIpHostname = (value: string) => /^\d{1,3}(?:\.\d{1,3}){3}$/.test(value);

const getPlatformHost = () => {
  try {
    return normalizeHostname(new URL(normalizeBaseUrl(PLATFORM_APP_BASE_URL)).hostname);
  } catch {
    return "dev.digital-perfect.com";
  }
};

const isPlatformManagedHost = (hostname: string, platformHost: string) => {
  const normalizedHost = normalizeHostname(hostname);
  const normalizedPlatformHost = normalizeHostname(platformHost);

  if (!normalizedHost || !normalizedPlatformHost) return false;
  if (normalizedHost === normalizedPlatformHost) return true;
  return normalizedHost.endsWith(`.${normalizedPlatformHost}`);
};

const buildAbsoluteAdminUrl = (hostname: string) => {
  const normalizedHost = normalizeHostname(hostname);
  if (!normalizedHost) {
    throw new Error("Es konnte keine gültige Ziel-Domain aufgebaut werden.");
  }

  const currentProtocol = typeof window !== "undefined" ? window.location.protocol : "https:";
  const protocol = normalizedHost === "localhost" || isIpHostname(normalizedHost) ? currentProtocol : "https:";
  return `${protocol}//${normalizedHost}/admin`;
};

const buildManagedTenantHost = (slug: string, platformHost: string) => `${slug.trim().toLowerCase()}.${platformHost}`;

const sortAssignmentsForRedirect = (rows: UserSiteRoleRow[]) =>
  [...rows].sort((left, right) => {
    const rightTimestamp = Date.parse(right.updated_at ?? right.created_at ?? "");
    const leftTimestamp = Date.parse(left.updated_at ?? left.created_at ?? "");

    if (!Number.isNaN(rightTimestamp) || !Number.isNaN(leftTimestamp)) {
      const normalizedRight = Number.isNaN(rightTimestamp) ? 0 : rightTimestamp;
      const normalizedLeft = Number.isNaN(leftTimestamp) ? 0 : leftTimestamp;
      if (normalizedRight !== normalizedLeft) return normalizedRight - normalizedLeft;
    }

    return roleWeight[right.role] - roleWeight[left.role];
  });

const loadAssignmentsForUser = async (userId: string) => {
  let assignments: UserSiteRoleRow[] = [];

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const { data, error } = await supabase
      .from("user_site_roles" as never)
      .select("site_id, role, created_at, updated_at")
      .eq("user_id", userId);

    if (!error && Array.isArray(data) && data.length) {
      assignments = data as UserSiteRoleRow[];
      break;
    }

    if (error && attempt === 4) {
      throw error;
    }

    await wait(300 * (attempt + 1));
  }

  if (!assignments.length) {
    throw new Error("Für diesen Benutzer wurde noch keine Tenant-Zuordnung gefunden. Bitte prüfe user_site_roles oder lade die Seite kurz neu.");
  }

  return sortAssignmentsForRedirect(assignments);
};

const loadAccessibleSites = async () => {
  let sites: AccessibleSiteRow[] = [];

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const { data, error } = await supabase.rpc("list_accessible_sites");

    if (!error && Array.isArray(data) && data.length) {
      sites = data as AccessibleSiteRow[];
      break;
    }

    if (error && attempt === 4) {
      throw error;
    }

    await wait(300 * (attempt + 1));
  }

  if (!sites.length) {
    throw new Error("Es konnten keine zugänglichen Sites geladen werden. Bitte prüfe RLS und list_accessible_sites().");
  }

  return sites;
};

const tryLoadVerifiedCustomDomain = async (siteId: string, platformHost: string) => {
  try {
    const { data, error } = await supabase
      .from("site_domains" as never)
      .select("hostname, is_primary, verification_status, created_at")
      .eq("site_id", siteId)
      .eq("verification_status", "verified")
      .order("is_primary", { ascending: false })
      .order("created_at", { ascending: true });

    if (error) {
      return null;
    }

    const rows = ((data as SiteDomainRow[] | null) ?? [])
      .map((entry) => normalizeHostname(entry.hostname))
      .filter((hostname) => Boolean(hostname));

    return rows.find((hostname) => !isPlatformManagedHost(hostname, platformHost)) ?? null;
  } catch {
    return null;
  }
};

const resolveTenantAdminUrl = async (userId: string) => {
  const platformHost = getPlatformHost();
  const [assignments, accessibleSites] = await Promise.all([loadAssignmentsForUser(userId), loadAccessibleSites()]);
  const primaryAssignment = assignments[0];
  const targetSite = accessibleSites.find((site) => site.id === primaryAssignment.site_id) ?? null;

  if (!targetSite) {
    throw new Error("Die Tenant-Site des Benutzers konnte nicht aus list_accessible_sites() geladen werden.");
  }

  const verifiedCustomDomain = await tryLoadVerifiedCustomDomain(targetSite.id, platformHost);
  if (verifiedCustomDomain) {
    return buildAbsoluteAdminUrl(verifiedCustomDomain);
  }

  const normalizedPrimaryDomain = normalizeHostname(targetSite.primary_domain);
  if (normalizedPrimaryDomain && isPlatformManagedHost(normalizedPrimaryDomain, platformHost) && normalizedPrimaryDomain !== platformHost) {
    return buildAbsoluteAdminUrl(normalizedPrimaryDomain);
  }

  if (targetSite.slug) {
    return buildAbsoluteAdminUrl(buildManagedTenantHost(targetSite.slug, platformHost));
  }

  throw new Error("Es konnte keine gültige Tenant-Domain für den Redirect ermittelt werden.");
};

const getFriendlyErrorMessage = (error: unknown) => {
  const fallbackMessage = "Passwort konnte nicht gespeichert werden.";
  if (!(error instanceof Error)) return fallbackMessage;

  const code = typeof (error as { code?: unknown }).code === "string" ? (error as { code: string }).code : "";
  const message = error.message || "";

  if (code === "same_password" || /same_password/i.test(message)) {
    return "Dieses Passwort ist bereits gesetzt. Bitte wähle ein anderes neues Passwort.";
  }

  if (/New password should be different/i.test(message)) {
    return "Dieses Passwort ist bereits gesetzt. Bitte wähle ein anderes neues Passwort.";
  }

  return message || fallbackMessage;
};

const SetPassword = () => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const hashParams = useMemo(() => parseHashParams(), []);
  const errorCode = hashParams.get("error_code") || hashParams.get("error") || null;
  const errorDescription = hashParams.get("error_description") || null;

  useEffect(() => {
    let isMounted = true;

    const applySessionState = (sessionExists: boolean) => {
      if (!isMounted) return;
      setHasSession(sessionExists);
      setIsChecking(false);
    };

    const run = async () => {
      const { data } = await supabase.auth.getSession();
      applySessionState(Boolean(data.session));
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      applySessionState(Boolean(session));
    });

    void run();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const onSave = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    if (!hasSession) {
      toast.error("Es wurde keine gültige Invite-/Reset-Session gefunden.");
      return;
    }

    if (password.length < 8) {
      toast.error("Passwort muss mindestens 8 Zeichen haben.");
      return;
    }

    if (password !== passwordConfirm) {
      toast.error("Passwörter stimmen nicht überein.");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw userError || new Error("Die neue Session konnte nach dem Passwort-Setzen nicht geladen werden.");
      }

      const tenantAdminUrl = await resolveTenantAdminUrl(user.id);
      toast.success("Passwort gespeichert. Du wirst jetzt in dein eigenes Admin-Panel weitergeleitet.");
      window.location.href = tenantAdminUrl;
    } catch (error) {
      toast.error(getFriendlyErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10 md:px-10">
      <div className="mx-auto max-w-xl">
        <Card className="rounded-[2rem] border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ShieldCheck size={18} /> Passwort setzen</CardTitle>
            <CardDescription>
              Dieser Link wurde über ein Invite oder einen Passwort-Reset erzeugt. Setze jetzt dein Passwort, danach leiten wir dich direkt in dein eigenes Tenant-Adminpanel weiter.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isChecking ? (
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-600">
                <Loader2 className="animate-spin" size={18} /> Session wird geprüft...
              </div>
            ) : null}

            {!isChecking && errorCode ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <p className="font-semibold">Link ungültig oder abgelaufen</p>
                <p className="mt-1">{errorDescription ? decodeURIComponent(errorDescription.replace(/\+/g, " ")) : "Bitte fordere einen neuen Link an."}</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button variant="outline" className="rounded-xl" onClick={() => navigate("/login", { replace: true })}>
                    Zum Login
                  </Button>
                </div>
              </div>
            ) : null}

            {!isChecking && !errorCode && !hasSession ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                <p className="font-semibold">Kein aktiver Invite-/Reset-Login gefunden</p>
                <p className="mt-1">Bitte nutze den Link aus der E-Mail erneut oder fordere einen neuen Passwort-Reset an.</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button variant="outline" className="rounded-xl" onClick={() => navigate("/login", { replace: true })}>
                    Zum Login
                  </Button>
                </div>
              </div>
            ) : null}

            {!isChecking && hasSession && !errorCode ? (
              <form className="space-y-5" onSubmit={(event) => void onSave(event)}>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
                  <div className="flex items-start gap-2">
                    <Lock size={14} className="mt-0.5" />
                    <p>
                      Tipp: Nutze ein starkes Passwort (mind. 8 Zeichen). Danach bauen wir den Tenant-Kontext frisch auf und schicken dich per Hard-Redirect direkt zu <code>/admin</code> deiner eigenen Instanz.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Neues Passwort</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    minLength={8}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passwordConfirm">Passwort bestätigen</Label>
                  <Input
                    id="passwordConfirm"
                    type="password"
                    autoComplete="new-password"
                    value={passwordConfirm}
                    onChange={(event) => setPasswordConfirm(event.target.value)}
                    placeholder="••••••••"
                    minLength={8}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSaving}
                  className="w-full rounded-xl bg-[#FF4B2C] text-white hover:bg-[#E03A1E]"
                >
                  {isSaving ? <Loader2 size={16} className="mr-2 animate-spin" /> : null}
                  Passwort speichern
                </Button>
              </form>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SetPassword;
