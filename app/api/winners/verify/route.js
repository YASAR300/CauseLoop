import { createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const supabase = createServerClient();
    
    // 1. Authenticate and verify admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 2. Parse request body
    const body = await request.json();
    const { winnerId, action, rejectionReason } = body;

    if (!winnerId || !action) {
      return NextResponse.json(
        { error: "Missing winnerId or action" },
        { status: 400 }
      );
    }

    // 3. Validate winner exists and has proof
    const { data: winner, error: winnerError } = await supabase
      .from("winners")
      .select("*")
      .eq("id", winnerId)
      .single();

    if (winnerError || !winner) {
      return NextResponse.json(
        { error: "Winner record not found" },
        { status: 404 }
      );
    }

    // 4. Handle action
    if (action === "approve" || action === "reject") {
      if (winner.verification_status !== "pending") {
        return NextResponse.json(
          { error: `Cannot verify this winner record: current status is ${winner.verification_status}` },
          { status: 400 }
        );
      }
      if (!winner.proof_image_url) {
        return NextResponse.json(
          { error: "Cannot verify this winner record: no proof has been uploaded yet" },
          { status: 400 }
        );
      }
    }

    if (action === "approve") {
      const { error: updateError } = await supabase
        .from("winners")
        .update({
          verification_status: "approved",
          updated_at: new Date().toISOString()
        })
        .eq("id", winnerId);

      if (updateError) {
        return NextResponse.json(
          { error: "Approval failed. Please try again" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, action: "approved" });

    } else if (action === "reject") {
      // Validate rejection reason
      const trimmedReason = rejectionReason?.trim() || "";
      
      if (trimmedReason.length > 0 && trimmedReason.length < 10) {
        return NextResponse.json(
          { error: "Rejection reason must be at least 10 characters" },
          { status: 400 }
        );
      }

      if (trimmedReason.length > 1000) {
        return NextResponse.json(
          { error: "Rejection reason must not exceed 1000 characters" },
          { status: 400 }
        );
      }

      const { error: updateError } = await supabase
        .from("winners")
        .update({
          verification_status: "rejected",
          rejection_reason: trimmedReason.length >= 10 ? trimmedReason : null,
          updated_at: new Date().toISOString()
        })
        .eq("id", winnerId);

      if (updateError) {
        return NextResponse.json(
          { error: "Rejection failed. Please try again" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, action: "rejected" });

    } else if (action === "pay") {
      if (winner.verification_status !== "approved") {
        return NextResponse.json(
          { error: "Cannot mark as paid if the claim is not approved" },
          { status: 400 }
        );
      }

      const { error: updateError } = await supabase
        .from("winners")
        .update({
          payment_status: "paid",
          updated_at: new Date().toISOString()
        })
        .eq("id", winnerId);

      if (updateError) {
        return NextResponse.json(
          { error: "Payment status update failed. Please try again" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, action: "paid" });

    } else {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
