
-- Enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- User roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role check
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS: admins can read their own roles
CREATE POLICY "Users can read own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Hero content table (single row)
CREATE TABLE public.hero_content (
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
ALTER TABLE public.hero_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hero content public read" ON public.hero_content FOR SELECT USING (true);
CREATE POLICY "Admins can update hero" ON public.hero_content FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert hero" ON public.hero_content FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Services table
CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  icon_name text NOT NULL DEFAULT 'Globe',
  title text NOT NULL,
  description text,
  sort_order integer DEFAULT 0,
  is_visible boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Services public read" ON public.services FOR SELECT USING (is_visible = true);
CREATE POLICY "Admins manage services" ON public.services FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- FAQ items table
CREATE TABLE public.faq_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  sort_order integer DEFAULT 0,
  is_visible boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "FAQ public read" ON public.faq_items FOR SELECT USING (is_visible = true);
CREATE POLICY "Admins manage faq" ON public.faq_items FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Site settings (SEO meta etc.)
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site settings public read" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins manage settings" ON public.site_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Add admin management policies to existing tables
CREATE POLICY "Admins manage portfolio" ON public.portfolio_items FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage products" ON public.products FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can read leads" ON public.leads FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete leads" ON public.leads FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Triggers for updated_at
CREATE TRIGGER update_hero_content_updated_at BEFORE UPDATE ON public.hero_content FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_faq_items_updated_at BEFORE UPDATE ON public.faq_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed hero content
INSERT INTO public.hero_content (id) VALUES (gen_random_uuid());

-- Seed site settings
INSERT INTO public.site_settings (key, value) VALUES
  ('meta_title', 'Digital-Perfect | SEO & Webdesign Agentur Österreich'),
  ('meta_description', 'Nr. 1 Agentur für SEO, Webdesign & Online-Marketing in Österreich. Mehr Sichtbarkeit, mehr Kunden, mehr Umsatz.'),
  ('og_image', '');

-- Seed services
INSERT INTO public.services (icon_name, title, description, sort_order) VALUES
  ('Globe', 'Webdesign & Entwicklung', 'Maßgeschneiderte, blitzschnelle Webseiten die konvertieren – von der Landingpage bis zum komplexen Webshop.', 1),
  ('Search', 'SEO & Local SEO', 'Platz 1 bei Google ist kein Zufall. Wir bringen dein Unternehmen mit datengetriebener SEO nach ganz oben.', 2),
  ('Megaphone', 'Google & Social Ads', 'Maximale Reichweite, minimale Streuverluste. Performance-Marketing das deinen ROI explodieren lässt.', 3),
  ('BarChart3', 'Conversion-Optimierung', 'Mehr Besucher zu Kunden machen. A/B-Tests, Heatmaps und UX-Analysen für messbar mehr Umsatz.', 4),
  ('Star', 'Bewertungsmanagement', 'NFC & QR Bewertungsständer für 5-10x mehr Google-Bewertungen. Vertrauen aufbauen, automatisch.', 5),
  ('Shield', 'Wartung & Support', 'Deine Website in sicheren Händen. Updates, Backups, Monitoring – damit du dich aufs Geschäft konzentrieren kannst.', 6);

-- Seed FAQ items
INSERT INTO public.faq_items (question, answer, sort_order) VALUES
  ('Was kostet eine professionelle Website?', 'Die Kosten variieren je nach Umfang und Anforderungen. Eine einfache Landingpage beginnt ab €1.500, während ein vollständiger Webshop ab €5.000 startet. Wir erstellen dir gerne ein individuelles Angebot.', 1),
  ('Wie lange dauert die Erstellung einer Website?', 'Eine Standard-Website ist in 2-4 Wochen fertig. Komplexere Projekte mit Webshop oder individuellen Funktionen können 4-8 Wochen dauern. Den genauen Zeitplan besprechen wir im Erstgespräch.', 2),
  ('Was bringt SEO meinem Unternehmen?', 'SEO sorgt dafür, dass dein Unternehmen bei Google gefunden wird, wenn potenzielle Kunden nach deinen Leistungen suchen. Das bedeutet mehr qualifizierte Besucher, mehr Anfragen und letztendlich mehr Umsatz – ohne laufende Werbekosten.', 3),
  ('Bietet ihr auch laufende Betreuung an?', 'Ja! Wir bieten verschiedene Wartungspakete an, die Updates, Backups, Sicherheitsmonitoring und Content-Änderungen umfassen. So bleibt deine Website immer aktuell und sicher.', 4),
  ('Wie funktionieren die NFC-Bewertungsständer?', 'Deine Kunden halten einfach ihr Smartphone an den NFC-Chip oder scannen den QR-Code. Sie werden direkt zu deinem Google-Bewertungsprofil weitergeleitet. Ein Tap – eine Bewertung. So einfach war es noch nie, mehr 5-Sterne-Bewertungen zu sammeln.', 5);
