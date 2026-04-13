BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

ALTER TABLE public.landing_pages
  ADD COLUMN IF NOT EXISTS site_id uuid,
  ADD COLUMN IF NOT EXISTS created_at timestamptz,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz;

UPDATE public.landing_pages
SET
  site_id = COALESCE(site_id, '00000000-0000-0000-0000-000000000001'::uuid),
  created_at = COALESCE(created_at, now()),
  updated_at = COALESCE(updated_at, now())
WHERE
  site_id IS NULL
  OR created_at IS NULL
  OR updated_at IS NULL;

ALTER TABLE public.landing_pages
  ALTER COLUMN site_id SET DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
  ALTER COLUMN site_id SET NOT NULL,
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN updated_at SET DEFAULT now(),
  ALTER COLUMN updated_at SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'landing_pages_site_id_fkey'
  ) THEN
    ALTER TABLE public.landing_pages
      ADD CONSTRAINT landing_pages_site_id_fkey
      FOREIGN KEY (site_id) REFERENCES public.sites(id) ON DELETE CASCADE;
  END IF;
END
$$;

DO $$
DECLARE
  con_name text;
BEGIN
  FOR con_name IN
    SELECT c.conname
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public'
      AND t.relname = 'landing_pages'
      AND c.contype = 'u'
      AND pg_get_constraintdef(c.oid) ILIKE '%UNIQUE (slug)%'
  LOOP
    EXECUTE format('ALTER TABLE public.landing_pages DROP CONSTRAINT IF EXISTS %I', con_name);
  END LOOP;
END
$$;

DROP INDEX IF EXISTS public.landing_pages_slug_key;
DROP INDEX IF EXISTS public.landing_pages_slug_idx;

CREATE INDEX IF NOT EXISTS landing_pages_site_id_idx
  ON public.landing_pages (site_id);

CREATE INDEX IF NOT EXISTS landing_pages_site_id_published_idx
  ON public.landing_pages (site_id, is_published);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'landing_pages_site_id_slug_unique'
  ) THEN
    ALTER TABLE public.landing_pages
      ADD CONSTRAINT landing_pages_site_id_slug_unique UNIQUE (site_id, slug);
  END IF;
END
$$;

ALTER TABLE public.landing_pages ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON TABLE public.landing_pages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.landing_pages TO authenticated;

DROP POLICY IF EXISTS "Published landing pages are publicly readable" ON public.landing_pages;
DROP POLICY IF EXISTS "Public can read published landing_pages" ON public.landing_pages;
DROP POLICY IF EXISTS "Tenant editors manage landing_pages" ON public.landing_pages;

CREATE POLICY "Public can read published landing_pages"
  ON public.landing_pages
  FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

CREATE POLICY "Tenant editors manage landing_pages"
  ON public.landing_pages
  FOR ALL
  TO authenticated
  USING (public.can_edit_site_content(site_id))
  WITH CHECK (public.can_edit_site_content(site_id));

DROP TRIGGER IF EXISTS update_landing_pages_updated_at ON public.landing_pages;
CREATE TRIGGER update_landing_pages_updated_at
BEFORE UPDATE ON public.landing_pages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

NOTIFY pgrst, 'reload schema';

COMMIT;
