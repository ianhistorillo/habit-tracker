/*
  # Extended User Profiles with Survey Data

  1. New Tables
    - Update `profiles` table with additional fields
    - `user_preferences` table for lifestyle preferences
    - `habit_recommendations` table for AI suggestions

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Add new columns to profiles table
DO $$
BEGIN
  -- Add columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'display_name') THEN
    ALTER TABLE profiles ADD COLUMN display_name text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'age') THEN
    ALTER TABLE profiles ADD COLUMN age integer;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'gender') THEN
    ALTER TABLE profiles ADD COLUMN gender text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'occupation_category') THEN
    ALTER TABLE profiles ADD COLUMN occupation_category text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'height_cm') THEN
    ALTER TABLE profiles ADD COLUMN height_cm integer;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'weight_kg') THEN
    ALTER TABLE profiles ADD COLUMN weight_kg integer;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'lifestyle_focus') THEN
    ALTER TABLE profiles ADD COLUMN lifestyle_focus text[];
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'survey_completed') THEN
    ALTER TABLE profiles ADD COLUMN survey_completed boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'survey_completed_at') THEN
    ALTER TABLE profiles ADD COLUMN survey_completed_at timestamptz;
  END IF;
END $$;

-- Add constraints
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'profiles_gender_check') THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_gender_check 
    CHECK (gender IN ('male', 'female', 'non-binary', 'prefer-not-to-say'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'profiles_occupation_check') THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_occupation_check 
    CHECK (occupation_category IN ('student', 'professional', 'retired', 'unemployed', 'self-employed', 'other'));
  END IF;
END $$;

-- Create habit recommendations table
CREATE TABLE IF NOT EXISTS public.habit_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  category text NOT NULL,
  name text NOT NULL,
  description text,
  icon text,
  color text NOT NULL DEFAULT '#0D9488',
  frequency text NOT NULL DEFAULT 'daily',
  target_days integer[] NOT NULL DEFAULT '{0,1,2,3,4,5,6}',
  target_value integer,
  unit text,
  reasoning text,
  confidence_score decimal(3,2) DEFAULT 0.8,
  tags text[],
  is_applied boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  
  CONSTRAINT frequency_check CHECK (frequency IN ('daily', 'weekly', 'custom'))
);

-- Enable RLS
ALTER TABLE public.habit_recommendations ENABLE ROW LEVEL SECURITY;

-- Policies for habit recommendations
CREATE POLICY "Users can read own habit recommendations"
  ON habit_recommendations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own habit recommendations"
  ON habit_recommendations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own habit recommendations"
  ON habit_recommendations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own habit recommendations"
  ON habit_recommendations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_habit_recommendations_user_id ON public.habit_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_recommendations_category ON public.habit_recommendations(category);
CREATE INDEX IF NOT EXISTS idx_profiles_survey_completed ON public.profiles(survey_completed);