-- ============================================================================
-- ZenFin · esquema de Supabase (cuentas separadas + cuentas compartidas)
--
-- Cómo usarlo: Supabase Dashboard → SQL Editor → pegar todo → Run.
--
-- Modelo:
--   · Cada persona tiene su cuenta (Supabase Auth) y SUS datos: transacciones,
--     categorías, presupuestos y gastos fijos son privados (RLS por user_id).
--   · Las "cuentas compartidas" (shared_groups) son el único espacio común:
--     los miembros ven los gastos compartidos y quién debe a quién.
--   · Se entra en un grupo con un código de invitación.
--
-- Si ya tenías tablas de pruebas con estos nombres (users, categories,
-- transactions...) y sin datos importantes, descomenta el bloque RESET.
-- ============================================================================

-- ---- RESET (opcional, DESTRUCTIVO) -----------------------------------------
-- drop table if exists public.shared_expenses, public.shared_group_members,
--   public.shared_groups, public.recurring_items, public.budgets,
--   public.transactions, public.categories, public.users cascade;
-- drop table if exists public.couple_groups cascade;

create extension if not exists pgcrypto;

-- ---- Migración segura desde el esquema antiguo ------------------------------
-- Si ya existían tablas con estos nombres pero con otra estructura (versión anterior
-- de ZenFin), NO se borran: se mueven al esquema "legacy_zenfin" con todos sus datos.
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'users')
     and not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'users' and column_name = 'onboarded') then
    create schema if not exists legacy_zenfin;
    perform 1;
    execute 'alter table public.users set schema legacy_zenfin';
    if to_regclass('public.categories')   is not null then execute 'alter table public.categories set schema legacy_zenfin'; end if;
    if to_regclass('public.transactions') is not null then execute 'alter table public.transactions set schema legacy_zenfin'; end if;
    if to_regclass('public.budgets')      is not null then execute 'alter table public.budgets set schema legacy_zenfin'; end if;
    if to_regclass('public.couple_groups') is not null then execute 'alter table public.couple_groups set schema legacy_zenfin'; end if;
    raise notice 'Tablas antiguas movidas a legacy_zenfin';
  end if;
end $$;

-- ---- Tablas ----------------------------------------------------------------
create table if not exists public.users (
  id              uuid primary key references auth.users(id) on delete cascade,
  name            text not null default '',
  email           text,
  whatsapp_number text unique,
  theme           text not null default 'dark',
  language        text not null default 'es',
  onboarded       boolean not null default false,
  created_at      timestamptz not null default now()
);

create table if not exists public.categories (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users(id) on delete cascade,
  name       text not null,
  icon       text not null default '📦',
  color      text not null default '#64748B',
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists categories_user_idx on public.categories(user_id);

create table if not exists public.transactions (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.users(id) on delete cascade,
  category_id      uuid references public.categories(id) on delete set null,
  amount           numeric(12,2) not null check (amount > 0),
  transaction_type text not null check (transaction_type in ('expense','income')),
  recurrence_type  text not null default 'variable',
  date             date not null default current_date,
  note             text not null default '',
  source           text not null default 'app',
  created_at       timestamptz not null default now()
);
create index if not exists transactions_user_date_idx on public.transactions(user_id, date desc);

create table if not exists public.budgets (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.users(id) on delete cascade,
  category_id  uuid not null references public.categories(id) on delete cascade,
  limit_amount numeric(12,2) not null check (limit_amount > 0),
  unique (user_id, category_id)
);

create table if not exists public.recurring_items (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid not null references public.users(id) on delete cascade,
  kind      text not null check (kind in ('expense','income')),
  name      text not null,
  amount    numeric(12,2) not null check (amount > 0),
  frequency text not null default 'monthly',
  day       int  not null default 1 check (day between 1 and 31)
);
create index if not exists recurring_user_idx on public.recurring_items(user_id);

create table if not exists public.shared_groups (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  invite_code text not null unique default upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 8)),
  created_by  uuid not null references public.users(id) on delete cascade,
  created_at  timestamptz not null default now()
);

create table if not exists public.shared_group_members (
  group_id  uuid not null references public.shared_groups(id) on delete cascade,
  user_id   uuid not null references public.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);
create index if not exists sgm_user_idx on public.shared_group_members(user_id);

create table if not exists public.shared_expenses (
  id          uuid primary key default gen_random_uuid(),
  group_id    uuid not null references public.shared_groups(id) on delete cascade,
  title       text not null,
  amount      numeric(12,2) not null check (amount > 0),
  payer_id    uuid not null references public.users(id) on delete cascade,
  receiver_id uuid references public.users(id) on delete cascade,
  is_transfer boolean not null default false,
  date        date not null default current_date,
  created_by  uuid not null references public.users(id) on delete cascade,
  created_at  timestamptz not null default now()
);
create index if not exists shared_expenses_group_idx on public.shared_expenses(group_id, date desc);

-- ---- Funciones auxiliares (security definer: evitan recursión en RLS) -------
create or replace function public.is_group_member(gid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from shared_group_members where group_id = gid and user_id = auth.uid());
$$;

create or replace function public.shares_group_with(uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from shared_group_members a
    join shared_group_members b on a.group_id = b.group_id
    where a.user_id = auth.uid() and b.user_id = uid
  );
$$;

create or replace function public.create_shared_group(group_name text)
returns public.shared_groups language plpgsql security definer set search_path = public as $$
declare g shared_groups;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  if length(trim(group_name)) = 0 then raise exception 'name required'; end if;
  insert into shared_groups (name, created_by) values (trim(group_name), auth.uid()) returning * into g;
  insert into shared_group_members (group_id, user_id) values (g.id, auth.uid());
  return g;
end $$;

create or replace function public.join_shared_group(code text)
returns public.shared_groups language plpgsql security definer set search_path = public as $$
declare g shared_groups;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  select * into g from shared_groups where invite_code = upper(trim(code));
  if not found then raise exception 'invalid code'; end if;
  insert into shared_group_members (group_id, user_id) values (g.id, auth.uid()) on conflict do nothing;
  return g;
end $$;

create or replace function public.leave_shared_group(gid uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  delete from shared_group_members where group_id = gid and user_id = auth.uid();
  if not exists (select 1 from shared_group_members where group_id = gid) then
    delete from shared_groups where id = gid;
  end if;
end $$;

revoke all on function public.create_shared_group(text), public.join_shared_group(text),
  public.leave_shared_group(uuid) from public, anon;
grant execute on function public.create_shared_group(text), public.join_shared_group(text),
  public.leave_shared_group(uuid), public.is_group_member(uuid), public.shares_group_with(uuid)
  to authenticated;

-- ---- Perfil automático al registrarse --------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', ''))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---- Row Level Security -----------------------------------------------------
alter table public.users                enable row level security;
alter table public.categories           enable row level security;
alter table public.transactions         enable row level security;
alter table public.budgets              enable row level security;
alter table public.recurring_items      enable row level security;
alter table public.shared_groups        enable row level security;
alter table public.shared_group_members enable row level security;
alter table public.shared_expenses      enable row level security;

-- users: el propio perfil + el de quienes comparten grupo conmigo (para ver nombres)
drop policy if exists users_select on public.users;
create policy users_select on public.users for select to authenticated
  using (id = auth.uid() or public.shares_group_with(id));
drop policy if exists users_insert on public.users;
create policy users_insert on public.users for insert to authenticated with check (id = auth.uid());
drop policy if exists users_update on public.users;
create policy users_update on public.users for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- Datos personales: solo el dueño
do $$
declare t text;
begin
  foreach t in array array['categories','transactions','budgets','recurring_items'] loop
    execute format('drop policy if exists %I_owner on public.%I', t, t);
    execute format(
      'create policy %I_owner on public.%I for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid())',
      t, t);
  end loop;
end $$;

-- Cuentas compartidas: solo miembros (crear/unirse/salir pasa por las funciones de arriba)
drop policy if exists sg_select on public.shared_groups;
create policy sg_select on public.shared_groups for select to authenticated using (public.is_group_member(id));
drop policy if exists sg_update on public.shared_groups;
create policy sg_update on public.shared_groups for update to authenticated
  using (public.is_group_member(id)) with check (public.is_group_member(id));

drop policy if exists sgm_select on public.shared_group_members;
create policy sgm_select on public.shared_group_members for select to authenticated
  using (public.is_group_member(group_id));

drop policy if exists se_select on public.shared_expenses;
create policy se_select on public.shared_expenses for select to authenticated using (public.is_group_member(group_id));
drop policy if exists se_insert on public.shared_expenses;
create policy se_insert on public.shared_expenses for insert to authenticated
  with check (
    public.is_group_member(group_id)
    and created_by = auth.uid()
    and exists (select 1 from public.shared_group_members m where m.group_id = shared_expenses.group_id and m.user_id = payer_id)
  );
drop policy if exists se_delete on public.shared_expenses;
create policy se_delete on public.shared_expenses for delete to authenticated using (public.is_group_member(group_id));

-- ---- Realtime (para que los cambios aparezcan al instante en el otro móvil) --
do $$
declare t text;
begin
  foreach t in array array['transactions','categories','budgets','recurring_items','shared_group_members','shared_expenses'] loop
    begin
      execute format('alter publication supabase_realtime add table public.%I', t);
    exception when duplicate_object then null;
    end;
  end loop;
end $$;
