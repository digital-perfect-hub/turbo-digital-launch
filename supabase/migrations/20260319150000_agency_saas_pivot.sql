-- 1. EXTENSIONS & FUNKTIONEN
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 2. DATENTYPEN
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. TABELLEN ERSTELLEN
CREATE TABLE IF NOT EXISTS public.hero_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_text text DEFAULT 'Nr. 1 Agentur für SEO & Webdesign in Österreich',
  headline text DEFAULT 'Bullenpower für Webdesign, SEO & Online-Marketing',
  subheadline text DEFAULT 'Wir katapultieren dein Unternehmen an die Spitze von Google',
  cta_text text DEFAULT 'Jetzt kostenlos beraten lassen',
  stat1_value text DEFAULT '150+',
  stat1_label text DEFAULT 'Projekte',
  stat2_value text DEFAULT '12+',
  stat2_label text DEFAULT 'Jahre Erfahrung',
  stat3_value text DEFAULT '98%',
  stat3_label text DEFAULT 'Kundenzufriedenheit',
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.global_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  primary_color_hex TEXT DEFAULT '#2563eb',
  secondary_color_hex TEXT DEFAULT '#1e40af',
  font_family TEXT DEFAULT 'default',
  company_name TEXT DEFAULT 'Digital-Perfect',
  logo_path TEXT,
  imprint_company TEXT,
  imprint_address TEXT,
  imprint_contact TEXT,
  imprint_legal TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Weitere Tabellen aus den vorherigen Migrations sicherstellen
CREATE TABLE IF NOT EXISTS public.services (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), icon_name text DEFAULT 'Globe', title text NOT NULL, description text, sort_order integer DEFAULT 0, is_visible boolean DEFAULT true, updated_at timestamptz DEFAULT now());
CREATE TABLE IF NOT EXISTS public.portfolio_items (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), title text NOT NULL, description text, image_url text, is_visible boolean DEFAULT true, sort_order integer DEFAULT 0, updated_at timestamptz DEFAULT now());
CREATE TABLE IF NOT EXISTS public.products (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), title text NOT NULL, price numeric(10,2) NOT NULL, is_active boolean DEFAULT true, sort_order integer DEFAULT 0, updated_at timestamptz DEFAULT now());
CREATE TABLE IF NOT EXISTS public.faq_items (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), question text NOT NULL, answer text NOT NULL, is_visible boolean DEFAULT true, sort_order integer DEFAULT 0, updated_at timestamptz DEFAULT now());
CREATE TABLE IF NOT EXISTS public.site_settings (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), key text UNIQUE NOT NULL, value text, updated_at timestamptz DEFAULT now());

-- 4. SICHERHEIT (RLS & POLICIES)
ALTER TABLE public.hero_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read hero" ON public.hero_content FOR SELECT USING (true);
CREATE POLICY "Public read global_settings" ON public.global_settings FOR SELECT USING (true);
CREATE POLICY "Public read services" ON public.services FOR SELECT USING (is_visible = true);
CREATE POLICY "Public read portfolio" ON public.portfolio_items FOR SELECT USING (is_visible = true);
CREATE POLICY "Public read products" ON public.products FOR SELECT USING (is_active = true);
CREATE POLICY "Public read faq" ON public.faq_items FOR SELECT USING (is_visible = true);
CREATE POLICY "Public read settings" ON public.site_settings FOR SELECT USING (true);

-- 5. AUTOMATISIERUNG (TRIGGERS)
DROP TRIGGER IF EXISTS update_hero_content_updated_at ON public.hero_content;
CREATE TRIGGER update_hero_content_updated_at BEFORE UPDATE ON public.hero_content FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. INITIALE DATEN (SEEDS)
INSERT INTO public.global_settings (id, company_name) VALUES ('default', 'Digital-Perfect') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.hero_content (badge_text) SELECT 'Nr. 1 Agentur für SEO & Webdesign in Österreich' WHERE NOT EXISTS (SELECT 1 FROM public.hero_content);