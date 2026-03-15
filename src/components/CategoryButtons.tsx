"use client";

import type { Category } from "@/types/lesson";
import { getRandomScenario } from "@/lib/scenarios";
import {
  Briefcase,
  Plane,
  ShoppingCart,
  Users,
  HeartPulse,
  Landmark,
  ClipboardList,
  Trophy,
  type LucideIcon,
} from "lucide-react";

const CATEGORIES: {
  value: Category;
  label: string;
  Icon: LucideIcon;
  /** Glassmorphism: subtle gradient bg, light border, text color */
  gradientClass: string;
  borderClass: string;
  textClass: string;
}[] = [
  { 
    value: "workplace", 
    label: "Workplace", 
    Icon: Briefcase, 
    gradientClass: "bg-gradient-to-br from-blue-50/80 to-blue-100/60 dark:from-blue-950/40 dark:to-blue-900/30",
    borderClass: "border-zinc-100 dark:border-zinc-800",
    textClass: "text-blue-800 dark:text-blue-200"
  },
  { 
    value: "travel", 
    label: "Travel", 
    Icon: Plane, 
    gradientClass: "bg-gradient-to-br from-green-50/80 to-emerald-100/60 dark:from-green-950/40 dark:to-emerald-900/30",
    borderClass: "border-zinc-100 dark:border-zinc-800",
    textClass: "text-green-800 dark:text-green-200"
  },
  { 
    value: "shopping", 
    label: "Shopping", 
    Icon: ShoppingCart, 
    gradientClass: "bg-gradient-to-br from-cyan-50/80 to-sky-100/60 dark:from-cyan-950/40 dark:to-sky-900/30",
    borderClass: "border-zinc-100 dark:border-zinc-800",
    textClass: "text-cyan-800 dark:text-cyan-200"
  },
  { 
    value: "social", 
    label: "Social", 
    Icon: Users, 
    gradientClass: "bg-gradient-to-br from-pink-50/80 to-rose-100/60 dark:from-pink-950/40 dark:to-rose-900/30",
    borderClass: "border-zinc-100 dark:border-zinc-800",
    textClass: "text-pink-800 dark:text-pink-200"
  },
  { 
    value: "healthcare", 
    label: "Healthcare", 
    Icon: HeartPulse, 
    gradientClass: "bg-gradient-to-br from-rose-50/80 to-red-100/60 dark:from-rose-950/40 dark:to-red-900/30",
    borderClass: "border-zinc-100 dark:border-zinc-800",
    textClass: "text-rose-800 dark:text-rose-200"
  },
  { 
    value: "culture", 
    label: "Culture", 
    Icon: Landmark, 
    gradientClass: "bg-gradient-to-br from-amber-50/80 to-yellow-100/60 dark:from-amber-950/40 dark:to-yellow-900/30",
    borderClass: "border-zinc-100 dark:border-zinc-800",
    textClass: "text-amber-800 dark:text-amber-200"
  },
  { 
    value: "job_interview", 
    label: "Job Interview", 
    Icon: ClipboardList, 
    gradientClass: "bg-gradient-to-br from-violet-50/80 to-purple-100/60 dark:from-violet-950/40 dark:to-purple-900/30",
    borderClass: "border-zinc-100 dark:border-zinc-800",
    textClass: "text-violet-800 dark:text-violet-200"
  },
  { 
    value: "sports", 
    label: "Sports", 
    Icon: Trophy, 
    gradientClass: "bg-gradient-to-br from-orange-50/80 to-amber-100/60 dark:from-orange-950/40 dark:to-amber-900/30",
    borderClass: "border-zinc-100 dark:border-zinc-800",
    textClass: "text-orange-800 dark:text-orange-200"
  },
];

interface CategoryButtonsProps {
  onScenarioFill: (scenario: string, category: Category) => void;
  selectedCategory?: Category | null;
}

export function CategoryButtons({ onScenarioFill, selectedCategory }: CategoryButtonsProps) {
  function handleClick(category: Category) {
    const scenario = getRandomScenario(category);
    onScenarioFill(scenario, category);
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" role="group" aria-label="Categories">
      {CATEGORIES.map(({ value, label, Icon, gradientClass, borderClass, textClass }) => {
        const isSelected = selectedCategory === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => handleClick(value)}
            className={`flex min-h-[72px] flex-col items-center justify-center gap-1.5 rounded-xl border px-3 py-3 text-sm font-medium transition-all hover:-translate-y-1 hover:shadow-sm ${gradientClass} ${borderClass} ${textClass} ${
              isSelected
                ? "ring-2 ring-offset-2 ring-indigo-400/50 dark:ring-indigo-600/50 shadow-sm"
                : ""
            }`}
          >
            <Icon className="h-6 w-6 shrink-0" aria-hidden />
            <span className="text-center leading-tight">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
