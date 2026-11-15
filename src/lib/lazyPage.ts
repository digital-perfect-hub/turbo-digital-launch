import { lazy, type ComponentType } from "react";

// Eine Unterseite wird als eigene Datei nachgeladen. Nach einem neuen Deployment heißt diese Datei anders: Ein Tab mit dem alten
// Stand findet sie nicht mehr, und die Seite bliebe leer. Dann wird einmal neu geladen (der neue Stand kennt die neuen Namen);
// schlägt es danach wieder fehl, wird der Fehler nicht verschluckt.
const RELOAD_FLAG = "dp:chunk-reload";
const flag = (set?: boolean): boolean => {
  try {
    if (set === true) window.sessionStorage.setItem(RELOAD_FLAG, "1");
    else if (set === false) window.sessionStorage.removeItem(RELOAD_FLAG);
    return window.sessionStorage.getItem(RELOAD_FLAG) === "1";
  } catch {
    return true;
  }
};
export const lazyPage = <T extends ComponentType<never>>(load: () => Promise<{ default: T }>) =>
  lazy(() =>
    load().then(
      (module) => {
        flag(false);
        return module;
      },
      (error: unknown) => {
        if (flag()) throw error;
        flag(true);
        window.location.reload();
        return new Promise<{ default: T }>(() => undefined);
      },
    ),
  );
