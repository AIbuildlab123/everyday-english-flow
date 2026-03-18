/** Trial duration in days */
export const TRIAL_DAYS = 5;

/** Daily lesson credits for trial users */
export const TRIAL_DAILY_CREDITS = 3;

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
 * Trial is over when (Current UTC Time) - (created_at UTC) > 5 days and user is not premium.
 */
export function isTrialExpired(createdAtIso: string, isPremium: boolean): boolean {
  if (isPremium) return false;
  return getTrialDaysElapsed(createdAtIso) > TRIAL_DAYS;
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
