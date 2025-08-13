"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Menu, ExternalLink, LogOut } from "lucide-react"
import { NotificationBell } from "./notification-bell"
import ThemeToggle from "@/components/theme-toggle"

interface AdminHeaderProps {
  onLogout: () => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export function AdminHeader({ onLogout, sidebarOpen, setSidebarOpen }: AdminHeaderProps) {
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

  return (
    <header className="bg-background border-b border-border px-6 py-4">
      <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4">
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
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden"
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Logo/title (always visible) */}
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent whitespace-nowrap">
            Flavor Studios Admin
          </h1>

          {/* Desktop search input */}
          <div className="hidden md:block flex-1 max-w-xs ml-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search..."
                className="pl-10 w-full"
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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search..."
                className="pl-10 w-full"
                aria-label="Search"
              />
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open("https://flavorstudios.in", "_blank", "noopener,noreferrer")}
            className="hidden md:flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            View Site
          </Button>

          <NotificationBell />

          {/* Avatar and Admin info */}
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/admin-avatar.jpg" alt="Admin avatar" />
              <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white text-sm">
                FS
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-foreground">Admin</p>
              <p className="text-xs text-muted-foreground">Flavor Studios</p>
            </div>
          </div>

          {/* Theme toggle */}
          <ThemeToggle />

          {/* Logout button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="text-red-600 hover:text-red-700"
            aria-label="Logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
