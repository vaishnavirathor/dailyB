-- Daily Bread — user profiles with name + gender

create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  gender text check (gender in ('male', 'female', 'nonbinary', 'undisclosed')),
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "own profile readable" on profiles
  for select using (id = auth.uid());
create policy "insert own profile" on profiles
  for insert with check (id = auth.uid());
create policy "update own profile" on profiles
  for update using (id = auth.uid());
