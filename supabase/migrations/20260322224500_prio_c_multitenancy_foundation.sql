BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
BEGIN
  CREATE TYPE public.site_role AS ENUM ('owner', 'admin', 'editor', 'viewer');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

CREATE TABLE IF NOT EXISTS public.sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL,
  name text NOT NULL,
  description text,
  primary_domain text,
  logo_path text,
  is_default boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.site_domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  hostname text NOT NULL,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_site_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  site_id uuid NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  role public.site_role NOT NULL DEFAULT 'editor',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS sites_slug_key ON public.sites (slug);
CREATE UNIQUE INDEX IF NOT EXISTS site_domains_hostname_key ON public.site_domains (lower(hostname));
CREATE UNIQUE INDEX IF NOT EXISTS site_domains_site_id_hostname_key ON public.site_domains (site_id, lower(hostname));
CREATE UNIQUE INDEX IF NOT EXISTS user_site_roles_user_id_site_id_role_key ON public.user_site_roles (user_id, site_id, role);
CREATE INDEX IF NOT EXISTS site_domains_site_id_idx ON public.site_domains (site_id);
CREATE INDEX IF NOT EXISTS user_site_roles_user_id_idx ON public.user_site_roles (user_id);
CREATE INDEX IF NOT EXISTS user_site_roles_site_id_idx ON public.user_site_roles (site_id);

DROP TRIGGER IF EXISTS update_sites_updated_at ON public.sites;
CREATE TRIGGER update_sites_updated_at
BEFORE UPDATE ON public.sites
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_site_domains_updated_at ON public.site_domains;
CREATE TRIGGER update_site_domains_updated_at
BEFORE UPDATE ON public.site_domains
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_site_roles_updated_at ON public.user_site_roles;
CREATE TRIGGER update_user_site_roles_updated_at
BEFORE UPDATE ON public.user_site_roles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.sites (id, slug, name, description, primary_domain, is_default, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'default',
  'Default Site',
  'Seed site for the existing Digital-Perfect installation.',
  'localhost',
  true,
  true
)
ON CONFLICT (id) DO UPDATE
SET slug = EXCLUDED.slug,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    primary_domain = COALESCE(public.sites.primary_domain, EXCLUDED.primary_domain),
    is_default = true,
    is_active = true;

INSERT INTO public.site_domains (site_id, hostname, is_primary)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'localhost', true),
  ('00000000-0000-0000-0000-000000000001', '127.0.0.1', false)
ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION public.normalize_hostname(value text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT nullif(
    regexp_replace(
      regexp_replace(lower(trim(coalesce(value, ''))), '^https?://', ''),
      '[:/].*$',
      ''
    ),
    ''
  )
$$;

CREATE OR REPLACE FUNCTION public.has_site_role(
  _user_id uuid,
  _site_id uuid,
  _roles public.site_role[] DEFAULT ARRAY['owner'::public.site_role, 'admin'::public.site_role, 'editor'::public.site_role]
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_site_roles usr
    WHERE usr.user_id = _user_id
      AND usr.site_id = _site_id
      AND usr.role = ANY(_roles)
  )
$$;

CREATE OR REPLACE FUNCTION public.can_manage_site(
  _site_id uuid,
  _roles public.site_role[] DEFAULT ARRAY['owner'::public.site_role, 'admin'::public.site_role, 'editor'::public.site_role]
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT (
    auth.uid() IS NOT NULL AND (
      public.app_role()::text = 'admin'
      OR public.has_site_role(auth.uid(), _site_id, _roles)
    )
  )
$$;

CREATE OR REPLACE FUNCTION public.list_accessible_sites()
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
  primary_domain text,
  is_default boolean,
  is_active boolean,
  logo_path text,
  user_role text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    s.id,
    s.name,
    s.slug,
    COALESCE(
      sd.hostname,
      s.primary_domain
    ) AS primary_domain,
    s.is_default,
    s.is_active,
    s.logo_path,
    CASE
      WHEN public.app_role()::text = 'admin' THEN 'admin'
      ELSE usr.role::text
    END AS user_role
  FROM public.sites s
  LEFT JOIN LATERAL (
    SELECT d.hostname
    FROM public.site_domains d
    WHERE d.site_id = s.id
    ORDER BY d.is_primary DESC, d.created_at ASC
    LIMIT 1
  ) sd ON true
  LEFT JOIN public.user_site_roles usr
    ON usr.site_id = s.id
   AND usr.user_id = auth.uid()
  WHERE s.is_active = true
    AND (
      public.app_role()::text = 'admin'
      OR (auth.uid() IS NOT NULL AND usr.user_id IS NOT NULL)
    )
  ORDER BY s.is_default DESC, s.name ASC
$$;

CREATE OR REPLACE FUNCTION public.resolve_site_by_hostname(p_hostname text)
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
  primary_domain text,
  is_default boolean,
  is_active boolean,
  logo_path text,
  user_role text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH normalized AS (
    SELECT public.normalize_hostname(p_hostname) AS hostname
  ),
  matched AS (
    SELECT
      s.id,
      s.name,
      s.slug,
      COALESCE(sd.hostname, s.primary_domain) AS primary_domain,
      s.is_default,
      s.is_active,
      s.logo_path,
      CASE
        WHEN auth.uid() IS NULL THEN NULL
        WHEN public.app_role()::text = 'admin' THEN 'admin'
        ELSE (
          SELECT usr.role::text
          FROM public.user_site_roles usr
          WHERE usr.user_id = auth.uid()
            AND usr.site_id = s.id
          ORDER BY CASE usr.role
            WHEN 'owner' THEN 1
            WHEN 'admin' THEN 2
            WHEN 'editor' THEN 3
            ELSE 4
          END
          LIMIT 1
        )
      END AS user_role,
      0 AS priority
    FROM public.sites s
    JOIN public.site_domains sd
      ON sd.site_id = s.id
    CROSS JOIN normalized n
    WHERE s.is_active = true
      AND lower(sd.hostname) = lower(n.hostname)

    UNION ALL

    SELECT
      s.id,
      s.name,
      s.slug,
      s.primary_domain,
      s.is_default,
      s.is_active,
      s.logo_path,
      CASE
        WHEN auth.uid() IS NULL THEN NULL
        WHEN public.app_role()::text = 'admin' THEN 'admin'
        ELSE (
          SELECT usr.role::text
          FROM public.user_site_roles usr
          WHERE usr.user_id = auth.uid()
            AND usr.site_id = s.id
          ORDER BY CASE usr.role
            WHEN 'owner' THEN 1
            WHEN 'admin' THEN 2
            WHEN 'editor' THEN 3
            ELSE 4
          END
          LIMIT 1
        )
      END AS user_role,
      1 AS priority
    FROM public.sites s
    CROSS JOIN normalized n
    WHERE s.is_active = true
      AND lower(coalesce(s.primary_domain, '')) = lower(n.hostname)

    UNION ALL

    SELECT
      s.id,
      s.name,
      s.slug,
      COALESCE(sd.hostname, s.primary_domain) AS primary_domain,
      s.is_default,
      s.is_active,
      s.logo_path,
      CASE
        WHEN auth.uid() IS NULL THEN NULL
        WHEN public.app_role()::text = 'admin' THEN 'admin'
        ELSE (
          SELECT usr.role::text
          FROM public.user_site_roles usr
          WHERE usr.user_id = auth.uid()
            AND usr.site_id = s.id
          ORDER BY CASE usr.role
            WHEN 'owner' THEN 1
            WHEN 'admin' THEN 2
            WHEN 'editor' THEN 3
            ELSE 4
          END
          LIMIT 1
        )
      END AS user_role,
      2 AS priority
    FROM public.sites s
    LEFT JOIN LATERAL (
      SELECT d.hostname
      FROM public.site_domains d
      WHERE d.site_id = s.id
      ORDER BY d.is_primary DESC, d.created_at ASC
      LIMIT 1
    ) sd ON true
    WHERE s.is_active = true
      AND s.is_default = true
  )
  SELECT DISTINCT ON (matched.id)
    matched.id,
    matched.name,
    matched.slug,
    matched.primary_domain,
    matched.is_default,
    matched.is_active,
    matched.logo_path,
    matched.user_role
  FROM matched
  ORDER BY matched.id, matched.priority
  LIMIT 1
$$;

GRANT EXECUTE ON FUNCTION public.list_accessible_sites() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.resolve_site_by_hostname(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_site_role(uuid, uuid, public.site_role[]) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.can_manage_site(uuid, public.site_role[]) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.normalize_hostname(text) TO anon, authenticated, service_role;

ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_site_roles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'sites' AND policyname = 'Authenticated users can read accessible sites'
  ) THEN
    CREATE POLICY "Authenticated users can read accessible sites"
      ON public.sites
      FOR SELECT
      TO authenticated
      USING (
        public.app_role()::text = 'admin'
        OR EXISTS (
          SELECT 1
          FROM public.user_site_roles usr
          WHERE usr.site_id = public.sites.id
            AND usr.user_id = auth.uid()
        )
      );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'sites' AND policyname = 'Global admins can insert sites'
  ) THEN
    CREATE POLICY "Global admins can insert sites"
      ON public.sites
      FOR INSERT
      TO authenticated
      WITH CHECK (public.app_role()::text = 'admin');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'sites' AND policyname = 'Global admins or site owners update sites'
  ) THEN
    CREATE POLICY "Global admins or site owners update sites"
      ON public.sites
      FOR UPDATE
      TO authenticated
      USING (
        public.app_role()::text = 'admin'
        OR public.can_manage_site(id, ARRAY['owner'::public.site_role, 'admin'::public.site_role])
      )
      WITH CHECK (
        public.app_role()::text = 'admin'
        OR public.can_manage_site(id, ARRAY['owner'::public.site_role, 'admin'::public.site_role])
      );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'site_domains' AND policyname = 'Authenticated users can read accessible site domains'
  ) THEN
    CREATE POLICY "Authenticated users can read accessible site domains"
      ON public.site_domains
      FOR SELECT
      TO authenticated
      USING (
        public.app_role()::text = 'admin'
        OR EXISTS (
          SELECT 1 FROM public.user_site_roles usr
          WHERE usr.site_id = public.site_domains.site_id
            AND usr.user_id = auth.uid()
        )
      );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'site_domains' AND policyname = 'Global admins or site owners manage site domains'
  ) THEN
    CREATE POLICY "Global admins or site owners manage site domains"
      ON public.site_domains
      FOR ALL
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
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_site_roles' AND policyname = 'Users can read own site roles'
  ) THEN
    CREATE POLICY "Users can read own site roles"
      ON public.user_site_roles
      FOR SELECT
      TO authenticated
      USING (
        auth.uid() = user_id
        OR public.app_role()::text = 'admin'
        OR public.can_manage_site(site_id, ARRAY['owner'::public.site_role, 'admin'::public.site_role])
      );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_site_roles' AND policyname = 'Global admins or site owners manage site roles'
  ) THEN
    CREATE POLICY "Global admins or site owners manage site roles"
      ON public.user_site_roles
      FOR ALL
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
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'global_settings',
    'hero_content',
    'navigation_links',
    'services',
    'portfolio_items',
    'products',
    'faq_items',
    'site_settings',
    'team_members',
    'testimonials',
    'legal_pages',
    'leads',
    'forum_categories',
    'forum_threads',
    'forum_replies',
    'forum_reply_likes',
    'forum_redirects'
  ]
  LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = tbl
    ) THEN
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS site_id uuid', tbl);
      EXECUTE format('UPDATE public.%I SET site_id = %L WHERE site_id IS NULL', tbl, '00000000-0000-0000-0000-000000000001');
      EXECUTE format('ALTER TABLE public.%I ALTER COLUMN site_id SET DEFAULT %L', tbl, '00000000-0000-0000-0000-000000000001');
      EXECUTE format('ALTER TABLE public.%I ALTER COLUMN site_id SET NOT NULL', tbl);
      EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON public.%I (site_id)', tbl || '_site_id_idx', tbl);
    END IF;
  END LOOP;
END
$$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'global_settings') THEN
    BEGIN
      ALTER TABLE public.global_settings
        ADD CONSTRAINT global_settings_site_id_fkey
        FOREIGN KEY (site_id) REFERENCES public.sites(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    CREATE UNIQUE INDEX IF NOT EXISTS global_settings_site_id_key ON public.global_settings (site_id);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'hero_content') THEN
    BEGIN
      ALTER TABLE public.hero_content
        ADD CONSTRAINT hero_content_site_id_fkey
        FOREIGN KEY (site_id) REFERENCES public.sites(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    CREATE UNIQUE INDEX IF NOT EXISTS hero_content_site_id_key ON public.hero_content (site_id);
  END IF;
END
$$;

DO $$
DECLARE
  con_name text;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'site_settings') THEN
    FOR con_name IN
      SELECT c.conname
      FROM pg_constraint c
      JOIN pg_class t ON t.oid = c.conrelid
      JOIN pg_namespace n ON n.oid = t.relnamespace
      WHERE n.nspname = 'public'
        AND t.relname = 'site_settings'
        AND c.contype = 'u'
        AND pg_get_constraintdef(c.oid) ILIKE '%UNIQUE (key)%'
    LOOP
      EXECUTE format('ALTER TABLE public.site_settings DROP CONSTRAINT IF EXISTS %I', con_name);
    END LOOP;

    BEGIN
      ALTER TABLE public.site_settings
        ADD CONSTRAINT site_settings_site_id_fkey
        FOREIGN KEY (site_id) REFERENCES public.sites(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    CREATE UNIQUE INDEX IF NOT EXISTS site_settings_site_id_key_key ON public.site_settings (site_id, key);
  END IF;
END
$$;

DO $$
DECLARE
  con_name text;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'legal_pages') THEN
    FOR con_name IN
      SELECT c.conname
      FROM pg_constraint c
      JOIN pg_class t ON t.oid = c.conrelid
      JOIN pg_namespace n ON n.oid = t.relnamespace
      WHERE n.nspname = 'public'
        AND t.relname = 'legal_pages'
        AND c.contype = 'u'
        AND pg_get_constraintdef(c.oid) ILIKE '%UNIQUE (slug)%'
    LOOP
      EXECUTE format('ALTER TABLE public.legal_pages DROP CONSTRAINT IF EXISTS %I', con_name);
    END LOOP;

    BEGIN
      ALTER TABLE public.legal_pages
        ADD CONSTRAINT legal_pages_site_id_fkey
        FOREIGN KEY (site_id) REFERENCES public.sites(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    CREATE UNIQUE INDEX IF NOT EXISTS legal_pages_site_id_slug_key ON public.legal_pages (site_id, slug);
  END IF;
END
$$;

DO $$
DECLARE
  tbl text;
  policy_name text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'global_settings',
    'hero_content',
    'navigation_links',
    'services',
    'portfolio_items',
    'products',
    'faq_items',
    'site_settings',
    'team_members',
    'testimonials',
    'legal_pages',
    'leads',
    'forum_categories',
    'forum_threads',
    'forum_replies',
    'forum_reply_likes',
    'forum_redirects'
  ]
  LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = tbl
    ) THEN
      policy_name := tbl || '_site_manage';

      IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = tbl
          AND policyname = policy_name
      ) THEN
        EXECUTE format(
          'CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (public.can_manage_site(site_id)) WITH CHECK (public.can_manage_site(site_id))',
          policy_name,
          tbl
        );
      END IF;
    END IF;
  END LOOP;
END
$$;

NOTIFY pgrst, 'reload schema';

COMMIT;
