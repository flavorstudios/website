"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Settings,
  Database,
  Activity,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  Shield,
  Globe,
  Cpu,
  CheckCircle,
  AlertCircle,
} from "lucide-react"

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
    totalPosts: 24,
    totalVideos: 8,
    totalComments: 156,
    lastBackup: "2024-01-15 10:30 AM",
  })
  const [loading, setLoading] = useState(false)

  const handleClearCache = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/system/cache", { method: "DELETE" })
      if (response.ok) {
        alert("Cache cleared successfully!")
      }
    } catch (error) {
      console.error("Failed to clear cache:", error)
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
      }
    } catch (error) {
      console.error("Failed to create backup:", error)
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
      }
    } catch (error) {
      console.error("Failed to optimize database:", error)
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
          <TabsTrigger value="security">Security</TabsTrigger>
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
            <Card>
              <CardHeader>
                <CardTitle>Cache Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Clear cached data to improve performance and ensure fresh content delivery.
                </p>
                <Button onClick={handleClearCache} disabled={loading} className="w-full">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All Cache
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Database Optimization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">Optimize database tables and indexes for better performance.</p>
                <Button onClick={handleOptimizeDatabase} disabled={loading} variant="outline" className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Optimize Database
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Site Maintenance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="w-full">
                  <Globe className="h-4 w-4 mr-2" />
                  Check Site Health
                </Button>
                <Button variant="outline" className="w-full">
                  <Activity className="h-4 w-4 mr-2" />
                  Run Diagnostics
                </Button>
                <Button variant="outline" className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Update System
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backup */}
        <TabsContent value="backup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Backup Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button onClick={handleBackup} disabled={loading} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Create Backup
                </Button>
                <Button variant="outline" className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Restore Backup
                </Button>
                <Button variant="outline" className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Backup Settings
                </Button>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3">Recent Backups</h4>
                <div className="space-y-2">
                  {[
                    { name: "backup-2024-01-15.zip", size: "45.2 MB", date: "2024-01-15 10:30 AM" },
                    { name: "backup-2024-01-14.zip", size: "44.8 MB", date: "2024-01-14 10:30 AM" },
                    { name: "backup-2024-01-13.zip", size: "44.1 MB", date: "2024-01-13 10:30 AM" },
                  ].map((backup, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium text-sm">{backup.name}</p>
                        <p className="text-xs text-gray-500">
                          {backup.date} • {backup.size}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">SSL Certificate</span>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Valid
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Firewall Status</span>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Login Attempts</span>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    <AlertCircle className="h-3 w-3 mr-1" />2 Failed
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full">
                  <Shield className="h-4 w-4 mr-2" />
                  Security Scan
                </Button>
                <Button variant="outline" className="w-full">
                  <Activity className="h-4 w-4 mr-2" />
                  View Access Logs
                </Button>
                <Button variant="outline" className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Security Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
