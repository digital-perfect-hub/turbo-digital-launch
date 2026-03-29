import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

const parseHashParams = () => {
  if (typeof window === "undefined") return new URLSearchParams();
  const hash = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : window.location.hash;
  return new URLSearchParams(hash);
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

    const run = async () => {
      try {
        // Supabase-js verarbeitet den Hash und setzt die Session i.d.R. automatisch.
        const { data } = await supabase.auth.getSession();
        if (!isMounted) return;
        setHasSession(Boolean(data.session));
      } finally {
        if (!isMounted) return;
        setIsChecking(false);
      }
    };

    void run();

    return () => {
      isMounted = false;
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

      toast.success("Passwort gespeichert. Willkommen!");
      navigate("/admin", { replace: true });
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
              Dieser Link wurde über ein Invite oder einen Passwort-Reset erzeugt. Setze jetzt dein Passwort, um dich einzuloggen.
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
              <div className="space-y-5">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
                  <div className="flex items-start gap-2">
                    <Lock size={14} className="mt-0.5" />
                    <p>
                      Tipp: Nutze ein starkes Passwort (mind. 8 Zeichen). Danach landest du automatisch im Admin-Bereich.
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
                  type="button"
                  onClick={() => void onSave()}
                  disabled={isSaving}
                  className="w-full rounded-xl bg-[#FF4B2C] text-white hover:bg-[#E03A1E]"
                >
                  {isSaving ? <Loader2 size={16} className="mr-2 animate-spin" /> : null}
                  Passwort speichern
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SetPassword;
