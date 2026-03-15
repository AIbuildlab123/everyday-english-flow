-- Ensure one saved lesson per user per title (enables upsert: save over itself, no duplicates)
-- Run in Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- If you get "duplicate key" errors, remove duplicate rows first, then run this.

-- Add unique constraint so upsert can use onConflict('user_id', 'title')
ALTER TABLE public.saved_lessons
  ADD CONSTRAINT saved_lessons_user_id_title_key UNIQUE (user_id, title);
