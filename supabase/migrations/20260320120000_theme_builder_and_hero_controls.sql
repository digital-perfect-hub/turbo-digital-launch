alter table public.global_settings
  add column if not exists heading_font_family text default 'jakarta',
  add column if not exists body_font_family text default 'inter',
  add column if not exists navigation_theme jsonb default '{}'::jsonb,
  add column if not exists hero_theme jsonb default '{}'::jsonb,
  add column if not exists surface_theme jsonb default '{}'::jsonb,
  add column if not exists button_theme jsonb default '{}'::jsonb;

update public.global_settings
set
  heading_font_family = coalesce(heading_font_family, 'jakarta'),
  body_font_family = coalesce(body_font_family, 'inter'),
  navigation_theme = coalesce(navigation_theme, '{}'::jsonb),
  hero_theme = coalesce(hero_theme, '{}'::jsonb),
  surface_theme = coalesce(surface_theme, '{}'::jsonb),
  button_theme = coalesce(button_theme, '{}'::jsonb);

alter table public.hero_content
  add column if not exists background_image_path text,
  add column if not exists background_mobile_image_path text,
  add column if not exists overlay_opacity integer default 58;

update public.hero_content
set overlay_opacity = coalesce(overlay_opacity, 58);
