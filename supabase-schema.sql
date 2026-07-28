-- SWEATER Workspace — run once in Supabase SQL Editor
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  username text unique,
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

drop policy if exists "profile read own or admin" on public.profiles;
create policy "profile read own or admin" on public.profiles for select to authenticated
using (id=auth.uid() or public.is_sweater_admin());

drop policy if exists "profile update own or admin" on public.profiles;
create policy "profile update own or admin" on public.profiles for update to authenticated
using (id=auth.uid() or public.is_sweater_admin())
with check (id=auth.uid() or public.is_sweater_admin());

create or replace function public.protect_profile_privileges()
returns trigger language plpgsql security definer set search_path=public
as $$
begin
  if (old.role is distinct from new.role or old.status is distinct from new.status)
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
begin
  -- The very first registered account becomes admin; later accounts are employees.
  select case when exists(select 1 from public.profiles) then 'employee' else 'admin' end into first_role;
  insert into public.profiles(id,full_name,username,role)
  values(
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name',''),
    nullif(new.raw_user_meta_data->>'username',''),
    first_role
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

grant select,update on public.profiles to authenticated;
grant select,insert,update,delete on public.user_data to authenticated;

create index if not exists user_data_user_id_idx on public.user_data(user_id);
create index if not exists profiles_role_idx on public.profiles(role);
