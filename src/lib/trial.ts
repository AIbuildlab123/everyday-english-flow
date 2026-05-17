/** Trial duration in days */
export const TRIAL_DAYS = 5;

/** Daily lesson credits for trial users */
export const TRIAL_DAILY_CREDITS = 3;

/** Row shape from users and/or profiles tables. */
export type PremiumFlagRow = {
  is_premium?: unknown;
  isPremium?: unknown;
};

/** Normalize Supabase boolean (true, "true", 1, etc.). */
export function resolveIsPremium(row: PremiumFlagRow | null | undefined): boolean {
  if (!row) return false;
  const value = row.isPremium ?? row.is_premium;
  if (value === true || value === 1) return true;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "1" || normalized === "yes";
  }
  return false;
}

export interface TrialInfo {
  /** Whether the trial has expired (more than TRIAL_DAYS since created_at) */
  isExpired: boolean;
  /** Days remaining in trial (0 if expired or premium) */
  daysLeft: number;
  /** Whether user has premium (unlimited access) */
  isPremium: boolean;
  /** Whether Generate should be disabled due to trial end (expired && !premium) */
  shouldBlockGenerate: boolean;
}

/**
 * Days elapsed since created_at. Uses UTC only: Date.now() and ISO string from Supabase.
 * Do not use local time (e.g. toLocaleDateString) for trial logic.
 */
export function getTrialDaysElapsed(createdAtIso: string): number {
  const createdMs = new Date(createdAtIso).getTime();
  return (Date.now() - createdMs) / (1000 * 60 * 60 * 24);
}

/**
 * Trial is over only for non-premium accounts:
 * isExpired = !isPremium && daysSinceCreation > TRIAL_DAYS
 */
export function isTrialExpired(createdAtIso: string, isPremium: boolean): boolean {
  if (isPremium) return false;
  return getTrialDaysElapsed(createdAtIso) > TRIAL_DAYS;
}

/** Same rule as isTrialExpired — explicit for UI and API guards. */
export function isTrialExpiredForUser(
  createdAtIso: string,
  isPremium: boolean
): boolean {
  return !isPremium && getTrialDaysElapsed(createdAtIso) > TRIAL_DAYS;
}

/**
 * Get trial status from user's created_at and optional premium flag.
 * UTC-only: uses Date.now() and created_at ISO; no local time APIs.
 */
export function getTrialInfo(
  createdAtIso: string,
  isPremium: boolean = false
): TrialInfo {
  if (isPremium) {
    return {
      isExpired: false,
      daysLeft: TRIAL_DAYS,
      isPremium: true,
      shouldBlockGenerate: false,
    };
  }

  const diffDays = getTrialDaysElapsed(createdAtIso);
  const expired = diffDays > TRIAL_DAYS;
  const daysLeft = Math.max(0, Math.ceil(TRIAL_DAYS - diffDays));

  return {
    isExpired: expired,
    daysLeft,
    isPremium: false,
    shouldBlockGenerate: expired,
  };
}
