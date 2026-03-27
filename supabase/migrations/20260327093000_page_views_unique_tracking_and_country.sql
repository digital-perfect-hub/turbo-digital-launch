BEGIN;

ALTER TABLE public.page_views
  ADD COLUMN IF NOT EXISTS visitor_hash text,
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS tracked_on date;

UPDATE public.page_views
SET tracked_on = (created_at AT TIME ZONE 'utc')::date
WHERE tracked_on IS NULL;

ALTER TABLE public.page_views
  ALTER COLUMN tracked_on SET DEFAULT ((now() AT TIME ZONE 'utc')::date),
  ALTER COLUMN tracked_on SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'page_views_country_format_check'
  ) THEN
    ALTER TABLE public.page_views
      ADD CONSTRAINT page_views_country_format_check
      CHECK (country IS NULL OR country ~ '^[A-Z]{2}$');
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS page_views_site_id_tracked_on_idx
  ON public.page_views (site_id, tracked_on DESC);

CREATE INDEX IF NOT EXISTS page_views_site_id_country_tracked_on_idx
  ON public.page_views (site_id, country, tracked_on DESC);

CREATE INDEX IF NOT EXISTS page_views_site_id_visitor_hash_tracked_on_idx
  ON public.page_views (site_id, visitor_hash, tracked_on DESC);

CREATE UNIQUE INDEX IF NOT EXISTS page_views_daily_unique_visitor_idx
  ON public.page_views (site_id, path, tracked_on, visitor_hash, session_id);

REVOKE INSERT ON TABLE public.page_views FROM anon, authenticated;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'page_views'
      AND policyname = 'Anyone can insert page views for active sites'
  ) THEN
    DROP POLICY "Anyone can insert page views for active sites" ON public.page_views;
  END IF;
END
$$;

COMMIT;
