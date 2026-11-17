import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Login from "@/pages/Login";

const mocks = vi.hoisted(() => ({ signIn: vi.fn(), signUp: vi.fn() }));

vi.mock("@/hooks/useAuth", () => ({ useAuth: () => ({ signIn: mocks.signIn, signUp: mocks.signUp }) }));
vi.mock("@/hooks/useGlobalTheme", () => ({ useGlobalTheme: () => ({ logoUrl: "", settings: {} }) }));
vi.mock("@/components/SEO", () => ({ default: () => null }));

// Die Anmeldeseite bietet keine Registrierung mehr an: Konten entstehen nur auf Einladung.
describe("Anmeldeseite", () => {
  beforeEach(() => {
    mocks.signIn.mockReset();
    mocks.signUp.mockReset();
  });

  it("zeigt nur die Anmeldung und keine Registrierung", () => {
    render(<Login />);
    expect(screen.getByRole("heading", { name: "Admin Login" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Anmelden" })).toBeInTheDocument();
    expect(screen.queryByText(/registrier/i)).toBeNull();
    expect(screen.queryByText(/account/i)).toBeNull();
    expect(screen.getAllByRole("button")).toHaveLength(1);
  });

  it("meldet mit E-Mail und Passwort an und ruft nie die Registrierung auf", async () => {
    mocks.signIn.mockResolvedValue({ error: new Error("falsch") });
    render(<Login />);
    fireEvent.change(screen.getByLabelText("E-Mail"), { target: { value: "person@example.com" } });
    fireEvent.change(screen.getByLabelText("Passwort"), { target: { value: "geheim-123" } });
    fireEvent.click(screen.getByRole("button", { name: "Anmelden" }));
    await waitFor(() => expect(mocks.signIn).toHaveBeenCalledWith("person@example.com", "geheim-123"));
    expect(await screen.findByText("Ungültige Anmeldedaten")).toBeInTheDocument();
    expect(mocks.signUp).not.toHaveBeenCalled();
  });
});
