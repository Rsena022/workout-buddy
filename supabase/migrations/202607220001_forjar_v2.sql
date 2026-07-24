create extension if not exists pgcrypto;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  profile_data jsonb not null default '{}'::jsonb,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  customer_email text not null,
  provider text not null default 'cakto',
  product_id text,
  order_id text not null,
  status text not null check (status in ('active', 'refunded', 'chargeback', 'revoked')),
  purchased_at timestamptz,
  revoked_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, order_id)
);

create index if not exists entitlements_email_idx
  on public.entitlements (lower(customer_email));
create index if not exists entitlements_user_status_idx
  on public.entitlements (user_id, status);

create table if not exists public.workout_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_data jsonb not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists one_active_plan_per_user_idx
  on public.workout_plans (user_id) where active;

create table if not exists public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workout_plan_id uuid references public.workout_plans(id) on delete set null,
  day_id text not null,
  day_name text not null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  duration_seconds integer check (duration_seconds is null or duration_seconds >= 0),
  perceived_effort smallint check (perceived_effort is null or perceived_effort between 1 and 10),
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists workout_sessions_user_started_idx
  on public.workout_sessions (user_id, started_at desc);

create table if not exists public.workout_set_logs (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.workout_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_id text not null,
  exercise_name text not null,
  set_number smallint not null check (set_number > 0),
  weight_kg numeric(7,2) check (weight_kg is null or weight_kg >= 0),
  repetitions smallint check (repetitions is null or repetitions >= 0),
  rir smallint check (rir is null or rir between 0 and 10),
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (session_id, exercise_id, set_number)
);

create index if not exists workout_set_logs_user_exercise_idx
  on public.workout_set_logs (user_id, exercise_id, created_at desc);

create table if not exists public.support_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (category in ('difficulty', 'exercise', 'plan', 'technical', 'other')),
  rating smallint check (rating is null or rating between 1 and 5),
  message text not null,
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved')),
  created_at timestamptz not null default now()
);

create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'cakto',
  provider_event_id text not null,
  event_type text not null,
  payload jsonb not null,
  processed_at timestamptz,
  processing_error text,
  created_at timestamptz not null default now(),
  unique (provider, provider_event_id)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists entitlements_set_updated_at on public.entitlements;
create trigger entitlements_set_updated_at before update on public.entitlements
for each row execute function public.set_updated_at();

drop trigger if exists workout_plans_set_updated_at on public.workout_plans;
create trigger workout_plans_set_updated_at before update on public.workout_plans
for each row execute function public.set_updated_at();

drop trigger if exists workout_set_logs_set_updated_at on public.workout_set_logs;
create trigger workout_set_logs_set_updated_at before update on public.workout_set_logs
for each row execute function public.set_updated_at();

create or replace function public.attach_purchases_to_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)))
  on conflict (user_id) do nothing;

  update public.entitlements
     set user_id = new.id,
         updated_at = now()
   where user_id is null
     and lower(customer_email) = lower(new.email);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.attach_purchases_to_new_user();

create or replace function public.has_active_entitlement()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
      from public.entitlements
     where user_id = auth.uid()
       and status = 'active'
  );
$$;

create or replace function public.upsert_cakto_entitlement(
  p_customer_email text,
  p_product_id text,
  p_order_id text,
  p_purchased_at timestamptz,
  p_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  matched_user_id uuid;
  entitlement_id uuid;
begin
  select id
    into matched_user_id
    from auth.users
   where lower(email) = lower(trim(p_customer_email))
   order by created_at asc
   limit 1;

  insert into public.entitlements (
    user_id,
    customer_email,
    provider,
    product_id,
    order_id,
    status,
    purchased_at,
    revoked_at,
    metadata
  ) values (
    matched_user_id,
    lower(trim(p_customer_email)),
    'cakto',
    p_product_id,
    p_order_id,
    'active',
    coalesce(p_purchased_at, now()),
    null,
    coalesce(p_metadata, '{}'::jsonb)
  )
  on conflict (provider, order_id) do update
     set user_id = coalesce(excluded.user_id, public.entitlements.user_id),
         customer_email = excluded.customer_email,
         product_id = excluded.product_id,
         status = 'active',
         purchased_at = excluded.purchased_at,
         revoked_at = null,
         metadata = excluded.metadata,
         updated_at = now()
  returning id into entitlement_id;

  return entitlement_id;
end;
$$;

revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.attach_purchases_to_new_user() from public, anon, authenticated;
revoke all on function public.has_active_entitlement() from public, anon;
revoke all on function public.upsert_cakto_entitlement(text, text, text, timestamptz, jsonb)
  from public, anon, authenticated;

grant execute on function public.has_active_entitlement() to authenticated;
grant execute on function public.upsert_cakto_entitlement(text, text, text, timestamptz, jsonb)
  to service_role;

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.entitlements from anon, authenticated;
revoke all on table public.workout_plans from anon, authenticated;
revoke all on table public.workout_sessions from anon, authenticated;
revoke all on table public.workout_set_logs from anon, authenticated;
revoke all on table public.support_feedback from anon, authenticated;
revoke all on table public.webhook_events from anon, authenticated;

grant select, insert, update on table public.profiles to authenticated;
grant select on table public.entitlements to authenticated;
grant select, insert, update on table public.workout_plans to authenticated;
grant select, insert, update on table public.workout_sessions to authenticated;
grant select, insert, update on table public.workout_set_logs to authenticated;
grant select, insert on table public.support_feedback to authenticated;

grant all on table public.profiles to service_role;
grant all on table public.entitlements to service_role;
grant all on table public.workout_plans to service_role;
grant all on table public.workout_sessions to service_role;
grant all on table public.workout_set_logs to service_role;
grant all on table public.support_feedback to service_role;
grant all on table public.webhook_events to service_role;

alter table public.profiles enable row level security;
alter table public.entitlements enable row level security;
alter table public.workout_plans enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.workout_set_logs enable row level security;
alter table public.support_feedback enable row level security;
alter table public.webhook_events enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
for select to authenticated using (user_id = auth.uid());
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "entitlements_select_own" on public.entitlements;
create policy "entitlements_select_own" on public.entitlements
for select to authenticated using (user_id = auth.uid());

drop policy if exists "plans_select_paid_owner" on public.workout_plans;
create policy "plans_select_paid_owner" on public.workout_plans
for select to authenticated using (user_id = auth.uid() and public.has_active_entitlement());
drop policy if exists "plans_insert_paid_owner" on public.workout_plans;
create policy "plans_insert_paid_owner" on public.workout_plans
for insert to authenticated with check (user_id = auth.uid() and public.has_active_entitlement());
drop policy if exists "plans_update_paid_owner" on public.workout_plans;
create policy "plans_update_paid_owner" on public.workout_plans
for update to authenticated using (user_id = auth.uid() and public.has_active_entitlement())
with check (user_id = auth.uid() and public.has_active_entitlement());

drop policy if exists "sessions_select_paid_owner" on public.workout_sessions;
create policy "sessions_select_paid_owner" on public.workout_sessions
for select to authenticated using (user_id = auth.uid() and public.has_active_entitlement());
drop policy if exists "sessions_insert_paid_owner" on public.workout_sessions;
create policy "sessions_insert_paid_owner" on public.workout_sessions
for insert to authenticated with check (user_id = auth.uid() and public.has_active_entitlement());
drop policy if exists "sessions_update_paid_owner" on public.workout_sessions;
create policy "sessions_update_paid_owner" on public.workout_sessions
for update to authenticated using (user_id = auth.uid() and public.has_active_entitlement())
with check (user_id = auth.uid() and public.has_active_entitlement());

drop policy if exists "sets_select_paid_owner" on public.workout_set_logs;
create policy "sets_select_paid_owner" on public.workout_set_logs
for select to authenticated using (user_id = auth.uid() and public.has_active_entitlement());
drop policy if exists "sets_insert_paid_owner" on public.workout_set_logs;
create policy "sets_insert_paid_owner" on public.workout_set_logs
for insert to authenticated with check (user_id = auth.uid() and public.has_active_entitlement());
drop policy if exists "sets_update_paid_owner" on public.workout_set_logs;
create policy "sets_update_paid_owner" on public.workout_set_logs
for update to authenticated using (user_id = auth.uid() and public.has_active_entitlement())
with check (user_id = auth.uid() and public.has_active_entitlement());

drop policy if exists "feedback_select_own" on public.support_feedback;
create policy "feedback_select_own" on public.support_feedback
for select to authenticated using (user_id = auth.uid());
drop policy if exists "feedback_insert_own" on public.support_feedback;
create policy "feedback_insert_own" on public.support_feedback
for insert to authenticated with check (user_id = auth.uid());
