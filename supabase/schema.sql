-- Supabase schema for a workout app with username/password intent.
-- Run in the Supabase SQL editor.

-- Enable Email sign-in only in project settings; disable OAuth providers.

create extension if not exists "uuid-ossp";

-- Profiles table to hold username and basic info
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique not null check (char_length(username) between 3 and 32),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_username_idx on public.profiles (username);

-- Workouts table
create table if not exists public.workouts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  workout_date date not null default current_date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists workouts_user_id_idx on public.workouts (user_id);
create index if not exists workouts_date_idx on public.workouts (workout_date);

-- Exercises for each workout
create table if not exists public.exercises (
  id uuid primary key default uuid_generate_v4(),
  workout_id uuid not null references public.workouts(id) on delete cascade,
  name text not null,
  sets integer,
  reps integer,
  weight numeric,
  notes text
);

create index if not exists exercises_workout_id_idx on public.exercises (workout_id);

-- Plans
create table if not exists public.plans (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  goal text,
  duration_weeks integer check (duration_weeks > 0),
  definition jsonb,
  created_at timestamptz not null default now()
);

create index if not exists plans_user_id_idx on public.plans (user_id);

-- Basic RLS policies (optional; comment out to keep RLS off)
-- alter table public.profiles enable row level security;
-- alter table public.workouts enable row level security;
-- alter table public.exercises enable row level security;
-- alter table public.plans enable row level security;

-- Example policies:
-- create policy "Profiles are readable by owner" on public.profiles
--   for select using (auth.uid() = id);
-- create policy "Profiles are updatable by owner" on public.profiles
--   for update using (auth.uid() = id);
-- create policy "Users can CRUD their workouts" on public.workouts
--   for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- create policy "Users can CRUD their exercises" on public.exercises
--   for all using (
--     exists(select 1 from public.workouts w where w.id = exercises.workout_id and w.user_id = auth.uid())
--   );
-- create policy "Users can CRUD their plans" on public.plans
--   for all using (user_id is null or auth.uid() = user_id) with check (user_id is null or auth.uid() = user_id);
