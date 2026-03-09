import { NextResponse } from "next/server";

interface DashboardStats {
  upcomingTasks: number;
  activeBuyers: number;
  activeSellers: number;
  completedThisWeek: number;
  topPicksClick: number;
}

// Mock stats for MVP/testing
const MOCK_STATS: DashboardStats = {
  upcomingTasks: 3,
  activeBuyers: 3,
  activeSellers: 3,
  completedThisWeek: 12,
  topPicksClick: 247,
};

export async function GET(): Promise<NextResponse<DashboardStats>> {
  try {
    // Try to fetch real stats if credentials available
    if (
      process.env.FUB_CREDENTIALS_PATH &&
      process.env.GOOGLE_SERVICE_ACCOUNT_PATH &&
      process.env.MAILCHIMP_API_KEY
    ) {
      try {
        const { getFUBStats } = await import("@/lib/fub");
        const { getGoogleSheetsStats } = await import("@/lib/google-sheets");
        const { getMailchimpStats } = await import("@/lib/mailchimp");

        const [buyerCount, sellerCount, taskCount, topPicksStats] =
          await Promise.allSettled([
            getFUBStats(),
            getFUBStats(),
            getGoogleSheetsStats(),
            getMailchimpStats(),
          ]);

        const stats: DashboardStats = {
          upcomingTasks:
            taskCount.status === "fulfilled" ? taskCount.value.pending : 0,
          activeBuyers:
            buyerCount.status === "fulfilled" ? buyerCount.value.buyers : 0,
          activeSellers:
            sellerCount.status === "fulfilled"
              ? sellerCount.value.sellers
              : 0,
          completedThisWeek:
            taskCount.status === "fulfilled" ? taskCount.value.completed : 0,
          topPicksClick:
            topPicksStats.status === "fulfilled"
              ? topPicksStats.value.clicks
              : 0,
        };

        return NextResponse.json(stats);
      } catch (apiError) {
        console.warn("API failed, using mock data:", apiError);
      }
    }

    // Return mock stats for MVP/testing
    return NextResponse.json(MOCK_STATS);
  } catch (error) {
    console.error("Error in stats endpoint:", error);
    return NextResponse.json(MOCK_STATS);
  }
}
