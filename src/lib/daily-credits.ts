import type { SupabaseClient } from "@supabase/supabase-js";
import { resolveIsPremium, TRIAL_DAILY_CREDITS, type PremiumFlagRow } from "@/lib/trial";

/** Table that stores dailyGenerations + lastReset (per your Supabase schema). */
export const USERS_TABLE = "users";

export const PREMIUM_DAILY_CREDITS = 10;
export const MS_24_HOURS = 24 * 60 * 60 * 1000;

export type UserCreditRow = {
  id?: string;
  created_at: string;
  is_premium?: boolean | null;
  isPremium?: boolean | null;
  dailyGenerations: number | null;
  lastReset: string | null;
};

export const USER_CREDIT_SELECT =
  "id, created_at, is_premium, isPremium, dailyGenerations, lastReset";

export function getDailyCreditLimit(isPremium: boolean): number {
  return isPremium ? PREMIUM_DAILY_CREDITS : TRIAL_DAILY_CREDITS;
}

export function isPremiumUser(row: UserCreditRow | PremiumFlagRow): boolean {
  return resolveIsPremium(row);
}

/** True when at least 24 hours have passed since lastReset (or it was never set). */
export function shouldResetDailyCredits(lastResetIso: string | null | undefined): boolean {
  if (!lastResetIso) return true;
  const lastMs = new Date(lastResetIso).getTime();
  if (Number.isNaN(lastMs)) return true;
  return Date.now() - lastMs >= MS_24_HOURS;
}

export function getRemainingCredits(row: UserCreditRow, isPremium: boolean): number {
  if (typeof row.dailyGenerations === "number" && !Number.isNaN(row.dailyGenerations)) {
    return row.dailyGenerations;
  }
  return getDailyCreditLimit(isPremium);
}

/**
 * Explicit reset: dailyGenerations → plan limit, lastReset → now (UTC ISO).
 * Must succeed before deducting a credit for the current generation.
 */
export async function resetUserDailyCredits(
  supabase: SupabaseClient,
  userId: string,
  dailyLimit: number
): Promise<{ dailyGenerations: number; lastReset: string; error: string | null }> {
  const lastReset = new Date().toISOString();

  const { data, error } = await supabase
    .from(USERS_TABLE)
    .update({
      dailyGenerations: dailyLimit,
      lastReset,
    })
    .eq("id", userId)
    .select("dailyGenerations, lastReset")
    .single();

  if (error) {
    console.error("[daily-credits] reset update failed:", error.message, error.details, error.hint);
    return { dailyGenerations: dailyLimit, lastReset, error: error.message };
  }

  return {
    dailyGenerations: data?.dailyGenerations ?? dailyLimit,
    lastReset: data?.lastReset ?? lastReset,
    error: null,
  };
}

/** Deduct exactly one generation after a successful lesson build. */
export async function deductUserDailyCredit(
  supabase: SupabaseClient,
  userId: string,
  currentBalance: number
): Promise<{ dailyGenerations: number; error: string | null }> {
  const next = Math.max(0, currentBalance - 1);

  const { data, error } = await supabase
    .from(USERS_TABLE)
    .update({ dailyGenerations: next })
    .eq("id", userId)
    .select("dailyGenerations")
    .single();

  if (error) {
    console.error("[daily-credits] deduct update failed:", error.message, error.details, error.hint);
    return { dailyGenerations: currentBalance, error: error.message };
  }

  return {
    dailyGenerations: data?.dailyGenerations ?? next,
    error: null,
  };
}

export { TRIAL_DAILY_CREDITS };
