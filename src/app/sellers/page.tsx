import SellersView from "@/components/sections/SellersView";
import { getSellers } from "@/lib/fub";

interface Seller {
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
}

async function fetchSellers(): Promise<Seller[]> {
  try {
    // Call FUB library directly on server side
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

      // Format address from addresses array
      let address: string | undefined = undefined;
      if (contact.addresses && contact.addresses.length > 0) {
        const addr = contact.addresses[0];
        const parts = [addr.street, addr.city, addr.state, addr.code]
          .filter(p => p && p.trim())
          .join(", ");
        address = parts || undefined;
      }

      return {
        id: contact.id,
        name: contact.name,
        email: contact.email || "",
        phone: contact.phone || "",
        address: address,
        status: contact.stage || "Active",
        googleDriveFolder: contact.customFields?.googleDriveFolder || undefined,
        notes: contact.customFields?.notes || contact.notes || undefined,
        lastContact: lastContact || undefined,
        listingPrice: contact.customFields?.listingPrice || undefined,
        marketingStrategy: contact.customFields?.marketingStrategy || undefined,
        tags: contact.tags || [],
      };
    });
    
    console.log(`✓ Server-side: Fetched ${sellers.length} active sellers`);
    return sellers;
  } catch (error) {
    console.error("Error fetching sellers:", error instanceof Error ? error.message : String(error));
    return [];
  }
}

export default async function SellersPage() {
  const sellers = await fetchSellers();
  return <SellersView initialSellers={sellers} />;
}
