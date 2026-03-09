import { NextRequest, NextResponse } from "next/server"
import { generateTasksForSeller } from "@/lib/listing-tasks"
import { getSellers, updateSellerCustomField } from "@/lib/fub"

export async function GET(request: NextRequest) {
  const sellerId = request.nextUrl.searchParams.get("sellerId")

  if (!sellerId) {
    return NextResponse.json(
      { error: "sellerId required" },
      { status: 400 }
    )
  }

  try {
    const sellers = await getSellers()
    const seller = sellers.find((s: any) => s.id === sellerId)

    if (!seller) {
      return NextResponse.json(
        { error: "Seller not found" },
        { status: 404 }
      )
    }

    const preListingDate = seller.customFields?.preListingChatDate || null
    const goLiveDate = seller.customFields?.goLiveDate || null
    const isST = seller.tags?.includes("strseller") ? true : false

    const tasks = generateTasksForSeller(preListingDate, goLiveDate)

    return NextResponse.json({
      sellerId: seller.id,
      sellerName: seller.name,
      propertyAddress: seller.customFields?.address,
      preListingDate,
      goLiveDate,
      isSTRSeller: isST,
      tasks,
    })
  } catch (error) {
    console.error("Error fetching seller tasks:", error)
    return NextResponse.json(
      { error: "Failed to fetch seller tasks" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sellerId, goLiveDate } = body

    if (!sellerId || !goLiveDate) {
      return NextResponse.json(
        { error: "sellerId and goLiveDate required" },
        { status: 400 }
      )
    }

    // Update FUB with the go-live date
    await updateSellerCustomField(sellerId, "goLiveDate", goLiveDate)

    return NextResponse.json({
      success: true,
      message: "Go-live date updated",
      goLiveDate,
    })
  } catch (error) {
    console.error("Error updating go-live date:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update" },
      { status: 500 }
    )
  }
}
