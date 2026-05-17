-- Daily lesson credits + 24h reset tracking (run in Supabase SQL Editor)
-- Matches app logic in src/lib/daily-credits.ts and /api/generate

-- CamelCase columns (if you created these in the dashboard)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS "dailyGenerations" integer NOT NULL DEFAULT 3;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS "lastReset" timestamptz;

-- Snake_case aliases (optional; use if you prefer standard Postgres naming)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS daily_generations integer;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS last_reset timestamptz;

-- Legacy columns (from earlier migrations)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS credits integer NOT NULL DEFAULT 3;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS last_reset_date date;

-- Backfill from credits where new columns are empty
UPDATE public.profiles
SET "dailyGenerations" = credits
WHERE credits IS NOT NULL
  AND ("dailyGenerations" IS NULL OR "dailyGenerations" = 0);

UPDATE public.profiles
SET daily_generations = credits
WHERE credits IS NOT NULL AND daily_generations IS NULL;

UPDATE public.profiles
SET "lastReset" = COALESCE("lastReset", last_reset, (last_reset_date::timestamptz))
WHERE "lastReset" IS NULL;

COMMENT ON COLUMN public.profiles."dailyGenerations" IS 'Remaining lesson generations in the current 24h window';
COMMENT ON COLUMN public.profiles."lastReset" IS 'UTC timestamp when dailyGenerations was last reset to the plan limit';
