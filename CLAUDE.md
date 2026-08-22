# Digital-Perfect-Hub — CLAUDE.md

## Projektidentität

Digital-Perfect Hub (Repo: `turbo-digital-launch`, live: digital-perfect.com) ist ein mandantenfähiger Vite/React/TypeScript-Hub für White-Label-Websites, Landingpages, Shop- und Content-Module auf Supabase. Öffentlich positioniert als "SEO & Webdesign Agentur Linz" (Gründer: Markus Schulz) — die Multi-Tenant/White-Label-Architektur ist bereits gebaut, aktuell aber mit genau einem echten Tenant (der eigenen Seite) live.

GitHub-Repository: `github.com/digital-perfect-hub/turbo-digital-launch`

## Architektur-Gesetze

Die verbindlichen technischen Regeln (Tech-Stack, RLS/Secrets, SPA-Routing, Bild-Performance, SEO-Meta-Grenzen, Coding-Regeln) gelten **gemeinsam für Rank-Scout und Digital-Perfect** und stehen in [`.cursorrules.txt`](.cursorrules.txt) im Repo-Root — dort nachlesen, nicht hier duplizieren. Kurzfassung der Digital-Perfect-spezifischen Regel daraus: `global_settings`-Tabelle steuert dynamisch Primärfarbe/Logo/Fonts, Texte müssen Admin-editierbar sein (Headless-CMS-light), keine hardcodierten Kunden-Daten im Frontend.

## Kontinuität zwischen Sessions

Zwei sich ergänzende Mechanismen (kein Tool namens `project_memory_read`/`project_memory_write` — existiert nicht):

1. **PROGRESS.md** (dieses Repo, Git-versioniert): laufendes Fortschritts-Log für Sessions, Entscheidungen und offene Baustellen. Für Menschen und jede Session ohne Extra-Zugriff lesbar.
2. **Automatisches Claude-Gedächtnis** (außerhalb des Repos, sitzungsübergreifend): wird automatisch geladen, hält kompaktere Zusammenfassungen fest.

Verbindlich:

- Am Ende einer Arbeitssitzung (bzw. nach relevanten Erkenntnissen, Entscheidungen oder Fixes) einen Eintrag in PROGRESS.md ergänzen: was wurde gemacht, warum, offene Punkte. Bei laufenden/ungelösten Themen den bestehenden Eintrag aktualisieren statt einen neuen anzuhängen.
- Vor Beginn einer neuen Aufgabe PROGRESS.md (mindestens die obersten/aktuellsten Einträge) lesen.
- PROGRESS.md ersetzt keine Git-Historie oder Code-Dokumentation – es hält nur Kontext fest, der nicht aus dem Code ableitbar ist (Entscheidungen, offene Bugs, Deploy-Status, bereits ausprobierte und verworfene Lösungsansätze).

Wichtige Einschränkung: Eine Session kann sich nicht automatisch an den kompletten Wortlaut früherer Chats erinnern, die nicht in PROGRESS.md oder dem automatischen Gedächtnis festgehalten wurden. Bei Unsicherheit, ob etwas „schon mal besprochen" wurde: in PROGRESS.md nachsehen statt zu raten.

## Live-Datenänderungen

Ein großer Teil der Homepage (Sections, Farben, Texte, Navigation) wird zur Laufzeit aus Supabase gelesen (`site_settings`, `global_settings`, `hero_content` u.a.), nicht aus Code-Defaults. Das heißt:

- Farb-/Text-/Struktur-Änderungen brauchen oft einen echten Supabase-Schreibzugriff (nicht nur einen Git-Push), um live sichtbar zu werden — siehe PROGRESS.md für den bisher genutzten Weg (Supabase-MCP-Verbindung, site_id `00000000-0000-0000-0000-000000000001`).
- Die Supabase-MCP-Verbindung ist pro Organisation autorisiert; Digital-Perfect liegt in einer anderen Organisation als Rank-Scout. Vor Live-DB-Arbeit mit `list_projects` prüfen, ob `wevlxnlaxyzsobkaeoyi` sichtbar ist.
- `index.html` wird bei Cloudflare 4h gecacht — nach einem Deploy vor der Live-Verifikation den tatsächlichen Asset-Hash prüfen (nicht nur "sollte jetzt live sein" annehmen), sonst wird ein Cache-Artefakt leicht mit einem echten Bug verwechselt.

## Arbeitsstil für dieses Projekt

Wie in `.cursorrules.txt` beschrieben: Deutsch, direkt, faktenbasiert. Bei Codeänderungen nachvollziehbar machen (Vorher/Nachher), vor Deploy/Push technisch prüfen (tsc, Build, Lint), riskante bzw. schwer rückgängig zu machende Aktionen (Force-Push, Live-DB-Schreibzugriffe, destruktive Git-Befehle) vorher ankündigen bzw. bestätigen lassen.
