import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const featured = searchParams.get("featured");

    const supabase = createAdminClient();

    if (id) {
      const { data: charity, error } = await supabase
        .from("charities")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      if (!charity) return NextResponse.json({ error: "Charity not found" }, { status: 404 });
      return NextResponse.json({ charity });
    }

    let query = supabase.from("charities").select("*");

    if (featured === "true") {
      query = query.eq("is_featured", true);
    } else {
      query = query.order("name", { ascending: true });
    }

    const { data: charities, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ charities });
  } catch (err) {
    console.error("[Public Charities GET Error]:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
