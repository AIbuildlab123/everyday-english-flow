-- Run in Supabase SQL Editor if lastReset / dailyGenerations updates are blocked by RLS.
-- Your app reads/writes public.users (id matches auth.users.id).

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS "dailyGenerations" integer NOT NULL DEFAULT 3;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS "lastReset" timestamptz;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to update their own daily credit fields
DROP POLICY IF EXISTS "Users can update own daily credits" ON public.users;
CREATE POLICY "Users can update own daily credits"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can read own row" ON public.users;
CREATE POLICY "Users can read own row"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);
