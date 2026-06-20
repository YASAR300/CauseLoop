import { NextResponse } from "next/server";
import { createServerClient, createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Helper to verify if the request is from an admin
async function checkAdmin() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized", status: 401 };

  // Fetch role from profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return { error: "Forbidden", status: 403 };
  }

  return { user, adminClient: createAdminClient() };
}

// ── GET: FETCH ALL USERS, SUBSCRIPTIONS, AND STATS (ADMIN ONLY) ─────────────
export async function GET(request) {
  try {
    const adminCheck = await checkAdmin();
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const { adminClient } = adminCheck;

    // Fetch all profiles
    const { data: profiles, error: profErr } = await adminClient
      .from("profiles")
      .select("*, subscriptions(*), scores(*)")
      .order("created_at", { ascending: false });

    if (profErr) {
      return NextResponse.json({ error: profErr.message }, { status: 500 });
    }

    // Fetch all charities
    const { data: charities } = await adminClient.from("charities").select("*");

    // Fetch all draws
    const { data: draws } = await adminClient
      .from("draws")
      .select("*")
      .order("created_at", { ascending: false });

    // Fetch all winners
    const { data: winners } = await adminClient
      .from("winners")
      .select("*, draws(*), profiles(*)")
      .order("created_at", { ascending: false });

    return NextResponse.json({
      profiles,
      charities,
      draws,
      winners
    });
  } catch (err) {
    console.error("[Admin GET Error]:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ── PATCH: UPDATE USER PROFILE / SUBSCRIPTION / WINNER (ADMIN ONLY) ─────────
export async function PATCH(request) {
  try {
    const adminCheck = await checkAdmin();
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const { adminClient } = adminCheck;
    const body = await request.json();
    const { action, userId, role, charityId, charityContribution, subscriptionId, subStatus, currentPeriodEnd, winnerId, verificationStatus, paymentStatus } = body;

    if (action === "update_profile") {
      if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });
      const updates = {};
      if (role) updates.role = role;
      if (charityId !== undefined) updates.charity_id = charityId;
      if (charityContribution !== undefined) updates.charity_contribution_percentage = charityContribution;

      const { data, error } = await adminClient
        .from("profiles")
        .update(updates)
        .eq("id", userId)
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, profile: data });
    }

    if (action === "update_subscription") {
      if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });
      
      const { data: existingSub } = await adminClient
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      let result;
      if (existingSub) {
        const { data, error } = await adminClient
          .from("subscriptions")
          .update({
            status: subStatus || existingSub.status,
            current_period_end: currentPeriodEnd || existingSub.current_period_end
          })
          .eq("user_id", userId)
          .select()
          .single();
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        result = data;
      } else {
        const { data, error } = await adminClient
          .from("subscriptions")
          .insert({
            user_id: userId,
            plan_type: "monthly",
            status: subStatus || "active",
            current_period_end: currentPeriodEnd || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          })
          .select()
          .single();
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        result = data;
      }

      return NextResponse.json({ success: true, subscription: result });
    }

    if (action === "verify_winner") {
      if (!winnerId) return NextResponse.json({ error: "Missing winnerId" }, { status: 400 });
      const updates = {};
      if (verificationStatus) updates.verification_status = verificationStatus;
      if (paymentStatus) updates.payment_status = paymentStatus;

      const { data, error } = await adminClient
        .from("winners")
        .update(updates)
        .eq("id", winnerId)
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, winner: data });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("[Admin PATCH Error]:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ── DELETE: REMOVE GOLF SCORE (ADMIN BYPASS) ────────────────────────────────
export async function DELETE(request) {
  try {
    const adminCheck = await checkAdmin();
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const { adminClient } = adminCheck;
    const { searchParams } = new URL(request.url);
    const scoreId = searchParams.get("scoreId");

    if (!scoreId) {
      return NextResponse.json({ error: "Missing scoreId" }, { status: 400 });
    }

    const { error } = await adminClient
      .from("scores")
      .delete()
      .eq("id", scoreId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, message: "Score deleted successfully." });
  } catch (err) {
    console.error("[Admin DELETE Error]:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
