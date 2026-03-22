ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS demo_url text,
  ADD COLUMN IF NOT EXISTS target_audience text,
  ADD COLUMN IF NOT EXISTS long_description text;

UPDATE public.products
SET slug = CONCAT(
  COALESCE(
    NULLIF(
      REGEXP_REPLACE(
        REGEXP_REPLACE(LOWER(title), '[^a-z0-9]+', '-', 'g'),
        '(^-|-$)',
        '',
        'g'
      ),
      ''
    ),
    'produkt'
  ),
  '-',
  LEFT(REPLACE(id::text, '-', ''), 8)
)
WHERE slug IS NULL OR BTRIM(slug) = '';

ALTER TABLE public.products
  ALTER COLUMN slug SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS products_slug_unique_idx
  ON public.products (slug);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'products'
      AND policyname = 'Products public read'
  ) THEN
    CREATE POLICY "Products public read"
      ON public.products
      FOR SELECT
      USING (is_visible = true);
  END IF;
END $$;
