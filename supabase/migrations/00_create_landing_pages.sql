-- 00_create_landing_pages.sql
create extension if not exists "pgcrypto";

create table if not exists public.landing_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  meta_title text,
  meta_description text,
  is_published boolean not null default false,
  page_blocks jsonb not null default '[]'::jsonb
);

alter table public.landing_pages enable row level security;

grant select on public.landing_pages to anon, authenticated;

drop policy if exists "Published landing pages are publicly readable" on public.landing_pages;
create policy "Published landing pages are publicly readable"
  on public.landing_pages
  for select
  using (is_published = true);
