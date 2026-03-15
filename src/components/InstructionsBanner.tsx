"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "everyday-english-flow-instructions-dismissed";

export function InstructionsBanner() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || typeof window === "undefined") return;
    const dismissed = localStorage.getItem(STORAGE_KEY) === "true";
    setIsOpen(!dismissed);
  }, [mounted]);

  function handleDismiss() {
    setIsOpen(false);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, "true");
    }
  }

  if (!mounted) return null;

  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-zinc-800 dark:text-zinc-200"
        aria-expanded={isOpen}
      >
        <span>Instructions</span>
        <span className="text-zinc-500 dark:text-zinc-400" aria-hidden>
          {isOpen ? "▼" : "▶"}
        </span>
      </button>
      {isOpen && (
        <div className="border-t border-zinc-200 px-4 py-3 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          <ol className="list-inside list-decimal space-y-1">
            <li>Choose your level: Beginner (green), Intermediate (yellow), or Advanced (red).</li>
            <li>Pick a category or type a situation. Use &quot;Need an Idea?&quot; for a random prompt.</li>
            <li>Generate a lesson to get a dialogue, vocabulary, phrases, and a culture quiz.</li>
            <li>Save lessons or download as PDF for later.</li>
          </ol>
          <button
            type="button"
            onClick={handleDismiss}
            className="mt-3 text-xs font-medium text-zinc-500 underline hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
          >
            Don&apos;t show again
          </button>
        </div>
      )}
    </div>
  );
}
