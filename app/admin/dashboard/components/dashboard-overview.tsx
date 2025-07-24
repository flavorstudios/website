"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, FileText, Video, MessageSquare, Eye, Calendar, Activity, Plus, ExternalLink } from "lucide-react"

interface DashboardStats {
  totalPosts: number
  totalVideos: number
  totalComments: number
  totalViews: number
  pendingComments: number
  publishedPosts: number
  featuredVideos: number
  monthlyGrowth: number
}

interface ActivityItem {
  id: string
  type: string
  title: string
  description: string
  timestamp: string
  status: string
}

export function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Stats
      const statsResponse = await fetch("/api/admin/stats", { credentials: "include" })
      if (statsResponse.status === 401) {
        setError("You do not have permission to view dashboard analytics. Contact your admin.")
        setStats(null)
        setRecentActivity([])
        return
      }
      if (!statsResponse.ok) {
        const data = await statsResponse.json().catch(() => ({}))
        setError(data.error || "Failed to load stats")
        setStats(null)
        setRecentActivity([])
        return
      }
      const statsData = await statsResponse.json()
      setStats(statsData)

      // Activity
      const activityResponse = await fetch("/api/admin/activity", { credentials: "include" })
      if (activityResponse.status === 401) {
        setError("You do not have permission to view recent activity. Contact your admin.")
        setRecentActivity([])
        return
      }
      if (!activityResponse.ok) {
        const data = await activityResponse.json().catch(() => ({}))
        setError(data.error || "Failed to load activity")
        setRecentActivity([])
        return
      }
      const activityData = await activityResponse.json()
      setRecentActivity(activityData.activities || [])
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
      setError("Network error while loading dashboard data")
      setStats(null)
      setRecentActivity([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
    const interval = setInterval(loadDashboardData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
    // eslint-disable-next-line
  }, [])

  const quickActions = [
    {
      title: "Create New Post",
      description: "Write a new blog article",
      icon: FileText,
      action: "blogs",
      color: "bg-blue-500",
    },
    {
      title: "Add Video",
      description: "Upload new video content",
      icon: Video,
      action: "videos",
      color: "bg-purple-500",
    },
    {
      title: "Moderate Comments",
      description: "Review pending comments",
      icon: MessageSquare,
      action: "comments",
      color: "bg-green-500",
    },
    {
      title: "Edit Pages",
      description: "Update website content",
      icon: FileText,
      action: "pages",
      color: "bg-orange-500",
    },
  ]

  const handleQuickAction = (action: string) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("admin-navigate", { detail: action }))
    }
  }

  // Error overlay (UI block, retry supported)
  if (error && !loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-2">Unable to load dashboard data</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadDashboardData} variant="outline">
            Retry Dashboard
          </Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-3 text-gray-600">Loading real-time data...</span>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-600 mb-2">Unable to load dashboard data</p>
          <Button onClick={loadDashboardData} variant="outline">
            Refresh Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back! 👋</h1>
            <p className="text-purple-100 text-lg">Here's what's happening with your Flavor Studios website today.</p>
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

      {/* Real-time Stats Grid - Only Real Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Posts</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalPosts}</p>
                {stats.monthlyGrowth > 0 && (
                  <p className="text-sm text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />+{stats.monthlyGrowth}% this month
                  </p>
                )}
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
                <p className="text-3xl font-bold text-gray-900">{stats.totalVideos}</p>
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
                <p className="text-3xl font-bold text-gray-900">{stats.totalComments}</p>
                {stats.pendingComments > 0 ? (
                  <p className="text-sm text-yellow-600 mt-1">{stats.pendingComments} pending review</p>
                ) : (
                  <p className="text-sm text-gray-500 mt-1">All up to date</p>
                )}
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</p>
                <p className="text-sm text-blue-600 mt-1">This month</p>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
                const Icon = action.icon
                return (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start gap-2 hover:shadow-md transition-shadow"
                    onClick={() => handleQuickAction(action.action)}
                  >
                    <div className={`w-8 h-8 ${action.color} rounded-lg flex items-center justify-center`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">{action.title}</p>
                      <p className="text-sm text-gray-500">{action.description}</p>
                    </div>
                  </Button>
                )
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
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50 text-gray-400" />
                  <p className="text-gray-500">No recent activity</p>
                  <p className="text-xs text-gray-400 mt-1">Activity will appear here as you use the dashboard</p>
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
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Published Posts</span>
                      <span className="text-sm text-gray-600">
                        {stats.publishedPosts}/{stats.totalPosts}
                      </span>
                    </div>
                    <Progress value={(stats.publishedPosts / stats.totalPosts) * 100} className="h-2" />
                  </div>
                )}
                {stats.totalVideos > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Featured Videos</span>
                      <span className="text-sm text-gray-600">
                        {stats.featuredVideos}/{stats.totalVideos}
                      </span>
                    </div>
                    <Progress value={(stats.featuredVideos / stats.totalVideos) * 100} className="h-2" />
                  </div>
                )}
                {stats.totalComments > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Approved Comments</span>
                      <span className="text-sm text-gray-600">
                        {stats.totalComments - stats.pendingComments}/{stats.totalComments}
                      </span>
                    </div>
                    <Progress
                      value={((stats.totalComments - stats.pendingComments) / stats.totalComments) * 100}
                      className="h-2"
                    />
                  </div>
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
                  <p className="text-3xl font-bold text-green-600">+{stats.monthlyGrowth}%</p>
                  <p className="text-sm text-gray-600">Content Growth</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Posts</span>
                    <span className="text-sm font-medium">{stats.totalPosts}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Total Videos</span>
                    <span className="text-sm font-medium">{stats.totalVideos}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Total Views</span>
                    <span className="text-sm font-medium">{stats.totalViews.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
