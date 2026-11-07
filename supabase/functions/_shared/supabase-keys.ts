// Gemeinsamer Zugriff auf den privilegierten Supabase-Schlüssel der Edge Functions.
//
// Supabase stellt Edge Functions zwei Varianten bereit:
//   SUPABASE_SECRET_KEYS         neu, JSON-Objekt, z. B. {"default":"sb_secret_..."}
//   SUPABASE_SERVICE_ROLE_KEY    Legacy-JWT, wird mit den Legacy-API-Schlüsseln deaktiviert
//
// Der neue Schlüssel wird bevorzugt. Fehlt er (noch), gilt der Legacy-Schlüssel. So lassen sich die
// Funktionen vor dem Deaktivieren der Legacy-Schlüssel umstellen, ohne dass etwas ausfällt.
// Offizielle Anleitung: https://supabase.com/docs/guides/getting-started/migrating-to-new-api-keys

type EnvReader = (name: string) => string | undefined;

export const resolveSecretKey = (read: EnvReader, keyName = "default"): string | undefined => {
  const raw = read("SUPABASE_SECRET_KEYS");
  if (raw) {
    try {
      const keys = JSON.parse(raw) as Record<string, unknown>;
      const key = keys[keyName];
      if (typeof key === "string" && key.trim()) return key.trim();
    } catch {
      // Ungültiges JSON: auf den Legacy-Schlüssel zurückfallen.
    }
  }
  return read("SUPABASE_SERVICE_ROLE_KEY");
};

export const getSupabaseSecretKey = (keyName = "default"): string | undefined => {
  const runtime = (globalThis as { Deno?: { env: { get(name: string): string | undefined } } }).Deno;
  return resolveSecretKey((name) => runtime?.env.get(name), keyName);
};
