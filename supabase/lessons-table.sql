-- Create the lessons table
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)

CREATE TABLE public.lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  topic text,
  content text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can INSERT their own lessons
CREATE POLICY "Users can insert their own lessons"
  ON public.lessons
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can SELECT only their own lessons
CREATE POLICY "Users can view their own lessons"
  ON public.lessons
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
