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

// Echte Ergebnisse aus Creator Studio: Szenen der fiktiven Figur „Maria Noelle“, mit den Modellen erzeugt, die
// im Auftragsverlauf stehen (Bild zu Video). Freigabe zur Verwendung auf der Startseite: Markus Schulz, 2026-11-07.
// Die Dateien sind für das Web neu kodiert (720 × 1280, ohne Ton). Originale und Zugriffe bleiben im Studio.
const MEDIA = "/media/maria";

export const MARIA_DISCLOSURE = "KI-generiert in Creator Studio. Maria Noelle ist eine fiktive Figur.";

// Hero-Film für den Rechner (16:9, 8 s, ohne Ton): Startbild mit Grok Image 2.0, daraus Bild zu Video mit Kling 3.0 Pro.
// Beides am 2026-11-07 in Creator Studio mit Maria Noelle erzeugt (Kostenvorschau Studio: 0,09 $ Bild, 0,90 $ Video).
export const HERO_FILM = {
  title: "Dämmerung auf dem Dach",
  model: "Kling v3.0 Pro · Bild zu Video",
  seconds: 8,
  src: `${MEDIA}/hero-dach.mp4`,
  poster: `${MEDIA}/hero-dach-poster.webp`,
} as const;

// Neue Standbilder derselben Figur (Grok Image 2.0, 2026-11-07): je anderer Ort, anderes Licht, andere Kleidung.
// „dach“ ist ein Hochformat-Ausschnitt aus dem Hero-Film.
export const STILLS = {
  cafe: { title: "Café am Fenster", src: `${MEDIA}/still-cafe.webp` },
  donau: { title: "Donau-Promenade", src: `${MEDIA}/still-donau.webp`, thumb: `${MEDIA}/still-donau-thumb.webp` },
  neon: { title: "Neonnacht", src: `${MEDIA}/still-neon.webp`, thumb: `${MEDIA}/still-neon-thumb.webp` },
  see: { title: "Frühnebel am See", src: `${MEDIA}/still-see.webp`, thumb: `${MEDIA}/still-see-thumb.webp` },
  dach: { title: HERO_FILM.title, src: `${MEDIA}/still-dach.webp`, thumb: `${MEDIA}/still-dach-thumb.webp` },
} as const;

export const REEL_SCENES = [
  {
    id: "luft",
    label: "Luft",
    title: "Sprung über den Alpen",
    model: "Wan 3.0 · Bild zu Video",
    seconds: 10,
    src: `${MEDIA}/reel-luft.mp4`,
    poster: `${MEDIA}/poster-luft.webp`,
    thumb: `${MEDIA}/poster-luft-thumb.webp`,
  },
  {
    id: "studio",
    label: "Studio",
    title: "Nahaufnahme im Studio",
    model: "Wan 3.0 · Bild zu Video",
    seconds: 9,
    src: `${MEDIA}/reel-studio.mp4`,
    poster: `${MEDIA}/poster-studio.webp`,
    thumb: `${MEDIA}/poster-studio-thumb.webp`,
  },
  {
    id: "fluss",
    label: "Fluss",
    title: "Trittsteine im Fluss",
    model: "Kling v3.0 Pro · Bild zu Video",
    seconds: 8,
    src: `${MEDIA}/reel-fluss.mp4`,
    poster: `${MEDIA}/poster-fluss.webp`,
    thumb: `${MEDIA}/poster-fluss-thumb.webp`,
  },
  {
    id: "wald",
    label: "Wald",
    title: "Waldweg im Gegenlicht",
    model: "Kling v3.0 Standard · Bild zu Video",
    seconds: 7,
    src: `${MEDIA}/reel-wald.mp4`,
    poster: `${MEDIA}/poster-wald.webp`,
    thumb: `${MEDIA}/poster-wald-thumb.webp`,
  },
] as const;

// Kontaktbogen: dieselbe Person in fünf Szenen. Bei „video“ spielt die Kachel stumm, sobald sie sichtbar ist.
export const CONTACT_SHEET = [
  { title: "Luft", meta: "Video · Wan 3.0", kind: "video", src: REEL_SCENES[0].src, poster: `${MEDIA}/still-luft-gesicht.webp` },
  { title: "Café", meta: "Standbild · Grok Image 2.0", kind: "still", poster: STILLS.cafe.src },
  { title: "Studio", meta: "Video · Wan 3.0", kind: "video", src: REEL_SCENES[1].src, poster: `${MEDIA}/still-studio-lauf.webp` },
  { title: "Fluss", meta: "Video · Kling v3.0 Pro", kind: "video", src: REEL_SCENES[2].src, poster: `${MEDIA}/still-fluss.webp` },
  { title: "Wald", meta: "Video · Kling v3.0 Standard", kind: "video", src: REEL_SCENES[3].src, poster: REEL_SCENES[3].poster },
] as const;

export const SHEET_CAPTION = "Echte Ergebnisse aus Creator Studio: eine Figur, fünf Szenen, vier davon als Video. Maria Noelle ist eine fiktive KI-Figur.";

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
    image: `${MEDIA}/poster-studio.webp`,
  },
  {
    title: "Szenen erzeugen",
    text: "Bilder und Videos aus Vorlagen oder freiem Prompt, auch Bild zu Video.",
    paid: true,
    image: STILLS.donau.src,
  },
  {
    title: "Produzieren",
    text: "Szenen zu einer Produktion bündeln, mit Sprecherstimme und Musik.",
    paid: true,
    image: STILLS.neon.src,
  },
  {
    title: "Schneiden",
    text: "Im Editor kürzen, ordnen und als fertiges Video exportieren.",
    paid: false,
    image: STILLS.dach.src,
  },
  {
    title: "Planen",
    text: "Beiträge im Kalender einplanen und die Warteschlange im Blick behalten.",
    paid: false,
    image: STILLS.see.src,
  },
] as const;

export const PIPELINE_CAPTION = "Bilder: echte Szenen von Maria Noelle, erzeugt in Creator Studio.";

// Voreinstellungen aus der Kostenkontrolle von Creator Studio (siehe CONTROL_SPECS), einstellbar je Workspace.
export const COST_BAND = [
  { value: "0,10 $", label: "Limit pro Bild", note: "Voreinstellung, einstellbar" },
  { value: "2,00 $", label: "Limit pro Video", note: "Voreinstellung, einstellbar" },
  { value: "10 $", label: "Tagesbudget", note: "Voreinstellung, mit Protokoll" },
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
    icon: "search",
    code: "SEO.CRAWL",
    title: "Technische SEO",
    text: "Crawling, Indexierung, Ladezeit und saubere Struktur, damit Inhalte überhaupt gefunden werden.",
  },
  {
    icon: "growth",
    code: "REACH.GROW",
    title: "Reichweite & Wachstum",
    text: "Inhalte, interne Verlinkung, lokale und KI-Sichtbarkeit. Ohne Ranking-Garantie, mit klaren Messpunkten.",
  },
  {
    icon: "care",
    code: "OPS.WATCH",
    title: "Technische Betreuung",
    text: "Updates, Monitoring, Performance und schnelle Hilfe, wenn etwas ausfällt.",
  },
  {
    icon: "code",
    code: "BUILD.SHOP",
    title: "Webentwicklung, Shops & Plattformen",
    text: "Websites, Shops und Plattformen, individuell gebaut statt aus dem Baukasten.",
    href: "/webagentur-linz",
    hrefLabel: "Webagentur Linz ansehen",
  },
  {
    icon: "flow",
    code: "AUTO.FLOW",
    title: "Automatisierung",
    text: "Wiederkehrende Abläufe automatisieren: Formulare, Benachrichtigungen und Datenflüsse zwischen deinen Systemen.",
  },
  {
    icon: "pay",
    code: "PAY.ROUTE",
    title: "Zahlungsanbieter-Beratung",
    text: "Wir helfen bei der Auswahl passender Shop- und Zahlungsanbieter. Wir sind kein Zahlungsdienstleister und wickeln keine Zahlungen ab.",
  },
] as const;

// Beispielablauf eines technischen Audits für das Terminal im Service-Teil (Ablauf, keine Ergebnisse).
export const AUDIT_LINES = [
  { kind: "cmd", text: "$ dp audit --ziel shop --markt high-risk" },
  { kind: "step", text: "› crawling ........ seiten, weiterleitungen" },
  { kind: "step", text: "› indexierung ..... was google wirklich sieht" },
  { kind: "step", text: "› ladezeit ........ core web vitals messen" },
  { kind: "step", text: "› zahlungswege .... passende anbieter abgleichen" },
  { kind: "step", text: "› plattformregeln . risiken markieren" },
  { kind: "done", text: "✓ bericht: konkrete schritte, keine garantien" },
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
