import { describe, expect, it } from "vitest";
import { resolveSecretKey } from "../../supabase/functions/_shared/supabase-keys";

const env = (values: Record<string, string>) => (name: string) => values[name];

describe("resolveSecretKey", () => {
  it("bevorzugt den neuen Secret Key, solange er vorhanden ist", () => {
    const read = env({ SUPABASE_SECRET_KEYS: '{"default":"neu"}', SUPABASE_SERVICE_ROLE_KEY: "legacy" });
    expect(resolveSecretKey(read)).toBe("neu");
  });

  it("fällt auf den Legacy-Schlüssel zurück, wenn der neue noch nicht bereitgestellt ist", () => {
    expect(resolveSecretKey(env({ SUPABASE_SERVICE_ROLE_KEY: "legacy" }))).toBe("legacy");
  });

  it("fällt bei ungültigem JSON auf den Legacy-Schlüssel zurück", () => {
    expect(resolveSecretKey(env({ SUPABASE_SECRET_KEYS: "kein json", SUPABASE_SERVICE_ROLE_KEY: "legacy" }))).toBe("legacy");
  });

  it("fällt zurück, wenn der gewünschte Schlüsselname fehlt oder leer ist", () => {
    expect(resolveSecretKey(env({ SUPABASE_SECRET_KEYS: '{"billing":"neu"}', SUPABASE_SERVICE_ROLE_KEY: "legacy" }))).toBe("legacy");
    expect(resolveSecretKey(env({ SUPABASE_SECRET_KEYS: '{"default":"  "}', SUPABASE_SERVICE_ROLE_KEY: "legacy" }))).toBe("legacy");
  });

  it("liest einen benannten Schlüssel", () => {
    const read = env({ SUPABASE_SECRET_KEYS: '{"default":"a","billing":"b"}' });
    expect(resolveSecretKey(read, "billing")).toBe("b");
  });

  it("ohne Rückfall: nutzt den neuen Schlüssel, liefert aber nie den Legacy-Schlüssel", () => {
    const strict = { allowLegacyFallback: false };
    expect(resolveSecretKey(env({ SUPABASE_SECRET_KEYS: '{"default":"neu"}', SUPABASE_SERVICE_ROLE_KEY: "legacy" }), "default", strict)).toBe("neu");
    expect(resolveSecretKey(env({ SUPABASE_SERVICE_ROLE_KEY: "legacy" }), "default", strict)).toBeUndefined();
    expect(resolveSecretKey(env({ SUPABASE_SECRET_KEYS: "kein json", SUPABASE_SERVICE_ROLE_KEY: "legacy" }), "default", strict)).toBeUndefined();
  });

  it("liefert nichts, wenn keine Variable gesetzt ist", () => {
    expect(resolveSecretKey(env({}))).toBeUndefined();
  });
});
