import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

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
export const dynamic = "force-dynamic";
