import { describe, expect, it } from "vitest";
import { PREMIUM_PAGES } from "@/components/premium-home/pages";
import { COST_POINTS } from "@/components/premium-home/content";

// Die festen Premium-Unterseiten: Titel und Beschreibung passen vollständig in die Grenzen der Suchergebnisse (60 und 155 Zeichen),
// damit nichts mitten im Wort endet, und die Texte versprechen weder Nennungen in KI-Antworten noch ein eigenes Anbieterkonto.

describe("die Kopfdaten der Premium-Unterseiten", () => {
  it("passen ohne Kürzung in Titel und Beschreibung", () => {
    for (const [slug, page] of Object.entries(PREMIUM_PAGES)) {
      expect(page.seoTitle.length, `Titel von /${slug}`).toBeLessThanOrEqual(60);
      expect(page.seoDescription.length, `Beschreibung von /${slug}`).toBeLessThanOrEqual(155);
      expect(page.seoTitle, `Titel von /${slug}`).toMatch(/\| Digital-Perfect$/);
    }
  });

  it("versprechen keine Nennung durch KI-Systeme und nennen kein eigenes Anbieterkonto als Kostenweg", () => {
    const texts = JSON.stringify(PREMIUM_PAGES) + JSON.stringify(COST_POINTS);
    expect(texts).not.toMatch(/gefunden werden \|/);
    expect(texts).not.toMatch(/kennen, verstehen und nennen|kennen, richtig verstehen und in ihren Antworten nennen\./);
    expect(texts).not.toMatch(/eigenes Higgsfield-Konto/);
  });
});
