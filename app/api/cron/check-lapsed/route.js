import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendTransactionalEmail, getSubscriptionCancelledLapsedHtml } from "@/lib/brevo";

export async function GET(request) {
  try {
    // Check Authorization token if CRON_SECRET is configured
    const authHeader = request.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    const supabase = createAdminClient();
    const nowIso = new Date().toISOString();

    // Query active subscriptions that have expired
    const { data: expiredSubs, error: fetchError } = await supabase
      .from("subscriptions")
      .select("id, user_id")
      .eq("status", "active")
      .lt("current_period_end", nowIso);

    if (fetchError) {
      console.error("[Cron Fetch Error]:", fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!expiredSubs || expiredSubs.length === 0) {
      return NextResponse.json({ message: "No expired subscriptions found to lapse.", processed: 0 });
    }

    const expiredIds = expiredSubs.map((s) => s.id);

    // Update status to lapsed
    const { error: updateError } = await supabase
      .from("subscriptions")
      .update({ 
        status: "lapsed", 
        updated_at: nowIso 
      })
      .in("id", expiredIds);

    if (updateError) {
      console.error("[Cron Update Error]:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    console.log(`[Cron Success]: Marked ${expiredIds.length} subscriptions as lapsed`);

    // Trigger emails asynchronously in the background so it doesn't block the cron HTTP response
    triggerCronLapsedEmails(expiredSubs).catch(err => {
      console.error("[Cron Lapsed] Error triggering lapsed subscription emails:", err);
    });

    return NextResponse.json({
      message: "Successfully processed lapsed subscriptions.",
      processed: expiredIds.length,
      lapsed_user_ids: expiredSubs.map((s) => s.user_id),
    });
  } catch (error) {
    console.error("[Cron General Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ── Cron Async Email Notification Trigger Helper ──

async function triggerCronLapsedEmails(expiredSubs) {
  try {
    const supabase = createAdminClient();
    
    const emailPromises = expiredSubs.map(async (sub) => {
      try {
        const { data: { user }, error: userErr } = await supabase.auth.admin.getUserById(sub.user_id);
        if (userErr || !user) {
          console.error(`[Cron Lapsed] User not found for ID ${sub.user_id}:`, userErr);
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", sub.user_id)
          .maybeSingle();

        const name = profile?.full_name || user.user_metadata?.full_name || user.email.split("@")[0] || "Subscriber";

        await sendTransactionalEmail(sub.user_id, {
          type: "subscription_cancelled_lapsed",
          toEmail: user.email,
          toName: name,
          subject: "Your CauseLoop Subscription Has Ended",
          htmlContent: getSubscriptionCancelledLapsedHtml(name)
        });
      } catch (subErr) {
        console.error(`[Cron Lapsed] Failed to send email to user ${sub.user_id}:`, subErr);
      }
    });

    await Promise.allSettled(emailPromises);
    console.log(`[Cron Lapsed Emails] Dispatched ${expiredSubs.length} lapsed subscription notifications.`);
  } catch (err) {
    console.error("[Cron Lapsed Emails] Error in batch dispatcher:", err);
  }
}

export const dynamic = "force-dynamic";
