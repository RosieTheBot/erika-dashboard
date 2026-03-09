import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface TaskStatus {
  [taskId: string]: "Not Started" | "In Progress" | "Complete";
}

interface TaskData {
  [taskId: string]: {
    status: "Not Started" | "In Progress" | "Complete";
    dueDate?: string;
  };
}

// GET /api/sellers/[sellerId]/tasks - Get task statuses and due dates for a seller
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ sellerId: string }> }
) {
  try {
    const params = await context.params;
    const sellerId = params.sellerId;

    // Fetch all task statuses and due dates for this seller from Supabase
    const { data, error } = await supabase
      .from("task_statuses")
      .select("task_id, status, due_date")
      .eq("seller_id", sellerId);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch task statuses" },
        { status: 500 }
      );
    }

    // Convert array format to object format
    const tasks: TaskData = {};
    (data || []).forEach((row: any) => {
      tasks[row.task_id] = {
        status: row.status,
        dueDate: row.due_date,
      };
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("Error fetching task statuses:", error);
    return NextResponse.json(
      { error: "Failed to fetch task statuses" },
      { status: 500 }
    );
  }
}

// POST /api/sellers/[sellerId]/tasks - Save task statuses and due dates for a seller
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ sellerId: string }> }
) {
  try {
    const params = await context.params;
    const sellerId = params.sellerId;
    const body = await request.json();
    const tasks: TaskData = body.tasks || {};

    // Insert or update task statuses with due dates
    const rows = Object.entries(tasks).map(([taskId, taskData]) => {
      // Handle both old format (string status) and new format (object with status + dueDate)
      const status = typeof taskData === 'string' ? taskData : taskData.status;
      const dueDate = typeof taskData === 'string' ? undefined : taskData.dueDate;
      
      return {
        seller_id: sellerId,
        task_id: taskId,
        status: status,
        due_date: dueDate,
      };
    });

    // Use upsert to insert or update
    const { error } = await supabase
      .from("task_statuses")
      .upsert(rows, { onConflict: "seller_id,task_id" });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to save task statuses" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Saved ${Object.keys(tasks).length} task statuses for seller ${sellerId}`,
    });
  } catch (error) {
    console.error("Error saving task statuses:", error);
    return NextResponse.json(
      { error: "Failed to save task statuses" },
      { status: 500 }
    );
  }
}
