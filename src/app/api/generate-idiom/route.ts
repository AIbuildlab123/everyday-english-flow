import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { IDIOM_BANK } from "@/data/american-idioms";
import { shuffleMcqOptions } from "@/lib/quiz-shuffle";

export const dynamic = "force-dynamic";

function pickDistinctIndices(exclude: number, count: number, max: number): number[] {
  const out: number[] = [];
  let guard = 0;
  while (out.length < count && guard++ < 500) {
    const j = Math.floor(Math.random() * max);
    if (j !== exclude && !out.includes(j)) out.push(j);
  }
  return out;
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Optional: seed from client for cache-busting (no AI call).
    await request.json().catch(() => ({}));

    if (IDIOM_BANK.length < 4) {
      return NextResponse.json({ error: "Idiom bank not configured" }, { status: 500 });
    }

    const mainIdx = Math.floor(Math.random() * IDIOM_BANK.length);
    const main = IDIOM_BANK[mainIdx]!;
    const wrongIdxs = pickDistinctIndices(mainIdx, 3, IDIOM_BANK.length);
    const wrongDefs = wrongIdxs.map((i) => IDIOM_BANK[i]!.definition);

    const baseOptions = [main.definition, ...wrongDefs];
    const shuffled = shuffleMcqOptions(baseOptions, 0);

    const idiom = {
      phrase: main.phrase,
      meaning: main.definition,
      example_sentence: main.example_sentence,
      question: `What does the idiom “${main.phrase}” mean?`,
      options: shuffled.options,
      correctIndex: shuffled.correctIndex,
    };

    return NextResponse.json(
      { idiom },
      {
        headers: {
          "Cache-Control": "private, no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("IDIOM GENERATION ERROR:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
