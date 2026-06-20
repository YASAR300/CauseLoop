import { NextResponse } from "next/server";
import { getStripeServer } from "@/lib/stripe";
import { createServerClient, createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = request.nextUrl;
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
    }

    // Get current user session
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stripe = getStripeServer();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Security check: ensure this session belongs to the logged-in user
    if (session.metadata?.supabase_user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized session access" }, { status: 403 });
    }

    // Verify it is completed and paid
    if (session.payment_status !== "paid" && session.status !== "complete") {
      return NextResponse.json({ status: "pending", message: "Session is not paid or completed yet" });
    }

    const subscriptionId = session.subscription;
    const customerId = session.customer;

    if (!subscriptionId) {
      return NextResponse.json({ error: "No subscription found on session" }, { status: 400 });
    }

    // Fetch active subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const priceId = subscription.items.data[0].price.id;

    // Normalize prices matching route fallbacks
    const planType = priceId === (process.env.STRIPE_PRICE_YEARLY || "price_1TkSdPIUEU1f1CxDZapSzNNQ") ? "yearly" : "monthly";
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();

    // Use admin client to bypass RLS and upsert the subscription status
    const adminSupabase = createAdminClient();
    const { data: updatedSub, error: upsertError } = await adminSupabase
      .from("subscriptions")
      .upsert({
        user_id: user.id,
        plan_type: planType,
        status: "active",
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        current_period_end: currentPeriodEnd,
        renewal_date: currentPeriodEnd,
        updated_at: new Date().toISOString()
      }, { onConflict: "stripe_subscription_id" })
      .select()
      .single();

    if (upsertError) {
      console.error("[Confirm Checkout Upsert Error]:", upsertError);
      return NextResponse.json({ error: "Failed to update subscription in database" }, { status: 500 });
    }

    return NextResponse.json({ status: "active", subscription: updatedSub });
  } catch (error) {
    console.error("[Confirm Checkout General Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
