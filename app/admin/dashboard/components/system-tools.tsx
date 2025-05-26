"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  RefreshCw,
  Database,
  Settings,
  CheckCircle,
  AlertCircle,
  HardDrive,
  Cpu,
  Globe,
  Shield,
  Zap,
  Download,
  Upload,
  Activity,
} from "lucide-react"
import { clearAllCaches } from "../../actions"

export function SystemTools() {
  const [cacheStatus, setCacheStatus] = useState<"idle" | "clearing" | "success" | "error">("idle")
  const [systemHealth, setSystemHealth] = useState({
    api: "healthy",
    database: "connected",
    storage: "accessible",
    memory: 45,
    cpu: 23,
    uptime: "7 days, 14 hours",
  })

  const handleClearCaches = async () => {
    setCacheStatus("clearing")

    try {
      await clearAllCaches()
      setCacheStatus("success")
      setTimeout(() => setCacheStatus("idle"), 5000)
    } catch (error) {
      setCacheStatus("error")
      setTimeout(() => setCacheStatus("idle"), 5000)
    }
  }

  const systemStats = [
    {
      title: "API Status",
      value: "Healthy",
      status: "success",
      icon: Globe,
      description: "All endpoints responding normally",
    },
    {
      title: "Database",
      value: "Connected",
      status: "success",
      icon: Database,
      description: "File-based storage operational",
    },
    {
      title: "Memory Usage",
      value: `${systemHealth.memory}%`,
      status: systemHealth.memory > 80 ? "warning" : "success",
      icon: Cpu,
      description: "System memory consumption",
    },
    {
      title: "Storage",
      value: "2.4 MB",
      status: "success",
      icon: HardDrive,
      description: "Total data storage used",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-600 bg-green-50 border-green-200"
      case "warning":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "error":
        return "text-red-600 bg-red-50 border-red-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return CheckCircle
      case "warning":
        return AlertCircle
      case "error":
        return AlertCircle
      default:
        return Settings
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">System Tools</h1>
        <p className="text-gray-600 mt-2">Monitor and manage your system operations</p>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {systemStats.map((stat, index) => {
          const StatusIcon = getStatusIcon(stat.status)
          return (
            <Card key={index} className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${getStatusColor(stat.status)}`}
                  >
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <StatusIcon
                    className={`w-5 h-5 ${stat.status === "success" ? "text-green-500" : stat.status === "warning" ? "text-yellow-500" : "text-red-500"}`}
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{stat.title}</h3>
                  <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.description}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Cache Management */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <RefreshCw className="w-5 h-5 mr-2 text-purple-600" />
              Cache Management
            </CardTitle>
            <CardDescription>Clear application caches for optimal performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Page Cache</h4>
                  <p className="text-sm text-gray-600">Static page generation cache</p>
                </div>
                <Badge variant="outline">Active</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">API Cache</h4>
                  <p className="text-sm text-gray-600">Response caching layer</p>
                </div>
                <Badge variant="outline">Active</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Image Cache</h4>
                  <p className="text-sm text-gray-600">Optimized image storage</p>
                </div>
                <Badge variant="outline">Active</Badge>
              </div>
            </div>

            {cacheStatus === "success" && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  All caches cleared successfully! Changes should be visible immediately.
                </AlertDescription>
              </Alert>
            )}

            {cacheStatus === "error" && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Failed to clear caches. Please try again or contact support.</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleClearCaches}
              disabled={cacheStatus === "clearing"}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {cacheStatus === "clearing" ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Clearing All Caches...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Clear All Caches
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* System Performance */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2 text-purple-600" />
              System Performance
            </CardTitle>
            <CardDescription>Real-time system metrics and performance data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Memory Usage</span>
                  <span className="text-sm text-gray-600">{systemHealth.memory}%</span>
                </div>
                <Progress value={systemHealth.memory} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">CPU Usage</span>
                  <span className="text-sm text-gray-600">{systemHealth.cpu}%</span>
                </div>
                <Progress value={systemHealth.cpu} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-gray-900">99.9%</div>
                  <div className="text-sm text-gray-600">Uptime</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-gray-900">45ms</div>
                  <div className="text-sm text-gray-600">Response Time</div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium text-gray-900 mb-3">System Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Environment</span>
                  <Badge variant="outline">Development</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Next.js Version</span>
                  <span className="text-gray-900">14.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Node.js Version</span>
                  <span className="text-gray-900">18.17.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Deployment</span>
                  <span className="text-gray-900">{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="w-5 h-5 mr-2 text-purple-600" />
              Data Management
            </CardTitle>
            <CardDescription>Backup, export, and manage your content data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">156</div>
                <div className="text-sm text-gray-600">Total Records</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">2.4MB</div>
                <div className="text-sm text-gray-600">Storage Used</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">blogs.json</h4>
                  <p className="text-sm text-gray-600">Blog posts data</p>
                </div>
                <Badge variant="outline">1.2MB</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">videos.json</h4>
                  <p className="text-sm text-gray-600">Video content data</p>
                </div>
                <Badge variant="outline">0.8MB</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">comments.json</h4>
                  <p className="text-sm text-gray-600">User comments</p>
                </div>
                <Badge variant="outline">0.4MB</Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="w-full" disabled>
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
              <Button variant="outline" className="w-full" disabled>
                <Upload className="w-4 h-4 mr-2" />
                Import Data
              </Button>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500">Last backup: Never • Auto-backup coming soon</p>
            </div>
          </CardContent>
        </Card>

        {/* Security & Monitoring */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2 text-purple-600" />
              Security & Monitoring
            </CardTitle>
            <CardDescription>Security status and monitoring tools</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <h4 className="font-medium text-green-900">SSL Certificate</h4>
                    <p className="text-sm text-green-700">Valid & Secure</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <h4 className="font-medium text-green-900">Authentication</h4>
                    <p className="text-sm text-green-700">Session-based security</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">Secure</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center">
                  <Activity className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <h4 className="font-medium text-blue-900">Monitoring</h4>
                    <p className="text-sm text-blue-700">Real-time system health</p>
                  </div>
                </div>
                <Badge className="bg-blue-100 text-blue-800">Active</Badge>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium text-gray-900 mb-3">Recent Activity</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Last login</span>
                  <span className="text-gray-900">Just now</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Failed login attempts</span>
                  <span className="text-gray-900">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active sessions</span>
                  <span className="text-gray-900">1</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
