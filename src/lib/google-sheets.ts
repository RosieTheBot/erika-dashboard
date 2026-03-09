import { google } from "googleapis";
import path from "path";
import fs from "fs";

interface GoogleCredentials {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: string;
  assignedTo: string;
  [key: string]: any;
}

interface GoogleSheetsStats {
  completed: number;
  pending: number;
  total: number;
}

let sheetsClient: any = null;
let credentials: GoogleCredentials | null = null;

function loadCredentials(): GoogleCredentials {
  if (!credentials) {
    const credPath = path.join(
      process.env.HOME || "/Users/rosiejetson",
      ".credentials",
      "google-calendar.json"
    );
    const credContent = fs.readFileSync(credPath, "utf-8");
    credentials = JSON.parse(credContent) as GoogleCredentials;
  }
  return credentials as GoogleCredentials;
}

async function getSheetsClient() {
  if (sheetsClient) return sheetsClient;

  const creds = loadCredentials();
  const auth = new google.auth.GoogleAuth({
    credentials: creds as any,
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/calendar.readonly",
    ],
  });

  sheetsClient = google.sheets({ version: "v4", auth });
  return sheetsClient;
}

async function getCalendarClient() {
  const creds = loadCredentials();
  const auth = new google.auth.GoogleAuth({
    credentials: creds as any,
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/calendar.readonly",
    ],
  });

  return google.calendar({ version: "v3", auth });
}

export async function getTasks(): Promise<Task[]> {
  try {
    const sheets = await getSheetsClient();
    // Rosie Tasks sheet ID - from workspace context
    const SHEET_ID = "1aGpUKbvM3UqWx3cZoVdXpQrSmN8lKtA9vY5b9Z8c2W4";

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Sheet1!A:F",
    });

    const rows = response.data.values || [];
    const headers = rows[0] || [];
    const tasks: Task[] = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || !row[0]) continue;

      tasks.push({
        id: `task_${i}`,
        title: row[0] || "",
        description: row[1] || "",
        dueDate: row[2] || "",
        status: row[3] || "pending",
        assignedTo: row[4] || "",
      });
    }

    return tasks;
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }
}

export async function getCalendarTasks(): Promise<any[]> {
  try {
    const calendar = await getCalendarClient();
    const now = new Date();
    const timeMax = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // Next 30 days

    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: now.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 100,
    });

    return response.data.items || [];
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    return [];
  }
}

export async function getGoogleSheetsStats(): Promise<GoogleSheetsStats> {
  try {
    const tasks = await getTasks();
    const completed = tasks.filter(
      (t) => t.status.toLowerCase() === "complete"
    ).length;
    const pending = tasks.filter(
      (t) => t.status.toLowerCase() !== "complete"
    ).length;

    return {
      completed,
      pending,
      total: tasks.length,
    };
  } catch (error) {
    console.error("Error getting sheets stats:", error);
    return { completed: 0, pending: 0, total: 0 };
  }
}
