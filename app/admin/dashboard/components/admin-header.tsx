// app/admin/dashboard/components/admin-header.tsx
"use client"

import { useEffect, useState, useRef } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Menu, ExternalLink, LogOut } from "lucide-react"
import ThemeToggle from "@/components/theme-toggle"
import { cn } from "@/lib/utils"
import HeaderDivider from "@/components/HeaderDivider"
import { AdminSearch } from "./admin-search"

// New: modular header pieces
import EnvironmentBadge from "./header/environment-badge"
import ProductSwitcher from "./header/product-switcher"
import AdminBreadcrumbs from "./header/admin-breadcrumbs"
import PrimaryAction from "./header/primary-action"
import UserMenu from "./header/user-menu"
import HelpMenu from "./header/help-menu"
import LocaleToggle from "./header/locale-toggle"

// Non-critical pieces lazy loaded for perf
const NotificationBell = dynamic(() => import("./notification-bell"), { ssr: false })
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
          "motion-reduce:transition-none motion-reduce:backdrop-filter-none",
          className
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4 w-full">
          {/* SR-only button so screen reader users can open the command palette */}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("open-command-palette"))}
            className="sr-only"
            aria-controls="command-palette"
          >
            Open command palette
          </button>

          {/* Left Section: Sidebar toggle, Logo, Env + Product, Breadcrumbs */}
          <div className="flex items-center flex-1 min-w-0">
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

            <HeaderDivider />

            {/* Logo/title (always visible) */}
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent whitespace-nowrap forced-colors:text-current">
              Flavor Studios Admin
            </h1>

            {/* Environment badge + Product switcher */}
            <div className="ml-2 flex items-center gap-2">
              <EnvironmentBadge />
              <ProductSwitcher />
            </div>

            {/* Breadcrumbs */}
            <AdminBreadcrumbs />
          </div>

          {/* Right Section: Search, View Site, Primary/More, Quick, Notifs, Profile, Help, Theme, Locale, Logout, User menu */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            {/* Search dialog trigger */}
            <AdminSearch />

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

            {/* Primary action + overflow */}
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

            {/* Quick actions (lazy) */}
            <QuickActions />

            {/* Notifications (lazy) */}
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

            {/* Help, theme, locale */}
            <HelpMenu />
            <ThemeToggle aria-label="Toggle theme" />
            <LocaleToggle />

            {/* Logout button (kept as in your work) */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              aria-label="Logout"
              className="text-red-600 hover:text-red-700 min-h-11 px-4 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </Button>

            {/* User menu for account and sign out */}
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
