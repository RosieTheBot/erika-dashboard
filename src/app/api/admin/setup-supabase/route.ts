import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export async function POST() {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    // Test if table exists
    const { data, error: testError } = await supabase
      .from("seller_golive_dates")
      .select("*")
      .limit(0);

    if (testError && testError.code === "PGRST205") {
      // Table doesn't exist - need to create it manually
      return NextResponse.json(
        {
          status: "error",
          message:
            "seller_golive_dates table does not exist. Please create it manually.",
          instructions: `Run this SQL in your Supabase dashboard (https://app.supabase.com):

CREATE TABLE IF NOT EXISTS seller_golive_dates (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  seller_id TEXT NOT NULL UNIQUE,
  golive_date TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE seller_golive_dates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations on seller_golive_dates" ON seller_golive_dates;
CREATE POLICY "Allow all operations on seller_golive_dates" ON seller_golive_dates 
FOR ALL USING (true) WITH CHECK (true);`,
        },
        { status: 400 }
      );
    }

    if (testError && testError.code !== "PGRST116") {
      throw testError;
    }

    // Table exists
    return NextResponse.json({
      status: "success",
      message: "seller_golive_dates table already exists and is accessible",
    });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json(
      {
        status: "error",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
