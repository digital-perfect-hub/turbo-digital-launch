import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { euro, isPreviewHost, planPoints, usablePricing } from "@/components/premium-home/Pricing";
import planned from "@/components/premium-home/pricing-preview.json";

// Die Preise von Creator Studio auf der Website: Sie kommen aus der Preisliste des Studios, stehen nie im Code, und die geplante
// Liste erscheint nur auf der Vorschau.

describe("Preise von Creator Studio", () => {
  it("nimmt nur eine eingeschaltete Preisliste mit Tarifen und Beispielen an", () => {
    expect(usablePricing({ active: false })).toBe(false);
    expect(usablePricing({ active: true, plans: [], examples: [] })).toBe(false);
    expect(usablePricing(null)).toBe(false);
    expect(usablePricing(planned)).toBe(true);
  });

  it("zeigt die geplante Preisliste nur auf der Vorschau und lokal", () => {
    expect(isPreviewHost("preview.digital-perfect.com")).toBe(true);
    expect(isPreviewHost("localhost")).toBe(true);
    expect(isPreviewHost("digital-perfect.com")).toBe(false);
    expect(isPreviewHost("www.digital-perfect.com")).toBe(false);
  });

  it("beschreibt einen Tarif aus dessen Schaltern und schreibt Preise wie im Deutschen üblich", () => {
    const business = planned.plans.find((plan) => plan.key === "business");
    expect(business).toBeDefined();
    const points = planPoints(business!);
    expect(points).toContain("15 Creator");
    expect(points).toContain("15 % günstigere Generierungen");
    expect(points).toContain("Eigener KI-Schlüssel möglich");
    const creator = planPoints(planned.plans.find((plan) => plan.key === "creator")!);
    expect(creator).not.toContain("Produkte und Produktvideos");
    expect(euro(4900)).toMatch(/^49\s€$/);
    expect(euro(17)).toMatch(/^0,17\s€$/);
  });

  it("hat keinen Preis im Code der Seite und nennt nichts vom Einkauf", () => {
    const source = readFileSync(resolve(__dirname, "../components/premium-home/Pricing.tsx"), "utf8");
    expect(source).not.toMatch(/\b(49|119|299|4900|11900|29900)\b/);
    expect(source).not.toMatch(/Higgsfield|Listenpreis|Einkauf|USD|Dollar/);
    expect(JSON.stringify(planned)).not.toMatch(/_usd|factor|margin|advantage/i);
  });
});
