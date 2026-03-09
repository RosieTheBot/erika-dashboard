import { NextResponse } from "next/server";

interface BuyerResponse {
  buyers: Array<{
    id: string;
    name: string;
    email: string;
    phone: string;
    stage: string;
    budget?: string;
    propertyType?: string;
    area?: string;
    timeline?: string;
    investmentType?: string;
    notes?: string;
    lastContact?: string;
    tags?: string[];
  }>;
  error?: string;
}

// Mock data for MVP/testing
const MOCK_BUYERS = [
  {
    id: "buyer_1",
    name: "James Morrison",
    email: "james.morrison@email.com",
    phone: "(512) 555-0101",
    stage: "A-Hot 1-3 Months",
    budget: "$750,000 - $1,000,000",
    propertyType: "Single Family / Duplex",
    area: "South Austin",
  },
  {
    id: "buyer_2",
    name: "Sarah Chen",
    email: "sarah.chen@email.com",
    phone: "(512) 555-0102",
    stage: "A-Hot 1-3 Months",
    budget: "$500,000 - $750,000",
    propertyType: "STR / Multi-Unit",
    area: "Downtown / East Austin",
  },
  {
    id: "buyer_3",
    name: "Michael Rodriguez",
    email: "michael.r@email.com",
    phone: "(512) 555-0103",
    stage: "A-Hot 1-3 Months",
    budget: "$1,000,000+",
    propertyType: "Multi-Unit / Commercial",
    area: "Lake Travis / Hill Country",
  },
];

export async function GET(): Promise<NextResponse<BuyerResponse>> {
  try {
    const { getHotBuyers } = await import("@/lib/fub");
    const contacts = await getHotBuyers();
    
    const buyers = contacts.map((contact: any) => {
      // Format last contact date
      let lastContact = "";
      if (contact.lastTouchpoint) {
        const date = new Date(contact.lastTouchpoint);
        lastContact = date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
        });
      }

      return {
        id: contact.id,
        name: contact.name,
        email: contact.email || "",
        phone: contact.phone || "",
        stage: contact.stage || "A-Hot 1-3 Months",
        budget: contact.customFields?.budget || undefined,
        propertyType: contact.customFields?.propertyType || undefined,
        area: contact.customFields?.area || undefined,
        timeline: contact.customFields?.timeline || undefined,
        investmentType: contact.customFields?.investmentType || contact.customFields?.type || undefined,
        notes: contact.customFields?.notes || contact.notes || undefined,
        lastContact: lastContact || undefined,
        tags: contact.tags || [],
      };
    });
    
    return NextResponse.json({ buyers });
  } catch (error) {
    console.error("Error in buyers endpoint:", error);
    return NextResponse.json({ buyers: [], error: error instanceof Error ? error.message : "Failed to fetch buyers" });
  }
}
