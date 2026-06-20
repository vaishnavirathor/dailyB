-- Daily Bread — user tracking tables
-- Run after schema.sql (which creates profiles).

-- ── Reading progress ─────────────────────────────────────────
create table if not exists reading_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  version text not null,
  book_id text not null,
  chapter int not null,
  completed_at timestamptz not null default now(),
  unique (user_id, version, book_id, chapter)
);

alter table reading_progress enable row level security;

create policy "own progress readable" on reading_progress
  for select using (user_id = auth.uid());
create policy "insert own progress" on reading_progress
  for insert with check (user_id = auth.uid());
create policy "update own progress" on reading_progress
  for update using (user_id = auth.uid());
create policy "delete own progress" on reading_progress
  for delete using (user_id = auth.uid());

-- ── Bookmarks (verse-level) ──────────────────────────────────
create table if not exists bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  version text not null,
  book_id text not null,
  chapter int not null,
  verse_index int not null,
  note text check (char_length(note) <= 500),
  created_at timestamptz not null default now(),
  unique (user_id, version, book_id, chapter, verse_index)
);

alter table bookmarks enable row level security;

create policy "own bookmarks readable" on bookmarks
  for select using (user_id = auth.uid());
create policy "insert own bookmark" on bookmarks
  for insert with check (user_id = auth.uid());
create policy "delete own bookmark" on bookmarks
  for delete using (user_id = auth.uid());
create policy "update own bookmark" on bookmarks
  for update using (user_id = auth.uid());

-- ── Favorites (verse-level) ──────────────────────────────────
create table if not exists favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  version text not null,
  book_id text not null,
  chapter int not null,
  verse_index int not null,
  text text,
  reference text,
  created_at timestamptz not null default now(),
  unique (user_id, version, book_id, chapter, verse_index)
);

alter table favorites enable row level security;

create policy "own favorites readable" on favorites
  for select using (user_id = auth.uid());
create policy "insert own favorite" on favorites
  for insert with check (user_id = auth.uid());
create policy "delete own favorite" on favorites
  for delete using (user_id = auth.uid());

-- ── User preferences ─────────────────────────────────────────
create table if not exists user_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  language text not null default 'te',
  tradition text not null default 'protestant',
  font_scale text not null default 'normal',
  tts_gender text not null default 'auto',
  telugu_heading_font text not null default 'Suranna_400Regular',
  telugu_body_font text not null default 'NTR_400Regular',
  english_heading_font text not null default 'PlayfairDisplay_600SemiBold',
  english_body_font text not null default 'SourceSerif4_400Regular',
  updated_at timestamptz not null default now()
);

alter table user_preferences enable row level security;

create policy "own preferences readable" on user_preferences
  for select using (user_id = auth.uid());
create policy "upsert own preferences" on user_preferences
  for insert with check (user_id = auth.uid());
create policy "update own preferences" on user_preferences
  for update using (user_id = auth.uid());

-- ── App analytics events ─────────────────────────────────────
create table if not exists app_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  device_id text not null,
  event_name text not null,
  properties jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_events_created on app_events (created_at desc);
create index if not exists idx_events_name on app_events (event_name);

alter table app_events enable row level security;

-- Only the service role can read events (no client access).
create policy "service role only" on app_events
  for all using (false);

-- ── Indexes for common queries ───────────────────────────────
create index if not exists idx_progress_user on reading_progress (user_id, version, book_id, chapter);
create index if not exists idx_bookmarks_user on bookmarks (user_id, version, book_id, chapter);
create index if not exists idx_favorites_user on favorites (user_id, version, book_id, chapter);
