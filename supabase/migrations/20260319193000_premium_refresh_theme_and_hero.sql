alter table public.global_settings
  add column if not exists accent_color_hex text default '#0F766E';

alter table public.hero_content
  add column if not exists image_path text;

update public.global_settings
set accent_color_hex = coalesce(accent_color_hex, '#0F766E')
where id = 'default';
