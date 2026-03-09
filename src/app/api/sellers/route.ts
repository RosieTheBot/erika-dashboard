import { NextResponse } from "next/server";

interface SellerResponse {
  sellers: Array<{
    id: string;
    name: string;
    email: string;
    phone: string;
    address?: string;
    status: string;
    googleDriveFolder?: string;
    notes?: string;
    lastContact?: string;
    listingPrice?: string;
    marketingStrategy?: string;
    tags?: string[];
  }>;
  error?: string;
}

// Mock data for MVP/testing
const MOCK_SELLERS = [
  {
    id: "seller_1",
    name: "Elizabeth Thompson",
    email: "elizabeth.thompson@email.com",
    phone: "(512) 555-0201",
    address: "2847 Barton Hills Drive, Austin, TX 78704",
    status: "Active Listing",
    googleDriveFolder:
      "https://drive.google.com/drive/folders/mock-folder-1",
  },
  {
    id: "seller_2",
    name: "David Parker",
    email: "david.parker@email.com",
    phone: "(512) 555-0202",
    address: "405 East 6th Street, Austin, TX 78702",
    status: "Pre-Listing",
    googleDriveFolder:
      "https://drive.google.com/drive/folders/mock-folder-2",
  },
  {
    id: "seller_3",
    name: "Jennifer Williams",
    email: "jen.williams@email.com",
    phone: "(512) 555-0203",
    address: "1234 Lake Travis Drive, Spicewood, TX 78669",
    status: "Pending Close",
    googleDriveFolder:
      "https://drive.google.com/drive/folders/mock-folder-3",
  },
];

export async function GET(): Promise<NextResponse<SellerResponse>> {
  try {
    const { getSellers } = await import("@/lib/fub");
    const contacts = await getSellers();
    
    const sellers = contacts.map((contact: any) => {
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

      // Map status to workflow stages
      let status = "Active Client";
      if (contact.stage === "Closed") {
        status = "Closed";
      } else if (contact.stage === "Pending Close") {
        status = "Pending Close";
      } else if (contact.tags?.includes("Pre-Listing")) {
        status = "Pre-Listing";
      } else if (contact.tags?.includes("Active Listing")) {
        status = "Active Listing";
      }

      return {
        id: contact.id,
        name: contact.name,
        email: contact.email || "",
        phone: contact.phone || "",
        address: contact.customFields?.address || undefined,
        status,
        googleDriveFolder: contact.customFields?.googleDriveFolder || undefined,
        listingPrice: contact.customFields?.listingPrice || undefined,
        notes: contact.customFields?.notes || contact.notes || undefined,
        lastContact: lastContact || undefined,
        marketingStrategy: contact.customFields?.marketingStrategy || undefined,
        tags: contact.tags || [],
      };
    });
    
    return NextResponse.json({ sellers });
  } catch (error) {
    console.error("Error in sellers endpoint:", error);
    return NextResponse.json({ sellers: [], error: error instanceof Error ? error.message : "Failed to fetch sellers" });
  }
}
