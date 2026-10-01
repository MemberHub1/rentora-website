-- COLORA PAINTS schema. Run once in Supabase SQL Editor, separately from the legacy schema.
-- Create Auth users through the Supabase dashboard, then add their UUID to public.admin_users.

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;
revoke all on public.admin_users from public, anon, authenticated;
grant select on public.admin_users to authenticated;
drop policy if exists "Admins can verify their own access" on public.admin_users;
create policy "Admins can verify their own access" on public.admin_users
  for select to authenticated using (user_id = (select auth.uid()));

create or replace function private.is_colora_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
  );
$$;
revoke all on function private.is_colora_admin() from public;
grant execute on function private.is_colora_admin() to anon, authenticated;

create table if not exists public.categories (
  id text primary key,
  name text not null,
  short_name text not null,
  description text not null default '',
  image_url text not null default '',
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id text primary key,
  name text not null,
  category_id text not null references public.categories(id) on update cascade,
  description text not null,
  image_url text not null default '',
  sizes text[] not null default '{}',
  finish text not null default '',
  features text[] not null default '{}',
  recommended_usage text not null default '',
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.colors (
  id text primary key,
  name text not null,
  code text not null unique,
  family text not null,
  hex text not null check (hex ~ '^#[0-9A-Fa-f]{6}$'),
  finish text not null default '',
  image_url text not null default '',
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  city text,
  interest text,
  message text not null,
  status text not null default 'new' check (status in ('new', 'in_progress', 'closed')),
  created_at timestamptz not null default now()
);

create table if not exists public.articles (
  id text primary key,
  title text not null,
  category text not null default '',
  excerpt text not null default '',
  content text not null default '',
  image_url text not null default '',
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id boolean primary key default true check (id),
  company_name text not null default 'COLORA PAINTS',
  email text not null default '',
  phone text not null default '',
  address text not null default '',
  whatsapp text not null default '',
  facebook_url text not null default '',
  instagram_url text not null default '',
  tiktok_url text not null default '',
  hours text not null default '',
  tagline text not null default '',
  years_experience text not null default '',
  happy_customers text not null default '',
  product_range text not null default '',
  cities_served text not null default '',
  hero_image_url text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.colors add column if not exists image_url text not null default '';
alter table public.site_settings add column if not exists company_name text not null default 'COLORA PAINTS';
alter table public.site_settings add column if not exists whatsapp text not null default '';
alter table public.site_settings add column if not exists facebook_url text not null default '';
alter table public.site_settings add column if not exists instagram_url text not null default '';
alter table public.site_settings add column if not exists tiktok_url text not null default '';
alter table public.site_settings add column if not exists hero_image_url text not null default '';
alter table public.enquiries drop constraint if exists enquiries_status_check;
alter table public.enquiries add constraint enquiries_status_check check (status in ('new', 'read', 'in_progress', 'closed'));

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.colors enable row level security;
alter table public.enquiries enable row level security;
alter table public.articles enable row level security;
alter table public.site_settings enable row level security;

drop policy if exists "Published categories are public" on public.categories;
create policy "Published categories are public" on public.categories
  for select to anon, authenticated using (published);
drop policy if exists "Admins manage categories" on public.categories;
create policy "Admins manage categories" on public.categories
  for all to authenticated using ((select private.is_colora_admin()))
  with check ((select private.is_colora_admin()));

drop policy if exists "Published products are public" on public.products;
create policy "Published products are public" on public.products
  for select to anon, authenticated using (published);
drop policy if exists "Admins manage products" on public.products;
create policy "Admins manage products" on public.products
  for all to authenticated using ((select private.is_colora_admin()))
  with check ((select private.is_colora_admin()));

drop policy if exists "Published colors are public" on public.colors;
create policy "Published colors are public" on public.colors
  for select to anon, authenticated using (published);
drop policy if exists "Admins manage colors" on public.colors;
create policy "Admins manage colors" on public.colors
  for all to authenticated using ((select private.is_colora_admin()))
  with check ((select private.is_colora_admin()));

drop policy if exists "Public may submit enquiries" on public.enquiries;
create policy "Public may submit enquiries" on public.enquiries
  for insert to anon, authenticated with check (
    status = 'new'
    and
    length(trim(name)) between 1 and 120
    and length(trim(phone)) between 3 and 40
    and length(trim(coalesce(email, ''))) <= 254
    and length(trim(coalesce(city, ''))) <= 120
    and length(trim(coalesce(interest, ''))) <= 120
    and length(trim(message)) between 1 and 5000
  );
drop policy if exists "Admins manage enquiries" on public.enquiries;
create policy "Admins manage enquiries" on public.enquiries
  for all to authenticated using ((select private.is_colora_admin()))
  with check ((select private.is_colora_admin()));

drop policy if exists "Published articles are public" on public.articles;
create policy "Published articles are public" on public.articles
  for select to anon, authenticated using (published);
drop policy if exists "Admins manage articles" on public.articles;
create policy "Admins manage articles" on public.articles
  for all to authenticated using ((select private.is_colora_admin()))
  with check ((select private.is_colora_admin()));

drop policy if exists "Site settings are public" on public.site_settings;
create policy "Site settings are public" on public.site_settings
  for select to anon, authenticated using (true);
drop policy if exists "Admins manage site settings" on public.site_settings;
create policy "Admins manage site settings" on public.site_settings
  for all to authenticated using ((select private.is_colora_admin()))
  with check ((select private.is_colora_admin()));

revoke all on public.categories, public.products, public.colors, public.enquiries, public.articles, public.site_settings from public, anon, authenticated;
grant select on public.categories, public.products, public.colors, public.articles, public.site_settings to anon, authenticated;
grant insert, update, delete on public.categories, public.products, public.colors, public.articles, public.site_settings to authenticated;
grant select on public.enquiries to authenticated;
grant insert (name, phone, email, city, interest, message) on public.enquiries to anon, authenticated;
grant update, delete on public.enquiries to authenticated;

-- Public image reads, with upload/update/delete restricted to authorized admins.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('website-images', 'website-images', true, 8388608, array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'])
on conflict (id) do update set public = true, file_size_limit = 8388608,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

drop policy if exists "Public can view COLORA website images" on storage.objects;
create policy "Public can view COLORA website images" on storage.objects
  for select to anon, authenticated using (bucket_id = 'website-images');
drop policy if exists "COLORA admins upload website images" on storage.objects;
create policy "COLORA admins upload website images" on storage.objects
  for insert to authenticated with check (bucket_id = 'website-images' and (select private.is_colora_admin()));
drop policy if exists "COLORA admins update website images" on storage.objects;
create policy "COLORA admins update website images" on storage.objects
  for update to authenticated using (bucket_id = 'website-images' and (select private.is_colora_admin()))
  with check (bucket_id = 'website-images' and (select private.is_colora_admin()));
drop policy if exists "COLORA admins delete website images" on storage.objects;
create policy "COLORA admins delete website images" on storage.objects
  for delete to authenticated using (bucket_id = 'website-images' and (select private.is_colora_admin()));

insert into public.categories (id, name, short_name, description, image_url, published)
values
  ('interior','Interior Paint','Interior','Thoughtful color and a velvety finish for the rooms you live in.','https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=85',true),
  ('exterior','Exterior Paint','Exterior','Confident curb appeal with protection built for the elements.','https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=85',true),
  ('ceiling','Ceiling Paint','Ceiling','A beautifully even, low-sheen finish from wall to ceiling.','https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=85',true),
  ('wood','Wood Paint','Wood','Bring the natural character of wood to the surface.','https://images.unsplash.com/photo-1600210491369-e753d80a41f3?auto=format&fit=crop&w=900&q=85',true),
  ('metal','Metal Paint','Metal','A smooth, durable finish that helps keep metal looking its best.','https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=900&q=85',true),
  ('primer','Primer','Primer','The considered first step towards an exceptional finish.','https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=85',true),
  ('waterproofing','Waterproofing','Waterproofing','A dependable barrier against damp, rain and everyday wear.','https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=85',true)
on conflict (id) do nothing;

insert into public.products (id,name,category_id,description,image_url,sizes,finish,features,recommended_usage,published)
values
  ('soft-touch-matt','Soft Touch Matt','interior','A beautifully smooth, low-sheen emulsion with rich, even color.','https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=85',array['1 L','4 L','10 L'],'Matt',array['Rich, even coverage','Low-odour formula','Easy to maintain'],'Living rooms, bedrooms and hallways',true),
  ('silk-sheen','Silk Sheen','interior','A subtle silk finish that brings a gentle luminosity to your walls.','https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1000&q=85',array['1 L','4 L','10 L'],'Silk',array['Soft light reflection','Wipeable surface','Smooth application'],'Kitchens, dining rooms and family spaces',true),
  ('weather-shield','Weather Shield','exterior','Long-lasting exterior color made to stand up to changing weather.','https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=85',array['4 L','10 L','20 L'],'Low sheen',array['Weather resistant','Color that lasts','Excellent adhesion'],'Exterior walls, masonry and render',true),
  ('ceiling-white','Pure Ceiling White','ceiling','A bright, even white finish that makes ceilings feel beautifully fresh.','https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=85',array['4 L','10 L'],'Flat matt',array['Non-drip consistency','Low splatter','Bright white finish'],'Plastered and previously painted ceilings',true),
  ('wood-essence','Wood Essence','wood','Protective color and a refined finish for interior woodwork.','https://images.unsplash.com/photo-1600210491369-e753d80a41f3?auto=format&fit=crop&w=900&q=85',array['1 L','2.5 L','5 L'],'Satin',array['Smooth flow','Tough finish','Beautiful color depth'],'Doors, trim, furniture and interior joinery',true),
  ('metal-guard','Metal Guard Enamel','metal','A hard-wearing enamel finish for metal surfaces inside or out.','https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=900&q=85',array['1 L','4 L'],'Gloss',array['Durable enamel','Resists everyday scuffs','Excellent color retention'],'Railings, gates and prepared metalwork',true),
  ('universal-primer','Universal Primer','primer','A dependable base coat that helps your topcoat look its very best.','https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=85',array['1 L','4 L','10 L'],'Matt',array['Improves adhesion','Helps seal porous surfaces','Easy to apply'],'Prepared interior and exterior masonry',true),
  ('damp-stop','Damp Stop Coat','waterproofing','A protective coating to help shield walls from damp and moisture.','https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=85',array['4 L','10 L','20 L'],'Textured matt',array['Moisture protection','Flexible coating','Made for exterior use'],'Exterior masonry and moisture-prone walls',true)
on conflict (id) do nothing;

insert into public.colors (id,name,code,family,hex,finish,published)
values
 ('porcelain','Quiet Porcelain','C-001','White','#F3F0E8','Matt',true),('cloud-linen','Cloud Linen','C-014','White','#E9E5DB','Silk',true),
 ('warm-ivory','Warm Ivory','C-021','Cream','#E8DCC8','Matt',true),('soft-chamois','Soft Chamois','C-036','Cream','#DCC9A9','Silk',true),
 ('quiet-stone','Quiet Stone','C-104','Grey','#B8B5AD','Matt',true),('slate-shadow','Slate Shadow','C-118','Grey','#626B6D','Eggshell',true),
 ('blue-hour','Blue Hour','C-207','Blue','#7898A3','Matt',true),('deep-tide','Deep Tide','C-224','Blue','#385B67','Eggshell',true),
 ('sage-leaf','Sage Leaf','C-305','Green','#A5AC8F','Matt',true),('olive-grove','Olive Grove','C-328','Green','#697357','Matt',true),
 ('sunlit-clay','Sunlit Clay','C-405','Yellow','#D5B66D','Matt',true),('honeyed-light','Honeyed Light','C-418','Yellow','#E7CC8C','Silk',true),
 ('toasted-earth','Toasted Earth','C-507','Brown','#98775C','Matt',true),('cocoa-bean','Cocoa Bean','C-522','Brown','#634A3B','Eggshell',true),
 ('rosewater','Rosewater','C-608','Pink','#D6B5AE','Matt',true),('soft-terracotta','Soft Terracotta','C-615','Pink','#BC8276','Matt',true),
 ('brick-dust','Brick Dust','C-709','Red','#A85E51','Eggshell',true),('oxblood','Oxblood','C-726','Red','#713E3B','Matt',true)
on conflict (id) do nothing;

insert into public.articles (id,title,category,excerpt,content,published)
values
 ('choosing-neutrals','A softer way to choose neutrals','Color notes','Find the undertone that makes a room feel quietly, unmistakably yours.','',true),
 ('paint-finish-guide','A finish for every feeling','A considered home','Our simple guide to choosing the right sheen for every surface.','',true)
on conflict (id) do nothing;

insert into public.site_settings (id,company_name,tagline,email,phone,address,whatsapp,hours,years_experience,happy_customers,product_range,cities_served)
values (true,'COLORA PAINTS','Colors That Bring Life to Your Space','hello@colorapaints.example','+1 (555) 010-2026','123 Studio Lane, Your City (placeholder address)','+1 (555) 010-2026','Monday–Friday, 8:30 am–5:30 pm','12+','5,000+','350+','40+')
on conflict (id) do nothing;
