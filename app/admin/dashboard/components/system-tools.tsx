"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Database, Activity, Download, Trash2, RefreshCw, Globe, Cpu, CheckCircle, AlertCircle } from "lucide-react"
import { CacheCleaner } from "./cache-cleaner"

interface SystemStats {
  uptime: string
  memoryUsage: number
  diskUsage: number
  activeUsers: number
  totalPosts: number
  totalVideos: number
  totalComments: number
  lastBackup: string
}

export function SystemTools() {
  const [stats, setStats] = useState<SystemStats>({
    uptime: "15 days, 8 hours",
    memoryUsage: 45,
    diskUsage: 62,
    activeUsers: 3,
    totalPosts: 0,
    totalVideos: 0,
    totalComments: 0,
    lastBackup: "Never",
  })
  const [loading, setLoading] = useState(false)
  const [cleanupResult, setCleanupResult] = useState<any>(null)

  const handleClearCache = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/system/cache", { method: "DELETE" })
      if (response.ok) {
        alert("Cache cleared successfully!")
      } else {
        alert("Failed to clear cache")
      }
    } catch (error) {
      console.error("Failed to clear cache:", error)
      alert("Failed to clear cache")
    } finally {
      setLoading(false)
    }
  }

  const handleBackup = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/system/backup", { method: "POST" })
      if (response.ok) {
        alert("Backup created successfully!")
        setStats((prev) => ({ ...prev, lastBackup: new Date().toLocaleString() }))
      } else {
        alert("Failed to create backup")
      }
    } catch (error) {
      console.error("Failed to create backup:", error)
      alert("Failed to create backup")
    } finally {
      setLoading(false)
    }
  }

  const handleOptimizeDatabase = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/system/optimize", { method: "POST" })
      if (response.ok) {
        alert("Database optimized successfully!")
      } else {
        alert("Failed to optimize database")
      }
    } catch (error) {
      console.error("Failed to optimize database:", error)
      alert("Failed to optimize database")
    } finally {
      setLoading(false)
    }
  }

  const handleCleanup = async () => {
    if (!confirm("Are you sure you want to clean up all dummy content? This cannot be undone.")) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/admin/cleanup", { method: "POST" })
      const result = await response.json()

      if (result.success) {
        setCleanupResult(result.report)
        alert(
          `Cleanup completed!\n\nDeleted:\n- ${result.report.blogPostsDeleted} blog posts\n- ${result.report.watchVideosDeleted} videos\n- ${result.report.blogCategoriesDeleted} invalid blog categories\n- ${result.report.watchCategoriesDeleted} invalid video categories`,
        )
      } else {
        alert("Cleanup failed: " + result.error)
      }
    } catch (error) {
      console.error("Cleanup failed:", error)
      alert("Cleanup failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">System Tools</h2>
        <p className="text-gray-600">Monitor and maintain your website system</p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
          <TabsTrigger value="cleanup">Cleanup</TabsTrigger>
        </TabsList>

        {/* System Overview */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Blog Posts</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalPosts}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Database className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Videos</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalVideos}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                    <Activity className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Comments</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalComments}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                    <Globe className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Users</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.activeUsers}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                    <Activity className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Performance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5" />
                  System Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Memory Usage</span>
                    <span className="text-sm text-gray-600">{stats.memoryUsage}%</span>
                  </div>
                  <Progress value={stats.memoryUsage} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Disk Usage</span>
                    <span className="text-sm text-gray-600">{stats.diskUsage}%</span>
                  </div>
                  <Progress value={stats.diskUsage} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">System Uptime</span>
                  <span className="text-sm text-gray-600">{stats.uptime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Website Status</span>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Online
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Database Status</span>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Last Backup</span>
                  <span className="text-sm text-gray-600">{stats.lastBackup}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Maintenance */}
        <TabsContent value="maintenance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CacheCleaner />

            <Card>
              <CardHeader>
                <CardTitle>Database Optimization</CardTitle>
                <CardDescription>Optimize database for better performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={handleOptimizeDatabase} disabled={loading} variant="outline" className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {loading ? "Optimizing..." : "Optimize Database"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Backup */}
        <TabsContent value="backup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Backup Management</CardTitle>
              <CardDescription>Create and manage system backups</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button onClick={handleBackup} disabled={loading} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                {loading ? "Creating Backup..." : "Create Backup"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cleanup */}
        <TabsContent value="cleanup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Content Cleanup
              </CardTitle>
              <CardDescription>Remove dummy content and invalid categories from the system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Warning:</strong> This will permanently delete all test/dummy content and invalid categories.
                </AlertDescription>
              </Alert>

              {cleanupResult && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Last cleanup: Deleted {cleanupResult.blogPostsDeleted} blog posts,{" "}
                    {cleanupResult.watchVideosDeleted} videos, {cleanupResult.blogCategoriesDeleted} invalid blog
                    categories, and {cleanupResult.watchCategoriesDeleted} invalid video categories.
                  </AlertDescription>
                </Alert>
              )}

              <Button onClick={handleCleanup} disabled={loading} variant="destructive" className="w-full">
                <Trash2 className="mr-2 h-4 w-4" />
                {loading ? "Cleaning Up..." : "Clean Up Dummy Content"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
