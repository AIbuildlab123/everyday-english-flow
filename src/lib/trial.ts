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
 * Get trial status from user's created_at and optional premium flag.
 * Uses created_at from Supabase auth user (ISO string).
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

  const created = new Date(createdAtIso);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const isExpired = diffDays >= TRIAL_DAYS;
  const daysLeft = Math.max(0, TRIAL_DAYS - diffDays);

  return {
    isExpired,
    daysLeft,
    isPremium: false,
    shouldBlockGenerate: isExpired,
  };
}
