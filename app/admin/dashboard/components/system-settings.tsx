"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Save } from "lucide-react"
import AdminPageHeader from "@/components/AdminPageHeader"
import { useTheme } from "next-themes"
import { useToast } from "@/hooks/use-toast"

type ThemeMode = "light" | "dark"

interface Settings {
  profile: {
    avatar?: string
    name: string
    email: string
  }
  notifications: {
    email: boolean
    inApp: boolean
  }
  appearance: {
    theme: ThemeMode
    accentColor: string
  }
}

export function SystemSettings() {
  const { setTheme } = useTheme()
  const { toast } = useToast()

  const [settings, setSettings] = useState<Settings>({
    profile: { avatar: "", name: "", email: "" },
    notifications: { email: true, inApp: true },
    appearance: { theme: "light", accentColor: "#6b46c1" },
  })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  // Load user settings
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch("/api/admin/settings", { credentials: "include" })
        if (!res.ok) throw new Error("Failed to fetch settings")
        const data = await res.json()
        if (!mounted) return
        if (data?.settings) {
          setSettings((prev) => ({ ...prev, ...data.settings }))
          // Apply theme immediately to reflect current preference
          const theme = (data.settings.appearance?.theme ?? "light") as ThemeMode
          setTheme(theme)
        }
      } catch {
        // keep defaults silently
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [setTheme])

  // Optimistically reflect theme changes in UI
  const handleThemeChange = (value: ThemeMode) => {
    setSettings((s) => ({ ...s, appearance: { ...s.appearance, theme: value } }))
    setTheme(value)
  }

  const handleSave = async () => {
    // Basic validation
    if (!settings.profile.name.trim()) {
      toast("Name is required")
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(settings.profile.email)) {
      toast("Please enter a valid email")
      return
    }

    setSaving(true)
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || "Failed to save settings")
      }
      toast("Settings saved")
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save settings"
      toast(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <AdminPageHeader
          as="h2"
          title="Settings"
          subtitle="Manage your profile, notifications, and appearance preferences"
        />
        <div className="flex items-center gap-2">
          <Button
            onClick={handleSave}
            disabled={saving || loading}
            aria-label="Save settings"
            className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white"
          >
            <Save className="h-4 w-4 mr-2" aria-hidden="true" />
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="flex flex-wrap w-full gap-2">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        {/* Profile */}
        <TabsContent value="profile" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Update your avatar, display name, and contact email.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={settings.profile.avatar} alt="User avatar" />
                  <AvatarFallback>AV</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Label htmlFor="avatar">Avatar URL</Label>
                  <Input
                    id="avatar"
                    placeholder="https://…/avatar.png"
                    value={settings.profile.avatar}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        profile: { ...s.profile, avatar: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Your name"
                  value={settings.profile.name}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      profile: { ...s.profile, name: e.target.value },
                    }))
                  }
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={settings.profile.email}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      profile: { ...s.profile, email: e.target.value },
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Choose how you’d like to be notified.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="emailNot">Email notifications</Label>
                <Switch
                  id="emailNot"
                  checked={settings.notifications.email}
                  onCheckedChange={(v) =>
                    setSettings((s) => ({
                      ...s,
                      notifications: { ...s.notifications, email: v },
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="inAppNot">In-app notifications</Label>
                <Switch
                  id="inAppNot"
                  checked={settings.notifications.inApp}
                  onCheckedChange={(v) =>
                    setSettings((s) => ({
                      ...s,
                      notifications: { ...s.notifications, inApp: v },
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance */}
        <TabsContent value="appearance" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Set your theme and accent color.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="theme">Theme</Label>
                <Select
                  value={settings.appearance.theme}
                  onValueChange={(v) => handleThemeChange(v as ThemeMode)}
                >
                  <SelectTrigger id="theme">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="accent">Accent color</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="accent"
                    type="color"
                    value={settings.appearance.accentColor}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        appearance: { ...s.appearance, accentColor: e.target.value },
                      }))
                    }
                    aria-label="Accent color picker"
                    className="h-9 p-1 w-16"
                  />
                  <Input
                    value={settings.appearance.accentColor}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        appearance: { ...s.appearance, accentColor: e.target.value },
                      }))
                    }
                    aria-label="Accent color hex"
                    className="max-w-[140px]"
                  />
                  <div
                    className="h-8 w-8 rounded border"
                    style={{ backgroundColor: settings.appearance.accentColor }}
                    aria-label="Accent color preview"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default SystemSettings
