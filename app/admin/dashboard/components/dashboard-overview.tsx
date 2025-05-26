"use client"

import { useState } from "react"

export function DashboardOverview() {
  const [stats, setStats] = useState({
    totalPosts: 24,
    totalVideos: 8,
    totalComments: 156,
    totalViews: 12500,
    pendingComments: 3,
    draftPosts: 5,
  })

  const quickStats = [
    {
      title: "Total Posts",
      value: stats.totalPosts,
      change: "+12%",
      trend: "up",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      color: "blue",
    },
    {
      title: "Videos",
      value: stats.totalVideos,
      change: "+8%",
      trend: "up",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      ),
      color: "purple",
    },
    {
      title: "Total Views",
      value: `${(stats.totalViews / 1000).toFixed(1)}K`,
      change: "+23%",
      trend: "up",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
      ),
      color: "green",
    },
    {
      title: "Comments",
      value: stats.totalComments,
      change: stats.pendingComments > 0 ? `${stats.pendingComments} pending` : "All reviewed",
      trend: stats.pendingComments > 0 ? "warning" : "up",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      ),
      color: "orange",
    },
  ]

  const recentActivity = [
    { type: "blog", title: "New blog post: 'Advanced Blender Techniques'", time: "2 hours ago", status: "published" },
    { type: "video", title: "Video uploaded: 'Character Animation Basics'", time: "4 hours ago", status: "published" },
    { type: "comment", title: "New comment on 'Getting Started with 3D'", time: "6 hours ago", status: "pending" },
    { type: "page", title: "Homepage content updated", time: "1 day ago", status: "updated" },
    { type: "user", title: "New user registration", time: "2 days ago", status: "active" },
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "text-blue-600 bg-blue-50",
      purple: "text-purple-600 bg-purple-50",
      green: "text-green-600 bg-green-50",
      orange: "text-orange-600 bg-orange-50",
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, Admin! ✨</h1>
            <p className="text-purple-100 text-lg">Your creative empire is thriving. Here's what's happening today.</p>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p
                  className={`text-sm font-medium flex items-center mt-1 ${
                    stat.trend === "up"
                      ? "text-green-600"
                      : stat.trend === "warning"
                        ? "text-orange-600"
                        : "text-red-600"
                  }`}
                >
                  <svg
                    className={`w-4 h-4 mr-1 ${stat.trend === "up" ? "rotate-0" : "rotate-180"}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 14l5-5 5 5" />
                  </svg>
                  {stat.change}
                </p>
              </div>
              <div className={`w-12 h-12 ${getColorClasses(stat.color)} rounded-xl flex items-center justify-center`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button className="w-full flex items-center px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create New Post
            </button>
            <button className="w-full flex items-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              Upload Video
            </button>
            <button className="w-full flex items-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              Review Comments
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            Recent Activity
          </h3>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div
                  className={`w-2 h-2 rounded-full mt-2 ${
                    activity.status === "published"
                      ? "bg-green-500"
                      : activity.status === "pending"
                        ? "bg-orange-500"
                        : "bg-blue-500"
                  }`}
                ></div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-500">{activity.time}</p>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    activity.status === "published"
                      ? "bg-green-100 text-green-800"
                      : activity.status === "pending"
                        ? "bg-orange-100 text-orange-800"
                        : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {activity.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          System Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <span className="text-sm font-medium text-green-900">Server Status</span>
            <span className="px-2 py-1 text-xs bg-green-500 text-white rounded-full">Online</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <span className="text-sm font-medium text-green-900">Database</span>
            <span className="px-2 py-1 text-xs bg-green-500 text-white rounded-full">Connected</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <span className="text-sm font-medium text-blue-900">Cache</span>
            <span className="px-2 py-1 text-xs bg-blue-500 text-white rounded-full">Optimized</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
            <span className="text-sm font-medium text-purple-900">Uptime</span>
            <span className="px-2 py-1 text-xs bg-purple-500 text-white rounded-full">99.9%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
