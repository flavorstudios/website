// app/admin/dashboard/components/admin-header.tsx
"use client"

import { useEffect, useState, useRef } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import ThemeToggle from "@/components/theme-toggle"
import { cn } from "@/lib/utils"
import { ADMIN_HEADER_HEIGHT } from "@/lib/constants"

// Kept pieces
import UserMenu from "./header/user-menu"
import HelpMenu from "./header/help-menu"

// Non-critical pieces lazy loaded for perf (kept)
const NotificationBell = dynamic(
  () => import("./notification-bell").then((m) => m.NotificationBell),
  { ssr: false }
)

interface AdminHeaderProps {
  onLogout: () => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  className?: string
  onSearch?: (query: string) => void
}

export function AdminHeader({
  onLogout,
  sidebarOpen,
  setSidebarOpen,
  className,
  onSearch,
}: AdminHeaderProps) {
  const [avatar, setAvatar] = useState<string>("")
  const toggleRef = useRef<HTMLButtonElement | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Load avatar from user settings (kept – used by UserMenu)
  useEffect(() => {
    fetch("/api/admin/settings", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setAvatar(data?.settings?.profile?.avatar || ""))
      .catch(() => {})
  }, [])

  // Focus search when '/' or Ctrl/Cmd+K is pressed (all viewports)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target
      const typingInField =
        target instanceof HTMLElement &&
        (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) ||
          target.isContentEditable)

      const key = e.key?.toLowerCase()
      const isSlash = key === "/" && !e.metaKey && !e.ctrlKey
      const isCtrlK = key === "k" && (e.metaKey || e.ctrlKey)

      if ((isSlash || isCtrlK) && !typingInField) {
        e.preventDefault()
        inputRef.current?.focus()
        inputRef.current?.select()
      }
    }

    window.addEventListener("keydown", handler, { capture: true })
    return () => {
      window.removeEventListener("keydown", handler, { capture: true })
    }
  }, [])

  // Return focus to toggle button when sidebar closes (mobile)
  useEffect(() => {
    if (!sidebarOpen) {
      toggleRef.current?.focus()
    }
  }, [sidebarOpen])

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const q = inputRef.current?.value.trim() || ""
    if (!q) return
    onSearch?.(q)
    try {
      router.push(`/admin/search?q=${encodeURIComponent(q)}`)
    } catch {
      // Ignore if route is missing in dev
    }
  }

  return (
    <>
      {/* Skip link for keyboard and screen reader users */}
      <a
        href="#app-main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-primary focus:text-primary-foreground focus:p-2 focus:outline-none focus:ring"
      >
        Skip to main content
      </a>

      <header
        role="banner"
        className={cn(
          "sticky top-0 z-40",
          ADMIN_HEADER_HEIGHT,
          "px-4 flex items-center",
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
            aria-controls="app-sidebar"
            className="lg:hidden min-h-11 px-4 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </Button>

          {/* Center: search (visible on all viewports) */}
          <form
            onSubmit={submit}
            role="search"
            className="flex flex-1 justify-center px-2"
          >
            <div className="relative w-full max-w-[820px]">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 left-3 flex items-center"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M21 21l-4.2-4.2M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <input
                ref={inputRef}
                id="admin-header-search"
                type="search"
                aria-label="Search titles, descriptions, and tags"
                placeholder="Search titles, descriptions, tags…"
                inputMode="search"
                enterKeyHint="search"
                className="block w-full rounded-xl border bg-background pl-10 pr-12 py-2 text-sm outline-none ring-0 focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
              />
              <kbd
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 select-none rounded-md border px-1.5 py-0.5 text-[10px] text-muted-foreground"
                aria-hidden="true"
              >
                /
              </kbd>
            </div>
          </form>

          {/* Right: core actions only */}
          <div className="flex items-center gap-2 sm:gap-4">
            <NotificationBell />
            <HelpMenu />
            <ThemeToggle aria-label="Toggle theme" />
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
