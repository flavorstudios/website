"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  LayoutDashboard,
  FileText,
  VideoIcon,
  MessageSquare,
  Settings,
  Globe,
  Bell,
  Search,
  Plus,
  TrendingUp,
  Eye,
  Calendar,
  LogOut,
  Menu,
  X,
  Sparkles,
  BarChart3,
  Zap,
} from "lucide-react"
import { BlogManager } from "./blog-manager"
import { VideoManager } from "./video-manager"
import { CommentManager } from "./comment-manager"
import { PageCustomizer } from "./page-customizer"
import { SystemTools } from "./system-tools"
import { logoutAdmin } from "../../actions"
import type { BlogPost, Comment, PageContent, SystemStats } from "@/lib/admin-store"

interface AdminDashboardProps {
  initialBlogs: BlogPost[]
  initialVideos: any[]
  initialComments: Comment[]
  initialPages: PageContent[]
  initialStats: SystemStats
}

export function AdminDashboard({
  initialBlogs,
  initialVideos,
  initialComments,
  initialPages,
  initialStats,
}: AdminDashboardProps) {
  const [activeSection, setActiveSection] = useState("overview")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard, badge: null },
    { id: "blogs", label: "Blog Posts", icon: FileText, badge: initialBlogs.length },
    { id: "videos", label: "Videos", icon: VideoIcon, badge: initialVideos.length },
    { id: "comments", label: "Comments", icon: MessageSquare, badge: initialStats.pendingComments },
    { id: "pages", label: "Pages", icon: Globe, badge: null },
    { id: "system", label: "System", icon: Settings, badge: null },
  ]

  const quickStats = [
    {
      title: "Total Posts",
      value: initialStats.totalPosts,
      change: "+12%",
      trend: "up",
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Videos",
      value: initialStats.totalVideos,
      change: "+8%",
      trend: "up",
      icon: VideoIcon,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Total Views",
      value: initialStats.totalViews.toLocaleString(),
      change: "+23%",
      trend: "up",
      icon: Eye,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Pending Comments",
      value: initialStats.pendingComments,
      change: initialStats.pendingComments > 0 ? "Needs attention" : "All clear",
      trend: initialStats.pendingComments > 0 ? "down" : "up",
      icon: MessageSquare,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ]

  const recentActivity = [
    { type: "blog", title: "New blog post published", time: "2 hours ago", status: "published" },
    { type: "video", title: "Video uploaded to YouTube", time: "4 hours ago", status: "published" },
    { type: "comment", title: "New comment awaiting moderation", time: "6 hours ago", status: "pending" },
    { type: "page", title: "Homepage content updated", time: "1 day ago", status: "updated" },
  ]

  if (!mounted) {
    return null
  }

  const renderContent = () => {
    switch (activeSection) {
      case "blogs":
        return <BlogManager initialBlogs={initialBlogs} />
      case "videos":
        return <VideoManager initialVideos={initialVideos} />
      case "comments":
        return <CommentManager initialComments={initialComments} />
      case "pages":
        return <PageCustomizer initialPages={initialPages} />
      case "system":
        return <SystemTools />
      default:
        return (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Welcome back, Admin! ✨</h1>
                  <p className="text-purple-100 text-lg">
                    Your creative empire awaits. Let's make something amazing today.
                  </p>
                </div>
                <div className="hidden md:block">
                  <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                    <Sparkles className="w-12 h-12 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickStats.map((stat, index) => (
                <Card
                  key={index}
                  className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                        <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                        <p
                          className={`text-sm font-medium ${stat.trend === "up" ? "text-green-600" : "text-orange-600"} flex items-center mt-1`}
                        >
                          <TrendingUp className="w-4 h-4 mr-1" />
                          {stat.change}
                        </p>
                      </div>
                      <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Activity */}
              <Card className="lg:col-span-2 border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Latest updates across your platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${
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
                        <Badge
                          variant={
                            activity.status === "published"
                              ? "default"
                              : activity.status === "pending"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {activity.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-purple-600" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription>Jump into your most common tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start hover:bg-purple-50 hover:border-purple-200"
                    onClick={() => setActiveSection("blogs")}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Post
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start hover:bg-blue-50 hover:border-blue-200"
                    onClick={() => setActiveSection("videos")}
                  >
                    <VideoIcon className="w-4 h-4 mr-2" />
                    Add Video
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start hover:bg-orange-50 hover:border-orange-200"
                    onClick={() => setActiveSection("comments")}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Review Comments
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start hover:bg-green-50 hover:border-green-200"
                    onClick={() => setActiveSection("pages")}
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Edit Pages
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? "w-64" : "w-16"} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col shadow-lg`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            {sidebarOpen && (
              <div className="ml-3">
                <h2 className="text-lg font-bold text-gray-900">Flavor Studios</h2>
                <p className="text-sm text-gray-500">Admin Panel</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center px-3 py-3 rounded-xl text-left transition-all duration-200 ${
                activeSection === item.id
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {sidebarOpen && (
                <>
                  <span className="ml-3 font-medium">{item.label}</span>
                  {item.badge !== null && (
                    <Badge variant={activeSection === item.id ? "secondary" : "default"} className="ml-auto">
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
            </button>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <Avatar className="w-10 h-10">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white">AD</AvatarFallback>
            </Avatar>
            {sidebarOpen && (
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">Admin</p>
                <p className="text-xs text-gray-500">admin@flavorstudios.in</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hover:bg-gray-100"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
              <div className="hidden md:flex items-center space-x-2">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search anything..."
                  className="border-0 bg-gray-50 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 w-64"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </Button>
              <Button variant="ghost" size="sm">
                <Calendar className="w-5 h-5" />
              </Button>
              <form action={logoutAdmin}>
                <Button variant="ghost" size="sm">
                  <LogOut className="w-5 h-5" />
                </Button>
              </form>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8 overflow-auto">{renderContent()}</main>
      </div>
    </div>
  )
}
