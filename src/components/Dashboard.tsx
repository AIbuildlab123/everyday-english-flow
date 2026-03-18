"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import type { Level, Category } from "@/types/lesson";
import { createClient } from "@/lib/supabase/client";
import { getTrialInfo, isTrialExpired as checkTrialExpired } from "@/lib/trial";
import { InstructionsBanner } from "@/components/InstructionsBanner";
import { LevelButtons } from "@/components/LevelButtons";
import { CategoryButtons } from "@/components/CategoryButtons";
import { SituationInput } from "@/components/SituationInput";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Check, X } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

interface DashboardProps {
  user: User;
}


export function Dashboard({ user }: DashboardProps) {
  // --- Profile State ---
  const [isPremium, setIsPremium] = useState(false);
  const [credits, setCredits] = useState(3);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isManagingSubscription, setIsManagingSubscription] = useState(false);

  // --- Lesson State ---
  const [level, setLevel] = useState<Level | null>(null);
  const [situation, setSituation] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [lesson, setLesson] = useState<Record<string, unknown> | null>(null);
  const [lessonError, setLessonError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [isLessonSaved, setIsLessonSaved] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<'saved' | 'updated' | null>(null);

  // --- Notes State ---

  // --- Quiz State ---
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number | null>>({});
  const [quizChecked, setQuizChecked] = useState<Record<number, boolean>>({});

  // --- Idiom Checker State ---
  const [idiomQuestion, setIdiomQuestion] = useState<{
    question: string;
    options: string[];
    correctIndex: number;
    explanation?: string;
  } | null>(null);
  const [idiomAnswer, setIdiomAnswer] = useState<number | null>(null);
  const [idiomChecked, setIdiomChecked] = useState(false);
  const [isLoadingIdiom, setIsLoadingIdiom] = useState(false);
  const [dailyIdiomCount, setDailyIdiomCount] = useState(0);

  // --- Profile Modal State ---
  const [showProfile, setShowProfile] = useState(false);

  // --- Selected Category State ---
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const supabase = createClient();
  const router = useRouter();

  // 1. Fetch profile (credits are reset by pg_cron at midnight UTC)
  useEffect(() => {
    async function fetchProfile() {
      const { data, error } = await supabase
        .from("profiles")
        .select("is_premium, credits, created_at")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        const premium = (data as { is_premium: boolean }).is_premium ?? false;
        setIsPremium(premium);
        setCredits(data.credits ?? 3);
      }
      setIsLoadingProfile(false);
    }
    fetchProfile();
  }, [user.id, supabase]);

  // Fetch daily idiom count
  useEffect(() => {
    async function fetchIdiomCount() {
      // Check if we have a stored count for today
      const today = new Date().toDateString();
      const stored = localStorage.getItem(`idiomCount_${user.id}_${today}`);
      if (stored) {
        setDailyIdiomCount(parseInt(stored, 10));
      }
    }
    fetchIdiomCount();
  }, [user.id]);


  // Check for saved lesson from sessionStorage (when coming from Saved page)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedLessonStr = sessionStorage.getItem("loadSavedLesson");
    if (savedLessonStr) {
      try {
        const savedLesson = JSON.parse(savedLessonStr);
        setLesson(savedLesson);
        setIsLessonSaved(true);
        sessionStorage.removeItem("loadSavedLesson");
      } catch {
        // ignore
      }
    }
  }, []);

  // 2. 5-Day Trial Logic — UTC only (created_at from Supabase is UTC; current time via Date.now()).
  const isTrialExpired = checkTrialExpired(user.created_at ?? "", isPremium);
  const trialInfo = getTrialInfo(user.created_at ?? "", isPremium);
  const daysLeft = trialInfo.daysLeft;
  // Kill switch: if trial expired, treat credits as 0 regardless of DB.
  const effectiveCredits = isTrialExpired ? 0 : credits;

  // 3. Button Logic
  const noLevelSelected = level === null;
  const generateDisabled =
    noLevelSelected ||
    isTrialExpired ||
    isGenerating ||
    (!isPremium && effectiveCredits <= 0);

  const dailyCreditLimit = isPremium ? 10 : 3;

  const generateMessage = isTrialExpired
    ? "Trial expired. Please upgrade to continue."
    : effectiveCredits <= 0
    ? `Daily limit reached. Come back tomorrow! (${dailyCreditLimit} lessons/day)`
    : noLevelSelected
    ? "Please select a level to begin."
    : null;

  async function handleGenerate() {
    setIsGenerating(true);
    setLessonError(null);
    try {
      // Check cache first
      const { data: cached } = await supabase
        .from("lessons")
        .select("content")
        .eq("user_id", user.id)
        .eq("topic", situation || "General everyday situation")
        .single();

      if (cached?.content) {
        const parsed = JSON.parse(cached.content);
        setLesson(parsed);
        setIsGenerating(false);
        return;
      }

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          level: level ?? "beginner",
          situation: situation || "General everyday situation",
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = data?.error === "TRIAL_EXPIRED"
          ? "Trial expired. Please upgrade to continue."
          : (data && (data.error || data.message)) || "Generation failed.";
        setLessonError(msg);
        return;
      }

      const lessonData = data?.lesson ?? data;
      if (lessonData) {
        setLesson(lessonData);
        setIsLessonSaved(false); // Reset saved state for new lesson
        setSaveStatus(null);
      }
      setCredits((prev) => prev - 1);
    } catch (err) {
      setLessonError("Server error. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleSaveLesson() {
    if (!lesson || !user?.id) {
      toast.error("Please generate a lesson first");
      return;
    }

    const savingToast = toast.loading("Saving lesson...");
    
    try {
      // Use current level, or level stored on the lesson (so re-saving works without re-selecting level)
      const selectedLevel = level ?? (lesson.level as string) ?? "beginner";
      const topic = situation || "My lesson";
      const lessonTitle = `${selectedLevel} - ${topic}`;
      
      const lessonObj = typeof lesson === "string" ? (() => { try { return JSON.parse(lesson); } catch { return {}; } })() : (lesson && typeof lesson === "object" ? lesson : {});
      const contentToSave = { ...lessonObj };
      const contentValue = JSON.stringify(contentToSave);
      
      const payload = {
        user_id: user.id,
        title: lessonTitle,
        level: selectedLevel,
        content: contentValue,
      };

      // Check if we already have a record for this user + title (save over itself, no duplicates)
      const { data: existing, error: fetchError } = await supabase
        .from("saved_lessons")
        .select("id")
        .eq("user_id", user.id)
        .eq("title", lessonTitle)
        .maybeSingle();

      if (fetchError) {
        console.error("Save Lesson (fetch existing):", fetchError.message, fetchError.code, fetchError.details);
        toast.error("Failed to save lesson", { id: savingToast });
        return;
      }

      const wasUpdate = !!existing;
      let error: { message?: string; code?: string; details?: unknown } | null = null;

      if (existing?.id) {
        const res = await supabase
          .from("saved_lessons")
          .update({ level: payload.level, content: payload.content })
          .eq("id", existing.id)
          .eq("user_id", user.id)
          .select();
        error = res.error;
      } else {
        const res = await supabase
          .from("saved_lessons")
          .insert(payload)
          .select();
        error = res.error;
      }

      if (error) {
        console.error("Save Lesson Error:", error.message ?? error.code ?? error, error.details);
        toast.error(error?.message ?? "Failed to save lesson", { id: savingToast });
        return;
      }
      toast.success(wasUpdate ? "Lesson updated! ✅" : "Lesson saved! ✅", { id: savingToast });
      setIsLessonSaved(true);
      setSaveFeedback(wasUpdate ? "updated" : "saved");
      setTimeout(() => setSaveFeedback(null), 2000);
    } catch (err) {
      console.error("Save Lesson Error:", err);
      toast.error("Failed to save lesson", { id: savingToast });
    }
  }


  function handleExportPDF() {
    window.print();
  }

  function handleCheckAnswer(questionIdx: number, selectedIdx: number) {
    setQuizAnswers((prev) => ({ ...prev, [questionIdx]: selectedIdx }));
    const lessonQuiz = (lesson?.quiz as Array<{ correctIndex?: number }>) ?? [];
    const isCorrect = lessonQuiz[questionIdx]?.correctIndex === selectedIdx;
    // Instant feedback - mark as checked immediately
    setQuizChecked((prev) => ({ ...prev, [questionIdx]: true }));
  }

  async function handleGenerateIdiom() {
    if (dailyIdiomCount >= 5) {
      return;
    }
    setIsLoadingIdiom(true);
    setIdiomAnswer(null);
    setIdiomChecked(false);
    try {
      // Add random seed/timestamp to prevent caching
      const seed = Math.random().toString(36).substring(7) + Date.now();
      const res = await fetch("/api/generate-idiom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seed }),
      });
      const data = await res.json();
      if (!res.ok) {
        console.error("Idiom generation error:", data.error);
        toast.error("Failed to generate idiom");
        return;
      }
      if (data.idiom) {
        setIdiomQuestion(data.idiom);
        // Increment daily count
        const today = new Date().toDateString();
        const newCount = dailyIdiomCount + 1;
        setDailyIdiomCount(newCount);
        localStorage.setItem(`idiomCount_${user.id}_${today}`, newCount.toString());
      }
    } catch (err) {
      console.error("Idiom generation error:", err);
      toast.error("Failed to generate idiom");
    } finally {
      setIsLoadingIdiom(false);
    }
  }

  function handleIdiomAnswer(selectedIdx: number) {
    setIdiomAnswer(selectedIdx);
    setIdiomChecked(true);
  }

  function handleNextIdiom() {
    setIdiomQuestion(null);
    setIdiomAnswer(null);
    setIdiomChecked(false);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  async function handleManageSubscription() {
    setIsManagingSubscription(true);
    try {
      const res = await fetch("/api/stripe-portal", {
        method: "POST",
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          router.push("/");
          return;
        }
        const data = await res.json().catch(() => ({}));
        const message = data?.error || "Unable to open billing portal";
        toast.error(message);
        return;
      }

      const data = await res.json().catch(() => ({}));
      if (data?.url) {
        window.location.href = data.url as string;
      } else {
        toast.error("Unable to open billing portal");
      }
    } catch (err) {
      console.error("Manage subscription error:", err);
      toast.error("Something went wrong opening billing portal");
    } finally {
      setIsManagingSubscription(false);
    }
  }

  const dialogue = (lesson?.dialogue as Array<{ speaker?: string; text?: string }>) ?? [];
  const vocab = (lesson?.keyVocabulary as Array<{ word?: string; definition?: string }>) ?? [];
  const phrases = (lesson?.keyPhrases as Array<{ phrase?: string; explanation?: string }>) ?? [];
  const suggestedQuestions = (lesson?.suggestedQuestions as string[]) ?? [];
  const conversationQuestions = (lesson?.conversationQuestions as string[]) ?? [];
  const quiz = (lesson?.quiz as Array<{ question?: string; options?: string[]; correctIndex?: number }>) ?? [];

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] text-[var(--foreground)]">
      <Toaster position="top-right" />
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-zinc-200 px-6 py-4 dark:border-zinc-700">
        <h1 className="text-xl font-bold tracking-tight">Everyday English Flow</h1>
        <div className="flex flex-wrap items-center gap-2">
          {!isPremium && (
            <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200">
              {isTrialExpired ? "Trial Expired" : `${daysLeft} days left in trial`}
            </span>
          )}
          <ThemeToggle />
          <Link href="/saved" className="rounded-lg border border-zinc-300 bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-200 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700">
            Saved Lessons
          </Link>
          <button
            type="button"
            onClick={() => setShowProfile(!showProfile)}
            className="rounded-lg border border-zinc-300 bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-200 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
          >
            Profile
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <main className="flex flex-1 flex-col gap-4 overflow-hidden p-6 mx-auto max-w-5xl">
          {!isPremium && (
            <div className="rounded-lg bg-amber-50 p-3 text-center text-[17px] font-medium text-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
              🚀 5-day Free Trial — No Credit Card Required
            </div>
          )}

          <InstructionsBanner />

          <section className="shrink-0 space-y-2">
            <h2 className="text-[20px] font-bold tracking-tight">Choose a Level</h2>
            <LevelButtons value={level} onChange={setLevel} />
          </section>

          <section className="shrink-0 space-y-2">
            <h2 className="text-[20px] font-bold tracking-tight">Choose a Category</h2>
            <CategoryButtons
              onScenarioFill={(scenario, category) => {
                setSituation(scenario);
                setSelectedCategory(category);
              }}
              selectedCategory={selectedCategory}
            />
          </section>

          <section className="shrink-0">
            <SituationInput value={situation} onChange={setSituation} />
          </section>

          <div className="shrink-0">
            <button
              type="button"
              disabled={generateDisabled}
              onClick={handleGenerate}
              className={
                generateDisabled
                  ? "rounded-xl bg-slate-200 px-10 py-5 text-xl md:text-2xl font-bold text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                  : "rounded-xl bg-indigo-600 px-10 py-5 text-xl md:text-2xl font-bold text-white shadow-lg shadow-indigo-500/50 transition-transform hover:scale-105 hover:bg-indigo-700"
              }
            >
              {isGenerating ? "Generating…" : "Generate Lesson"}
            </button>

            {generateMessage && (
              <div className="mt-3 flex flex-col gap-2">
                <p className="text-sm font-semibold text-red-500">{generateMessage}</p>
                {isTrialExpired && (
                  <Link
                    href="/upgrade"
                    className="w-full rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 py-2 text-white font-bold text-center block"
                  >
                    Upgrade to Premium
                  </Link>
                )}
              </div>
            )}

            {!isTrialExpired && (
              <p className="mt-2 text-xs text-slate-500">
                Credits remaining today: <span className="font-bold text-indigo-600">{effectiveCredits} / {dailyCreditLimit}</span>
              </p>
            )}
          </div>

          <section className="flex min-h-[400px] flex-1 flex-col overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50/50 dark:border-zinc-700 dark:bg-zinc-800/30" aria-label="Lesson result">
            <div className="flex shrink-0 items-center justify-between gap-2 border-b border-zinc-200 px-6 py-3 dark:border-zinc-700">
              <h2 className="text-[20px] font-bold tracking-tight">Lesson</h2>
              <div className="flex gap-2">
                {lesson && (
                  <>
                    <button
                      type="button"
                      onClick={handleExportPDF}
                      className="rounded-lg bg-zinc-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700"
                    >
                      Export as PDF
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveLesson}
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                        isLessonSaved && !saveFeedback
                          ? "bg-green-600 text-white"
                          : "bg-indigo-600 text-white hover:bg-indigo-700"
                      }`}
                    >
                      {saveFeedback === "saved"
                        ? "Saved!"
                        : saveFeedback === "updated"
                          ? "Updated!"
                          : isLessonSaved
                            ? "Saved to Library"
                            : "Save Lesson"}
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {isGenerating && (
                <div className="flex items-center justify-center py-10">
                  <div className="animate-pulse text-indigo-600 font-medium">✨ Creating your custom lesson...</div>
                </div>
              )}

              {lessonError && (
                <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-200 dark:border-red-800">
                  {lessonError}
                </div>
              )}

              {lesson && !isGenerating && (
                <div>
                  {/* Dialogue - modern chat app style */}
                  {dialogue.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-[20px] font-bold tracking-tight mb-4">🗣️ Practical Dialogue</h3>
                      <div className="space-y-0">
                        {dialogue.map((line, idx) => {
                          const isSpeakerA = line.speaker?.toLowerCase().includes("b") ? false : (idx % 2 === 0 || line.speaker?.toLowerCase().includes("a"));
                          return (
                            <div
                              key={idx}
                              className={`flex mb-6 ${isSpeakerA ? "justify-start" : "justify-end"}`}
                            >
                              <div className="flex flex-col max-w-[80%]">
                                <span className={`text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ${!isSpeakerA ? "text-right" : ""}`}>
                                  {isSpeakerA ? "Speaker A" : "Speaker B"}
                                </span>
                                <div
                                  className={`p-4 rounded-2xl ring-1 ring-black/5 ${
                                    isSpeakerA
                                      ? "bg-slate-100 dark:bg-slate-700 rounded-tl-none shadow-[0_2px_8px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
                                      : "bg-[#0ea5e9] text-white rounded-tr-none shadow-[0_4px_12px_rgba(14,165,233,0.35),0_2px_4px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_12px_rgba(14,165,233,0.4)]"
                                  }`}
                                >
                                  <p className="text-lg leading-snug">
                                    {line.text}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Vocabulary & Key Phrases Grid */}
                  {(vocab.length > 0 || phrases.length > 0) && (
                    <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-0">
                      {vocab.length > 0 && (
                        <div className="md:pr-6 md:border-r md:border-zinc-200 dark:md:border-zinc-700 pr-0">
                          <h3 className="text-[20px] font-bold tracking-tight text-emerald-700 dark:text-emerald-400 mb-4 flex items-center gap-2">
                            <span className="text-emerald-600 dark:text-emerald-400" aria-hidden>📚</span>
                            Key Vocabulary
                          </h3>
                          <div className="space-y-3">
                            {vocab.map((v, i) => (
                              <div
                                key={i}
                                className="p-4 rounded-lg border border-emerald-200/60 dark:border-emerald-800/50 bg-emerald-50/50 dark:bg-emerald-900/20"
                              >
                                <div className="font-bold text-emerald-900 dark:text-emerald-100">
                                  {v.word}
                                </div>
                                <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
                                  {v.definition}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {phrases.length > 0 && (
                        <div className="md:pl-6 pl-0 mt-6 md:mt-0">
                          <h3 className="text-[20px] font-bold tracking-tight text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-2">
                            <span className="text-blue-600 dark:text-blue-400" aria-hidden>💬</span>
                            Key Phrases
                          </h3>
                          <div className="space-y-3">
                            {phrases.map((p, i) => (
                              <div
                                key={i}
                                className="p-4 rounded-lg border border-blue-200/60 dark:border-blue-800/50 bg-blue-50 dark:bg-blue-900/20"
                              >
                                <div className="font-bold text-blue-900 dark:text-blue-100">
                                  {p.phrase}
                                </div>
                                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                  {p.explanation}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Suggested Questions */}
                  {suggestedQuestions.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-[20px] font-bold tracking-tight mb-4">❓ Suggested Questions to Ask</h3>
                      <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
                        <ul className="space-y-2">
                          {suggestedQuestions.map((q, i) => (
                            <li key={i} className="text-purple-900 dark:text-purple-100">
                              • {q}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Conversation Questions - soft indigo theme */}
                  {conversationQuestions.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-[20px] font-bold tracking-tight mb-4 flex items-center gap-2 text-indigo-800 dark:text-indigo-200">
                        <span className="text-indigo-600 dark:text-indigo-400" aria-hidden>💬</span>
                        Conversation Questions
                      </h3>
                      <div className="bg-indigo-50/50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-200/60 dark:border-indigo-800/50">
                        <ul className="space-y-2">
                          {conversationQuestions.map((q, i) => (
                            <li key={i} className="text-indigo-900 dark:text-indigo-100">
                              • {q}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Cultural Insight */}
                  {"culturalInsight" in lesson && (
                    <div className="mb-8 p-4 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 rounded-r-lg">
                      <h3 className="font-bold text-amber-900 dark:text-amber-100 mb-1">
                        💡 Cultural Insight
                      </h3>
                      <p className="text-[18px] text-amber-800 dark:text-amber-200">
                        {lesson.culturalInsight as string}
                      </p>
                    </div>
                  )}

                  {/* American Culture Quiz */}
                  {quiz.length > 0 && (
                    <div className="mb-8 p-6 bg-white dark:bg-zinc-900 rounded-xl border-2 border-indigo-200 dark:border-indigo-800">
                      <h3 className="text-[20px] font-bold tracking-tight mb-6 flex items-center gap-2">
                        <span className="inline-flex shrink-0" aria-hidden title="American flag">
                          <svg width="26" height="18" viewBox="0 0 26 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="rounded-sm shadow-sm">
                            <rect width="26" height="18" fill="#B22234"/>
                            <rect y="2" width="26" height="2" fill="#fff"/>
                            <rect y="6" width="26" height="2" fill="#fff"/>
                            <rect y="10" width="26" height="2" fill="#fff"/>
                            <rect y="14" width="26" height="2" fill="#fff"/>
                            <rect width="10" height="10" fill="#3C3B6E"/>
                            <circle cx="2" cy="2" r="0.6" fill="#fff"/>
                            <circle cx="5" cy="2" r="0.6" fill="#fff"/>
                            <circle cx="8" cy="2" r="0.6" fill="#fff"/>
                            <circle cx="2" cy="5" r="0.6" fill="#fff"/>
                            <circle cx="5" cy="5" r="0.6" fill="#fff"/>
                            <circle cx="8" cy="5" r="0.6" fill="#fff"/>
                            <circle cx="2" cy="8" r="0.6" fill="#fff"/>
                            <circle cx="5" cy="8" r="0.6" fill="#fff"/>
                            <circle cx="8" cy="8" r="0.6" fill="#fff"/>
                          </svg>
                        </span>
                        American Culture Quiz
                      </h3>
                      <div className="space-y-6">
                        {quiz.map((q, i) => {
                          const selected = quizAnswers[i] ?? null;
                          const checked = quizChecked[i] ?? false;
                          const correctIdx = q.correctIndex ?? -1;
                          const isCorrect = selected !== null && correctIdx === selected;
                          return (
                            <div key={i} className="border-b border-zinc-200 dark:border-zinc-700 pb-4 last:border-0">
                              <p className="font-medium mb-3 text-[17px]">
                                {i + 1}. {q.question}
                              </p>
                              <div className="grid grid-cols-1 gap-2">
                                {q.options?.map((opt, oidx) => {
                                  const isSelected = selected === oidx;
                                  // Show correct answer in green if question is checked
                                  const showCorrect = checked && oidx === correctIdx;
                                  // Show selected wrong answer in red if checked
                                  const showIncorrect = checked && isSelected && !isCorrect;
                                  return (
                                    <button
                                      key={oidx}
                                      type="button"
                                      onClick={() => !checked && handleCheckAnswer(i, oidx)}
                                      disabled={checked}
                                      className={`text-left p-4 text-lg rounded-lg border-2 transition-colors ${
                                        showCorrect
                                          ? "bg-green-100 border-green-400 dark:bg-green-900/30"
                                          : showIncorrect
                                          ? "bg-red-100 border-red-400 dark:bg-red-900/30"
                                          : isSelected && !checked
                                          ? "bg-indigo-100 border-indigo-400 dark:bg-indigo-900/30"
                                          : "border-zinc-200 dark:border-zinc-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                                      }`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <span>{opt}</span>
                                        {showCorrect && <Check className="h-5 w-5 text-green-600" />}
                                        {showIncorrect && <X className="h-5 w-5 text-red-600" />}
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Idiom Checker */}
                  <div className="mb-8 p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border-2 border-purple-300 dark:border-purple-700 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-[20px] font-bold tracking-tight text-purple-900 dark:text-purple-100">
                        🎯 Test Your Knowledge of Common American Idioms
                      </h3>
                      {dailyIdiomCount > 0 && (
                        <span className="text-xs text-purple-700 dark:text-purple-300">
                          {dailyIdiomCount} / 5 today
                        </span>
                      )}
                    </div>
                    {dailyIdiomCount >= 5 ? (
                      <p className="text-purple-800 dark:text-purple-200 font-medium">
                        Daily Idiom limit reached! Come back tomorrow for more.
                      </p>
                    ) : !idiomQuestion ? (
                      <button
                        type="button"
                        onClick={handleGenerateIdiom}
                        disabled={isLoadingIdiom}
                        className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3 text-white font-bold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
                      >
                        {isLoadingIdiom ? "Generating Idiom..." : "Start Idiom Challenge"}
                      </button>
                    ) : (
                      <div className="space-y-4">
                        <p className="font-medium text-purple-900 dark:text-purple-100 text-[17px]">
                          {idiomQuestion.question}
                        </p>
                        <div className="space-y-2">
                          {idiomQuestion.options.map((opt, idx) => {
                            const isSelected = idiomAnswer === idx;
                            const isCorrect = idx === idiomQuestion.correctIndex;
                            const showCorrect = idiomChecked && isCorrect;
                            const showIncorrect = idiomChecked && isSelected && !isCorrect;
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => !idiomChecked && handleIdiomAnswer(idx)}
                                disabled={idiomChecked}
                                className={`w-full text-left p-4 text-lg rounded-lg border-2 transition-colors ${
                                  showCorrect
                                    ? "bg-green-100 border-green-400 dark:bg-green-900/30"
                                    : showIncorrect
                                    ? "bg-red-100 border-red-400 dark:bg-red-900/30"
                                    : idiomChecked && isCorrect
                                    ? "bg-green-100 border-green-400 dark:bg-green-900/30"
                                    : isSelected && !idiomChecked
                                    ? "bg-purple-100 border-purple-400 dark:bg-purple-900/30"
                                    : "border-purple-200 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span>{opt}</span>
                                  {showCorrect && <Check className="h-5 w-5 text-green-600" />}
                                  {showIncorrect && <X className="h-5 w-5 text-red-600" />}
                                  {idiomChecked && isCorrect && !showCorrect && (
                                    <Check className="h-5 w-5 text-green-600" />
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                        {idiomQuestion.explanation && idiomChecked && (
                          <div className="mt-4 p-4 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <p className="text-base md:text-lg text-purple-900 dark:text-purple-100 leading-relaxed">
                              <strong>Explanation:</strong> {idiomQuestion.explanation}
                            </p>
                          </div>
                        )}
                        {idiomChecked && (
                          <button
                            type="button"
                            onClick={handleNextIdiom}
                            className="w-full mt-4 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-white font-bold hover:from-purple-700 hover:to-pink-700"
                          >
                            Next Idiom
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                </div>
              )}

              {!lesson && !isGenerating && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="text-4xl mb-4">🎓</div>
                  <p className="text-zinc-500 dark:text-zinc-400 max-w-xs text-[17px]">
                    Pick a situation above and click &quot;Generate&quot; to create your 5-day trial lesson.
                  </p>
                </div>
              )}
            </div>
          </section>
        </main>


        {/* Profile Modal */}
        {showProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[20px] font-bold">Profile</h2>
                <button
                  type="button"
                  onClick={() => setShowProfile(false)}
                  className="text-zinc-500 hover:text-zinc-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Email
                  </label>
                  <p className="text-zinc-900 dark:text-zinc-100 mt-1">{user.email}</p>
                </div>
                {!isPremium && (
                  <Link
                    href="/upgrade"
                    className="w-full rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-white font-bold text-[19px] hover:from-indigo-700 hover:to-purple-700 transition-colors text-center block"
                  >
                    Upgrade to Premium
                  </Link>
                )}
                {isPremium && (
                  <div className="space-y-3">
                    <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-3 text-center">
                      <p className="text-green-800 dark:text-green-200 font-medium">
                        ✓ Premium Member
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleManageSubscription}
                      disabled={isManagingSubscription}
                      className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
                    >
                      {isManagingSubscription ? "Opening…" : "Manage Subscription"}
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full rounded-lg border border-zinc-300 bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-200 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
