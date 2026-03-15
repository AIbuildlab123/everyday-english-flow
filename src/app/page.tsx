"use client";

import { useSession } from "@/hooks/useSession";
import { LandingPage } from "@/components/LandingPage";
import { Dashboard } from "@/components/Dashboard";

export default function Home() {
  const { user, loading } = useSession();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" aria-hidden />
        <span className="sr-only">Loading…</span>
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  return <Dashboard user={user} />;
}
