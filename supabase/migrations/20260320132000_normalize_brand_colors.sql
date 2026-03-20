alter table public.global_settings
  alter column primary_color_hex set default '#FF4B2C',
  alter column secondary_color_hex set default '#0E1F53',
  alter column accent_color_hex set default '#0E1F53';

update public.global_settings
set
  primary_color_hex = case
    when primary_color_hex is null or upper(primary_color_hex) in ('#D4AF37', '#FF8400', '#2563EB') then '#FF4B2C'
    else upper(primary_color_hex)
  end,
  secondary_color_hex = case
    when secondary_color_hex is null or upper(secondary_color_hex) in ('#0F172A', '#1E40AF') then '#0E1F53'
    else upper(secondary_color_hex)
  end,
  accent_color_hex = case
    when accent_color_hex is null or upper(accent_color_hex) in ('#0F766E', '#1E40AF') then '#0E1F53'
    else upper(accent_color_hex)
  end;
