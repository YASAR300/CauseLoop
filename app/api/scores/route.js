import { NextResponse } from "next/server";
import { createServerClient, createAdminClient, ensureUserProfile } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// ── GET: FETCH ALL USER SCORES ──────────────────────────────────────────────
export async function GET(request) {
  try {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureUserProfile(user);

    // Display all user's scores sorted in strict reverse chronological order (most recent first)
    const { data: scores, error } = await supabase
      .from("scores")
      .select("*")
      .eq("user_id", user.id)
      .order("score_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Scores GET Error]:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ scores });
  } catch (err) {
    console.error("[Scores GET Server Error]:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ── POST: ADD NEW SCORE (ROLLING 5-SCORE TRANSACTION WITH VALIDATIONS) ──────
export async function POST(request) {
  try {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureUserProfile(user);

    const { scoreValue, scoreDate } = await request.json();

    // 1. Client-side and server-side range validation (strictly between 1 and 45)
    const scoreVal = parseInt(scoreValue, 10);
    if (isNaN(scoreVal) || scoreVal < 1 || scoreVal > 45) {
      return NextResponse.json({ error: "invalid_range", message: "Stableford score must be strictly between 1 and 45." }, { status: 400 });
    }

    if (!scoreDate) {
      return NextResponse.json({ error: "missing_date", message: "A valid date is required." }, { status: 400 });
    }

    // Formatted date validation (YYYY-MM-DD check)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(scoreDate) || isNaN(Date.parse(scoreDate))) {
      return NextResponse.json({ error: "invalid_date", message: "Please provide a valid date in YYYY-MM-DD format." }, { status: 400 });
    }

    // Try calling the atomic RPC Postgres function first
    const { data: rpcData, error: rpcError } = await supabase.rpc("insert_golf_score", {
      user_id_param: user.id,
      score_value_param: scoreVal,
      score_date_param: scoreDate
    });

    if (rpcError) {
      const errorMsg = rpcError.message || "";
      
      // Handle explicit duplicate date exception from RPC
      if (errorMsg.includes("Duplicate date") || rpcError.code === "23505") {
        // Fetch the existing score for this date to guide the user towards edit/delete
        const { data: existingScore } = await supabase
          .from("scores")
          .select("id, score_value")
          .eq("user_id", user.id)
          .eq("score_date", scoreDate)
          .maybeSingle();

        return NextResponse.json({
          error: "duplicate_date",
          message: `A score of ${existingScore ? existingScore.score_value : ""} already exists for ${scoreDate}.`,
          existingScoreId: existingScore?.id
        }, { status: 409 });
      }

      // Handle RPC range exception
      if (errorMsg.includes("Score must be between 1 and 45")) {
        return NextResponse.json({ error: "invalid_range", message: "Stableford score must be strictly between 1 and 45." }, { status: 400 });
      }

      // If RPC is missing (i.e. migrations not run yet), execute the identical logic as a JS transaction fallback
      if (rpcError.code === "3F000" || errorMsg.includes("does not exist") || rpcError.code === "42883") {
        console.warn("[RPC Fallback]: insert_golf_score RPC not found. Executing JS transaction fallback.");
        
        // JS FALLBACK TRANSACTION:
        // A. Check for duplicate dates
        const { data: existing } = await supabase
          .from("scores")
          .select("id, score_value")
          .eq("user_id", user.id)
          .eq("score_date", scoreDate)
          .maybeSingle();

        if (existing) {
          return NextResponse.json({
            error: "duplicate_date",
            message: `A score of ${existing.score_value} already exists for ${scoreDate}.`,
            existingScoreId: existing.id
          }, { status: 409 });
        }

        // B. Fetch all user scores to evaluate rolling replacement limit of 5
        const { data: allScores } = await supabase
          .from("scores")
          .select("id, score_date, created_at")
          .eq("user_id", user.id)
          .order("score_date", { ascending: true })
          .order("created_at", { ascending: true });

        // C. If user already has 5 or more scores, delete the single oldest one first
        if (allScores && allScores.length >= 5) {
          const oldestScore = allScores[0];
          const { error: deleteError } = await supabase
            .from("scores")
            .delete()
            .eq("id", oldestScore.id);

          if (deleteError) {
            console.error("[JS Fallback Delete Error]:", deleteError);
            return NextResponse.json({ error: deleteError.message }, { status: 500 });
          }
        }

        // D. Insert the new score
        const { data: inserted, error: insertError } = await supabase
          .from("scores")
          .insert({
            user_id: user.id,
            score_value: scoreVal,
            score_date: scoreDate
          })
          .select()
          .single();

        if (insertError) {
          console.error("[JS Fallback Insert Error]:", insertError);
          return NextResponse.json({ error: insertError.message }, { status: 500 });
        }

        return NextResponse.json({ score: inserted });
      }

      console.error("[Scores POST RPC Error]:", rpcError);
      return NextResponse.json({ error: rpcError.message }, { status: 500 });
    }

    return NextResponse.json({ score: rpcData });
  } catch (err) {
    console.error("[Scores POST Server Error]:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ── PATCH: EDIT AN EXISTING SCORE ──────────────────────────────────────────
export async function PATCH(request) {
  try {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureUserProfile(user);

    const { id, scoreValue, scoreDate } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "missing_id", message: "Score ID is required to update." }, { status: 400 });
    }

    // 1. Range validation (strictly between 1 and 45)
    const scoreVal = parseInt(scoreValue, 10);
    if (isNaN(scoreVal) || scoreVal < 1 || scoreVal > 45) {
      return NextResponse.json({ error: "invalid_range", message: "Stableford score must be strictly between 1 and 45." }, { status: 400 });
    }

    if (!scoreDate) {
      return NextResponse.json({ error: "missing_date", message: "A valid date is required." }, { status: 400 });
    }

    // 2. Validate that the score exists and belongs to the user (enforced ownership)
    const { data: currentScore, error: fetchError } = await supabase
      .from("scores")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (fetchError || !currentScore) {
      return NextResponse.json({ error: "not_found", message: "Score record not found or access denied." }, { status: 404 });
    }

    // 3. Duplicate check: If changing the date, ensure no other score exists for this date
    if (currentScore.score_date !== scoreDate) {
      const { data: duplicateDateScore } = await supabase
        .from("scores")
        .select("id")
        .eq("user_id", user.id)
        .eq("score_date", scoreDate)
        .neq("id", id)
        .maybeSingle();

      if (duplicateDateScore) {
        return NextResponse.json({
          error: "duplicate_date",
          message: `A score already exists for ${scoreDate}.`,
          existingScoreId: duplicateDateScore.id
        }, { status: 409 });
      }
    }

    // 4. Update the score row
    const { data: updated, error: updateError } = await supabase
      .from("scores")
      .update({
        score_value: scoreVal,
        score_date: scoreDate
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (updateError) {
      console.error("[Scores PATCH Error]:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ score: updated });
  } catch (err) {
    console.error("[Scores PATCH Server Error]:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ── DELETE: REMOVE AN EXISTING SCORE ────────────────────────────────────────
export async function DELETE(request) {
  try {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureUserProfile(user);

    const { searchParams } = request.nextUrl;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "missing_id", message: "Score ID is required to delete." }, { status: 400 });
    }

    // Validate that the score exists and belongs to the user before deletion
    const { data: currentScore, error: fetchError } = await supabase
      .from("scores")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (fetchError || !currentScore) {
      return NextResponse.json({ error: "not_found", message: "Score record not found or access denied." }, { status: 404 });
    }

    const { error: deleteError } = await supabase
      .from("scores")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("[Scores DELETE Error]:", deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Score successfully deleted." });
  } catch (err) {
    console.error("[Scores DELETE Server Error]:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
