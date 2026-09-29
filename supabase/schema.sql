create table if not exists public.properties (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  location text not null,
  price text not null,
  type text,
  purpose text,
  beds integer check (beds is null or beds >= 0),
  baths integer check (baths is null or baths >= 0),
  area text,
  description text,
  image text,
  published boolean not null default false,
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now()
);

create table if not exists public.locations (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  short_description text,
  description text,
  image text,
  property_count integer check (property_count is null or property_count >= 0),
  published boolean not null default false,
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now()
);

create table if not exists public.articles (
  id text primary key default gen_random_uuid()::text,
  slug text unique,
  category text,
  title text not null,
  excerpt text,
  short_description text,
  content text,
  image text,
  read_time text,
  introduction text,
  sections jsonb,
  takeaway text,
  publication_date date,
  author text,
  published boolean not null default false,
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now()
);

create table if not exists public.team_members (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  role text not null,
  phone text,
  whatsapp text,
  email text,
  bio text,
  image text,
  facebook_url text,
  instagram_url text,
  linkedin_url text,
  social_links jsonb not null default '{}'::jsonb,
  published boolean not null default false,
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now()
);

create table if not exists public.contact_info (
  id text primary key default 'default' check (id = 'default'),
  phone text,
  whatsapp text,
  email text,
  address text,
  maps_url text,
  business_hours text,
  facebook_url text,
  instagram_url text,
  tiktok_url text,
  youtube_url text,
  whatsapp_url text,
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now()
);

create table if not exists public.website_settings (
  id text primary key default 'default' check (id = 'default'),
  hero_heading text,
  hero_subtitle text,
  about_heading text,
  about_description text,
  footer_text text,
  tagline text,
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := pg_catalog.now();
  return new;
end;
$$;

drop trigger if exists properties_set_updated_at on public.properties;
create trigger properties_set_updated_at before update on public.properties
for each row execute function public.set_updated_at();

drop trigger if exists locations_set_updated_at on public.locations;
create trigger locations_set_updated_at before update on public.locations
for each row execute function public.set_updated_at();

drop trigger if exists articles_set_updated_at on public.articles;
create trigger articles_set_updated_at before update on public.articles
for each row execute function public.set_updated_at();

drop trigger if exists team_members_set_updated_at on public.team_members;
create trigger team_members_set_updated_at before update on public.team_members
for each row execute function public.set_updated_at();

drop trigger if exists contact_info_set_updated_at on public.contact_info;
create trigger contact_info_set_updated_at before update on public.contact_info
for each row execute function public.set_updated_at();

drop trigger if exists website_settings_set_updated_at on public.website_settings;
create trigger website_settings_set_updated_at before update on public.website_settings
for each row execute function public.set_updated_at();

alter table public.properties enable row level security;
alter table public.locations enable row level security;
alter table public.articles enable row level security;
alter table public.team_members enable row level security;
alter table public.contact_info enable row level security;
alter table public.website_settings enable row level security;

drop policy if exists "Public can read published properties" on public.properties;
create policy "Public can read published properties" on public.properties
for select to anon, authenticated using (published is true);

drop policy if exists "Public can read published locations" on public.locations;
create policy "Public can read published locations" on public.locations
for select to anon, authenticated using (published is true);

drop policy if exists "Public can read published articles" on public.articles;
create policy "Public can read published articles" on public.articles
for select to anon, authenticated using (published is true);

drop policy if exists "Public can read published team members" on public.team_members;
create policy "Public can read published team members" on public.team_members
for select to anon, authenticated using (published is true);

drop policy if exists "Public can read contact info" on public.contact_info;
create policy "Public can read contact info" on public.contact_info
for select to anon, authenticated using (true);

drop policy if exists "Public can read website settings" on public.website_settings;
create policy "Public can read website settings" on public.website_settings
for select to anon, authenticated using (true);

revoke insert, update, delete, truncate, references, trigger
on public.properties, public.locations, public.articles, public.team_members,
   public.contact_info, public.website_settings
from anon, authenticated;

grant select on public.properties, public.locations, public.articles,
  public.team_members, public.contact_info, public.website_settings
to anon, authenticated;

grant insert, update, delete on public.properties to authenticated;

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now()
);

drop trigger if exists admin_users_set_updated_at on public.admin_users;
create trigger admin_users_set_updated_at before update on public.admin_users
for each row execute function public.set_updated_at();

alter table public.admin_users enable row level security;

revoke insert, update, delete, truncate, references, trigger
on public.admin_users
from anon, authenticated;

drop policy if exists "Admins can view own profile" on public.admin_users;
create policy "Admins can view own profile" on public.admin_users
for select to authenticated using (user_id = auth.uid());

grant select on public.admin_users to authenticated;

drop policy if exists "Admins can read all properties" on public.properties;
create policy "Admins can read all properties" on public.properties
for select to authenticated using (
  exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
  )
);

drop policy if exists "Admins can insert properties" on public.properties;
create policy "Admins can insert properties" on public.properties
for insert to authenticated with check (
  exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
  )
);

drop policy if exists "Admins can update properties" on public.properties;
create policy "Admins can update properties" on public.properties
for update to authenticated using (
  exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
  )
);

drop policy if exists "Admins can delete properties" on public.properties;
create policy "Admins can delete properties" on public.properties
for delete to authenticated using (
  exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
  )
);