"use client";

import { getRandomScenarioFromAny } from "@/lib/scenarios";

interface SituationInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SituationInput({ value, onChange, placeholder }: SituationInputProps) {
  function handleNeedIdea() {
    const scenario = getRandomScenarioFromAny();
    onChange(scenario);
  }

  return (
    <div className="space-y-2">
      <label htmlFor="situation" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Situation
      </label>
      <div className="flex gap-2">
        <textarea
          id="situation"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? "Describe a situation (e.g. asking for a day off, ordering at a restaurant)…"}
          rows={3}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-[16px] text-zinc-900 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-400 dark:focus:border-zinc-400 dark:focus:ring-zinc-400"
        />
        <button
          type="button"
          onClick={handleNeedIdea}
          className="shrink-0 self-end rounded-lg border border-zinc-300 bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-200 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
        >
          Need an Idea?
        </button>
      </div>
    </div>
  );
}
