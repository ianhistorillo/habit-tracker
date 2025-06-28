/*
  # Add Password Reset Functionality

  1. Security
    - Supabase handles password reset automatically through auth.users
    - No additional tables needed for basic reset functionality
    - Email templates can be configured in Supabase dashboard

  2. Notes
    - This migration ensures the auth system is properly configured
    - Password reset emails will be sent through Supabase Auth
    - Reset tokens are handled securely by Supabase
*/

-- Ensure auth schema is properly set up (this is handled by Supabase by default)
-- The auth.users table already supports password reset functionality
-- Email templates and SMTP settings should be configured in Supabase dashboard

-- Add any custom password reset tracking if needed (optional)
CREATE TABLE IF NOT EXISTS public.password_reset_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  requested_at timestamptz DEFAULT now(),
  ip_address inet,
  user_agent text
);

-- Enable RLS
ALTER TABLE public.password_reset_logs ENABLE ROW LEVEL SECURITY;

-- Policy for password reset logs (admin only)
CREATE POLICY "Only service role can access reset logs"
  ON password_reset_logs
  FOR ALL
  TO service_role
  USING (true);