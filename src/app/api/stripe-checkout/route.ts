import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * Creates a Stripe Checkout session in subscription mode.
 * Requires in .env:
 *   STRIPE_SECRET_KEY - Stripe secret key (sk_...)
 *   STRIPE_PRICE_ID   - Your Stripe Price ID (price_...) for the subscription
 *   NEXT_PUBLIC_SITE_URL - Base URL for success/cancel redirects (e.g. https://yoursite.com)
 */
export async function POST() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env.STRIPE_PRICE_ID;

  if (!secretKey) {
    console.error("[stripe-checkout] Missing STRIPE_SECRET_KEY");
    return NextResponse.json(
      { error: "Stripe is not configured (missing secret key)" },
      { status: 500 }
    );
  }

  if (!priceId) {
    console.error("[stripe-checkout] Missing STRIPE_PRICE_ID");
    return NextResponse.json(
      { error: "Stripe Price ID is not configured" },
      { status: 500 }
    );
  }

  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { session: authSession },
    } = await supabase.auth.getSession();

    if (!authSession?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const origin =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);
    if (!origin) {
      console.error("[stripe-checkout] No NEXT_PUBLIC_SITE_URL or VERCEL_URL set");
      return NextResponse.json(
        { error: "Server missing site URL configuration" },
        { status: 500 }
      );
    }

    const stripe = new Stripe(secretKey, {
      apiVersion: "2024-06-20",
    });

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}/dashboard?payment=success`,
      cancel_url: `${origin}/pricing`,
      client_reference_id: authSession.user.id,
      customer_email: authSession.user.email ?? undefined,
    });

    if (!checkoutSession.url) {
      return NextResponse.json(
        { error: "Failed to create checkout session" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    console.error("[stripe-checkout] Error:", err);
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
