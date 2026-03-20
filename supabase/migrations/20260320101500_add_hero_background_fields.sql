alter table public.hero_content
  add column if not exists background_image_path text,
  add column if not exists background_mobile_image_path text,
  add column if not exists overlay_opacity integer default 68;

update public.hero_content
set overlay_opacity = coalesce(overlay_opacity, 68);
