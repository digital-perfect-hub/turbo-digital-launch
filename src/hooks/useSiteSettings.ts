import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSiteContext } from "@/context/SiteContext";
import { DEFAULT_SITE_ID } from "@/lib/site";

export type WhyChoosePoint = {
  title: string;
  description: string;
};

export type TrustPointIcon = "users" | "gauge" | "chart" | "shield";
export type TrustPoint = {
  title: string;
  desc: string;
  icon?: TrustPointIcon;
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

export type HeaderAuxLink = {
  label: string;
  url: string;
};

export type HeroProofIcon = "badge" | "chart" | "shield" | "globe";
export type HeroProofItem = {
  icon?: HeroProofIcon;
  text: string;
};

export type ForumTeaserContent = {
  badge: string;
  title: string;
  description: string;
  cta_text: string;
  cta_link: string;
  empty_text: string;
  fallback_author: string;
  fallback_chip: string;
};

export type ForumSidebarContent = {
  categories_title: string;
  categories_description: string;
  support_badge: string;
  support_title: string;
  support_text: string;
  support_button_text: string;
  support_button_link: string;
};

export type ContactTrustSignal = {
  icon: "clock" | "phone" | "mail";
  title: string;
  text: string;
};

export type ContactSectionContent = {
  panel_description: string;
  trust_signals: ContactTrustSignal[];
  labels: {
    name: string;
    company: string;
    email: string;
    phone: string;
    service: string;
    budget: string;
    website: string;
    description: string;
    privacy: string;
  };
  placeholders: {
    name: string;
    company: string;
    email: string;
    phone: string;
    website: string;
    description: string;
    service_placeholder: string;
    budget_placeholder: string;
  };
  service_options: string[];
  budget_options: string[];
  submit_text: string;
  submitting_text: string;
  success_title: string;
  success_text: string;
  success_toast_title: string;
  success_toast_description: string;
  error_toast_title: string;
  error_toast_description: string;
};

export type IntroQuickWinIcon = "layers" | "search" | "zap" | "shield" | "sparkles";
export type IntroQuickWin = {
  icon?: IntroQuickWinIcon;
  title: string;
  text: string;
};

export type FooterContactIcon = "mail" | "map-pin" | "phone" | "clock" | "globe";
export type FooterContactItem = {
  icon?: FooterContactIcon;
  label?: string;
  value: string;
  url?: string;
};

export type ProductDetailUpsellCard = {
  title: string;
  price: string;
  description: string;
};

export type ProductDetailContent = {
  not_found_title: string;
  not_found_text: string;
  not_found_button_text: string;
  back_link_text: string;
  back_link_url: string;
  hero_badge: string;
  price_label: string;
  audience_label: string;
  external_link_text: string;
  demo_badge: string;
  demo_title: string;
  demo_description: string;
  detail_badge: string;
  detail_title: string;
  features_title: string;
  features_empty_text: string;
  benefit_title: string;
  benefit_fallback_text: string;
  upsell_preview_badge: string;
  upsell_preview_title: string;
  upsell_preview_description: string;
  upsell_preview_cards: ProductDetailUpsellCard[];
  checkout_badge: string;
  checkout_description: string;
  upsell_selection_title: string;
  upsell_disabled_text: string;
  upsell_empty_text: string;
  net_label: string;
  tax_label_template: string;
  gross_label: string;
  checkout_loading_text: string;
  stripe_note: string;
  tax_note: string;
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

export const defaultTrustPoints: TrustPoint[] = [
  {
    icon: "users",
    title: "Direkter Draht statt Agentur-Weitergabe",
    desc: "Keine anonymen Ketten, kein verlorenes Briefing. Entscheidungen werden schneller und sauberer umgesetzt.",
  },
  {
    icon: "gauge",
    title: "Premium-Look mit Performance-Fokus",
    desc: "Moderne Wirkung, lesbare Hierarchie und ein Aufbau, der auch mobil hochwertig verkauft.",
  },
  {
    icon: "chart",
    title: "Sichtbarkeit mit wirtschaftlicher Logik",
    desc: "SEO, Conversion und Nutzerführung werden als Business-System gedacht – nicht als Einzelbaustellen.",
  },
  {
    icon: "shield",
    title: "Robuste Struktur statt Zufallsdesign",
    desc: "Fallbacks, klare Sektionen und saubere Komponenten machen die Website belastbar und adminfähig.",
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

export const defaultHeaderAuxLinks: HeaderAuxLink[] = [{ label: "Forum", url: "/forum" }];

export const defaultHeroProofItems: HeroProofItem[] = [
  { icon: "badge", text: "Strukturierte Landingpages statt Flächen-Chaos" },
  { icon: "chart", text: "Conversion, Sichtbarkeit und Performance im selben System" },
  { icon: "shield", text: "Robuste Fallbacks, damit leere Admin-Daten nicht alles zerstören" },
];

export const defaultIntroQuickWins: IntroQuickWin[] = [
  {
    icon: "layers",
    title: "Klarere Angebotsarchitektur",
    text: "Leistungen, Nutzen und Vertrauen werden in eine Reihenfolge gebracht, die Besucher sofort verstehen.",
  },
  {
    icon: "search",
    title: "SEO als Fundament",
    text: "Technische Sauberkeit, sinnvolle Seitenlogik und indexierbare Inhalte statt bloßer Design-Hülle.",
  },
  {
    icon: "zap",
    title: "Schneller zur Anfrage",
    text: "Prägnante Headlines, stärkere CTA-Wege und weniger Reibung vom Einstieg bis zum Kontakt.",
  },
];

export const defaultForumTeaserContent: ForumTeaserContent = {
  badge: "Community Funnel",
  title: "Die aktivsten Diskussionen aus unserem Forum 🚀",
  description: "Hol dir direkt Praxiswissen, Erfahrungen und konkrete Antworten aus der Digital-Perfect Community.",
  cta_text: "Zur Community",
  cta_link: "/forum",
  empty_text: "Praxisnahe Antworten, Insights und Diskussionen aus unserer Community.",
  fallback_author: "Digital-Perfect",
  fallback_chip: "Community Thread",
};

export const defaultForumSidebarContent: ForumSidebarContent = {
  categories_title: "Forum Kategorien",
  categories_description: "Finde schneller die passende Themenwelt für deine Frage oder dein Projekt.",
  support_badge: "Premium Support",
  support_title: "Projektberatung anfragen",
  support_text: "Du willst statt Theorie ein performantes Setup für Webdesign, SEO oder Funnel-Architektur?",
  support_button_text: "Login & Zugang sichern",
  support_button_link: "/login",
};

export const defaultContactSectionContent: ContactSectionContent = {
  panel_description: "Fülle das Formular aus und wir melden uns zeitnah für eine erste, kostenlose Potenzialanalyse.",
  trust_signals: [
    { icon: "clock", title: "Schnelle Rückmeldung", text: "Wir melden uns in der Regel am selben Tag." },
    { icon: "phone", title: "Persönlicher Austausch", text: "Kein Callcenter, direkter Draht zum Experten." },
    { icon: "mail", title: "Klare nächste Schritte", text: "Du bekommst sofort einen sauberen Fahrplan." },
  ],
  labels: {
    name: "Name *",
    company: "Unternehmen",
    email: "E-Mail *",
    phone: "Telefonnummer",
    service: "Was brauchst du? *",
    budget: "Budgetrahmen",
    website: "Aktuelle Webseite (optional)",
    description: "Projekt kurz beschreiben *",
    privacy:
      "Ich bin mit den Datenschutzbestimmungen einverstanden und stimme der Verarbeitung meiner Angaben zur Kontaktaufnahme zu.",
  },
  placeholders: {
    name: "Max Mustermann",
    company: "Muster GmbH",
    email: "max@beispiel.de",
    phone: "+43 664 1234567",
    website: "https://deine-webseite.at",
    description: "Beschreib kurz dein Projekt, Angebot und Ziel ...",
    service_placeholder: "Bitte wählen...",
    budget_placeholder: "Bitte wählen...",
  },
  service_options: [
    "Webdesign / neue Webseite",
    "Onlineshop-Erstellung",
    "Website-Relaunch",
    "Landingpages / Verkaufsseiten",
    "SEO & KI-Sichtbarkeit",
    "Sonstiges / noch unsicher",
  ],
  budget_options: ["unter 2.000 €", "2.000 – 5.000 €", "5.000 – 10.000 €", "über 10.000 €"],
  submit_text: "Anfrage senden",
  submitting_text: "Wird gesendet...",
  success_title: "Vielen Dank!",
  success_text: "Wir haben deine Anfrage erhalten und melden uns in Kürze persönlich bei dir zurück.",
  success_toast_title: "Erfolgreich gesendet!",
  success_toast_description: "Wir melden uns in Kürze bei dir.",
  error_toast_title: "Fehler",
  error_toast_description: "Bitte versuche es erneut.",
};

export const defaultFooterContactItems: FooterContactItem[] = [
  { icon: "mail", label: "E-Mail", value: "info@digital-perfect.at", url: "mailto:info@digital-perfect.at" },
  { icon: "map-pin", label: "Standort", value: "Wien, Österreich" },
];

export const defaultProductDetailContent: ProductDetailContent = {
  not_found_title: "Produkt nicht gefunden",
  not_found_text:
    "Dieses Produkt ist aktuell nicht verfügbar oder der Link ist veraltet. Prüfe den Slug oder geh zurück zur Startseite.",
  not_found_button_text: "Zur Startseite",
  back_link_text: "Zur Produktübersicht",
  back_link_url: "/#shop",
  hero_badge: "Produkt-Landingpage",
  price_label: "Preis",
  audience_label: "Für wen?",
  external_link_text: "Externen Link öffnen",
  demo_badge: "Live-View",
  demo_title: "Sieh das System live in Aktion",
  demo_description: "Direkt im Browser-Mockup. Ohne Sales-Blabla — der Kunde sieht sofort, wie sich das Produkt anfühlt.",
  detail_badge: "Deep-Dive",
  detail_title: "Was genau drin ist",
  features_title: "Leistungsumfang",
  features_empty_text: "Für dieses Produkt wurden noch keine Features gepflegt.",
  benefit_title: "Strategischer Nutzen",
  benefit_fallback_text:
    "Dieses Produkt ist darauf ausgelegt, Conversion, Klarheit und Geschwindigkeit im Vertrieb zu erhöhen — ohne unnötigen Setup-Overhead.",
  upsell_preview_badge: "Upsell-Preview",
  upsell_preview_title: "Erweitere dein System",
  upsell_preview_description:
    "Im Checkout können optionale Erweiterungen direkt mitgewählt werden — perfekt für Pre-Framing bei High-Ticket-Angeboten.",
  upsell_preview_cards: [
    { title: "Community Forum", price: "+99€", description: "Mehr Bindung, schnellere Aktivierung und höhere Kundenloyalität." },
    { title: "Priority Support", price: "+149€", description: "Schnellere Reaktionszeit für Kunden, die keine Reibung tolerieren." },
    { title: "Launch-Paket", price: "+249€", description: "Setup-Hilfe, Assets und Conversion-Feinschliff für einen starken Start." },
  ],
  checkout_badge: "Edge-Checkout",
  checkout_description: "Wähle optionale Erweiterungen direkt hier. Der Checkout wird sicher über Stripe gestartet.",
  upsell_selection_title: "Optional dazubuchen",
  upsell_disabled_text: "Stripe Price ID fehlt — Upsell aktuell nicht aktiv.",
  upsell_empty_text: "Noch keine Upsells gepflegt.",
  net_label: "Netto",
  tax_label_template: "Steuer ({{rate}}%)",
  gross_label: "Brutto gesamt",
  checkout_loading_text: "Checkout wird vorbereitet...",
  stripe_note: "Checkout läuft extern über Stripe — kein fragiles Cart-Management im Frontend.",
  tax_note: "Automatische Steuerberechnung läuft im Stripe Checkout abhängig vom Land des Käufers.",
};

export const defaultSiteText: Record<string, string> = {
  header_topbar_text: "#1 Webdesign & SEO Agentur aus Österreich",
  header_cta_text: "Anfrage starten",
  header_cta_link: "#kontakt",
  home_header_topbar: "#1 Webdesign & SEO Agentur aus Österreich",
  home_intro_badge: "Digital-Perfect",
  home_intro_title: "Webdesign, SEO & Onlineshops: Dein Umsatz-Booster für Österreich & Deutschland.",
  home_intro_body:
    "Viele Unternehmen möchten ihre Webseite erstellen lassen, ein bestehendes Projekt verbessern oder ihr Google-Ranking steigern – wissen aber oft nicht, wo sie starten sollen. DIGITAL-PERFECT unterstützt KMU in Österreich & Deutschland genau dabei: mit modernem Webdesign, performanten Onlineshops und technischem SEO, das wirklich von Suchmaschinen verstanden wird. Wir entwickeln Websites, die schnell laden, sauber strukturiert sind und langfristig sichtbar bleiben. Wir arbeiten nach Analysen, Fakten und Daten – nicht nach Bauchgefühl. Ob neue Seite, Website-Relaunch oder Fragen wie ‚Was kostet eine Homepage?‘ oder ‚Wie lange dauert SEO?‘ – bei uns bekommst du nach der kostenlosen Erstanalyse deiner Website klare, ehrliche Antworten und Lösungen, die zu deinem Unternehmen passen.",
  home_intro_cta_text: "Jetzt starten",
  home_intro_cta_link: "#kontakt",
  home_why_choose_kicker: "Warum Kundinnen & Kunden DIGITAL-PERFECT wählen",
  home_why_choose_title: "Warum Kundinnen & Kunden DIGITAL-PERFECT wählen",
  home_why_choose_body:
    "Wir verschwenden keine Zeit mit endlosen Feedbackschleifen und abstrakten Konzepten. Wir liefern funktionierende digitale Infrastruktur, die Leads generiert und Marken nach vorn bringt.",
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
  home_testimonials_description:
    "Echte Rückmeldungen aus Projekten, Relaunches und laufenden SEO-Setups – direkt aus der Praxis.",
  home_team_kicker: "Team & Verantwortung",
  home_team_title: "Wer hinter Strategie, Design und Performance steht",
  home_team_description:
    "Mehr Vertrauen entsteht, wenn klar ist, wer liefert. Diese Sektion lädt nur sichtbare Teamprofile aus Supabase.",
  home_contact_kicker: "Kontakt",
  home_contact_title: "Kostenloses Erstgespräch anfragen",
  home_contact_description:
    "Erzähl mir kurz von deinem Projekt – Website, Onlineshop oder SEO- & KI-Sichtbarkeit. Ich melde mich persönlich bei dir zurück.",
  home_faq_kicker: "Wissensbasis für KMU",
  home_faq_title: "Du hast Fragen? Wir haben die Antworten!",
  home_trust_kicker: "Vertrauen & System",
  home_trust_title: "Warum dieser Auftritt nicht nur schön, sondern belastbar ist",
  home_trust_description:
    "Struktur, Governance und klare Fallbacks sorgen dafür, dass der Auftritt nicht nur gut aussieht, sondern im Alltag zuverlässig funktioniert.",
  home_hero_secondary_cta_text: "Projekte ansehen",
  home_hero_secondary_cta_link: "#portfolio",
  footer_nav_title: "Navigation",
  footer_legal_title: "Rechtliches",
  footer_contact_title: "Kontakt",
  footer_back_to_top_text: "Back to Top",
  footer_copyright_text: "© {{year}} {{brand}}. Alle Rechte vorbehalten.",
};

const parseJsonSetting = <T,>(value: unknown, fallback: T): T => {
  if (value === null || value === undefined || value === "") return fallback;

  if (typeof value === "object") {
    return value as T;
  }

  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }

  return fallback;
};

export const useSiteSettings = () => {
  const { activeSiteId } = useSiteContext();
  const siteId = activeSiteId || DEFAULT_SITE_ID;

  const { data = [], isLoading } = useQuery({
    queryKey: ["site_settings", siteId],
    enabled: Boolean(siteId),
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("key, value").eq("site_id", siteId);
      if (error) throw error;
      return data;
    },
  });

  const settings = useMemo(
    () =>
      data.reduce<Record<string, unknown>>((acc, item) => {
        acc[item.key] = item.value ?? "";
        return acc;
      }, {}),
    [data],
  );

  const getSetting = (key: string, fallback = "") => {
    const hasKey = Object.prototype.hasOwnProperty.call(settings, key);
    if (hasKey) {
      const value = settings[key];
      if (typeof value === "string") return value ?? fallback;
      if (value === null || value === undefined) return fallback;
      return String(value);
    }
    if (isLoading) return defaultSiteText[key] || fallback;
    return defaultSiteText[key] || fallback;
  };

  const emptyLike = <T,>(fallback: T): T => {
    if (Array.isArray(fallback)) return ([] as unknown) as T;
    if (fallback && typeof fallback === "object") return ({} as unknown) as T;
    return ("" as unknown) as T;
  };

  const getJsonSetting = <T,>(key: string, fallback: T) => {
    const hasKey = Object.prototype.hasOwnProperty.call(settings, key);
    if (!hasKey) return isLoading ? fallback : fallback ?? emptyLike(fallback);
    return parseJsonSetting(settings[key], fallback);
  };

  return {
    isLoading,
    settings,
    getSetting,
    getJsonSetting,
  };
};
