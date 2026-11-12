import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { PREMIUM_PAGES } from "@/components/premium-home/pages";

// Die festen Premium-Unterseiten stehen im Code der Website, nicht in der Datenbank. Die Sitemap-Funktion führt
// deshalb eine eigene Liste. Dieser Test schlägt an, sobald eine Seite dazukommt oder wegfällt und die Liste
// in supabase/functions/generate-sitemap/index.ts nicht mitgezogen wurde.
const sitemapSource = readFileSync(resolve(process.cwd(), "supabase/functions/generate-sitemap/index.ts"), "utf8");
const routeSource = readFileSync(resolve(process.cwd(), "src/pages/PremiumOrDynamicPage.tsx"), "utf8");

const listed = () => {
  const match = sitemapSource.match(/const PREMIUM_STATIC_PATHS = \[([^\]]*)\]/);
  if (!match) throw new Error("PREMIUM_STATIC_PATHS fehlt in generate-sitemap");
  return [...match[1].matchAll(/"([^"]+)"/g)].map((entry) => entry[1]).sort();
};

describe("Sitemap: Premium-Unterseiten", () => {
  it("führt genau die Unterseiten, die die Website ausliefert", () => {
    const fixedRoutes = [...routeSource.matchAll(/slug === "([^"]+)"/g)].map((entry) => entry[1]);
    expect(fixedRoutes.sort()).toEqual(["kontakt", "projekte"]);
    expect(listed()).toEqual([...Object.keys(PREMIUM_PAGES), ...fixedRoutes].sort());
  });

  it("nimmt die Unterseiten nur für die Digital-Perfect-Site auf und Rechtsseiten nur mit echtem Text", () => {
    expect(sitemapSource).toContain("if (site.id === DEFAULT_SITE_ID) {");
    expect(sitemapSource).toContain("!hasRealLegalText(row.body)");
  });

  it("erkennt Platzhalter nach derselben Regel wie die Rechtsseite selbst", () => {
    const hookSource = readFileSync(resolve(process.cwd(), "src/hooks/useLegalPages.ts"), "utf8");
    const rule = (source: string, name: string) => (source.match(new RegExp(`${name} = (.+);`)) || [])[1];
    expect(rule(sitemapSource, "LEGAL_PLACEHOLDER_PATTERNS")).toBe(rule(hookSource, "LEGAL_PLACEHOLDER_PATTERNS"));
    expect(rule(sitemapSource, "MIN_LEGAL_TEXT_LENGTH")).toBe(rule(hookSource, "MIN_LEGAL_TEXT_LENGTH"));
    expect(rule(hookSource, "LEGAL_PLACEHOLDER_PATTERNS")).toContain("/\\[\\[/");
    expect(sitemapSource).toContain('.replace(/\\s+/g, " ")');
  });
});
