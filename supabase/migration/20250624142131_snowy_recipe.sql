/*
  # Add Routines Feature

  1. New Tables
    - `routines`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `name` (text)
      - `description` (text, optional)
      - `habit_ids` (uuid array)
      - `reminder_time` (time, optional)
      - `color` (text)
      - `icon` (text)
      - `created_at` (timestamp)
      - `archived_at` (timestamp, optional)
    
    - `routine_logs`
      - `id` (uuid, primary key)
      - `routine_id` (uuid, references routines)
      - `user_id` (uuid, references users)
      - `date` (date)
      - `completed` (boolean)
      - `completed_habits` (uuid array)
      - `notes` (text, optional)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
*/

-- Create routines table
create table if not exists public.routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  name text not null,
  description text,
  habit_ids uuid[] not null default '{}',
  reminder_time time,
  color text not null default '#0D9488',
  icon text default 'Target',
  created_at timestamptz default now(),
  archived_at timestamptz
);

-- Create routine logs table
create table if not exists public.routine_logs (
  id uuid primary key default gen_random_uuid(),
  routine_id uuid not null references public.routines on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  date date not null,
  completed boolean not null default false,
  completed_habits uuid[] not null default '{}',
  notes text,
  created_at timestamptz default now(),
  
  -- Ensure one log per routine per day per user
  unique(routine_id, user_id, date)
);

-- Enable RLS
alter table public.routines enable row level security;
alter table public.routine_logs enable row level security;

-- Policies for routines
create policy "Users can read own routines"
  on routines for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own routines"
  on routines for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own routines"
  on routines for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can delete own routines"
  on routines for delete
  to authenticated
  using (auth.uid() = user_id);

-- Policies for routine logs
create policy "Users can read own routine logs"
  on routine_logs for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own routine logs"
  on routine_logs for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own routine logs"
  on routine_logs for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can delete own routine logs"
  on routine_logs for delete
  to authenticated
  using (auth.uid() = user_id);

-- Create indexes for better performance
create index if not exists idx_routines_user_id on public.routines(user_id);
create index if not exists idx_routine_logs_user_id on public.routine_logs(user_id);
create index if not exists idx_routine_logs_date on public.routine_logs(date);
create index if not exists idx_routine_logs_routine_id_date on public.routine_logs(routine_id, date);