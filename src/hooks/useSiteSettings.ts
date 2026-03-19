import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type WhyChoosePoint = {
  title: string;
  description: string;
};

export type AudienceItem = {
  emoji: string;
  title: string;
  description: string;
  bullets: string[];
};

export type ProcessStep = {
  step: string;
  time?: string;
  title: string;
  description: string;
};

export type TestimonialItem = {
  name: string;
  role: string;
  text: string;
};

export const defaultWhyChoosePoints: WhyChoosePoint[] = [
  {
    title: "Performance-optimierte Struktur",
    description:
      "Wir setzen auf technische Sauberkeit, Analyse-Daten und klare Conversion-Hierarchien, damit Nutzer sofort verstehen, was sie tun sollen.",
  },
  {
    title: "SEO als langfristiges Wachstumssystem",
    description:
      "Statt nur Keywords zu platzieren, entwickeln wir Suchstrategien, die deiner Website dauerhafte Relevanz in Österreich und Deutschland sichern.",
  },
  {
    title: "Direkte Zusammenarbeit",
    description:
      "Du arbeitest direkt mit Markus Schulz – klare Entscheidungen, klare Kommunikation und schnelle Umsetzung ohne Agentur-Umwege.",
  },
  {
    title: "Systemische Landingpages",
    description:
      "Wir kombinieren Nutzerpsychologie, Content-Struktur und technische Signale, um planbare Anfragen statt Zufallstraffic zu erzeugen.",
  },
  {
    title: "Transparente Optimierung",
    description:
      "Regelmäßige Analysen, klare Reports und fortlaufende Verbesserungen sorgen dafür, dass deine Website wirtschaftlich performt – nicht nur gut aussieht.",
  },
];

export const defaultAudienceItems: AudienceItem[] = [
  {
    emoji: "🛠️",
    title: "Dienstleister & Handwerk",
    description:
      "Unternehmen aus Handwerk, Bau und lokalen Services, die online gefunden werden wollen und klare Wege für Kundenanfragen benötigen.",
    bullets: [
      "Höhere lokale Sichtbarkeit durch klare Web-Signale",
      "Verständliche Leistungsstruktur für schnelle Entscheidungen",
      "Optimierte Kontaktwege für einfache Anfragen",
    ],
  },
  {
    emoji: "💼",
    title: "Berater, Coaches & Expert:innen",
    description:
      "Für Personal Brands und Beratungsmodelle, die Expertise sichtbar machen und planbare Leads aufbauen möchten – ohne komplizierte Systeme.",
    bullets: [
      "Digitale Präsenz, die Vertrauen schafft",
      "Angebote und Inhalte, die deine Zielgruppe präzise abholen",
      "Pages, die Expertise erklären statt nur präsentieren",
    ],
  },
  {
    emoji: "🛒",
    title: "Onlineshops & Marken",
    description:
      "Für Marken und Shop-Betreiber, die eine saubere technische Basis brauchen, um langfristig skalieren zu können.",
    bullets: [
      "Shop-Architektur, die Verkäufe erleichtert",
      "SEO- und Produktstrukturen für nachhaltige Auffindbarkeit",
      "Analysen, die zeigen, wo du Umsatz verlierst und steigerst",
    ],
  },
];

export const defaultProcessSteps: ProcessStep[] = [
  {
    step: "01",
    time: "1 Min.",
    title: "Formular ausfüllen",
    description:
      "Du schickst uns kurz die wichtigsten Infos zu deinem Projekt – schnell, unkompliziert und ohne Verpflichtung.",
  },
  {
    step: "02",
    time: "15 Min.",
    title: "Kostenloser Kennenlern-Call",
    description:
      "Im Kennenlerngespräch klären wir Ziele, Zielgruppe und Budget – und ob wir fachlich und menschlich gut zusammenpassen.",
  },
  {
    step: "03",
    title: "Strategie & Angebot erhalten",
    description:
      "Du bekommst ein transparentes Angebot mit klarer Roadmap, Leistungen und Zeitplan – ohne Kleingedrucktes.",
  },
  {
    step: "04",
    title: "Umsetzung & Optimierung",
    description:
      "Wir setzen deine Website oder deinen Shop technisch sauber um oder optimieren deinen bestehenden Auftritt – mit Fokus auf Performance und SEO.",
  },
];

export const defaultTestimonials: TestimonialItem[] = [
  {
    name: "Marcel M.",
    role: "Event-Manifest",
    text: "Ich bin äußerst zufrieden mit der Zusammenarbeit mit Digital-Perfect. Markus hat meine Seite Event-Manifest komplett von Grund auf aufgebaut – inklusive Logo, SEO-Optimierung und vielen weiteren Details.",
  },
  {
    name: "Fady A.",
    role: "Unternehmensberatung",
    text: "Digital-Perfect betreut uns seit mehreren Monaten im Bereich Webdesign & SEO – modern, effizient und klar ergebnisorientiert. Wir sind sehr zufrieden und würden jederzeit wieder beauftragen.",
  },
  {
    name: "Marcel D.",
    role: "KRAFTSTAMM",
    text: "Wir werden seit über 1,5 Jahren von Markus betreut und sind zu 100 Prozent zufrieden. Unser altes Design war fehlerhaft, langsam und hat trotz hoher Kosten keinerlei Bestellungen gebracht.",
  },
  {
    name: "Hochgatterer GmbH.",
    role: "Logo & Website",
    text: "Die Zusammenarbeit für unser neues Logo und unsere neue Website war von Anfang bis Ende top. Man merkt sofort, dass hier viel Gefühl für Design, Farben und Markenwirkung vorhanden ist.",
  },
  {
    name: "Renate G.",
    role: "Webentwicklung",
    text: "Habe eine SEO-Optimierung sowie Shopify-Shop-Erstellung gekauft. Die Ergebnisse waren sofort zu sehen – Wahnsinn, ich bin sehr zufrieden. Hier ist ein Profi am Werk.",
  },
];

export const defaultSiteText: Record<string, string> = {
  home_header_topbar: "#1 Webdesign & SEO Agentur aus Österreich",
  home_intro_title: "Webdesign, SEO & Onlineshops: Dein Umsatz-Booster für Österreich & Deutschland.",
  home_intro_body:
    "Viele Unternehmen möchten ihre Webseite erstellen lassen, ein bestehendes Projekt verbessern oder ihr Google-Ranking steigern – wissen aber oft nicht, wo sie starten sollen. DIGITAL-PERFECT unterstützt KMU in Österreich & Deutschland genau dabei: mit modernem Webdesign, performanten Onlineshops und technischem SEO, das wirklich von Suchmaschinen verstanden wird. Wir entwickeln Websites, die schnell laden, sauber strukturiert sind und langfristig sichtbar bleiben. Wir arbeiten nach Analysen, Fakten und Daten – nicht nach Bauchgefühl. Ob neue Seite, Website-Relaunch oder Fragen wie ‚Was kostet eine Homepage?‘ oder ‚Wie lange dauert SEO?‘ – bei uns bekommst du nach der kostenlosen Erstanalyse deiner Website klare, ehrliche Antworten und Lösungen, die zu deinem Unternehmen passen.",
  home_why_choose_kicker: "Warum Kundinnen & Kunden DIGITAL-PERFECT wählen",
  home_why_choose_title: "Warum Kundinnen & Kunden DIGITAL-PERFECT wählen",
  home_why_choose_description:
    "Wir entwickeln Websites & Onlineshops auf Basis von Shopify, WooCommerce, WordPress und Webflow – klar strukturiert, technisch sauber und ideal für KMU & Gründer in AT/DE.",
  home_audience_kicker: "Zielgruppen",
  home_audience_title: "Für wen unsere Leistungen gemacht sind",
  home_audience_description:
    "Wir unterstützen Unternehmer:innen, Selbstständige und neue Gründer:innen, die online klar auftreten, professionell sichtbar werden und verlässlich Kunden gewinnen möchten.",
  home_services_kicker: "Unsere Leistungen",
  home_services_title: "Webdesign, das für dich arbeitet. Rund um die Uhr, jeden Tag.",
  home_services_description:
    "Hier findest du einen kompakten Überblick über die wichtigsten Leistungen, die wir anbieten. Für individuelle Anforderungen beraten wir dich gerne persönlich.",
  home_portfolio_kicker: "Ergebnisse, die zählen",
  home_portfolio_title: "Web- und SEO-Projekte aus AT/DE, an denen wir aktuell arbeiten oder die bereits abgeschlossen sind.",
  home_process_kicker: "So funktioniert's",
  home_process_title: "In nur vier einfachen Schritten zu deiner neuen Website, Onlineshop oder SEO-Strategie.",
  home_shop_kicker: "Margen-Booster & Upsell",
  home_shop_title: "Dein Schlüssel zu mehr Vertrauen und Anfragen",
  home_shop_description:
    "Google-Bewertungen sind einer der stärksten Faktoren für lokale Sichtbarkeit – doch die meisten Unternehmen verlieren täglich Potenzial, weil der Weg zu umständlich ist. Unsere NFC- & QR-Bewertungsständer verkürzen den Prozess auf einen einzigen Tap oder Scan und sorgen so in der Praxis für fünf- bis zehnmal mehr Bewertungen.",
  home_testimonials_kicker: "Kundenstimmen",
  home_testimonials_title: "Das sagen unsere Kundinnen & Kunden",
  home_contact_kicker: "Kontakt",
  home_contact_title: "Kostenloses Erstgespräch anfragen",
  home_contact_description:
    "Erzähl mir kurz von deinem Projekt – Website, Onlineshop oder SEO- & KI-Sichtbarkeit. Ich melde mich persönlich bei dir zurück.",
  home_faq_kicker: "Wissensbasis für KMU",
  home_faq_title: "Du hast Fragen? Wir haben die Antworten!",
};

const parseJsonSetting = <T,>(value: string | undefined, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

export const useSiteSettings = () => {
  const { data = [], isLoading } = useQuery({
    queryKey: ["site_settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("key, value");
      if (error) throw error;
      return data;
    },
  });

  const settings = useMemo(
    () =>
      data.reduce<Record<string, string>>((acc, item) => {
        acc[item.key] = item.value || "";
        return acc;
      }, {}),
    [data],
  );

  const getSetting = (key: string, fallback = "") => {
    const hasKey = Object.prototype.hasOwnProperty.call(settings, key);
    if (hasKey) return settings[key] ?? fallback;
    // Only use hardcoded defaults while we don't have DB data yet.
    if (isLoading) return defaultSiteText[key] || fallback;
    return fallback;
  };

  const emptyLike = <T,>(fallback: T): T => {
    if (Array.isArray(fallback)) return ([] as unknown) as T;
    if (fallback && typeof fallback === "object") return ({} as unknown) as T;
    return ("" as unknown) as T;
  };

  const getJsonSetting = <T,>(key: string, fallback: T) => {
    const hasKey = Object.prototype.hasOwnProperty.call(settings, key);
    if (!hasKey) return isLoading ? fallback : emptyLike(fallback);
    return parseJsonSetting(settings[key], fallback);
  };

  return {
    isLoading,
    settings,
    getSetting,
    getJsonSetting,
  };
};
