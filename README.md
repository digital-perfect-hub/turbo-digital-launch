# Digital Perfect Hub

Mandantenfähiger Vite-/React-/TypeScript-Hub für White-Label-Websites, Landingpages, Shop- und Content-Module auf Supabase.

## Stack
- Vite + React 18 + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (Auth, DB, Storage)
- Nginx SPA Routing

## Lokale Entwicklung
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## Deployment-Hinweis
Für das Live-System muss Nginx SPA-Routing aktiv sein:

```nginx
try_files $uri $uri/ /index.html;
```

## Launch-Check
- Supabase Migrationen ausführen
- Umgebungsvariablen für Supabase setzen
- Branding-/Seitenbilder in den öffentlichen Buckets bereitstellen
- Domain/Hostname in `site_domains` korrekt pflegen
