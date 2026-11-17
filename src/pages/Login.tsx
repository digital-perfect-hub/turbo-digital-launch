import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGlobalTheme } from "@/hooks/useGlobalTheme";

// Anmeldung für die Verwaltung. Eine Registrierung gibt es hier nicht: Konten entstehen nur auf Einladung aus der
// Benutzerverwaltung (Funktion invite-tenant-user), das Passwort wird unter /set-password gesetzt. Die öffentliche
// Registrierung ist auch im Supabase-Projekt ausgeschaltet.
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const { logoUrl, settings } = useGlobalTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const { error } = await signIn(email, password);
    setIsLoading(false);
    if (error) {
      setError("Ungültige Anmeldedaten");
    } else {
      window.location.href = "/admin";
    }
  };

  return (
    <>
      <SEO
        title="Admin Login | Digital-Perfect"
        description="Sicherer Login für die Verwaltung von Digital-Perfect."
        canonical="/login"
        noIndex
      />
      <div className="surface-page-shell min-h-screen px-4">
      <div className="mx-auto flex min-h-screen w-full max-w-sm items-center justify-center">
        <div className="surface-card-shell w-full rounded-[2rem] border p-8 shadow-sm">
          <div className="text-center mb-8">
          {logoUrl && <img src={logoUrl} alt={`${settings.company_name || "Logo"} Logo`} className="h-12 mx-auto mb-4" />}
          <h1 className="text-2xl font-bold">Admin Login</h1>
          <p className="text-muted-foreground text-sm mt-1">Melde dich an, um die Seite zu verwalten</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">E-Mail</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="password">Passwort</Label>
            <Input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Bitte warten..." : "Anmelden"}
          </Button>
        </form>
        </div>
      </div>
    </div>
    </>
  );
};

export default Login;
