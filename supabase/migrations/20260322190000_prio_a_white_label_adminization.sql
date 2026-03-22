BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

ALTER TABLE public.global_settings
  ADD COLUMN IF NOT EXISTS website_title text,
  ADD COLUMN IF NOT EXISTS meta_title text,
  ADD COLUMN IF NOT EXISTS meta_description text,
  ADD COLUMN IF NOT EXISTS favicon_path text,
  ADD COLUMN IF NOT EXISTS og_image_path text,
  ADD COLUMN IF NOT EXISTS tracking_head_code text,
  ADD COLUMN IF NOT EXISTS tracking_body_code text,
  ADD COLUMN IF NOT EXISTS enable_tab_retention boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS tab_retention_texts jsonb DEFAULT '[]'::jsonb;

CREATE TABLE IF NOT EXISTS public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text,
  bio text,
  image_url text,
  linkedin_url text,
  sort_order integer DEFAULT 0,
  is_visible boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text,
  company text,
  quote text,
  image_url text,
  rating integer DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  sort_order integer DEFAULT 0,
  is_visible boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.legal_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE CHECK (slug IN ('impressum', 'datenschutz', 'agb')),
  title text NOT NULL,
  seo_title text,
  seo_description text,
  body text,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_pages ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'team_members' AND policyname = 'Public read visible team_members'
  ) THEN
    CREATE POLICY "Public read visible team_members"
      ON public.team_members
      FOR SELECT
      USING (coalesce(is_visible, true) = true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'team_members' AND policyname = 'Admins manage team_members'
  ) THEN
    CREATE POLICY "Admins manage team_members"
      ON public.team_members
      FOR ALL
      USING (public.app_role()::text = 'admin')
      WITH CHECK (public.app_role()::text = 'admin');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'testimonials' AND policyname = 'Public read visible testimonials'
  ) THEN
    CREATE POLICY "Public read visible testimonials"
      ON public.testimonials
      FOR SELECT
      USING (coalesce(is_visible, true) = true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'testimonials' AND policyname = 'Admins manage testimonials'
  ) THEN
    CREATE POLICY "Admins manage testimonials"
      ON public.testimonials
      FOR ALL
      USING (public.app_role()::text = 'admin')
      WITH CHECK (public.app_role()::text = 'admin');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'legal_pages' AND policyname = 'Public read published legal_pages'
  ) THEN
    CREATE POLICY "Public read published legal_pages"
      ON public.legal_pages
      FOR SELECT
      USING (is_published = true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'legal_pages' AND policyname = 'Admins manage legal_pages'
  ) THEN
    CREATE POLICY "Admins manage legal_pages"
      ON public.legal_pages
      FOR ALL
      USING (public.app_role()::text = 'admin')
      WITH CHECK (public.app_role()::text = 'admin');
  END IF;
END
$$;

DROP TRIGGER IF EXISTS update_team_members_updated_at ON public.team_members;
CREATE TRIGGER update_team_members_updated_at
BEFORE UPDATE ON public.team_members
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_testimonials_updated_at ON public.testimonials;
CREATE TRIGGER update_testimonials_updated_at
BEFORE UPDATE ON public.testimonials
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_legal_pages_updated_at ON public.legal_pages;
CREATE TRIGGER update_legal_pages_updated_at
BEFORE UPDATE ON public.legal_pages
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.legal_pages (slug, title, seo_title, seo_description, body, is_published)
VALUES
  (
    'impressum',
    'Impressum',
    'Impressum | Digital-Perfect',
    'Anbieterkennzeichnung, Kontaktinformationen und rechtliche Hinweise.',
    '<h2>Angaben gemäß § 5 TMG / § 25 MedienG</h2><p>Bitte pflege diese Seite im Admin unter Recht &amp; SEO.</p><h2>Kontakt</h2><p>Bitte ergänze Firmenname, Anschrift und Kontaktangaben.</p>',
    true
  ),
  (
    'datenschutz',
    'Datenschutzerklärung',
    'Datenschutzerklärung | Digital-Perfect',
    'Informationen zur Verarbeitung personenbezogener Daten auf dieser Website.',
    '<h2>1. Datenschutz auf einen Blick</h2><p>Bitte pflege diese Seite vollständig im Admin unter Recht &amp; SEO.</p>',
    true
  ),
  (
    'agb',
    'Allgemeine Geschäftsbedingungen',
    'AGB | Digital-Perfect',
    'Vertragsbedingungen für digitale Leistungen, Projekte und Produkte.',
    '<h2>§ 1 Geltungsbereich</h2><p>Bitte pflege diese Seite vollständig im Admin unter Recht &amp; SEO.</p>',
    true
  )
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.site_settings (key, value)
VALUES
  (
    'forum_teaser_content',
    '{"badge":"Community Funnel","title":"Die aktivsten Diskussionen aus unserem Forum 🚀","description":"Hol dir direkt Praxiswissen, Erfahrungen und konkrete Antworten aus der Digital-Perfect Community.","cta_text":"Zur Community","cta_link":"/forum","empty_text":"Praxisnahe Antworten, Insights und Diskussionen aus unserer Community.","fallback_author":"Digital-Perfect","fallback_chip":"Community Thread"}'
  ),
  (
    'forum_sidebar_content',
    '{"categories_title":"Forum Kategorien","categories_description":"Finde schneller die passende Themenwelt für deine Frage oder dein Projekt.","support_badge":"Premium Support","support_title":"Projektberatung anfragen","support_text":"Du willst statt Theorie ein performantes Setup für Webdesign, SEO oder Funnel-Architektur?","support_button_text":"Login & Zugang sichern","support_button_link":"/login"}'
  ),
  (
    'contact_section_content',
    '{"panel_description":"Fülle das Formular aus und wir melden uns zeitnah für eine erste, kostenlose Potenzialanalyse.","trust_signals":[{"icon":"clock","title":"Schnelle Rückmeldung","text":"Wir melden uns in der Regel am selben Tag."},{"icon":"phone","title":"Persönlicher Austausch","text":"Kein Callcenter, direkter Draht zum Experten."},{"icon":"mail","title":"Klare nächste Schritte","text":"Du bekommst sofort einen sauberen Fahrplan."}],"labels":{"name":"Name *","company":"Unternehmen","email":"E-Mail *","phone":"Telefonnummer","service":"Was brauchst du? *","budget":"Budgetrahmen","website":"Aktuelle Webseite (optional)","description":"Projekt kurz beschreiben *","privacy":"Ich bin mit den Datenschutzbestimmungen einverstanden und stimme der Verarbeitung meiner Angaben zur Kontaktaufnahme zu."},"placeholders":{"name":"Max Mustermann","company":"Muster GmbH","email":"max@beispiel.de","phone":"+43 664 1234567","website":"https://deine-webseite.at","description":"Beschreib kurz dein Projekt, Angebot und Ziel ...","service_placeholder":"Bitte wählen...","budget_placeholder":"Bitte wählen..."},"service_options":["Webdesign / neue Webseite","Onlineshop-Erstellung","Website-Relaunch","Landingpages / Verkaufsseiten","SEO & KI-Sichtbarkeit","Sonstiges / noch unsicher"],"budget_options":["unter 2.000 €","2.000 – 5.000 €","5.000 – 10.000 €","über 10.000 €"],"submit_text":"Anfrage senden","submitting_text":"Wird gesendet...","success_title":"Vielen Dank!","success_text":"Wir haben deine Anfrage erhalten und melden uns in Kürze persönlich bei dir zurück.","success_toast_title":"Erfolgreich gesendet!","success_toast_description":"Wir melden uns in Kürze bei dir.","error_toast_title":"Fehler","error_toast_description":"Bitte versuche es erneut."}'
  ),
  (
    'home_trust_points',
    '[{"title":"Direkter Draht statt Agentur-Weitergabe","desc":"Keine anonymen Ketten, kein verlorenes Briefing. Entscheidungen werden schneller und sauberer umgesetzt."},{"title":"Premium-Look mit Performance-Fokus","desc":"Moderne Wirkung, lesbare Hierarchie und ein Aufbau, der auch mobil hochwertig verkauft."},{"title":"Sichtbarkeit mit wirtschaftlicher Logik","desc":"SEO, Conversion und Nutzerführung werden als Business-System gedacht – nicht als Einzelbaustellen."},{"title":"Robuste Struktur statt Zufallsdesign","desc":"Fallbacks, klare Sektionen und saubere Komponenten machen die Website belastbar und adminfähig."}]'
  ),
  ('home_why_choose_body', 'Wir verschwenden keine Zeit mit endlosen Feedbackschleifen und abstrakten Konzepten. Wir liefern funktionierende digitale Infrastruktur, die Leads generiert und Marken nach vorn bringt.'),
  ('home_team_kicker', 'Team & Verantwortung'),
  ('home_team_title', 'Wer hinter Strategie, Design und Performance steht'),
  ('home_team_description', 'Mehr Vertrauen entsteht, wenn klar ist, wer liefert. Diese Sektion lädt nur sichtbare Teamprofile aus Supabase.'),
  ('home_testimonials_description', 'Echte Rückmeldungen aus Projekten, Relaunches und laufenden SEO-Setups – direkt aus der Praxis.'),
  ('home_trust_kicker', 'Vertrauen & System'),
  ('home_trust_title', 'Warum dieser Auftritt nicht nur schön, sondern belastbar ist')
ON CONFLICT (key) DO NOTHING;

DELETE FROM public.site_settings
WHERE key IN ('home_header_topbar', 'home_why_choose_description');

NOTIFY pgrst, 'reload schema';

COMMIT;
