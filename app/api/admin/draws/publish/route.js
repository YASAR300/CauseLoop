import { NextResponse } from "next/server";
import { createServerClient, createAdminClient } from "@/lib/supabase/server";
import { determineWinnersAndPayouts } from "@/lib/draw-engine";
import { sendTransactionalEmail, getDrawResultsHtml, getWinnerAlertHtml } from "@/lib/brevo";

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
    const { drawId, simulationId } = await request.json();

    if (!drawId || !simulationId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
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
      return NextResponse.json({ error: "Draw is already published" }, { status: 400 });
    }

    // 2. Fetch simulation details
    const { data: simulation, error: simErr } = await adminClient
      .from("draw_simulations")
      .select("*")
      .eq("id", simulationId)
      .eq("draw_id", drawId)
      .single();

    if (simErr || !simulation) {
      return NextResponse.json({ error: "Simulation run not found" }, { status: 404 });
    }

    const winningNumbers = simulation.winning_numbers;

    // 3. Authoritative active subscribers query at the EXACT moment of publication
    // Note: email lives in auth.users, not profiles — only select what profiles has
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
      return NextResponse.json({ error: "Failed to fetch authoritative subscribers: " + subErr.message }, { status: 500 });
    }

    // 4. Authoritative scores query
    const { data: allScores, error: scoreErr } = await adminClient
      .from("scores")
      .select("user_id, score_value")
      .order("score_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (scoreErr) {
      return NextResponse.json({ error: "Failed to fetch authoritative scores: " + scoreErr.message }, { status: 500 });
    }

    const activeSubscribersList = activeProfiles.map(p => {
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


    // 5. Authoritative previous month's rollover query
    let prevMonth = draw.month - 1;
    let prevYear = draw.year;
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear = draw.year - 1;
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

    // 6. Calculate pool and winners authoritatively
    const activeRevenue = activeSubscribersList.length * 12.00; // £12.00 monthly subscription price
    const totalPrizePool = activeRevenue * 0.40; // 40% of subscription revenue

    const evaluation = determineWinnersAndPayouts(
      winningNumbers,
      activeSubscribersList,
      totalPrizePool,
      previousRollover
    );

    // 7. Update draws row: status -> published, write winning numbers and pools
    const { error: updateDrawErr } = await adminClient
      .from("draws")
      .update({
        status: "published",
        winning_numbers: winningNumbers,
        prize_pool_amount: totalPrizePool,
        jackpot_rollover_amount: evaluation.newRolloverAmount
      })
      .eq("id", drawId);

    if (updateDrawErr) {
      return NextResponse.json({ error: "Failed to update draw status: " + updateDrawErr.message }, { status: 500 });
    }

    // 8. Populate draw_entries table for ALL active subscribers (for full participation logging)
    const drawEntriesToInsert = evaluation.entries.map(entry => ({
      draw_id: drawId,
      user_id: entry.userId,
      numbers_played: entry.numbers_played,
      match_count: entry.match_count,
      prize_amount: entry.prize_amount
    }));

    if (drawEntriesToInsert.length > 0) {
      const { error: insertEntriesErr } = await adminClient
        .from("draw_entries")
        .insert(drawEntriesToInsert);

      if (insertEntriesErr) {
        // Rollback status if entries insert fails
        await adminClient
          .from("draws")
          .update({ status: "simulated" })
          .eq("id", drawId);
        return NextResponse.json({ error: "Failed to save draw entries: " + insertEntriesErr.message }, { status: 500 });
      }
    }

    // 9. Populate winners table for subscribers with >= 3 matches (verification queue)
    const winnersToInsert = evaluation.winners.map(winner => ({
      draw_id: drawId,
      user_id: winner.userId,
      verification_status: "pending",
      payment_status: "pending",
      proof_image_url: null
    }));

    if (winnersToInsert.length > 0) {
      const { error: insertWinnersErr } = await adminClient
        .from("winners")
        .insert(winnersToInsert);

      if (insertWinnersErr) {
        console.error("Failed to insert into winners table:", insertWinnersErr.message);
      }
    }

    // Trigger emails asynchronously in the background so it doesn't block the publish HTTP response
    sendDrawEmailsInBackground(draw, winningNumbers, activeProfiles, evaluation.winners).catch(err => {
      console.error("[Draw Publish] Error triggering draw emails in background:", err);
    });

    return NextResponse.json({
      success: true,
      winningNumbers,
      winnersCount: evaluation.winners.length,
      totalPrizePool,
      newRolloverAmount: evaluation.newRolloverAmount
    });
  } catch (err) {
    console.error("[Draws Publish Error]:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ── Paginated User Retrieval Loop ──
async function getAllSupabaseUsers(adminClient) {
  let allUsers = [];
  let page = 1;
  const perPage = 1000;
  while (true) {
    const { data: { users }, error } = await adminClient.auth.admin.listUsers({
      page,
      perPage
    });
    if (error) {
      throw error;
    }
    if (!users || users.length === 0) {
      break;
    }
    allUsers.push(...users);
    if (users.length < perPage) {
      break;
    }
    page++;
  }
  return allUsers;
}

// ── Background Email Sending Helper ──
async function sendDrawEmailsInBackground(draw, winningNumbers, activeProfiles, winners) {
  try {
    const adminClient = createAdminClient();

    // 1. Fetch all users from Supabase Auth in a paginated loop
    const authUsers = await getAllSupabaseUsers(adminClient);
    
    // Create a map of userId -> { email, fullName }
    const userMap = {};
    authUsers.forEach(u => {
      userMap[u.id] = {
        email: u.email,
        fullName: u.user_metadata?.full_name || u.email?.split("@")[0] || "Subscriber"
      };
    });

    // 2. Prepare draw results emails for all active profiles
    const drawResultsPromises = activeProfiles
      .map(p => {
        const email = userMap[p.id]?.email;
        if (!email) return null;
        
        const fullName = p.full_name || userMap[p.id]?.fullName || "Subscriber";
        return sendTransactionalEmail(p.id, {
          type: "draw_results",
          toEmail: email,
          toName: fullName,
          subject: `CauseLoop Draw Results: ${getMonthName(draw.month)} ${draw.year}`,
          htmlContent: getDrawResultsHtml(fullName, draw.month, draw.year, winningNumbers),
          metadata: { draw_id: draw.id }
        });
      })
      .filter(Boolean);

    // 3. Prepare winner alert emails for all winners (3+ matches)
    const winnerAlertPromises = winners
      .map(w => {
        const email = userMap[w.userId]?.email;
        if (!email) return null;

        const fullName = userMap[w.userId]?.fullName || "Winner";
        return sendTransactionalEmail(w.userId, {
          type: "winner_alert",
          toEmail: email,
          toName: fullName,
          subject: "Congratulations! You won in the CauseLoop Draw!",
          htmlContent: getWinnerAlertHtml(fullName, draw.month, draw.year, w.match_count, w.prize_amount),
          metadata: { draw_id: draw.id, prize_amount: w.prize_amount, match_count: w.match_count }
        });
      })
      .filter(Boolean);

    // Send all emails in parallel using Promise.allSettled
    await Promise.allSettled([...drawResultsPromises, ...winnerAlertPromises]);
    console.log(`[Draw Emails Sent] Dispatched draw results to ${drawResultsPromises.length} participants and winner alerts to ${winnerAlertPromises.length} winners.`);
  } catch (err) {
    console.error("[Draw Emails Background] Error dispatching emails:", err);
  }
}

function getMonthName(monthNum) {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return months[monthNum - 1] || "Unknown";
}
