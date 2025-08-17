// app/admin/dashboard/components/admin-header.tsx
"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Menu, ExternalLink, LogOut } from "lucide-react"
import { NotificationBell } from "./notification-bell"
import ThemeToggle from "@/components/theme-toggle"
import { cn } from "@/lib/utils"
import QuickActions from "./quick-actions"

interface AdminHeaderProps {
  onLogout: () => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  className?: string
}

export function AdminHeader({ onLogout, sidebarOpen, setSidebarOpen, className }: AdminHeaderProps) {
  const [avatar, setAvatar] = useState<string>("")
  const toggleRef = useRef<HTMLButtonElement | null>(null)

  // Ctrl/Cmd + K to open the command palette
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

  // Load avatar from user settings
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
          "h-14 px-4 flex items-center gap-2",
          "border-b pt-[env(safe-area-inset-top)]",
          "backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-zinc-900/70",
          className
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4 w-full">
          {/* SR-only button so screen reader users can open the command palette */}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("open-command-palette"))}
            className="sr-only"
          >
            Open command palette
          </button>

          {/* Left Section: Sidebar toggle, Logo, Search */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Sidebar button (mobile only) */}
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

            {/* Logo/title (always visible) */}
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent whitespace-nowrap forced-colors:text-current">
              Flavor Studios Admin
            </h1>

            {/* Desktop search input */}
            <div className="hidden md:block flex-1 max-w-xs ltr:ml-4 rtl:mr-4">
              <div className="relative w-full">
                <Search
                  className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4"
                  aria-hidden="true"
                />
                <Input
                  placeholder="Search..."
                  className="w-full min-h-11 ltr:pl-10 rtl:pr-10"
                  aria-label="Search"
                />
              </div>
            </div>
          </div>

          {/* Right Section: Actions, Avatar, Logout */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            {/* Mobile search input (below md) */}
            <div className="w-full md:hidden order-2 flex-1">
              <div className="relative w-full mt-2">
                <Search
                  className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4"
                  aria-hidden="true"
                />
                <Input
                  placeholder="Search..."
                  className="w-full min-h-11 ltr:pl-10 rtl:pr-10"
                  aria-label="Search"
                />
              </div>
            </div>

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

            {/* Quick actions (New) */}
            <QuickActions />

            <NotificationBell />

            {/* Avatar and Admin info */}
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

            {/* Theme toggle (single source of truth) */}
            <ThemeToggle aria-label="Toggle theme" />

            {/* Logout button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              aria-label="Logout"
              className="text-red-600 hover:text-red-700 min-h-11 px-4 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </header>
    </>
  )
}
