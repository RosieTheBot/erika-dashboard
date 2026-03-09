import { NextRequest, NextResponse } from "next/server"
import { syncMLSCache, getMetadata } from "@/lib/mlsgrid-cache"

let syncInProgress = false

export async function POST(request: NextRequest) {
  try {
    if (syncInProgress) {
      return NextResponse.json(
        {
          success: false,
          message: "Sync already in progress",
        },
        { status: 409 }
      )
    }

    syncInProgress = true
    console.log("Starting MLS cache sync...")

    // Start sync but don't wait for it - respond immediately
    syncMLSCache()
      .then((result) => {
        console.log(`✅ Sync completed: ${result.synced} properties in ${(result.duration / 1000).toFixed(1)}s`)
      })
      .catch((error) => {
        console.error("Async sync failed:", error)
      })
      .finally(() => {
        syncInProgress = false
      })

    return NextResponse.json({
      success: true,
      message: "MLS cache sync started (running asynchronously)",
      status: "in_progress",
    })
  } catch (error) {
    syncInProgress = false
    console.error("Sync initiation failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const metadata = getMetadata()

    if (!metadata) {
      return NextResponse.json({
        synced: false,
        message: "No cached data available. Run POST to sync.",
      })
    }

    const lastSyncDate = new Date(metadata.lastSyncTime).toLocaleString()

    return NextResponse.json({
      synced: true,
      totalProperties: metadata.totalProperties,
      lastSyncTime: lastSyncDate,
      lastModificationTimestamp: metadata.lastModificationTimestamp,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
