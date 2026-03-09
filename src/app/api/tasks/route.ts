import { NextResponse, NextRequest } from "next/server";

interface TaskResponse {
  tasks?: Array<{
    id: string;
    title: string;
    description: string;
    dueDate: string;
    status: string;
    assignedTo: string;
    source?: string;
  }>;
  success?: boolean;
  error?: string;
}

// Mock data for MVP/testing
const MOCK_TASKS = [
  {
    id: "task_1",
    title: "Follow up with Sarah Chen - 2847 Barton",
    description: "Schedule showing for Sarah Chen's property",
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    status: "pending",
    assignedTo: "Erika",
    source: "manual",
  },
  {
    id: "task_2",
    title: "Prepare market analysis for David Parker",
    description: "Create CMA for pre-listing consultation",
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    status: "pending",
    assignedTo: "Erika",
    source: "manual",
  },
  {
    id: "task_3",
    title: "Send pre-approval checklist to James Morrison",
    description: "Get paperwork started",
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    status: "complete",
    assignedTo: "Erika",
    source: "manual",
  },
  {
    id: "task_4",
    title: "Update MLS listing for 405 E 6th Street",
    description: "Add new photos and amenities",
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    status: "pending",
    assignedTo: "Erika",
    source: "manual",
  },
];

export async function GET(): Promise<NextResponse<TaskResponse>> {
  try {
    // Return mock data for MVP/testing
    return NextResponse.json({ tasks: MOCK_TASKS });
  } catch (error) {
    console.error("Error in tasks endpoint:", error);
    return NextResponse.json({ tasks: MOCK_TASKS });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<TaskResponse>> {
  try {
    const body = await request.json();
    const { title, description, dueDate, status } = body;

    if (!title || !dueDate) {
      return NextResponse.json(
        { error: "Title and due date are required" },
        { status: 400 }
      );
    }

    // Task saved successfully
    // In production, this would persist to Google Sheets or a database
    // For now, tasks are stored client-side and in mock data
    console.log(`Task saved: ${title} (due ${dueDate})`);
    
    return NextResponse.json(
      { success: true },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving task:", error);
    return NextResponse.json(
      { error: "Failed to save task" },
      { status: 500 }
    );
  }
}
