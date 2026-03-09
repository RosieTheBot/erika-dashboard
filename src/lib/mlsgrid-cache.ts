// MLS Grid API Cache Layer
// Fetches and caches all properties locally, enables fast filtering

import fs from "fs"
import path from "path"

const MLS_GRID_API = "https://api.mlsgrid.com/v2"
const MLS_GRID_TOKEN = "93d6023282beffabbfd22b77483fd48c0bb0b682"
const CACHE_DIR = path.join(process.env.HOME || "/root", ".mls-cache")
const METADATA_FILE = path.join(CACHE_DIR, "metadata.json")

// Cache files split by ZIP code: properties-{zip}.json
const getCacheFilePath = (zip: string) => path.join(CACHE_DIR, `properties-${zip}.json`)

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true })
}

interface CacheMetadata {
  lastSyncTime: number
  totalProperties: number
  lastModificationTimestamp: string
}

export interface MLSProperty {
  ListingKey: string
  UnparsedAddress: string
  StreetNumber?: string
  StreetName?: string
  City?: string
  PostalCode?: string
  ListPrice?: number
  BedroomsTotal?: number
  BathroomsTotalInteger?: number
  LivingArea?: number
  LotSizeAcres?: number
  YearBuilt?: number
  StandardStatus?: string
  PropertyType?: string
  ModificationTimestamp?: string
  ListingContractDate?: string
  CountyName?: string
  [key: string]: any
}

export async function syncMLSCache(): Promise<{
  synced: number
  total: number
  duration: number
}> {
  const startTime = Date.now()
  console.log("Starting MLS cache sync...")

  let allProperties: MLSProperty[] = []
  let url = `${MLS_GRID_API}/Property?$top=5000`
  let pageCount = 0
  let lastModificationTimestamp = ""

  try {
    while (url) {
      pageCount++
      console.log(`Fetching page ${pageCount}...`)

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${MLS_GRID_TOKEN}`,
          "Content-Type": "application/json",
          "Accept-Encoding": "gzip",
        },
        signal: AbortSignal.timeout(60000), // 60 second timeout per request
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()

      if (data.value && data.value.length > 0) {
        allProperties = [...allProperties, ...data.value]
        
        // Track latest modification timestamp for future incremental syncs
        if (data.value[0].ModificationTimestamp) {
          lastModificationTimestamp = data.value[0].ModificationTimestamp
        }
      }

      // Check for next page
      url = data["@odata.nextLink"]
      
      // Safety limit to prevent infinite loops
      if (pageCount > 50) {
        console.warn("Reached page limit (50), stopping sync")
        break
      }
    }

    // Group properties by ZIP code and save separately
    const propertiesByZip: { [zip: string]: MLSProperty[] } = {}
    allProperties.forEach((prop) => {
      const zip = prop.PostalCode || "unknown"
      if (!propertiesByZip[zip]) {
        propertiesByZip[zip] = []
      }
      propertiesByZip[zip].push(prop)
    })

    // Write each ZIP to its own file
    let successCount = 0
    Object.entries(propertiesByZip).forEach(([zip, props]) => {
      try {
        const filePath = getCacheFilePath(zip)
        fs.writeFileSync(filePath, JSON.stringify(props, null, 2))
        successCount++
      } catch (err) {
        console.error(`Failed to write cache for ZIP ${zip}:`, err)
      }
    })

    console.log(`💾 Saved ${successCount}/${Object.keys(propertiesByZip).length} ZIP code files`)

    // Save metadata
    try {
      const metadata: CacheMetadata = {
        lastSyncTime: Date.now(),
        totalProperties: allProperties.length,
        lastModificationTimestamp,
      }
      fs.writeFileSync(METADATA_FILE, JSON.stringify(metadata, null, 2))
    } catch (err) {
      console.error("Failed to write metadata:", err)
    }

    const duration = Date.now() - startTime
    console.log(
      `✅ Synced ${allProperties.length} properties in ${(duration / 1000).toFixed(1)}s`
    )

    return {
      synced: allProperties.length,
      total: allProperties.length,
      duration,
    }
  } catch (error) {
    console.error("Sync failed:", error)
    throw error
  }
}

export function getMetadata(): CacheMetadata | null {
  try {
    if (!fs.existsSync(METADATA_FILE)) return null
    const data = fs.readFileSync(METADATA_FILE, "utf-8")
    return JSON.parse(data)
  } catch {
    return null
  }
}

export function loadCache(): MLSProperty[] {
  try {
    if (!fs.existsSync(CACHE_DIR)) return []
    
    const files = fs.readdirSync(CACHE_DIR)
    const propertyFiles = files.filter((f) => f.startsWith("properties-") && f.endsWith(".json"))
    
    const allProperties: MLSProperty[] = []
    propertyFiles.forEach((file) => {
      const filePath = path.join(CACHE_DIR, file)
      const data = fs.readFileSync(filePath, "utf-8")
      const props = JSON.parse(data)
      allProperties.push(...props)
    })
    
    return allProperties
  } catch (error) {
    console.error("Error loading cache:", error)
    return []
  }
}

export interface FilterOptions {
  postalCode?: string
  city?: string
  minPrice?: number
  maxPrice?: number
  minBeds?: number
  maxBeds?: number
  minBaths?: number
  maxBaths?: number
  propertyType?: string
  status?: string
  yearBuiltMin?: number
  yearBuiltMax?: number
  minSqft?: number
  maxSqft?: number
}

export function filterProperties(
  properties: MLSProperty[],
  filters: FilterOptions
): MLSProperty[] {
  return properties.filter((prop) => {
    if (filters.postalCode && prop.PostalCode !== filters.postalCode)
      return false
    if (filters.city && prop.City !== filters.city) return false

    const price = prop.ListPrice || 0
    if (filters.minPrice && price < filters.minPrice) return false
    if (filters.maxPrice && price > filters.maxPrice) return false

    const beds = prop.BedroomsTotal || 0
    if (filters.minBeds && beds < filters.minBeds) return false
    if (filters.maxBeds && beds > filters.maxBeds) return false

    const baths = prop.BathroomsTotalInteger || 0
    if (filters.minBaths && baths < filters.minBaths) return false
    if (filters.maxBaths && baths > filters.maxBaths) return false

    if (filters.propertyType && prop.PropertyType !== filters.propertyType)
      return false
    if (filters.status && prop.StandardStatus !== filters.status) return false

    const yearBuilt = prop.YearBuilt || 0
    if (filters.yearBuiltMin && yearBuilt < filters.yearBuiltMin) return false
    if (filters.yearBuiltMax && yearBuilt > filters.yearBuiltMax) return false

    const sqft = prop.LivingArea || 0
    if (filters.minSqft && sqft < filters.minSqft) return false
    if (filters.maxSqft && sqft > filters.maxSqft) return false

    return true
  })
}

export function searchAddress(
  properties: MLSProperty[],
  searchTerm: string
): MLSProperty[] {
  const term = searchTerm.toLowerCase()
  return properties.filter((prop) => {
    const address = (prop.UnparsedAddress || "").toLowerCase()
    const street = (prop.StreetName || "").toLowerCase()
    return address.includes(term) || street.includes(term)
  })
}

export function getComparables(
  properties: MLSProperty[],
  targetProperty: MLSProperty,
  radius: "tight" | "moderate" | "wide" = "moderate"
): MLSProperty[] {
  const bedRange =
    radius === "tight"
      ? { min: targetProperty.BedroomsTotal, max: targetProperty.BedroomsTotal }
      : radius === "moderate"
        ? {
            min: (targetProperty.BedroomsTotal || 1) - 1,
            max: (targetProperty.BedroomsTotal || 1) + 1,
          }
        : {
            min: Math.max((targetProperty.BedroomsTotal || 1) - 2, 0),
            max: (targetProperty.BedroomsTotal || 1) + 2,
          }

  const priceRange =
    radius === "tight"
      ? {
          min: (targetProperty.ListPrice || 0) * 0.9,
          max: (targetProperty.ListPrice || 0) * 1.1,
        }
      : radius === "moderate"
        ? {
            min: (targetProperty.ListPrice || 0) * 0.8,
            max: (targetProperty.ListPrice || 0) * 1.2,
          }
        : {
            min: (targetProperty.ListPrice || 0) * 0.7,
            max: (targetProperty.ListPrice || 0) * 1.3,
          }

  return filterProperties(properties, {
    postalCode: targetProperty.PostalCode,
    minBeds: bedRange.min,
    maxBeds: bedRange.max,
    minPrice: priceRange.min,
    maxPrice: priceRange.max,
    status: "Closed", // Comps should be closed sales
  })
}

export function getStats(properties: MLSProperty[]) {
  if (properties.length === 0) {
    return {
      count: 0,
      avgPrice: 0,
      avgBeds: 0,
      avgBaths: 0,
      avgSqft: 0,
      minPrice: 0,
      maxPrice: 0,
    }
  }

  const totalPrice = properties.reduce((sum, p) => sum + (p.ListPrice || 0), 0)
  const totalBeds = properties.reduce((sum, p) => sum + (p.BedroomsTotal || 0), 0)
  const totalBaths = properties.reduce(
    (sum, p) => sum + (p.BathroomsTotalInteger || 0),
    0
  )
  const totalSqft = properties.reduce((sum, p) => sum + (p.LivingArea || 0), 0)

  return {
    count: properties.length,
    avgPrice: Math.round(totalPrice / properties.length),
    avgBeds: (totalBeds / properties.length).toFixed(1),
    avgBaths: (totalBaths / properties.length).toFixed(1),
    avgSqft: Math.round(totalSqft / properties.length),
    minPrice: Math.min(...properties.map((p) => p.ListPrice || 0)),
    maxPrice: Math.max(...properties.map((p) => p.ListPrice || 0)),
  }
}
