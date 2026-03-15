-- Add credits column to profiles for daily lesson limit (3 free / 5 premium)
-- Run in Supabase SQL Editor if your profiles table doesn't have credits yet.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS credits integer NOT NULL DEFAULT 3;

-- Allow users to update their own profile (for credits decrement from app)
-- Skip if you already have a policy that allows UPDATE on own row.
-- CREATE POLICY "Users can update own profile"
--   ON public.profiles FOR UPDATE
--   TO authenticated
--   USING (auth.uid() = id)
--   WITH CHECK (auth.uid() = id);
