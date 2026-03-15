-- Add last_reset_date column to profiles table for credit reset tracking
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)

-- Add last_reset_date column if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_reset_date date;

-- Add a comment to document the column
COMMENT ON COLUMN public.profiles.last_reset_date IS 'Date when credits were last reset (UTC midnight). Used to determine if daily credit reset is needed.';

-- Optional: Set initial value for existing users to today's date
-- UPDATE public.profiles 
-- SET last_reset_date = CURRENT_DATE 
-- WHERE last_reset_date IS NULL;
