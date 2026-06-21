import { NextResponse } from "next/server";
import { createServerClient, createAdminClient } from "@/lib/supabase/server";
import { sendTransactionalEmail, getWelcomeEmailHtml } from "@/lib/brevo";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = createServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Trigger welcome email asynchronously in the background so it doesn't block redirection
        triggerWelcomeEmailAsync(user).catch(err => {
          console.error("[Callback welcome trigger error]:", err);
        });
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return the user to login page with an error
  return NextResponse.redirect(`${origin}/login?error=Authentication failed`);
}

async function triggerWelcomeEmailAsync(user) {
  try {
    const adminClient = createAdminClient();

    // Idempotency Check
    const { data: existingLog } = await adminClient
      .from("notifications_log")
      .select("id")
      .eq("user_id", user.id)
      .eq("type", "welcome")
      .maybeSingle();

    if (existingLog) {
      return;
    }

    // Fetch profile for name
    const { data: profile } = await adminClient
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle();

    const name = profile?.full_name || user.user_metadata?.full_name || user.email.split("@")[0] || "Golfer";

    await sendTransactionalEmail(user.id, {
      type: "welcome",
      toEmail: user.email,
      toName: name,
      subject: "Welcome to CauseLoop!",
      htmlContent: getWelcomeEmailHtml(name)
    });
  } catch (err) {
    console.error("[Callback triggerWelcomeEmailAsync Error]:", err);
  }
}
