BEGIN;

CREATE TABLE IF NOT EXISTS public.site_billing_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_price_id text,
  plan_key text,
  status text,
  current_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT site_billing_profiles_site_id_key UNIQUE (site_id)
);

CREATE TABLE IF NOT EXISTS public.page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  path text NOT NULL,
  page_type text NOT NULL DEFAULT 'page',
  page_slug text,
  session_id text NOT NULL,
  referrer_host text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS site_billing_profiles_site_id_idx ON public.site_billing_profiles (site_id);
CREATE INDEX IF NOT EXISTS page_views_site_id_created_at_idx ON public.page_views (site_id, created_at DESC);
CREATE INDEX IF NOT EXISTS page_views_site_id_session_id_idx ON public.page_views (site_id, session_id);

DROP TRIGGER IF EXISTS update_site_billing_profiles_updated_at ON public.site_billing_profiles;
CREATE TRIGGER update_site_billing_profiles_updated_at
BEFORE UPDATE ON public.site_billing_profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.site_billing_profiles TO authenticated;
GRANT SELECT ON TABLE public.site_billing_profiles TO anon;
GRANT SELECT, INSERT ON TABLE public.page_views TO anon, authenticated;

ALTER TABLE public.site_billing_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'site_billing_profiles' AND policyname = 'Site managers can read billing profiles'
  ) THEN
    CREATE POLICY "Site managers can read billing profiles"
      ON public.site_billing_profiles
      FOR SELECT
      TO authenticated
      USING (
        public.app_role()::text = 'admin'
        OR public.can_manage_site(site_id, ARRAY['owner'::public.site_role, 'admin'::public.site_role])
      );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'site_billing_profiles' AND policyname = 'Site managers can insert billing profiles'
  ) THEN
    CREATE POLICY "Site managers can insert billing profiles"
      ON public.site_billing_profiles
      FOR INSERT
      TO authenticated
      WITH CHECK (
        public.app_role()::text = 'admin'
        OR public.can_manage_site(site_id, ARRAY['owner'::public.site_role, 'admin'::public.site_role])
      );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'site_billing_profiles' AND policyname = 'Site managers can update billing profiles'
  ) THEN
    CREATE POLICY "Site managers can update billing profiles"
      ON public.site_billing_profiles
      FOR UPDATE
      TO authenticated
      USING (
        public.app_role()::text = 'admin'
        OR public.can_manage_site(site_id, ARRAY['owner'::public.site_role, 'admin'::public.site_role])
      )
      WITH CHECK (
        public.app_role()::text = 'admin'
        OR public.can_manage_site(site_id, ARRAY['owner'::public.site_role, 'admin'::public.site_role])
      );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'page_views' AND policyname = 'Anyone can insert page views for active sites'
  ) THEN
    CREATE POLICY "Anyone can insert page views for active sites"
      ON public.page_views
      FOR INSERT
      TO anon, authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM public.sites s
          WHERE s.id = page_views.site_id
            AND s.is_active = true
        )
      );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'page_views' AND policyname = 'Site managers can read page views'
  ) THEN
    CREATE POLICY "Site managers can read page views"
      ON public.page_views
      FOR SELECT
      TO authenticated
      USING (
        public.app_role()::text = 'admin'
        OR public.can_manage_site(site_id, ARRAY['owner'::public.site_role, 'admin'::public.site_role, 'editor'::public.site_role])
      );
  END IF;
END
$$;

COMMIT;
