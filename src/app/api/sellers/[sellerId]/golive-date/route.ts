import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// GET /api/sellers/[sellerId]/golive-date - Get go-live date for a seller
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ sellerId: string }> }
) {
  try {
    const params = await context.params;
    const sellerId = params.sellerId;

    // Fetch go-live date for this seller from Supabase
    const { data, error } = await supabase
      .from("seller_golive_dates")
      .select("golive_date")
      .eq("seller_id", sellerId)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "not found" which is okay
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch go-live date" },
        { status: 500 }
      );
    }

    const goliveDate = data?.golive_date || "";

    return NextResponse.json({ goliveDate });
  } catch (error) {
    console.error("Error fetching go-live date:", error);
    return NextResponse.json(
      { error: "Failed to fetch go-live date" },
      { status: 500 }
    );
  }
}

// POST /api/sellers/[sellerId]/golive-date - Save go-live date for a seller
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ sellerId: string }> }
) {
  try {
    const params = await context.params;
    const sellerId = params.sellerId;
    const body = await request.json();
    const goliveDate = body.goliveDate || "";

    // Use upsert to insert or update
    const { error } = await supabase
      .from("seller_golive_dates")
      .upsert(
        {
          seller_id: sellerId,
          golive_date: goliveDate,
        },
        { onConflict: "seller_id" }
      );

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to save go-live date" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      goliveDate,
      message: `Saved go-live date ${goliveDate} for seller ${sellerId}`,
    });
  } catch (error) {
    console.error("Error saving go-live date:", error);
    return NextResponse.json(
      { error: "Failed to save go-live date" },
      { status: 500 }
    );
  }
}
