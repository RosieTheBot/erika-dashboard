import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// DELETE /api/sellers/[sellerId]/tasks/[taskId] - Delete a task for a seller
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ sellerId: string; taskId: string }> }
) {
  try {
    const params = await context.params;
    const { sellerId, taskId } = params;

    // Delete the task status record from Supabase
    const { error } = await supabase
      .from("task_statuses")
      .delete()
      .eq("seller_id", sellerId)
      .eq("task_id", taskId);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to delete task" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Deleted task ${taskId} for seller ${sellerId}`,
    });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
