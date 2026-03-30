import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGlobalTheme } from "@/hooks/useGlobalTheme";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { signIn, signUp } = useAuth();
  const { logoUrl, settings } = useGlobalTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setIsLoading(true);

    if (isSignUp) {
      const { error } = await signUp(email, password);
      setIsLoading(false);
      if (error) {
        setError(error.message);
      } else {
        setInfo("Account erstellt! Ein Admin muss dir noch die Admin-Rolle zuweisen.");
        setIsSignUp(false);
      }
    } else {
      const { error } = await signIn(email, password);
      setIsLoading(false);
      if (error) {
        setError("Ungültige Anmeldedaten");
      } else {
        window.location.href = "/admin";
      }
    }
  };

  return (
    <div className="surface-page-shell min-h-screen px-4">
      <div className="mx-auto flex min-h-screen w-full max-w-sm items-center justify-center">
        <div className="surface-card-shell w-full rounded-[2rem] border p-8 shadow-sm">
          <div className="text-center mb-8">
          {logoUrl && <img src={logoUrl} alt={`${settings.company_name || "Logo"} Logo`} className="h-12 mx-auto mb-4" />}
          <h1 className="text-2xl font-bold">{isSignUp ? "Registrieren" : "Admin Login"}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isSignUp ? "Neuen Account erstellen" : "Melde dich an, um die Seite zu verwalten"}
          </p>
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
          {info && <p className="text-sm theme-link-accent">{info}</p>}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Bitte warten..." : isSignUp ? "Registrieren" : "Anmelden"}
          </Button>
        </form>
          <button onClick={() => { setIsSignUp(!isSignUp); setError(""); setInfo(""); }} className="mt-4 text-sm text-muted-foreground hover:text-foreground w-full text-center">
            {isSignUp ? "Bereits registriert? Anmelden" : "Noch kein Account? Registrieren"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
