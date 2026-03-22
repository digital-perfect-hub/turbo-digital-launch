CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  price text NOT NULL,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  image_url text,
  checkout_url text,
  sort_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DROP POLICY IF EXISTS "Public read products" ON public.products;
DROP POLICY IF EXISTS "Products are publicly readable" ON public.products;
DROP POLICY IF EXISTS "Products public read" ON public.products;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'products'
      AND column_name = 'is_active'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'products'
      AND column_name = 'is_visible'
  ) THEN
    ALTER TABLE public.products RENAME COLUMN is_active TO is_visible;
  END IF;
END $$;

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS price text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS features jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS checkout_url text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_visible boolean NOT NULL DEFAULT true;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.products
ALTER COLUMN price TYPE text
USING COALESCE(price::text, '');

UPDATE public.products
SET
  features = COALESCE(features, '[]'::jsonb),
  sort_order = COALESCE(sort_order, 0),
  is_visible = COALESCE(is_visible, true),
  updated_at = COALESCE(updated_at, now()),
  created_at = COALESCE(created_at, now());

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'products'
      AND column_name = 'is_active'
  ) THEN
    EXECUTE 'UPDATE public.products SET is_visible = COALESCE(is_visible, is_active, true)';
    EXECUTE 'ALTER TABLE public.products DROP COLUMN is_active';
  END IF;
END $$;

ALTER TABLE public.products
ALTER COLUMN price SET NOT NULL,
ALTER COLUMN features SET DEFAULT '[]'::jsonb,
ALTER COLUMN sort_order SET DEFAULT 0,
ALTER COLUMN is_visible SET DEFAULT true;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products public read"
ON public.products
FOR SELECT
USING (is_visible = true);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE p.proname = 'has_role' AND n.nspname = 'public'
  ) AND NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'products'
      AND policyname = 'Admins manage products'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins manage products" ON public.products FOR ALL TO authenticated USING (public.has_role(auth.uid(), ''admin'')) WITH CHECK (public.has_role(auth.uid(), ''admin''))';
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
