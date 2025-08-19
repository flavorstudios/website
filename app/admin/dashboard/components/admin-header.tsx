// app/admin/dashboard/components/admin-header.tsx
"use client"

import { useEffect, useState, useRef } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Menu, ExternalLink } from "lucide-react"
import ThemeToggle from "@/components/theme-toggle"
import { cn } from "@/lib/utils"
import { AdminSearch } from "./admin-search"

// Kept pieces
import PrimaryAction from "./header/primary-action"
import UserMenu from "./header/user-menu"
import HelpMenu from "./header/help-menu"

// Non-critical pieces lazy loaded for perf (kept)
const NotificationBell = dynamic(
  () => import("./notification-bell").then((m) => m.NotificationBell),
  { ssr: false }
)
const QuickActions = dynamic(() => import("./quick-actions"), { ssr: false })

interface AdminHeaderProps {
  onLogout: () => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  className?: string
}

export function AdminHeader({ onLogout, sidebarOpen, setSidebarOpen, className }: AdminHeaderProps) {
  const [avatar, setAvatar] = useState<string>("")
  const toggleRef = useRef<HTMLButtonElement | null>(null)

  // Ctrl/Cmd + K to open the command palette (kept)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        window.dispatchEvent(new Event("open-command-palette"))
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  // Load avatar from user settings (kept)
  useEffect(() => {
    fetch("/api/admin/settings", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setAvatar(data?.settings?.profile?.avatar || ""))
      .catch(() => {})
  }, [])

  // Return focus to toggle button when sidebar closes (mobile)
  useEffect(() => {
    if (!sidebarOpen) {
      toggleRef.current?.focus()
    }
  }, [sidebarOpen])

  return (
    <>
      {/* Skip link for keyboard and screen reader users */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-primary focus:text-primary-foreground focus:p-2 focus:outline-none focus:ring"
      >
        Skip to main content
      </a>

      <header
        role="banner"
        className={cn(
          "sticky top-0 z-40",
          "h-16 md:h-20 px-4 flex items-center", // taller header
          "border-b pt-[env(safe-area-inset-top)]",
          "backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-zinc-900/70",
          "motion-reduce:transition-none motion-reduce:backdrop-filter-none",
          className
        )}
      >
        <div className="flex items-center w-full gap-2 sm:gap-4">
          {/* Left: Sidebar toggle (mobile only) */}
          <Button
            ref={toggleRef}
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            aria-expanded={sidebarOpen}
            aria-controls="admin-sidebar"
            className="lg:hidden min-h-11 px-4 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </Button>

          {/* Center: usable search */}
          <div className="flex-1 flex justify-center px-2">
            <AdminSearch />
          </div>

          {/* Right: core actions only */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                window.open("https://flavorstudios.in", "_blank", "noopener,noreferrer")
              }
              aria-label="Open live site in a new tab"
              className="hidden md:flex items-center gap-2 min-h-11 px-4 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              View Site
            </Button>

            {/* Primary action (Save) */}
            <PrimaryAction
              label="Save"
              onClick={() => window.dispatchEvent(new Event("primary-action"))}
              moreActions={[
                {
                  label: "Settings",
                  onSelect: () => window.location.assign("/admin/dashboard/settings"),
                },
              ]}
            />

            {/* Optional quick actions and notifications (kept) */}
            <QuickActions />
            <NotificationBell />

            {/* Avatar and Admin info (kept) */}
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={avatar || "/admin-avatar.jpg"} alt="Admin avatar" />
                <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white text-sm">
                  FS
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-foreground">Admin</p>
                <p className="text-xs text-muted-foreground">Flavor Studios</p>
              </div>
            </div>

            {/* Help and theme toggle (kept) */}
            <HelpMenu />
            <ThemeToggle aria-label="Toggle theme" />

            {/* Avatar menu is the ONLY place with Sign out */}
            <UserMenu
              avatar={avatar}
              name="Admin"
              userRole="Flavor Studios"
              onLogout={onLogout}
            />
          </div>
        </div>
      </header>
    </>
  )
}

export default AdminHeader
