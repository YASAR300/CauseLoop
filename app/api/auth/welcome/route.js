import { NextResponse } from "next/server";
import { createServerClient, createAdminClient } from "@/lib/supabase/server";
import { sendTransactionalEmail, getWelcomeEmailHtml } from "@/lib/brevo";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const supabase = createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminClient = createAdminClient();

    // 1. Idempotency Check: check if welcome email has already been sent
    const { data: existingLog, error: logErr } = await adminClient
      .from("notifications_log")
      .select("id")
      .eq("user_id", user.id)
      .eq("type", "welcome")
      .maybeSingle();

    if (logErr) {
      console.error("[Welcome Route] Error querying notifications log:", logErr);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    if (existingLog) {
      return NextResponse.json({ success: true, message: "Welcome email already sent", duplicate: true });
    }

    // 2. Fetch user's profile to get the full name
    const { data: profile } = await adminClient
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle();

    const name = profile?.full_name || user.user_metadata?.full_name || user.email.split("@")[0] || "Golfer";

    // 3. Send email using the Brevo helper
    const emailResult = await sendTransactionalEmail(user.id, {
      type: "welcome",
      toEmail: user.email,
      toName: name,
      subject: "Welcome to CauseLoop!",
      htmlContent: getWelcomeEmailHtml(name)
    });

    return NextResponse.json({ success: emailResult.success, duplicate: false });
  } catch (err) {
    console.error("[Welcome Route Error]:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
