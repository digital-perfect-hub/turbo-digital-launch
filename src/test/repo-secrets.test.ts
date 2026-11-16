import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";

// Die Datei .env lag bis November 2026 im öffentlichen Repository. Dieser Test hält den Zustand danach fest: Keine env-Datei
// und keine Zugangsdaten unter den von Git verfolgten Dateien. Die Regeln stehen in scripts/security/check-secrets.mjs.
const insideGit = (() => {
  try {
    return execFileSync("git", ["rev-parse", "--is-inside-work-tree"], { encoding: "utf8", stdio: "pipe" }).trim() === "true";
  } catch {
    return false;
  }
})();

describe.skipIf(!insideGit)("Repository ohne Zugangsdaten", () => {
  it("führt keine env-Datei und keine Zugangsdaten mit", () => {
    let output = "";
    try {
      output = execFileSync("node", ["scripts/security/check-secrets.mjs"], { encoding: "utf8", stdio: "pipe" });
    } catch (error) {
      const failure = error as { stdout?: string; stderr?: string };
      output = `${failure.stdout ?? ""}${failure.stderr ?? ""}` || "check-secrets ist fehlgeschlagen";
      expect.fail(output);
    }
    expect(output).toContain("keine env-Datei und keine Zugangsdaten gefunden");
  });
});
