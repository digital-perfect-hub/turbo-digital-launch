// Abrufe, die index.html auf den eigenen Adressen von Digital-Perfect schon gestartet hat, während das Skript der Seite noch
// geladen wird (siehe das Skript in index.html): die Einstellungen und das Design der Standard-Site. Jeder Abruf wird genau
// einmal übernommen. Alles Spätere, etwa das erneute Laden nach einer Änderung in der Verwaltung, geht den normalen Weg.
type BootData = { site: string; settings?: Promise<unknown>; theme?: Promise<unknown> };

export const takeBootData = async <T>(kind: "settings" | "theme", siteId: string): Promise<T | undefined> => {
  if (typeof window === "undefined") return undefined;
  const boot = (window as Window & { __dpBoot?: BootData }).__dpBoot;
  const pending = boot && boot.site === siteId ? boot[kind] : undefined;
  if (!boot || !pending) return undefined;
  boot[kind] = undefined;
  try {
    return (await pending) as T;
  } catch {
    return undefined;
  }
};
