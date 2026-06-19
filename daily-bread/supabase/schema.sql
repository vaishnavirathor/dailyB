-- ============================================================
-- Daily Bread — community backend schema (Supabase / Postgres)
--
-- Setup:
--   1. Create a Supabase project (free tier) at supabase.com
--   2. Authentication → Providers → enable "Anonymous sign-ins"
--   3. SQL Editor → paste this whole file → Run
--   4. Copy Project URL + anon key into .env (see .env.example)
--
-- Moderation model:
--   - prayer requests post as 'approved' (family-safe default copy),
--     auto-hide at 3 reports (status → 'pending'), manual override in
--     the dashboard table editor
--   - parishes & service times post unapproved; approve in dashboard
-- ============================================================

-- ── Profiles ────────────────────────────────────────────────
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "profiles readable by all" on profiles
  for select using (true);
create policy "insert own profile" on profiles
  for insert with check (auth.uid() = id);
create policy "update own profile" on profiles
  for update using (auth.uid() = id);

-- ── Groups ──────────────────────────────────────────────────
create table if not exists groups (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 60),
  invite_code text not null unique check (invite_code ~ '^[A-Z2-9]{6}$'),
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists group_members (
  group_id uuid not null references groups (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

-- Helper avoids recursive RLS lookups on group_members.
create or replace function is_group_member(gid uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from group_members where group_id = gid and user_id = auth.uid()
  );
$$;

alter table groups enable row level security;
alter table group_members enable row level security;

-- Invite codes are the secret; group rows themselves are lookup-able.
create policy "groups readable" on groups for select using (true);
create policy "create group" on groups
  for insert with check (auth.uid() = created_by);

create policy "memberships readable to members" on group_members
  for select using (user_id = auth.uid() or is_group_member(group_id));
create policy "join group yourself" on group_members
  for insert with check (user_id = auth.uid());
create policy "leave group yourself" on group_members
  for delete using (user_id = auth.uid());

-- ── Prayer wall ─────────────────────────────────────────────
create table if not exists prayer_requests (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users (id) on delete cascade,
  author_name text not null default 'Friend',
  body text not null check (char_length(body) between 3 and 500),
  group_id uuid references groups (id) on delete cascade,
  status text not null default 'approved' check (status in ('approved', 'pending', 'rejected')),
  report_count int not null default 0,
  prayed_count int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists prayed_taps (
  request_id uuid not null references prayer_requests (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (request_id, user_id)
);

create table if not exists request_reports (
  request_id uuid not null references prayer_requests (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (request_id, user_id)
);

alter table prayer_requests enable row level security;
alter table prayed_taps enable row level security;
alter table request_reports enable row level security;

create policy "approved requests readable" on prayer_requests
  for select using (
    (status = 'approved' and (group_id is null or is_group_member(group_id)))
    or author_id = auth.uid()
  );
create policy "post as yourself" on prayer_requests
  for insert with check (
    auth.uid() = author_id
    and (group_id is null or is_group_member(group_id))
  );
create policy "delete own request" on prayer_requests
  for delete using (author_id = auth.uid());

create policy "taps readable" on prayed_taps for select using (user_id = auth.uid());
create policy "tap as yourself" on prayed_taps
  for insert with check (user_id = auth.uid());

create policy "report as yourself" on request_reports
  for insert with check (user_id = auth.uid());

-- Counter + auto-hide triggers (run as owner, bypass RLS safely).
create or replace function bump_prayed_count() returns trigger
language plpgsql security definer as $$
begin
  update prayer_requests set prayed_count = prayed_count + 1 where id = new.request_id;
  return new;
end;
$$;

create or replace function bump_report_count() returns trigger
language plpgsql security definer as $$
begin
  update prayer_requests
  set report_count = report_count + 1,
      status = case when report_count + 1 >= 3 then 'pending' else status end
  where id = new.request_id;
  return new;
end;
$$;

drop trigger if exists on_prayed_tap on prayed_taps;
create trigger on_prayed_tap after insert on prayed_taps
  for each row execute function bump_prayed_count();

drop trigger if exists on_request_report on request_reports;
create trigger on_request_report after insert on request_reports
  for each row execute function bump_report_count();

-- ── Parishes & service times ────────────────────────────────
create table if not exists parishes (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  city text not null check (char_length(city) between 2 and 60),
  tradition text not null check (tradition in ('protestant', 'catholic', 'orthodox')),
  approved boolean not null default false,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists service_times (
  id uuid primary key default gen_random_uuid(),
  parish_id uuid not null references parishes (id) on delete cascade,
  weekday int not null check (weekday between 0 and 6),
  time text not null check (time ~ '^[0-2][0-9]:[0-5][0-9]$'),
  label text check (char_length(label) <= 60),
  approved boolean not null default false,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table parishes enable row level security;
alter table service_times enable row level security;

create policy "approved parishes readable" on parishes
  for select using (approved or created_by = auth.uid());
create policy "submit parish" on parishes
  for insert with check (created_by = auth.uid() and approved = false);

create policy "approved times readable" on service_times
  for select using (approved or created_by = auth.uid());
create policy "submit time" on service_times
  for insert with check (created_by = auth.uid() and approved = false);

-- Helpful indexes
create index if not exists idx_requests_wall on prayer_requests (status, group_id, created_at desc);
create index if not exists idx_parishes_city on parishes (approved, city);
create index if not exists idx_times_parish on service_times (parish_id, approved, weekday, time);
