import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Lesson } from "@/types/lesson";

const LESSON_JSON_SCHEMA = `
Return ONLY a single valid JSON object (no markdown, no code fence) with this exact shape:
{
  "dialogue": [ { "speaker": "string", "text": "string" } ],
  "keyVocabulary": [ { "word": "string", "definition": "string" } ],
  "keyPhrases": [ { "phrase": "string", "explanation": "string" } ],
  "suggestedQuestions": [ "string" ],
  "conversationQuestions": [ "string" ],
  "culturalInsight": "string",
  "quiz": [ { "question": "string", "options": [ "string" ], "correctIndex": 0 } ]
}

Requirements:
- dialogue: MUST be exactly 15, 16, 17, or 18 lines every time (never fewer than 15, never more than 18). Alternate between two speakers (Speaker A and Speaker B). Each line should be natural conversation relevant to the situation.
- keyVocabulary: Exactly 5 items. keyPhrases: Exactly 5 items.
- suggestedQuestions: Exactly 3-5 PRACTICAL questions the student could actually SAY in this specific situation (e.g. at a restaurant: "Can I see the dessert menu?", "Is this dish spicy?", "Could I get the check please?"). Match the dialogue theme.
- conversationQuestions: Exactly 3 open-ended discussion questions based on the theme (e.g. for Job Interviews: "What was your most challenging interview experience?", "How do you usually prepare for an interview?"). These are for reflection or conversation practice.
- quiz: Exactly 5 multiple-choice questions about American culture/history related to the topic. correctIndex is 0-based (0, 1, 2, or 3).
`;

/** Extract JSON string from AI response (handles code fences and surrounding text) */
function extractJsonString(text: string): string {
  const trimmed = text.trim();
  // Try markdown code block first (json or no language)
  const codeBlock = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlock?.[1]) return codeBlock[1].trim();
  // Otherwise find first { and last } to get a single JSON object
  const first = trimmed.indexOf("{");
  const last = trimmed.lastIndexOf("}");
  if (first !== -1 && last !== -1 && last > first) return trimmed.slice(first, last + 1);
  return trimmed;
}

function parseLessonJson(text: string): Lesson | null {
  const raw = extractJsonString(text);
  // Try parse as-is first
  try {
    const parsed = JSON.parse(raw) as Lesson;
    return normalizeLesson(parsed);
  } catch {
    // Try with trailing-comma repair only (don't collapse newlines; that can break string values)
    const repaired = raw.replace(/,(\s*[}\]])/g, "$1");
    try {
      const parsed = JSON.parse(repaired) as Lesson;
      return normalizeLesson(parsed);
    } catch (e) {
      console.error("[generate] JSON parse error:", e instanceof Error ? e.message : e);
      console.error("[generate] Response snippet (first 500 chars):", raw.slice(0, 500));
      return null;
    }
  }
}

/** Ensure lesson has required shape and dialogue length 15-18 */
function normalizeLesson(parsed: Lesson): Lesson | null {
  if (!parsed || typeof parsed !== "object") return null;
  const dialogue = Array.isArray(parsed.dialogue) ? parsed.dialogue : [];
  const keyVocabulary = Array.isArray(parsed.keyVocabulary) ? parsed.keyVocabulary : [];
  const keyPhrases = Array.isArray(parsed.keyPhrases) ? parsed.keyPhrases : [];
  const suggestedQuestions = Array.isArray(parsed.suggestedQuestions) ? parsed.suggestedQuestions : [];
  const conversationQuestions = Array.isArray(parsed.conversationQuestions) ? parsed.conversationQuestions : [];
  const quiz = Array.isArray(parsed.quiz) ? parsed.quiz : [];
  const culturalInsight = typeof parsed.culturalInsight === "string" ? parsed.culturalInsight : "";

  // If dialogue is too short, pad with placeholder lines; if too long, trim to 15-18
  let normalizedDialogue = dialogue
    .filter((line) => line && (line.speaker != null || line.text != null))
    .map((line) => ({
      speaker: typeof line.speaker === "string" ? line.speaker : "Speaker A",
      text: typeof line.text === "string" ? line.text : String(line.text ?? ""),
    }));

  if (normalizedDialogue.length < 15) {
    const need = 15 - normalizedDialogue.length;
    for (let i = 0; i < need; i++) {
      normalizedDialogue.push({
        speaker: i % 2 === 0 ? "Speaker A" : "Speaker B",
        text: "...",
      });
      if (normalizedDialogue.length >= 15) break;
    }
  } else if (normalizedDialogue.length > 18) {
    normalizedDialogue = normalizedDialogue.slice(0, 18);
  }

  return {
    dialogue: normalizedDialogue,
    keyVocabulary: keyVocabulary.slice(0, 5).map((v) => ({
      word: typeof v?.word === "string" ? v.word : "",
      definition: typeof v?.definition === "string" ? v.definition : "",
    })),
    keyPhrases: keyPhrases.slice(0, 5).map((p) => ({
      phrase: typeof p?.phrase === "string" ? p.phrase : "",
      explanation: typeof p?.explanation === "string" ? p.explanation : "",
    })),
    suggestedQuestions: suggestedQuestions.filter((s) => typeof s === "string").slice(0, 5),
    conversationQuestions: conversationQuestions.filter((s) => typeof s === "string").slice(0, 5),
    culturalInsight,
    quiz: quiz.slice(0, 5).map((q) => ({
      question: typeof q?.question === "string" ? q.question : "",
      options: Array.isArray(q?.options) ? q.options.map(String) : [],
      correctIndex: typeof q?.correctIndex === "number" ? Math.max(0, Math.min(3, q.correctIndex)) : 0,
    })),
  };
}

export async function POST(request: Request) {
  const apiKey =
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? process.env.GOOGLE_AI_API_KEY;
  console.log("Using Key Status:", apiKey ? "FOUND" : "MISSING");

  try {
    if (!apiKey) {
      return NextResponse.json({ error: "API Key Missing" }, { status: 500 });
    }

    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Fetch Profile
    type Profile = {
      created_at: string;
      credits: number;
      is_premium: boolean;
    };

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("created_at, credits, is_premium")
      .eq("id", session.user.id)
      .single<Profile>();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // 5-Day Trial Logic
    const signupDate = new Date(profile.created_at);
    const now = new Date();
    const diffInDays = (now.getTime() - signupDate.getTime()) / (1000 * 3600 * 24);

    if (!profile.is_premium && diffInDays > 5) {
      return NextResponse.json({ error: "TRIAL_EXPIRED" }, { status: 403 });
    }

    // Credit Check
    if (profile.credits <= 0) {
      return NextResponse.json({ error: "OUT_OF_CREDITS" }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are an ESL lesson generator. Create a lesson for a ${body.level || "beginner"} level student.

Situation: ${body.situation || "General everyday situation"}

${LESSON_JSON_SCHEMA}

IMPORTANT (follow strictly):
- dialogue: Output EXACTLY 15 to 18 lines every time. Count the dialogue array: it must have at least 15 items and at most 18. Never fewer than 15, never more than 18. Alternate Speaker A and Speaker B. This is required for every level.
- suggestedQuestions = practical phrases the user can say in this situation (e.g. restaurant: "Can I see the dessert menu?"). conversationQuestions = 3 open-ended theme-based discussion questions.

Generate the JSON now:`;

    const result = await model.generateContent(prompt);
    const responseText = result?.response?.text?.();
    if (!responseText) {
      console.error("[generate] Empty Gemini response");
      return NextResponse.json({ error: "AI did not return content" }, { status: 502 });
    }
    const lesson = parseLessonJson(responseText);

    if (!lesson) {
      return NextResponse.json({ error: "AI Format Error" }, { status: 502 });
    }

    // Deduct Credit
    await supabase
      .from("profiles")
      .update({ credits: profile.credits - 1 })
      .eq("id", session.user.id);

    return NextResponse.json({ lesson });

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("SERVER ERROR:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
