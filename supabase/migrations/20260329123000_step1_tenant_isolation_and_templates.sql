BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -------------------------------------------------------------------
-- Legacy-Hotfix: global_settings darf pro Tenant eine eigene ID erzeugen.
-- -------------------------------------------------------------------
ALTER TABLE public.global_settings
  ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;

-- -------------------------------------------------------------------
-- Hilfsfunktionen für klare Tenant-Isolation auf Postgres-Ebene.
-- -------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.has_site_membership(_site_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT (
    auth.uid() IS NOT NULL
    AND (
      public.app_role()::text = 'admin'
      OR EXISTS (
        SELECT 1
        FROM public.user_site_roles usr
        WHERE usr.site_id = _site_id
          AND usr.user_id = auth.uid()
      )
    )
  )
$$;

CREATE OR REPLACE FUNCTION public.can_administer_site(_site_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT (
    auth.uid() IS NOT NULL
    AND (
      public.app_role()::text = 'admin'
      OR public.has_site_role(
        auth.uid(),
        _site_id,
        ARRAY['owner'::public.site_role, 'admin'::public.site_role]
      )
    )
  )
$$;

CREATE OR REPLACE FUNCTION public.can_edit_site_content(_site_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT (
    auth.uid() IS NOT NULL
    AND (
      public.app_role()::text = 'admin'
      OR public.has_site_role(
        auth.uid(),
        _site_id,
        ARRAY['owner'::public.site_role, 'admin'::public.site_role, 'editor'::public.site_role]
      )
    )
  )
$$;

GRANT EXECUTE ON FUNCTION public.has_site_membership(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.can_administer_site(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.can_edit_site_content(uuid) TO authenticated, service_role;

-- -------------------------------------------------------------------
-- Template-Architektur: Templates statt Hub-Kopie.
-- preview_image darf keine rohe Public-Storage-URL sein.
-- -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL,
  industry text,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  preview_image text,
  template_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  source_site_id uuid REFERENCES public.sites(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT site_templates_slug_key UNIQUE (slug),
  CONSTRAINT site_templates_preview_image_render_guard CHECK (
    preview_image IS NULL
    OR position('/storage/v1/object/public/' in preview_image) = 0
  )
);

ALTER TABLE public.site_templates ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS update_site_templates_updated_at ON public.site_templates;
CREATE TRIGGER update_site_templates_updated_at
BEFORE UPDATE ON public.site_templates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'site_templates'
      AND policyname = 'Authenticated users can read active site templates'
  ) THEN
    CREATE POLICY "Authenticated users can read active site templates"
      ON public.site_templates
      FOR SELECT
      TO authenticated
      USING (is_active = true OR public.app_role()::text = 'admin');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'site_templates'
      AND policyname = 'Global admins manage site templates'
  ) THEN
    CREATE POLICY "Global admins manage site templates"
      ON public.site_templates
      FOR ALL
      TO authenticated
      USING (public.app_role()::text = 'admin')
      WITH CHECK (public.app_role()::text = 'admin');
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS site_templates_is_active_idx ON public.site_templates (is_active);
CREATE INDEX IF NOT EXISTS site_templates_industry_idx ON public.site_templates (industry);

INSERT INTO public.site_templates (name, slug, industry, description, preview_image, source_site_id, template_payload)
VALUES (
  'Digital Perfect SaaS Default',
  'digital-perfect-default',
  'general',
  'Basis-Template für neue SaaS-Tenants mit sauberer White-Label-Struktur.',
  NULL,
  '00000000-0000-0000-0000-000000000001'::uuid,
  jsonb_build_object(
    'seed_kind', 'default',
    'notes', 'Seedet Branding, Hero, Site-Settings, Legal-Pages und Basis-Seiten aus der Default-Site.'
  )
)
ON CONFLICT (slug) DO NOTHING;

-- -------------------------------------------------------------------
-- RLS-Lockdown: zentrale Policies für tenant-bezogene Tabellen.
-- Öffentliche SELECT-Policies für veröffentlichte Inhalte bleiben unberührt.
-- -------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'sites' AND policyname = 'Tenant membership reads own sites'
  ) THEN
    CREATE POLICY "Tenant membership reads own sites"
      ON public.sites
      FOR SELECT
      TO authenticated
      USING (public.has_site_membership(id));
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'sites' AND policyname = 'Tenant admins update own sites'
  ) THEN
    CREATE POLICY "Tenant admins update own sites"
      ON public.sites
      FOR UPDATE
      TO authenticated
      USING (public.can_administer_site(id))
      WITH CHECK (public.can_administer_site(id));
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'site_domains' AND policyname = 'Tenant membership reads own site domains'
  ) THEN
    CREATE POLICY "Tenant membership reads own site domains"
      ON public.site_domains
      FOR SELECT
      TO authenticated
      USING (public.has_site_membership(site_id));
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'site_domains' AND policyname = 'Tenant admins manage own site domains'
  ) THEN
    CREATE POLICY "Tenant admins manage own site domains"
      ON public.site_domains
      FOR ALL
      TO authenticated
      USING (public.can_administer_site(site_id))
      WITH CHECK (public.can_administer_site(site_id));
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_site_roles' AND policyname = 'Tenant membership reads own site roles strict'
  ) THEN
    CREATE POLICY "Tenant membership reads own site roles strict"
      ON public.user_site_roles
      FOR SELECT
      TO authenticated
      USING (
        auth.uid() = user_id
        OR public.can_administer_site(site_id)
      );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_site_roles' AND policyname = 'Tenant admins manage own site roles strict'
  ) THEN
    CREATE POLICY "Tenant admins manage own site roles strict"
      ON public.user_site_roles
      FOR ALL
      TO authenticated
      USING (public.can_administer_site(site_id))
      WITH CHECK (public.can_administer_site(site_id));
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'site_modules' AND policyname = 'Tenant membership reads own site modules strict'
  ) THEN
    CREATE POLICY "Tenant membership reads own site modules strict"
      ON public.site_modules
      FOR SELECT
      TO authenticated
      USING (public.has_site_membership(site_id));
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'site_modules' AND policyname = 'Tenant admins manage own site modules strict'
  ) THEN
    CREATE POLICY "Tenant admins manage own site modules strict"
      ON public.site_modules
      FOR ALL
      TO authenticated
      USING (public.can_administer_site(site_id))
      WITH CHECK (public.can_administer_site(site_id));
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
    'site_settings',
    'pages',
    'legal_pages',
    'navigation_links',
    'services',
    'portfolio_items',
    'products',
    'faq_items',
    'team_members',
    'testimonials',
    'site_support_settings'
  ]
  LOOP
    IF EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = tbl
    ) THEN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = tbl
          AND policyname = tbl || '_tenant_member_read'
      ) THEN
        EXECUTE format(
          'CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (public.has_site_membership(site_id))',
          tbl || '_tenant_member_read',
          tbl
        );
      END IF;

      IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = tbl
          AND policyname = tbl || '_tenant_editor_manage'
      ) THEN
        EXECUTE format(
          'CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (public.can_edit_site_content(site_id)) WITH CHECK (public.can_edit_site_content(site_id))',
          tbl || '_tenant_editor_manage',
          tbl
        );
      END IF;
    END IF;
  END LOOP;
END
$$;

-- -------------------------------------------------------------------
-- Copy-Helper für atomares Tenant-Bootstrapping.
-- -------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.bootstrap_copy_singleton_table(
  p_table_name text,
  p_source_site_id uuid,
  p_target_site_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  insert_columns text;
  select_columns text;
  update_clause text;
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = p_table_name
  ) THEN
    RETURN;
  END IF;

  SELECT
    string_agg(format('%I', column_name), ', ' ORDER BY ordinal_position),
    string_agg(format('source.%I', column_name), ', ' ORDER BY ordinal_position),
    string_agg(format('%I = EXCLUDED.%I', column_name, column_name), ', ' ORDER BY ordinal_position)
  INTO insert_columns, select_columns, update_clause
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = p_table_name
    AND column_name NOT IN ('id', 'site_id', 'created_at', 'updated_at');

  IF insert_columns IS NULL OR select_columns IS NULL OR update_clause IS NULL THEN
    RETURN;
  END IF;

  EXECUTE format(
    'INSERT INTO public.%I (site_id, %s)
     SELECT $1, %s
     FROM public.%I source
     WHERE source.site_id = $2
     LIMIT 1
     ON CONFLICT (site_id) DO UPDATE SET %s',
    p_table_name,
    insert_columns,
    select_columns,
    p_table_name,
    update_clause
  )
  USING p_target_site_id, p_source_site_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.bootstrap_copy_collection_table(
  p_table_name text,
  p_source_site_id uuid,
  p_target_site_id uuid,
  p_conflict_columns text[] DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  insert_columns text;
  select_columns text;
  conflict_columns text;
  conflict_clause text := '';
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = p_table_name
  ) THEN
    RETURN;
  END IF;

  SELECT
    string_agg(format('%I', column_name), ', ' ORDER BY ordinal_position),
    string_agg(format('source.%I', column_name), ', ' ORDER BY ordinal_position)
  INTO insert_columns, select_columns
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = p_table_name
    AND column_name NOT IN ('id', 'site_id', 'created_at', 'updated_at');

  IF insert_columns IS NULL OR select_columns IS NULL THEN
    RETURN;
  END IF;

  IF p_conflict_columns IS NOT NULL AND array_length(p_conflict_columns, 1) > 0 THEN
    SELECT string_agg(format('%I', col), ', ')
    INTO conflict_columns
    FROM unnest(ARRAY['site_id'] || p_conflict_columns) AS col;

    conflict_clause := format(' ON CONFLICT (%s) DO NOTHING', conflict_columns);
  END IF;

  EXECUTE format(
    'INSERT INTO public.%I (site_id, %s)
     SELECT $1, %s
     FROM public.%I source
     WHERE source.site_id = $2%s',
    p_table_name,
    insert_columns,
    select_columns,
    p_table_name,
    conflict_clause
  )
  USING p_target_site_id, p_source_site_id;
END;
$$;

-- -------------------------------------------------------------------
-- Atomarer Bootstrap auf DB-Ebene. Edge Function ruft nur diese Funktion.
-- -------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.bootstrap_tenant_from_template(
  p_template_id uuid,
  p_company_name text,
  p_site_slug text,
  p_primary_domain text DEFAULT NULL,
  p_description text DEFAULT NULL,
  p_owner_user_id uuid DEFAULT auth.uid()
)
RETURNS TABLE (
  site_id uuid,
  site_slug text,
  owner_user_id uuid,
  template_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_template public.site_templates%ROWTYPE;
  v_source_site_id uuid;
  v_site_id uuid;
  v_slug text;
  v_domain text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentifizierung erforderlich.';
  END IF;

  IF public.app_role()::text <> 'admin' THEN
    RAISE EXCEPTION 'Nur Global Admins dürfen neue Tenants bootstrappen.';
  END IF;

  IF p_owner_user_id IS NULL THEN
    RAISE EXCEPTION 'owner_user_id darf nicht leer sein.';
  END IF;

  SELECT *
  INTO v_template
  FROM public.site_templates st
  WHERE st.id = p_template_id
    AND st.is_active = true
  LIMIT 1;

  IF v_template.id IS NULL THEN
    RAISE EXCEPTION 'Template % ist nicht vorhanden oder inaktiv.', p_template_id;
  END IF;

  v_source_site_id := COALESCE(v_template.source_site_id, '00000000-0000-0000-0000-000000000001'::uuid);
  v_slug := lower(regexp_replace(trim(coalesce(p_site_slug, '')), '[^a-z0-9]+', '-', 'g'));
  v_slug := trim(both '-' from v_slug);
  v_domain := public.normalize_hostname(p_primary_domain);

  IF nullif(trim(coalesce(p_company_name, '')), '') IS NULL THEN
    RAISE EXCEPTION 'company_name darf nicht leer sein.';
  END IF;

  IF coalesce(v_slug, '') = '' THEN
    RAISE EXCEPTION 'site_slug darf nach der Normalisierung nicht leer sein.';
  END IF;

  IF EXISTS (SELECT 1 FROM public.sites s WHERE lower(s.slug) = lower(v_slug)) THEN
    RAISE EXCEPTION 'Slug % ist bereits vergeben.', v_slug;
  END IF;

  INSERT INTO public.sites (slug, name, description, primary_domain, is_default, is_active)
  VALUES (
    v_slug,
    trim(p_company_name),
    nullif(trim(coalesce(p_description, '')), ''),
    v_domain,
    false,
    true
  )
  RETURNING id INTO v_site_id;

  IF v_domain IS NOT NULL THEN
    INSERT INTO public.site_domains (site_id, hostname, is_primary)
    VALUES (v_site_id, v_domain, true)
    ON CONFLICT DO NOTHING;
  END IF;

  INSERT INTO public.user_site_roles (user_id, site_id, role)
  VALUES (p_owner_user_id, v_site_id, 'owner')
  ON CONFLICT (user_id, site_id, role) DO NOTHING;

  PERFORM public.bootstrap_copy_singleton_table('global_settings', v_source_site_id, v_site_id);
  PERFORM public.bootstrap_copy_singleton_table('hero_content', v_source_site_id, v_site_id);
  PERFORM public.bootstrap_copy_singleton_table('site_modules', v_source_site_id, v_site_id);

  PERFORM public.bootstrap_copy_collection_table('site_settings', v_source_site_id, v_site_id, ARRAY['key']);
  PERFORM public.bootstrap_copy_collection_table('legal_pages', v_source_site_id, v_site_id, ARRAY['slug']);
  PERFORM public.bootstrap_copy_collection_table('pages', v_source_site_id, v_site_id, ARRAY['slug']);
  PERFORM public.bootstrap_copy_collection_table('navigation_links', v_source_site_id, v_site_id, NULL);
  PERFORM public.bootstrap_copy_collection_table('services', v_source_site_id, v_site_id, NULL);
  PERFORM public.bootstrap_copy_collection_table('portfolio_items', v_source_site_id, v_site_id, NULL);
  PERFORM public.bootstrap_copy_collection_table('faq_items', v_source_site_id, v_site_id, NULL);
  PERFORM public.bootstrap_copy_collection_table('team_members', v_source_site_id, v_site_id, NULL);
  PERFORM public.bootstrap_copy_collection_table('testimonials', v_source_site_id, v_site_id, NULL);
  PERFORM public.bootstrap_copy_collection_table('products', v_source_site_id, v_site_id, NULL);

  UPDATE public.global_settings
  SET company_name = trim(p_company_name),
      website_title = COALESCE(website_title, trim(p_company_name)),
      meta_title = COALESCE(meta_title, trim(p_company_name)),
      imprint_company = COALESCE(NULLIF(trim(p_company_name), ''), imprint_company)
  WHERE site_id = v_site_id;

  RETURN QUERY
  SELECT v_site_id, v_slug, p_owner_user_id, v_template.id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.bootstrap_copy_singleton_table(text, uuid, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.bootstrap_copy_collection_table(text, uuid, uuid, text[]) TO service_role;
GRANT EXECUTE ON FUNCTION public.bootstrap_tenant_from_template(uuid, text, text, text, text, uuid) TO authenticated, service_role;

NOTIFY pgrst, 'reload schema';

COMMIT;
