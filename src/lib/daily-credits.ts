import type { SupabaseClient } from "@supabase/supabase-js";
import { TRIAL_DAILY_CREDITS } from "@/lib/trial";

/** Premium users get 10 lesson generations per reset window. */
export const PREMIUM_DAILY_CREDITS = 10;

export const MS_24_HOURS = 24 * 60 * 60 * 1000;

export type ProfileCreditRow = {
  is_premium: boolean;
  created_at: string;
  credits?: number | null;
  daily_generations?: number | null;
  dailyGenerations?: number | null;
  last_reset?: string | null;
  lastReset?: string | null;
  last_reset_date?: string | null;
};

export function getDailyCreditLimit(isPremium: boolean): number {
  return isPremium ? PREMIUM_DAILY_CREDITS : TRIAL_DAILY_CREDITS;
}

/** True when at least 24 hours have passed since lastReset (or it was never set). */
export function shouldResetDailyCredits(lastResetIso: string | null | undefined): boolean {
  if (!lastResetIso) return true;
  const lastMs = new Date(lastResetIso).getTime();
  if (Number.isNaN(lastMs)) return true;
  return Date.now() - lastMs >= MS_24_HOURS;
}

export function getLastResetIso(row: ProfileCreditRow): string | null {
  const raw = row.lastReset ?? row.last_reset ?? row.last_reset_date;
  if (raw == null || raw === "") return null;
  const s = String(raw);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s.trim())) {
    return `${s.trim()}T00:00:00.000Z`;
  }
  return s;
}

export function getRemainingCredits(row: ProfileCreditRow): number {
  const raw = row.dailyGenerations ?? row.daily_generations ?? row.credits;
  if (typeof raw === "number" && !Number.isNaN(raw)) return raw;
  return getDailyCreditLimit(row.is_premium);
}

type CreditPatch = Record<string, string | number>;

function resetPatch(limit: number, nowIso: string): CreditPatch[] {
  return [
    { dailyGenerations: limit, lastReset: nowIso },
    { daily_generations: limit, last_reset: nowIso },
    { credits: limit, last_reset: nowIso },
    { credits: limit, last_reset_date: nowIso.slice(0, 10) },
  ];
}

function deductPatch(newBalance: number): CreditPatch[] {
  return [
    { dailyGenerations: newBalance },
    { daily_generations: newBalance },
    { credits: newBalance },
  ];
}

async function applyProfilePatch(
  supabase: SupabaseClient,
  userId: string,
  patch: CreditPatch,
  select: string
): Promise<{ data: ProfileCreditRow | null; error: { message: string } | null }> {
  const { data, error } = await supabase
    .from("profiles")
    .update(patch)
    .eq("id", userId)
    .select(select)
    .single();

  return {
    data: (data as ProfileCreditRow | null) ?? null,
    error: error ? { message: error.message } : null,
  };
}

async function applyFirstWorkingPatch(
  supabase: SupabaseClient,
  userId: string,
  patches: CreditPatch[],
  select: string
): Promise<{ data: ProfileCreditRow | null; error: string | null }> {
  let lastError: string | null = null;
  for (const patch of patches) {
    const { data, error } = await applyProfilePatch(supabase, userId, patch, select);
    if (!error) return { data, error: null };
    lastError = error.message;
  }
  return { data: null, error: lastError };
}

const PROFILE_CREDIT_SELECT =
  "created_at, is_premium, credits, dailyGenerations, daily_generations, lastReset, last_reset, last_reset_date";

/**
 * If 24+ hours since lastReset, reset dailyGenerations to the plan limit and set lastReset to now (UTC ISO).
 * Returns the balance to use for the current request (after reset, if applicable).
 */
export async function ensureDailyCreditsReset(
  supabase: SupabaseClient,
  userId: string,
  profile: ProfileCreditRow
): Promise<{ credits: number; error: string | null }> {
  const limit = getDailyCreditLimit(profile.is_premium);
  const lastReset = getLastResetIso(profile);

  if (!shouldResetDailyCredits(lastReset)) {
    return { credits: getRemainingCredits(profile), error: null };
  }

  const nowIso = new Date().toISOString();
  const { data, error } = await applyFirstWorkingPatch(
    supabase,
    userId,
    resetPatch(limit, nowIso),
    PROFILE_CREDIT_SELECT
  );

  if (error) {
    console.error("[daily-credits] reset failed:", error);
    return { credits: getRemainingCredits(profile), error };
  }

  return {
    credits: data ? getRemainingCredits(data) : limit,
    error: null,
  };
}

/** Persist one fewer credit after a successful generation. */
export async function deductDailyCredit(
  supabase: SupabaseClient,
  userId: string,
  currentBalance: number
): Promise<{ newBalance: number; error: string | null }> {
  const newBalance = Math.max(0, currentBalance - 1);
  const { error } = await applyFirstWorkingPatch(
    supabase,
    userId,
    deductPatch(newBalance),
    PROFILE_CREDIT_SELECT
  );

  if (error) {
    console.error("[daily-credits] deduct failed:", error);
    return { newBalance: currentBalance, error };
  }

  return { newBalance, error: null };
}

export { PROFILE_CREDIT_SELECT, TRIAL_DAILY_CREDITS };
