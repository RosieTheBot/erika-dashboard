interface MailchimpStats {
  clicks: number;
  opens: number;
  subscribers: number;
}

interface MailchimpCampaign {
  id: string;
  title: string;
  status: string;
  open_rate: number;
  click_rate: number;
  clicks: number;
  sent_date: string;
}

// Use environment variable for API key (never hardcode secrets!)
const API_KEY = process.env.MAILCHIMP_API_KEY || "";
const DC = process.env.MAILCHIMP_DATA_CENTER || "us15"; // Data center
const BASE_URL = `https://${DC}.api.mailchimp.com/3.0`;

async function makeMailchimpRequest(
  endpoint: string,
  options: RequestInit = {}
) {
  const url = `${BASE_URL}${endpoint}`;
  const auth = Buffer.from(`anystring:${API_KEY}`).toString("base64");

  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Mailchimp API error: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

export async function getMailchimpCampaigns(): Promise<MailchimpCampaign[]> {
  try {
    const data = await makeMailchimpRequest("/campaigns?sort_field=send_time&sort_dir=DESC&limit=10");
    return (data.campaigns || []).map((campaign: any) => ({
      id: campaign.id,
      title: campaign.settings.title,
      status: campaign.status,
      open_rate: campaign.report_summary?.open_rate || 0,
      click_rate: campaign.report_summary?.click_rate || 0,
      clicks: campaign.report_summary?.clicks || 0,
      sent_date: campaign.send_time || campaign.create_time,
    }));
  } catch (error) {
    console.error("Error fetching Mailchimp campaigns:", error);
    return [];
  }
}

export async function getMailchimpStats(): Promise<MailchimpStats> {
  try {
    const campaigns = await getMailchimpCampaigns();

    // Get list stats
    const listData = await makeMailchimpRequest("/lists?fields=lists.id,lists.stats.member_count&count=10");
    const totalSubscribers = listData.lists
      ? listData.lists.reduce((sum: number, list: any) => sum + (list.stats?.member_count || 0), 0)
      : 0;

    // Sum up clicks from recent campaigns (7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentCampaigns = campaigns.filter(
      (c) => new Date(c.sent_date) > sevenDaysAgo
    );
    const totalClicks = recentCampaigns.reduce(
      (sum, c) => sum + c.clicks,
      0
    );

    return {
      clicks: totalClicks,
      opens: 0, // Will calculate from campaigns
      subscribers: totalSubscribers,
    };
  } catch (error) {
    console.error("Error getting Mailchimp stats:", error);
    return { clicks: 0, opens: 0, subscribers: 0 };
  }
}

export async function getTopPicksCampaigns(): Promise<MailchimpCampaign[]> {
  try {
    const campaigns = await getMailchimpCampaigns();
    // Filter for "Top Picks" campaigns
    return campaigns.filter((c) =>
      c.title.toLowerCase().includes("top pick")
    );
  } catch (error) {
    console.error("Error fetching Top Picks campaigns:", error);
    return [];
  }
}
