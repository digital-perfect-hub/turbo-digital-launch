# Digital-Perfect-Hub — Fortschritts-Log

Git-versioniertes Protokoll für Sessions, Entscheidungen und offene Baustellen. Für Menschen und jede Claude-Session sofort lesbar, ohne extra Tool-Zugriff. Ergänzt das automatische Claude-Gedächtnis (siehe CLAUDE.md → „Kontinuität zwischen Sessions"), ersetzt es nicht.

Neueste Einträge oben. Format: Datum, was gemacht/entschieden wurde, warum, was offen ist.

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
