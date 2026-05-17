-- Run in Supabase SQL Editor so the app can read/write the logged-in user's row.
-- Table: public.profiles (id, email, credits, last_reset_date, created_at, is_premium)

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own profile" ON public.profiles;
CREATE POLICY "Users read own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users update own profile credits" ON public.profiles;
CREATE POLICY "Users update own profile credits"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
