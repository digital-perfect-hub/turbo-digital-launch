import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { ArrowRight, BadgeCheck, MailCheck, Rocket, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { useSiteContext } from "@/context/SiteContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INTERNAL_SITE_NAME_REGEX = /^(superadmin|default|admin|hub)$/i;

const MaintenanceScreen = () => {
  const location = useLocation();
  const { activeSite, activeSiteId, hostname, resolvedSite } = useSiteContext();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const publicBrandName = useMemo(() => {
    const candidate = activeSite?.name?.trim() || resolvedSite?.name?.trim() || "";
    if (!candidate || INTERNAL_SITE_NAME_REGEX.test(candidate)) {
      return "";
    }
    return candidate;
  }, [activeSite?.name, resolvedSite?.name]);

  const introHeadline = publicBrandName ? `${publicBrandName} wird aktuell überarbeitet.` : "Diese Website wird aktuell überarbeitet.";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      toast.error("Bitte gib eine gültige E-Mail-Adresse ein.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        site_id: activeSiteId,
        name: "Wartelisten-Anmeldung",
        email: normalizedEmail,
        service: "maintenance_waitlist",
        budget: null,
        company: null,
        phone: null,
        website: hostname && hostname !== "localhost" ? `https://${hostname}` : null,
        description: `Maintenance waitlist | Pfad: ${location.pathname}`,
      };

      const { error } = await supabase.from("leads").insert(payload as never);
      if (error) throw error;

      setIsSubmitted(true);
      setEmail("");
      toast.success("Danke – wir melden uns, sobald die Website wieder live ist.");
    } catch (error: any) {
      toast.error(error?.message || "Eintrag fehlgeschlagen. Bitte versuche es erneut.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main
      className="relative left-1/2 right-1/2 min-h-screen w-screen -translate-x-1/2 overflow-hidden"
      style={{
        background:
          "radial-gradient(circle at top right, color-mix(in srgb, var(--theme-primary-hex) 12%, transparent), transparent 34%), linear-gradient(180deg, color-mix(in srgb, var(--theme-bg-main-hex) 94%, white) 0%, var(--theme-bg-main-hex) 100%)",
        color: "var(--theme-text-main-hex)",
      }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, color-mix(in srgb, var(--theme-border-hex) 32%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--theme-border-hex) 28%, transparent) 1px, transparent 1px)",
            backgroundSize: "34px 34px",
            maskImage: "linear-gradient(180deg, rgba(0,0,0,0.58), rgba(0,0,0,0.1))",
          }}
        />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1600px] items-center px-4 py-10 sm:px-6 lg:px-10">
        <div className="grid w-full gap-6 xl:grid-cols-[1.08fr_0.92fr] xl:gap-8">
          <section
            className="premium-card overflow-hidden border p-6 sm:p-8 xl:p-12"
            style={{
              borderColor: "var(--surface-card-border)",
              background: "color-mix(in srgb, var(--surface-card) 90%, white)",
            }}
          >
            <div className="mx-auto flex max-w-fit flex-col items-center gap-2 text-center">
              <span
                className="select-none text-[7rem] leading-none sm:text-[8rem]"
                aria-hidden="true"
                style={{
                  filter: "drop-shadow(0 20px 36px color-mix(in srgb, #0c233b 32%, transparent))",
                }}
              >
                🚧
              </span>
              <span
                className="text-[12px] font-bold uppercase tracking-[0.32em]"
                style={{ color: "var(--theme-text-muted-hex)" }}
              >
                Wir bauen um!
              </span>
            </div>

            <div className="mt-6 max-w-4xl">
              <p className="text-sm font-semibold uppercase tracking-[0.28em]" style={{ color: "var(--theme-text-muted-hex)" }}>
                Wir arbeiten gerade im Hintergrund
              </p>
              <h1 className="mt-4 text-balance text-4xl font-black leading-[0.95] tracking-[-0.05em] sm:text-5xl lg:text-6xl">
                {introHeadline}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 sm:text-lg" style={{ color: "var(--theme-text-muted-hex)" }}>
                Wir optimieren aktuell Inhalte, Struktur und Nutzerführung, damit hier in Kürze ein noch besseres Erlebnis entsteht.
                Vielen Dank für deine Geduld – der Neustart ist bereits in Arbeit.
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                {
                  icon: Rocket,
                  title: "Klarere Inhalte",
                  text: "Seiten, Angebote und Informationen werden übersichtlicher und verständlicher aufbereitet.",
                },
                {
                  icon: ShieldCheck,
                  title: "Besseres Erlebnis",
                  text: "Wir verbessern Struktur, Geschwindigkeit und die mobile Nutzung für einen stärkeren Auftritt.",
                },
                {
                  icon: BadgeCheck,
                  title: "Direkt informiert",
                  text: "Trag dich ein und wir geben dir Bescheid, sobald die Website wieder vollständig erreichbar ist.",
                },
              ].map((item) => (
                <Card key={item.title} className="border-0 bg-transparent shadow-none">
                  <CardContent
                    className="h-full rounded-[1.8rem] border p-5"
                    style={{
                      borderColor: "var(--surface-card-border)",
                      background: "color-mix(in srgb, var(--theme-bg-card-hex) 90%, white)",
                    }}
                  >
                    <item.icon className="h-5 w-5" style={{ color: "var(--theme-primary-hex)" }} />
                    <h2 className="mt-4 text-lg font-bold">{item.title}</h2>
                    <p className="mt-2 text-sm leading-7" style={{ color: "var(--theme-text-muted-hex)" }}>
                      {item.text}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section
            className="premium-dark-card p-6 sm:p-8 xl:p-10"
            style={{
              background:
                "linear-gradient(180deg, color-mix(in srgb, var(--theme-secondary-hex) 92%, black) 0%, color-mix(in srgb, var(--theme-secondary-hex) 78%, #020617) 100%)",
            }}
          >
            <div className="flex h-full flex-col justify-between gap-8">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/84">
                  <BadgeCheck className="h-4 w-4" />
                  Live-Benachrichtigung
                </div>
                <h2 className="mt-5 text-3xl font-black leading-tight text-white sm:text-4xl">
                  Lass dich informieren, sobald alles wieder online ist.
                </h2>
                <p className="mt-4 text-sm leading-7 text-white/72 sm:text-base">
                  Hinterlasse deine E-Mail-Adresse und wir senden dir eine kurze Nachricht, sobald die Website wieder vollständig verfügbar ist.
                </p>
              </div>

              {isSubmitted ? (
                <div className="rounded-[2rem] border border-white/15 bg-white/10 p-6 backdrop-blur-md">
                  <div className="flex items-center gap-3 text-white">
                    <MailCheck className="h-6 w-6" />
                    <div>
                      <p className="text-base font-semibold">Danke – dein Eintrag ist gespeichert.</p>
                      <p className="mt-1 text-sm text-white/70">Wir melden uns, sobald die Website wieder live und vollständig erreichbar ist.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <label htmlFor="maintenance-email" className="text-sm font-semibold text-white">
                      E-Mail-Adresse
                    </label>
                    <Input
                      id="maintenance-email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="name@beispiel.de"
                      className="h-14 rounded-2xl border-white/15 bg-white px-4 text-base text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-white/30"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-14 w-full rounded-2xl border-0 px-6 text-base font-bold text-white shadow-[0_24px_55px_-24px_rgba(255,75,44,0.68)]"
                    style={{ background: "var(--button-primary-bg)" }}
                  >
                    {isSubmitting ? "Eintrag wird gespeichert..." : "Benachrichtigen, sobald es live ist"}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>

                  <p className="text-xs leading-6 text-white/58">
                    Mit deiner Eintragung stimmst du zu, dass wir dir eine kurze Nachricht zum Neustart und relevante Updates zur Website senden dürfen.
                  </p>
                </form>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  "Die Website befindet sich gerade in einer geplanten Überarbeitung.",
                  "Nach dem Neustart informieren wir dich automatisch per E-Mail.",
                ].map((line) => (
                  <div key={line} className="rounded-[1.5rem] border border-white/10 bg-white/6 px-4 py-3 text-sm text-white/76">
                    {line}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default MaintenanceScreen;
