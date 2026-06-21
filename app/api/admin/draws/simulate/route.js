import { NextResponse } from "next/server";
import { createServerClient, createAdminClient } from "@/lib/supabase/server";
import { generateWinningNumbers, determineWinnersAndPayouts } from "@/lib/draw-engine";

export const dynamic = "force-dynamic";

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

export async function POST(request) {
  try {
    const adminCheck = await checkAdmin();
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const { adminClient } = adminCheck;
    const { drawId } = await request.json();

    if (!drawId) {
      return NextResponse.json({ error: "Missing drawId" }, { status: 400 });
    }

    // 1. Fetch draw details
    const { data: draw, error: fetchErr } = await adminClient
      .from("draws")
      .select("*")
      .eq("id", drawId)
      .single();

    if (fetchErr || !draw) {
      return NextResponse.json({ error: "Draw not found" }, { status: 404 });
    }

    if (draw.status === "published") {
      return NextResponse.json({ error: "Cannot simulate a published draw" }, { status: 400 });
    }

    // 2. Fetch all active subscribers
    // Note: email lives in auth.users, not profiles — we only select what profiles has
    const { data: activeProfiles, error: subErr } = await adminClient
      .from("profiles")
      .select(`
        id,
        full_name,
        subscriptions!inner (
          status
        )
      `)
      .eq("subscriptions.status", "active");

    if (subErr) {
      return NextResponse.json({ error: "Failed to fetch active subscribers: " + subErr.message }, { status: 500 });
    }

    // 3. Fetch all scores to compute numbers played and period frequencies in a single batch
    const { data: allScores, error: scoreErr } = await adminClient
      .from("scores")
      .select("user_id, score_value, score_date")
      .order("score_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (scoreErr) {
      return NextResponse.json({ error: "Failed to fetch subscriber scores: " + scoreErr.message }, { status: 500 });
    }

    const activeUserIds = new Set(activeProfiles.map(p => p.id));
    const activeSubscribersList = activeProfiles.map(p => {
      // Find latest 5 scores for this user
      const userScores = allScores
        .filter(s => s.user_id === p.id)
        .slice(0, 5)
        .map(s => s.score_value);

      return {
        id: p.id,
        full_name: p.full_name || "Subscriber",
        numbers_played: userScores
      };
    });

    // 4. Calculate date range of this draw month/year to collect period scores
    const year = draw.year;
    const month = draw.month;
    
    // We want the start date: e.g. "2026-06-01"
    const startDateStr = `${year}-${String(month).padStart(2, '0')}-01`;
    // We want the end date (last day of month): e.g. "2026-06-30"
    const lastDay = new Date(year, month, 0).getDate();
    const endDateStr = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    // Filter scores of this month/year logged by users who are active subscribers
    const periodScores = allScores
      .filter(s => {
        const isUserActive = activeUserIds.has(s.user_id);
        const inPeriod = s.score_date >= startDateStr && s.score_date <= endDateStr;
        return isUserActive && inPeriod;
      })
      .map(s => s.score_value);

    // 5. Query previous month's rollover amount for 5-match jackpot
    let prevMonth = month - 1;
    let prevYear = year;
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear = year - 1;
    }

    const { data: prevDraw } = await adminClient
      .from("draws")
      .select("jackpot_rollover_amount")
      .eq("month", prevMonth)
      .eq("year", prevYear)
      .eq("draw_type", "five_match")
      .eq("status", "published")
      .maybeSingle();

    const previousRollover = prevDraw ? parseFloat(prevDraw.jackpot_rollover_amount) : 0.00;

    // 6. Generate winning numbers
    const winningNumbers = generateWinningNumbers(draw.logic_type, periodScores, 5);

    // 7. Calculate pool and winners
    const activeRevenue = activeSubscribersList.length * 12.00; // £12.00 monthly subscription price
    const totalPrizePool = activeRevenue * 0.40; // 40% of subscription revenue

    const evaluation = determineWinnersAndPayouts(
      winningNumbers,
      activeSubscribersList,
      totalPrizePool,
      previousRollover
    );

    // 8. Insert simulation record into draw_simulations
    const { data: simulation, error: simInsertErr } = await adminClient
      .from("draw_simulations")
      .insert({
        draw_id: draw.id,
        winning_numbers: winningNumbers,
        prize_pool_amount: totalPrizePool,
        jackpot_rollover_amount: evaluation.newRolloverAmount,
        projected_winners: evaluation.winners
      })
      .select()
      .single();

    if (simInsertErr) {
      return NextResponse.json({ error: "Failed to store simulation: " + simInsertErr.message }, { status: 500 });
    }

    // 9. Transition draw status to 'simulated' if it is in 'draft'
    if (draw.status === "draft") {
      await adminClient
        .from("draws")
        .update({ status: "simulated" })
        .eq("id", draw.id);
    }

    return NextResponse.json({
      success: true,
      simulation,
      activeSubscribersCount: activeSubscribersList.length,
      previousRollover
    });
  } catch (err) {
    console.error("[Draws Simulate Error]:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
