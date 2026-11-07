// Inhalte der Premium-Startseite. Nur belegte Aussagen: Funktionsumfang und Modelle stammen aus der
// Creator-Studio-Dokumentation (README, PROJEKTSTATUS), die Leistungen aus der Strategie von Digital-Perfect.
// Nicht behauptet werden: Kundenzahlen, Lip-Sync, automatisches Veröffentlichen, Ranking- oder Rechtsgarantien.

export const STUDIO_URL = "https://studio.digital-perfect.com";

export const NAV_LINKS = [
  { label: "Creator Studio", href: "#studio" },
  { label: "Ablauf", href: "#ablauf" },
  { label: "Leistungen", href: "#leistungen" },
  { label: "Branchen", href: "#branchen" },
  { label: "Projekte", href: "#projekte" },
] as const;

// Modellfamilien, die Creator Studio über die Higgsfield-API anspricht (README, Auswahl).
export const MODEL_FAMILIES = [
  "Kling v3.0",
  "Seedance 2.5",
  "MiniMax h3",
  "Soul V2",
  "Ideogram v4.0",
  "Grok Imagine Image 2.0",
  "Qwen Image 3",
  "Z-Image Turbo",
] as const;

export const CONTACT_SHEET = [
  { tone: "ember", crop: "close", title: "Masterbild" },
  { tone: "teal", crop: "mid", title: "Neonpassage" },
  { tone: "violet", crop: "wide", title: "Dachterrasse" },
  { tone: "steel", crop: "mid", title: "Regen, Nacht" },
  { tone: "dawn", crop: "close", title: "Café, früh" },
  { tone: "ember", crop: "wide", title: "Studio" },
] as const;

export const STUDIO_POINTS = [
  {
    label: "Identität",
    title: "Wiedererkennbar statt zufällig",
    text: "Steckbrief, Masterbild und Referenzpaket halten Gesicht, Haare und Stil zusammen, auch über viele Aufträge hinweg.",
  },
  {
    label: "Produktion",
    title: "Szenen statt Einzelbilder",
    text: "Aus Szenen werden Produktionen mit Stimme und Musik. Im Editor wird geschnitten und exportiert.",
  },
  {
    label: "Kontrolle",
    title: "Kosten, bevor sie entstehen",
    text: "Jeder bezahlte Auftrag zeigt vorab, was er kostet. Limits und Tagesbudget bremsen, bevor es teuer wird.",
  },
] as const;

export const PIPELINE = [
  {
    title: "Creator anlegen",
    text: "Steckbrief, Masterbild und Referenzpaket legen die Identität fest.",
    paid: false,
  },
  {
    title: "Szenen erzeugen",
    text: "Bilder und Videos aus Vorlagen oder freiem Prompt, auch Bild zu Video.",
    paid: true,
  },
  {
    title: "Produzieren",
    text: "Szenen zu einer Produktion bündeln, mit Sprecherstimme und Musik.",
    paid: true,
  },
  {
    title: "Schneiden",
    text: "Im Editor kürzen, ordnen und als fertiges Video exportieren.",
    paid: false,
  },
  {
    title: "Planen",
    text: "Beiträge im Kalender einplanen und die Warteschlange im Blick behalten.",
    paid: false,
  },
] as const;

export const CONTROL_SPECS = [
  { key: "Kostenvorschau", value: "Vor jedem bezahlten Auftrag. Gestartet wird erst nach deiner Freigabe." },
  { key: "Limit pro Auftrag", value: "Einstellbar. Voreinstellung: Bild 0,10 $, Video 2,00 $." },
  { key: "Tagesbudget", value: "Einstellbar. Voreinstellung: 10 $ pro Tag, mit Protokoll der Ausgaben." },
  { key: "KI-Konto", value: "Eigenes Higgsfield-Konto: Die KI-Kosten laufen direkt dort und bleiben nachvollziehbar." },
  { key: "Team", value: "Workspaces, Rollen und Einladungen für mehrere Personen." },
  { key: "Schnittstelle", value: "Remote-MCP für KI-Assistenten, in Erprobung." },
  { key: "Status", value: "Pilotphase. Zugang auf Anfrage." },
  { key: "Betreiber", value: "Digital-Perfect, Österreich." },
] as const;

export const SERVICES = [
  {
    title: "Technische SEO",
    text: "Crawling, Indexierung, Ladezeit und saubere Struktur, damit Inhalte überhaupt gefunden werden.",
  },
  {
    title: "Reichweite & Wachstum",
    text: "Inhalte, interne Verlinkung, lokale und KI-Sichtbarkeit. Ohne Ranking-Garantie, mit klaren Messpunkten.",
  },
  {
    title: "Technische Betreuung",
    text: "Updates, Monitoring, Performance und schnelle Hilfe, wenn etwas ausfällt.",
  },
  {
    title: "Webentwicklung, Shops & Plattformen",
    text: "Websites, Shops und Plattformen, individuell gebaut statt aus dem Baukasten.",
    href: "/webagentur-linz",
    hrefLabel: "Webagentur Linz ansehen",
  },
  {
    title: "Automatisierung",
    text: "Wiederkehrende Abläufe automatisieren: Formulare, Benachrichtigungen und Datenflüsse zwischen deinen Systemen.",
  },
  {
    title: "Zahlungsanbieter-Beratung",
    text: "Wir helfen bei der Auswahl passender Shop- und Zahlungsanbieter. Wir sind kein Zahlungsdienstleister und wickeln keine Zahlungen ab.",
  },
] as const;

export const INDUSTRIES = [
  {
    tag: "Regulierter Markt",
    title: "CBD & Hanfprodukte",
    text: "Werbe- und Plattformregeln machen Reichweite schwer. Wir bauen Struktur, Inhalte und Technik so, dass Sichtbarkeit trotzdem wächst.",
    scope: ["Technische SEO", "Shop-Technik", "Anbieterwahl"],
  },
  {
    tag: "Regulierter Markt",
    title: "Legales Cannabis",
    text: "Die Regeln unterscheiden sich je Markt. Wir arbeiten innerhalb dieser Grenzen: saubere Inhalte, technische Betreuung, lokale Sichtbarkeit.",
    scope: ["Lokale Sichtbarkeit", "Inhalte", "Betreuung"],
  },
  {
    tag: "Sensible Plattform",
    title: "Dating & Membership",
    text: "Wachstum für Plattformen mit Abos und sensiblen Inhalten: Performance, technische SEO, Seitenstruktur und passende Zahlungsanbieter.",
    scope: ["Performance", "Technische SEO", "Anbieterwahl"],
  },
] as const;

export const INDUSTRY_NOTE = "Erfahrung, keine Garantien. Keine Rechtsberatung. Kein Zahlungsdienstleister.";

export const PROJECTS = [
  {
    name: "Tiertarif",
    host: "tiertarif.com",
    kind: "Vergleichsportal Tierversicherung",
    image: "/references/digital-perfect-referenz-tierversicherungs-vergleich-tiertarif-com.webp",
    href: "https://tiertarif.com",
  },
  {
    name: "RankScout",
    host: "rank-scout.com",
    kind: "Vergleichsportal Versicherungen",
    image: "/references/digital-perfect-referenz-rank-scout-vergleichsportal-fuer-versicherungen.webp",
    href: "https://rank-scout.com",
  },
  {
    name: "Pudel Schulz",
    host: "pudelschulz.de",
    kind: "Hundemagazin",
    image: "/references/digital-perfect-referenz-pudelschulz-de-hundemagazin.webp",
    href: "https://pudelschulz.de",
  },
  {
    name: "Kraftstamm",
    host: "kraftstamm.at",
    kind: "SEO-Projekt, Österreich",
    image: "/references/digital-perfect-seo-referenz-kraftstamm-oesterreich.webp",
    href: "https://kraftstamm.at",
  },
] as const;

export const FOUNDER = {
  name: "Markus Schulz",
  role: "Gründer, Digital-Perfect",
  image: "/markus-schulz-gruender-ceo-digital-perfect.webp",
  text: "Markus Schulz baut Creator Studio und betreut die Technik dahinter selbst, von der Datenbank bis zur Suchmaschine. Wer anfragt, spricht mit ihm und nicht mit einem Vertriebsteam.",
};

export const INTEREST_OPTIONS = [
  "Creator Studio: Pilotzugang",
  "Technische SEO & Reichweite",
  "Webentwicklung, Shop oder Plattform",
  "Technische Betreuung",
  "Automatisierung",
  "Zahlungsanbieter-Beratung",
  "Etwas anderes",
] as const;
