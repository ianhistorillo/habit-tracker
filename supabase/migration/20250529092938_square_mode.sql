-- Create habits table
create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  name text not null,
  description text,
  icon text,
  color text not null,
  frequency text not null,
  target_days integer[] not null,
  target_value integer,
  unit text,
  created_at timestamptz default now(),
  archived_at timestamptz,
  
  constraint frequency_check check (frequency in ('daily', 'weekly', 'custom'))
);

-- Create habit logs table
create table if not exists public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  date date not null,
  completed boolean not null default false,
  value integer,
  notes text,
  created_at timestamptz default now()
);

-- Create streaks table
create table if not exists public.streaks (
  habit_id uuid not null references public.habits on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  current integer not null default 0,
  longest integer not null default 0,
  last_completed_date date,
  
  primary key (habit_id, user_id)
);

-- Enable RLS
alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;
alter table public.streaks enable row level security;

-- Policies for habits
create policy "Users can read own habits"
  on habits for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own habits"
  on habits for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own habits"
  on habits for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can delete own habits"
  on habits for delete
  to authenticated
  using (auth.uid() = user_id);

-- Policies for habit logs
create policy "Users can read own habit logs"
  on habit_logs for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own habit logs"
  on habit_logs for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own habit logs"
  on habit_logs for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can delete own habit logs"
  on habit_logs for delete
  to authenticated
  using (auth.uid() = user_id);

-- Policies for streaks
create policy "Users can read own streaks"
  on streaks for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own streaks"
  on streaks for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own streaks"
  on streaks for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can delete own streaks"
  on streaks for delete
  to authenticated
  using (auth.uid() = user_id);