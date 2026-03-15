"use client";

import type { Level } from "@/types/lesson";

const LEVELS: { value: Level; label: string; selectedClass: string; unselectedClass: string }[] = [
  { value: "beginner", label: "Beginner", selectedClass: "bg-green-500 text-white shadow-lg shadow-green-500/50 ring-2 ring-green-400 ring-offset-2 ring-offset-[var(--background)] dark:ring-offset-slate-900", unselectedClass: "bg-green-500/45 text-green-950 hover:bg-green-500/55 dark:text-green-100" },
  { value: "intermediate", label: "Intermediate", selectedClass: "bg-amber-400 text-amber-950 shadow-lg shadow-amber-500/50 ring-2 ring-amber-500 ring-offset-2 ring-offset-[var(--background)] dark:ring-offset-slate-900", unselectedClass: "bg-amber-400/45 text-amber-950 hover:bg-amber-400/55 dark:text-amber-100" },
  { value: "advanced", label: "Advanced", selectedClass: "bg-red-500 text-white shadow-lg shadow-red-500/50 ring-2 ring-red-400 ring-offset-2 ring-offset-[var(--background)] dark:ring-offset-slate-900", unselectedClass: "bg-red-500/45 text-red-950 hover:bg-red-500/55 dark:text-red-100" },
];

interface LevelButtonsProps {
  value: Level | null;
  onChange: (level: Level) => void;
}

export function LevelButtons({ value, onChange }: LevelButtonsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3" role="group" aria-label="Choose level">
      {LEVELS.map(({ value: levelValue, label, selectedClass, unselectedClass }) => {
        const isSelected = value === levelValue;
        return (
          <button
            key={levelValue}
            type="button"
            onClick={() => onChange(levelValue)}
            className={`
              flex min-h-[56px] items-center justify-center rounded-xl px-6 py-4 text-lg font-semibold transition-all
              ${isSelected ? selectedClass : unselectedClass}
            `}
            aria-pressed={isSelected}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
