BEGIN;

ALTER TABLE public.site_modules
  ADD COLUMN IF NOT EXISTS has_saas boolean NOT NULL DEFAULT false;

UPDATE public.site_modules
SET has_saas = COALESCE(has_saas, false);

INSERT INTO public.site_modules (site_id, has_forum, has_shop, has_seo_pro, has_support_desk, has_saas)
SELECT s.id, false, false, false, false, false
FROM public.sites s
ON CONFLICT (site_id) DO NOTHING;

COMMIT;
