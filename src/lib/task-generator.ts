/**
 * Task Generator - Auto-generates tasks from calendar events
 *
 * Rules:
 * - Photos event → 3 tasks, 1 day after: prep, staging, photos
 * - Go Live event → 4 tasks at specific intervals: 10 days before, 7 days before, 1 day before, go live day
 */

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: string;
  assignedTo: string;
  source: "manual" | "calendar";
}

interface CalendarEvent {
  id: string;
  summary: string;
  description: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
}

export async function generateCalendarTasks(
  events: CalendarEvent[]
): Promise<Task[]> {
  const tasks: Task[] = [];

  for (const event of events) {
    const eventDate = getEventDate(event);
    if (!eventDate) continue;

    const summary = event.summary.toLowerCase();

    // Check for Photos event
    if (
      summary.includes("photo") ||
      summary.includes("shoot") ||
      summary.includes("photography")
    ) {
      const photoTasks = generatePhotoTasks(event, eventDate);
      tasks.push(...photoTasks);
    }

    // Check for Go Live event
    if (
      summary.includes("go live") ||
      summary.includes("list") ||
      summary.includes("launch")
    ) {
      const goLiveTasks = generateGoLiveTasks(event, eventDate);
      tasks.push(...goLiveTasks);
    }
  }

  return tasks;
}

function getEventDate(event: CalendarEvent): Date | null {
  const startDate = event.start?.dateTime || event.start?.date;
  if (!startDate) return null;

  return new Date(startDate);
}

function generatePhotoTasks(event: CalendarEvent, eventDate: Date): Task[] {
  // 1 day after photos: prepare, stage, and take photos
  const oneDayAfter = new Date(eventDate);
  oneDayAfter.setDate(oneDayAfter.getDate() + 1);

  const address =
    event.description?.split("\n")[0] || event.summary.replace("Photos - ", "");

  return [
    {
      id: `task_photo_prep_${event.id}`,
      title: "Prepare for Photos - " + address,
      description: "Clean and prepare property for photo shoot",
      dueDate: oneDayAfter.toISOString().split("T")[0],
      status: "pending",
      assignedTo: "Erika",
      source: "calendar",
    },
    {
      id: `task_photo_stage_${event.id}`,
      title: "Stage Property - " + address,
      description: "Stage and arrange property for optimal photos",
      dueDate: oneDayAfter.toISOString().split("T")[0],
      status: "pending",
      assignedTo: "Erika",
      source: "calendar",
    },
    {
      id: `task_photo_shoot_${event.id}`,
      title: "Take Photos - " + address,
      description: "Conduct professional photo shoot",
      dueDate: oneDayAfter.toISOString().split("T")[0],
      status: "pending",
      assignedTo: "Photographer",
      source: "calendar",
    },
  ];
}

function generateGoLiveTasks(event: CalendarEvent, eventDate: Date): Task[] {
  const address =
    event.description?.split("\n")[0] || event.summary.replace("Go Live - ", "");

  const tenDaysBefore = new Date(eventDate);
  tenDaysBefore.setDate(tenDaysBefore.getDate() - 10);

  const sevenDaysBefore = new Date(eventDate);
  sevenDaysBefore.setDate(sevenDaysBefore.getDate() - 7);

  const oneDayBefore = new Date(eventDate);
  oneDayBefore.setDate(oneDayBefore.getDate() - 1);

  return [
    {
      id: `task_golive_final_10_${event.id}`,
      title: "Final Listing Review (10 days) - " + address,
      description:
        "Complete final review of listing details, photos, and description",
      dueDate: tenDaysBefore.toISOString().split("T")[0],
      status: "pending",
      assignedTo: "Erika",
      source: "calendar",
    },
    {
      id: `task_golive_marketing_7_${event.id}`,
      title: "Pre-Launch Marketing (7 days) - " + address,
      description:
        "Prepare marketing materials and social media for launch",
      dueDate: sevenDaysBefore.toISOString().split("T")[0],
      status: "pending",
      assignedTo: "Erika",
      source: "calendar",
    },
    {
      id: `task_golive_final_1_${event.id}`,
      title: "Final Checks (1 day) - " + address,
      description: "Last minute checks before going live",
      dueDate: oneDayBefore.toISOString().split("T")[0],
      status: "pending",
      assignedTo: "Erika",
      source: "calendar",
    },
    {
      id: `task_golive_launch_${event.id}`,
      title: "GO LIVE - " + address,
      description: "Publish listing to MLS and all marketing channels",
      dueDate: eventDate.toISOString().split("T")[0],
      status: "pending",
      assignedTo: "Erika",
      source: "calendar",
    },
  ];
}
