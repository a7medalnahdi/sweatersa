-- SWEATER Workspace — run once in Supabase SQL Editor
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  username text unique,
  email text unique,
  department text,
  role text not null default 'employee' check (role in ('admin','editor','employee','viewer')),
  status text not null default 'active' check (status in ('active','suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_data (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  data_key text not null,
  value jsonb,
  updated_at timestamptz not null default now(),
  unique(user_id,data_key)
);

alter table public.profiles enable row level security;
alter table public.user_data enable row level security;

create or replace function public.is_sweater_admin()
returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.profiles where id=auth.uid() and role='admin' and status='active') $$;

revoke execute on function public.is_sweater_admin() from public, anon;
grant execute on function public.is_sweater_admin() to authenticated;

drop policy if exists "profile read own or admin" on public.profiles;
create policy "profile read own or admin" on public.profiles for select to authenticated
using (id=auth.uid() or public.is_sweater_admin());

drop policy if exists "profile update own or admin" on public.profiles;
create policy "profile update own or admin" on public.profiles for update to authenticated
using (id=auth.uid() or public.is_sweater_admin())
with check (id=auth.uid() or public.is_sweater_admin());

create or replace function public.protect_profile_privileges()
returns trigger language plpgsql security invoker set search_path=public
as $$
begin
  if (old.role is distinct from new.role or old.status is distinct from new.status)
     and current_user <> 'service_role'
     and not public.is_sweater_admin() then
    raise exception 'Only an active administrator can change roles or account status';
  end if;
  new.updated_at=now();
  return new;
end;
$$;

drop trigger if exists protect_profile_privileges on public.profiles;
create trigger protect_profile_privileges before update on public.profiles
for each row execute procedure public.protect_profile_privileges();

drop policy if exists "users own their data" on public.user_data;
create policy "users own their data" on public.user_data for all to authenticated
using (user_id=auth.uid()) with check (user_id=auth.uid());

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path=public
as $$
declare first_role text;
declare requested_role text;
declare requested_status text;
begin
  -- The very first registered account becomes admin; later accounts are employees.
  select case when exists(select 1 from public.profiles) then 'employee' else 'admin' end into first_role;
  requested_role := case when new.raw_app_meta_data->>'sweater_role' = 'admin' then 'admin' else first_role end;
  requested_status := case when new.raw_app_meta_data->>'sweater_status' = 'suspended' then 'suspended' else 'active' end;
  insert into public.profiles(id,full_name,username,email,department,role,status)
  values(
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name',''),
    nullif(new.raw_user_meta_data->>'username',''),
    new.email,
    nullif(new.raw_user_meta_data->>'department',''),
    requested_role,
    requested_status
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

revoke all on function public.handle_new_user() from public, anon, authenticated;

grant select,update on public.profiles to authenticated;
grant select,insert,update,delete on public.user_data to authenticated;

create index if not exists user_data_user_id_idx on public.user_data(user_id);
create index if not exists profiles_role_idx on public.profiles(role);

-- Global site configuration shared by every signed-in user and device.
create table if not exists public.site_config (
  id text primary key check (id = 'global'),
  value jsonb not null default '{}'::jsonb,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.site_config enable row level security;

drop policy if exists "authenticated users read site config" on public.site_config;
create policy "authenticated users read site config" on public.site_config
for select to authenticated using (true);

drop policy if exists "admins insert site config" on public.site_config;
create policy "admins insert site config" on public.site_config
for insert to authenticated with check (public.is_sweater_admin());

drop policy if exists "admins update site config" on public.site_config;
create policy "admins update site config" on public.site_config
for update to authenticated
using (public.is_sweater_admin())
with check (public.is_sweater_admin());

grant select,insert,update on public.site_config to authenticated;

-- Public image bucket: everyone can display images, active admins can manage them.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values (
  'site-assets',
  'site-assets',
  true,
  10485760,
  array['image/jpeg','image/png','image/webp','image/gif','image/svg+xml']
)
on conflict (id) do update set
  public=excluded.public,
  file_size_limit=excluded.file_size_limit,
  allowed_mime_types=excluded.allowed_mime_types;

drop policy if exists "authenticated users read site assets" on storage.objects;

drop policy if exists "admins insert site assets" on storage.objects;
create policy "admins insert site assets" on storage.objects
for insert to authenticated with check (
  bucket_id='site-assets' and public.is_sweater_admin()
);

drop policy if exists "admins update site assets" on storage.objects;
create policy "admins update site assets" on storage.objects
for update to authenticated
using (bucket_id='site-assets' and public.is_sweater_admin())
with check (bucket_id='site-assets' and public.is_sweater_admin());

drop policy if exists "admins delete site assets" on storage.objects;
create policy "admins delete site assets" on storage.objects
for delete to authenticated
using (bucket_id='site-assets' and public.is_sweater_admin());

-- Broadcast configuration changes instantly to already-open pages.
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname='supabase_realtime'
      and schemaname='public'
      and tablename='site_config'
  ) then
    alter publication supabase_realtime add table public.site_config;
  end if;
end
$$;

-- Privacy-conscious site analytics: page names and timestamps only.
create table if not exists public.site_visits (
  id bigint generated by default as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  page text not null check (char_length(page) between 1 and 160),
  visited_at timestamptz not null default now()
);

create table if not exists public.user_presence (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  current_page text not null default 'index.html' check (char_length(current_page) between 1 and 160),
  last_seen_at timestamptz not null default now()
);

alter table public.site_visits enable row level security;
alter table public.user_presence enable row level security;

create policy "users record own visits" on public.site_visits
for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "admins read site visits" on public.site_visits
for select to authenticated using (public.is_sweater_admin());
create policy "users read own presence or admins read all" on public.user_presence
for select to authenticated using ((select auth.uid()) = user_id or public.is_sweater_admin());
create policy "users create own presence" on public.user_presence
for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "users update own presence" on public.user_presence
for update to authenticated using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

grant select,insert on public.site_visits to authenticated;
grant select,insert,update on public.user_presence to authenticated;
create index if not exists site_visits_user_time_idx on public.site_visits(user_id, visited_at desc);
create index if not exists site_visits_time_idx on public.site_visits(visited_at desc);
create index if not exists user_presence_last_seen_idx on public.user_presence(last_seen_at desc);
