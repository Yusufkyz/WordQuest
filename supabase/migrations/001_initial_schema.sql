-- ============================================================
-- WordQuest — Initial Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ──────────────────────────────────────────────
-- USERS (extends auth.users)
-- ──────────────────────────────────────────────
create table public.users (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null,
  full_name     text,
  avatar_url    text,
  daily_goal    int  not null default 10,
  streak_count  int  not null default 0,
  last_study_date date,
  current_level text not null default 'A1' check (current_level in ('A1','A2','B1','B2','C1')),
  total_xp      int  not null default 0,
  created_at    timestamptz not null default now()
);

alter table public.users enable row level security;
create policy "Users can view own profile"   on public.users for select using (auth.uid() = id);
create policy "Users can update own profile" on public.users for update using (auth.uid() = id);

-- Auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ──────────────────────────────────────────────
-- WORDS
-- ──────────────────────────────────────────────
create table public.words (
  id                 uuid primary key default uuid_generate_v4(),
  english            text not null unique,
  turkish            text not null,
  level              text not null check (level in ('A1','A2','B1','B2','C1')),
  image_url          text,
  audio_url          text,
  example_sentences  text[],
  synonyms           text[],
  antonyms           text[],
  word_family        text[],
  collocations       text[],
  context_tag        text check (context_tag in ('formal','informal','written','spoken')),
  dialog_example     text,
  created_at         timestamptz not null default now()
);

alter table public.words enable row level security;
create policy "Words are public" on public.words for select using (true);

-- ──────────────────────────────────────────────
-- WORD PROGRESS
-- ──────────────────────────────────────────────
create table public.word_progress (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references public.users(id) on delete cascade,
  word_id          uuid not null references public.words(id) on delete cascade,
  repeat_count     int  not null default 7,   -- counts down 7→0
  difficulty       text not null default 'medium' check (difficulty in ('easy','medium','hard')),
  status           text not null default 'new' check (status in ('new','learning','learned')),
  correct_count    int  not null default 0,
  wrong_count      int  not null default 0,
  next_review_date timestamptz,
  last_reviewed_at timestamptz,
  created_at       timestamptz not null default now(),
  unique (user_id, word_id)
);

alter table public.word_progress enable row level security;
create policy "Users own their progress" on public.word_progress for all using (auth.uid() = user_id);

-- ──────────────────────────────────────────────
-- REVIEW SESSIONS
-- ──────────────────────────────────────────────
create table public.review_sessions (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.users(id) on delete cascade,
  level         text not null,
  correct_count int  not null default 0,
  wrong_count   int  not null default 0,
  xp_earned     int  not null default 0,
  started_at    timestamptz not null default now(),
  ended_at      timestamptz
);

alter table public.review_sessions enable row level security;
create policy "Users own their sessions" on public.review_sessions for all using (auth.uid() = user_id);

-- ──────────────────────────────────────────────
-- LEVEL EXAMS
-- ──────────────────────────────────────────────
create table public.level_exams (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.users(id) on delete cascade,
  level      text not null,
  score      int  not null,
  passed     boolean not null,
  taken_at   timestamptz not null default now()
);

alter table public.level_exams enable row level security;
create policy "Users own their exams" on public.level_exams for all using (auth.uid() = user_id);

-- ──────────────────────────────────────────────
-- ACHIEVEMENTS
-- ──────────────────────────────────────────────
create table public.achievements (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references public.users(id) on delete cascade,
  badge_key    text not null,
  earned_at    timestamptz not null default now(),
  unique (user_id, badge_key)
);

alter table public.achievements enable row level security;
create policy "Users own their achievements" on public.achievements for all using (auth.uid() = user_id);

-- ──────────────────────────────────────────────
-- INDEXES
-- ──────────────────────────────────────────────
create index idx_word_progress_user      on public.word_progress(user_id);
create index idx_word_progress_status    on public.word_progress(user_id, status);
create index idx_word_progress_review    on public.word_progress(user_id, next_review_date);
create index idx_words_level             on public.words(level);
create index idx_review_sessions_user    on public.review_sessions(user_id);
