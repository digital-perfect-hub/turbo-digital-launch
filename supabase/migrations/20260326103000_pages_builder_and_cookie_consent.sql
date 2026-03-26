CREATE TABLE IF NOT EXISTS public.pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  slug text NOT NULL,
  seo_title text,
  seo_description text,
  content_blocks jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS pages_site_id_slug_key ON public.pages (site_id, slug);
CREATE INDEX IF NOT EXISTS pages_site_id_idx ON public.pages (site_id);
CREATE INDEX IF NOT EXISTS pages_site_id_published_idx ON public.pages (site_id, is_published);

ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS update_pages_updated_at ON public.pages;
CREATE TRIGGER update_pages_updated_at
BEFORE UPDATE ON public.pages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'pages'
      AND policyname = 'Public can read published pages'
  ) THEN
    CREATE POLICY "Public can read published pages"
      ON public.pages
      FOR SELECT
      TO anon, authenticated
      USING (is_published = true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'pages'
      AND policyname = 'Tenant admins manage own pages'
  ) THEN
    CREATE POLICY "Tenant admins manage own pages"
      ON public.pages
      FOR ALL
      TO authenticated
      USING (
        public.app_role()::text = 'admin'
        OR public.can_manage_site(site_id, ARRAY['owner'::public.site_role, 'admin'::public.site_role, 'editor'::public.site_role])
      )
      WITH CHECK (
        public.app_role()::text = 'admin'
        OR public.can_manage_site(site_id, ARRAY['owner'::public.site_role, 'admin'::public.site_role, 'editor'::public.site_role])
      );
  END IF;
END
$$;
