import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import LegalPageTemplate from "@/components/legal/LegalPageTemplate";
import type { LegalPageRecord } from "@/hooks/useLegalPages";

const mocks = vi.hoisted(() => ({ useLegalPage: vi.fn() }));

vi.mock("@/hooks/useLegalPages", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/hooks/useLegalPages")>()),
  useLegalPage: mocks.useLegalPage,
}));
vi.mock("@/components/SEO", () => ({ default: () => null }));

const storedPage: LegalPageRecord = {
  id: "page-1",
  slug: "impressum",
  title: "Impressum aus dem CMS",
  seo_title: null,
  seo_description: null,
  body: "<h2>Gespeicherter Abschnitt</h2><p>Gespeicherter Inhalt</p><script>window.hacked = true</script>",
  is_published: true,
};

const renderTemplate = () =>
  render(
    <MemoryRouter>
      <LegalPageTemplate slug="impressum" />
    </MemoryRouter>,
  );

describe("LegalPageTemplate", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
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
    expect(screen.getByText("Gespeicherter Inhalt")).toBeInTheDocument();
    expect(document.querySelector("script")).toBeNull();
  });

  it("zeigt den Standardtext der Seite, wenn das CMS (noch) nichts liefert", () => {
    mocks.useLegalPage.mockReturnValue({ data: undefined, isLoading: false });
    renderTemplate();
    expect(screen.getByRole("heading", { level: 1, name: "Impressum" })).toBeInTheDocument();
  });
});
