-- Lueur de l’Âtre — production Supabase setup
-- Run this AFTER the original supabase.sql. It replaces the demo/open policies
-- with policies that only allow the configured owner account to manage CMS data.

-- Public website reads.
alter table public.site_settings enable row level security;
alter table public.menu_items enable row level security;
alter table public.opening_hours enable row level security;
alter table public.special_closures enable row level security;
alter table public.gallery enable row level security;
alter table public.reservations enable row level security;

-- Optional defaults so a fresh project immediately has usable content.
insert into public.site_settings (restaurant_name, tagline, welcome_text)
select 'Lueur de l’Âtre', 'Le goût des instants précieux', 'Là où la chaleur devient souvenir.'
where not exists (select 1 from public.site_settings);

insert into public.opening_hours (day_of_week, open_time, close_time, closed) values
(0, '12:00', '15:00', false),
(1, null, null, true),
(2, null, null, true),
(3, '18:00', '22:30', false),
(4, '18:00', '22:30', false),
(5, '18:00', '23:00', false),
(6, '18:00', '23:00', false)
on conflict (day_of_week) do nothing;

insert into public.menu_items (name, category, description, price, vegetarian, allergens, published, sort_order)
select * from (values
('Velouté de saison','Entrée','Velouté maison selon les produits du moment.',14.00,true,ARRAY['Lait']::text[],true,10),
('Œuf parfait · champignons · truffe','Entrée','Œuf parfait, champignons et touche de truffe.',18.00,true,ARRAY['Œuf','Lait']::text[],true,20),
('Volaille rôtie · jus au thym','Plat','Volaille rôtie, jus au thym et garniture de saison.',29.00,false,ARRAY['Lait']::text[],true,30),
('Filet de poisson · beurre blanc','Plat','Poisson du moment, beurre blanc et légumes de saison.',31.00,false,ARRAY['Poisson','Lait']::text[],true,40),
('Risotto de saison · parmesan','Végétarien','Risotto crémeux, légumes de saison et parmesan.',25.00,true,ARRAY['Lait']::text[],true,50),
('Poire pochée · chocolat noir','Dessert','Poire pochée, chocolat noir et texture croustillante.',12.00,true,ARRAY['Soja']::text[],true,60)
) as v(name,category,description,price,vegetarian,allergens,published,sort_order)
where not exists (select 1 from public.menu_items);

-- Replace the permissive policies created by the demo schema.
drop policy if exists "public read published menu" on public.menu_items;
drop policy if exists "owner manage menu" on public.menu_items;
drop policy if exists "public read gallery" on public.gallery;
drop policy if exists "owner manage gallery" on public.gallery;
drop policy if exists "public read hours" on public.opening_hours;
drop policy if exists "owner manage hours" on public.opening_hours;
drop policy if exists "owner manage closures" on public.special_closures;
drop policy if exists "owner manage settings" on public.site_settings;
drop policy if exists "public read settings" on public.site_settings;
drop policy if exists "owner manage reservations" on public.reservations;
drop policy if exists "public create reservations" on public.reservations;

drop policy if exists "public view restaurant photos" on storage.objects;
drop policy if exists "owner upload restaurant photos" on storage.objects;
drop policy if exists "owner update restaurant photos" on storage.objects;
drop policy if exists "owner delete restaurant photos" on storage.objects;

-- Public website content.
create policy "public read published menu" on public.menu_items
for select to anon, authenticated using (published = true);

create policy "public read gallery" on public.gallery
for select to anon, authenticated using (published = true);

create policy "public read hours" on public.opening_hours
for select to anon, authenticated using (true);

create policy "public read closures" on public.special_closures
for select to anon, authenticated using (true);

create policy "public read settings" on public.site_settings
for select to anon, authenticated using (true);

-- Only the restaurant owner account can manage CMS data.
-- This matches the account created in Supabase Auth: admin.lueurdelatre@gmail.com
create policy "owner manage menu" on public.menu_items
for all to authenticated
using ((auth.jwt() ->> 'email') = 'admin.lueurdelatre@gmail.com')
with check ((auth.jwt() ->> 'email') = 'admin.lueurdelatre@gmail.com');

create policy "owner manage gallery" on public.gallery
for all to authenticated
using ((auth.jwt() ->> 'email') = 'admin.lueurdelatre@gmail.com')
with check ((auth.jwt() ->> 'email') = 'admin.lueurdelatre@gmail.com');

create policy "owner manage hours" on public.opening_hours
for all to authenticated
using ((auth.jwt() ->> 'email') = 'admin.lueurdelatre@gmail.com')
with check ((auth.jwt() ->> 'email') = 'admin.lueurdelatre@gmail.com');

create policy "owner manage closures" on public.special_closures
for all to authenticated
using ((auth.jwt() ->> 'email') = 'admin.lueurdelatre@gmail.com')
with check ((auth.jwt() ->> 'email') = 'admin.lueurdelatre@gmail.com');

create policy "owner manage settings" on public.site_settings
for all to authenticated
using ((auth.jwt() ->> 'email') = 'admin.lueurdelatre@gmail.com')
with check ((auth.jwt() ->> 'email') = 'admin.lueurdelatre@gmail.com');

create policy "owner manage reservations" on public.reservations
for all to authenticated
using ((auth.jwt() ->> 'email') = 'admin.lueurdelatre@gmail.com')
with check ((auth.jwt() ->> 'email') = 'admin.lueurdelatre@gmail.com');

-- Visitors may create reservation requests, but cannot read them.
create policy "public create reservations" on public.reservations
for insert to anon, authenticated with check (true);

-- Storage: public images, owner-only changes.
insert into storage.buckets (id, name, public)
values ('restaurant-photos','restaurant-photos',true)
on conflict (id) do update set public = true;

create policy "public view restaurant photos" on storage.objects
for select to anon, authenticated using (bucket_id = 'restaurant-photos');

create policy "owner upload restaurant photos" on storage.objects
for insert to authenticated
with check (bucket_id = 'restaurant-photos' and (auth.jwt() ->> 'email') = 'admin.lueurdelatre@gmail.com');

create policy "owner update restaurant photos" on storage.objects
for update to authenticated
using (bucket_id = 'restaurant-photos' and (auth.jwt() ->> 'email') = 'admin.lueurdelatre@gmail.com')
with check (bucket_id = 'restaurant-photos' and (auth.jwt() ->> 'email') = 'admin.lueurdelatre@gmail.com');

create policy "owner delete restaurant photos" on storage.objects
for delete to authenticated
using (bucket_id = 'restaurant-photos' and (auth.jwt() ->> 'email') = 'admin.lueurdelatre@gmail.com');
