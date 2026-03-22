ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS stripe_price_id text,
  ADD COLUMN IF NOT EXISTS tax_rate numeric DEFAULT 19,
  ADD COLUMN IF NOT EXISTS cta_text text DEFAULT 'Jetzt sichern',
  ADD COLUMN IF NOT EXISTS cta_color text DEFAULT '#FF4B2C',
  ADD COLUMN IF NOT EXISTS upsells jsonb DEFAULT '[]'::jsonb;

UPDATE public.products
SET
  tax_rate = COALESCE(tax_rate, 19),
  cta_text = COALESCE(NULLIF(BTRIM(cta_text), ''), 'Jetzt sichern'),
  cta_color = COALESCE(NULLIF(BTRIM(cta_color), ''), '#FF4B2C'),
  upsells = COALESCE(upsells, '[]'::jsonb)
WHERE
  tax_rate IS NULL
  OR cta_text IS NULL
  OR BTRIM(cta_text) = ''
  OR cta_color IS NULL
  OR BTRIM(cta_color) = ''
  OR upsells IS NULL;

ALTER TABLE public.products
  ALTER COLUMN tax_rate SET DEFAULT 19,
  ALTER COLUMN cta_text SET DEFAULT 'Jetzt sichern',
  ALTER COLUMN cta_color SET DEFAULT '#FF4B2C',
  ALTER COLUMN upsells SET DEFAULT '[]'::jsonb;

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
