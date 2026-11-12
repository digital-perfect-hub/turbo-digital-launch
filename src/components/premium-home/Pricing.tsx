import { useEffect, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { Depth, Reveal } from "./motion";
import { STUDIO_URL } from "./content";

// Preise von Creator Studio. Auf dieser Seite steht kein einziger Preis im Code: Tarife, Guthaben und Beispielpreise kommen aus der
// öffentlichen Preisliste des Studios, also aus derselben Verwaltung, die auch die App steuert. Gibt das Studio (noch) keine gültige
// Preisliste aus, zeigt die Seite den bisherigen Kostenabschnitt. Nur auf der Vorschau und lokal wird stattdessen die geplante
// Preisliste gezeigt und als geplant gekennzeichnet (`pricing-preview.json`, aus dem Modell des Studios erzeugt).

export interface StudioPlan {
  key: string;
  name: string;
  price_month_cents: number;
  price_year_cents: number;
  credits_month: number;
  creators: number | null;
  features: Record<string, boolean>;
  generation_discount_percent: number;
}

export interface StudioPricing {
  active: boolean;
  plans?: StudioPlan[];
  examples?: Array<{ id: string; credits: number }>;
  packs?: Array<{ price_cents: number; credits: number; bonus_percent: number }>;
}

export type PricingState = { status: "pending" } | { status: "none" } | { status: "ready"; pricing: StudioPricing; planned: boolean };

const CONFIGURED_URL = String(import.meta.env.VITE_STUDIO_PRICING_URL || "").trim();
const PRICING_URL = CONFIGURED_URL || `${STUDIO_URL}/api/public/pricing`;

/** Vorschau und lokale Entwicklung: nur dort darf die geplante Preisliste gezeigt werden. */
export const isPreviewHost = (host: string): boolean => /^preview\./.test(host) || host === "localhost" || host === "127.0.0.1";

/** Eine Preisliste, mit der die Seite etwas anfangen kann: eingeschaltet, mit Tarifen und Beispielpreisen. */
export const usablePricing = (value: unknown): value is StudioPricing => {
  const list = value as StudioPricing | null;
  return typeof list === "object" && list !== null && list.active === true && Array.isArray(list.plans) && list.plans.length > 0 && Array.isArray(list.examples) && list.examples.length > 0;
};

export function usePricing(): PricingState {
  const [state, setState] = useState<PricingState>({ status: "pending" });
  useEffect(() => {
    let live = true;
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 6000);
    const planned = async (): Promise<PricingState> => {
      if (!isPreviewHost(window.location.hostname)) return { status: "none" };
      const module = await import("./pricing-preview.json");
      return usablePricing(module.default) ? { status: "ready", pricing: module.default, planned: true } : { status: "none" };
    };
    // Auf der Vorschau und lokal wird das Studio nur gefragt, wenn eine Adresse dafür gesetzt ist: sonst steht dort die geplante Preisliste.
    const asked = CONFIGURED_URL !== "" || !isPreviewHost(window.location.hostname) ? fetch(PRICING_URL, { signal: controller.signal, headers: { Accept: "application/json" } }).then((response) => (response.ok ? response.json() : null)) : Promise.resolve(null);
    asked
      .then((list) => (usablePricing(list) ? ({ status: "ready", pricing: list, planned: false } as PricingState) : planned()))
      .catch(() => planned().catch(() => ({ status: "none" }) as PricingState))
      .then((next) => {
        if (live) setState(next);
      })
      .finally(() => window.clearTimeout(timer));
    return () => {
      live = false;
      controller.abort();
      window.clearTimeout(timer);
    };
  }, []);
  return state;
}

const count = (value: number): string => value.toLocaleString("de-DE");
export const euro = (cents: number): string => (cents / 100).toLocaleString("de-DE", { style: "currency", currency: "EUR", minimumFractionDigits: cents % 100 === 0 ? 0 : 2, maximumFractionDigits: 2 });

const EXAMPLE_LABELS: Record<string, string> = {
  image: "ein Bild",
  video_5s: "ein Video, 5 Sekunden",
  video_10s: "ein Video, 10 Sekunden",
  reel: "ein Reel aus sechs Clips",
};

/** Was ein Tarif freischaltet, in den Worten der Seite. Kommt aus den Schaltern des Tarifs, nicht aus einer Liste im Code. */
export function planPoints(plan: StudioPlan): string[] {
  const has = (feature: string): boolean => plan.features[feature] === true;
  return [
    plan.creators === null ? "Beliebig viele Creator" : plan.creators === 1 ? "1 Creator" : `${plan.creators} Creator`,
    "Bilder mit gleichbleibender Figur",
    ...(has("video") ? ["Videos und Produktionen aus mehreren Szenen"] : []),
    ...(has("editor") ? ["Schnitt im Browser"] : []),
    ...(has("voiceover") || has("music") ? ["Stimme und Musik"] : []),
    ...(has("products") ? ["Produkte und Produktvideos"] : []),
    ...(has("social") ? ["Planung und Veröffentlichung"] : []),
    ...(plan.generation_discount_percent > 0 ? [`${count(plan.generation_discount_percent)} % günstigere Generierungen`] : []),
    ...(has("byok") ? ["Eigener KI-Schlüssel möglich"] : []),
  ];
}

export const PricingSection = ({ pricing, planned }: { pricing: StudioPricing; planned: boolean }) => {
  const plans = pricing.plans ?? [];
  const examples = pricing.examples ?? [];
  const creditsOf = (id: string): number => examples.find((entry) => entry.id === id)?.credits ?? 0;
  const image = creditsOf("image");
  const clip = creditsOf("video_5s");
  // Was ein Auftrag in einem Tarif kostet, der Generierungen günstiger macht.
  const own = (credits: number, plan: StudioPlan): number => Math.max(1, Math.ceil(credits * (1 - plan.generation_discount_percent / 100)));
  // Der mittlere Tarif ist der, den die meisten brauchen; bei zwei oder weniger Tarifen wird keiner hervorgehoben.
  const top = plans.length >= 3 ? plans[Math.floor(plans.length / 2)]?.key : undefined;
  return (
    <section id="kosten" className="pm-section pm-light pm-cost pv-pricing" aria-labelledby="pm-cost-title">
      <div className="pm-wrap">
        <div className="pm-cost__head">
          <Reveal>
            {planned ? <p className="pv-pricing__planned">Vorschau: geplante Preise, noch nicht gültig</p> : null}
            <p className="pm-kicker">Preise</p>
            <h2 id="pm-cost-title" className="pm-h2">Ein Abo, ein Guthaben, jeder Preis vorher sichtbar.</h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="pm-body">
              Jeder Tarif bringt jeden Monat Credits mit. Ein Credit ist ein Cent. Was ein Bild oder Video kostet, steht vor dem Start da,
              und was du in einem Monat nicht verbrauchst, nimmst du in den nächsten mit.
            </p>
          </Reveal>
        </div>

        <ul className="pv-plans">
          {plans.map((plan, index) => (
            <li key={plan.key}>
              <Depth delay={index * 0.08} className={`pv-plan${plan.key === top ? " pv-plan--top" : ""}`}>
                {plan.key === top ? <span className="pv-plan__badge">Empfohlen</span> : null}
                <h3 className="pv-plan__name">{plan.name}</h3>
                <p className="pv-plan__price">
                  {euro(plan.price_month_cents)}
                  <small>pro Monat, inkl. USt</small>
                </p>
                {plan.price_year_cents > 0 && plan.price_year_cents < plan.price_month_cents * 12 ? (
                  <p className="pv-plan__year">oder {euro(Math.round(plan.price_year_cents / 12))} pro Monat bei jährlicher Zahlung</p>
                ) : null}
                <p className="pv-plan__credits">
                  {count(plan.credits_month)} Credits pro Monat
                  {image > 0 && clip > 0 ? (
                    <span>
                      zum Beispiel {count(Math.floor(plan.credits_month / own(clip, plan)))} Videos oder {count(Math.floor(plan.credits_month / own(image, plan)))} Bilder
                    </span>
                  ) : null}
                </p>
                <ul>
                  {planPoints(plan).map((point) => (
                    <li key={point}>
                      <Check size={15} aria-hidden="true" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </Depth>
            </li>
          ))}
        </ul>

        <div className="pv-pricing__sub">
          <Reveal>
            <h3 className="pv-pricing__title">Was eine Generierung kostet</h3>
          </Reveal>
          <div className="pm-cost__figures">
            {examples.map((example, index) => (
              <Depth key={example.id} delay={index * 0.06} className="pm-figure">
                <p className="pm-figure__value">{count(example.credits)}</p>
                <p className="pm-figure__label">Credits für {EXAMPLE_LABELS[example.id] ?? example.id}</p>
                <p className="pm-figure__note">ab {euro(example.credits)}</p>
              </Depth>
            ))}
          </div>
          <p className="pv-pricing__note">
            Beispiele zum vollen Preis. Modell, Dauer und Auflösung können den Preis ändern; den genauen Betrag zeigt dir das Studio immer,
            bevor etwas startet. Schlägt eine Generierung fehl, bekommst du die Credits zurück.
            {pricing.packs && pricing.packs.length > 0
              ? ` Reicht das Guthaben einmal nicht, kaufst du nach: ${pricing.packs.map((pack) => `${euro(pack.price_cents)} für ${count(pack.credits)} Credits`).join(", ")}. Gekauftes Guthaben gilt drei Jahre.`
              : ""}
          </p>
          <a className="pm-btn pm-btn--ghost pv-pricing__cta" href="#kontakt">
            Zugang anfragen <ArrowRight size={18} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
};
