import { useEffect, useMemo, useState } from "react";
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

type SiteRow = {
  id: string;
  slug: string | null;
  primary_domain: string | null;
};

type SiteDomainRow = {
  hostname: string;
  is_primary: boolean;
  verification_status: "pending" | "verified" | "failed" | null;
  created_at: string | null;
};

const roleWeight: Record<TenantSiteRole, number> = {
  owner: 4,
  admin: 3,
  editor: 2,
  viewer: 1,
};

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

const isIpHostname = (value: string) => /^\d{1,3}(?:\.\d{1,3}){3}$/.test(value);

const derivePlatformRootHost = (hostname: string) => {
  const normalized = normalizeHostname(hostname);
  if (!normalized || normalized === "localhost" || isIpHostname(normalized)) return normalized;

  const parts = normalized.split(".");
  if (parts.length <= 2) return normalized;

  return parts.slice(1).join(".");
};

const buildManagedTenantHost = (slug: string, platformRootHost: string) => {
  const normalizedSlug = slug.trim().toLowerCase();
  const normalizedPlatformRootHost = normalizeHostname(platformRootHost);

  if (!normalizedSlug || !normalizedPlatformRootHost) {
    throw new Error("Managed Tenant-Host konnte nicht aufgebaut werden.");
  }

  return `${normalizedSlug}.${normalizedPlatformRootHost}`;
};

const buildAbsoluteLoginUrl = (hostname: string) => {
  const currentUrl = new URL(window.location.href);
  const normalizedHost = hostname.trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  const bareHost = normalizedHost.replace(/:+\d+$/, "");
  const protocol = bareHost === "localhost" || isIpHostname(bareHost) ? currentUrl.protocol : "https:";
  return `${protocol}//${normalizedHost}/login`;
};

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

const tryLoadVerifiedCustomDomain = async (siteId: string, platformRootHost: string) => {
  const { data, error } = await supabase
    .from("site_domains" as never)
    .select("hostname, is_primary, verification_status, created_at")
    .eq("site_id", siteId)
    .eq("verification_status", "verified")
    .order("is_primary", { ascending: false })
    .order("created_at", { ascending: true });

  if (error) throw error;

  const normalizedPlatformRootHost = normalizeHostname(platformRootHost);
  const domains = ((data as SiteDomainRow[] | null) ?? []).filter((entry) => Boolean(entry.hostname));

  return (
    domains
      .map((entry) => normalizeHostname(entry.hostname))
      .find((hostname) => {
        if (!hostname) return false;
        if (!normalizedPlatformRootHost) return true;
        if (hostname === normalizedPlatformRootHost) return false;
        return !hostname.endsWith(`.${normalizedPlatformRootHost}`);
      }) ?? null
  );
};

const resolveTenantLoginUrl = async (userId: string) => {
  let assignments: UserSiteRoleRow[] = [];

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const { data, error } = await supabase
      .from("user_site_roles" as never)
      .select("site_id, role, created_at, updated_at")
      .eq("user_id", userId);

    if (!error && Array.isArray(data) && data.length) {
      assignments = data as UserSiteRoleRow[];
      break;
    }

    if (error && attempt === 3) {
      throw error;
    }

    await wait(350 * (attempt + 1));
  }

  if (!assignments.length) {
    throw new Error("Für diesen Benutzer wurde keine Tenant-Zuordnung gefunden.");
  }

  const primaryAssignment = sortAssignmentsForRedirect(assignments)[0];

  const { data: siteData, error: siteError } = await supabase
    .from("sites" as never)
    .select("id, slug, primary_domain")
    .eq("id", primaryAssignment.site_id)
    .maybeSingle();

  if (siteError) throw siteError;

  const targetSite = (siteData ?? null) as SiteRow | null;
  if (!targetSite) {
    throw new Error("Die zugehörige Tenant-Site konnte nicht geladen werden.");
  }

  const platformRootHost = derivePlatformRootHost(window.location.hostname);

  const verifiedCustomDomain = await tryLoadVerifiedCustomDomain(targetSite.id, platformRootHost);
  if (verifiedCustomDomain) {
    return buildAbsoluteLoginUrl(verifiedCustomDomain);
  }

  const normalizedPrimaryDomain = normalizeHostname(targetSite.primary_domain);
  if (normalizedPrimaryDomain && normalizedPrimaryDomain !== normalizeHostname(window.location.hostname)) {
    return buildAbsoluteLoginUrl(normalizedPrimaryDomain);
  }

  if (targetSite.slug) {
    return buildAbsoluteLoginUrl(buildManagedTenantHost(targetSite.slug, platformRootHost));
  }

  throw new Error("Es konnte keine gültige Tenant-Domain für den Redirect ermittelt werden.");
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

  const onSave = async () => {
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

      const tenantLoginUrl = await resolveTenantLoginUrl(user.id);
      toast.success("Passwort gespeichert. Du wirst jetzt auf die Login-Seite deiner eigenen Instanz weitergeleitet.");
      window.location.href = tenantLoginUrl;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Passwort konnte nicht gespeichert werden.");
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
              Dieser Link wurde über ein Invite oder einen Passwort-Reset erzeugt. Setze jetzt dein Passwort, danach leiten wir dich auf die Login-Seite deiner eigenen Tenant-Instanz weiter.
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
              <form onSubmit={(e) => { e.preventDefault(); void onSave(); }} className="space-y-5">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
                  <div className="flex items-start gap-2">
                    <Lock size={14} className="mt-0.5" />
                    <p>
                      Tipp: Nutze ein starkes Passwort (mind. 8 Zeichen). Danach bauen wir den Tenant-Kontext frisch auf und schicken dich per Hard-Redirect direkt auf die <code>/login</code>-Seite deiner eigenen Instanz.
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
