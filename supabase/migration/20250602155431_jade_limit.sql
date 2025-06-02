/*
  # Add habit goals and assessments

  1. New Tables
    - `habit_goals`
      - `id` (uuid, primary key)
      - `habit_id` (uuid, references habits)
      - `user_id` (uuid, references users)
      - `target_days` (integer)
      - `start_date` (date)
      - `end_date` (date)
      - `notes` (text)
      - `created_at` (timestamp)
    
    - `goal_assessments`
      - `id` (uuid, primary key)
      - `goal_id` (uuid, references habit_goals)
      - `date` (date)
      - `status` (text: 'hit' or 'miss')
      - `notes` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
*/

-- Create habit goals table
create table if not exists public.habit_goals (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  target_days integer not null,
  start_date date not null,
  end_date date not null,
  notes text,
  created_at timestamptz default now()
);

-- Create goal assessments table
create table if not exists public.goal_assessments (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.habit_goals on delete cascade,
  date date not null,
  status text not null check (status in ('hit', 'miss')),
  notes text,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.habit_goals enable row level security;
alter table public.goal_assessments enable row level security;

-- Policies for habit goals
create policy "Users can read own habit goals"
  on habit_goals for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own habit goals"
  on habit_goals for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own habit goals"
  on habit_goals for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can delete own habit goals"
  on habit_goals for delete
  to authenticated
  using (auth.uid() = user_id);

-- Policies for goal assessments
create policy "Users can read own goal assessments"
  on goal_assessments for select
  to authenticated
  using (exists (
    select 1 from habit_goals
    where habit_goals.id = goal_assessments.goal_id
    and habit_goals.user_id = auth.uid()
  ));

create policy "Users can insert own goal assessments"
  on goal_assessments for insert
  to authenticated
  with check (exists (
    select 1 from habit_goals
    where habit_goals.id = goal_assessments.goal_id
    and habit_goals.user_id = auth.uid()
  ));

create policy "Users can update own goal assessments"
  on goal_assessments for update
  to authenticated
  using (exists (
    select 1 from habit_goals
    where habit_goals.id = goal_assessments.goal_id
    and habit_goals.user_id = auth.uid()
  ));

create policy "Users can delete own goal assessments"
  on goal_assessments for delete
  to authenticated
  using (exists (
    select 1 from habit_goals
    where habit_goals.id = goal_assessments.goal_id
    and habit_goals.user_id = auth.uid()
  ));