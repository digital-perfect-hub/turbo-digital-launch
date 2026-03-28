BEGIN;

CREATE OR REPLACE FUNCTION public.dedupe_singleton_table_by_site(
  p_table_name text,
  p_order_columns text[] DEFAULT ARRAY['updated_at', 'created_at']
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  has_updated_at boolean;
  has_created_at boolean;
  order_clause text := 'id DESC';
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = p_table_name
  ) THEN
    RETURN;
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = p_table_name
      AND column_name = 'updated_at'
  ) INTO has_updated_at;

  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = p_table_name
      AND column_name = 'created_at'
  ) INTO has_created_at;

  IF has_updated_at THEN
    order_clause := 'updated_at DESC NULLS LAST, ' || order_clause;
  END IF;

  IF has_created_at THEN
    order_clause := 'created_at DESC NULLS LAST, ' || order_clause;
  END IF;

  EXECUTE format(
    $sql$
      WITH ranked AS (
        SELECT
          id,
          row_number() OVER (
            PARTITION BY site_id
            ORDER BY %s
          ) AS rn
        FROM public.%I
        WHERE site_id IS NOT NULL
      )
      DELETE FROM public.%I target
      USING ranked
      WHERE target.id = ranked.id
        AND ranked.rn > 1
    $sql$,
    order_clause,
    p_table_name,
    p_table_name
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.dedupe_composite_tenant_table(
  p_table_name text,
  p_partition_columns text[]
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  has_updated_at boolean;
  has_created_at boolean;
  order_clause text := 'id DESC';
  partition_clause text;
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = p_table_name
  ) THEN
    RETURN;
  END IF;

  partition_clause := array_to_string(
    ARRAY(
      SELECT format('%I', column_name)
      FROM unnest(p_partition_columns) AS column_name
    ),
    ', '
  );

  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = p_table_name
      AND column_name = 'updated_at'
  ) INTO has_updated_at;

  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = p_table_name
      AND column_name = 'created_at'
  ) INTO has_created_at;

  IF has_updated_at THEN
    order_clause := 'updated_at DESC NULLS LAST, ' || order_clause;
  END IF;

  IF has_created_at THEN
    order_clause := 'created_at DESC NULLS LAST, ' || order_clause;
  END IF;

  EXECUTE format(
    $sql$
      WITH ranked AS (
        SELECT
          id,
          row_number() OVER (
            PARTITION BY %s
            ORDER BY %s
          ) AS rn
        FROM public.%I
        WHERE site_id IS NOT NULL
      )
      DELETE FROM public.%I target
      USING ranked
      WHERE target.id = ranked.id
        AND ranked.rn > 1
    $sql$,
    partition_clause,
    order_clause,
    p_table_name,
    p_table_name
  );
END;
$$;

SELECT public.dedupe_singleton_table_by_site('global_settings');
SELECT public.dedupe_singleton_table_by_site('hero_content');
SELECT public.dedupe_composite_tenant_table('site_settings', ARRAY['site_id', 'key']);
SELECT public.dedupe_composite_tenant_table('legal_pages', ARRAY['site_id', 'slug']);
SELECT public.dedupe_composite_tenant_table('pages', ARRAY['site_id', 'slug']);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'global_settings'
  ) AND NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'global_settings_site_id_unique'
      AND conrelid = 'public.global_settings'::regclass
  ) THEN
    ALTER TABLE public.global_settings
      ADD CONSTRAINT global_settings_site_id_unique UNIQUE (site_id);
  END IF;
END
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'hero_content'
  ) AND NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'hero_content_site_id_unique'
      AND conrelid = 'public.hero_content'::regclass
  ) THEN
    ALTER TABLE public.hero_content
      ADD CONSTRAINT hero_content_site_id_unique UNIQUE (site_id);
  END IF;
END
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'site_settings'
  ) AND NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'site_settings_site_id_key_unique'
      AND conrelid = 'public.site_settings'::regclass
  ) THEN
    ALTER TABLE public.site_settings
      ADD CONSTRAINT site_settings_site_id_key_unique UNIQUE (site_id, key);
  END IF;
END
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'legal_pages'
  ) AND NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'legal_pages_site_id_slug_unique'
      AND conrelid = 'public.legal_pages'::regclass
  ) THEN
    ALTER TABLE public.legal_pages
      ADD CONSTRAINT legal_pages_site_id_slug_unique UNIQUE (site_id, slug);
  END IF;
END
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'pages'
  ) AND NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'pages_site_id_slug_unique'
      AND conrelid = 'public.pages'::regclass
  ) THEN
    ALTER TABLE public.pages
      ADD CONSTRAINT pages_site_id_slug_unique UNIQUE (site_id, slug);
  END IF;
END
$$;

DROP INDEX IF EXISTS public.global_settings_site_id_key;
DROP INDEX IF EXISTS public.hero_content_site_id_key;
DROP INDEX IF EXISTS public.site_settings_site_id_key_key;
DROP INDEX IF EXISTS public.legal_pages_site_id_slug_key;
DROP INDEX IF EXISTS public.pages_site_id_slug_key;

CREATE INDEX IF NOT EXISTS global_settings_site_id_idx ON public.global_settings (site_id);
CREATE INDEX IF NOT EXISTS hero_content_site_id_idx ON public.hero_content (site_id);
CREATE INDEX IF NOT EXISTS site_settings_site_id_idx ON public.site_settings (site_id);
CREATE INDEX IF NOT EXISTS legal_pages_site_id_idx ON public.legal_pages (site_id);
CREATE INDEX IF NOT EXISTS pages_site_id_idx ON public.pages (site_id);
CREATE INDEX IF NOT EXISTS pages_site_id_published_idx ON public.pages (site_id, is_published);

DROP FUNCTION IF EXISTS public.dedupe_singleton_table_by_site(text, text[]);
DROP FUNCTION IF EXISTS public.dedupe_composite_tenant_table(text, text[]);

NOTIFY pgrst, 'reload schema';

COMMIT;
