"use client";

import Link from "next/link";
import { useSession } from "@/hooks/useSession";
import { Check } from "lucide-react";

export default function PricingPage() {
  const { user, loading } = useSession();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] p-6">
      <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-8 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
        <h1 className="mb-6 text-2xl font-bold">Premium</h1>
        <p className="mb-6 text-zinc-600 dark:text-zinc-400">
          Get full access with a subscription. Cancel anytime.
        </p>
        <div className="mb-6 space-y-4">
          <div className="flex items-start gap-3">
            <Check className="h-5 w-5 shrink-0 text-green-600" />
            <p className="font-medium">10 lessons per day</p>
          </div>
          <div className="flex items-start gap-3">
            <Check className="h-5 w-5 shrink-0 text-green-600" />
            <p className="font-medium">Unlimited access, no trial expiration</p>
          </div>
          <div className="flex items-start gap-3">
            <Check className="h-5 w-5 shrink-0 text-green-600" />
            <p className="font-medium">All features unlocked</p>
          </div>
        </div>
        <div className="mb-6 rounded-lg bg-indigo-50 p-4 dark:bg-indigo-900/20">
          <p className="text-center text-3xl font-bold text-indigo-600">
            $4.99<span className="text-lg text-zinc-600 dark:text-zinc-400">/month</span>
          </p>
        </div>
        <Link
          href={user ? "/upgrade" : "/"}
          className="block w-full rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-center text-lg font-bold text-white transition-colors hover:from-indigo-700 hover:to-purple-700"
        >
          {user ? "Upgrade to Premium" : "Sign in to upgrade"}
        </Link>
        <Link
          href="/"
          className="mt-4 block text-center text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-400"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
