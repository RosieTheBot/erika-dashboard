// MLS Grid API Integration
// Access Token: 93d6023282beffabbfd22b77483fd48c0bb0b682
// V2 URL: https://api.mlsgrid.com/v2

const MLS_GRID_API = "https://api.mlsgrid.com/v2"
const MLS_GRID_TOKEN = "93d6023282beffabbfd22b77483fd48c0bb0b682"

interface MLSProperty {
  id: string
  address: string
  listPrice: number
  bedrooms: number
  bathrooms: number
  sqft: number
  daysOnMarket: number
  status: string
  listingDate?: string
  soldDate?: string
  soldPrice?: number
  county?: string
  subdivision?: string
  propertyType?: string
  photos?: string[]
}

export async function searchMLS(
  address?: string,
  mlsNumber?: string,
  city?: string
): Promise<MLSProperty[]> {
  try {
    const params = new URLSearchParams()

    if (address) params.append("q", address)
    if (mlsNumber) params.append("resource", "Property")
    if (city) params.append("city", city)

    const response = await fetch(
      `${MLS_GRID_API}/search?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${MLS_GRID_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    )

    if (!response.ok) {
      throw new Error(`MLS Grid API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.results || []
  } catch (error) {
    console.error("MLS Grid search failed:", error)
    return []
  }
}

export async function getPropertyDetails(
  mlsNumber: string
): Promise<MLSProperty | null> {
  try {
    const response = await fetch(
      `${MLS_GRID_API}/Property/${mlsNumber}`,
      {
        headers: {
          Authorization: `Bearer ${MLS_GRID_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    )

    if (!response.ok) {
      throw new Error(`MLS Grid API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data || null
  } catch (error) {
    console.error("Failed to fetch property details:", error)
    return null
  }
}

export async function getComparables(
  address: string,
  bedrooms?: number,
  maxPrice?: number
): Promise<MLSProperty[]> {
  try {
    // Search for similar properties (comps)
    const params = new URLSearchParams()
    params.append("q", address)
    
    if (bedrooms) params.append("beds", bedrooms.toString())
    if (maxPrice) params.append("maxPrice", maxPrice.toString())

    const response = await fetch(
      `${MLS_GRID_API}/search?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${MLS_GRID_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    )

    if (!response.ok) {
      throw new Error(`MLS Grid API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.results || []
  } catch (error) {
    console.error("Failed to fetch comparables:", error)
    return []
  }
}
