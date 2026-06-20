import { NextResponse } from "next/server";
import { getStripeServer } from "@/lib/stripe";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request) {
  try {
    const plan = request.nextUrl.searchParams.get("plan");

    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    const origin = request.nextUrl.origin;

    if (!user) {
      return NextResponse.redirect(`${origin}/login?redirect=/subscribe`);
    }

    let priceId = null;
    const cleanPlan = (plan || "").trim().toLowerCase();

    if (cleanPlan === "monthly") {
      const envPrice = (process.env.STRIPE_PRICE_MONTHLY || "").trim();
      priceId = envPrice.startsWith("price_") ? envPrice : "price_1TkSdNIUEU1f1CxDmLfYrj5D";
    } else if (cleanPlan === "yearly") {
      const envPrice = (process.env.STRIPE_PRICE_YEARLY || "").trim();
      priceId = envPrice.startsWith("price_") ? envPrice : "price_1TkSdPIUEU1f1CxDZapSzNNQ";
    }

    if (!priceId) {
      return NextResponse.redirect(`${origin}/subscribe?error=Invalid plan`);
    }

    const stripe = getStripeServer();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: user.email,
      metadata: {
        supabase_user_id: user.id,
      },
      success_url: `${origin}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/subscribe`,
    });

    return NextResponse.redirect(session.url);
  } catch (error) {
    console.error("[Checkout GET Error]:", error);
    const origin = new URL(request.url).origin;
    return NextResponse.redirect(`${origin}/subscribe?error=Checkout failed`);
  }
}

export async function POST(request) {
  try {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { plan } = await request.json();
    let priceId = null;
    const cleanPlan = (plan || "").trim().toLowerCase();

    if (cleanPlan === "monthly") {
      const envPrice = (process.env.STRIPE_PRICE_MONTHLY || "").trim();
      priceId = envPrice.startsWith("price_") ? envPrice : "price_1TkSdNIUEU1f1CxDmLfYrj5D";
    } else if (cleanPlan === "yearly") {
      const envPrice = (process.env.STRIPE_PRICE_YEARLY || "").trim();
      priceId = envPrice.startsWith("price_") ? envPrice : "price_1TkSdPIUEU1f1CxDZapSzNNQ";
    }

    if (!priceId) {
      return NextResponse.json({ error: "Invalid plan selection" }, { status: 400 });
    }

    const stripe = getStripeServer();
    const origin = request.nextUrl.origin;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: user.email,
      metadata: {
        supabase_user_id: user.id,
      },
      success_url: `${origin}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/subscribe`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[Checkout POST Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
