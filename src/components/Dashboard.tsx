"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, Users, UserCheck, CheckCircle, BarChart3, Plus, TrendingUp, Target } from "lucide-react";

interface DashboardStats {
  upcomingTasks: number;
  activeBuyers: number;
  activeSellers: number;
  completedThisWeek: number;
  topPicksClick: number;
}

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    upcomingTasks: 0,
    activeBuyers: 0,
    activeSellers: 0,
    completedThisWeek: 0,
    topPicksClick: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch dashboard stats from API
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/dashboard/stats");
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Home Base</h1>
        <p className="text-sm md:text-base text-primary-300">
          Welcome back, Erika. Here's what's happening today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-2 md:gap-4 mb-6 md:mb-8">
        <div onClick={() => router.push('/tasks')} className="cursor-pointer">
          <StatCard
            title="Upcoming Tasks"
            value={stats.upcomingTasks}
            icon={<Calendar size={24} />}
            color="blue"
            trend={12}
          />
        </div>
        <div onClick={() => router.push('/buyers')} className="cursor-pointer">
          <StatCard
            title="Active Buyers"
            value={stats.activeBuyers}
            icon={<Users size={24} />}
            color="green"
            trend={8}
          />
        </div>
        <div onClick={() => router.push('/sellers')} className="cursor-pointer">
          <StatCard
            title="Active Sellers"
            value={stats.activeSellers}
            icon={<UserCheck size={24} />}
            color="purple"
            trend={5}
          />
        </div>
        <div onClick={() => router.push('/procedures')} className="cursor-pointer">
          <StatCard
            title="Completed This Week"
            value={stats.completedThisWeek}
            icon={<CheckCircle size={24} />}
            color="yellow"
            trend={15}
          />
        </div>
        <div onClick={() => router.push('/analytics')} className="cursor-pointer">
          <StatCard
            title="Top Picks Clicks"
            value={stats.topPicksClick}
            icon={<BarChart3 size={24} />}
            color="pink"
            trend={25}
          />
        </div>
      </div>

      {/* Main Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <Card title="Quick Actions" icon={<Target size={20} />}>
            <div className="space-y-2">
              <Link href="/my-tasks" className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/30 cursor-pointer">
                <CheckCircle size={18} />
                My Tasks
              </Link>
              <Link href="/tasks" className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/30 cursor-pointer">
                <CheckCircle size={18} />
                Rosie Tasks
              </Link>
              <Link href="/buyers" className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-green-500/30 cursor-pointer">
                <Users size={18} />
                New Buyer
              </Link>
              <Link href="/sellers" className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/30 cursor-pointer">
                <UserCheck size={18} />
                New Seller
              </Link>
              <a href="https://calendar.google.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/30 cursor-pointer">
                <Calendar size={18} />
                View Calendar
              </a>
            </div>
          </Card>
        </div>

        {/* Recent Tasks */}
        <div className="lg:col-span-2">
          <Card title="Your Tasks Today" icon={<TrendingUp size={20} />}>
            <div className="text-primary-300 text-sm">
              Loading tasks... (API integration in progress)
            </div>
          </Card>
        </div>
      </div>

      {/* More Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card title="Recent Buyers" icon={<Users size={20} />}>
          <div className="text-primary-300 text-sm">
            Loading buyers... (FUB API integration in progress)
          </div>
        </Card>

        <Card title="Top Picks Performance" icon={<BarChart3 size={20} />}>
          <div className="text-primary-300 text-sm">
            Loading analytics... (Mailchimp API integration in progress)
          </div>
        </Card>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: "blue" | "green" | "purple" | "yellow" | "pink";
  trend?: number;
}

function StatCard({ title, value, icon, color, trend }: StatCardProps) {
  const colorClasses = {
    blue: "bg-gradient-to-br from-blue-500/20 to-blue-500/5 border-blue-500/30 hover:border-blue-500/50",
    green: "bg-gradient-to-br from-green-500/20 to-green-500/5 border-green-500/30 hover:border-green-500/50",
    purple: "bg-gradient-to-br from-purple-500/20 to-purple-500/5 border-purple-500/30 hover:border-purple-500/50",
    yellow: "bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 border-yellow-500/30 hover:border-yellow-500/50",
    pink: "bg-gradient-to-br from-pink-500/20 to-pink-500/5 border-pink-500/30 hover:border-pink-500/50",
  };

  const textColors = {
    blue: "text-blue-400",
    green: "text-green-400",
    purple: "text-purple-400",
    yellow: "text-yellow-400",
    pink: "text-pink-400",
  };

  return (
    <div className={`${colorClasses[color]} rounded-xl p-3 md:p-6 border transition-all duration-300 hover:shadow-lg hover:shadow-${color}-500/20`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-primary-300 text-xs md:text-sm font-semibold uppercase tracking-wide">{title}</p>
          <div className="flex items-baseline gap-2 mt-2 md:mt-3">
            <p className="text-2xl md:text-4xl font-bold text-white">{value}</p>
            {trend && trend > 0 && (
              <span className="text-xs md:text-sm text-green-400 font-medium">↑ {trend}%</span>
            )}
          </div>
        </div>
        <div className={`${textColors[color]} opacity-80 flex-shrink-0`}>{icon}</div>
      </div>
    </div>
  );
}

interface CardProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

function Card({ title, children, icon }: CardProps) {
  return (
    <div className="bg-gradient-to-br from-primary-800/50 to-primary-850/50 border border-primary-700/50 rounded-xl p-4 md:p-6 hover:border-primary-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary-950/40">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="text-base md:text-lg font-bold text-white">{title}</h2>
        {icon && <div className="text-primary-500 opacity-60">{icon}</div>}
      </div>
      {children}
    </div>
  );
}
