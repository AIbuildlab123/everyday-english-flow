"use client";

import { useEffect, useState } from "react";

export type AndroidAppStatus = "checking" | "android-twa" | "web";

/**
 * Detects whether the user is running the app inside the Android TWA (Trusted Web Activity).
 *
 * Heuristic (matches Bubblewrap-generated TWAs):
 *   - userAgent contains "Android"
 *   - display-mode is "standalone" (TWAs launch the PWA in standalone mode)
 *   - OR document.referrer starts with "android-app://" (Custom Tabs / TWA referrer)
 *
 * Returns "checking" on the server / first paint to avoid hydration mismatches —
 * callers should treat "checking" as "do not show Stripe yet".
 */
export function useIsAndroidApp(): {
  status: AndroidAppStatus;
  isAndroidApp: boolean;
  isReady: boolean;
} {
  const [status, setStatus] = useState<AndroidAppStatus>("checking");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const ua = window.navigator.userAgent || "";
    const isAndroidUa = /Android/i.test(ua);

    const standaloneMatch =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(display-mode: standalone)").matches;

    const referrerIsTwa =
      typeof document !== "undefined" &&
      document.referrer.startsWith("android-app://");

    const isTwa = isAndroidUa && (standaloneMatch || referrerIsTwa);
    setStatus(isTwa ? "android-twa" : "web");
  }, []);

  return {
    status,
    isAndroidApp: status === "android-twa",
    isReady: status !== "checking",
  };
}
