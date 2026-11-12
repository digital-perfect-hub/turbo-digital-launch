import type { ReactNode } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import LegalPageTemplate from "@/components/legal/LegalPageTemplate";
import { type LegalPageRecord, isLegalPagePublishable, legalPageDefaults } from "@/hooks/useLegalPages";
import { DEFAULT_SITE_ID } from "@/lib/site";

const mocks = vi.hoisted(() => ({ useLegalPage: vi.fn(), activeSiteId: "andere-site" }));

vi.mock("@/hooks/useLegalPages", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/hooks/useLegalPages")>()),
  useLegalPage: mocks.useLegalPage,
}));
vi.mock("@/components/SEO", () => ({ default: ({ noIndex }: { noIndex?: boolean }) => <meta data-testid="seo" data-noindex={String(Boolean(noIndex))} /> }));
vi.mock("@/context/SiteContext", () => ({ useSiteContext: () => ({ activeSiteId: mocks.activeSiteId }) }));
// Der Premium-Rahmen (Kopf, Fuß, Formular) wird hier nicht geprüft, nur was die Rechtsseite hineinreicht.
vi.mock("@/components/premium-home/PremiumPage", () => ({
  LegalPage: ({ title, seo, children }: { title: string; seo: ReactNode; children: ReactNode }) => (
    <div data-testid="premium-frame">
      {seo}
      <h1>{title}</h1>
      {children}
    </div>
  ),
}));

const realText = "Echter Rechtstext mit Angaben zum Anbieter, zur Anschrift und zu den Kontaktwegen. ".repeat(5);

const storedPage: LegalPageRecord = {
  id: "page-1",
  slug: "impressum",
  title: "Impressum aus dem CMS",
  seo_title: null,
  seo_description: null,
  body: `<h2>Gespeicherter Abschnitt</h2><p>${realText}</p><script>window.hacked = true</script>`,
  is_published: true,
};

const renderTemplate = () =>
  render(
    <MemoryRouter>
      <LegalPageTemplate slug="impressum" />
    </MemoryRouter>,
  );

const notice = "Der Text dieser Seite ist noch nicht veröffentlicht.";

describe("LegalPageTemplate", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    mocks.activeSiteId = "andere-site";
  });

  // useLegalPage liefert das React-Query-Ergebnis (`data`, `isLoading`), nicht `page`.
  it("zeigt während des Ladens eine Meldung statt abzustürzen", () => {
    mocks.useLegalPage.mockReturnValue({ data: undefined, isLoading: true });
    renderTemplate();
    expect(screen.getByText("Laden...")).toBeInTheDocument();
  });

  it("zeigt den im CMS gespeicherten Titel und Inhalt, bereinigt von Skripten", () => {
    mocks.useLegalPage.mockReturnValue({ data: storedPage, isLoading: false });
    renderTemplate();
    expect(screen.getByRole("heading", { level: 1, name: "Impressum aus dem CMS" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Gespeicherter Abschnitt" })).toBeInTheDocument();
    expect(document.querySelector("script")).toBeNull();
    expect(screen.getByTestId("seo").dataset.noindex).toBe("false");
  });

  it("zeigt keinen Platzhaltertext, wenn das CMS (noch) nichts liefert", () => {
    mocks.useLegalPage.mockReturnValue({ data: undefined, isLoading: false });
    renderTemplate();
    expect(screen.getByRole("heading", { level: 1, name: "Impressum" })).toBeInTheDocument();
    expect(screen.getByText(notice)).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/Bitte pflege/);
    expect(screen.getByTestId("seo").dataset.noindex).toBe("true");
  });

  it("zeigt den Platzhalter aus der Datenbank nicht, auch wenn die Zeile als veröffentlicht markiert ist", () => {
    mocks.useLegalPage.mockReturnValue({ data: { ...storedPage, body: legalPageDefaults.impressum.body }, isLoading: false });
    renderTemplate();
    expect(screen.getByText(notice)).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/Bitte pflege/);
    expect(screen.getByTestId("seo").dataset.noindex).toBe("true");
  });

  it("setzt die Rechtsseite der Digital-Perfect-Site in den Premium-Rahmen", () => {
    mocks.activeSiteId = DEFAULT_SITE_ID;
    mocks.useLegalPage.mockReturnValue({ data: storedPage, isLoading: false });
    renderTemplate();
    expect(screen.getByTestId("premium-frame")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Gespeicherter Abschnitt" })).toBeInTheDocument();
  });
});

describe("isLegalPagePublishable", () => {
  const base = { id: "page-1", is_published: true };

  it("lässt echten, veröffentlichten Text zu", () => {
    expect(isLegalPagePublishable({ ...base, body: `<p>${realText}</p>` })).toBe(true);
  });

  it("sperrt Entwürfe mit offenen Angaben, Platzhalter, zu kurze und nicht veröffentlichte Texte", () => {
    expect(isLegalPagePublishable({ ...base, body: `<p>${realText} [[Telefon: fehlt]]</p>` })).toBe(false);
    expect(isLegalPagePublishable({ ...base, body: `<p>${realText} Bitte pflege diese Seite.</p>` })).toBe(false);
    expect(isLegalPagePublishable({ ...base, body: "<p>Kurz.</p>" })).toBe(false);
    expect(isLegalPagePublishable({ ...base, is_published: false, body: `<p>${realText}</p>` })).toBe(false);
    expect(isLegalPagePublishable({ ...base, id: "fallback-impressum", body: `<p>${realText}</p>` })).toBe(false);
    expect(isLegalPagePublishable(null)).toBe(false);
  });

  it("sperrt alle eingebauten Standardtexte", () => {
    for (const page of Object.values(legalPageDefaults)) {
      expect(isLegalPagePublishable({ ...base, body: page.body })).toBe(false);
    }
  });
});
