import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

interface ProcedureResponse {
  procedures: Array<{
    name: string;
    title: string;
    path: string;
  }>;
  error?: string;
}

export async function GET(): Promise<NextResponse<ProcedureResponse>> {
  try {
    const workflowDir = path.join(
      process.env.HOME || "/Users/rosiejetson",
      ".openclaw/workspace/memory/workflows"
    );

    if (!fs.existsSync(workflowDir)) {
      return NextResponse.json({ procedures: [] });
    }

    const files = fs.readdirSync(workflowDir);
    const procedures = files
      .filter((f) => f.endsWith(".md") || f.endsWith(".txt"))
      .map((f) => ({
        name: f.replace(/\.(md|txt)$/, ""),
        title: f.replace(/\.(md|txt)$/, "").replace(/-/g, " "),
        path: `/memory/workflows/${f}`,
      }));

    return NextResponse.json({ procedures });
  } catch (error) {
    console.error("Error fetching procedures:", error);
    return NextResponse.json(
      { procedures: [], error: "Failed to fetch procedures" },
      { status: 500 }
    );
  }
}
