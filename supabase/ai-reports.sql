-- AI report log table for user-submitted lesson quality issues
CREATE TABLE IF NOT EXISTS public.ai_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id uuid NULL,
  content jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_reports ENABLE ROW LEVEL SECURITY;

-- Users can insert reports for themselves
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'ai_reports'
      AND policyname = 'Users can insert own AI reports'
  ) THEN
    CREATE POLICY "Users can insert own AI reports"
      ON public.ai_reports
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END$$;

