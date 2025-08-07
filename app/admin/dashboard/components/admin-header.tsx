"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Menu, ExternalLink, LogOut, HelpCircle } from "lucide-react"
import { NotificationBell } from "./notification-bell"
import { ThemeToggle } from "./theme-toggle"
import { CommandPalette } from "@/components/admin/CommandPalette"

interface AdminHeaderProps {
  onLogout: () => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  onShowHelp: () => void
}

export function AdminHeader({ onLogout, sidebarOpen, setSidebarOpen, onShowHelp }: AdminHeaderProps) {
  const [open, setOpen] = useState(false)

  // Listen for Ctrl+K or Cmd+K to open the command palette
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(true)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <>
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4">
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

            {/* Desktop search trigger */}
            <div className="hidden md:block flex-1 max-w-xs ml-4">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="flex flex-1 max-w-xs items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <Search className="h-4 w-4" />
                <span className="flex-1 text-left">Search...</span>
                <kbd className="pointer-events-none text-xs">Ctrl+K</kbd>
              </button>
            </div>
          </div>

          {/* Right Section: Actions, Avatar, Logout */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            {/* Mobile search trigger */}
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="w-full md:hidden order-2 mt-2 flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground"
            >
              <Search className="h-4 w-4" />
              <span className="flex-1 text-left">Search...</span>
            </button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open("https://flavorstudios.in", "_blank")}
              className="hidden md:flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              View Site
            </Button>

            <NotificationBell />
            <ThemeToggle />

            {/* Keyboard shortcuts/help button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onShowHelp}
              aria-label="Keyboard shortcuts"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>

            {/* Avatar and Admin info */}
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/admin-avatar.jpg" />
                <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white text-sm">
                  FS
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-medium">Admin</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Flavor Studios</p>
              </div>
            </div>

            {/* Logout button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="text-red-600 hover:text-red-700 dark:text-red-500"
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
      <CommandPalette open={open} setOpen={setOpen} />
    </>
  )
}
