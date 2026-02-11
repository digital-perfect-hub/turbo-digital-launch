
# Farbschema-Umstellung: Von "Gothic Dark" zu "Digital Premium Light"

## Problem
Die gesamte Webseite ist aktuell durchgehend dunkel (Hintergrund bei 6% Helligkeit). Die Referenzseite digital-perfect.com verwendet jedoch:
- **Header/Navigation**: Weisser/heller Hintergrund mit dunklem Text
- **Hero-Bereich**: Dunkler Hintergrund mit Teal/Gruen-Gradient (bleibt dunkel -- das ist gut)
- **Alle anderen Sektionen**: Weisser/heller Hintergrund mit dunklem Text
- **Footer**: Dunkel

## Umsetzungsplan

### 1. CSS-Variablen komplett ueberarbeiten (index.css)
Die `:root`-Variablen auf ein helles Farbschema umstellen:
- `--background`: Weiss/Hellgrau (~98% Helligkeit)
- `--foreground`: Dunkelgrau/Schwarz fuer Lesbarkeit
- `--card` / `--surface`: Helles Grau statt dunkles Grau
- `--muted-foreground`: Mittelgrau fuer Subtexte
- `--border`: Helles Grau statt dunkles Grau
- `--primary` (Gold) und `--secondary` (Emerald) bleiben gleich
- Neue Variablen fuer den dunklen Hero-Bereich (z.B. `--hero-bg`)

### 2. Utility-Klassen anpassen (index.css)
- `.glass-card`: Weiss mit leichtem Schatten statt dunklem Glassmorphism
- `.btn-outline`: Border in Grau, Text dunkel
- `.section-label` / `.section-title`: Dunkler Text
- Neuer `.dark-section`-Helfer fuer Hero und Footer

### 3. Header (Header.tsx)
- Scroll-Zustand: Weiss mit leichtem Schatten statt dunklem Blur
- Nav-Links: Dunkelgraue Schrift
- Mobile Menu: Weisser Hintergrund

### 4. Hero Section (HeroSection.tsx)
- Behaelt den dunklen Hintergrund (wie auf der Referenzseite)
- Eigene dunkle Klassen verwenden, unabhaengig vom globalen hellen Theme
- Teal/Gruen-Gradient beibehalten

### 5. Trust, Services, Portfolio, Shop, Testimonials, FAQ (alle Sektionen)
- Heller Hintergrund
- Ueberschriften in Schwarz/Dunkelgrau
- Cards mit weissem Hintergrund und subtilen Schatten
- `gradient-gold-text` bleibt als Akzent

### 6. Kontaktformular (ContactSection.tsx)
- Heller Hintergrund oder leicht abgesetzter Bereich
- Formularfelder mit hellem Hintergrund und subtilen Borders

### 7. Footer (Footer.tsx)
- Bleibt dunkel (wie auf der Referenzseite) -- eigene dunkle Klassen

### 8. Tailwind Config
- Eventuell Farb-Tokens ergaenzen fuer den hellen Modus

## Technische Details

Betroffene Dateien:
- `src/index.css` -- CSS-Variablen und Utility-Klassen
- `src/components/Header.tsx` -- Helles Nav-Design
- `src/components/HeroSection.tsx` -- Explizit dunkle Klassen
- `src/components/TrustSection.tsx` -- Heller Hintergrund
- `src/components/ServicesSection.tsx` -- Helle Cards
- `src/components/PortfolioSection.tsx` -- Helle Cards
- `src/components/ShopSection.tsx` -- Helle Cards
- `src/components/TestimonialsSection.tsx` -- Heller Hintergrund
- `src/components/FAQSection.tsx` -- Helle Accordion-Items
- `src/components/ContactSection.tsx` -- Helles Formular
- `src/components/Footer.tsx` -- Bleibt dunkel mit eigenen Klassen

Die Struktur, Animationen und Inhalte bleiben komplett erhalten. Nur das Farbschema wird umgestellt.
