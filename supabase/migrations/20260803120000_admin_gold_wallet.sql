create table if not exists public.gold_wallet_settings (
  id text primary key default 'main' check (id = 'main'),
  pin_hash text not null,
  updated_by uuid not null references auth.users(id),
  updated_at timestamptz not null default now()
);

create table if not exists public.gold_purchases (
  id uuid primary key default gen_random_uuid(),
  item_name text not null,
  gold_type text not null check (gold_type in ('bar','coin','jewelry','other')),
  weight_grams numeric(12,3) not null check (weight_grams > 0),
  karat smallint not null check (karat in (24,22,21,18)),
  purchase_date date not null,
  purchase_price_total numeric(14,2) not null check (purchase_price_total >= 0),
  notes text not null default '',
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.gold_wallet_settings enable row level security;
alter table public.gold_purchases enable row level security;
grant select, insert, update on public.gold_wallet_settings to authenticated;
grant select, insert, update, delete on public.gold_purchases to authenticated;

create policy "Admins read wallet settings" on public.gold_wallet_settings for select to authenticated using ((select public.is_sweater_admin()));
create policy "Admins create wallet settings" on public.gold_wallet_settings for insert to authenticated with check ((select public.is_sweater_admin()) and updated_by = (select auth.uid()));
create policy "Admins update wallet settings" on public.gold_wallet_settings for update to authenticated using ((select public.is_sweater_admin())) with check ((select public.is_sweater_admin()) and updated_by = (select auth.uid()));
create policy "Admins read gold purchases" on public.gold_purchases for select to authenticated using ((select public.is_sweater_admin()));
create policy "Admins create gold purchases" on public.gold_purchases for insert to authenticated with check ((select public.is_sweater_admin()) and created_by = (select auth.uid()));
create policy "Admins update gold purchases" on public.gold_purchases for update to authenticated using ((select public.is_sweater_admin())) with check ((select public.is_sweater_admin()));
create policy "Admins delete gold purchases" on public.gold_purchases for delete to authenticated using ((select public.is_sweater_admin()));
create index if not exists gold_purchases_purchase_date_idx on public.gold_purchases (purchase_date desc);
