"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileForm } from "./ProfileForm"
import { NotificationsForm } from "./NotificationsForm"
import { AppearanceForm } from "./AppearanceForm"
import type {
  AppearanceSettingsInput,
  NotificationsSettingsInput,
  ProfileSettingsInput,
} from "@/lib/schemas/settings"

interface SettingsTabsProps {
  initialTab?: string
  profile: ProfileSettingsInput & {
    emailVerified?: boolean
    providerLocked?: boolean
  }
  notifications: NotificationsSettingsInput
  appearance: AppearanceSettingsInput
}

const TAB_KEYS = ["profile", "notifications", "appearance"] as const

type TabKey = (typeof TAB_KEYS)[number]

export function SettingsTabs({
  initialTab = "profile",
  profile,
  notifications,
  appearance,
}: SettingsTabsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [tab, setTab] = useState<TabKey>(() => {
    if (TAB_KEYS.includes(initialTab as TabKey)) return initialTab as TabKey
    const fromQuery = searchParams?.get("tab") as TabKey | null
    if (fromQuery && TAB_KEYS.includes(fromQuery)) return fromQuery
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("admin-settings-tab") as TabKey | null
      if (stored && TAB_KEYS.includes(stored)) return stored
    }
    return "profile"
  })

  useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem("admin-settings-tab", tab)
  }, [tab])

  useEffect(() => {
    const params = new URLSearchParams(searchParams?.toString() ?? "")
    if (params.get("tab") === tab) return
    params.set("tab", tab)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, [tab, pathname, router, searchParams])

  const handleValueChange = (value: string) => {
    if (TAB_KEYS.includes(value as TabKey)) {
      setTab(value as TabKey)
    }
  }

  return (
    <div className="space-y-6">
      <Tabs value={tab} onValueChange={handleValueChange} className="space-y-6" activationMode="manual">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="space-y-6">
          <ProfileForm initialValues={profile} />
        </TabsContent>
        <TabsContent value="notifications" className="space-y-6">
          <NotificationsForm initialValues={notifications} />
        </TabsContent>
        <TabsContent value="appearance" className="space-y-6">
          <AppearanceForm initialValues={appearance} />
        </TabsContent>
      </Tabs>
    </div>
  )
}