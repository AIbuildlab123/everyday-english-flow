"use client";

import { Globe } from "lucide-react";

interface AndroidUpgradeNoticeProps {
  className?: string;
  /** Optional override of the body copy. */
  message?: string;
}

/**
 * Reader-app workaround: shown inside the Android TWA in place of the Stripe button,
 * so we comply with Google Play Billing rules.
 */
export function AndroidUpgradeNotice({
  className,
  message,
}: AndroidUpgradeNoticeProps) {
  return (
    <div
      role="note"
      aria-label="Upgrade on the web"
      className={
        "rounded-xl border border-indigo-200 bg-indigo-50 p-5 text-center dark:border-indigo-800/60 dark:bg-indigo-900/20 " +
        (className ?? "")
      }
    >
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-indigo-600 shadow-sm dark:bg-indigo-950 dark:text-indigo-300">
        <Globe className="h-5 w-5" aria-hidden />
      </div>
      <p className="text-base font-semibold text-indigo-900 dark:text-indigo-100">
        Upgrade on the web
      </p>
      <p className="mt-2 text-sm leading-relaxed text-indigo-900/80 dark:text-indigo-100/80">
        {message ??
          "To upgrade to Premium, please visit everydayenglishflow.com on your computer or mobile web browser."}
      </p>
    </div>
  );
}
