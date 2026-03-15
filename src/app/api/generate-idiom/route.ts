import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? process.env.GOOGLE_AI_API_KEY;

if (!apiKey) {
  throw new Error("Missing Gemini API Key");
}

const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get seed from request body to ensure different idioms each time
    const body = await request.json().catch(() => ({}));
    const seed = body.seed || Math.random().toString();

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.9, // Higher temperature for more creativity and variety
      },
    });

    const prompt = `Select a RANDOM American idiom from a pool of 500+ common expressions. Do NOT repeat the most common ones like "Piece of cake", "Break the ice", "Hit the nail on the head", or "Once in a blue moon". Choose something different and less common every time.

Generate a multiple-choice quiz question about this idiom.

Return ONLY valid JSON in this exact format:
{
  "question": "What does the idiom '[IDIOM]' mean?",
  "options": [
    "Correct meaning",
    "Wrong option 1",
    "Wrong option 2",
    "Wrong option 3"
  ],
  "correctIndex": 0,
  "explanation": "Brief explanation of what this idiom means."
}

Seed: ${seed}
Generate a NEW and DIFFERENT idiom question now:`;

    const result = await model.generateContent(prompt);
    const responseText = result?.response?.text?.();
    
    if (!responseText) {
      return NextResponse.json({ error: "AI did not return content" }, { status: 502 });
    }

    // Try to extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Invalid response format" }, { status: 502 });
    }

    const idiomData = JSON.parse(jsonMatch[0]);
    
    if (!idiomData.question || !Array.isArray(idiomData.options) || typeof idiomData.correctIndex !== "number") {
      return NextResponse.json({ error: "Invalid idiom data structure" }, { status: 502 });
    }

    return NextResponse.json({ idiom: idiomData });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("IDIOM GENERATION ERROR:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
