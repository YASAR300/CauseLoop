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
    const { winnerId } = body;

    if (!winnerId) {
      return NextResponse.json(
        { error: "Missing winnerId" },
        { status: 400 }
      );
    }

    // 3. Validate winner exists and is approved
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

    if (winner.verification_status !== "approved") {
      return NextResponse.json(
        { error: "Winner must be approved before marking as paid" },
        { status: 400 }
      );
    }

    if (winner.payment_status === "paid") {
      return NextResponse.json(
        { error: "Winner already marked as paid" },
        { status: 400 }
      );
    }

    // 4. Update payment status
    const { error: updateError } = await supabase
      .from("winners")
      .update({
        payment_status: "paid",
        updated_at: new Date().toISOString()
      })
      .eq("id", winnerId);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to mark as paid. Please try again" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, payment_status: "paid" });

  } catch (error) {
    console.error("Payment status update error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
