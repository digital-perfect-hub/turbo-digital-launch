-- Maintenance mode is implemented as a site_setting key because this project's
-- site_settings table is a per-site key/value store consumed by useSiteSettings().
-- This keeps the feature hook-compatible without introducing a parallel read path.

INSERT INTO public.site_settings (site_id, key, value)
SELECT s.id, 'is_maintenance_mode', 'false'
FROM public.sites s
ON CONFLICT (site_id, key) DO NOTHING;
