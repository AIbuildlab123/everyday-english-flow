import type { SupabaseClient } from "@supabase/supabase-js";
import { resolveIsPremium, TRIAL_DAILY_CREDITS, type PremiumFlagRow } from "@/lib/trial";

/** Matches your Supabase schema (see Table Editor → public.profiles). */
export const PROFILES_TABLE = "profiles";

export const PREMIUM_DAILY_CREDITS = 10;
export const MS_24_HOURS = 24 * 60 * 60 * 1000;

export type ProfileCreditRow = {
  id?: string;
  created_at: string;
  is_premium?: boolean | null;
  credits?: number | null;
  last_reset_date?: string | null;
};

export const PROFILE_CREDIT_SELECT =
  "id, created_at, is_premium, credits, last_reset_date";

export function getDailyCreditLimit(isPremium: boolean): number {
  return isPremium ? PREMIUM_DAILY_CREDITS : TRIAL_DAILY_CREDITS;
}

export function isPremiumProfile(row: ProfileCreditRow | PremiumFlagRow): boolean {
  return resolveIsPremium(row);
}

/**
 * True when 24+ hours since last_reset_date (UTC midnight of that date), or date unset.
 * Your column is `date`; we treat it as start-of-day UTC for the 24h window.
 */
export function shouldResetDailyCredits(
  lastResetDate: string | null | undefined
): boolean {
  if (!lastResetDate) return true;
  const day = String(lastResetDate).trim().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return true;
  const lastMs = new Date(`${day}T00:00:00.000Z`).getTime();
  if (Number.isNaN(lastMs)) return true;
  return Date.now() - lastMs >= MS_24_HOURS;
}

export function getRemainingCredits(row: ProfileCreditRow, isPremium: boolean): number {
  if (typeof row.credits === "number" && !Number.isNaN(row.credits)) {
    return row.credits;
  }
  return getDailyCreditLimit(isPremium);
}

function utcDateOnly(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Reset credits to plan limit and set last_reset_date to today (UTC).
 * Runs on public.profiles — must use service-role client if RLS blocks updates.
 */
export async function resetProfileDailyCredits(
  supabase: SupabaseClient,
  userId: string,
  dailyLimit: number
): Promise<{ credits: number; last_reset_date: string; error: string | null }> {
  const last_reset_date = utcDateOnly();

  const { data, error } = await supabase
    .from(PROFILES_TABLE)
    .update({
      credits: dailyLimit,
      last_reset_date,
    })
    .eq("id", userId)
    .select("credits, last_reset_date")
    .single();

  if (error) {
    console.error(
      "[daily-credits] reset failed:",
      error.message,
      error.details,
      error.hint
    );
    return { credits: dailyLimit, last_reset_date, error: error.message };
  }

  return {
    credits: data?.credits ?? dailyLimit,
    last_reset_date: data?.last_reset_date ?? last_reset_date,
    error: null,
  };
}

/** Deduct one credit after a successful lesson generation. */
export async function deductProfileCredit(
  supabase: SupabaseClient,
  userId: string,
  currentBalance: number
): Promise<{ credits: number; error: string | null }> {
  const next = Math.max(0, currentBalance - 1);

  const { data, error } = await supabase
    .from(PROFILES_TABLE)
    .update({ credits: next })
    .eq("id", userId)
    .select("credits")
    .single();

  if (error) {
    console.error(
      "[daily-credits] deduct failed:",
      error.message,
      error.details,
      error.hint
    );
    return { credits: currentBalance, error: error.message };
  }

  return {
    credits: data?.credits ?? next,
    error: null,
  };
}

export { TRIAL_DAILY_CREDITS };
