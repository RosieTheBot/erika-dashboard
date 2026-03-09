// Listing task template system
// Calculates task due dates based on pre-listing chat date and go-live date

export interface ListingTask {
  id: string;
  title: string;
  description?: string;
  daysFromAnchor: number; // negative = before anchor, 0 = on anchor, positive = after
  anchor: "pre-listing" | "go-live";
  dueDate?: string;
  status: "Not Started" | "In Progress" | "Complete";
  isCustom: boolean;
}

// Pre-listing chat tasks (3 days before pre-listing chat)
const PRE_LISTING_TASKS: Omit<ListingTask, "dueDate" | "status" | "id">[] = [
  {
    title: "Research property",
    description: "Gather property history, market data, and comparable sales",
    daysFromAnchor: -3,
    anchor: "pre-listing",
    isCustom: false,
  },
  {
    title: "Run comps",
    description: "Complete comparable market analysis",
    daysFromAnchor: -3,
    anchor: "pre-listing",
    isCustom: false,
  },
  {
    title: "Prepare comp/market status portal",
    description: "Create market analysis portal (awaiting comp data from you)",
    daysFromAnchor: -3,
    anchor: "pre-listing",
    isCustom: false,
  },
  {
    title: "Pre-listing property visit",
    description: "Go to property with pre-listing checklist",
    daysFromAnchor: 0,
    anchor: "pre-listing",
    isCustom: false,
  },
];

// Go-live dependent tasks (calculated from go-live date)
const GO_LIVE_TASKS: Omit<ListingTask, "dueDate" | "status" | "id">[] = [
  // Documentation & Setup (after pre-listing, before scheduling)
  {
    title: "Send listing agreement, IABS, disclosures via DocuSign",
    description: "Send to sellers for signature",
    daysFromAnchor: -15,
    anchor: "go-live",
    isCustom: false,
  },
  {
    title: "Send disclosures via Seller's Shield",
    description: "Provide required property disclosures",
    daysFromAnchor: -15,
    anchor: "go-live",
    isCustom: false,
  },
  {
    title: "Create listing folder in Dropbox",
    description: "Set up folder structure for documents",
    daysFromAnchor: -15,
    anchor: "go-live",
    isCustom: false,
  },
  {
    title: "Upload signed agreements to Dropbox",
    description: "Store signed DocuSign documents",
    daysFromAnchor: -14,
    anchor: "go-live",
    isCustom: false,
  },
  {
    title: "Send 'Next Steps' canned email",
    description: "Follow-up email with listing process timeline",
    daysFromAnchor: -14,
    anchor: "go-live",
    isCustom: false,
  },
  {
    title: "Create property notes Google Doc",
    description: "Document property details and notes",
    daysFromAnchor: -14,
    anchor: "go-live",
    isCustom: false,
  },
  {
    title: "Upload additional property documents",
    description: "Store seller-provided docs in Dropbox",
    daysFromAnchor: -14,
    anchor: "go-live",
    isCustom: false,
  },
  {
    title: "Open title & determine HOA fees/resale certs",
    description: "Get title info and HOA turnaround times",
    daysFromAnchor: -14,
    anchor: "go-live",
    isCustom: false,
  },
  {
    title: "Determine if ECAD is needed (Austin only)",
    description: "Check if Environmental Criteria & Assessment needed",
    daysFromAnchor: -13,
    anchor: "go-live",
    isCustom: false,
  },
  {
    title: "Get ECAD quotes if needed",
    description: "Obtain and review quotes",
    daysFromAnchor: -12,
    anchor: "go-live",
    isCustom: false,
  },
  {
    title: "Determine showing protocols & offer terms",
    description: "Clarify notice needed and preferred offer terms",
    daysFromAnchor: -12,
    anchor: "go-live",
    isCustom: false,
  },
  // Scheduling
  {
    title: "Schedule maids",
    description: "Book cleaning service",
    daysFromAnchor: -10,
    anchor: "go-live",
    isCustom: false,
  },
  {
    title: "Schedule staging",
    description: "Book staging service if needed",
    daysFromAnchor: -8,
    anchor: "go-live",
    isCustom: false,
  },
  {
    title: "Schedule photographer",
    description: "Book photographer (JPM Real Estate Photography, DHMedia)",
    daysFromAnchor: -7,
    anchor: "go-live",
    isCustom: false,
  },
  {
    title: "Send photo prep list to clients",
    description: "Inform clients of maid, stager, photographer arrivals",
    daysFromAnchor: -7,
    anchor: "go-live",
    isCustom: false,
  },
  // MLS & Marketing Prep
  {
    title: "Input listing to MLS (as incomplete)",
    description: "Start MLS listing entry",
    daysFromAnchor: -6,
    anchor: "go-live",
    isCustom: false,
  },
  {
    title: "Upload documents to MLS",
    description: "Add documents and disclosures to MLS",
    daysFromAnchor: -5,
    anchor: "go-live",
    isCustom: false,
  },
  {
    title: "Create draft of brochure",
    description: "Design property brochure",
    daysFromAnchor: -5,
    anchor: "go-live",
    isCustom: false,
  },
  {
    title: "Create draft of property website",
    description: "Build property-specific landing page",
    daysFromAnchor: -5,
    anchor: "go-live",
    isCustom: false,
  },
  {
    title: "Marketing drafts ready",
    description: "Finalize brochure, website, social graphics",
    daysFromAnchor: -4,
    anchor: "go-live",
    isCustom: false,
  },
  {
    title: "Upload photos to Dropbox",
    description: "Store photos for easy access",
    daysFromAnchor: -3,
    anchor: "go-live",
    isCustom: false,
  },
  {
    title: "Add photos to website, brochure, MLS",
    description: "Integrate photos into all marketing materials",
    daysFromAnchor: -3,
    anchor: "go-live",
    isCustom: false,
  },
  {
    title: "Send property brochure to printer",
    description: "Order printed brochures",
    daysFromAnchor: -3,
    anchor: "go-live",
    isCustom: false,
  },
  {
    title: "Create property binder",
    description: "Assemble binder with brochure, disclosures, survey, floorplan",
    daysFromAnchor: -2,
    anchor: "go-live",
    isCustom: false,
  },
  {
    title: "Final cleaning & staging prep",
    description: "Final preparations before photos",
    daysFromAnchor: -2,
    anchor: "go-live",
    isCustom: false,
  },
  {
    title: "Create coming soon social graphic",
    description: "Design coming soon posts",
    daysFromAnchor: -2,
    anchor: "go-live",
    isCustom: false,
  },
  {
    title: "Post coming soon to social",
    description: "Post coming soon graphics to Instagram, Facebook",
    daysFromAnchor: -1,
    anchor: "go-live",
    isCustom: false,
  },
  {
    title: "Post coming soon to relevant FB groups",
    description: "Share in Facebook community groups",
    daysFromAnchor: -1,
    anchor: "go-live",
    isCustom: false,
  },
  {
    title: "Install sign and lockbox",
    description: "Install yard sign and install/program lockbox",
    daysFromAnchor: -1,
    anchor: "go-live",
    isCustom: false,
  },
  {
    title: "Drop off property binder and brochures",
    description: "Leave materials at property",
    daysFromAnchor: -1,
    anchor: "go-live",
    isCustom: false,
  },
  // Go Live
  {
    title: "Go live in MLS",
    description: "Activate listing in MLS system",
    daysFromAnchor: 0,
    anchor: "go-live",
    isCustom: false,
  },
  {
    title: "Assign lockbox to listing",
    description: "Link lockbox code to MLS",
    daysFromAnchor: 0,
    anchor: "go-live",
    isCustom: false,
  },
  {
    title: "Share just-listed on social & agent groups",
    description: "Post just-listed to Realtor FB groups, Instagram, etc.",
    daysFromAnchor: 0,
    anchor: "go-live",
    isCustom: false,
  },
  {
    title: "Send just-listed email blast",
    description: "Email notification to contacts",
    daysFromAnchor: 0,
    anchor: "go-live",
    isCustom: false,
  },
  // Post-Go-Live
  {
    title: "Schedule open house",
    description: "Set date/time for open house",
    daysFromAnchor: 1,
    anchor: "go-live",
    isCustom: false,
  },
  {
    title: "Schedule property tours",
    description: "Coordinate agent showings",
    daysFromAnchor: 1,
    anchor: "go-live",
    isCustom: false,
  },
  {
    title: "Reach out for feedback from showing agents",
    description: "Request feedback from agents who showed property",
    daysFromAnchor: 5,
    anchor: "go-live",
    isCustom: false,
  },
  {
    title: "After 2 weeks - discuss price adjustment if needed",
    description: "Review offers and market feedback, discuss price drop",
    daysFromAnchor: 14,
    anchor: "go-live",
    isCustom: false,
  },
  {
    title: "Increase marketing efforts if needed",
    description: "More social, network with agents, schedule more open houses",
    daysFromAnchor: 14,
    anchor: "go-live",
    isCustom: false,
  },
];

export function calculateTaskDueDate(
  task: Omit<ListingTask, "dueDate" | "status" | "id">,
  preListingDate: string | null,
  goLiveDate: string | null
): string | null {
  const anchorDate = task.anchor === "pre-listing" ? preListingDate : goLiveDate;
  if (!anchorDate) return null;

  const anchor = new Date(anchorDate);
  const dueDate = new Date(anchor);
  dueDate.setDate(dueDate.getDate() + task.daysFromAnchor);

  return dueDate.toISOString().split("T")[0]; // YYYY-MM-DD
}

export function generateTasksForSeller(
  preListingDate: string | null,
  goLiveDate: string | null,
  sellerId?: string
): ListingTask[] {
  const tasks: ListingTask[] = [];
  const allTemplates = [...PRE_LISTING_TASKS, ...GO_LIVE_TASKS];

  allTemplates.forEach((template, idx) => {
    const dueDate = calculateTaskDueDate(template, preListingDate, goLiveDate);
    if (dueDate) {
      // Generate deterministic task ID from seller_id and index
      // If no seller_id provided, fall back to index only (but this may cause collisions)
      const taskId = sellerId ? `task_${sellerId}_${idx}` : `task_${idx}`;
      
      tasks.push({
        ...template,
        id: taskId,
        dueDate,
        status: "Not Started",
      });
    }
  });

  return tasks;
}

export function addCustomTask(
  title: string,
  description: string | undefined,
  dueDate: string,
  currentTasks: ListingTask[]
): ListingTask {
  const newTask: ListingTask = {
    id: `custom_${Date.now()}`,
    title,
    description,
    daysFromAnchor: 0,
    anchor: "go-live",
    dueDate,
    status: "Not Started",
    isCustom: true,
  };

  return newTask;
}
