import BuyersView from "@/components/sections/BuyersView";
import { getHotBuyers } from "@/lib/fub";

interface Buyer {
  id: string;
  name: string;
  email: string;
  phone: string;
  stage: string;
  budget?: string;
  propertyType?: string;
  area?: string;
  notes?: string;
  lastContact?: string;
  timeline?: string;
  investmentType?: string;
  tags?: string[];
  background?: string;
  propertyCriteria?: string;
  bedroomCount?: string;
  priceRange?: string;
}

async function fetchBuyers(): Promise<Buyer[]> {
  try {
    // Call FUB library directly on server side
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
        budget: contact.customFields?.budget || contact.customFields?.buyingBudget || undefined,
        propertyType: contact.customFields?.propertyType || contact.customFields?.propertyTypes || undefined,
        area: contact.customFields?.area || contact.customFields?.targetArea || undefined,
        timeline: contact.customFields?.timeline || undefined,
        investmentType: contact.customFields?.investmentType || contact.customFields?.type || undefined,
        notes: contact.customFields?.notes || contact.notes || undefined,
        background: contact.background || contact.customFields?.background || undefined,
        propertyCriteria: contact.customFields?.propertyCriteria || contact.customFields?.criteria || undefined,
        bedroomCount: contact.customFields?.bedrooms || contact.customFields?.bedroomPreference || undefined,
        priceRange: contact.customFields?.priceRange || contact.customFields?.budgetRange || undefined,
        lastContact: lastContact || undefined,
        tags: contact.tags || [],
      };
    });
    
    console.log(`✓ Server-side: Fetched ${buyers.length} hot buyers`);
    return buyers;
  } catch (error) {
    console.error("Error fetching buyers:", error instanceof Error ? error.message : String(error));
    return [];
  }
}

export default async function BuyersPage() {
  const buyers = await fetchBuyers();
  return <BuyersView initialBuyers={buyers} />;
}
