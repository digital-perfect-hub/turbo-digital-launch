import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ContactSection from "@/components/ContactSection";
import { defaultContactHomepage } from "@/lib/contact-homepage";
import { DEFAULT_SITE_ID } from "@/lib/site";

const mocks = vi.hoisted(() => ({ insert: vi.fn(), toast: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { from: () => ({ insert: mocks.insert }) } }));
vi.mock("@/context/SiteContext", () => ({ useSiteContext: () => ({ activeSiteId: "00000000-0000-0000-0000-000000000001" }) }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: mocks.toast }) }));
vi.mock("@/hooks/useSiteSettings", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/hooks/useSiteSettings")>(),
  useSiteSettings: () => ({ settings: {}, getSetting: (_key: string, fallback: string) => fallback, getJsonSetting: (_key: string, fallback: unknown) => fallback }),
}));
vi.mock("framer-motion", async (importOriginal) => ({ ...await importOriginal<typeof import("framer-motion")>(), useInView: () => true }));

function fillContact() {
  fireEvent.change(screen.getByLabelText("Name *"), { target: { value: "Test Person" } });
  fireEvent.change(screen.getByLabelText("E-Mail *"), { target: { value: "test@example.com" } });
  fireEvent.change(screen.getByLabelText("Projekt kurz beschreiben *"), { target: { value: "Bestehende Website verbessern" } });
  fireEvent.click(screen.getByRole("checkbox"));
}

describe("Kontakt-Startseite: Projektanfrage", () => {
  beforeEach(() => { cleanup(); vi.clearAllMocks(); mocks.insert.mockResolvedValue({ error: null }); });

  it("nimmt eine Anfrage ohne Paketauswahl und ohne Anliegen an", async () => {
    render(<MemoryRouter><ContactSection contactPage={defaultContactHomepage} /></MemoryRouter>);
    expect(screen.queryByText(/Paket auswählen/)).not.toBeInTheDocument();
    expect(screen.getByRole("combobox")).not.toBeRequired();
    fillContact();
    fireEvent.submit(screen.getByRole("button", { name: defaultContactHomepage.primaryCta }).closest("form")!);
    await waitFor(() => expect(mocks.insert).toHaveBeenCalledWith(expect.objectContaining({ site_id: DEFAULT_SITE_ID, name: "Test Person", email: "test@example.com", service: null, budget: null })));
    expect(await screen.findByText("Vielen Dank!")).toBeInTheDocument();
  });

  it("speichert das gewählte Anliegen als Leistung und niemals als Budget", async () => {
    render(<MemoryRouter><ContactSection contactPage={defaultContactHomepage} /></MemoryRouter>);
    fillContact();
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "KI-Sichtbarkeit" } });
    fireEvent.submit(screen.getByRole("button", { name: defaultContactHomepage.primaryCta }).closest("form")!);
    await waitFor(() => expect(mocks.insert).toHaveBeenCalledWith(expect.objectContaining({ service: "KI-Sichtbarkeit", budget: null })));
  });

  it("behält bei einem Speicherfehler alle Eingaben und zeigt keine Erfolgsbestätigung", async () => {
    mocks.insert.mockResolvedValue({ error: new Error("Test: Speichern fehlgeschlagen") });
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<MemoryRouter><ContactSection contactPage={defaultContactHomepage} /></MemoryRouter>);
    fillContact();
    fireEvent.submit(screen.getByRole("button", { name: defaultContactHomepage.primaryCta }).closest("form")!);
    await waitFor(() => expect(mocks.toast).toHaveBeenCalledWith(expect.objectContaining({ variant: "destructive" })));
    expect(screen.getByLabelText("Name *")).toHaveValue("Test Person");
    expect(screen.queryByText("Vielen Dank!")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: defaultContactHomepage.primaryCta })).toBeEnabled();
    consoleError.mockRestore();
  });
});
