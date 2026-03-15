"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useSession } from "@/hooks/useSession";
import { Trash2 } from "lucide-react";

interface SavedLesson {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

export default function SavedPage() {
  const { user, loading } = useSession();
  const [lessons, setLessons] = useState<SavedLesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;
    async function fetchLessons() {
      const { data, error } = await supabase
        .from("saved_lessons")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (!error && data) {
        setLessons(data as SavedLesson[]);
      }
      setIsLoading(false);
    }
    fetchLessons();
  }, [user, supabase]);

  async function handleDelete(id: string) {
    const { error } = await supabase.from("saved_lessons").delete().eq("id", id);
    if (!error) {
      setLessons((prev) => prev.filter((l) => l.id !== id));
    }
  }

  if (loading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p className="mb-4 text-zinc-600">Please sign in to view saved lessons.</p>
        <Link href="/" className="rounded-lg bg-indigo-600 px-4 py-2 text-white">
          Go to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] text-[var(--foreground)]">
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-zinc-200 px-6 py-4 dark:border-zinc-700">
        <h1 className="text-xl font-bold">Everyday English Flow</h1>
        <Link
          href="/"
          className="rounded-lg border border-zinc-300 bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-200 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
        >
          Home
        </Link>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-6 md:mx-auto md:max-w-7xl">
        <h2 className="text-[20px] font-bold">Saved Lessons</h2>
        {lessons.length === 0 ? (
          <p className="text-zinc-500 dark:text-zinc-400">
            No saved lessons yet. Generate and save lessons to see them here.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {lessons.map((lesson) => {
              let lessonData: Record<string, unknown> | null = null;
              try {
                lessonData = JSON.parse(lesson.content);
              } catch {
                // ignore
              }
              return (
                <div
                  key={lesson.id}
                  className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{lesson.title}</h3>
                    <button
                      type="button"
                      onClick={() => handleDelete(lesson.id)}
                      className="text-red-500 hover:text-red-700"
                      aria-label="Delete lesson"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
                    {new Date(lesson.created_at).toLocaleDateString()}
                  </p>
                  {lessonData && (
                    <div className="space-y-2 text-sm">
                      {"dialogue" in lessonData && Array.isArray(lessonData.dialogue) && (
                        <p className="text-zinc-600 dark:text-zinc-400">
                          {lessonData.dialogue.length} dialogue lines
                        </p>
                      )}
                      {"keyVocabulary" in lessonData && Array.isArray(lessonData.keyVocabulary) && (
                        <p className="text-zinc-600 dark:text-zinc-400">
                          {lessonData.keyVocabulary.length} vocabulary words
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          // Store lesson data in sessionStorage and redirect to home
                          // Handle both string and object content
                          const contentToStore = typeof lesson.content === "string" 
                            ? JSON.parse(lesson.content) 
                            : lesson.content;
                          sessionStorage.setItem("loadSavedLesson", JSON.stringify(contentToStore));
                          window.location.href = "/";
                        }}
                        className="mt-2 w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                      >
                        Open Lesson
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
