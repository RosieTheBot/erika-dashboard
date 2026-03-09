import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export async function POST(request: NextRequest) {
  try {
    // Try to execute SQL via Supabase's pg_net extension
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sql: "ALTER TABLE task_statuses ADD COLUMN IF NOT EXISTS due_date TEXT;",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Fallback: Return manual instruction
      console.log("SQL execution not available via RPC:", data);
      
      // Try direct HTTP request to SQL endpoint (may not exist)
      return NextResponse.json(
        {
          success: false,
          rpcError: data,
          message:
            "Could not execute SQL via RPC. Run this manually in Supabase dashboard:",
          sql: "ALTER TABLE task_statuses ADD COLUMN IF NOT EXISTS due_date TEXT;",
          dashboard:
            "https://supabase.com/dashboard/project/qkdhcwwdldkimytghozu/sql",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "✓ Migration completed: due_date column added to task_statuses",
      data,
    });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      {
        success: false,
        error: String(error),
        sql: "ALTER TABLE task_statuses ADD COLUMN IF NOT EXISTS due_date TEXT;",
        dashboard:
          "https://supabase.com/dashboard/project/qkdhcwwdldkimytghozu/sql",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "POST to this endpoint to run the migration",
    sql: "ALTER TABLE task_statuses ADD COLUMN IF NOT EXISTS due_date TEXT;",
  });
}
