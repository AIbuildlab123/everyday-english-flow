import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const topic =
      typeof body.topic === "string" ? body.topic : "My lesson";
    const content =
      typeof body.content === "string"
        ? body.content
        : JSON.stringify(body.content ?? {});

    const { data: inserted, error: insertError } = await supabase
      .from("lessons")
      .insert({
        user_id: session.user.id,
        topic,
        content,
      })
      .select()
      .single();

    if (insertError) {
      console.error("[save-lesson] Insert error:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }

    return NextResponse.json({ lesson: inserted }, { status: 201 });
  } catch (err) {
    console.error("[save-lesson] Unhandled error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}
