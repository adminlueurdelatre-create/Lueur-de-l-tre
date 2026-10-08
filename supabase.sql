-- Lueur de l’Âtre V7 — Supabase schema
-- Run this in the Supabase SQL Editor after creating your project.
-- IMPORTANT: create your owner account in Supabase Auth first.
create table if not exists public.site_settings (
  id bigint primary key generated always as identity,
  restaurant_name text not null default 'Lueur de l’Âtre',
  tagline text default 'Le goût des instants précieux',
  address text default '',
  phone text default '',
  email text default '',
  welcome_text text default 'Là où la chaleur devient souvenir.',
  updated_at timestamptz default now()
);

create table if not exists public.menu_items (
  id bigint primary key generated always as identity,
  name text not null,
  category text not null default 'Plat',
  description text default '',
  price numeric(10,2) not null default 0,
  vegetarian boolean not null default false,
  allergens text[] default '{}',
  published boolean not null default true,
  sort_order int not null default 0,
  updated_at timestamptz default now()
);

create table if not exists public.opening_hours (
  id bigint primary key generated always as identity,
  day_of_week int not null check(day_of_week between 0 and 6),
  open_time time,
  close_time time,
  closed boolean not null default false,
  unique(day_of_week)
);

create table if not exists public.special_closures (
  id bigint primary key generated always as identity,
  closure_date date not null,
  label text default 'Fermeture exceptionnelle'
);

create table if not exists public.gallery (
  id bigint primary key generated always as identity,
  title text default '',
  image_url text not null,
  sort_order int not null default 0,
  published boolean not null default true
);

create table if not exists public.reservations (
  id bigint primary key generated always as identity,
  created_at timestamptz not null default now(),
  reservation_date date not null,
  reservation_time time not null,
  guests int not null check(guests > 0),
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text not null,
  occasion text default '',
  dietary_preference text default '',
  notes text default '',
  status text not null default 'pending' check(status in ('pending','confirmed','cancelled','completed'))
);

-- Enable RLS.
alter table public.site_settings enable row level security;
alter table public.menu_items enable row level security;
alter table public.opening_hours enable row level security;
alter table public.special_closures enable row level security;
alter table public.gallery enable row level security;
alter table public.reservations enable row level security;

-- Public can read published website content.
create policy "public read published menu" on public.menu_items for select using (published = true);
create policy "public read gallery" on public.gallery for select using (published = true);
create policy "public read hours" on public.opening_hours for select using (true);
create policy "public read settings" on public.site_settings for select using (true);

-- Authenticated owner can manage CMS data.
create policy "owner manage menu" on public.menu_items for all to authenticated using (true) with check (true);
create policy "owner manage gallery" on public.gallery for all to authenticated using (true) with check (true);
create policy "owner manage hours" on public.opening_hours for all to authenticated using (true) with check (true);
create policy "owner manage closures" on public.special_closures for all to authenticated using (true) with check (true);
create policy "owner manage settings" on public.site_settings for all to authenticated using (true) with check (true);
create policy "owner manage reservations" on public.reservations for all to authenticated using (true) with check (true);

-- Public website can create reservation requests.
create policy "public create reservations" on public.reservations for insert to anon, authenticated with check (true);

-- Storage bucket for restaurant photos.
insert into storage.buckets (id, name, public) values ('restaurant-photos','restaurant-photos',true)
on conflict (id) do nothing;

create policy "public view restaurant photos" on storage.objects
for select using (bucket_id = 'restaurant-photos');

create policy "owner upload restaurant photos" on storage.objects
for insert to authenticated with check (bucket_id = 'restaurant-photos');

create policy "owner update restaurant photos" on storage.objects
for update to authenticated using (bucket_id = 'restaurant-photos') with check (bucket_id = 'restaurant-photos');

create policy "owner delete restaurant photos" on storage.objects
for delete to authenticated using (bucket_id = 'restaurant-photos');
