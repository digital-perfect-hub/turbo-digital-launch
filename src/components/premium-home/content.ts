// Inhalte der Premium-Seiten. Nur belegte Aussagen: Funktionsumfang und Modelle stammen aus der
// Creator-Studio-Dokumentation (README, PROJEKTSTATUS), die Leistungen aus der Strategie von Digital-Perfect.
// Nicht behauptet werden: Kundenzahlen, Lip-Sync, automatisches Veröffentlichen, Ranking- oder Rechtsgarantien.

export const STUDIO_URL = "https://studio.digital-perfect.com";

export const NAV_LINKS = [
  { label: "Creator Studio", href: "/creator-studio" },
  { label: "Leistungen", href: "/leistungen" },
  { label: "Projekte", href: "/projekte" },
  { label: "Kontakt", href: "/kontakt" },
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

// Alle Medien wurden am 2026-11-11 in Creator Studio erzeugt (Freigabe Markus Schulz, Budget 20 USD):
// Startbilder mit Grok Imagine Image 2.0 aus den Referenzbildern der Creator, Videos mit MiniMax H3
// (Bild zu Video bzw. Text zu Video). Für das Web neu kodiert, ohne Ton. Originale bleiben im Studio.
const M = "/media/studio";

export const AI_NOTE = "KI-generiert in Creator Studio. Maria, Laura und Maya sind fiktive KI-Figuren.";

export type Film = {
  id: string;
  /** „Creator“ oder „Freies Video“ */
  tag: string;
  /** Name der Figur oder „Ohne Creator“ */
  who: string;
  title: string;
  src: string;
  poster: string;
};

const film = (file: string, tag: string, who: string, title: string): Film => ({
  id: file,
  tag,
  who,
  title,
  src: `${M}/${file}.mp4`,
  poster: `${M}/${file}.webp`,
});

// Hero am Rechner: fünf Filme im Querformat (1920 × 1080, je ca. 8 s). Sie blenden ineinander über und laufen endlos.
export const HERO_WIDE: Film[] = [
  film("hero-maria-see", "Creator", "Maria Noelle", "Abend am Bergsee"),
  film("world-vulkan", "Freies Video", "Ohne Creator", "Vulkan in der Dämmerung"),
  film("hero-laura-neon", "Creator", "Laura Bellame", "Neonnacht in der Stadt"),
  film("world-alpen", "Freies Video", "Ohne Creator", "Alpen im Morgenlicht"),
  film("hero-maria-loft", "Creator", "Maria Noelle", "Nacht im Loft"),
];

// Hero am Telefon: dieselbe Idee im Hochformat (720 × 1280).
export const HERO_TALL: Film[] = [
  film("maria-cafe", "Creator", "Maria Noelle", "Cappuccino am Fenster"),
  film("world-vulkan-tall", "Freies Video", "Ohne Creator", "Vulkan in der Dämmerung"),
  film("laura-strand", "Creator", "Laura Bellame", "Abend am Strand"),
  film("world-alpen-tall", "Freies Video", "Ohne Creator", "Alpen im Morgenlicht"),
  film("maria-gipfel", "Creator", "Maria Noelle", "Morgen über den Wolken"),
];

export type Scene = {
  id: string;
  title: string;
  kind: "video" | "bild";
  /** Video (mp4) oder Bild (webp) */
  src: string;
  poster: string;
  thumb: string;
};

const clip = (file: string, title: string): Scene => ({
  id: file,
  title,
  kind: "video",
  src: `${M}/${file}.mp4`,
  poster: `${M}/${file}.webp`,
  thumb: `${M}/${file}-thumb.webp`,
});

const still = (file: string, title: string): Scene => ({
  id: file,
  title,
  kind: "bild",
  src: `${M}/${file}.webp`,
  poster: `${M}/${file}.webp`,
  thumb: `${M}/${file}-thumb.webp`,
});

// Die Beispiel-Creator aus unserem eigenen Studio. Jede Szene stammt aus denselben Referenzbildern der Figur.
export const CREATORS = [
  {
    id: "maria",
    name: "Maria Noelle",
    line: "Reisen, Mode, Alltag",
    about: "Maria ist unsere erste Figur. Braune Wellen, blaue Augen, Sommersprossen. In jeder Szene wiederzuerkennen, egal ob Café, Berggipfel oder Fotostudio.",
    scenes: [
      clip("maria-cafe", "Cappuccino am Fenster"),
      clip("maria-studio", "Lachen im Studio"),
      clip("maria-gipfel", "Morgen über den Wolken"),
      clip("maria-altstadt", "Abend in der Altstadt"),
      still("maria-see", "Abend am Bergsee"),
      still("maria-loft", "Nacht im Loft"),
    ],
  },
  {
    id: "laura",
    name: "Laura Bellame",
    line: "Fitness, Business, Lifestyle",
    about: "Laura hat langes schwarzes Haar und helle blaue Augen. Sie zeigt, wie dieselbe Figur vom Fitnessstudio ins Büro und an den Strand wechselt.",
    scenes: [
      clip("laura-strand", "Abend am Strand"),
      clip("laura-gym", "Morgens im Studio"),
      clip("laura-buero", "Arbeitstag im Büro"),
      still("laura-neon", "Neonnacht in der Stadt"),
    ],
  },
  {
    id: "maya",
    name: "Maya MaBelle",
    line: "Kochen, Garten, Zuhause",
    about: "Maya ist älter als Maria und Laura und steht für ruhigere Themen: Küche, Garten, ein gutes Buch. Auch das geht mit einem Creator.",
    scenes: [
      clip("maya-kueche", "Frisch aus der Küche"),
      still("maya-garten", "Im Garten"),
      still("maya-lesen", "Lesestunde am Fenster"),
    ],
  },
] as const;

// Freie Videos ohne Creator: ein Satz genügt. Die Beschreibungen geben den englischen Prompt sinngemäß wieder.
export const WORLDS = [
  {
    id: "vulkan",
    title: "Vulkan in der Dämmerung",
    prompt: "Drohnenflug über einen aktiven Vulkan in der Dämmerung, glühende Lavaströme, Rauch von unten beleuchtet",
    src: `${M}/world-vulkan.mp4`,
    poster: `${M}/world-vulkan.webp`,
    thumb: `${M}/world-vulkan-thumb.webp`,
  },
  {
    id: "alpen",
    title: "Alpen im Morgenlicht",
    prompt: "Drohnenflug über die Schweizer Alpen bei Sonnenaufgang, Gletscher, türkiser Bergsee, Nebel im Tal",
    src: `${M}/world-alpen.mp4`,
    poster: `${M}/world-alpen.webp`,
    thumb: `${M}/world-alpen-thumb.webp`,
  },
  {
    id: "wasserfall",
    title: "Wasserfall im Canyon",
    prompt: "Kamerafahrt um einen riesigen Wasserfall in einem moosgrünen Canyon, Gischt mit Regenbogen",
    src: `${M}/world-wasserfall.mp4`,
    poster: `${M}/world-wasserfall.webp`,
    thumb: `${M}/world-wasserfall-thumb.webp`,
  },
  {
    id: "polarlicht",
    title: "Polarlicht über dem Fjord",
    prompt: "Polarlichter in Grün und Violett über einem stillen Fjord, kleine rote Hütte mit warmem Licht",
    src: `${M}/world-polarlicht.mp4`,
    poster: `${M}/world-polarlicht.webp`,
    thumb: `${M}/world-polarlicht-thumb.webp`,
  },
  {
    id: "planet",
    title: "Filmszene: Roter Planet",
    prompt: "Ein Astronaut geht über einen roten Wüstenplaneten auf eine leuchtende Station zu, Staub, zwei Monde",
    src: `${M}/world-planet.mp4`,
    poster: `${M}/world-planet.webp`,
    thumb: `${M}/world-planet-thumb.webp`,
  },
] as const;

// So arbeitest du im Studio: sieben Schritte, so wie die App sie wirklich anbietet (Stand November 2026).
// Planung für Instagram, TikTok, X und Reddit; direktes Veröffentlichen gibt es nur für Instagram und ist in Erprobung.
export const STEPS = [
  {
    key: "creator",
    tab: "Creator",
    title: "Creator erstellen",
    text: "Du beschreibst deine Figur mit eigenen Worten: Alter, Haare, Augen, Stil. Das Studio macht daraus ein Hauptbild und fünf Ansichten, an denen sich später alles orientiert.",
  },
  {
    key: "bilder",
    tab: "Bilder",
    title: "Neue Bilder derselben Person",
    text: "Schreib, was du sehen willst, zum Beispiel „im Café, beiger Mantel“. Heraus kommt ein neues Bild von genau deiner Figur. So oft du willst.",
  },
  {
    key: "szenen",
    tab: "Szenen",
    title: "Szenen gestalten",
    text: "Für ein längeres Video legst du Szenen an: Was passiert, was trägt sie, wie bewegt sie sich. Auf Wunsch mit Sprecherstimme und Musik.",
  },
  {
    key: "videos",
    tab: "Videos",
    title: "Videos aus Bildern und Szenen",
    text: "Ein Klick macht aus einem Bild ein Video. Du wählst Länge und Format und siehst vorher, was es kostet.",
  },
  {
    key: "frei",
    tab: "Frei",
    title: "Freie Videos ohne Creator",
    text: "Nicht jedes Video braucht eine Person. Beschreib eine Landschaft oder eine Filmszene in einem Satz, oder starte mit einem eigenen Bild.",
  },
  {
    key: "schnitt",
    tab: "Schnitt",
    title: "Clips zusammenschneiden",
    text: "Im eingebauten Editor kürzt du Clips, bringst sie in Reihenfolge, legst Musik darunter und exportierst ein fertiges Video.",
  },
  {
    key: "posten",
    tab: "Posten",
    title: "Planen, posten oder herunterladen",
    text: "Fertige Inhalte planst du im Kalender für Instagram, TikTok, X und Reddit ein oder lädst sie herunter. Direktes Posten auf Instagram testen wir gerade.",
  },
] as const;

// Voreinstellungen aus der Kostenkontrolle von Creator Studio, einstellbar je Workspace.
export const COST_BAND = [
  { value: "0,10 $", label: "Limit pro Bild", note: "Voreinstellung, einstellbar" },
  { value: "2,00 $", label: "Limit pro Video", note: "Voreinstellung, einstellbar" },
  { value: "10 $", label: "Tagesbudget", note: "Voreinstellung, mit Protokoll" },
] as const;

export const COST_POINTS = [
  { title: "Preis vor dem Start", text: "Bevor ein Bild oder Video erzeugt wird, siehst du, was es kostet. Erst dein Klick startet den Auftrag." },
  { title: "Grenzen, die du setzt", text: "Ein Limit pro Bild, pro Video und pro Tag. Wird es erreicht, stoppt das Studio, statt weiter Geld auszugeben." },
  { title: "Dein eigenes KI-Konto", text: "Die KI-Kosten laufen über dein eigenes Higgsfield-Konto. Du siehst jede Ausgabe dort und im Protokoll." },
  { title: "Für Teams gemacht", text: "Workspaces, Rollen und Einladungen, wenn mehrere Personen an denselben Creatorn arbeiten." },
] as const;

// Die drei Service-Säulen, je mit eigener Unterseite.
export const PILLARS = [
  { code: "WEB", title: "Webdesign & Entwicklung", text: "Eigenständige Websites, Shops und Plattformen. Individuell gestaltet, sauber gebaut, leicht zu pflegen.", href: "/webdesign", cta: "Webdesign ansehen" },
  { code: "SEO", title: "Technische SEO", text: "Crawling, Indexierung, Ladezeit und Struktur. Die Grundlage, damit Google deine Inhalte überhaupt findet.", href: "/technische-seo", cta: "Technische SEO ansehen" },
  { code: "GEO", title: "KI-Sichtbarkeit", text: "Damit ChatGPT, Perplexity und Googles KI-Antworten dein Unternehmen kennen, verstehen und nennen.", href: "/ki-sichtbarkeit", cta: "KI-Sichtbarkeit ansehen" },
] as const;

// Weitere Leistungen, die es ohne eigene Unterseite gibt.
export const MORE_SERVICES = ["SEO & lokale Sichtbarkeit", "Technische Betreuung & Monitoring", "Automatisierung von Abläufen"] as const;

export const SERVICE_LIST = [
  { title: "Premium-Webdesign", text: "Ein Auftritt, der nach dir aussieht und nicht nach Baukasten. Gestaltet für das Handy zuerst." },
  { title: "Webentwicklung", text: "Websites, Shops und Plattformen mit eigener Logik, Kundenkonten und Verwaltungsbereich." },
  { title: "Technische SEO", text: "Wir räumen auf, was Suchmaschinen bremst: Ladezeit, Struktur, Indexierung, strukturierte Daten." },
  { title: "SEO & lokale Sichtbarkeit", text: "Inhalte, interne Verlinkung und saubere Unternehmensangaben, damit dich Menschen in deiner Region finden." },
  { title: "KI-Sichtbarkeit (GEO)", text: "Wir sorgen dafür, dass KI-Assistenten deine Inhalte lesen können und dein Unternehmen richtig einordnen." },
  { title: "Technik & Automatisierung", text: "Formulare, Benachrichtigungen und Datenflüsse zwischen deinen Systemen. Dazu Betreuung und Monitoring." },
] as const;

export const DISCREET_NOTE = "Wir betreuen auch anspruchsvolle Projekte und Branchen, in denen Werberichtlinien und Anbieterwahl besondere Sorgfalt verlangen. Diskret und auf Anfrage.";

// Beispielablauf eines technischen Audits für das Terminal im Service-Teil (Ablauf, keine Ergebnisse).
export const AUDIT_LINES = [
  { kind: "cmd", text: "$ dp audit --ziel website --tiefe voll" },
  { kind: "step", text: "› crawling ........ seiten, weiterleitungen" },
  { kind: "step", text: "› indexierung ..... was google wirklich sieht" },
  { kind: "step", text: "› ladezeit ........ core web vitals messen" },
  { kind: "step", text: "› struktur ........ daten für suche und ki" },
  { kind: "step", text: "› ki-antworten .... wirst du genannt?" },
  { kind: "done", text: "✓ bericht: konkrete schritte, keine garantien" },
] as const;

export const PROJECTS = [
  {
    name: "Tiertarif",
    host: "tiertarif.com",
    kind: "Vergleichsportal Tierversicherung",
    image: "/references/digital-perfect-referenz-tierversicherungs-vergleich-tiertarif-com.webp",
    href: "https://tiertarif.com",
    text: "Ein Vergleichsportal mit eigenem Rechner, redaktionellen Inhalten und sauberer Technik für Suchmaschinen.",
  },
  {
    name: "RankScout",
    host: "rank-scout.com",
    kind: "Vergleichsportal Versicherungen",
    image: "/references/digital-perfect-referenz-rank-scout-vergleichsportal-fuer-versicherungen.webp",
    href: "https://rank-scout.com",
    text: "Plattform mit vielen Vergleichsseiten, die aus einer gemeinsamen Datenbasis entstehen und sich zentral pflegen lassen.",
  },
  {
    name: "Pudel Schulz",
    host: "pudelschulz.de",
    kind: "Hundemagazin",
    image: "/references/digital-perfect-referenz-pudelschulz-de-hundemagazin.webp",
    href: "https://pudelschulz.de",
    text: "Ein Magazin rund um den Pudel: schnelle Seiten, klare Struktur, Inhalte im Mittelpunkt.",
  },
  {
    name: "Kraftstamm",
    host: "kraftstamm.at",
    kind: "SEO-Projekt, Österreich",
    image: "/references/digital-perfect-seo-referenz-kraftstamm-oesterreich.webp",
    href: "https://kraftstamm.at",
    text: "Technische und inhaltliche Suchmaschinenoptimierung für einen österreichischen Anbieter.",
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
  "Webdesign oder Webentwicklung",
  "Technische SEO",
  "SEO & lokale Sichtbarkeit",
  "KI-Sichtbarkeit (GEO)",
  "Technik & Automatisierung",
  "Etwas anderes",
] as const;
