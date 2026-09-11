create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null default 'Ingliz Tili O''qituvchisi',
  institution text not null default '',
  bio text not null default '',
  avatar_color text not null default '#0E56D4',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  legacy_id text,
  title text not null,
  category text not null,
  level text not null,
  type text not null check (type in ('interactive-slides', 'pdf-presentation')),
  content jsonb not null default '{}'::jsonb,
  pdf_path text,
  pdf_page_count integer not null default 1 check (pdf_page_count > 0),
  last_slide_index integer not null default 0 check (last_slide_index >= 0),
  version integer not null default 1,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.student_groups (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  legacy_id text,
  name text not null,
  students jsonb not null default '[]'::jsonb,
  version integer not null default 1,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.lesson_sessions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  legacy_id text,
  lesson_id uuid references public.lessons(id) on delete set null,
  group_id uuid references public.student_groups(id) on delete set null,
  record jsonb not null,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.remote_pairs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  expires_at timestamptz not null,
  redeemed_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index lessons_owner_legacy_id_idx on public.lessons(owner_id, legacy_id) where legacy_id is not null;
create unique index student_groups_owner_legacy_id_idx on public.student_groups(owner_id, legacy_id) where legacy_id is not null;
create unique index lesson_sessions_owner_legacy_id_idx on public.lesson_sessions(owner_id, legacy_id) where legacy_id is not null;
create index lessons_owner_updated_idx on public.lessons(owner_id, updated_at desc) where deleted_at is null;
create index student_groups_owner_updated_idx on public.student_groups(owner_id, updated_at desc) where deleted_at is null;
create index lesson_sessions_owner_created_idx on public.lesson_sessions(owner_id, created_at desc);
create index remote_pairs_owner_expires_idx on public.remote_pairs(owner_id, expires_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  new.updated_at = now();
  new.version = old.version + 1;
  return new;
end;
$$;

create or replace function public.create_profile_for_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name, role, institution, bio, avatar_color)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    coalesce(new.raw_user_meta_data ->> 'role', 'Ingliz Tili O''qituvchisi'),
    coalesce(new.raw_user_meta_data ->> 'institution', ''),
    coalesce(new.raw_user_meta_data ->> 'bio', ''),
    coalesce(new.raw_user_meta_data ->> 'avatar_color', '#0E56D4')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger lessons_set_updated_at before update on public.lessons for each row execute function public.set_updated_at();
create trigger student_groups_set_updated_at before update on public.student_groups for each row execute function public.set_updated_at();
create trigger lesson_sessions_set_updated_at before update on public.lesson_sessions for each row execute function public.set_updated_at();
create trigger create_profile_after_signup after insert on auth.users for each row execute function public.create_profile_for_user();

alter table public.profiles enable row level security;
alter table public.lessons enable row level security;
alter table public.student_groups enable row level security;
alter table public.lesson_sessions enable row level security;
alter table public.remote_pairs enable row level security;

create policy "teachers manage own profile" on public.profiles for all using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "teachers manage own lessons" on public.lessons for all using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy "teachers manage own groups" on public.student_groups for all using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy "teachers manage own sessions" on public.lesson_sessions for all using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy "teachers manage own remote pairs" on public.remote_pairs for all using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
