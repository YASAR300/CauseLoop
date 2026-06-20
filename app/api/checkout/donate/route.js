import { NextResponse } from "next/server";
import { getStripeServer } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

// Initialize admin Supabase to fetch charity details server-side
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey);

export async function POST(request) {
  try {
    const { charityId, amount, email } = await request.json();

    if (!charityId) {
      return NextResponse.json({ error: "Charity ID is required." }, { status: 400 });
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 1) {
      return NextResponse.json({ error: "Donation amount must be greater than £1." }, { status: 400 });
    }

    // Fetch the charity details to get the name
    const { data: charity, error: charityErr } = await supabase
      .from("charities")
      .select("name")
      .eq("id", charityId)
      .maybeSingle();

    if (charityErr || !charity) {
      return NextResponse.json({ error: "Charity not found." }, { status: 404 });
    }

    const stripe = getStripeServer();
    const origin = request.nextUrl.origin;

    // Build the line items for a one-time payment
    const sessionConfig = {
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: `One-off Donation to ${charity.name}`,
              description: `Direct one-off charitable contribution (non-subscriber gameplay).`
            },
            unit_amount: Math.round(parsedAmount * 100) // Stripe expects unit amount in pence/cents
          },
          quantity: 1
        }
      ],
      metadata: {
        type: "one_off_donation",
        charity_id: charityId,
        charity_name: charity.name,
        donation_amount: parsedAmount.toString()
      },
      success_url: `${origin}/charities?donation=success&charity=${encodeURIComponent(charity.name)}&amount=${parsedAmount}`,
      cancel_url: `${origin}/charities`
    };

    // If email is provided (for logged-in users or guest input), pre-populate customer email
    if (email) {
      sessionConfig.customer_email = email;
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[Donate Checkout POST Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
