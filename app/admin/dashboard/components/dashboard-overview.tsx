// app/admin/dashboard/components/dashboard-overview.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
} from "chart.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AdminPageHeader from "@/components/AdminPageHeader";
import ProgressStat from "./progress-stat";
import {
  TrendingUp,
  FileText,
  Video,
  MessageSquare,
  Eye,
  Calendar,
  Activity,
  Plus,
  ExternalLink,
  Users,
  TrendingDown,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { fetcher } from "@/lib/fetcher";
import { useRole } from "../contexts/role-context";
import { HttpError } from "@/lib/http";
import { useDashboardStats } from "@/hooks/useDashboardStats";

// Register Chart.js primitives once
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// Dynamically load only the Bar component to keep bundle size small
const Bar = dynamic(() => import("react-chartjs-2").then((m) => m.Bar), { ssr: false });

interface MonthlyStats {
  month: string;
  posts: number;
  videos: number;
  comments: number;
}

interface DashboardStats {
  totalPosts: number;
  totalVideos: number;
  totalComments: number;
  totalViews: number;
  pendingComments: number;
  publishedPosts: number;
  featuredVideos: number;
  monthlyGrowth: number;
  history?: MonthlyStats[]; // ← 12-month history (optional)
}

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  status: string;
}

interface QuickAction {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color: string;
}

const quickActions: QuickAction[] = [
  {
    title: "Create New Post",
    description: "Write a new blog article",
    icon: FileText,
    href: "/admin/dashboard/blog-posts",
    color: "bg-blue-500",
  },
  {
    title: "Add Video",
    description: "Upload new video content",
    icon: Video,
    href: "/admin/dashboard/videos",
    color: "bg-purple-500",
  },
  {
    title: "Moderate Comments",
    description: "Review pending comments",
    icon: MessageSquare,
    href: "/admin/dashboard/comments",
    color: "bg-green-500",
  },
  {
    title: "Manage Users",
    description: "Edit user roles and permissions",
    icon: Users,
    href: "/admin/dashboard/users",
    color: "bg-teal-500",
  },
];

export default function DashboardOverview() {
  useEffect(() => {
    if (typeof window !== "undefined" && !(window as any).Chart) {
      (window as any).Chart = ChartJS;
    }
  }, []);
  
  const { theme } = useTheme();
  const router = useRouter();
  const { hasPermission } = useRole();
  const canViewAnalytics = hasPermission?.("canViewAnalytics") ?? false;

  // Live toggle controls polling interval
  const [live, setLive] = useState(false);
  const [showInitialSpinner, setShowInitialSpinner] = useState(true);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<number | null>(null);
  const initialSpinnerStartedAtRef = useRef<number>(Date.now());
  const MIN_INITIAL_SPINNER_MS = 450;

  // React Query: stats are the single source of truth
  const statsQuery = useDashboardStats(live, canViewAnalytics);
  const stats = statsQuery.data as DashboardStats | undefined;
  const statsError = statsQuery.error as unknown;
  const statsLoading = statsQuery.isLoading;
  const lastUpdatedLabel = useMemo(() => {
    const target = lastRefreshedAt ?? statsQuery.dataUpdatedAt;
    if (!target) return "N/A";
    if (!statsQuery.dataUpdatedAt) return "N/A";

    try {
      return new Intl.DateTimeFormat(undefined, {
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        fractionalSecondDigits: 3,
      }).format(new Date(target));
    } catch {
      return new Date(target).toLocaleTimeString();
    }
  }, [lastRefreshedAt, statsQuery.dataUpdatedAt]);

  useEffect(() => {
    if (!showInitialSpinner) return;
    if (statsLoading) return;

    const hasResolved = Boolean(stats) || Boolean(statsError) || !statsLoading;
    if (!hasResolved) return;

    const startedAt = initialSpinnerStartedAtRef.current ?? Date.now();
    const elapsed = Date.now() - startedAt;
    const remaining = Math.max(MIN_INITIAL_SPINNER_MS - elapsed, 0);

    const timeout = window.setTimeout(() => setShowInitialSpinner(false), remaining);
    return () => window.clearTimeout(timeout);
  }, [showInitialSpinner, statsLoading, stats, statsError]);

  // SWR: keep activity separate for now (can migrate later)
  const {
    data: activityData,
    error: activityError,
    mutate: mutateActivity,
  } = useSWR<{ activities: ActivityItem[] }>(
    canViewAnalytics ? "/api/admin/activity" : null,
    fetcher,
    {
      refreshInterval: live ? 15_000 : 60_000,
      revalidateOnFocus: false,
      refreshWhenHidden: false,
      errorRetryCount: 0,
      shouldRetryOnError: () => false,
    }
  );
  const recentActivity = activityData?.activities || [];

  // Helper to detect 401/403 errors from any thrown value (not tied to instanceof)
  const isUnauthorized = (err: unknown): boolean => {
    const status =
      (err as { status?: number } | undefined)?.status ??
      (err instanceof HttpError ? err.status : undefined);
    return status === 401 || status === 403;
  };

  // Separate unauthorized (401/403) from other failures
  const unauthorized = [statsError, activityError].some((err) => !!err && isUnauthorized(err));
  const hasNetworkError = [statsError, activityError].some((err) => !!err && !isUnauthorized(err));

  // Derive a short diagnostic code for the overlay
  const firstError = (statsError || activityError) as unknown;
  const diagnosticCode = useMemo(() => {
    if (!firstError) return "";
    const status =
      (firstError as { status?: number } | undefined)?.status ??
      (firstError instanceof HttpError ? firstError.status : undefined);
    if (status === 429) return "DASHLOAD_429";
    if (typeof status === "number" && status >= 500) return "DASHLOAD_5XX";
    if (firstError instanceof Error && firstError.message.includes("timed out")) {
      return "DASHLOAD_TIMEOUT";
    }
    return "DASHLOAD_NETWORK";
  }, [firstError]);

  const refresh = () => {
    setLastRefreshedAt(Date.now());
    statsQuery.refetch();
    mutateActivity?.();
  };

  // ↓↓↓ PRECOMPUTE CHART HOOKS BEFORE ANY CONDITIONAL RETURNS ↓↓↓
  const chartRef = useRef<ChartJS<"bar"> | null>(null);

  const chartData = useMemo<ChartData<"bar">>(() => {
    if (!stats?.history?.length) return { labels: [], datasets: [] };
    return {
      labels: stats.history.map((h) => h.month),
      datasets: [
        {
          label: "Posts",
          data: stats.history.map((h) => h.posts),
          backgroundColor: theme === "dark" ? "#60a5fa" : "#3b82f6",
        },
        {
          label: "Videos",
          data: stats.history.map((h) => h.videos),
          backgroundColor: theme === "dark" ? "#c084fc" : "#a855f7",
        },
        {
          label: "Comments",
          data: stats.history.map((h) => h.comments),
          backgroundColor: theme === "dark" ? "#34d399" : "#10b981",
        },
      ],
    };
  }, [stats, theme]);

  const chartOptions = useMemo<ChartOptions<"bar">>(() => {
    const text = theme === "dark" ? "#d1d5db" : "#374151";
    const grid = theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: text },
        },
        tooltip: {
          intersect: false,
          mode: "index",
        },
      },
      scales: {
        x: { ticks: { color: text }, grid: { color: grid } },
        y: { ticks: { color: text }, grid: { color: grid } },
      },
    };
  }, [theme]);
  // ↑↑↑ PRECOMPUTE CHART HOOKS BEFORE ANY CONDITIONAL RETURNS ↑↑↑

  const hasActivity = stats?.history?.some(
    (m) => m.posts || m.videos || m.comments,
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!hasActivity) {
      (window as any).__dashboardHistoryDatasets = null;
      return;
    }

    const datasets =
      chartData?.datasets?.length ? chartData.datasets : chartRef.current?.data.datasets;

    if (!datasets || datasets.length === 0) {
      return;
    }

    (window as any).__dashboardHistoryDatasets = datasets;
  }, [chartData, hasActivity]);

  // Permission warning (do not attempt fetching or show generic errors)
  if (!canViewAnalytics || unauthorized) {
    return (
      <div className="flex items-center justify-center h-64" data-testid="analytics-permission-block">
        <div className="text-center">
          <p className="text-gray-600 mb-2">You don&apos;t have permission to view analytics.</p>
        </div>
      </div>
    );
  }

  // First-load spinner stays mounted until the first stats request settles
  if (showInitialSpinner || (statsLoading && !stats)) {
    return (
      <div className="flex items-center justify-center h-64" data-testid="dashboard-loading">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-3 text-gray-600">Loading real-time data...</span>
      </div>
    );
  }

  // Network error overlay (keep last good data otherwise)
  if (hasNetworkError && !statsLoading && !stats) {
    return (
      <div className="flex items-center justify-center h-64" data-testid="dashboard-error">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-700 mb-2">
            Dashboard data unavailable
          </h2>
          <p className="text-red-600 mb-2">Unable to load dashboard data</p>
          <p className="text-gray-600 mb-2">Please try again.</p>
          {diagnosticCode && (
            <p className="text-gray-500 text-xs mb-4" data-testid="dashboard-error-code">
              {diagnosticCode}
            </p>
          )}
          <Button
            onClick={refresh}
            className="rounded-xl bg-orange-800 hover:bg-orange-900 text-white"
          >
            Retry Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Dashboard data unavailable
          </h2>
          <p className="text-gray-600 mb-2">Unable to load dashboard data</p>
          <Button
            onClick={refresh}
            className="rounded-xl bg-orange-800 hover:bg-orange-900 text-white"
          >
            Refresh Dashboard
          </Button>
        </div>
      </div>
    );
  }
  const sign = stats.monthlyGrowth > 0 ? "+" : stats.monthlyGrowth < 0 ? "-" : "";
  const growthColor =
    stats.monthlyGrowth > 0
      ? "text-green-700"
      : stats.monthlyGrowth < 0
        ? "text-red-700"
        : "text-gray-700";

  return (
    <div className="space-y-6">
      <AdminPageHeader
        as="h1"
        title="Dashboard Overview"
        subtitle="Track activity, performance, and quick actions for your studio"
      />
      {/* Controls */}
      <div className="flex items-center gap-3">
        <Button
          onClick={refresh}
          disabled={statsQuery.isFetching}
          size="sm"
          className="rounded-xl bg-orange-700 hover:bg-orange-800 text-white"
        >
          Refresh
        </Button>
        <label className="flex items-center gap-1 text-sm">
          <input
            type="checkbox"
            checked={live}
            onChange={(e) => setLive(e.target.checked)}
            aria-label="Live updates"
          />
          Live
        </label>
        <span aria-live="polite" className="text-sm text-gray-600">
          Last updated: {lastUpdatedLabel}
        </span>
      </div>

      {/* Inline error banner that does not blank the UI */}
      {hasNetworkError && stats && (
        <div
          role="alert"
          className="mb-4 rounded bg-red-50 p-2 text-sm text-red-700"
          data-testid="dashboard-inline-error"
        >
          Failed to refresh{" "}
          <button onClick={refresh} className="underline">
            Retry
          </button>
          {diagnosticCode && (
            <span className="ml-2 opacity-70">({diagnosticCode})</span>
          )}
        </div>
      )}

      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Welcome back! 👋</h2>
            <p className="text-purple-100 text-lg">Here&apos;s what&apos;s happening with your Flavor Studios website today.</p>
          </div>
          <div className="hidden md:block">
            <Button
              variant="secondary"
              onClick={() => window.open("https://flavorstudios.in", "_blank")}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Live Site
            </Button>
          </div>
        </div>
      </div>

      {/* Real-time Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Posts</p>
                <p
                  className="text-3xl font-bold text-gray-900"
                  data-testid="total-posts-value"
                >
                  {stats.totalPosts}
                </p>
                <p className={`text-sm flex items-center mt-1 ${growthColor}`}>
                  {stats.monthlyGrowth !== 0 && (
                    stats.monthlyGrowth > 0 ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )
                  )}
                  {sign}
                  {Math.abs(stats.monthlyGrowth)}% posts+videos growth this month
                </p>
                {stats.totalPosts === 0 && <p className="text-sm text-gray-500 mt-1">No posts yet</p>}
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Videos</p>
                <p
                  className="text-3xl font-bold text-gray-900"
                  data-testid="total-videos-value"
                >
                  {stats.totalVideos}
                </p>
                <p className="text-sm text-gray-500 mt-1">{stats.featuredVideos} featured</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <Video className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Comments</p>
                <p
                  className="text-3xl font-bold text-gray-900"
                  data-testid="total-comments-value"
                >
                  {stats.totalComments}
                </p>
                {stats.pendingComments > 0 ? (
                  <p className="text-sm text-yellow-700 mt-1">{stats.pendingComments} pending review</p>
                ) : (
                  <p className="text-sm text-gray-500 mt-1">All up to date</p>
                )}
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p
                  className="text-3xl font-bold text-gray-900"
                  data-testid="total-views-value"
                >
                  {stats.totalViews.toLocaleString()}
                </p>
                <p className="text-sm text-blue-600 mt-1">All time</p>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 12-Month Activity Chart */}
      {stats.history && hasActivity && (
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Posts, Videos & Comments (12 months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Bar ref={chartRef} data={chartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <Button
                      key={index}
                      type="button"
                      variant="outline"
                      aria-label={action.title}
                      className="h-auto p-4 flex flex-col items-start gap-2 hover:shadow-md transition-shadow"
                      onClick={() => router.push(action.href)}
                    >
                      <div className={`w-8 h-8 ${action.color} rounded-lg flex items-center justify-center`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">{action.title}</p>
                        <p className="text-sm text-gray-500">{action.description}</p>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
        </Card>

        {/* Real-time Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-60 text-gray-600" />
                  <p className="text-gray-500">No recent activity</p>
                  <p className="text-xs text-gray-600 mt-1">Activity will appear here as you use the dashboard</p>
                </div>
              ) : (
                recentActivity.slice(0, 4).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 ${
                        activity.status === "success"
                          ? "bg-green-500"
                          : activity.status === "pending"
                          ? "bg-yellow-500"
                          : "bg-gray-500"
                      }`}
                    ></div>
                    <div className="flex-1">
                      <p className="text-xs uppercase text-gray-600">{activity.type}</p>
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                    </div>
                    <Badge
                      variant={activity.status === "success" ? "default" : "secondary"}
                      className={activity.status === "pending" ? "bg-yellow-100 text-yellow-800" : ""}
                    >
                      {activity.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Performance - Only show if there's actual content */}
      {(stats.totalPosts > 0 || stats.totalVideos > 0 || stats.totalComments > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Content Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.totalPosts > 0 && (
                  <ProgressStat
                    label="Published Posts"
                    current={stats.publishedPosts}
                    total={stats.totalPosts}
                  />
                )}
                {stats.totalVideos > 0 && (
                  <ProgressStat
                    label="Featured Videos"
                    current={stats.featuredVideos}
                    total={stats.totalVideos}
                  />
                )}
                {stats.totalComments > 0 && (
                  <ProgressStat
                    label="Approved Comments"
                    current={stats.totalComments - stats.pendingComments}
                    total={stats.totalComments}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <p className={`text-3xl font-bold ${growthColor}`}>{sign}{Math.abs(stats.monthlyGrowth)}%</p>
                  <p className="text-sm text-gray-600">Content Growth</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Posts total (lifetime)</span>
                    <span className="text-sm font-medium">{stats.totalPosts}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Videos created overall</span>
                    <span className="text-sm font-medium">{stats.totalVideos}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Views accumulated</span>
                    <span className="text-sm font-medium">{stats.totalViews.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
