# Digital-Perfect-Hub — Fortschritts-Log

Git-versioniertes Protokoll für Sessions, Entscheidungen und offene Baustellen. Für Menschen und jede Claude-Session sofort lesbar, ohne extra Tool-Zugriff. Ergänzt das automatische Claude-Gedächtnis (siehe CLAUDE.md → „Kontinuität zwischen Sessions"), ersetzt es nicht.

Neueste Einträge oben. Format: Datum, was gemacht/entschieden wurde, warum, was offen ist.

---

## 2026-11-11 — Premium-Website v4: Farbsystem, endloser Hero, 7-Schritte-Ablauf, vier Unterseiten (Branch design/premium-home, nur Vorschau)

**Auftrag Markus:** v3 konsequent weiterentwickeln: Blau-Schwarz mit eleganten Weißflächen, Orange nur als Akzent, grelle Preisfläche neu, Hero-Videos dürfen nie stehen bleiben (Mobile-Autoplay), Creator Studio einfach erklären (70 %), Web/SEO/KI-Sichtbarkeit klar positionieren (30 %), High-Risk nur dezent, Unterseiten erlaubt. Kein Push/Deploy ohne Freigabe.

- **Farben:** Grundton Blau-Schwarz (`#070b15`), helle Flächen `.pm-light` (kühles Weiß, weiße Karten), Orange nur noch für Buttons, Kicker und kleine Akzente; Glühflächen und Schatten sind blau. Dritte Hero-Zeile als Kontur statt orange Fläche.
- **Hero (`Reel.tsx`):** Videos laufen endlos. Rechner: `HERO_FILMS` wechselt automatisch mit Überblendung (derzeit ein 16:9-Film, der weich von vorn beginnt; weitere Filme nur in `content.ts` ergänzen). Telefon: vier Hochformat-Clips im Wechsel. Autoplay: `muted`/`playsinline` zusätzlich als Attribute, `autoPlay` am ersten Clip; blockiert der Browser, fährt das Standbild langsam (Ken Burns) und die erste Berührung startet; Rückkehr in den Tab und hängende Clips (6 s) werden abgefangen.
- **Startseite:** Hero → Modellband → „Von der Idee zum fertigen Post. In sieben Schritten.“ (hell, anklickbar, läuft von selbst) → Kontaktbogen/Oberfläche → Kosten (hell, ersetzt orange Fläche und die Kontrolle-Liste) → Agenturteil mit Terminal und drei Säulen (Webdesign, technische SEO, KI-Sichtbarkeit) → Projekte (hell) → Gründer → Formular. Branchen-Dossiers entfernt; nur noch ein dezenter Satz zu anspruchsvollen Branchen (Startseite und /webdesign).
- **Unterseiten** (nur Digital-Perfect-Site, über Route `/:slug` in `PremiumOrDynamicPage.tsx`, alle anderen Slugs/Sites weiter `DynamicPage`): `/creator-studio`, `/webdesign`, `/technische-seo`, `/ki-sichtbarkeit`. Inhalte in `premium-home/pages.ts`, Vorlage `PremiumPage.tsx` (Hero mit eigenem Visual, Kacheln, Ablauf, FAQ mit FAQPage-Schema, Service-/SoftwareApplication-Schema, Formular mit Themen-Vorauswahl). Keine Preise, Fristen oder Garantien.
- **Navigation:** Kopf, Befehlspalette und Telefon-Tab-Leiste führen jetzt auf die Seiten (`Shell.tsx`, `AppShell.tsx`). Formular-Thema neu: „KI-Sichtbarkeit (GEO)“.
- **Fakten Creator Studio** (aus dessen PROJEKTSTATUS): Planung für Instagram, TikTok, X, Reddit; Veröffentlichen nur Instagram, in Erprobung, nie ohne Freigabe. So steht es auf der Seite („posten oder herunterladen“).
- **Geprüft:** `tsc` ohne Fehler in den neuen Dateien (die Fehler in `App.tsx` Zeile 147–150 bestanden schon vorher), ESLint 0 Fehler, `vite build` grün; Browser lokal Desktop 1440 (Start + vier Unterseiten) und Telefon 390 (kein seitliches Überlaufen, Clip läuft stumm/inline). Screenshots `v4-*` in `TURBO-DIGITAL-LAUNCH_Startseite-Vorschau/`.
- **Offen:** (1) Die neuen Seiten stehen nicht in der Sitemap (Edge Function `generate-sitemap` liest nur die Datenbank) und nicht im Admin-CMS (Texte in `pages.ts`). (2) Meta-Titel der Startseite kommt weiter aus der Datenbank („SEO & Webdesign Agentur Linz“). (3) Medien-Ersatz (fünf Szenen, zwei weitere 16:9-Hero-Filme) braucht Kostenfreigabe. (4) Echtes iPhone/Safari nicht getestet. (5) Commit, Push, Vorschau-Deploy nur nach GO.

---

## 2026-11-11 — Premium-Startseite v3: App-Gefühl und „Deep-Web“-Service-Teil (Branch design/premium-home, nur Vorschau)

**Auftrag Markus:** Premium-Startseite konsequent verbessern (70 % Creator Studio, 30 % Webdesign/SEO mit High-Risk-Wirkung), Webapp-Gefühl, Mobile First; direkt umsetzen, kein Push/Deploy.

- **App-Schale** (`premium-home/AppShell.tsx`): aktive Sektion in der Navigation (Scrollspy), Befehlspalette mit Strg/⌘ + K und Suchfeld im Kopf (ab 1180 px), auf dem Telefon eine Tab-Leiste unten (ab Ende des Hero, verschwindet am Formular; Support-Knopf wird darüber gehoben).
- **Service-Teil als dunkle Ops-Konsole** (`premium-home/OpsSection.tsx`): ersetzt die helle Papierfläche. Überschrift „entschlüsselt“ sich beim Sichtbarwerden, Terminal tippt einen Beispielablauf eines Audits (ausdrücklich als Beispiel, keine Garantien), sechs Leistungen als Module mit Code (`SVC/01 · SEO.CRAWL`). Inhalte und Link „Webagentur Linz“ unverändert.
- **Branchen als Dossiers:** Aktennummer, „Restricted“-Stempel, geschwärzte Schwerpunkte, die sich beim Sichtbarwerden freilegen. Hinweis „keine Garantien, keine Rechtsberatung, kein Zahlungsdienstleister“ bleibt.
- **Formular:** Thema als Auswahlchips statt Dropdown. Buttons und Befehlspalette wählen das Thema vor („Pilot anfragen“, „Projekt anfragen“). Gleiche Felder in `leads` wie vorher.
- Gemeinsame Bausteine in `premium-home/motion.tsx` (Reveal, Decrypt, useInViewOnce). Reduzierte Bewegung wird respektiert, Screenreader lesen die fertigen Überschriften.
- **Geprüft:** `tsc` ohne Fehler in premium-home, ESLint 0 Fehler (nur Fast-Refresh-Hinweise), `vite build` grün, Browser lokal Desktop 1440 und Telefon 390 (kein seitliches Überlaufen, Palette und Vorauswahl funktionieren). Screenshots `v3-*` in `TURBO-DIGITAL-LAUNCH_Startseite-Vorschau/`.
- **Lokal:** `.env.local` (ignoriert) mit dem öffentlichen Publishable Key, weil die `.env` noch den seit 11.11. deaktivierten Legacy-Schlüssel enthält und die Seite lokal sonst bei 99 % hängen bleibt.
- **Stand:** Commit und Vorschau-Deploy nach GO von Markus (11.11.), Live unverändert; Markus' eigene uncommittete Änderungen (Header.tsx, ContactHomepage.tsx, index.css, contact-homepage.css, src.zip) nicht mit einchecken.

---

## 2026-11-07 — Higgsfield-Medien (Kostenfreigabe A+B, max. 5,00 USD) und Desktop-Hero-Film (Branch design/premium-home, nur Vorschau)

**Auslöser:** Ausdrückliche Kostenfreigabe von Markus: Paket A (16:9-Startbild plus ca. 8-s-Video, Maria Noelle) und Paket B (vier neue Maria-Bilder), Gesamtlimit 5,00 USD inkl. Wiederholungen, Einzelbild höchstens 0,10 USD, Kostenvorschau vor jedem Auftrag, keine Änderung der Studio-Budgeteinstellungen. Paket C ausdrücklich nicht freigegeben.

### Erzeugt (im Creator Studio, Creator Maria Noelle, angemeldete Sitzung von Markus)
- Fünf Bilder mit Grok Image 2.0, je Kostenvorschau und Studio-Schätzung 0,09 $: Donau-Promenade (9:16), Café am Fenster (3:4), Neonnacht (9:16), Frühnebel am See (2:3), Hero-Startbild Dach (16:9). Referenzen je Bild: Master, 3/4, Ganzkörper (bei fünf Referenzen lag die Schätzung bei 0,11 $, also über dem Bildlimit; die Auswahl wurde nur für diese Bilder reduziert, keine Studio-Einstellung geändert).
- Ein Video mit Kling 3.0 Pro (Bild zu Video aus dem Hero-Startbild), 8 s, 1920 × 1080, ohne Ton: Kostenvorschau und Studio-Schätzung 0,90 $.
- Summe laut Studio: 1,35 $ (Kopfzeile „Heute geschätzt“ und Bibliothek). Das Studio kennt den von Higgsfield tatsächlich abgerechneten Betrag nicht (Feld „Abgerechnet laut Higgsfield“ war leer und blieb leer); die Abrechnung lässt sich nur im Higgsfield-Konto prüfen.
- Keine Wiederholungen nötig, keine weiteren Aufträge. Es wurden keine Studio-Einstellungen geändert.

### Nutzungsbedingungen Higgsfield (gelesen 2026-11-07)
- Terms of Use („Last updated: October 23, 2026“, Abschnitt 4.4): Higgsfield beansprucht kein Eigentum an Outputs und schränkt die kommerzielle Nutzung nicht ein, ohne Bindung an einen Tarif. Pflichten: Outputs nicht für KI-Training verwenden (5.2 iv), nicht als menschlich erzeugt ausgeben (5.2 xi, 11.7), KI-Kennzeichnung, wo gesetzlich verlangt (5.5). Die Seite trägt die Kennzeichnung „KI-generiert in Creator Studio. Maria Noelle ist eine fiktive Figur.“
- Offen/unklar: Drittmodell-Richtlinien (Abschnitt 8: bei Konflikt gilt die strengere, Anbieter werden nicht genannt), Wasserzeichen-Regel nur im Help Center, Abgrenzung App-Betrieb und „service bureau“ (1.2 vs. 11.5), Freistellung nur im Enterprise-Tarif laut Help Center. Gilt für die schon eingebundenen Maria-Clips gleichermaßen.

### Umgesetzt
- **Desktop-Hero (ab 1024 px):** `HeroFilm` in `Reel.tsx`: 16:9-Film füllt den Hero, linke Bildhälfte dunkel für den Text, Abdunklung von links, oben (Navigation) und unten (Übergang zum Modellband). Der Film läuft einmal (8 s) und bleibt auf dem letzten Bild stehen. Bedienleiste unten rechts mit Szenenname, Modell, KI-Kennzeichnung, Zeitmarke und Abspielen/Pause/Wiederholen. Bei reduzierter Bewegung, Datenspar-Modus oder blockiertem Autoplay bleibt das erste Bild und der Film wird erst auf Knopfdruck geladen. Unter 1024 px unverändert: Vollbild-Showreel aus den vier Hochformat-Szenen.
- **Neue Motive statt Wiederholung:** Kontaktbogen (Kachel „Café“ statt doppeltem „Nahaufnahme“-Standbild), Studio-Monitor (Szenen: Dach, Donau, Neon, See), Ablauf-Filmstreifen (Donau, Neon, Hochformat-Ausschnitt aus dem Hero-Film, See; Schritt 1 bleibt die Nahaufnahme).
- Medien in `public/media/maria/`: `hero-dach.mp4` (2,3 MB, H.264, ohne Ton), `hero-dach-poster.webp`, `still-{cafe,donau,neon,see,dach}.webp` plus `-thumb`. Originale (Download-Ordner) nicht im Repo.

### Prüfung
- Lokal im Browser (Desktop 1440 und 1024, Mobile 390): kein horizontales Überlaufen, keine Konsolenfehler, Film läuft einmal und bleibt stehen, Abbruch-Requests beim Szenenwechsel sind harmlos. `eslint` ohne Fehler, `vite build` erfolgreich.
- Nicht geprüft: echte Geräte (iPhone/Safari), Lighthouse/Core Web Vitals.

---

## 2026-11-07 — Premium-Redesign Phase 2: Visual Experience (Branch design/premium-home, nur Vorschau)

**Auslöser:** Auftrag „Phase 2: Visual Experience“. Konzept, Marke und Positionierung bleiben; die Seite wird visuell kräftiger und zeigt echte Creator-Studio-Ergebnisse statt Symbolbildern. Produktion, Creator Studio, Datenbank und Admin unverändert.

### Erledigt
- **Echte Maria-Videos:** Markus hat die Verwendung bestehender Maria-Noelle-Videos aus dem Creator-Studio-Verlauf ausdrücklich freigegeben. Zugriff über die angemeldete Sitzung von Markus im Browser (nur Lesen, keine Schlüssel, kein Token, keine Änderung im Studio). Gesichtet wurden 14 der Maria-Videos (Filter Creator „Maria Noelle“, Art Video); vier eingebunden (Wan 3.0: Sprung über den Alpen, Nahaufnahme im Studio; Kling v3.0 Pro: Trittsteine im Fluss; Kling v3.0 Standard: Waldweg). Modellangaben stammen aus den Auftragsdaten. Bewusst nicht verwendet: Badezimmer-Tanzclips, Clips mit überwiegend Rückansichten, der Produkt-Clip („Ultra PH-“), Produktionen mit „Laura“ im Titel sowie alle Medien anderer Creator (Laura Bellame, Maya MaBelle, Markus Schulz).
- Web-Aufbereitung mit ffmpeg: 720 × 1280, H.264, ohne Ton, ohne Metadaten außer Technik, 1 bis 2 MB je Clip (zusammen rund 6 MB), dazu WebP-Poster und Standbilder (rund 0,5 MB) in `public/media/maria/`. Die Originale (bis 59 MB) liegen nicht im Repo.
- **Hero:** `Reel.tsx` (`ReelPlayer`): Showreel aus vier Szenen. Telefon: Vollbild-Video mit Story-Balken, Szenenname und Modell, Text und Knöpfe darüber. Rechner: hohes Filmbild mit Eckmarken, Zeitmarke aus der Abspielzeit, Szenenwahl darunter, leichter Scroll-Versatz. Es läuft immer nur ein Video, das nächste lädt erst nach 45 % des aktuellen. Pause/Abspielen immer bedienbar; bei reduzierter Bewegung, Datenspar-Modus, langsamer Verbindung oder blockiertem Autoplay bleibt das Standbild.
- **Kennzeichnung:** „KI-generiert in Creator Studio. Maria Noelle ist eine fiktive Figur.“ steht im Hero und unter dem Kontaktbogen.
- **Studio-Abschnitt:** Kontaktbogen mit echten Szenen (Telefon: wischbar mit einrastenden Kacheln, Rechner: fünf Spalten mit Versatz). Videos laden erst in Bildschirmnähe und spielen nur, solange sichtbar (`LazyClip`). Der Studio-Monitor sitzt jetzt hier statt im Hero und zeigt Marias echte Szenen; Steckbriefe, Kosten und Termine bleiben als Beispieldaten gekennzeichnet.
- **Ablauf:** Filmstreifen mit echten Szenenbildern statt reinem Text.
- **Kontrast:** Orangefarbenes Farbband mit den Voreinstellungen der Kostenkontrolle (0,10 $ Bild, 2,00 $ Video, 10 $ Tag; Werte aus `CONTROL_SPECS`), helle Papierfläche für die Leistungen mit Icon-Karten statt Textzeilen, Projektkarten mit Browserrahmen und wischbarer Reihe am Telefon.
- `FrameStill.tsx` (Symbolbilder) entfällt, weil nichts mehr darauf verweist.

### Higgsfield
- Keine neue Generierung. Der einzige Zugang wäre das Creator Studio (angemeldet) oder der API-Schlüssel des Servers; Letzteren nutze ich nicht. Ein zusätzlicher querformatiger Hero-Clip und einige Standbilder bräuchten eine Kostenfreigabe von Markus (Schätzung im Bericht).

### Prüfung
- Lokal im Browser (Desktop 1440, Mobile 390): kein horizontales Überlaufen, keine neuen Konsolenfehler, Szenenwechsel und Vorladen funktionieren. `tsc` zeigt nur die bekannten Fehler im Bestand, keine in den neuen Dateien. `vite build` erfolgreich.
- Nicht geprüft: echte Geräte (iPhone/Safari-Autoplay), Lighthouse/Core Web Vitals.

### Offen
- Bildrechte/Nutzungsbedingungen von Higgsfield für Marketing-Nutzung der Ausgaben nicht geprüft.
- Das Repository ist öffentlich: die Clips sind damit im Branch `design/premium-home` öffentlich abrufbar (so wie sie später auf der Seite öffentlich wären).
- Texte weiter hartcodiert in `content.ts` (CMS-Anbindung, SEO-Metadaten außerhalb dieses Auftrags).

---

## 2026-11-07 — Premium-Redesign Phase 1: neue Startseite (nur lokal, nichts veröffentlicht)

**Auslöser:** Auftrag „Premium Redesign Phase 1“ (Sicherheitsmigration bewusst pausiert). Die Startseite soll Digital-Perfect als Software- und KI-Marke zeigen: Creator Studio vorn (ca. 60–70 %), Dienstleistungen und High-Risk-Fokus dahinter (ca. 30–40 %).

### Erledigt
- Neue Komponentengruppe `src/components/premium-home/` (`PremiumHome.tsx`, `StudioMonitor.tsx`, `FrameStill.tsx`, `content.ts`) und `src/styles/premium-home.css`. Alle Stile hängen an `.pm`; die Farben folgen dem Creator-Studio-Designsystem (Anthrazit `#0b0c0f`, Orange `#ff6b2c`).
- `src/pages/Index.tsx`: zeigt die Premium-Startseite nur für die Digital-Perfect-Site (`DEFAULT_SITE_ID`), analog zur Kontaktvariante vom 11.09. Mit `/?design=classic` bleibt die bisherige Startseite (Kontaktvariante bzw. CMS-Abschnitte) erreichbar. Mandanten sind nicht betroffen. FAQ-Schema wird in der Premium-Variante nicht ausgegeben, weil sie keine sichtbare FAQ hat.
- Lead-Formular der Premium-Startseite schreibt dieselben Felder in dieselbe Tabelle `leads` wie `ContactSection`.
- Branch `design/premium-home` baut auf `main` (b312415) auf und enthält bewusst nichts aus `phase1/security-legal` (Schlüsselumstellung der Edge Functions, `config.toml`, Secret-Skripte, Rechtsseiten-Fix). Diese Änderungen bleiben getrennt auf `phase1/security-legal` und sind unveröffentlicht. Die Premium-Startseite braucht davon nichts.

### Bewusste Entscheidungen
- Keine echten Creator-Studio-Screenshots oder Ergebnisbilder verfügbar (Repo enthält nur Icons). Darum: vereinfachte Oberflächen-Darstellung mit Beispieldaten und grafische Symbolbilder (gleiche gesichtslose Silhouette mit orangefarbenem Ohrring in wechselnden Szenen). Beides ist auf der Seite als Darstellung bzw. Beispiel gekennzeichnet. Keine bezahlte Generierung.
- Nur belegte Aussagen: Modelle und Funktionsumfang aus README/PROJEKTSTATUS von Creator Studio. Nicht behauptet: Kundenzahlen, Lip-Sync, automatisches Veröffentlichen, Ranking- oder Rechtsgarantien. Status „Pilotphase, Zugang auf Anfrage“ steht sichtbar auf der Seite.
- Zahlungsanbieter-Beratung ausdrücklich ohne Zahlungsabwicklung formuliert; Branchenblock mit „Erfahrung, keine Garantien. Keine Rechtsberatung.“
- Neue Schriften nur für diese Seite: Big Shoulders Display (Überschriften) und JetBrains Mono (Beschriftungen) über Google Fonts, wie schon Inter und Plus Jakarta Sans.

### Prüfung
- Browser (Desktop 1440 px, Mobile 390 px): kein horizontales Überlaufen, mobiles Menü, Studio-Monitor-Tabs, sticky Leistungsspalte geprüft. Keine neuen Konsolenfehler durch die Seite.
- `tsc`: 108 Fehler gesamt wie im Bestand, keine in den neuen Dateien. ESLint auf den neuen Dateien und `Index.tsx` sauber. Ein `vite build` erfolgreich.
- Nicht geprüft: echte Geräte, Lighthouse/Core Web Vitals, Prerender-Weg über den Cloudflare-Worker, Absenden des Formulars (würde einen Lead in die Produktivdatenbank schreiben).

### Offen vor Veröffentlichung
- Texte der Premium-Startseite stehen in `premium-home/content.ts`, nicht im Admin-CMS. Die Regel „Texte über Admin bearbeitbar“ ist damit noch nicht erfüllt (Entscheidung nötig: eigener Content-Schlüssel analog `home_contact_page`).
- Navigation und Footer-Inhalt kommen teils aus dem CMS: Footer-Text nennt noch „Premium Webdesign, SEO und digitale Vertriebsmaschinen“. Meta-Title/-Description der Startseite („SEO & Webdesign Agentur Linz“) passen nicht zur neuen Positionierung, wurden aber nicht geändert (SEO-Entscheidung).
- Echte Screenshots und Beispielergebnisse aus Creator Studio sowie ein Hero-Video (Higgsfield, bezahlt, nur nach Freigabe und Kostenangabe) würden die Darstellung ersetzen.
- Google Fonts werden von Google geladen (wie bisher); für die Datenschutzprüfung ggf. selbst hosten.

### Online-Vorschau: Befund zur vorhandenen Infrastruktur (2026-11-07, nur gelesen, nichts geändert)
- Es gibt keine Staging- oder Vorschau-Umgebung. Coolify führt für das Projekt „Digital-Perfect-Hub“ nur die Umgebung `production` mit der Anwendung „Digital-Perfect-Hub Main (Frontend)“. Sie baut den Branch `main` des Repos und bedient `digital-perfect.com`, `www`, `media-bro.com`, `www.media-bro.com` und `dev.digital-perfect.com`. `dev.digital-perfect.com` ist also nur ein weiterer Domainname der Produktion (gleiches Bundle), keine Testumgebung.
- Der einzige GitHub-Webhook (an Coolify) hört nur auf `push`. Ein Push auf einen anderen Branch löst deshalb kein Deployment der Produktion aus.
- Coolify-„Preview Deployments“ nutzen die Vorlage `{{pr_id}}.dev.digital-perfect.com`. Dafür fehlt der DNS-Eintrag (`*.dev.digital-perfect.com` ist nicht vorhanden, NXDOMAIN), außerdem fehlen `pull_request`-Ereignisse im Webhook. Beides wären Änderungen an der Produktionsinfrastruktur und wurden nicht vorgenommen.
- Weitere Wege (GitHub Pages, Tunnel, zusätzliche Coolify-Anwendung) wären neue Infrastruktur und wurden nicht aufgebaut.
- Der Branch `design/premium-home` liegt auf GitHub. Markus hat danach eine eigene Coolify-Anwendung freigegeben (siehe unten).

### Online-Vorschau eingerichtet und geprüft (2026-11-07)
- **Adresse:** https://preview.digital-perfect.com, passwortgeschützt (HTTP Basic Auth, Benutzer `preview`). Das Passwort steht nur in der lokalen Datei `TURBO-DIGITAL-LAUNCH_Startseite-Vorschau/Vorschau-Zugang.txt` (außerhalb des Repos) und in Coolify, nie in Berichten oder im Repo.
- **Coolify:** Projekt Digital-Perfect-Hub, neue Umgebung `preview`, eigene Anwendung „Digital-Perfect Premium-Vorschau temporaer design/premium-home“. Nixpacks, Branch `design/premium-home`, Commit fest auf `ed65819`, Auto-Deploy aus, Preview Deployments aus, Port 80. Install `bun install`, Build `sed -i '/SERVICE_ROLE_KEY/d' .env && bun run build` (entfernt die Zeile mit dem privilegierten Schlüssel aus der Build-Kopie der `.env`), Publish `/dist`. Keine eigenen Umgebungsvariablen. Die Produktionsanwendung (Umgebung `production`) wurde nicht verändert: letztes Deployment 2026-09-11 mit `b312415`, Bundle weiter `index-CRisdGjb.js`.
- **DNS (von Markus gesetzt):** `A preview → 87.106.91.56`, nur DNS (nicht proxied), wie `prerender.digital-perfect.com`. Nach dem Eintrag wurde nur die Vorschau-Anwendung neu gestartet; danach gültiges Let's-Encrypt-Zertifikat für `preview.digital-perfect.com` (bis 2027-02-05, Erneuerung automatisch über Traefik).
- **Prüfung online (Desktop 1440 px, Mobile 390 px):** ohne Zugang und mit falschem Passwort 401, mit Zugang 200, `http` leitet auf `https` weiter. Kein horizontales Überlaufen, Schriften Big Shoulders Display, JetBrains Mono und Inter geladen, 5 von 5 Bildern, alle Menüpunkte und CTAs springen zum Ziel, Studio-Monitor-Tabs funktionieren, mobiles Menü öffnet, schließt und springt. `/?design=classic` zeigt die bisherige Startseite. Keine Konsolen- oder Seitenfehler, keine fehlgeschlagenen Anfragen. Schreibende Anfragen waren nur zwei lesende RPC-Aufrufe (`resolve_site_by_hostname`, `get_public_support_settings`); kein `leads`-Insert, kein `track-view` (Cookie-Banner: nur essenzielle).
- **Vorfall und Gegenmaßnahme:** Beim Prüfen hat das Playwright-Werkzeug einmal die Zugangsdaten (base64) in seiner Ausgabe angezeigt. Das Skript wurde gelöscht und das Passwort in Coolify ausgetauscht; das alte wird mit 401 abgelehnt. Der Austausch hat in der Vorschau-Anwendung einen zusätzlichen Build desselben Commits ausgelöst.
- **Grenzen:** Die Vorschau nutzt die Produktions-Supabase. Ein Absenden des Formulars oder Zustimmen zu Analyse-Cookies würde echte Daten schreiben und ist technisch nicht gesperrt, nur organisatorisch. Kein `X-Robots-Tag` (Coolify-Labels schreibgeschützt); gegen Indexierung schützt das Passwort, denn alle Aufrufe ohne Zugang liefern 401.
- **Aufräumen nach der Abnahme:** Anwendung in Coolify stoppen oder löschen (Umgebung `preview`) und den DNS-Eintrag `preview` entfernen.

---

## 2026-09-11 — Kontaktorientierte Startseite im Stil der Referenzseite

**Auslöser:** Analyse der beiden Bildschirmaufnahmen und der Live-Seiten von Digital-Perfect und LeventElci.de. Die neue Startseite soll Levents klare Editorial-Struktur und persönliche Ansprache aufnehmen, die Digital-Perfect-Farben behalten und Preise/Produkte zunächst vollständig aus dem Einstieg entfernen.

### Erledigt: neue Startseitenvariante für Digital-Perfect

- `src/components/ContactHomepage.tsx` + `src/styles/contact-homepage.css`: neue kontaktorientierte Homepage mit dunklem Hero, großem Gründerfoto, drei Leistungsfeldern, vorhandenen Kundenstimmen, persönlichem Founder-Abschnitt, drei Ablauf-Schritten, FAQ und Kontaktabschluss.
- `public/markus-schulz-gruender-ceo-digital-perfect.webp`: vom User bereitgestelltes neues Gründerfoto im Hero eingebunden.
- `src/lib/contact-homepage.ts`: validierbares, mandantenbezogenes Content-Modell mit kontaktorientierten Defaults. Es aktiviert sich standardmäßig nur für die Digital-Perfect-Site (`DEFAULT_SITE_ID`); andere Mandanten bleiben auf dem bisherigen Homepage-Renderer.
- `src/pages/Index.tsx`: neue Variante wird vor dem bisherigen Abschnittsrenderer geladen; Hero-Preload wird für die Kontaktvariante übersprungen.
- `src/components/Header.tsx` und `Footer.tsx`: neue Homepage kann eigene Anker-Navigation und Kontakt-CTA übergeben.
- `src/components/ContactSection.tsx`: neue Variante entfernt die Pflicht-Paketauswahl und speichert nur optionales Anliegen; `budget` bleibt bei dieser Variante `null`. Formularlabels sind mit `htmlFor`/`id` und Autocomplete versehen; Datenschutzlink ist sichtbar.
- `src/components/admin/homepage/ContactHomepageEditor.tsx` und `src/pages/admin/AdminHomepage.tsx`: Inhalte der Kontaktvariante sind im Admin editierbar. Das alte Layout bleibt als aufklappbarer Legacy-Bereich erreichbar.

### Bewusste Entscheidungen

- Preise, Paketnamen und Produktkarten werden in der neuen Startseite nicht gerendert. Auch Menü, Ablauf, Formular und FAQ verwenden keine Paketlogik.
- Kundenstimmen werden aus der vorhandenen Testimonials-Tabelle geladen; solange dort keine sichtbaren Datensätze liegen, werden die bestehenden Default-Stimmen genutzt.
- Fotoquelle ist der vom User bereitgestellte lokale Pfad `/markus-schulz-gruender-ceo-digital-perfect.webp`, damit kein externer Upload erforderlich ist.
- Foto-Alttext, Fotoanzeige, Navigation, Leistungen, FAQ, Founder-Text und Kontakttexte sind über `home_contact_page` editierbar.

### Prüfung

- Lokale Desktop-Vorschau geprüft: Hero, Bild, Kontaktnavigation, Leistungs- und Kontaktabschnitt sichtbar; kein horizontales Überlaufen.
- Mobile Vorschau bei 390 px geprüft: Menü öffnet, Anker-Navigation schließt wieder, `scrollWidth` entspricht der Viewportbreite, Preise/Paketbegriffe fehlen im neuen `main`.
- `npm run build` erfolgreich.
- `vitest run` erfolgreich: 3 Testdateien, 8 Tests.
- Gezieltes ESLint auf geänderten React/TypeScript-Dateien erfolgreich.
- Vollständiger TypeScript-Check enthält weiterhin 109 bereits vorhandene Fehler; Vergleich gegen den Baseline-Stand zeigt keine neuen Fehler.

### Offen vor Veröffentlichung

- Änderungen müssen im Repository committed und über den vorhandenen Deployment-Weg veröffentlicht werden.
- Vor Veröffentlichung im Admin einmal speichern und die tatsächliche Formularzustellung in der Zielumgebung prüfen.
- Standortangabe „Linz“/„Wien“ und rechtliche Seiten bleiben bestehende Content-/Geschäftsangaben und wurden nicht erfunden oder automatisch geändert.

---

## 2026-08-24 (Folge-Session) — Footer + Kicker-Badge Dark-on-Dark Fixes

**Auslöser:** Fortführung der vorherigen Session (Kontext-Limit). User hatte Screenshot gesendet der deutlich unsichtbare (dunkle) Schrift im Footer und auf der Startseite zeigte.

### Erledigt: Footer.tsx — Headings orange, Logo-Text weiß

`src/components/Footer.tsx`:
- Alle 3 Spalten-Überschriften (`h4`: Navigation, Rechtliches, Kontakt) hatten kein explizites Farbattribut und erbten `var(--hero-headline)` aus `.footer-shell` — im Live-DB-Setup dunkel auf dunkelblau.
- Fix: `style={{ color: "var(--theme-primary-hex)" }}` zu allen drei `h4` Elementen ergänzt → jetzt immer orange.
- Logo-Text im Footer: Frühere Farb-Logik deckte `#0A1842` (navy) nicht ab → Schrift wurde unsichtbar dunkel auf dunkel. Fix: immer `style={{ color: "#FFFFFF" }}` im Footer (Footer-Hintergrund ist immer dunkelblau).
- `tsc --noEmit` sauber, auf User-PC geliefert.

### Erledigt: index.css — Kicker-Badges auf dunklen Sections fixiert

Problem: `.homepage-style-scope .section-label` fiel auf `var(--surface-card)` als Hintergrund und `var(--surface-card-text)` als Textfarbe zurück. In dunklen Sections (z.B. „Pakete für KMU") überschreibt das Section-Style-System `--surface-card` auf die Kartenfarbe (oft ebenfalls dunkelblau) → Badge-Schrift unsichtbar.

Fix in `index.css` Zeile 928ff:
```css
.homepage-style-scope .section-label {
  background: var(--homepage-badge-bg, color-mix(in srgb, var(--theme-primary-hex, #FF6B2C) 12%, transparent));
  color: var(--homepage-badge-text, var(--theme-primary-hex, #FF6B2C));
  border-color: var(--homepage-badge-bg, color-mix(in srgb, var(--theme-primary-hex, #FF6B2C) 30%, transparent));
}
```
→ Wenn `--homepage-badge-bg/text` nicht via DB gesetzt: immer orange (auf dunkel UND auf hell lesbar).
→ Gilt universell für alle Sections: SeoPackagesSection, WebdesignPackagesSection, TestimonialsSection, AboutFounderSection, etc.
- Auf User-PC geliefert.

### Push ausstehend

Alle Änderungen wurden auf dem PC des Users gespeichert. User muss im Repo noch `git add` + `git commit` + `git push` ausführen (Cloud-Session hat keinen Push-Zugriff auf `digital-perfect-hub/turbo-digital-launch`).

### Noch offen

Gleiche wie vorherige Session, plus:
- Browser-Audit wurde unterbrochen (Browser-Renderer fror mehrfach ein) — restliche Sections nach den Paketen nicht vollständig gesehen. Der CSS-Fix deckt alle `homepage-style-scope` Sections universell ab, aber visuelle Verifikation nach dem Push empfohlen.
- Hero-Bild / visuelles Element noch ausstehend.

---

## 2026-08-24 — Design-Session: Markus-Foto entfernt, Design-Analyse durchgeführt

**Auslöser:** User bat um vollständigen Design-Audit von digital-perfect.com (Browser-Screenshot von oben bis unten) und danach Umsetzung der Fixes — insbesondere alle Bilder von Markus temporär entfernen während die Website fertig designt wird.

### Erledigt: Markus-Foto aus AboutFounderSection entfernt

`src/components/AboutFounderSection.tsx`:
- Import `founderPhoto from "@/assets/dp-hero-markus.png"` entfernt
- `<img>`-Tag durch gestalteten Navy/Orange-Placeholder mit Initialen „MS" ersetzt
- Layout (2-Spalten-Grid) und alle Animationen bleiben unverändert erhalten
- Placeholder kann jederzeit durch ein neues Foto via `<img src={...}>` ersetzt werden — kein weiteres Refactoring nötig
- `tsc --noEmit` sauber

**Asset `src/assets/dp-hero-markus.png` bleibt im Repo** — nur der Import/die Verwendung wurde entfernt. Kann bei Bedarf auch aus dem Repo gelöscht werden (git rm), wurde aber bewusst noch behalten.

### Design-Audit Erkenntnisse (noch nicht umgesetzt — nächste Schritte)

Aus dem Browser-Screenshot-Audit ergaben sich folgende priorisierte Punkte:

1. **Portfolio-Sektion fehlt auf der Startseite** — `PortfolioSection.tsx` existiert im Code, ist aber nicht sichtbar verlinkt/beworben. Echte Website-Beispiele (Screenshots mit Link) sind der wichtigste Trust-Faktor für eine Webdesign-Agentur.
2. **Testimonial-Avatare generisch** — oranges Kreis-Icon statt echter Fotos/Logos. Mindestens Firmenlogos oder Initialen-Avatare wären glaubwürdiger.
3. **Footer Social-Links nicht konfiguriert** — Code in `Footer.tsx` unterstützt `social_instagram_url` / `social_linkedin_url`, aber in `global_settings` nicht gesetzt. Fix: Supabase → `global_settings` → `social_instagram_url` + `social_linkedin_url` eintragen (kein Code-Change nötig).
4. **Hero ohne visuelles Element** — reiner Text auf Navy-Hintergrund. Ein Website-Mockup oder Grafik würde den ersten Eindruck stark verbessern.
5. **Zu viel Fließtext in vielen Sektionen** — Texte kürzen, mehr Weißraum. Kein Code-Fix, Admin-Content-Aufgabe.
6. **Footer-Tagline** (`global_settings.footer_description`) passt tonal nicht zur ehrlichen Markenstimme — klingt zu generisch/reißerisch. Admin-Content-Fix.
7. **Standort-Inkonsistenz Footer/Site** — Footer zeigt „Wien", Rest der Seite positioniert sich auf „Linz". Aus vorheriger Session bekannt, noch nicht entschieden ob beabsichtigt.

### Noch offen aus Vorsessions
- Impressum/Datenschutz/AGB komplett leer (reales rechtliches Risiko — User muss echte Daten eintragen)
- Cloudflare `index.html` Cache-TTL (kein Code-Fix möglich, nur Coolify/Cloudflare-Einstellung)

---

## 2026-08-22 (vierte Session) — Optischer Full-Page-Audit: Weiß-in-Weiß-Bug gefixt (Code, ungepusht), Impressum/Datenschutz/AGB komplett leer entdeckt

**Auslöser:** User bat um optischen Check von digital-perfect.com und was noch zu fixen ist. User hatte den Weiß-in-Weiß-Textbug bereits vorher gemeldet (nicht in PROGRESS.md protokolliert gewesen).

**Tool-Hinweis:** Der Browser-Pane-Screenshot brach in dieser Session bei jedem Scroll zuverlässig zusammen (blank/Tearing), unabhängig von Wheel- vs. JS-Scroll oder Wartezeit — Ursache unklar (evtl. Pane-Visibility im Host). Ein frischer Tab (`tabs_create`) hat es zuverlässig behoben. Falls das erneut auftritt: nicht lange mit Wait/Retry kämpfen, sondern sofort neuen Tab versuchen.

### Gefixt: Cream-auf-Cream-Text in 3 Preis-/Hinweis-Boxen (Code, `tsc`+Build sauber, live im Dev-Server verifiziert, NOCH NICHT gepusht)
Root Cause: `.surface-section-shell .text-muted-foreground { color: var(--surface-section-muted) !important; }` (index.css:749) erzwingt sektionsweit Creme-Text (korrekt für den dunklen Sektions-Hintergrund), bricht aber lokale helle Boxen (`bg-[#FAF6EE]`) innerhalb dunkler Sektionen, die diese Klasse ohne das etablierte Schutzmuster `dp-blue-card-surface` (index.css:2059ff, exakt für „weiße Cards in dunklen Sektionen" gebaut) verwenden. Betraf:
- `SeoPackagesSection.tsx` „Wichtig:"-Box (Zeile 171): Fließtext nach dem Label war unsichtbar.
- `SeoPackagesSection.tsx` mobile Paket-Detailkarte (Zeile 206, `.mobile-package-tab-card`): Beschreibung, „Monatlich ab"-Label, Intervall, Steuerhinweis alle unsichtbar — nur Titel und Preis waren zu sehen.
- `WebdesignPackagesSection.tsx` dieselbe Stelle (Zeile 196): „Fixpreis ab"-Label, „netto", Steuerhinweis unsichtbar.

Fix: `dp-blue-card-surface` (bzw. zusätzlich `dp-blue-card-border` bei der „Wichtig:"-Box) zu den drei Elementen ergänzt — gleiches Muster, das an anderen Stellen in denselben Dateien schon funktioniert. Kein CSS geändert, nur fehlende Klassen ergänzt.

**Noch offen:** Fix ist nur lokal committed-fähig, nicht gepusht — User-Entscheidung ausstehend, ob jetzt gepusht werden soll.

### Größter Fund: Impressum, Datenschutz und AGB sind auf der Live-Seite komplett leer (nur Platzhaltertext)
Per SQL gegen `legal_pages` (site_id `00000000-0000-0000-0000-000000000001`, zuletzt geändert 2026-03-22, seither nie befüllt) verifiziert: alle drei Seiten enthalten nur generischen Platzhalter à la „Bitte pflege diese Seite im Admin unter Recht & SEO" / „Bitte ergänze Firmenname, Anschrift und Kontaktangaben." Kein echter Firmenname, keine Adresse, keine UID, kein echter Datenschutz- oder AGB-Text — das bei einer live laufenden Website mit aktivem Kontaktformular (inkl. Datenschutz-Einverständnis-Checkbox, die auf die nicht existente Datenschutzerklärung verweist). Das ist ein reales rechtliches Risiko (Impressumspflicht § 5 TMG/MedienG, DSGVO), kein Code-Bug — Fix erfordert echte, vom User bereitzustellende Geschäftsdaten (Firmenname/Rechtsform, Adresse, UID, echter Datenschutz-/AGB-Text), eintragbar über Admin → Recht & SEO. Nicht selbst ausgefüllt, da diese Angaben nicht erfunden werden dürfen.

Separat auffällig: `global_settings.imprint_address` = literal `"222222222222222222"`, `imprint_contact` = `"333333333333333333333333333333"` — offensichtliche Platzhalter-Testdaten. Werden aber laut Footer.tsx nur als Fallback genutzt, wenn `footerContactItems` leer ist — die Live-Seite zeigt tatsächlich „Wien, Österreich" / hello@digital-perfect.com, kommt also aus einem anderen, tatsächlich befüllten Feld (nicht abschließend identifiziert, welches).

### Content-Inkonsistenz: Footer sagt „Wien", ganze Seite positioniert sich auf „Linz"
Footer zeigt „Standort: Wien, Österreich", während Title-Tag, Hero („SEO & KI-OPTIMIERUNG AUS LINZ") und das Local-SEO-Premium-Paket („für Linz und Umgebung") durchgängig Linz als Positionierung nutzen. Kann legitim sein (rechtlicher Sitz Wien, Zielmarkt Linz/Oberösterreich) — nicht verifiziert, ob beabsichtigt oder Versehen. Ebenfalls die Footer-Tagline „Premium Webdesign, SEO und digitale Vertriebsmaschinen für Agenturen und Brands, die den Standard setzen wollen." wirkt tonal generischer/reißerischer als die sonst persönliche, ehrliche Copy der Seite („keine Fake-Garantien", Markus-persönlich-Ton) — beides DB-Content (`global_settings.footer_description`), kein Code.

### Kleinere Beobachtung (kein Fix nötig, nur Politur-Idee)
Alle 5 Karten in „Warum Digital-Perfect" (01–05) nutzen dasselbe generische Häkchen-Icon statt themenspezifischer Icons.

### Als Fehlalarm ausgeschlossen
Eine zunächst grau wirkende Karte im WhyChoose-Bereich war nur ein Screenshot-Kompositing-Artefakt (siehe Tool-Hinweis oben) — `getComputedStyle` bestätigte korrektes Navy. Gründer-Foto (`dp-hero-markus.png`) ist vorhanden und rendert korrekt, wurde beim ersten Scroll-Durchlauf nur übersprungen. Sektionsfarb-Rhythmus (Navy/Creme-Wechsel) ist sauber, exakt 2 Farben, keine Grau-Reste.

---

## 2026-08-22 — Offene Punkte aus Vorsession abgearbeitet (LIVE, VERIFIZIERT), Cache-Fix und Admin-Farben weiter offen

**Status: Code-Fix gepusht (Commit `5ecd024`), zwei Live-DB-Korrekturen angewendet, gegen laufenden Dev-Server verifiziert (Screenshot-Tool in dieser Session nicht verfügbar — Verifikation über `getComputedStyle`/DOM statt Pixel-Vergleich).**

### CLAUDE.md + PROGRESS.md nachträglich committet
Waren aus der Vorsession (Nutzungslimit-Unterbrechung) noch unstaged. Commit `4248235`, gepusht.

### Echter Live-Bug gefunden und behoben: Nav-Hover-Text-Override
`useGlobalTheme.tsx` überschrieb `--nav-text`/`--nav-hover-text`/`--nav-underline` direkt nach `applyThemeToRoot()` unconditional mit den flachen Legacy-Feldern (`nav_text_color_hex` etc.), wodurch die kontrastsichere Berechnung aus `navigation_theme` (in `theme-settings.ts`, `resolveReadableColor`) für diese drei Werte wirkungslos war — exakt das in der Vorsession als Risiko notierte Feld-Duplikat. Live-DB-Check bestätigte: die Felder waren bereits auseinandergelaufen (`nav_hover_color_hex` flach = `#FF4B2C`, `navigation_theme.hover_text_color` nested = `#FF6B2C`) — die alte Farbe gewann.

Fix: Override-Zeilen für `--nav-text`/`--nav-hover-text` in `useGlobalTheme.tsx` entfernt (Zeilen für `--nav-underline` bleiben, da es dafür kein nested Gegenstück in `navigation_theme` gibt). Ergebnis nach Fix: Hover-Text löst jetzt korrekt über die Kontrast-Sicherheitslogik auf — auf dem hellen Creme-Header ergibt das dunkles Navy (`#0F172A`) statt eines schlecht lesbaren Orange, weil `resolveReadableColor` Orange-auf-Creme unter dem projektweiten `minimumContrast`-Schwellwert verwirft. Das ist beabsichtigtes Verhalten derselben Logik, die auch alle Hero-/Surface-/Button-Farben absichert — keine Regression.

Zusätzlich `nav_underline_color_hex` per SQL von `#FF4B2C` auf `#FF6B2C` vereinheitlicht (letzte off-palette Reststelle aus der 3-Farben-Aufräumung).

TypeScript (`tsc --noEmit`) und `npm run build` sauber. Live im laufenden Dev-Server (Port 8080) verifiziert: `getComputedStyle` auf `document.documentElement` zeigt korrekte Werte, kein Konsolenfehler.

### FAQ-Antwort ergänzt
`faq_items.answer` für "Was ist im Webdesign-Paket enthalten?" wiederholte nur die Frage (bereits in der Audit-Runde vom 21./22.08. notiert). Echten Text ergänzt, Inhalt aus `WebdesignPackagesSection.tsx` (Starter/Business/Premium-Leistungen) abgeleitet, damit er faktisch zum tatsächlichen Angebot passt. Live per Klick auf das Accordion-Item verifiziert.

### Test-Foreninhalte in Sitemap: bereits erledigt
`/forum/kategorie/test` und `/forum/testthread1` existieren nicht mehr in `forum_categories`/`forum_threads` (SQL-Check: leeres Ergebnis). Vermutlich in einer nicht dokumentierten Zwischensession bereinigt oder nie live gegangen. Keine Aktion nötig.

### Noch offen — genuine Blocker, kein Code-Fix möglich
1. **Cloudflare-/Nixpacks-Cache auf `index.html`**: `cloudflare-worker/worker.js` cacht selbst nur prerenderte Bot-Antworten (`shouldPrerender`-Zweig); normale Besucher-Requests gehen unverändert per `fetch(request)` durch zum Origin. Die 4h-Cache-Wirkung kommt also entweder aus Cloudflares Zone-Einstellungen (Browser Cache TTL / Cache Level) oder aus dem Cache-Control-Header, den Coolifys Nixpacks-Static-Server für `index.html` mitschickt — kein Nginx-/Nixpacks-Config im Repo (nur in Coolify-UI), kein Cloudflare-Dashboard-Zugriff aus dieser Session heraus möglich. **Konkreter Fix (vom User oder mit Coolify/Cloudflare-Zugriff auszuführen):** `index.html` mit `Cache-Control: no-cache` (oder kurzem `max-age`) ausliefern, während gehashte Assets (`/assets/*.js`, `*.css`) weiterhin lang gecacht werden dürfen — verhindert das Zeitfenster mit kaputtem Ladebildschirm nach jedem Deploy. In Coolifys Nixpacks-Static-Konfiguration oder per Cloudflare Cache Rule für Pfad `/` bzw. `/index.html` umsetzbar.
2. **Nginx-/Coolify-Config nicht im Repo versioniert** — gleicher Zugriffs-Blocker wie oben, nur über Coolify-UI einsehbar/änderbar.
3. **Admin-Panel-weite Farbvereinheitlichung**: `global_settings.bg_main_hex` (`#F7F9FC`), `bg_card_hex` (`#FFFFFF`), `text_main_hex` (`#0F172A`), `text_muted_hex` (`#64748B` — genau das in der Vorsession als Problem-Grau benannte Feld), `border_color_hex` (`#D9E2F1`) sind weiterhin off-palette und speisen zusätzlich die Admin-Panel-Tokens (`--background`/`--foreground`/`--border` etc.). User-Entscheidung: bewusst zurückgestellt, da eine Änderung das aktuell helle, funktionierende Admin-Theme beeinflussen würde und einen dedizierten Test-Durchgang über die ~27 Admin-Seiten bräuchte.

### Optischer Gesamteindruck Startseite (diese Session)
Per `getComputedStyle`-Audit über alle `<section>`-Elemente: **jede Section löst exakt auf Navy `#0A1842` oder Creme `#FAF6EE` auf** — keine Grau-/Off-Palette-Reste mehr auf Section-Ebene. `.glass-card`/`.premium-card` bestätigt ohne `backdrop-filter`/`box-shadow` (wie in der Vorsession entfernt); `.dp-blue-card-surface` hat einen bewusst palette-getönten Schatten (Orange+Navy-Mix), keinen generischen Grau-Glow. Einzige Beobachtung ohne Fix-Bedarf: vier Sections in Folge (Testimonials/Kontakt/FAQ + eine weitere) laufen alle in Creme — auf einer sehr langen Scroll-Strecke evtl. etwas eintönig; keine Regression, nur eine Rhythmus-Beobachtung für eine mögliche spätere Iteration.

---

## 2026-08-22 — Farbsystem auf 3 Farben vereinheitlicht + Hero-Rebuild (LIVE, VERIFIZIERT)

**Status: umgesetzt, gepusht (Commit `5d83c0b`), gegen echte Live-Seite in frischem Browser-Tab verifiziert (nicht nur lokal).**

### Auslöser
User-Feedback (per Screenrecording): Header ganz oben auf der Seite transparent/unlesbar, erst nach Scroll weiß. Zusätzlich: Farben wirken inkonsistent, "Grau oder Schimmereffekte" sichtbar. Vorgabe: strikt nur 3 Farben — Navy, grelles Orange, **cremiges Weiß** (nicht reines Weiß). Hero wirkt "zu erschlagend". Zielbild: Profi-Niveau, "verkaufsbereit für 10.000€", Design-Richtung wie leventelci.de.

### Diagnose: Header-Bug war real, aber Ursache war Deploy-Cache, nicht der Code
Direkt nach dem vorherigen Fix (siehe Eintrag darunter) war der Header bei `scrollY:0` bereits korrekt solide (per `getComputedStyle` live verifiziert). Das im Video gezeigte Verhalten (transparent oben, erst nach Scroll solide) passte exakt zum **alten**, bereits gefixten Code-Pfad — kombiniert mit bereits neuen Farben aus der DB (die werden separat/live geladen, nicht mitgecacht). Cloudflare cacht `index.html` 4h — nach jedem Deploy gibt es ein Zeitfenster, in dem Besucher mit gecachter alter `index.html` auf ein nicht mehr existierendes JS-Bundle treffen (Nginx-SPA-Fallback liefert dann `index.html` mit `Content-Type: text/html` statt JS aus → Browser verweigert Ausführung, Seite hängt im Ladebildschirm oder zeigt alten Code). **Noch nicht behoben, nur diagnostiziert** — siehe „Noch offen" unten.

### Ursache für "Farben passen nicht zusammen"
Fünf leicht unterschiedliche Dunkel-Töne gleichzeitig im Einsatz: `hero_theme.background_color` (#0E1F53), `process`-Section (#050B1F), globaler `surface_theme`-Fallback für SEO-/Webdesign-Pakete (#11172A), `bg_main_hex` (#0B1020), Karten-Text in `.dp-blue-card-surface` (#1f2a44) — plus hartcodierte Tailwind-Grautöne (`text-slate-100/300`, `#E2E8F0`, `#A5B4C7`, `#64748B`) für "muted" Text. Einzeln unauffällig, in Summe der Grund für den "stimmt irgendwie nicht"-Eindruck.

**Vereinheitlicht auf exakt 3 Farben:**
- Navy: `#0A1842`
- Orange: `#FF6B2C`
- Creme: `#FAF6EE`
- "Muted"-Text = Navy bzw. Creme bei reduzierter Opazität, keine eigene 4. Grau-Farbe mehr.

### Zwei echte CSS-Bugs gefunden und gefixt (nicht nur Werte geändert)
1. **`index.css` — `.homepage-style-scope { background: var(--homepage-section-bg, inherit); }`**: Bei Sections mit `inherit_theme:true` (SEO-/Webdesign-Pakete) ist `--homepage-section-bg` nie gesetzt → fiel auf `inherit` zurück → erbte die Body-Hintergrundfarbe statt der Surface-Theme-Farbe. Deshalb hatten diese Sections einen anderen Dunkelton als Hero/Ablauf direkt daneben. Fix: Fallback-Kette auf `var(--homepage-section-bg, var(--surface-section, inherit))` erweitert.
2. **`index.css` — `.homepage-style-scope .dp-blue-card-surface { background: #ffffff !important; color: #1f2a44 !important; }`**: Diese zentrale Regel hat jede `bg-white`→Creme-Änderung direkt in `WhyChooseSection.tsx`/`SeoPackagesSection.tsx`/`WebdesignPackagesSection.tsx` wirkungslos gemacht (Komponenten-Edits waren korrekt, wurden aber überschrieben). Falls künftig Kartenfarben in diesen 3 Dateien geändert werden und sich optisch nichts tut: zuerst diese Regel (und die Geschwister-Regeln um `index.css:2058-2088`) prüfen.

### Hero-Rebuild (`HeroSection.tsx`)
- Foto-Hintergrund (generisches "digitales Netzwerk"-Stockbild) entfernt, durch reinen CSS-Gradient (Navy + dezenter Orange-Glow, beides aus Theme-Variablen) ersetzt — jedes Stockfoto hätte die 3-Farben-Regel gebrochen.
- Untere "Proof-Karten"-Zeile entfernt (redundant mit Trust/WhyChoose-Aussagen).
- Padding reduziert (Hero-Höhe von ~1206px auf 960px bei Desktop-1280-Breite).
- Bild-Panel (rechte Spalte mit Kicker/Titel/2 Overlay-Boxen) über `hero_content.show_visual_panel = false` in der DB deaktiviert statt Code gelöscht — bleibt admin-umschaltbar, sobald echte Fotos vorhanden sind (User hat aktuell keine).
- Dabei gefundenen Folgefehler behoben: Grid kollabierte nicht auf eine Spalte, wenn das Bild-Panel aus ist → leere rechte Hälfte. Jetzt bedingt auf `showVisualPanel`.
- `backdrop-filter`/diffuse Glow-Shadows aus `.glass-card`/`.premium-card`/`.premium-dark-card`/`.dark-section .glass-card` entfernt (zentrale, geteilte Klassen — betrifft dadurch gleichzeitig Hero-Stat-Karten, Testimonials, Portfolio, Prozess-Karten).

### Live-Datenänderungen (Supabase, site_id `00000000-0000-0000-0000-000000000001`)
Direkt per SQL geschrieben (nicht nur Code-Defaults — `useSiteSettings`/`useGlobalTheme` lesen live aus der DB, überschreiben Code-Defaults): `site_settings.home_section_styles` (alle Sections), `global_settings.navigation_theme`, `hero_theme`, `surface_theme`, `button_theme`, `hero_content.show_visual_panel`.

### Bewusst NICHT angefasst
`bg_main_hex`/`bg_card_hex`/`text_main_hex`/`text_muted_hex`/`border_color_hex` (globale `global_settings`-Felder) enthalten ebenfalls Off-Palette-Werte, wurden aber nicht geändert — sie speisen Tailwinds globale `--background`/`--foreground`/`--border`-Tokens, die auch im **Admin-Panel** verwendet werden (ungetestet diese Session). Änderung hätte Admin-Lesbarkeit riskiert ohne Verifikation. Falls vollständige Farbvereinheitlichung inkl. Admin-Panel gewünscht: eigener, separat getesteter Durchgang nötig.

### Noch offen
1. **Cloudflare-Cache auf `index.html` (4h TTL)** verursacht nach jedem Deploy ein Zeitfenster mit potenziell kaputtem Ladebildschirm für Besucher mit gecachter alter Seite. Nur diagnostiziert, nicht behoben — Cache-TTL müsste in Cloudflare (oder per Origin-Cache-Control-Header) reduziert werden.
2. Admin-Panel-weite Farbvereinheitlichung (s.o.) nicht gemacht.
3. Legacy-Feld-Duplikat `nav_text_color_hex` (top-level) vs. `navigation_theme.text_color` (nested) — Ersteres gewinnt in `useGlobalTheme.tsx`, überschreibt Letzteres. Betrifft evtl. auch andere `*_hex`-Felder mit Objekt-Pendant — bei künftigen Theme-Änderungen im Hinterkopf behalten.
4. Kein Nginx-/Coolify-Config im Repo (nur in Coolify-UI) — SPA-Routing-Regel und Asset-Caching nicht versioniert.

---

## 2026-08-22 — Header dauerhaft hell/solide statt transparent-über-Hero (GEPUSHT, Commit `bb97302`)

**Status: Fix umgesetzt und gepusht — im Nachgang (s. Eintrag oben) stellte sich heraus, dass ein Nutzer-Video kurz danach noch alten, gecachten Zustand zeigte; der Fix selbst war korrekt.**

Design-Richtung wie leventelci.de: Header sollte immer sichtbar/lesbar sein statt transparent über dem Hero zu schweben und erst nach ~14px Scroll solide zu werden. `Header.tsx`: Scroll-abhängige Umschalt-Logik entfernt, Header nutzt jetzt immer `background: var(--nav-bg)` etc. Dabei Bug gefunden und mitgefixt: mobiles Hamburger-Icon war fest auf eine globale Textfarbe verdrahtet und wäre auf dem neuen hellen Header unsichtbar geworden.

Gleichzeitig erster Teil der Hell/Dunkel-Section-Rhythmus-Umsetzung (Details dazu im Eintrag oben, wurde im nächsten Durchgang nochmal überarbeitet/vereinheitlicht).

---

## 2026-08-21/22 — Vollständiges Projekt-Audit + erste Fixes (LIVE, Commit `9479061`)

**Status: umgesetzt, gepusht, verifiziert.**

### Auslöser
User bat um Analyse des gesamten Projekts + Vergleich mit leventelci.de (Referenz-Agentur-Website) als Vorbild für Struktur/Aufbau. Vollständiger Audit über 3 parallele Explore-Agents (Homepage-Content, SEO/Technik, Backend/SaaS-Architektur) plus direkte Live-Site-Verifikation.

### Wichtigste Audit-Erkenntnisse
- Homepage hatte 17 Content-Blöcke (Hero + 15 Sections + Footer) vs. leventelci.de's ~11 — mehrfache Redundanz in "Warum wir"-Botschaften.
- `sitemap.xml` hatte nur 6 URLs, inkl. Test-/Dummy-Forumsinhalten (`/forum/kategorie/test`, `/forum/testthread1`) — **weiterhin offen, siehe unten.**
- `src/lib/image.ts` umgeht bewusst die kostenpflichtige Supabase Render-API (Kommentar im Code bestätigt das als Kosten-Entscheidung) — Performance-Nachteil in Kauf genommen. **User-Entscheidung: "später entscheiden", nicht angefasst.**
- Kein Code-Splitting: gesamtes Admin-Panel (27 Seiten) im selben Bundle wie die Public-Homepage — 2,7MB JS (~790KB gzip) für jeden Erstbesucher.
- Keine strukturierten Daten (JSON-LD) auf Homepage/CMS-Seiten.
- Multi-Tenant-White-Label-Architektur ist real und sauber gebaut (Hostname-Auflösung, RLS, Stripe-Billing, Onboarding-Wizard) — aber nur **ein** echter Tenant existiert aktuell. Offene strategische Frage, keine Code-Baustelle.
- `testimonials`-DB-Tabelle vermutlich leer — die "echten" Testimonials (Event-Manifest, KRAFTSTAMM, Hochgatterer GmbH, Renate G.) sind der hardcodierte Fallback in `useSiteSettings.ts`, nicht Admin-gepflegte Zeilen. Admin > Testimonials tut aktuell nichts, bis dort ein erster echter Eintrag existiert.

### Umgesetzt
- Bestätigter Live-Bug: Hero-Proof-Zeile zeigte permanent Dev-internen Platzhaltertext ("...damit leere Admin-Daten nicht alles zerstören") — war nie an die DB angebunden, nur hardcodierter Fallback. Text ersetzt (später im Hero-Rebuild komplett entfernt, s.o.).
- 🚧-Emoji im Ablauf-Bereich durch Icon ersetzt.
- Ungenutzte `@tremor/react`-Dependency entfernt.
- Code-Splitting: alle Admin-Routen + Login/Legal/Produkt/Forum-Seiten per `React.lazy`. Ergebnis: Startseiten-JS von ~790KB auf ~299KB gzip.
- JSON-LD ergänzt (Organization + FAQPage auf Startseite, WebPage auf CMS-Seiten) über die bereits vorhandene, nur ungenutzte `structuredData`-Prop von `SEO.tsx`.
- `index.html`-Fallback-Meta (Title/Description/OG) an echte Positionierung angepasst (zeigte vorher noch eine alte "White-Label SaaS"-Botschaft).
- Neue "Über Markus"-Section gebaut: echtes Foto (`dp-hero-markus.png`, lag ungenutzt im Repo), echtes Event-Manifest-Testimonial als Referenz statt Duplikat. Sauber ins bestehende admin-editierbare Section-System eingehängt.

### Noch offen (aus dieser Runde, unverändert Stand heute)
1. Test-Forumsinhalte in der Sitemap unpublishen (`/forum/kategorie/test`, `/forum/testthread1`).
2. Eine FAQ-Antwort wiederholt nur ihre Frage ("Was ist im Webdesign-Paket enthalten?") — echten Text ergänzen.
3. Bild-Render-API-Kosten-/Performance-Tradeoff: User-Entscheidung ausstehend.
4. Echte Case-Study-Zahlen, Kundenlogo-Freigaben, externes Bewertungs-Platform-Badge (Google/ProvenExpert o.ä.) — brauchen User-Input/Assets, keine Code-Aufgabe.
5. Nginx-/Coolify-Config nicht im Repo versioniert.

## 2026-09-11 – Referenzprojekte und Header-Navigation
- Header-Markenlink von SPA-Link auf normalen Startseiten-Link umgestellt, damit ein Klick auf „Digital-Perfect“ die Startseite vollständig neu lädt.
- Kontakt-Homepage um einen visuellen Referenzbereich mit fünf Projektkarten erweitert: Tiertarif, RankScout, Pudel Schulz, Kraftstamm und seaEQ.
- Referenzseiten geprüft und lokale Preview-Screenshots bzw. eine gestaltete Preview für die nicht renderbare Tiertarif-Seite unter `public/references/` abgelegt.
- Karten sind responsiv, verlinken auf die jeweiligen Seiten und öffnen externe Projekte in einem neuen Tab.
- `npm run build` erfolgreich.

## 2026-09-11 – Referenzbilder und Standortkorrektur
- Die vier bereitgestellten Bilder aus `public/references/` direkt den passenden Referenzen zugeordnet.
- Nicht mehr benötigte alte Preview-Dateien und die seaEQ-Referenz entfernt.
- Pudelschulz-Link auf `https://pudelschulz.de/` korrigiert.
- Standort im Footer auf „Österreich“ vereinheitlicht; „Wien“ wird auch bei vorhandenen gespeicherten Footer-Einstellungen nicht mehr angezeigt.
- Tests und Build erfolgreich.

## 2026-09-11 – Referenz-Slider
- Referenzkarten durch einen großen Ein-Projekt-Slider mit Scroll-Snap ersetzt.
- Pfeilnavigation, Positionspunkte und Touch-/Trackpad-Swiping ergänzt.
- Desktop zeigt ein großes zweispaltiges Projektbild, mobil eine optimierte Bild-über-Text-Karte.
- ESLint, Tests und Build erfolgreich.

## 2026-09-11 – Referenz-Slider visuell überarbeitet
- Slider auf eine webgerechte Karussell-Komposition mit eigenem Preview-Rahmen umgestellt.
- Screenshots werden vollständig innerhalb eines Browser-Frames dargestellt, ohne ungewolltes Zuschneiden.
- Browser-Leiste, Schatten, abgerundete Kanten, Farbflächen und dezente Hover-Animation ergänzt.
- Mobile Darstellung auf kompakte, gut lesbare Bild/Text-Karten optimiert.
- Build und ESLint erfolgreich.

## 2026-09-11 – Levent-Elci-Farbpalette übertragen
- Farbwerte aus dem bereitgestellten Levent-Code übernommen: Orange `#FF6B35`, Orange-Highlight `#FF8C42`, Schwarz `#0A0A0A`, Text `#232326`, Muted `#6B6B70`, Soft-Orange `#FFF5F0` und Linien `#ECECEF`.
- Palette auf Hero, Buttons, Proof-Bar, Karten, Referenz-Slider, FAQ, Kontaktbereich und Footer angewendet.
- Bestehende Digital-Perfect-Inhalte, Referenzen und Kontaktfokus unverändert beibehalten.
- Build erfolgreich.

## 2026-09-11 – Farbgewichtung nach Levent-Liveauftritt
- Helle Flächen auf reines Weiß umgestellt.
- Orange `#FF6B35` als kräftige Strukturfarbe für Rahmen, Trenner, Section-Kanten und Slider-Preview verwendet.
- Soft-Orange nicht mehr als großflächigen Hintergrund verwendet; dunkle Kontrastflächen bleiben gezielt für Hero, Founder und Footer erhalten.
- Aktuelle Levent-Seite zur visuellen Abwägung geprüft.

## 2026-09-11 – Launch-Ready Abschnittswechsel
- Videoaufzeichnung geprüft und Abschnittsrhythmus auf Schwarz/Weiß im Wechsel korrigiert.
- Hero bleibt schwarz; Leistungen und FAQ sind jetzt schwarze Kontrastabschnitte, Referenzen, Ablauf und Kontakt bleiben weiß.
- Weiße Schrift in schwarzen Abschnitten und dunkle Schrift in weißen Abschnitten explizit korrigiert.
- Karten, Rahmen, Hover-Zustände und Akzentverläufe an den jeweiligen Hintergrund angepasst.
- Build und ESLint erfolgreich.

## 2026-09-11 – Kontrast- und Abschnittsfehler behoben
- Proof-Leiste („Ein Ansprechpartner“, „Ein klarer Plan“, „Ein gemeinsames Ziel“) auf klar lesbare schwarze Schrift gesetzt.
- Kundenstimmen („Vertrauen entsteht durch gute Arbeit.“) vor den Referenz-Slider verschoben.
- Referenzbereich („Websites, die im Kopf bleiben.“) darunter platziert und als schwarzer Abschnitt mit weißer Überschrift gestaltet.
- Kontakt-Infokarte typografisch stabilisiert.
- Build und ESLint erfolgreich.

## 2026-09-11 – Hero-Porträt sauber integriert
- Porträt im Hero um eine weichgezeichnete, vergrößerte Hintergrundebene ergänzt.
- Vordergrundbild mit transparenten seitlichen und unteren Verläufen integriert, damit es sauber in den schwarzen Hero übergeht.
- Desktop- und Mobile-Positionierung separat optimiert.
- Caption und Bild-Layer z-index-sicher gestapelt.
- Build und ESLint erfolgreich.

## 2026-09-11 – Hero-Rechtsfläche gestaltet
- Leeren rechten Hero-Bereich als bewusstes Gestaltungselement ausgebaut.
- Vertikale Akzentlinie, Index-Anzeige und kompakte Digital-Perfect-Leistungskarte ergänzt.
- Die Elemente liegen über dem weich verlaufenden Bildhintergrund und füllen die rechte Fläche ohne den Hero-Text zu überlagern.
- Build und ESLint erfolgreich.
