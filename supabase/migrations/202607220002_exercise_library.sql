create table if not exists public.exercise_library (
  id text primary key,
  source text not null,
  source_id text not null,
  source_url text not null,
  source_license text not null,
  attribution text not null,
  name text not null,
  name_pt text,
  category text not null default 'strength',
  difficulty text not null default 'beginner'
    check (difficulty in ('beginner', 'intermediate', 'advanced')),
  body_parts text[] not null default '{}',
  target_muscles text[] not null default '{}',
  secondary_muscles text[] not null default '{}',
  equipments text[] not null default '{}',
  instructions text[] not null default '{}',
  instructions_pt text[] not null default '{}',
  beginner_score integer not null default 0,
  media_type text not null default 'gif'
    check (media_type in ('gif', 'animated_webp', 'video')),
  media_start_path text,
  media_peak_path text,
  media_path text,
  active boolean not null default true,
  source_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source, source_id)
);

create index if not exists exercise_library_active_score_idx
  on public.exercise_library (active, beginner_score desc);
create index if not exists exercise_library_body_parts_idx
  on public.exercise_library using gin (body_parts);
create index if not exists exercise_library_equipments_idx
  on public.exercise_library using gin (equipments);

drop trigger if exists exercise_library_set_updated_at on public.exercise_library;
create trigger exercise_library_set_updated_at before update on public.exercise_library
for each row execute function public.set_updated_at();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'exercise-media',
  'exercise-media',
  false,
  5242880,
  array['image/webp', 'image/gif', 'image/jpeg', 'image/png', 'video/mp4']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

revoke all on table public.exercise_library from anon, authenticated;
grant select on table public.exercise_library to authenticated;
grant all on table public.exercise_library to service_role;

alter table public.exercise_library enable row level security;

drop policy if exists "paid users read exercise library" on public.exercise_library;
create policy "paid users read exercise library"
on public.exercise_library
for select
to authenticated
using (active and public.has_active_entitlement());

drop policy if exists "paid users read exercise media" on storage.objects;
create policy "paid users read exercise media"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'exercise-media'
  and public.has_active_entitlement()
);

comment on table public.exercise_library is
  'Curated exercise metadata and licensed animated media references. Preserve source license and attribution.';
