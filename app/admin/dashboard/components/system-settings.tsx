"use client"

import { useState } from "react"
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

export function SystemSettings() {
  const [settings, setSettings] = useState({
    siteName: "Flavor Studios",
    siteDescription: "Professional video production and creative services",
    adminEmail: "admin@flavorstudios.com",
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

  const handleSave = () => {
    console.log("Settings saved:", settings)
    // Save logic would go here
  }

  const handleBackup = () => {
    console.log("Creating backup...")
    // Backup logic would go here
  }

  const handleRestore = () => {
    console.log("Restoring from backup...")
    // Restore logic would go here
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
          <Button variant="outline" onClick={handleBackup}>
            <Download className="h-4 w-4 mr-2" />
            Backup
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
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
                  <Globe className="h-5 w-5" />
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
                  <Input
                    id="adminEmail"
                    type="email"
                    value={settings.adminEmail}
                    onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Regional Settings
                </CardTitle>
                <CardDescription>Timezone and language preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={settings.timezone}>
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
                  <Select value={settings.language}>
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
                <Shield className="h-5 w-5" />
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
                    <CheckCircle className="h-3 w-3 mr-1" />
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
                <Mail className="h-5 w-5" />
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
              <Button variant="outline" className="w-full">
                Test Email Configuration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
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
                  <Input id="primaryColor" value="#8B5CF6" />
                  <div className="w-10 h-10 rounded border bg-purple-500"></div>
                </div>
              </div>
              <div>
                <Label htmlFor="logo">Site Logo</Label>
                <div className="flex items-center gap-2">
                  <Input id="logo" placeholder="Upload logo..." />
                  <Button variant="outline">
                    <Upload className="h-4 w-4" />
                  </Button>
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
                  <Activity className="h-5 w-5" />
                  System Performance
                </CardTitle>
                <CardDescription>Current system resource usage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="flex items-center gap-2">
                      <Cpu className="h-4 w-4" />
                      CPU Usage
                    </Label>
                    <span className="text-sm font-medium">{systemStats.cpuUsage}%</span>
                  </div>
                  <Progress value={systemStats.cpuUsage} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Memory Usage
                    </Label>
                    <span className="text-sm font-medium">{systemStats.memoryUsage}%</span>
                  </div>
                  <Progress value={systemStats.memoryUsage} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="flex items-center gap-2">
                      <HardDrive className="h-4 w-4" />
                      Disk Usage
                    </Label>
                    <span className="text-sm font-medium">{systemStats.diskUsage}%</span>
                  </div>
                  <Progress value={systemStats.diskUsage} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
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
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <Label>Database Status</Label>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
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
                <Database className="h-5 w-5" />
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
                <Button onClick={handleBackup} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Create Backup
                </Button>
                <Button variant="outline" onClick={handleRestore} className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Restore Backup
                </Button>
                <Button variant="destructive" className="w-full">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Cache
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
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium text-sm">{backup.name}</p>
                        <p className="text-xs text-muted-foreground">
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
      </Tabs>
    </div>
  )
}
