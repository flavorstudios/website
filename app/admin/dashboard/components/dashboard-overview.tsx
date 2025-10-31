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
import { PageHeader } from "@/components/admin/page-header";
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
import { SectionId } from "../sections";
import { HttpError } from "@/lib/http";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAdminDashboardBlogs } from "@/hooks/useAdminDashboardBlogs";

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
  section: SectionId;
}

const quickActions: QuickAction[] = [
  {
    title: "Create New Post",
    description: "Write a new blog article",
    icon: FileText,
    href: "/admin/dashboard/blog-posts",
    color: "bg-blue-500",
    section: "blogs",
  },
  {
    title: "Add Video",
    description: "Upload new video content",
    icon: Video,
    href: "/admin/dashboard/videos",
    color: "bg-purple-500",
    section: "videos",
  },
  {
    title: "Moderate Comments",
    description: "Review pending comments",
    icon: MessageSquare,
    href: "/admin/dashboard/comments",
    color: "bg-green-500",
    section: "comments",
  },
  {
    title: "Manage Users",
    description: "Edit user roles and permissions",
    icon: Users,
    href: "/admin/dashboard/users",
    color: "bg-teal-500",
    section: "users",
  },
];

interface DashboardOverviewProps {
  onNavigateSection?: (section: SectionId, href: string) => void;
}

export default function DashboardOverview({
  onNavigateSection,
}: DashboardOverviewProps) {
  useEffect(() => {
    if (typeof window !== "undefined" && !(window as any).Chart) {
      (window as any).Chart = ChartJS;
    }
  }, []);

  const { theme } = useTheme();
  const router = useRouter();
  const { hasPermission } = useRole();
  const canViewAnalytics = hasPermission?.("canViewAnalytics") ?? false;
  const canManageBlogs = hasPermission?.("canManageBlogs") ?? false;

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
  const isInitialLoading = showInitialSpinner || (statsLoading && !stats);
  const baseStats = useMemo<DashboardStats>(
    () => ({
      totalPosts: 0,
      totalVideos: 0,
      totalComments: 0,
      totalViews: 0,
      pendingComments: 0,
      publishedPosts: 0,
      featuredVideos: 0,
      monthlyGrowth: 0,
      history: [],
    }),
    [],
  );
  const effectiveStats = stats ?? baseStats;
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

  // Admin blogs (for surfacing "Firestore missing" banner)
  const blogQuery = useAdminDashboardBlogs(canManageBlogs);
  const blogQueryError = blogQuery.error as HttpError | undefined;
  const showBlogUnavailable = blogQueryError?.status === 503;

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

  const shouldShowHistoryCard =
    hasActivity ||
    effectiveStats.totalPosts > 0 ||
    effectiveStats.totalVideos > 0 ||
    effectiveStats.totalComments > 0;

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

  const fatalError = hasNetworkError && !stats;

  if (!canViewAnalytics || unauthorized) {
    return (
      <div
        className="flex h-64 items-center justify-center"
        data-testid="analytics-permission-block"
        aria-live="polite"
      >
        <div className="text-center space-y-2">
          <p className="text-gray-600">You don&apos;t have permission to view analytics.</p>
        </div>
      </div>
    );
  }

  if (fatalError) {
    const code = diagnosticCode || "DASHLOAD_NETWORK";
    return (
      <div
        className="flex h-64 items-center justify-center"
        role="banner"
        data-testid="dashboard-error"
      >
        <div
          className="max-w-md rounded-xl border border-red-200 bg-red-50 px-6 py-5 text-center shadow-sm"
          role="status"
          aria-live="assertive"
        >
          <h2 className="mb-2 text-xl font-semibold text-red-700">Dashboard data unavailable</h2>
          <p className="mb-3 text-red-600">Unable to load dashboard data. Please try again.</p>
          <p
            className="mb-4 text-xs font-semibold uppercase tracking-wide text-red-500"
            data-testid="dashboard-error-code"
          >
            {code}
          </p>
          <Button
            type="button"
            onClick={refresh}
            className="rounded-xl bg-orange-800 text-white hover:bg-orange-900"
          >
            Retry Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const monthlyGrowth = effectiveStats.monthlyGrowth;
  const sign = monthlyGrowth > 0 ? "+" : monthlyGrowth < 0 ? "-" : "";
  const growthColor =
    monthlyGrowth > 0
      ? "text-green-700"
      : monthlyGrowth < 0
        ? "text-red-700"
        : "text-gray-700";

  return (
    <div className="space-y-6" aria-busy={isInitialLoading || statsQuery.isFetching}>
      <PageHeader
        level={2}
        className="mb-4"
        containerClassName="flex-col"
        headingClassName="text-2xl font-semibold text-foreground"
        descriptionClassName="text-sm text-muted-foreground"
        title="Dashboard Overview"
        description="Track activity, performance, and quick actions for your studio"
      />
      {showBlogUnavailable && (
        <Alert
          variant="destructive"
          data-testid="admin-dashboard-blog-unavailable"
          role="alert"
        >
          <AlertTitle>Blog data unavailable</AlertTitle>
          <AlertDescription>
            Firebase Admin credentials are missing. Set{" "}
            <code>FIREBASE_SERVICE_ACCOUNT_KEY</code> (or{" "}
            <code>FIREBASE_SERVICE_ACCOUNT_JSON</code>) and redeploy to restore Firestore-backed
            blog content.
          </AlertDescription>
        </Alert>
      )}
      {isInitialLoading && (
        <div
          className="flex items-center gap-3 rounded-lg border border-border bg-background/80 px-4 py-3 text-sm text-muted-foreground"
          data-testid="dashboard-loading"
          role="status"
          aria-live="polite"
        >
          <span
            aria-hidden="true"
            className="h-4 w-4 flex-none animate-spin rounded-full border-2 border-primary border-t-transparent"
          />
          <span className="font-medium text-foreground">Loading Admin Dashboard...</span>
        </div>
      )}
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
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Posts</p>
                <p
                  className="text-3xl font-bold text-gray-900"
                  data-testid="total-posts-value"
                >
                  {effectiveStats.totalPosts}
                </p>
                <p className={`text-sm flex items-center mt-1 ${growthColor}`}>
                  {monthlyGrowth !== 0 && (
                    monthlyGrowth > 0 ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )
                  )}
                  {sign}
                  {Math.abs(monthlyGrowth)}% posts+videos growth this month
                </p>
                {effectiveStats.totalPosts === 0 && <p className="text-sm text-gray-500 mt-1">No posts yet</p>}
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
                  {effectiveStats.totalVideos}
                </p>
                <p className="text-sm text-gray-500 mt-1">{effectiveStats.featuredVideos} featured</p>
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
                  {effectiveStats.totalComments}
                </p>
                {effectiveStats.pendingComments > 0 ? (
                  <p className="text-sm text-yellow-700 mt-1">{effectiveStats.pendingComments} pending review</p>
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
                  {effectiveStats.totalViews.toLocaleString()}
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

      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">System Tools</h2>
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Run maintenance utilities after publishing large updates.</p>
            <p className="text-sm text-muted-foreground">Access deployment helpers without leaving the dashboard overview.</p>
          </div>
          <Button
            type="button"
            onClick={() => {
              if (onNavigateSection) {
                onNavigateSection("system", "/admin/dashboard/system");
                return;
              }
              router.push("/admin/dashboard/system");
            }}
            className="h-auto rounded-lg bg-orange-600 px-5 py-2 text-white shadow-sm transition-colors hover:bg-orange-700"
          >
            Open System Tools
          </Button>
        </div>
      </div>

      {/* 12-Month Activity Chart */}
      {stats && shouldShowHistoryCard && (
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Posts, Videos & Comments (12 months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {hasActivity ? (
                <Bar
                  ref={chartRef}
                  data={chartData}
                  options={chartOptions}
                  aria-label="Posts, Videos & Comments (12 months) chart"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground text-center">
                  Historical engagement data will appear once your content starts getting views.
                </div>
              )}
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
                    onClick={() => {
                      if (onNavigateSection) {
                        onNavigateSection(action.section, action.href);
                        return;
                      }
                      router.push(action.href);
                    }}
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
      {stats && (
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
                <ProgressStat
                  label="Published Posts"
                  current={effectiveStats.publishedPosts}
                  total={effectiveStats.totalPosts}
                />
                <ProgressStat
                  label="Featured Videos"
                  current={effectiveStats.featuredVideos}
                  total={effectiveStats.totalVideos}
                />
                <ProgressStat
                  label="Approved Comments"
                  current={Math.max(0, effectiveStats.totalComments - effectiveStats.pendingComments)}
                  total={effectiveStats.totalComments}
                />
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
                  <p className={`text-3xl font-bold ${growthColor}`}>{sign}{Math.abs(monthlyGrowth)}%</p>
                  <p className="text-sm text-gray-600">Content Growth</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Posts total (lifetime)</span>
                    <span className="text-sm font-medium">{effectiveStats.totalPosts}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Videos created overall</span>
                    <span className="text-sm font-medium">{effectiveStats.totalVideos}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Views accumulated</span>
                    <span className="text-sm font-medium">{effectiveStats.totalViews.toLocaleString()}</span>
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
