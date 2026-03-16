import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    console.error("[stripe-portal] Missing STRIPE_SECRET_KEY");
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("stripe_customer_id, is_premium")
      .eq("id", session.user.id)
      .single();

    if (error || !profile) {
      console.error("[stripe-portal] Profile lookup failed:", error);
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    if (!profile.is_premium || !profile.stripe_customer_id) {
      return NextResponse.json({ error: "NO_ACTIVE_SUBSCRIPTION" }, { status: 403 });
    }

    const stripe = new Stripe(secretKey, {
      apiVersion: "2024-06-20",
    });

    const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;

    const sessionPortal = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${origin}/profile`,
    });

    return NextResponse.json({ url: sessionPortal.url });
  } catch (err) {
    console.error("[stripe-portal] Unexpected error:", err);
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

