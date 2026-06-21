import { NextResponse } from "next/server";
import { getStripeServer } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/server";
import {
  sendTransactionalEmail,
  getSubscriptionActivatedHtml,
  getSubscriptionCancelledLapsedHtml,
  getPaymentFailedWarningHtml
} from "@/lib/brevo";

export async function POST(request) {
  const stripe = getStripeServer();
  const sig = request.headers.get("stripe-signature");
  
  let rawBody;
  try {
    rawBody = await request.text();
  } catch (err) {
    return new Response(`Error reading request text: ${err.message}`, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`[Webhook Signature Failed]: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const supabase = createAdminClient();

  // ── IDEMPOTENCY CHECK ──
  try {
    const { data: existingEvent, error: findError } = await supabase
      .from("stripe_events")
      .select("id")
      .eq("id", event.id)
      .maybeSingle();

    if (findError) {
      console.error("[Idempotency Query Error]:", findError);
    }

    if (existingEvent) {
      console.log(`[Idempotency Warning]: Event ${event.id} already processed.`);
      return NextResponse.json({ received: true, duplicate: true });
    }

    // Register event immediately to reserve it
    const { error: insertError } = await supabase
      .from("stripe_events")
      .insert({ id: event.id });

    if (insertError) {
      console.error("[Idempotency Insert Error]:", insertError);
      return new Response("Error recording event idempotency log", { status: 500 });
    }
  } catch (dbErr) {
    console.error("[Idempotency General Error]:", dbErr);
    return new Response("Internal Database Error during idempotency validation", { status: 500 });
  }

  // ── EVENT HANDLING ──
  try {
    const eventType = event.type;
    console.log(`[Stripe Webhook]: Processing event ${event.id} of type ${eventType}`);

    if (eventType === "checkout.session.completed") {
      const session = event.data.object;
      const supabaseUserId = session.metadata?.supabase_user_id;
      const subscriptionId = session.subscription;
      const customerId = session.customer;

      if (!supabaseUserId || !subscriptionId) {
        console.error("[Webhook Error]: Missing supabaseUserId or subscriptionId in checkout completed event");
        return new Response("Missing metadata or subscription details", { status: 400 });
      }

      // Fetch active subscription details from Stripe
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const priceId = subscription.items.data[0].price.id;
      const planType = priceId === (process.env.STRIPE_PRICE_YEARLY || "price_1TkSdPIUEU1f1CxDZapSzNNQ") ? "yearly" : "monthly";

      const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();

      // Upsert user subscription status
      const { error: upsertError } = await supabase
        .from("subscriptions")
        .upsert({
          user_id: supabaseUserId,
          plan_type: planType,
          status: "active",
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          current_period_end: currentPeriodEnd,
          renewal_date: currentPeriodEnd,
          updated_at: new Date().toISOString()
        }, { onConflict: "stripe_subscription_id" });

      if (upsertError) {
        console.error("[Webhook Database Upsert Failed]:", upsertError);
        return new Response(`Database Upsert Error: ${upsertError.message}`, { status: 500 });
      }

      console.log(`[Webhook Success]: Created/Updated subscription active state for user ${supabaseUserId}`);

      // Trigger activation email asynchronously
      triggerSubscriptionActivatedEmail(supabaseUserId).catch(err => {
        console.error("[Stripe Webhook] Error triggering activation email:", err);
      });
    } 
    
    else if (eventType === "customer.subscription.updated") {
      const subscription = event.data.object;
      const subscriptionId = subscription.id;
      const customerId = subscription.customer;
      const stripeStatus = subscription.status;

      // Map Stripe status to CauseLoop schema status
      let subStatus = "inactive";
      if (stripeStatus === "active" || stripeStatus === "trialing") {
        subStatus = "active";
      } else if (stripeStatus === "canceled") {
        subStatus = "cancelled";
      } else if (stripeStatus === "past_due" || stripeStatus === "unpaid") {
        subStatus = "lapsed";
      }

      // Query current status in database BEFORE updating
      const { data: currentSub } = await supabase
        .from("subscriptions")
        .select("status, user_id")
        .eq("stripe_subscription_id", subscriptionId)
        .maybeSingle();

      const priceId = subscription.items.data[0].price.id;
      const planType = priceId === (process.env.STRIPE_PRICE_YEARLY || "price_1TkSdPIUEU1f1CxDZapSzNNQ") ? "yearly" : "monthly";
      const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();

      const { error: updateError } = await supabase
        .from("subscriptions")
        .update({
          status: subStatus,
          plan_type: planType,
          current_period_end: currentPeriodEnd,
          renewal_date: currentPeriodEnd,
          updated_at: new Date().toISOString()
        })
        .eq("stripe_subscription_id", subscriptionId);

      if (updateError) {
        console.error("[Webhook Database Update Failed]:", updateError);
        return new Response(`Database Update Error: ${updateError.message}`, { status: 500 });
      }

      console.log(`[Webhook Success]: Updated subscription ${subscriptionId} status to ${subStatus}`);

      // Handle emails based on transitions
      if (currentSub) {
        const userId = currentSub.user_id;
        
        // 1. Transition to active
        if (subStatus === "active" && currentSub.status !== "active") {
          triggerSubscriptionActivatedEmail(userId).catch(err => {
            console.error("[Stripe Webhook] Error triggering activation email:", err);
          });
        }
        
        // 2. Transition to cancelled
        if (subStatus === "cancelled" && currentSub.status !== "cancelled") {
          triggerSubscriptionCancelledLapsedEmail(userId).catch(err => {
            console.error("[Stripe Webhook] Error triggering cancellation email:", err);
          });
        }
      }
    } 
    
    else if (eventType === "customer.subscription.deleted") {
      const subscription = event.data.object;
      const subscriptionId = subscription.id;

      // Find user id before updating status
      const { data: subRow } = await supabase
        .from("subscriptions")
        .select("user_id")
        .eq("stripe_subscription_id", subscriptionId)
        .maybeSingle();

      const { error: deleteError } = await supabase
        .from("subscriptions")
        .update({
          status: "cancelled",
          updated_at: new Date().toISOString()
        })
        .eq("stripe_subscription_id", subscriptionId);

      if (deleteError) {
        console.error("[Webhook Database Cancel Failed]:", deleteError);
        return new Response(`Database Cancel Error: ${deleteError.message}`, { status: 500 });
      }

      console.log(`[Webhook Success]: Marked subscription ${subscriptionId} as cancelled`);

      if (subRow) {
        triggerSubscriptionCancelledLapsedEmail(subRow.user_id).catch(err => {
          console.error("[Stripe Webhook] Error triggering cancellation email:", err);
        });
      }
    } 
    
    else if (eventType === "invoice.payment_failed") {
      const invoice = event.data.object;
      const subscriptionId = invoice.subscription;

      if (subscriptionId) {
        // Query user ID before updating
        const { data: subRow } = await supabase
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_subscription_id", subscriptionId)
          .maybeSingle();

        const { error: failError } = await supabase
          .from("subscriptions")
          .update({
            status: "lapsed",
            updated_at: new Date().toISOString()
          })
          .eq("stripe_subscription_id", subscriptionId);

        if (failError) {
          console.error("[Webhook Database Lapsed Failed]:", failError);
          return new Response(`Database Lapsed Error: ${failError.message}`, { status: 500 });
        }

        console.log(`[Webhook Success]: Marked subscription ${subscriptionId} as lapsed due to payment failure`);

        if (subRow) {
          triggerPaymentFailedWarningEmail(subRow.user_id).catch(err => {
            console.error("[Stripe Webhook] Error triggering payment failed email:", err);
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Webhook General Execution Error]:", error);
    return new Response(`Internal Server Processing Error: ${error.message}`, { status: 500 });
  }
}

// ── Webhook Async Email Notification Trigger Helpers ──

async function triggerSubscriptionActivatedEmail(userId) {
  try {
    const supabase = createAdminClient();
    const { data: { user }, error } = await supabase.auth.admin.getUserById(userId);
    if (error || !user) {
      console.error("[Stripe Webhook] Auth user not found for activation email:", error);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .maybeSingle();

    const name = profile?.full_name || user.user_metadata?.full_name || user.email.split("@")[0] || "Subscriber";

    await sendTransactionalEmail(userId, {
      type: "subscription_activated",
      toEmail: user.email,
      toName: name,
      subject: "Your CauseLoop Subscription is Active!",
      htmlContent: getSubscriptionActivatedHtml(name)
    });
  } catch (err) {
    console.error("[Stripe Webhook] triggerSubscriptionActivatedEmail error:", err);
  }
}

async function triggerSubscriptionCancelledLapsedEmail(userId) {
  try {
    const supabase = createAdminClient();
    const { data: { user }, error } = await supabase.auth.admin.getUserById(userId);
    if (error || !user) {
      console.error("[Stripe Webhook] Auth user not found for cancellation email:", error);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .maybeSingle();

    const name = profile?.full_name || user.user_metadata?.full_name || user.email.split("@")[0] || "Subscriber";

    await sendTransactionalEmail(userId, {
      type: "subscription_cancelled_lapsed",
      toEmail: user.email,
      toName: name,
      subject: "Your CauseLoop Subscription Has Ended",
      htmlContent: getSubscriptionCancelledLapsedHtml(name)
    });
  } catch (err) {
    console.error("[Stripe Webhook] triggerSubscriptionCancelledLapsedEmail error:", err);
  }
}

async function triggerPaymentFailedWarningEmail(userId) {
  try {
    const supabase = createAdminClient();
    const { data: { user }, error } = await supabase.auth.admin.getUserById(userId);
    if (error || !user) {
      console.error("[Stripe Webhook] Auth user not found for payment warning email:", error);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .maybeSingle();

    const name = profile?.full_name || user.user_metadata?.full_name || user.email.split("@")[0] || "Subscriber";

    await sendTransactionalEmail(userId, {
      type: "payment_failed_warning",
      toEmail: user.email,
      toName: name,
      subject: "Action Required: Payment Attempt Failed for CauseLoop",
      htmlContent: getPaymentFailedWarningHtml(name)
    });
  } catch (err) {
    console.error("[Stripe Webhook] triggerPaymentFailedWarningEmail error:", err);
  }
}
