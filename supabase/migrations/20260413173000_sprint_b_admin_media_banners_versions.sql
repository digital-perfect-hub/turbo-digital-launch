CREATE TABLE IF NOT EXISTS public.media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  bucket text NOT NULL DEFAULT 'branding',
  storage_path text NOT NULL UNIQUE,
  public_url text,
  title text,
  alt_text text,
  folder text,
  tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  mime_type text,
  file_size integer,
  width integer,
  height integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS media_assets_site_id_idx ON public.media_assets (site_id);
CREATE INDEX IF NOT EXISTS media_assets_folder_idx ON public.media_assets (folder);
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
DROP TRIGGER IF EXISTS update_media_assets_updated_at ON public.media_assets;
CREATE TRIGGER update_media_assets_updated_at
BEFORE UPDATE ON public.media_assets
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'media_assets' AND policyname = 'Tenant admins manage own media assets'
  ) THEN
    CREATE POLICY "Tenant admins manage own media assets"
      ON public.media_assets
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

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.media_assets TO authenticated;

CREATE TABLE IF NOT EXISTS public.banner_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  slug text NOT NULL,
  name text NOT NULL,
  label text,
  headline text,
  description text,
  button_label text,
  button_href text,
  image_path text,
  image_alt text,
  tone text NOT NULL DEFAULT 'accent',
  placement text NOT NULL DEFAULT 'inline',
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT banner_campaigns_site_id_slug_key UNIQUE(site_id, slug)
);

CREATE INDEX IF NOT EXISTS banner_campaigns_site_id_idx ON public.banner_campaigns (site_id);
CREATE INDEX IF NOT EXISTS banner_campaigns_active_idx ON public.banner_campaigns (site_id, is_active);
ALTER TABLE public.banner_campaigns ENABLE ROW LEVEL SECURITY;
DROP TRIGGER IF EXISTS update_banner_campaigns_updated_at ON public.banner_campaigns;
CREATE TRIGGER update_banner_campaigns_updated_at
BEFORE UPDATE ON public.banner_campaigns
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'banner_campaigns' AND policyname = 'Tenant admins manage own banner campaigns'
  ) THEN
    CREATE POLICY "Tenant admins manage own banner campaigns"
      ON public.banner_campaigns
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

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.banner_campaigns TO authenticated;

CREATE TABLE IF NOT EXISTS public.landing_page_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  landing_page_id uuid NOT NULL REFERENCES public.landing_pages(id) ON DELETE CASCADE,
  site_id uuid NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  slug text NOT NULL,
  meta_title text,
  meta_description text,
  is_published boolean NOT NULL DEFAULT false,
  page_blocks jsonb NOT NULL DEFAULT '[]'::jsonb,
  version_number integer NOT NULL,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT landing_page_versions_unique_version UNIQUE(landing_page_id, version_number)
);

CREATE INDEX IF NOT EXISTS landing_page_versions_page_idx ON public.landing_page_versions (landing_page_id, created_at DESC);
CREATE INDEX IF NOT EXISTS landing_page_versions_site_idx ON public.landing_page_versions (site_id);
ALTER TABLE public.landing_page_versions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'landing_page_versions' AND policyname = 'Tenant admins manage own landing page versions'
  ) THEN
    CREATE POLICY "Tenant admins manage own landing page versions"
      ON public.landing_page_versions
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

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.landing_page_versions TO authenticated;
