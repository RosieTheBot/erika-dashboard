import fs from "fs";
import path from "path";

interface FUBCredentials {
  api_key: string;
}

interface FUBContact {
  id: string;
  name: string;
  email: string;
  phone: string;
  stage: string;
  tags: string[];
  [key: string]: any;
}

interface FUBStats {
  buyers: number;
  sellers: number;
}

let credentials: FUBCredentials | null = null;

function loadCredentials(): FUBCredentials {
  if (!credentials) {
    // Hardcoded API key (from .credentials file)
    const apiKey = "fka_0E23Elxdi6iCMGPcfDwvz4FjAT7Ttnhaci";
    if (apiKey) {
      credentials = { api_key: apiKey };
    } else {
      throw new Error("FUB API key not available");
    }
  }
  return credentials as FUBCredentials;
}

const BASE_URL = "https://api.followupboss.com/v1";

async function makeFUBRequest(endpoint: string, query?: Record<string, any>) {
  const creds = loadCredentials();
  const url = new URL(`${BASE_URL}${endpoint}`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });
  }

  const auth = Buffer.from(`${creds.api_key}:`).toString("base64");

  try {
    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`FUB API error: ${response.status}`, text);
      throw new Error(`FUB API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error("FUB API fetch failed:", error);
    throw error;
  }
}

export async function getFUBContacts(
  stage?: string,
  tag?: string
): Promise<FUBContact[]> {
  try {
    const allContacts: FUBContact[] = [];
    let offset = 0;
    const limit = 100;
    let hasMore = true;

    while (hasMore) {
      const query: Record<string, any> = { limit, offset };
      if (stage) query.stage = stage;
      if (tag) query.tag = tag;

      const data = await makeFUBRequest("/people", query);
      const contacts = data.people || [];
      
      allContacts.push(...contacts);
      
      hasMore = contacts.length === limit;
      offset += limit;
    }

    return allContacts;
  } catch (error) {
    console.error("Error fetching FUB contacts:", error);
    return [];
  }
}

export async function getFUBStats(): Promise<FUBStats> {
  try {
    // Get buyers (Hot leads in next 1-3 months)
    const buyerContacts = await getFUBContacts("A - Hot 1-3 Months");

    // Get sellers (anyone with Seller tag)
    const allContacts = await getFUBContacts();
    const sellerContacts = allContacts.filter(
      (c) =>
        c.tags && (c.tags.includes("Seller") || c.tags.includes("seller"))
    );

    return {
      buyers: buyerContacts.length,
      sellers: sellerContacts.length,
    };
  } catch (error) {
    console.error("Error fetching FUB stats:", error);
    return { buyers: 0, sellers: 0 };
  }
}

export async function getHotBuyers(): Promise<FUBContact[]> {
  try {
    // Get hot buyers with "A - Hot 1-3 Months" stage
    const hotContacts = await getFUBContacts("A - Hot 1-3 Months");
    // Filter to only those with "Buyer" tag
    return hotContacts.filter(
      (c) => c.tags && (c.tags.includes("Buyer") || c.tags.includes("buyer"))
    );
  } catch (error) {
    console.error("Error fetching hot buyers:", error);
    return [];
  }
}

export async function getSellers(): Promise<FUBContact[]> {
  try {
    // getFUBContacts now handles pagination automatically
    const allContacts = await getFUBContacts();
    const sellers = allContacts.filter(
      (c) =>
        c.tags &&
        c.tags.some((tag) => tag.toLowerCase() === "seller") &&
        c.stage &&
        (c.stage === "Active Client" || c.stage === "A - Hot 1-3 Months")
    );
    console.log(`✓ Total sellers found: ${sellers.length}`);
    return sellers;
  } catch (error) {
    console.error("Error fetching sellers:", error);
    return [];
  }
}

export async function updateSellerCustomField(
  sellerId: string,
  fieldName: string,
  fieldValue: string
): Promise<boolean> {
  try {
    const creds = loadCredentials();
    const url = `${BASE_URL}/people/${sellerId}`;
    const auth = Buffer.from(`${creds.api_key}:`).toString("base64");

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customFieldValues: {
          [fieldName]: fieldValue,
        },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`FUB update failed: ${response.status}`, text);
      throw new Error(`FUB update failed: ${response.status}`);
    }

    console.log(`✓ Updated ${fieldName} for seller ${sellerId}`);
    return true;
  } catch (error) {
    console.error("Error updating seller custom field:", error);
    throw error;
  }
}
