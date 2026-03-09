"use client";

import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, Mail, RefreshCw } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import { SkeletonStats, Skeleton } from "@/components/ui/Skeleton";
import Button from "@/components/ui/Button";

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
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAnalytics = async () => {
    try {
      setError(null);
      const response = await fetch("/api/analytics");
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();
      setCampaigns(data.campaigns || []);
      setStats(data.stats || {});
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Error fetching analytics:", error);
      setError(errorMessage);
      // Fallback: use empty state
      setCampaigns([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAnalytics();
  };

  return (
    <div className="container-page space-section">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1>Top Picks Analytics</h1>
          <p className="text-primary-300 mt-2">
            Weekly newsletter performance and subscriber engagement
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          icon={<RefreshCw size={16} />}
          onClick={handleRefresh}
          isLoading={isRefreshing}
        >
          Refresh
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <ErrorState
          message={error}
          onRetry={handleRefresh}
        />
      )}

      {/* Stats Grid */}
      {loading ? (
        <SkeletonStats />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
      )}

      {/* Recent Campaigns */}
      <div className="bg-primary-800/50 border border-primary-700 rounded-lg p-6">
        <h2 className="text-lg font-bold text-white mb-6">Recent Top Picks Campaigns</h2>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-20 w-full" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="opacity-50">
            <EmptyState
              icon={Mail}
              title="Unable to Load Campaigns"
              description="There was an error loading your campaigns. Check your connection and try again."
            />
          </div>
        ) : campaigns.length === 0 ? (
          <EmptyState
            icon={Mail}
            title="No Campaigns Yet"
            description="You haven't created any newsletter campaigns yet. Create your first campaign to get started."
            action={{
              label: "Create Campaign",
              onClick: () => console.log("Create campaign clicked")
            }}
            variant="info"
          />
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
                  <span className="bg-primary-700 text-primary-100 px-3 py-1 rounded-full text-xs font-medium">
                    {campaign.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-primary-900 rounded p-3">
                    <p className="text-label">Open Rate</p>
                    <p className="text-white text-lg font-semibold mt-1">
                      {(campaign.openRate * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="bg-primary-900 rounded p-3">
                    <p className="text-label">Click Rate</p>
                    <p className="text-white text-lg font-semibold mt-1">
                      {(campaign.clickRate * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="bg-primary-900 rounded p-3">
                    <p className="text-label">Total Clicks</p>
                    <p className="text-white text-lg font-semibold mt-1">
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
    <div className="bg-primary-800/50 border border-primary-700 rounded-lg p-6 hover:border-primary-600 transition">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-label">{title}</p>
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
        </div>
        <div className="text-primary-600">{icon}</div>
      </div>
    </div>
  );
}
