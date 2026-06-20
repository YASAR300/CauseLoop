import { NextResponse } from "next/server";
import { getStripeServer } from "@/lib/stripe";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request) {
  try {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    const origin = request.nextUrl.origin;

    if (!user) {
      return NextResponse.redirect(`${origin}/login`);
    }

    // Fetch subscription customer ID
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    const customerId = subscription?.stripe_customer_id;

    if (!customerId) {
      return NextResponse.redirect(`${origin}/subscribe?error=No customer profile found`);
    }

    const stripe = getStripeServer();
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/dashboard`,
    });

    return NextResponse.redirect(session.url);
  } catch (error) {
    console.error("[Billing Portal GET Error]:", error);
    const origin = new URL(request.url).origin;
    return NextResponse.redirect(`${origin}/dashboard?error=Portal redirect failed`);
  }
}

export async function POST(request) {
  try {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    const customerId = subscription?.stripe_customer_id;

    if (!customerId) {
      return NextResponse.json({ error: "No billing profile found" }, { status: 404 });
    }

    const stripe = getStripeServer();
    const origin = request.nextUrl.origin;

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/dashboard`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[Billing Portal POST Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
