"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Settings,
  Globe,
  Shield,
  Database,
  Mail,
  Palette,
  Users,
  Activity,
  HardDrive,
  Cpu,
  CheckCircle,
  Save,
  Download,
  Upload,
  Trash2,
} from "lucide-react"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

interface SystemStats {
  cpuUsage: number
  memoryUsage: number
  diskUsage: number
  activeUsers: number
  uptime: string
}

const systemStats: SystemStats = {
  cpuUsage: 45,
  memoryUsage: 62,
  diskUsage: 78,
  activeUsers: 12,
  uptime: "15 days, 8 hours",
}

// Safe logger (dev only, invisible in prod)
function safeLogError(...args: unknown[]) {
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.error(...args)
  }
}

export function SystemSettings() {
  const [settings, setSettings] = useState({
    siteName: "Flavor Studios",
    siteDescription: "Professional video production and creative services",
    adminEmail: "",
    timezone: "UTC-5",
    language: "en",
    maintenanceMode: false,
    registrationEnabled: true,
    commentsEnabled: true,
    analyticsEnabled: true,
    backupEnabled: true,
    sslEnabled: true,
    cacheEnabled: true,
  })

  // Fetch available admin emails (from-addresses) securely
  const [fromAddresses, setFromAddresses] = useState<string[]>([])
  useEffect(() => {
    fetch("/api/admin/from-addresses")
      .then((res) => res.json())
      .then((data) => {
        setFromAddresses(data.addresses || [])
        // If settings.adminEmail is empty, default to first
        if (!settings.adminEmail && data.addresses && data.addresses.length > 0) {
          setSettings((prev) => ({ ...prev, adminEmail: data.addresses[0] }))
        }
      })
      .catch((err) => {
        safeLogError("Failed to load admin from-addresses:", err)
        setFromAddresses([])
      })
    // eslint-disable-next-line
  }, [])

  const handleSave = () => {
    // Save logic placeholder
    safeLogError("Settings saved:", settings)
  }

  const handleBackup = () => {
    safeLogError("Creating backup...")
  }

  const handleRestore = () => {
    safeLogError("Restoring from backup...")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            System Settings
          </h2>
          <p className="text-muted-foreground">Configure your website and system preferences</p>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" aria-label="Download backup" onClick={handleBackup}>
                <Download className="h-4 w-4 mr-2" aria-hidden="true" />
                Backup
              </Button>
            </TooltipTrigger>
            <TooltipContent>Download site backup</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button aria-label="Save settings" onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" aria-hidden="true" />
                Save Settings
              </Button>
            </TooltipTrigger>
            <TooltipContent>Save all settings</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-4 md:grid-cols-6 overflow-x-auto">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" aria-hidden="true" />
                  Site Information
                </CardTitle>
                <CardDescription>Basic information about your website</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={settings.siteName}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Textarea
                    id="siteDescription"
                    rows={3}
                    value={settings.siteDescription}
                    onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="adminEmail">Admin Email</Label>
                  <Select
                    value={settings.adminEmail}
                    onValueChange={(email) => setSettings((prev) => ({ ...prev, adminEmail: email }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an email..." />
                    </SelectTrigger>
                    <SelectContent>
                      {fromAddresses.length === 0 ? (
                        <SelectItem value="">No emails configured</SelectItem>
                      ) : (
                        fromAddresses.map((email) => (
                          <SelectItem value={email} key={email}>{email}</SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" aria-hidden="true" />
                  Regional Settings
                </CardTitle>
                <CardDescription>Timezone and language preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={settings.timezone}
                    onValueChange={(timezone) => setSettings((prev) => ({ ...prev, timezone }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC-5">Eastern Time (UTC-5)</SelectItem>
                      <SelectItem value="UTC-6">Central Time (UTC-6)</SelectItem>
                      <SelectItem value="UTC-7">Mountain Time (UTC-7)</SelectItem>
                      <SelectItem value="UTC-8">Pacific Time (UTC-8)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={settings.language}
                    onValueChange={(language) => setSettings((prev) => ({ ...prev, language }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" aria-hidden="true" />
                Security & Access
              </CardTitle>
              <CardDescription>Configure security settings and user access</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="maintenance">Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">Temporarily disable public access to your site</p>
                </div>
                <Switch
                  id="maintenance"
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="registration">User Registration</Label>
                  <p className="text-sm text-muted-foreground">Allow new users to register accounts</p>
                </div>
                <Switch
                  id="registration"
                  checked={settings.registrationEnabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, registrationEnabled: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="ssl">SSL/HTTPS</Label>
                  <p className="text-sm text-muted-foreground">Force secure connections</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" aria-hidden="true" />
                    Active
                  </Badge>
                  <Switch
                    id="ssl"
                    checked={settings.sslEnabled}
                    onCheckedChange={(checked) => setSettings({ ...settings, sslEnabled: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" aria-hidden="true" />
                Email Configuration
              </CardTitle>
              <CardDescription>Configure email delivery settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="smtpHost">SMTP Host</Label>
                <Input id="smtpHost" placeholder="smtp.gmail.com" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input id="smtpPort" placeholder="587" />
                </div>
                <div>
                  <Label htmlFor="smtpSecurity">Security</Label>
                  <Select defaultValue="tls">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="tls">TLS</SelectItem>
                      <SelectItem value="ssl">SSL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="smtpUsername">Username</Label>
                <Input id="smtpUsername" placeholder="your-email@gmail.com" />
              </div>
              <div>
                <Label htmlFor="smtpPassword">Password</Label>
                <Input id="smtpPassword" type="password" placeholder="••••••••" />
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" className="w-full" aria-label="Test email configuration">
                    Test Email Configuration
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Send test email with current configuration</TooltipContent>
              </Tooltip>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" aria-hidden="true" />
                Theme & Appearance
              </CardTitle>
              <CardDescription>Customize the look and feel of your site</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="theme">Site Theme</Label>
                <Select defaultValue="default">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="dark">Dark Mode</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex items-center gap-2">
                  <Input id="primaryColor" value="#8B5CF6" aria-label="Primary Color" />
                  <div className="w-10 h-10 rounded border bg-purple-500" aria-label="Current primary color"></div>
                </div>
              </div>
              <div>
                <Label htmlFor="logo">Site Logo</Label>
                <div className="flex items-center gap-2">
                  <Input id="logo" placeholder="Upload logo..." />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" aria-label="Upload logo">
                        <Upload className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Upload your site logo</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Status */}
        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" aria-hidden="true" />
                  System Performance
                </CardTitle>
                <CardDescription>Current system resource usage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="flex items-center gap-2">
                      <Cpu className="h-4 w-4" aria-hidden="true" />
                      CPU Usage
                    </Label>
                    <span className="text-sm font-medium">{systemStats.cpuUsage}%</span>
                  </div>
                  <Progress value={systemStats.cpuUsage} className="h-2" aria-label="CPU Usage Progress" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="flex items-center gap-2">
                      <Database className="h-4 w-4" aria-hidden="true" />
                      Memory Usage
                    </Label>
                    <span className="text-sm font-medium">{systemStats.memoryUsage}%</span>
                  </div>
                  <Progress value={systemStats.memoryUsage} className="h-2" aria-label="Memory Usage Progress" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="flex items-center gap-2">
                      <HardDrive className="h-4 w-4" aria-hidden="true" />
                      Disk Usage
                    </Label>
                    <span className="text-sm font-medium">{systemStats.diskUsage}%</span>
                  </div>
                  <Progress value={systemStats.diskUsage} className="h-2" aria-label="Disk Usage Progress" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" aria-hidden="true" />
                  System Status
                </CardTitle>
                <CardDescription>Current system information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Active Users</Label>
                  <Badge>{systemStats.activeUsers}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <Label>System Uptime</Label>
                  <span className="text-sm font-medium">{systemStats.uptime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <Label>Cache Status</Label>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" aria-hidden="true" />
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <Label>Database Status</Label>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" aria-hidden="true" />
                    Connected
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Backup Settings */}
        <TabsContent value="backup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" aria-hidden="true" />
                Backup & Restore
              </CardTitle>
              <CardDescription>Manage your website backups and data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoBackup">Automatic Backups</Label>
                  <p className="text-sm text-muted-foreground">Create daily backups automatically</p>
                </div>
                <Switch
                  id="autoBackup"
                  checked={settings.backupEnabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, backupEnabled: checked })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={handleBackup} className="w-full" aria-label="Create backup">
                      <Download className="h-4 w-4 mr-2" aria-hidden="true" />
                      Create Backup
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Create a new site backup</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" onClick={handleRestore} className="w-full" aria-label="Restore backup">
                      <Upload className="h-4 w-4 mr-2" aria-hidden="true" />
                      Restore Backup
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Restore from a previous backup</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="destructive" className="w-full" aria-label="Clear cache">
                      <Trash2 className="h-4 w-4 mr-2" aria-hidden="true" />
                      Clear Cache
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Clear all system cache</TooltipContent>
                </Tooltip>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3">Recent Backups</h4>
                <div className="space-y-2">
                  {[
                    { name: "backup-2024-01-15.zip", size: "45.2 MB", date: "2024-01-15 10:30 AM" },
                    { name: "backup-2024-01-14.zip", size: "44.8 MB", date: "2024-01-14 10:30 AM" },
                    { name: "backup-2024-01-13.zip", size: "44.1 MB", date: "2024-01-13 10:30 AM" },
                  ].map((backup, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium text-sm">{backup.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {backup.date} • {backup.size}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm" aria-label={`Download ${backup.name}`}>
                              <Download className="h-3 w-3" aria-hidden="true" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Download backup</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="destructive" size="sm" aria-label={`Delete ${backup.name}`}>
                              <Trash2 className="h-3 w-3" aria-hidden="true" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete backup</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
