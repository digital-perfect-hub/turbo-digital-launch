BEGIN;

ALTER TABLE public.site_domains
  ADD COLUMN IF NOT EXISTS verification_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS verification_message text,
  ADD COLUMN IF NOT EXISTS last_checked_at timestamptz,
  ADD COLUMN IF NOT EXISTS ssl_status text NOT NULL DEFAULT 'pending';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'site_domains_verification_status_check'
  ) THEN
    ALTER TABLE public.site_domains
      ADD CONSTRAINT site_domains_verification_status_check
      CHECK (verification_status IN ('pending', 'verified', 'failed'));
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'site_domains_ssl_status_check'
  ) THEN
    ALTER TABLE public.site_domains
      ADD CONSTRAINT site_domains_ssl_status_check
      CHECK (ssl_status IN ('pending', 'active', 'failed'));
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS site_domains_verification_status_idx ON public.site_domains (verification_status);
CREATE INDEX IF NOT EXISTS site_domains_last_checked_at_idx ON public.site_domains (last_checked_at DESC);

UPDATE public.site_domains
SET verification_status = COALESCE(NULLIF(verification_status, ''), 'pending'),
    ssl_status = COALESCE(NULLIF(ssl_status, ''), 'pending')
WHERE verification_status IS NULL
   OR ssl_status IS NULL
   OR verification_status = ''
   OR ssl_status = '';

INSERT INTO public.site_templates (name, slug, industry, description, is_active, source_site_id, template_payload)
VALUES (
  'Digital Perfect SaaS Default',
  'digital-perfect-default',
  'general',
  'Neutrales Starter-Template für neue SaaS-Kunden mit sauberer White-Label-Basis.',
  true,
  '00000000-0000-0000-0000-000000000001'::uuid,
  jsonb_build_object(
    'seed_kind', 'default',
    'wizard_theme', 'clean',
    'faq_seed_count', 5,
    'recommended_plan', 'starter'
  )
)
ON CONFLICT (slug) DO UPDATE
SET is_active = true,
    source_site_id = COALESCE(public.site_templates.source_site_id, EXCLUDED.source_site_id),
    description = EXCLUDED.description,
    template_payload = COALESCE(public.site_templates.template_payload, '{}'::jsonb) || EXCLUDED.template_payload;

NOTIFY pgrst, 'reload schema';

COMMIT;
