import { NextResponse } from "next/server";
import { createServerClient, createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Defense-in-depth role check helper
async function checkAdmin() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized", status: 401 };

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

// GET: Fetch draws for a specific month and year
export async function GET(request) {
  try {
    const adminCheck = await checkAdmin();
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const { adminClient } = adminCheck;
    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get("month"), 10);
    const year = parseInt(searchParams.get("year"), 10);

    if (isNaN(month) || isNaN(year)) {
      return NextResponse.json({ error: "Missing or invalid month/year" }, { status: 400 });
    }

    // Fetch the draw row
    const { data: draws, error: drawErr } = await adminClient
      .from("draws")
      .select("*")
      .eq("month", month)
      .eq("year", year);

    if (drawErr) {
      return NextResponse.json({ error: drawErr.message }, { status: 500 });
    }

    // Fetch simulations if any exist
    const drawIds = (draws || []).map(d => d.id);
    let simulations = [];
    if (drawIds.length > 0) {
      const { data: simData } = await adminClient
        .from("draw_simulations")
        .select("*")
        .in("draw_id", drawIds)
        .order("simulated_at", { ascending: false }); // column is simulated_at, not created_at
      simulations = simData || [];
    }

    // Map simulations to draws
    const results = draws.map(d => {
      const drawSims = simulations.filter(s => s.draw_id === d.id);
      return {
        ...d,
        simulations: drawSims,
        latest_simulation: drawSims[0] || null
      };
    });

    return NextResponse.json({ draws: results });
  } catch (err) {
    console.error("[Draws GET Error]:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Create a new draft draw
export async function POST(request) {
  try {
    const adminCheck = await checkAdmin();
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const { adminClient } = adminCheck;
    const { month, year, logicType } = await request.json();

    const m = parseInt(month, 10);
    const y = parseInt(year, 10);

    if (isNaN(m) || m < 1 || m > 12 || isNaN(y)) {
      return NextResponse.json({ error: "Invalid month or year parameters" }, { status: 400 });
    }

    const logic = logicType === "algorithmic" ? "algorithmic" : "random";

    // Insert draft draw row
    const { data, error } = await adminClient
      .from("draws")
      .insert({
        month: m,
        year: y,
        draw_type: "five_match", // default to single 5-number draw mapping to 3 tiers
        logic_type: logic,
        status: "draft",
        winning_numbers: [],
        prize_pool_amount: 0.00,
        jackpot_rollover_amount: 0.00
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") { // unique constraint violation
        return NextResponse.json({ error: "Draw already exists for this month and year" }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, draw: data });
  } catch (err) {
    console.error("[Draws POST Error]:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH: Update strategy of a draft draw
export async function PATCH(request) {
  try {
    const adminCheck = await checkAdmin();
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const { adminClient } = adminCheck;
    const { drawId, logicType } = await request.json();

    if (!drawId || !logicType) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Verify logicType
    if (logicType !== "random" && logicType !== "algorithmic") {
      return NextResponse.json({ error: "Invalid logic type" }, { status: 400 });
    }

    // Verify draw status is draft or simulated
    const { data: draw, error: fetchErr } = await adminClient
      .from("draws")
      .select("status")
      .eq("id", drawId)
      .single();

    if (fetchErr || !draw) {
      return NextResponse.json({ error: "Draw not found" }, { status: 404 });
    }

    if (draw.status === "published") {
      return NextResponse.json({ error: "Cannot modify a published draw" }, { status: 400 });
    }

    const { data, error } = await adminClient
      .from("draws")
      .update({ logic_type: logicType })
      .eq("id", drawId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, draw: data });
  } catch (err) {
    console.error("[Draws PATCH Error]:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
