import { NextRequest, NextResponse } from "next/server";
import { getGoogleSheetData } from "@/lib/google-drive";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const fileId = searchParams.get("fileId");

  if (!fileId) {
    return NextResponse.json(
      { error: "Please provide fileId parameter" },
      { status: 400 }
    );
  }

  try {
    const data = await getGoogleSheetData(fileId);
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error getting Google Sheet data:", error);
    return NextResponse.json(
      { error: "Failed to get Google Sheet data" },
      { status: 500 }
    );
  }
}
