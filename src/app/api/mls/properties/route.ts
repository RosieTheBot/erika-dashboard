import { NextRequest, NextResponse } from "next/server"
import {
  loadCache,
  filterProperties,
  searchAddress,
  getStats,
  FilterOptions,
} from "@/lib/mlsgrid-cache"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    // Load cached properties
    const properties = loadCache()

    if (properties.length === 0) {
      return NextResponse.json({
        error: "MLS cache empty. Run sync first.",
        properties: [],
      })
    }

    // Parse filters
    const filters: FilterOptions = {}

    if (searchParams.has("postalCode")) {
      filters.postalCode = searchParams.get("postalCode") || undefined
    }
    if (searchParams.has("city")) {
      filters.city = searchParams.get("city") || undefined
    }
    if (searchParams.has("minPrice")) {
      filters.minPrice = parseInt(searchParams.get("minPrice") || "0")
    }
    if (searchParams.has("maxPrice")) {
      filters.maxPrice = parseInt(searchParams.get("maxPrice") || "999999999")
    }
    if (searchParams.has("minBeds")) {
      filters.minBeds = parseInt(searchParams.get("minBeds") || "0")
    }
    if (searchParams.has("maxBeds")) {
      filters.maxBeds = parseInt(searchParams.get("maxBeds") || "10")
    }
    if (searchParams.has("minBaths")) {
      filters.minBaths = parseFloat(searchParams.get("minBaths") || "0")
    }
    if (searchParams.has("maxBaths")) {
      filters.maxBaths = parseFloat(searchParams.get("maxBaths") || "10")
    }
    if (searchParams.has("status")) {
      filters.status = searchParams.get("status") || undefined
    }
    if (searchParams.has("propertyType")) {
      filters.propertyType = searchParams.get("propertyType") || undefined
    }

    // Apply filters
    let filtered = filterProperties(properties, filters)

    // Apply address search if provided
    if (searchParams.has("address")) {
      const address = searchParams.get("address")
      if (address) {
        filtered = searchAddress(filtered, address)
      }
    }

    // Pagination
    const limit = Math.min(
      parseInt(searchParams.get("limit") || "100"),
      1000
    )
    const offset = parseInt(searchParams.get("offset") || "0")
    const paginated = filtered.slice(offset, offset + limit)

    // Get stats
    const stats = getStats(filtered)

    return NextResponse.json({
      count: filtered.length,
      returned: paginated.length,
      offset,
      limit,
      stats,
      properties: paginated,
    })
  } catch (error) {
    console.error("Error fetching properties:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
