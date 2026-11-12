// Inhalte der Premium-Unterseiten. Nur belegbare Aussagen: keine Preise, keine Fristen, keine Ranking- oder
// Erwähnungsgarantien. Creator-Studio-Funktionen laut PROJEKTSTATUS des Studios (Stand November 2026).

export type PremiumPageData = {
  slug: string;
  interest: string;
  seoTitle: string;
  seoDescription: string;
  kicker: string;
  h1: string[];
  lead: string;
  cta: string;
  visual: "reel" | "terminal" | "cards" | "answer";
  /** Zeigt den dezenten Hinweis auf anspruchsvolle Branchen. */
  discreet?: boolean;
  introTitle: string;
  introText: string;
  tiles: { title: string; text: string }[];
  stepsTitle: string;
  steps: { title: string; text: string }[];
  faqTitle: string;
  faq: { q: string; a: string }[];
  contactTitle: string;
};

export const PREMIUM_PAGES: Record<string, PremiumPageData> = {
  "creator-studio": {
    slug: "creator-studio",
    interest: "Creator Studio: Pilotzugang",
    seoTitle: "Creator Studio: KI-Creator, Bilder, Videos | Digital-Perfect",
    seoDescription:
      "Creator Studio von Digital-Perfect: KI-Creator anlegen, Bilder und Videos erzeugen, Clips schneiden und Beiträge planen. Mit Preis vor jedem Auftrag.",
    kicker: "Creator Studio · in der Pilotphase",
    h1: ["Creator Studio.", "Ein Werkzeug für", "Bilder, Videos, Posts"],
    lead: "Du erfindest eine Person und machst mit ihr immer neue Bilder und Videos. Dazu kommen freie Videos ohne Person, ein Schnittprogramm und ein Kalender für deine Beiträge. Alles läuft im Browser.",
    cta: "Pilotzugang anfragen",
    visual: "reel",
    introTitle: "Was alles drinsteckt.",
    introText: "Statt fünf Programme zu verbinden, arbeitest du in einer Oberfläche. Hier steht, was Creator Studio heute kann.",
    tiles: [
      { title: "Creator, die gleich bleiben", text: "Ein Steckbrief, ein Hauptbild und vier weitere Ansichten legen fest, wie deine Figur aussieht. Jedes neue Bild geht von dort aus." },
      { title: "Bilder in Serie", text: "Neuer Ort, neues Outfit, neue Stimmung. Du schreibst es in eigenen Worten oder nimmst eine Vorlage." },
      { title: "Videos aus Bildern", text: "Aus jedem Bild wird auf Wunsch ein Video. Mehrere KI-Modelle stehen zur Wahl, Länge und Format bestimmst du." },
      { title: "Freie Videos", text: "Videos ohne Person: aus einem Satz oder aus einem eigenen Bild. Für Landschaften, Produkte, Filmszenen." },
      { title: "Szenen und Produktionen", text: "Mehrere Szenen werden zu einem längeren Video, auf Wunsch mit Sprecherstimme und Musik." },
      { title: "Schnittprogramm", text: "Clips kürzen, teilen, ordnen, Musik darunterlegen und als MP4 exportieren. Ohne Zusatzprogramm." },
      { title: "Kalender", text: "Beiträge für Instagram, TikTok, X und Reddit einplanen und die Warteschlange im Blick behalten." },
      { title: "Kosten und Team", text: "Preis vor jedem Auftrag, Limits und Tagesbudget. Dazu Workspaces mit Rollen, wenn mehrere mitarbeiten." },
    ],
    stepsTitle: "",
    steps: [],
    faqTitle: "Häufige Fragen zu Creator Studio",
    faq: [
      { q: "Brauche ich Vorkenntnisse?", a: "Nein. Du beschreibst deine Figur in eigenen Worten, das Studio führt dich Schritt für Schritt vom ersten Bild bis zum fertigen Video." },
      { q: "Sieht mein Creator wirklich immer gleich aus?", a: "Dafür gibt es das Hauptbild und vier weitere Ansichten: Jede neue Szene nutzt dieselben Referenzbilder. KI bleibt KI, deshalb prüfst du jedes Ergebnis selbst, bevor du es verwendest." },
      { q: "Kann mein Creator Tattoos haben?", a: "Im Moment nicht. Tattoos landen bei heutigen KI-Modellen nicht zuverlässig an derselben Stelle, deshalb unterstützt das Studio sie bewusst nicht. Narben, Muttermale und Piercings kannst du angeben." },
      { q: "Geht es auch ohne Creator?", a: "Ja. Freie Videos entstehen aus einem Satz oder aus einem eigenen Bild, ganz ohne Person. Sie landen in derselben Bibliothek und lassen sich schneiden und einplanen." },
      { q: "Postet das Studio automatisch?", a: "Nein. Du planst Beiträge im Kalender, lädst fertige Bilder und Videos herunter und postest sie selbst. Direktes Veröffentlichen auf Instagram ist in Erprobung und passiert nie ohne deine Freigabe." },
      { q: "Was kostet die KI-Erzeugung?", a: "Vor jedem bezahlten Auftrag siehst du den Preis und bestätigst ihn. Limits und ein Tagesbudget verhindern Überraschungen. Was ein Tarif enthält und was ein Bild oder Video kostet, steht im Abschnitt Preise." },
      { q: "Wie bekomme ich Zugang?", a: "Creator Studio ist in der Pilotphase. Schreib uns kurz, was du vorhast, und du bekommst einen Zugang mit persönlicher Einführung." },
    ],
    contactTitle: "Pilotzugang anfragen.",
  },
  leistungen: {
    slug: "leistungen",
    interest: "Webdesign oder Webentwicklung",
    seoTitle: "Leistungen: Webdesign, SEO & GEO | Digital-Perfect",
    seoDescription:
      "Digital-Perfect gestaltet und entwickelt Websites und macht sie sichtbar: technische SEO, lokale Sichtbarkeit, KI-Sichtbarkeit (GEO) und Automatisierung.",
    kicker: "Leistungen · Web, SEO, KI-Sichtbarkeit",
    h1: ["Eine Website,", "die gefunden wird.", "Und Kunden bringt"],
    lead: "Wir gestalten und entwickeln Websites und sorgen dafür, dass sie gefunden werden: bei Google, in deiner Region und in den Antworten von KI-Assistenten. Alles aus einer Hand, mit einem festen Ansprechpartner.",
    cta: "Projekt anfragen",
    visual: "terminal",
    discreet: true,
    introTitle: "Was wir für dich tun.",
    introText: "Sechs Leistungen, die ineinandergreifen. Du kannst sie einzeln beauftragen oder zusammen.",
    tiles: [
      { title: "Premium-Webdesign", text: "Ein Auftritt, der nach dir aussieht und nicht nach Baukasten. Zuerst für das Handy gestaltet, weil dort die meisten Besucher sind." },
      { title: "Webentwicklung", text: "Websites, Shops und Plattformen mit eigener Logik, Kundenkonten und einem Verwaltungsbereich, den du selbst bedienst." },
      { title: "Technische SEO", text: "Wir räumen auf, was Suchmaschinen bremst: Ladezeit, Seitenstruktur, Indexierung und strukturierte Daten." },
      { title: "SEO & lokale Sichtbarkeit", text: "Inhalte, interne Verlinkung und saubere Unternehmensangaben, damit dich Menschen in deiner Region finden." },
      { title: "KI-Sichtbarkeit (GEO)", text: "Immer mehr Menschen fragen ChatGPT statt Google. Wir sorgen dafür, dass KI-Assistenten deine Inhalte lesen und dein Unternehmen richtig einordnen können." },
      { title: "Technik & Automatisierung", text: "Formulare, Benachrichtigungen und Datenflüsse zwischen deinen Systemen. Dazu laufende Betreuung und Monitoring." },
    ],
    stepsTitle: "So arbeiten wir zusammen.",
    steps: [
      { title: "Erstgespräch", text: "Kostenlos. Du erzählst, was du vorhast, wir sagen ehrlich, was sinnvoll ist." },
      { title: "Bestandsaufnahme", text: "Wir sehen uns deine Website, deine Sichtbarkeit und deine Technik an." },
      { title: "Angebot", text: "Du bekommst ein Angebot, in dem klar steht, was enthalten ist." },
      { title: "Umsetzung", text: "Wir setzen um und zeigen dir Zwischenstände, bevor etwas online geht." },
      { title: "Betreuung", text: "Auf Wunsch bleiben wir dran: Technik, Inhalte, Messung." },
    ],
    faqTitle: "Häufige Fragen zu unseren Leistungen",
    faq: [
      { q: "Kann ich auch nur eine einzelne Leistung beauftragen?", a: "Ja. Viele Kunden starten mit einem technischen Audit oder einer neuen Website und entscheiden danach, wie es weitergeht." },
      { q: "Was kostet die Zusammenarbeit?", a: "Das hängt vom Umfang ab. Nach dem kostenlosen Erstgespräch bekommst du ein klares Angebot, in dem steht, was enthalten ist." },
      { q: "Garantiert ihr Rankings oder Nennungen in KI-Antworten?", a: "Nein. Das kann niemand seriös garantieren. Wir beheben, was im Weg steht, und zeigen mit festen Messpunkten, was sich verändert hat." },
      { q: "Betreut ihr auch anspruchsvolle Branchen?", a: "Ja. Wir betreuen auch Projekte, bei denen Werberichtlinien und die Wahl der Anbieter besondere Sorgfalt verlangen. Diskret und auf Anfrage." },
      { q: "Mit wem arbeite ich zusammen?", a: "Direkt mit dem Gründer. Es gibt kein Vertriebsteam und keine wechselnden Ansprechpartner." },
    ],
    contactTitle: "Erzähl uns von deinem Vorhaben.",
  },
  webdesign: {
    slug: "webdesign",
    interest: "Webdesign oder Webentwicklung",
    seoTitle: "Webdesign & Webentwicklung aus Linz | Digital-Perfect",
    seoDescription:
      "Webdesign und Webentwicklung aus Linz: individuelle Websites, Shops und Plattformen, die schnell laden und sich selbst pflegen lassen.",
    kicker: "Webdesign & Entwicklung · aus Linz",
    h1: ["Websites, die", "verkaufen.", "Und schnell laden"],
    lead: "Wir gestalten und entwickeln Websites, Shops und Plattformen, die zu deinem Unternehmen passen. Individuell gebaut, auf dem Handy zuerst gedacht, von Anfang an für Suchmaschinen und KI lesbar.",
    cta: "Projekt anfragen",
    visual: "cards",
    discreet: true,
    introTitle: "Schön allein reicht nicht.",
    introText: "Eine gute Website sieht hochwertig aus, lädt schnell und führt Besucher ohne Umwege zur Anfrage. Darauf bauen wir.",
    tiles: [
      { title: "Individuell statt Baukasten", text: "Kein Template von der Stange. Gestaltung und Technik entstehen für dein Angebot und deine Zielgruppe." },
      { title: "Handy zuerst", text: "Die meisten Besucher kommen mobil. Jede Seite wird zuerst für den kleinen Bildschirm gebaut." },
      { title: "Schnell", text: "Schlanker Code, optimierte Bilder, saubere Ladezeiten. Das merken Besucher und Suchmaschinen." },
      { title: "Auffindbar ab Tag eins", text: "Struktur, Meta-Daten und strukturierte Daten sind Teil des Baus, nicht ein Nachtrag." },
      { title: "Selbst pflegbar", text: "Texte, Bilder und Seiten änderst du im eigenen Verwaltungsbereich, ohne Entwickler." },
      { title: "Shops & Plattformen", text: "Vom Online-Shop bis zum Vergleichsportal: auch Projekte mit Logik, Konten und Zahlungsanbindung." },
    ],
    stepsTitle: "So läuft ein Projekt ab.",
    steps: [
      { title: "Erstgespräch", text: "Kostenlos. Wir klären Ziel, Umfang und was die Seite leisten soll." },
      { title: "Struktur & Konzept", text: "Seitenaufbau, Inhalte und Technik werden festgelegt, bevor gestaltet wird." },
      { title: "Design", text: "Du siehst echte Entwürfe am Bildschirm, nicht nur Skizzen." },
      { title: "Entwicklung", text: "Sauberer Code, Inhalte einpflegen, auf allen Geräten testen." },
      { title: "Start & Betreuung", text: "Livegang, Übergabe und auf Wunsch laufende technische Betreuung." },
    ],
    faqTitle: "Häufige Fragen zum Webdesign",
    faq: [
      { q: "Was kostet eine Website?", a: "Das hängt vom Umfang ab. Nach dem kostenlosen Erstgespräch bekommst du ein klares Angebot, in dem steht, was enthalten ist." },
      { q: "Wie lange dauert ein Projekt?", a: "Das richtet sich nach Umfang und danach, wie schnell Inhalte vorliegen. Im Erstgespräch nennen wir dir einen realistischen Zeitplan." },
      { q: "Kann ich Inhalte später selbst ändern?", a: "Ja. Texte, Bilder und Seiten pflegst du in einem eigenen Verwaltungsbereich." },
      { q: "Übernehmt ihr auch bestehende Websites?", a: "Ja. Wir überarbeiten bestehende Seiten, ziehen sie um oder betreuen sie technisch weiter." },
    ],
    contactTitle: "Erzähl uns von deinem Projekt.",
  },
  "technische-seo": {
    slug: "technische-seo",
    interest: "Technische SEO",
    seoTitle: "Technische SEO: Crawling & Ladezeit | Digital-Perfect",
    seoDescription:
      "Technische SEO von Digital-Perfect: Crawling, Indexierung, Core Web Vitals und strukturierte Daten. Das Fundament für Sichtbarkeit bei Google.",
    kicker: "Technische SEO · Audit und Umsetzung",
    h1: ["Das Fundament,", "auf dem Rankings", "entstehen"],
    lead: "Der beste Inhalt hilft nicht, wenn Suchmaschinen ihn nicht sauber lesen können. Technische SEO sorgt dafür, dass deine Seiten gefunden, verstanden und schnell geladen werden.",
    cta: "Audit anfragen",
    visual: "terminal",
    introTitle: "Was wir prüfen und in Ordnung bringen.",
    introText: "Kein Bauchgefühl, sondern messbare Punkte. Jeder Befund kommt mit einer konkreten Empfehlung.",
    tiles: [
      { title: "Crawling & Indexierung", text: "Welche Seiten Google findet, welche im Index landen und welche unnötig Kraft kosten." },
      { title: "Ladezeit & Core Web Vitals", text: "Wie schnell deine Seiten laden und reagieren, gemessen an den Kennzahlen von Google." },
      { title: "Struktur & interne Links", text: "Eine klare Seitenarchitektur, damit wichtige Inhalte mit wenigen Klicks erreichbar sind." },
      { title: "Strukturierte Daten", text: "Auszeichnungen, die Suchmaschinen und KI-Systemen sagen, worum es auf einer Seite geht." },
      { title: "JavaScript & Rendering", text: "Moderne Web-Apps so ausliefern, dass auch Crawler den vollständigen Inhalt sehen." },
      { title: "Monitoring", text: "Fehler, Weiterleitungen und Ausfälle im Blick behalten, bevor sie Sichtbarkeit kosten." },
    ],
    stepsTitle: "Vom Audit zur Umsetzung.",
    steps: [
      { title: "Audit", text: "Wir prüfen deine Website technisch und sammeln alle Befunde." },
      { title: "Prioritäten", text: "Du bekommst eine Liste, sortiert nach Wirkung und Aufwand." },
      { title: "Umsetzung", text: "Wir setzen die Punkte um oder begleiten dein Entwicklerteam dabei." },
      { title: "Messen", text: "Wir kontrollieren, ob die Änderungen bei Suchmaschinen angekommen sind." },
    ],
    faqTitle: "Häufige Fragen zur technischen SEO",
    faq: [
      { q: "Garantiert ihr bestimmte Rankings?", a: "Nein. Niemand kann Rankings seriös garantieren. Wir beheben technische Hürden und zeigen mit klaren Messpunkten, was sich verändert hat." },
      { q: "Was unterscheidet technische SEO von Inhalten?", a: "Technische SEO sorgt dafür, dass Seiten gefunden, geladen und verstanden werden. Inhalte entscheiden, ob sie die Frage der Suchenden beantworten. Beides gehört zusammen." },
      { q: "Für wen lohnt sich ein technisches Audit?", a: "Für Websites, die trotz guter Inhalte nicht gefunden werden, nach einem Relaunch Sichtbarkeit verloren haben oder technisch gewachsen sind, etwa Shops und Portale." },
      { q: "Wann wirken die Maßnahmen?", a: "Technische Korrekturen wirken, sobald Suchmaschinen die Seiten neu besucht haben. Das kann wenige Tage oder mehrere Wochen dauern." },
    ],
    contactTitle: "Technisches Audit anfragen.",
  },
  "ki-sichtbarkeit": {
    slug: "ki-sichtbarkeit",
    interest: "KI-Sichtbarkeit (GEO)",
    seoTitle: "KI-Sichtbarkeit (GEO) für ChatGPT & Co. | Digital-Perfect",
    seoDescription:
      "KI-Sichtbarkeit (GEO) von Digital-Perfect: die Voraussetzungen, damit ChatGPT, Perplexity und Googles KI-Antworten dein Unternehmen finden können.",
    kicker: "KI-Sichtbarkeit · GEO · AI Visibility",
    h1: ["Wenn KI gefragt", "wird, soll dein", "Name fallen"],
    lead: "Immer mehr Menschen fragen ChatGPT, Perplexity oder Googles KI-Übersichten statt zu googeln. KI-Sichtbarkeit (auch GEO oder AI Visibility) schafft die Voraussetzungen dafür, dass diese Systeme dein Unternehmen finden, richtig einordnen und in ihren Antworten nennen können.",
    cta: "KI-Sichtbarkeit prüfen lassen",
    visual: "answer",
    introTitle: "Woran KI-Systeme sich orientieren.",
    introText: "KI-Antworten entstehen aus Inhalten, die klar, verlässlich und technisch zugänglich sind. Genau dort setzen wir an.",
    tiles: [
      { title: "Für KI lesbar", text: "Klare Seitenstruktur, strukturierte Daten und Inhalte, die auch ohne JavaScript vollständig ankommen." },
      { title: "Zitierfähige Inhalte", text: "Direkte Antworten auf echte Fragen, belegte Fakten, eindeutige Aussagen. So werden Texte zur Quelle." },
      { title: "Eindeutige Marke", text: "Einheitliche Angaben zu Unternehmen, Leistungen und Standort, auf deiner Website und im Web." },
      { title: "Zugang für KI-Crawler", text: "Wir prüfen, ob KI-Crawler deine Inhalte abrufen dürfen und können, und richten das sauber ein." },
      { title: "Messen statt raten", text: "Mit festen Testfragen prüfen wir regelmäßig, ob und wie KI-Assistenten dein Unternehmen nennen." },
      { title: "SEO bleibt die Basis", text: "KI-Systeme greifen auf Suchergebnisse zurück. Technische SEO und KI-Sichtbarkeit arbeiten zusammen." },
    ],
    stepsTitle: "So gehen wir vor.",
    steps: [
      { title: "Bestandsaufnahme", text: "Wie beschreiben KI-Assistenten dein Unternehmen heute? Werden Wettbewerber genannt und du nicht?" },
      { title: "Technik & Struktur", text: "Zugang für Crawler, strukturierte Daten und klare Seitenarchitektur." },
      { title: "Inhalte schärfen", text: "Seiten so aufbauen, dass sie Fragen direkt beantworten und zitiert werden können." },
      { title: "Beobachten", text: "Regelmäßig nachmessen und nachsteuern, weil sich KI-Systeme laufend ändern." },
    ],
    faqTitle: "Häufige Fragen zur KI-Sichtbarkeit",
    faq: [
      { q: "Was bedeutet GEO?", a: "GEO steht für Generative Engine Optimization: die Optimierung für KI-Systeme wie ChatGPT, Perplexity oder Googles KI-Übersichten. Andere Begriffe dafür sind AI Visibility, AEO oder LLMO." },
      { q: "Ersetzt KI-Sichtbarkeit die klassische SEO?", a: "Nein. KI-Systeme stützen sich stark auf Suchergebnisse und gut strukturierte Websites. Eine saubere technische SEO ist die Grundlage, KI-Sichtbarkeit baut darauf auf." },
      { q: "Könnt ihr garantieren, dass ChatGPT uns nennt?", a: "Nein. Die Antworten von KI-Systemen lassen sich nicht garantieren. Wir verbessern die Voraussetzungen und messen nach, was sich verändert." },
      { q: "Wie messt ihr den Erfolg?", a: "Mit festen Testfragen, die wir in regelmäßigen Abständen an mehrere KI-Assistenten stellen, und mit den Zugriffen von KI-Crawlern auf deine Website." },
    ],
    contactTitle: "KI-Sichtbarkeit prüfen lassen.",
  },
};
