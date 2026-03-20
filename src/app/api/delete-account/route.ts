import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

export async function POST() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      {
        error:
          "Server missing Supabase admin configuration (NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY).",
      },
      { status: 500 }
    );
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  try {
    // Remove app data first so the user is wiped cleanly.
    // (Best effort: if a table doesn't exist, we don't want to block the user deletion.)
    await admin.from("profiles").delete().eq("id", userId);
    try {
      await admin.from("lessons").delete().eq("user_id", userId);
    } catch {
      // ignore
    }
    try {
      await admin.from("saved_lessons").delete().eq("user_id", userId);
    } catch {
      // ignore
    }

    // Delete auth user
    await admin.auth.admin.deleteUser(userId);

    // Clear session cookies for the current user (best effort).
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    console.error("[delete-account] Error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

