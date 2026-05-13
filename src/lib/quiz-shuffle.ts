import type { Lesson } from "@/types/lesson";

/**
 * Fisher–Yates shuffle of MCQ options while remapping the correct index.
 */
export function shuffleMcqOptions(
  options: string[],
  correctIndex: number
): { options: string[]; correctIndex: number } {
  const list = options.map((text, idx) => ({
    text,
    isCorrect: idx === correctIndex,
  }));
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = list[i]!;
    list[i] = list[j]!;
    list[j] = t;
  }
  const newOptions = list.map((x) => x.text);
  const newCorrect = list.findIndex((x) => x.isCorrect);
  return {
    options: newOptions,
    correctIndex: newCorrect >= 0 ? newCorrect : 0,
  };
}

/** Shuffle every quiz question in a lesson (for fresh randomization on the client). */
export function shuffleLessonQuiz(lesson: Lesson): Lesson {
  if (!Array.isArray(lesson.quiz)) return lesson;
  return {
    ...lesson,
    quiz: lesson.quiz.map((q) => {
      const opts = Array.isArray(q.options) ? [...q.options.map(String)] : [];
      const ci =
        typeof q.correctIndex === "number" ? Math.max(0, Math.min(3, q.correctIndex)) : 0;
      if (opts.length === 0) return q;
      const s = shuffleMcqOptions(opts, ci);
      return { ...q, options: s.options, correctIndex: s.correctIndex };
    }),
  };
}

export function shuffleLessonRecord(lesson: Record<string, unknown>): Record<string, unknown> {
  const parsed = lesson as unknown as Lesson;
  return shuffleLessonQuiz(parsed) as unknown as Record<string, unknown>;
}
