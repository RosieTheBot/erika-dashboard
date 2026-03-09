"use client";

import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, Mail } from "lucide-react";

interface Campaign {
  id: string;
  title: string;
  status: string;
  openRate: number;
  clickRate: number;
  clicks: number;
  sentDate: string;
}

export default function AnalyticsView() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState({
    weeklyCampaigns: 0,
    totalClicks: 0,
    avgOpenRate: 0,
    avgClickRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/analytics");
      const data = await response.json();
      setCampaigns(data.campaigns || []);
      setStats(data.stats || {});
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Top Picks Analytics</h1>
        <p className="text-primary-300">
          Weekly newsletter performance and subscriber engagement
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Weekly Campaigns"
          value={stats.weeklyCampaigns}
          icon={<Mail size={24} />}
        />
        <StatCard
          title="Total Clicks (7d)"
          value={stats.totalClicks}
          icon={<TrendingUp size={24} />}
        />
        <StatCard
          title="Avg Open Rate"
          value={`${(stats.avgOpenRate * 100).toFixed(1)}%`}
          icon={<BarChart3 size={24} />}
        />
        <StatCard
          title="Avg Click Rate"
          value={`${(stats.avgClickRate * 100).toFixed(1)}%`}
          icon={<BarChart3 size={24} />}
        />
      </div>

      {/* Recent Campaigns */}
      <div className="bg-primary-800 border border-primary-700 rounded-lg p-6">
        <h2 className="text-lg font-bold text-white mb-4">Recent Top Picks Campaigns</h2>

        {loading ? (
          <div className="text-primary-300 text-center py-8">
            Loading campaigns...
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-primary-300 text-center py-8">
            No campaigns found
          </div>
        ) : (
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="border border-primary-700 rounded-lg p-4 hover:border-primary-600 transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-white font-semibold">{campaign.title}</h3>
                    <p className="text-primary-400 text-sm mt-1">
                      {new Date(campaign.sentDate).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="bg-primary-700 text-primary-100 px-2 py-1 rounded text-sm">
                    {campaign.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-primary-900 rounded p-3">
                    <p className="text-primary-400 text-xs">Open Rate</p>
                    <p className="text-white text-lg font-semibold">
                      {(campaign.openRate * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="bg-primary-900 rounded p-3">
                    <p className="text-primary-400 text-xs">Click Rate</p>
                    <p className="text-white text-lg font-semibold">
                      {(campaign.clickRate * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="bg-primary-900 rounded p-3">
                    <p className="text-primary-400 text-xs">Total Clicks</p>
                    <p className="text-white text-lg font-semibold">
                      {campaign.clicks}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}

function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <div className="bg-primary-800 border border-primary-700 rounded-lg p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-primary-300 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
        </div>
        <div className="text-primary-600">{icon}</div>
      </div>
    </div>
  );
}
