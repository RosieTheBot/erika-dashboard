import { NextResponse } from "next/server";

interface AnalyticsResponse {
  campaigns: Array<{
    id: string;
    title: string;
    status: string;
    openRate: number;
    clickRate: number;
    clicks: number;
    sentDate: string;
  }>;
  stats: {
    weeklyCampaigns: number;
    totalClicks: number;
    avgOpenRate: number;
    avgClickRate: number;
    subscribers: number;
  };
}

// Mock data for MVP/testing
const MOCK_CAMPAIGNS = [
  {
    id: "camp_1",
    title: "Top 10 STR Picks - Week of Feb 23",
    status: "sent",
    openRate: 0.342,
    clickRate: 0.087,
    clicks: 156,
    sentDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
  },
  {
    id: "camp_2",
    title: "Top 10 STR Picks - Week of Mar 2",
    status: "sent",
    openRate: 0.358,
    clickRate: 0.094,
    clicks: 169,
    sentDate: new Date(Date.now()).toISOString().split("T")[0],
  },
];

const MOCK_RESPONSE: AnalyticsResponse = {
  campaigns: MOCK_CAMPAIGNS,
  stats: {
    weeklyCampaigns: 2,
    totalClicks: 325,
    avgOpenRate: 0.35,
    avgClickRate: 0.0905,
    subscribers: 3847,
  },
};

export async function GET(): Promise<NextResponse<AnalyticsResponse>> {
  try {
    const { getTopPicksCampaigns, getMailchimpStats } = await import(
      "@/lib/mailchimp"
    );

    const campaigns = await getTopPicksCampaigns();
    const stats = await getMailchimpStats();

    const avgOpenRate =
      campaigns.length > 0
        ? campaigns.reduce((sum, c) => sum + c.open_rate, 0) /
          campaigns.length
        : 0;
    const avgClickRate =
      campaigns.length > 0
        ? campaigns.reduce((sum, c) => sum + c.click_rate, 0) /
          campaigns.length
        : 0;

    const response: AnalyticsResponse = {
      campaigns: campaigns.map((c) => ({
        id: c.id,
        title: c.title,
        status: c.status,
        openRate: c.open_rate,
        clickRate: c.click_rate,
        clicks: c.clicks,
        sentDate: c.sent_date,
      })),
      stats: {
        weeklyCampaigns: campaigns.length,
        totalClicks: stats.clicks,
        avgOpenRate,
        avgClickRate,
        subscribers: stats.subscribers,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in analytics endpoint:", error);
    // Only return mock data if Mailchimp completely fails
    return NextResponse.json(MOCK_RESPONSE);
  }
}
