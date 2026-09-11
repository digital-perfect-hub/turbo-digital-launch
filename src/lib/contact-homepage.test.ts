import { describe, expect, it } from "vitest";
import { contactHomepageSchema, resolveContactHomepage } from "./contact-homepage";
import { DEFAULT_SITE_ID } from "./site";

describe("Mandantenbezogene Kontakt-Startseite", () => {
  it("aktiviert den Relaunch ausschließlich für Digital-Perfect", () => {
    expect(resolveContactHomepage(undefined, DEFAULT_SITE_ID).enabled).toBe(true);
    const other = resolveContactHomepage(undefined, "other-site");
    expect(other.enabled).toBe(false);
    expect(other.testimonials).toEqual([]);
    expect(other.portraitUrl).toBe("");
  });
  it("respektiert gespeicherte Texte und eine explizite Deaktivierung", () => {
    const result = resolveContactHomepage(JSON.stringify({ enabled: false, headline: "Meine Überschrift" }), DEFAULT_SITE_ID);
    expect(result.enabled).toBe(false);
    expect(result.headline).toBe("Meine Überschrift");
  });
  it("fällt bei kaputtem JSON auf das kontaktorientierte Layout zurück", () => {
    expect(resolveContactHomepage("{broken", DEFAULT_SITE_ID).enabled).toBe(true);
  });
  it("weist ausführbare und ungültige Bildadressen beim Speichern zurück", () => {
    const config = resolveContactHomepage(undefined, DEFAULT_SITE_ID);
    expect(contactHomepageSchema.safeParse({ ...config, portraitUrl: "javascript:alert(1)" }).success).toBe(false);
  });
});
