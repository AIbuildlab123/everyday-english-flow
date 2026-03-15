"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useSession } from "@/hooks/useSession";
import { Check } from "lucide-react";

export default function UpgradePage() {
  const { user, loading } = useSession();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  async function handleUpgrade() {
    if (!user) return;

    setIsProcessing(true);
    try {
      const res = await fetch("/api/stripe-checkout", { method: "POST" });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error("Stripe checkout error:", data.error);
        setIsProcessing(false);
        alert(data.error ?? "Could not start checkout. Please try again.");
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
        return;
      }

      setIsProcessing(false);
      alert("Could not start checkout. Please try again.");
    } catch (err) {
      console.error("Upgrade error:", err);
      setIsProcessing(false);
      alert("Something went wrong. Please try again.");
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] p-6">
      <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-8 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
        <h1 className="mb-6 text-2xl font-bold">Upgrade to Premium</h1>

        {showSuccess ? (
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
                <Check className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h2 className="mb-2 text-xl font-bold text-green-600">Payment Successful!</h2>
            <p className="mb-4 text-zinc-600 dark:text-zinc-400">
              Your account has been upgraded to Premium.
            </p>
            <p className="text-sm text-zinc-500">Redirecting to dashboard...</p>
          </div>
        ) : (
          <>
            <div className="mb-6 space-y-4">
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 shrink-0 text-green-600" />
                <div>
                  <p className="font-medium">10 lessons per day</p>
                  <p className="text-sm text-zinc-500">Instead of 3 for free users</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 shrink-0 text-green-600" />
                <div>
                  <p className="font-medium">Unlimited access</p>
                  <p className="text-sm text-zinc-500">No trial expiration</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 shrink-0 text-green-600" />
                <div>
                  <p className="font-medium">All features unlocked</p>
                  <p className="text-sm text-zinc-500">Full platform access</p>
                </div>
              </div>
            </div>

            <div className="mb-6 rounded-lg bg-indigo-50 p-4 dark:bg-indigo-900/20">
              <p className="text-center text-3xl font-bold text-indigo-600">
                $4.99<span className="text-lg text-zinc-600 dark:text-zinc-400">/month</span>
              </p>
            </div>

            <button
              type="button"
              onClick={handleUpgrade}
              disabled={isProcessing}
              className="w-full rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-lg font-bold text-white transition-colors hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Processing Secure Payment...
                </span>
              ) : (
                "Start Premium"
              )}
            </button>

            <p className="mt-4 text-center text-xs text-zinc-500">
              Cancel anytime. No credit card required for trial.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
